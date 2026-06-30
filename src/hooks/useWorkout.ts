import { supabase } from "@/lib/supabase";
import type { ExerciseEntry } from "@/data/mock";

export async function saveWorkoutSession(
  userId: string,
  exercises: ExerciseEntry[],
  routineName: string
) {
  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: userId, name: routineName, finished_at: new Date().toISOString() })
    .select()
    .single();

  if (error || !session) throw error ?? new Error("Failed to create session");

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];

    const { data: sessionEx } = await supabase
      .from("session_exercises")
      .insert({
        session_id: session.id,
        exercise_name: ex.name,
        superset_group: ex.supersetGroup ?? null,
        position: i,
      })
      .select()
      .single();

    if (!sessionEx) continue;

    const doneSets = ex.sets.filter((s) => s.done && (s.weight !== "" || s.reps !== ""));
    if (doneSets.length === 0) continue;

    await supabase.from("session_sets").insert(
      doneSets.map((s, j) => ({
        session_exercise_id: sessionEx.id,
        set_number: j + 1,
        weight_kg: s.weight !== "" ? parseFloat(s.weight) : null,
        reps: s.reps !== "" ? parseInt(s.reps, 10) : null,
        is_pr: s.isPR ?? false,
        done: true,
      }))
    );
  }

  return session;
}

/** Returns a map of exerciseName → "Xkg x Y" for the "Anterior" column */
export async function loadLastSets(
  userId: string,
  exerciseNames: string[]
): Promise<Record<string, string>> {
  if (exerciseNames.length === 0) return {};

  const { data } = await supabase
    .from("last_set_per_exercise")
    .select("exercise_name, weight_kg, reps")
    .eq("user_id", userId)
    .in("exercise_name", exerciseNames);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (!row.exercise_name) continue;
    map[row.exercise_name] =
      row.weight_kg != null && row.reps != null
        ? `${row.weight_kg}kg x ${row.reps}`
        : "—";
  }
  return map;
}
