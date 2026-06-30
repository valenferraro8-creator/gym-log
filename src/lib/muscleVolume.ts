import { muscleGroupOptions, type MuscleId } from "@/data/bodyMapData";
import { getExerciseMedia } from "@/data/exerciseLibrary";
import type { TrainingSession } from "@/data/mock";

export function computeWeeklyMuscleIntensity(
  sessions: TrainingSession[],
  weekOffset = 0
): Partial<Record<MuscleId, number>> {
  const raw: Partial<Record<MuscleId, number>> = {};
  const minDays = weekOffset * 7;
  const maxDays = (weekOffset + 1) * 7 - 1;
  const filtered = sessions.filter((s) => s.daysAgo >= minDays && s.daysAgo <= maxDays);

  for (const session of filtered) {
    for (const ex of session.exercises) {
      const media = getExerciseMedia(ex.name);
      if (!media) continue;
      for (const [id, level] of Object.entries(media.highlights) as [MuscleId, "primary" | "secondary"][]) {
        const weight = level === "primary" ? 1 : 0.5;
        raw[id] = (raw[id] ?? 0) + ex.sets * weight;
      }
    }
  }

  const max = Math.max(1, ...Object.values(raw));
  const intensity: Partial<Record<MuscleId, number>> = {};
  for (const [id, value] of Object.entries(raw)) {
    intensity[id as MuscleId] = (value as number) / max;
  }
  return intensity;
}

export type MuscleGroupRecency = { label: string; daysAgo: number | null };

export function daysSinceMuscleGroupTrained(sessions: TrainingSession[]): MuscleGroupRecency[] {
  const results = muscleGroupOptions.map((group) => {
    let minDays: number | null = null;
    for (const session of sessions) {
      const hit = session.exercises.some((ex) => {
        const media = getExerciseMedia(ex.name);
        return media ? group.ids.some((id) => id in media.highlights) : false;
      });
      if (hit && (minDays === null || session.daysAgo < minDays)) {
        minDays = session.daysAgo;
      }
    }
    return { label: group.label, daysAgo: minDays };
  });

  return results.sort((a, b) => {
    if (a.daysAgo === null) return -1;
    if (b.daysAgo === null) return 1;
    return b.daysAgo - a.daysAgo;
  });
}
