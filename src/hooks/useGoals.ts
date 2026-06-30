import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type GoalRecord = {
  id: string;
  label: string;
  exercise_name: string | null;
  unit: string;
  target: number;
};

export function useGoals(user: User | null) {
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at");
      if (!cancelled) {
        setGoals(data ?? []);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { goals, loading };
}
