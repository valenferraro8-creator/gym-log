import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Routine } from "@/data/mock";

const DEFAULT_ROUTINES: { name: string; tag: string; exercises: { name: string; sets: number; reps: string }[] }[] = [
  {
    name: "Push Day",
    tag: "Empuje",
    exercises: [
      { name: "Press banca", sets: 4, reps: "6-8" },
      { name: "Press inclinado mancuernas", sets: 3, reps: "8-10" },
      { name: "Fondos en paralelas", sets: 3, reps: "10-12" },
      { name: "Extensión de tríceps en polea", sets: 3, reps: "12-15" },
      { name: "Elevaciones laterales", sets: 4, reps: "12-15" },
    ],
  },
  {
    name: "Pull Day",
    tag: "Tracción",
    exercises: [
      { name: "Dominadas", sets: 4, reps: "6-10" },
      { name: "Remo con barra", sets: 4, reps: "8-10" },
      { name: "Jalón al pecho", sets: 3, reps: "10-12" },
      { name: "Ski Ergometer - Tirón dorsal", sets: 3, reps: "12-15" },
      { name: "Curl de bíceps con barra", sets: 3, reps: "10-12" },
      { name: "Face pull", sets: 3, reps: "15-20" },
    ],
  },
  {
    name: "Leg Day",
    tag: "Piernas",
    exercises: [
      { name: "Sentadilla", sets: 5, reps: "5-8" },
      { name: "Peso muerto rumano", sets: 4, reps: "8-10" },
      { name: "Prensa de piernas", sets: 4, reps: "10-12" },
      { name: "Curl femoral", sets: 3, reps: "12-15" },
      { name: "Elevación de talones", sets: 4, reps: "15-20" },
    ],
  },
];

async function seedDefaults(userId: string) {
  for (const template of DEFAULT_ROUTINES) {
    const { data: routine } = await supabase
      .from("routines")
      .insert({ user_id: userId, name: template.name, tag: template.tag })
      .select()
      .single();

    if (!routine) continue;

    await supabase.from("routine_exercises").insert(
      template.exercises.map((ex, i) => ({
        routine_id: routine.id,
        exercise_name: ex.name,
        target_sets: ex.sets,
        target_reps: ex.reps,
        position: i,
      }))
    );
  }
}

export function useRoutines(user: User | null) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("routines")
      .select("*, routine_exercises(*)")
      .order("created_at");

    if (!data) {
      setLoading(false);
      return;
    }

    if (data.length === 0) {
      await seedDefaults(user.id);
      // Re-load after seeding
      const { data: seeded } = await supabase
        .from("routines")
        .select("*, routine_exercises(*)")
        .order("created_at");
      if (seeded) mapAndSet(seeded);
    } else {
      mapAndSet(data);
    }
    setLoading(false);
  }, [user]);

  function mapAndSet(data: Parameters<typeof mapRoutine>[0][]) {
    setRoutines(data.map(mapRoutine));
  }

  useEffect(() => {
    load();
  }, [load]);

  return { routines, loading, reload: load };
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
