import { supabase } from "@/lib/supabase";
import type { ExerciseEntry } from "@/data/mock";

export type PreviousSets = Record<string, string[]>;

/**
 * Saves a finished workout to Supabase. Throws on any failed insert instead of
 * swallowing it, so the caller can keep the local draft around and let the user
 * retry — a workout is only cleared from local state once it's actually saved.
 *
 * Batches the exercise/set inserts into a handful of round trips (one per
 * table) instead of a couple of sequential calls per exercise — a workout
 * with 8 exercises used to mean 15+ back-to-back requests, which was slow on
 * a flaky gym wifi/data connection right when the user wants to save and go.
 */
export async function saveWorkoutSession(
  userId: string,
  exercises: ExerciseEntry[],
  routineName: string,
  routineId: string | null
) {
  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      routine_id: routineId,
      name: routineName.trim() || "Entrenamiento libre",
      finished_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !session) throw error ?? new Error("Failed to create session");

  // Running best weight per exercise, seeded from history, so a set only counts
  // as a new PR when it actually beats the previous record (not just the first
  // time an exercise is ever logged) — and updates as we go in case the same
  // session has more than one new best for the same exercise.
  const bestWeights = await loadBestWeights(
    userId,
    exercises.map((ex) => ex.name)
  );

  // 1. Insert every exercise in one call, tagged with its position so the
  // returned ids can be matched back without relying on row order.
  const { data: insertedExercises, error: exError } = await supabase
    .from("session_exercises")
    .insert(
      exercises.map((ex, i) => ({
        session_id: session.id,
        exercise_name: ex.name,
        superset_group: ex.supersetGroup ?? null,
        position: i,
      }))
    )
    .select("id, position");

  if (exError || !insertedExercises) throw exError ?? new Error("Failed to save exercises");

  const exerciseIdByPosition = new Map(insertedExercises.map((r) => [r.position, r.id]));

  // 2. Build every "main" set row across all exercises up front, then insert once.
  const mainRowsByExercise = exercises.map((ex, i) => {
    const sessionExerciseId = exerciseIdByPosition.get(i);
    if (!sessionExerciseId) throw new Error(`Failed to save exercise "${ex.name}"`);

    const doneSets = ex.sets.filter((s) => s.done && (s.weight !== "" || s.reps !== ""));
    let setNumber = 0;
    return doneSets.map((s) => {
      const weight_kg = s.weight !== "" ? parseFloat(s.weight) : null;
      const priorBest = bestWeights[ex.name] ?? 0;
      const is_pr = weight_kg != null && priorBest > 0 && weight_kg > priorBest;
      if (weight_kg != null && weight_kg > priorBest) bestWeights[ex.name] = weight_kg;
      return {
        session_exercise_id: sessionExerciseId,
        set_number: ++setNumber,
        weight_kg,
        reps: s.reps !== "" ? parseInt(s.reps, 10) : null,
        is_pr,
        done: true,
      };
    });
  });

  const allMainRows = mainRowsByExercise.flat();
  let insertedMainSets: { id: string; session_exercise_id: string; set_number: number }[] = [];
  if (allMainRows.length > 0) {
    const { data, error: setsError } = await supabase
      .from("session_sets")
      .insert(allMainRows)
      .select("id, session_exercise_id, set_number");
    if (setsError || !data) throw setsError ?? new Error("Failed to save sets");
    insertedMainSets = data;
  }

  const idByExAndSetNumber = new Map(insertedMainSets.map((r) => [`${r.session_exercise_id}:${r.set_number}`, r.id]));

  // 3. Build every dropset row across all exercises, then insert once.
  const allDropRows = exercises.flatMap((ex, i) => {
    const sessionExerciseId = exerciseIdByPosition.get(i)!;
    const doneSets = ex.sets.filter((s) => s.done && (s.weight !== "" || s.reps !== ""));
    const rowsForEx = mainRowsByExercise[i];
    let setNumber = rowsForEx.length;

    return doneSets.flatMap((s, idx) => {
      const parentId = idByExAndSetNumber.get(`${sessionExerciseId}:${rowsForEx[idx].set_number}`);
      const doneDrops = (s.drops ?? []).filter((d) => d.done && (d.weight !== "" || d.reps !== ""));
      return doneDrops.map((d) => ({
        session_exercise_id: sessionExerciseId,
        set_number: ++setNumber,
        weight_kg: d.weight !== "" ? parseFloat(d.weight) : null,
        reps: d.reps !== "" ? parseInt(d.reps, 10) : null,
        is_dropset: true,
        parent_set_id: parentId,
        done: true,
      }));
    });
  });

  if (allDropRows.length > 0) {
    const { error: dropsError } = await supabase.from("session_sets").insert(allDropRows);
    if (dropsError) throw dropsError;
  }

  return session;
}

/** Returns a map of exerciseName → best weight_kg ever logged (all-time, not just recent sessions). */
export async function loadBestWeights(userId: string, exerciseNames: string[]): Promise<Record<string, number>> {
  if (exerciseNames.length === 0) return {};

  const { data } = await supabase
    .from("best_weight_per_exercise")
    .select("exercise_name, best_weight_kg")
    .eq("user_id", userId)
    .in("exercise_name", exerciseNames);

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.exercise_name && row.best_weight_kg != null) map[row.exercise_name] = row.best_weight_kg;
  }
  return map;
}

/**
 * Returns a map of exerciseName → list of "Xkg x Y" strings, one per set_number
 * (index 0 = set 1, index 1 = set 2, ...), taken from the last completed session
 * that included that exercise. Used so each set in the "Anterior" column is
 * compared against its own equivalent set from last time, not just the first one.
 */
export async function loadLastSets(
  userId: string,
  exerciseNames: string[]
): Promise<PreviousSets> {
  if (exerciseNames.length === 0) return {};

  const { data } = await supabase
    .from("last_session_sets_per_exercise")
    .select("exercise_name, set_number, weight_kg, reps")
    .eq("user_id", userId)
    .in("exercise_name", exerciseNames);

  const map: PreviousSets = {};
  for (const row of data ?? []) {
    if (!row.exercise_name || row.set_number == null) continue;
    const list = (map[row.exercise_name] ??= []);
    list[row.set_number - 1] =
      row.weight_kg != null && row.reps != null ? `${row.weight_kg}kg x ${row.reps}` : "—";
  }
  return map;
}
