import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { SessionRow } from "@/lib/progressData";

export function useProgressData(user: User | null) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data } = await supabase
        .from("workout_sessions")
        .select("id, finished_at, session_exercises(exercise_name, session_sets(weight_kg, reps, done))")
        .eq("user_id", user.id)
        .not("finished_at", "is", null)
        .order("finished_at", { ascending: false })
        .limit(80);

      if (cancelled) return;

      const rows: SessionRow[] = (data ?? []).map((s) => ({
        id: s.id,
        finished_at: s.finished_at,
        exercises: (s.session_exercises ?? []).map((se: { exercise_name: string; session_sets: { weight_kg: number | null; reps: number | null; done: boolean }[] }) => ({
          exercise_name: se.exercise_name,
          sets: (se.session_sets ?? [])
            .filter((set) => set.done)
            .map((set) => ({ weight_kg: set.weight_kg, reps: set.reps })),
        })),
      }));

      setSessions(rows);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { sessions, loading };
}
