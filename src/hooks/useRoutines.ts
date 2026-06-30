import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Routine } from "@/data/mock";

export type RoutineExerciseInput = { name: string; sets: number; reps: string };

export function useRoutines(user: User | null) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("routines")
      .select("*, routine_exercises(*)")
      .order("created_at");

    if (data) setRoutines(data.map(mapRoutine));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (name: string, tag: string, exercises: RoutineExerciseInput[]) => {
      if (!user) return;
      const { data: routine, error } = await supabase
        .from("routines")
        .insert({ user_id: user.id, name, tag })
        .select()
        .single();
      if (error || !routine) throw error;

      if (exercises.length > 0) {
        await supabase.from("routine_exercises").insert(
          exercises.map((ex, i) => ({
            routine_id: routine.id,
            exercise_name: ex.name,
            target_sets: ex.sets,
            target_reps: ex.reps,
            position: i,
          }))
        );
      }
      await load();
    },
    [user, load]
  );

  const update = useCallback(
    async (routineId: string, name: string, tag: string, exercises: RoutineExerciseInput[]) => {
      await supabase.from("routines").update({ name, tag }).eq("id", routineId);
      await supabase.from("routine_exercises").delete().eq("routine_id", routineId);
      if (exercises.length > 0) {
        await supabase.from("routine_exercises").insert(
          exercises.map((ex, i) => ({
            routine_id: routineId,
            exercise_name: ex.name,
            target_sets: ex.sets,
            target_reps: ex.reps,
            position: i,
          }))
        );
      }
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (routineId: string) => {
      await supabase.from("routines").delete().eq("id", routineId);
      await load();
    },
    [load]
  );

  return { routines, loading, reload: load, create, update, remove };
}

type RawRoutine = {
  id: string;
  name: string;
  tag: string | null;
  routine_exercises: { exercise_name: string; target_sets: number | null; target_reps: string | null; position: number }[];
};

function mapRoutine(r: RawRoutine): Routine {
  return {
    id: r.id,
    name: r.name,
    tag: r.tag ?? "",
    lastDone: "—",
    exercises: [...r.routine_exercises]
      .sort((a, b) => a.position - b.position)
      .map((e) => ({
        name: e.exercise_name,
        sets: e.target_sets ?? 3,
        reps: e.target_reps ?? "8-12",
      })),
  };
}
