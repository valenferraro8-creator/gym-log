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

    const { data, error } = await supabase
      .from("routines")
      .select("*, routine_exercises(*)")
      .order("created_at");

    if (error) {
      console.error("Error loading routines:", error);
    } else if (data) {
      setRoutines(data.map(mapRoutine));
    }
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
      if (error || !routine) throw error ?? new Error("Failed to create routine");

      if (exercises.length > 0) {
        const { error: exError } = await supabase.from("routine_exercises").insert(
          exercises.map((ex, i) => ({
            routine_id: routine.id,
            exercise_name: ex.name,
            target_sets: ex.sets,
            target_reps: ex.reps,
            position: i,
          }))
        );
        if (exError) throw exError;
      }
      await load();
    },
    [user, load]
  );

  const update = useCallback(
    async (routineId: string, name: string, tag: string, exercises: RoutineExerciseInput[]) => {
      const { error: nameError } = await supabase.from("routines").update({ name, tag }).eq("id", routineId);
      if (nameError) throw nameError;

      const { error: deleteError } = await supabase.from("routine_exercises").delete().eq("routine_id", routineId);
      if (deleteError) throw deleteError;

      if (exercises.length > 0) {
        const { error: insertError } = await supabase.from("routine_exercises").insert(
          exercises.map((ex, i) => ({
            routine_id: routineId,
            exercise_name: ex.name,
            target_sets: ex.sets,
            target_reps: ex.reps,
            position: i,
          }))
        );
        if (insertError) throw insertError;
      }
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (routineId: string) => {
      const { error } = await supabase.from("routines").delete().eq("id", routineId);
      if (error) throw error;
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
