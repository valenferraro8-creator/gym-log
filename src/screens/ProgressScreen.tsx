import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LineChart, Plus, Target, TrendingDown, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { SignOutButton } from "@/components/SignOutButton";
import { MuscleBody } from "@/components/MuscleBody";
import { GoalRow } from "@/components/GoalRow";
import { GoalEditDialog } from "@/components/GoalEditDialog";
import { IconButton } from "@/components/IconButton";
import { HeroStat } from "@/components/HeroStat";
import { EmptyState } from "@/components/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProgressData } from "@/hooks/useProgressData";
import { useGoals, type GoalRecord, type NewGoal } from "@/hooks/useGoals";
import { useExerciseBest } from "@/hooks/useExerciseBest";
import { loadBestWeights } from "@/hooks/useWorkout";
import {
  bestWeightEver,
  distinctExerciseNames,
  exerciseStatsFor,
  exerciseWeightHistory,
  sessionsInLastDays,
  toTrainingSessions,
  trainedDaysInMonth,
  weeklyVolumeSeries,
  type SessionRow,
} from "@/lib/progressData";
import { computeWeeklyMuscleIntensity, daysSinceMuscleGroupTrained } from "@/lib/muscleVolume";
import { knownExercises } from "@/data/exerciseLibrary";
import { cn } from "@/lib/utils";

type SubTab = "ejercicio" | "semanal" | "calendario" | "musculos";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="shadow-card rounded-xl border border-border bg-card-flat p-3">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono mt-1.5 text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function computeGoalCurrent(goal: GoalRecord, sessions: SessionRow[], bestWeights: Record<string, number>): number {
  if (goal.exercise_name) {
    // Prefer the all-time best (not capped to the recent-sessions window) —
    // fall back to the capped client-side value until it's loaded.
    return bestWeights[goal.exercise_name] ?? bestWeightEver(sessions, goal.exercise_name);
  }
  return Math.round((sessionsInLastDays(sessions, 28) / 4) * 10) / 10;
}

function GoalsCard({
  goals,
  sessions,
  customExerciseNames,
  onCreate,
  onDelete,
}: {
  goals: GoalRecord[];
  sessions: SessionRow[];
  customExerciseNames: string[];
  onCreate: (goal: NewGoal) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const { user } = useAuth();
  const [bestWeights, setBestWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    const exerciseNames = goals.map((g) => g.exercise_name).filter((n): n is string => !!n);
    if (!user || exerciseNames.length === 0) {
      setBestWeights({});
      return;
    }
    let cancelled = false;
    loadBestWeights(user.id, exerciseNames).then((map) => {
      if (!cancelled) setBestWeights(map);
    });
    return () => {
      cancelled = true;
    };
  }, [user, goals]);

  return (
    <div className="shadow-card mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Objetivos</p>
        <GoalEditDialog
          customNames={customExerciseNames}
          onSave={onCreate}
          trigger={<IconButton icon={Plus} label="Agregar objetivo" className="h-6 w-6" />}
        />
      </div>
      {goals.length === 0 ? (
        <p className="text-xs text-muted-foreground">Todavía no tenés objetivos. Agregá uno para hacer seguimiento.</p>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalRow
              key={g.id}
              goal={{
                id: g.id,
                label: g.label,
                unit: g.unit,
                current: computeGoalCurrent(g, sessions, bestWeights),
                target: g.target,
              }}
              onDelete={() => onDelete(g.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseTab({ sessions }: { sessions: SessionRow[] }) {
  const { user } = useAuth();
  const names = useMemo(() => {
    const trained = distinctExerciseNames(sessions);
    const rest = knownExercises.filter((n) => !trained.includes(n)).sort((a, b) => a.localeCompare(b));
    return [...trained, ...rest];
  }, [sessions]);
  const [selected, setSelected] = useState<string | null>(null);
  const activeName = selected && names.includes(selected) ? selected : (names[0] ?? null);

  const history = useMemo(() => (activeName ? exerciseWeightHistory(sessions, activeName) : []), [sessions, activeName]);
  const stats = useMemo(
    () => (activeName ? exerciseStatsFor(sessions, activeName) : null),
    [sessions, activeName]
  );
  // All-time bests (not capped to the recent-sessions window sessions/stats use above).
  const allTimeBest = useExerciseBest(user, activeName);

  if (!activeName) {
    return (
      <EmptyState
        icon={LineChart}
        title="Sin entrenos registrados todavía"
        description="Guardá un entrenamiento desde la pestaña Registro para ver tu progreso acá."
      />
    );
  }

  const first = history[0]?.weight ?? 0;
  const last = history[history.length - 1]?.weight ?? 0;
  const trend = first > 0 ? Math.round(((last - first) / first) * 100) : 0;

  return (
    <div className="space-y-4">
      <Select value={activeName} onValueChange={setSelected}>
        <SelectTrigger className="shadow-card card-interactive h-auto rounded-xl border-border bg-card px-4 py-3 text-sm font-bold text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border bg-card">
          {names.map((n) => (
            <SelectItem key={n} value={n} className="text-sm">
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {history.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="Sin series con peso registrado"
          description="Cuando registres series con peso de este ejercicio, vas a ver acá tu evolución."
        />
      ) : (
        <div className="shadow-card rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <HeroStat label="Peso máximo actual" value={last} unit="kg" />
            <span className={cn("flex items-center gap-1 font-mono text-xs font-bold", trend >= 0 ? "text-primary" : "text-destructive")}>
              {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(218 9% 63%)" }} axisLine={false} tickLine={false} />
              <YAxis
                width={28}
                tick={{ fontSize: 10, fill: "hsl(218 9% 63%)" }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{ background: "hsl(222 14% 9%)", border: "1px solid hsl(222 12% 18%)", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "hsl(0 0% 98%)" }}
                formatter={(value) => [`${value as number} kg`, "Peso"]}
              />
              <Area type="monotone" dataKey="weight" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#weightFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="1RM estimado (histórico)"
            value={allTimeBest && allTimeBest.best1RM > 0 ? `${allTimeBest.best1RM.toFixed(1)} kg` : stats.best1RM}
          />
          <StatCard
            label="Mejor serie (histórico)"
            value={
              allTimeBest && allTimeBest.bestWeight > 0
                ? `${allTimeBest.bestWeight}kg x ${allTimeBest.bestReps}`
                : stats.bestSet
            }
          />
          <StatCard label="Volumen (último registro)" value={stats.totalVolume} />
          <StatCard label="Series (último registro)" value={String(stats.totalSets)} />
        </div>
      )}
    </div>
  );
}

function WeeklyTab({ sessions }: { sessions: SessionRow[] }) {
  const series = useMemo(() => weeklyVolumeSeries(sessions), [sessions]);
  const first = series[0]?.volume ?? 0;
  const last = series[series.length - 1]?.volume ?? 0;
  const trend = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
  const entrenosEsteMes = sessionsInLastDays(sessions, 30);
  const promedioSemana = Math.round((sessionsInLastDays(sessions, 28) / 4) * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Volumen semanal (kg)</p>
          <span className={cn("flex items-center gap-1 font-mono text-xs font-bold", trend >= 0 ? "text-primary" : "text-destructive")}>
            {trend >= 0 ? "+" : ""}
            {trend}% vs. hace 6 sem.
          </span>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={series} margin={{ top: 22, right: 4, left: 4, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(218 9% 63%)" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, "dataMax + 1500"]} />
            <Tooltip
              contentStyle={{ background: "hsl(222 14% 9%)", border: "1px solid hsl(222 12% 18%)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "hsl(0 0% 98%)" }}
              cursor={{ fill: "hsl(222 12% 16%)" }}
              formatter={(value) => [`${value as number} kg`, "Volumen"]}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]} fill="hsl(217 91% 60%)">
              <LabelList
                dataKey="volume"
                position="top"
                formatter={(v) => `${v as number}`}
                style={{ fill: "hsl(0 0% 98%)", fontSize: 11, fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="Entrenos este mes" value={String(entrenosEsteMes)} />
        <StatCard label="Promedio / semana" value={String(promedioSemana)} />
      </div>
    </div>
  );
}

function CalendarTab({ sessions }: { sessions: SessionRow[] }) {
  const today = new Date();
  const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

  const { days, leadingBlanks, lastTrainedLabel, monthLabel } = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const trainedDays = trainedDaysInMonth(sessions, year, month);
    const monthStart = new Date(year, month, 1);
    const leadingBlanks = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = today.getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { day, trained: trainedDays.includes(day), future: day > todayDate, isToday: day === todayDate };
    });
    const mostRecent = [...trainedDays].reverse().find((d) => d <= todayDate);
    const diff = mostRecent ? todayDate - mostRecent : null;
    const lastTrainedLabel = diff === null ? "—" : diff === 0 ? "Hoy" : diff === 1 ? "Ayer" : `Hace ${diff} días`;
    const monthLabel = today.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    return { days, leadingBlanks, lastTrainedLabel, monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  const trainedCount = days.filter((d) => d.trained).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="Días entrenados" value={String(trainedCount)} />
        <StatCard label="Último registro" value={lastTrainedLabel} />
      </div>

      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{monthLabel}</p>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground/70">
              {label}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`blank-${i}`} />)}
          {days.map((d) => (
            <div
              key={d.day}
              className={cn(
                "font-mono relative grid aspect-square place-items-center rounded-md text-[11px] font-semibold",
                d.trained ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground",
                d.future && "opacity-30",
                d.isToday && "ring-2 ring-foreground ring-offset-1 ring-offset-card"
              )}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Entrenado
          <span className="ml-2 h-2.5 w-2.5 rounded-sm bg-secondary" /> Sin registro
          <span className="ml-2 h-2.5 w-2.5 rounded-sm border-2 border-foreground" /> Hoy
        </div>
      </div>
    </div>
  );
}

function MusclesTab({ sessions }: { sessions: SessionRow[] }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const trainingSessions = useMemo(() => toTrainingSessions(sessions), [sessions]);
  const intensity = useMemo(
    () => computeWeeklyMuscleIntensity(trainingSessions, weekOffset),
    [trainingSessions, weekOffset]
  );
  const recency = useMemo(() => daysSinceMuscleGroupTrained(trainingSessions), [trainingSessions]);

  return (
    <div className="space-y-4">
      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
            Volumen por músculo
          </p>
          <div className="flex gap-0.5 rounded-lg bg-secondary p-0.5">
            {(["Esta semana", "Sem. anterior"] as const).map((label, i) => (
              <button
                key={i}
                onClick={() => setWeekOffset(i)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors",
                  weekOffset === i ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <MuscleBody view="both" intensity={intensity} />
        <div className="mt-1 flex items-center justify-center gap-2 text-[10.5px] text-muted-foreground">
          <span>Poco</span>
          <div
            className="h-2 w-24 rounded-full"
            style={{ background: "linear-gradient(to right, rgb(75,85,99), rgb(251,146,60), rgb(239,68,68))" }}
          />
          <span>Mucho</span>
        </div>
      </div>

      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
          Hace cuánto no entrenás cada grupo
        </p>
        <div className="space-y-2.5">
          {recency.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{r.label}</span>
              <span
                className={cn(
                  "font-mono text-xs font-bold",
                  r.daysAgo !== null && r.daysAgo >= 7 ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {r.daysAgo === null
                  ? "Sin registro"
                  : r.daysAgo === 0
                    ? "Hoy"
                    : r.daysAgo === 1
                      ? "Ayer"
                      : `Hace ${r.daysAgo} días`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProgressScreen({ customExerciseNames = [] }: { customExerciseNames?: string[] }) {
  const { user } = useAuth();
  const { sessions, loading: sessionsLoading } = useProgressData(user);
  const { goals, create: createGoal, remove: removeGoal } = useGoals(user);
  const [tab, setTab] = useState<SubTab>("ejercicio");
  const tabs: { id: SubTab; label: string }[] = [
    { id: "ejercicio", label: "Ejercicio" },
    { id: "semanal", label: "Semanal" },
    { id: "calendario", label: "Calendario" },
    { id: "musculos", label: "Músculos" },
  ];

  if (sessionsLoading) {
    return (
      <div className="pb-4">
        <TopBar title="Progreso" action={<SignOutButton />} />
        <div className="grid place-items-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="pb-4">
        <TopBar title="Progreso" action={<SignOutButton />} />
        <GoalsCard
          goals={goals}
          sessions={sessions}
          customExerciseNames={customExerciseNames}
          onCreate={createGoal}
          onDelete={removeGoal}
        />
        <EmptyState
          icon={Target}
          title="Todavía no hay entrenos guardados"
          description="Cuando guardes tu primer entrenamiento desde la pestaña Registro, vas a ver acá tu progreso, volumen semanal y mapa muscular."
        />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <TopBar title="Progreso" action={<SignOutButton />} />

      <GoalsCard
        goals={goals}
        sessions={sessions}
        customExerciseNames={customExerciseNames}
        onCreate={createGoal}
        onDelete={removeGoal}
      />

      <div className="mb-4 flex gap-1 rounded-xl bg-secondary p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg py-2 text-xs font-bold transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ejercicio" && <ExerciseTab sessions={sessions} />}
      {tab === "semanal" && <WeeklyTab sessions={sessions} />}
      {tab === "calendario" && <CalendarTab sessions={sessions} />}
      {tab === "musculos" && <MusclesTab sessions={sessions} />}
    </div>
  );
}
