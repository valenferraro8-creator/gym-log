import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type ExerciseBest = { bestWeight: number; bestReps: number; best1RM: number };

/**
 * All-time best set and estimated 1RM for one exercise, fetched straight from
 * Supabase instead of derived client-side from the capped recent-sessions
 * window used elsewhere in Progreso — otherwise a PR older than that window
 * silently stops counting.
 */
export function useExerciseBest(user: User | null, exerciseName: string | null): ExerciseBest | null {
  const [best, setBest] = useState<ExerciseBest | null>(null);

  useEffect(() => {
    if (!user || !exerciseName) {
      setBest(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const [{ data: setRow }, { data: rmRow }] = await Promise.all([
        supabase
          .from("best_weight_per_exercise")
          .select("best_weight_kg, reps")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .maybeSingle(),
        supabase
          .from("best_est_1rm_per_exercise")
          .select("est_1rm")
          .eq("user_id", user.id)
          .eq("exercise_name", exerciseName)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setBest({
        bestWeight: setRow?.best_weight_kg ?? 0,
        bestReps: setRow?.reps ?? 0,
        best1RM: rmRow?.est_1rm ?? 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, exerciseName]);

  return best;
}
