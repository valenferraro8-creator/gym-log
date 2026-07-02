import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type GoalRecord = {
  id: string;
  label: string;
  exercise_name: string | null;
  unit: string;
  target: number;
};

export type NewGoal = { label: string; exercise_name: string | null; unit: string; target: number };

export function useGoals(user: User | null) {
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at");
    setGoals(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (goal: NewGoal) => {
      if (!user) return;
      const { error } = await supabase.from("goals").insert({ user_id: user.id, ...goal });
      if (error) throw error;
      await load();
    },
    [user, load]
  );

  const remove = useCallback(
    async (goalId: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);
      if (error) throw error;
      await load();
    },
    [load]
  );

  return { goals, loading, create, remove };
}
