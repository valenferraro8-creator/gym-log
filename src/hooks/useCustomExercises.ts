import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { registerCustomExercise, type ExerciseMedia } from "@/data/exerciseLibrary";
import type { Highlights } from "@/components/MuscleBody";

/**
 * Custom exercises created from "crear ejercicio nuevo" used to live only in an
 * in-memory registry (exerciseLibrary.ts), so they — and their muscle diagram —
 * disappeared on every page reload. This hook persists them to Supabase and
 * re-registers them into that in-memory registry whenever the user logs in.
 */
export function useCustomExercises(user: User | null) {
  const [customNames, setCustomNames] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setCustomNames([]);
      return;
    }

    const { data } = await supabase
      .from("custom_exercises")
      .select("name, view, highlights, equipment, instructions")
      .eq("user_id", user.id);

    for (const row of data ?? []) {
      registerCustomExercise(row.name, {
        view: row.view as ExerciseMedia["view"],
        highlights: row.highlights as Highlights,
        equipment: row.equipment ?? "Sin especificar",
        instructions: row.instructions ?? "",
      });
    }
    setCustomNames((data ?? []).map((row) => row.name));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (name: string, media: ExerciseMedia) => {
      registerCustomExercise(name, media);
      setCustomNames((prev) => (prev.includes(name) ? prev : [...prev, name]));

      if (!user) return;
      const { error } = await supabase.from("custom_exercises").insert({
        user_id: user.id,
        name,
        view: media.view,
        highlights: media.highlights,
        equipment: media.equipment,
        instructions: media.instructions,
      });
      if (error) console.error("Error saving custom exercise:", error);
    },
    [user]
  );

  return { customNames, create };
}
