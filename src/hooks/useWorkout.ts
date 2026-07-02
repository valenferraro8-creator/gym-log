import { supabase } from "@/lib/supabase";
import type { ExerciseEntry } from "@/data/mock";

export type PreviousSets = Record<string, string[]>;

/**
 * Saves a finished workout to Supabase. Throws on any failed insert instead of
 * swallowing it, so the caller can keep the local draft around and let the user
 * retry — a workout is only cleared from local state once it's actually saved.
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

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];

    const { data: sessionEx, error: exError } = await supabase
      .from("session_exercises")
      .insert({
        session_id: session.id,
        exercise_name: ex.name,
        superset_group: ex.supersetGroup ?? null,
        position: i,
      })
      .select()
      .single();

    if (exError || !sessionEx) throw exError ?? new Error(`Failed to save exercise "${ex.name}"`);

    const doneSets = ex.sets.filter((s) => s.done && (s.weight !== "" || s.reps !== ""));
    if (doneSets.length === 0) continue;

    let setNumber = 0;
    const mainRows = doneSets.map((s) => ({
      set_number: ++setNumber,
      weight_kg: s.weight !== "" ? parseFloat(s.weight) : null,
      reps: s.reps !== "" ? parseInt(s.reps, 10) : null,
      is_pr: s.isPR ?? false,
      done: true,
    }));

    const { data: insertedSets, error: setsError } = await supabase
      .from("session_sets")
      .insert(mainRows.map((r) => ({ session_exercise_id: sessionEx.id, ...r })))
      .select("id, set_number");

    if (setsError || !insertedSets) throw setsError ?? new Error(`Failed to save sets for "${ex.name}"`);

    const idBySetNumber = new Map(insertedSets.map((r) => [r.set_number, r.id]));

    const dropRows = doneSets.flatMap((s, idx) => {
      const parentId = idBySetNumber.get(mainRows[idx].set_number);
      const doneDrops = (s.drops ?? []).filter((d) => d.done && (d.weight !== "" || d.reps !== ""));
      return doneDrops.map((d) => ({
        session_exercise_id: sessionEx.id,
        set_number: ++setNumber,
        weight_kg: d.weight !== "" ? parseFloat(d.weight) : null,
        reps: d.reps !== "" ? parseInt(d.reps, 10) : null,
        is_dropset: true,
        parent_set_id: parentId,
        done: true,
      }));
    });

    if (dropRows.length > 0) {
      const { error: dropsError } = await supabase.from("session_sets").insert(dropRows);
      if (dropsError) throw dropsError;
    }
  }

  return session;
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
