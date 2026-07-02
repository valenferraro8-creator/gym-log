import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type HistorySet = {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  isDropset: boolean;
};

export type HistoryExercise = { id: string; name: string; sets: HistorySet[] };

export type HistorySession = {
  id: string;
  name: string;
  finishedAt: string;
  exercises: HistoryExercise[];
};

type RawSession = {
  id: string;
  name: string;
  finished_at: string;
  session_exercises: {
    id: string;
    exercise_name: string;
    position: number;
    session_sets: { id: string; set_number: number; weight_kg: number | null; reps: number | null; is_dropset: boolean }[];
  }[];
};

function mapSession(s: RawSession): HistorySession {
  return {
    id: s.id,
    name: s.name,
    finishedAt: s.finished_at,
    exercises: [...s.session_exercises]
      .sort((a, b) => a.position - b.position)
      .map((se) => ({
        id: se.id,
        name: se.exercise_name,
        sets: [...se.session_sets]
          .sort((a, b) => a.set_number - b.set_number)
          .map((ss) => ({
            id: ss.id,
            setNumber: ss.set_number,
            weightKg: ss.weight_kg,
            reps: ss.reps,
            isDropset: ss.is_dropset,
          })),
      })),
  };
}

/** Past saved workouts, editable/deletable — used by the "Historial" tab in Progreso. */
export function useSessionHistory(user: User | null) {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("id, name, finished_at, session_exercises(id, exercise_name, position, session_sets(id, set_number, weight_kg, reps, is_dropset))")
      .eq("user_id", user.id)
      .not("finished_at", "is", null)
      .order("finished_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error loading session history:", error);
      setLoading(false);
      return;
    }
    setSessions((data ?? []).map((s) => mapSession(s as RawSession)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSets = useCallback(
    async (updates: { id: string; weightKg: number | null; reps: number | null }[]) => {
      if (updates.length === 0) return;
      const results = await Promise.all(
        updates.map((u) => supabase.from("session_sets").update({ weight_kg: u.weightKg, reps: u.reps }).eq("id", u.id))
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      await load();
    },
    [load]
  );

  const remove = useCallback(async (sessionId: string) => {
    const { error } = await supabase.from("workout_sessions").delete().eq("id", sessionId);
    if (error) throw error;
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  return { sessions, loading, updateSets, remove, reload: load };
}
