import { differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import type { TrainingSession } from "@/data/mock";

export type SessionSetRow = { weight_kg: number | null; reps: number | null };
export type SessionExerciseRow = { exercise_name: string; sets: SessionSetRow[] };
export type SessionRow = { id: string; finished_at: string; exercises: SessionExerciseRow[] };

function setVolume(set: SessionSetRow) {
  return (set.weight_kg ?? 0) * (set.reps ?? 0);
}

function estOneRm(set: SessionSetRow) {
  if (!set.weight_kg || !set.reps) return 0;
  return set.weight_kg * (1 + set.reps / 30);
}

export function distinctExerciseNames(sessions: SessionRow[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (!seen.has(ex.exercise_name)) {
        seen.add(ex.exercise_name);
        ordered.push(ex.exercise_name);
      }
    }
  }
  return ordered;
}

export function exerciseWeightHistory(sessions: SessionRow[], name: string) {
  return sessions
    .filter((s) => s.exercises.some((e) => e.exercise_name === name))
    .map((s) => {
      const ex = s.exercises.find((e) => e.exercise_name === name)!;
      const maxWeight = Math.max(0, ...ex.sets.map((set) => set.weight_kg ?? 0));
      return { rawDate: s.finished_at, weight: maxWeight };
    })
    .filter((p) => p.weight > 0)
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .map((p) => ({ date: format(parseISO(p.rawDate), "d MMM", { locale: es }), weight: p.weight }));
}

export function exerciseStatsFor(sessions: SessionRow[], name: string) {
  let best1RM = 0;
  let bestSetWeight = 0;
  let bestSetReps = 0;

  for (const s of sessions) {
    const ex = s.exercises.find((e) => e.exercise_name === name);
    if (!ex) continue;
    for (const set of ex.sets) {
      const rm = estOneRm(set);
      if (rm > best1RM) best1RM = rm;
      if ((set.weight_kg ?? 0) > bestSetWeight) {
        bestSetWeight = set.weight_kg ?? 0;
        bestSetReps = set.reps ?? 0;
      }
    }
  }

  const lastSession = sessions.find((s) => s.exercises.some((e) => e.exercise_name === name));
  const lastEx = lastSession?.exercises.find((e) => e.exercise_name === name);
  const totalVolume = lastEx ? lastEx.sets.reduce((sum, set) => sum + setVolume(set), 0) : 0;
  const totalSets = lastEx?.sets.length ?? 0;

  return {
    best1RM: best1RM > 0 ? `${best1RM.toFixed(1)} kg` : "—",
    bestSet: bestSetWeight > 0 ? `${bestSetWeight}kg x ${bestSetReps}` : "—",
    totalVolume: totalVolume > 0 ? `${totalVolume.toLocaleString("es-AR")} kg` : "—",
    totalSets,
  };
}

export function weeklyVolumeSeries(sessions: SessionRow[], weeks = 6) {
  const buckets = new Map<string, number>();
  for (const s of sessions) {
    const weekStart = startOfWeek(parseISO(s.finished_at), { weekStartsOn: 1 });
    const key = format(weekStart, "yyyy-MM-dd");
    const volume = s.exercises.reduce((sum, ex) => sum + ex.sets.reduce((acc, set) => acc + setVolume(set), 0), 0);
    buckets.set(key, (buckets.get(key) ?? 0) + volume);
  }

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const series: { week: string; volume: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = new Date(currentWeekStart);
    ws.setDate(ws.getDate() - i * 7);
    const key = format(ws, "yyyy-MM-dd");
    series.push({ week: format(ws, "d MMM", { locale: es }), volume: Math.round(buckets.get(key) ?? 0) });
  }
  return series;
}

export function trainedDaysInMonth(sessions: SessionRow[], year: number, month: number): number[] {
  const days = new Set<number>();
  for (const s of sessions) {
    const d = parseISO(s.finished_at);
    if (d.getFullYear() === year && d.getMonth() === month) days.add(d.getDate());
  }
  return [...days].sort((a, b) => a - b);
}

export function sessionsInLastDays(sessions: SessionRow[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return sessions.filter((s) => parseISO(s.finished_at) >= cutoff).length;
}

export function toTrainingSessions(sessions: SessionRow[]): TrainingSession[] {
  const now = new Date();
  return sessions.map((s) => ({
    daysAgo: differenceInCalendarDays(now, parseISO(s.finished_at)),
    exercises: s.exercises.map((e) => ({ name: e.exercise_name, sets: e.sets.length })),
  }));
}

export function bestWeightEver(sessions: SessionRow[], name: string): number {
  let best = 0;
  for (const s of sessions) {
    const ex = s.exercises.find((e) => e.exercise_name === name);
    if (!ex) continue;
    for (const set of ex.sets) {
      if ((set.weight_kg ?? 0) > best) best = set.weight_kg ?? 0;
    }
  }
  return best;
}
