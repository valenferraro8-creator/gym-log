import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { MuscleBody } from "@/components/MuscleBody";
import { GoalRow } from "@/components/GoalRow";
import { HeroStat } from "@/components/HeroStat";
import { exerciseStats, goals, weeklyVolume, weightProgress } from "@/data/mock";
import { computeWeeklyMuscleIntensity, daysSinceMuscleGroupTrained } from "@/lib/muscleVolume";
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

function GoalsCard() {
  return (
    <div className="shadow-card mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Objetivos</p>
      <div className="space-y-3">
        {goals.map((g) => (
          <GoalRow key={g.id} goal={g} />
        ))}
      </div>
    </div>
  );
}

function ExerciseTab() {
  const first = weightProgress[0].weight;
  const last = weightProgress[weightProgress.length - 1].weight;
  const trend = Math.round(((last - first) / first) * 100);

  return (
    <div className="space-y-4">
      <button className="shadow-card card-interactive flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="font-display text-sm font-bold text-foreground">Press banca</span>
        <ChevronDown size={16} className="text-muted-foreground" />
      </button>

      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <HeroStat label="Peso máximo actual" value={last} unit="kg" />
          <span className={cn("flex items-center gap-1 font-mono text-xs font-bold", trend >= 0 ? "text-primary" : "text-destructive")}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weightProgress} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
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

      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="1RM estimado (histórico)" value={exerciseStats.best1RM} />
        <StatCard label="Mejor serie (histórico)" value={exerciseStats.bestSet} />
        <StatCard label="Volumen (último registro)" value={exerciseStats.totalVolume} />
        <StatCard label="Series (último registro)" value={String(exerciseStats.totalSets)} />
      </div>
    </div>
  );
}

function WeeklyTab() {
  const first = weeklyVolume[0].volume;
  const last = weeklyVolume[weeklyVolume.length - 1].volume;
  const trend = Math.round(((last - first) / first) * 100);

  return (
    <div className="space-y-4">
      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Volumen semanal (kg)</p>
          <span className={cn("flex items-center gap-1 font-mono text-xs font-bold", trend >= 0 ? "text-primary" : "text-destructive")}>
            {trend >= 0 ? "+" : ""}{trend}% vs. S1
          </span>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={weeklyVolume} margin={{ top: 22, right: 4, left: 4, bottom: 0 }}>
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
        <StatCard label="Entrenos este mes" value="14" />
        <StatCard label="Promedio / semana" value="3.5" />
      </div>
    </div>
  );
}

function CalendarTab() {
  const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
  const today = 27;
  const trainedDays = [2, 3, 5, 7, 9, 10, 12, 14, 16, 17, 19, 21, 23, 24, 26];

  const { days, leadingBlanks, lastTrainedLabel } = useMemo(() => {
    const monthStart = new Date(2026, 5, 1);
    const leadingBlanks = (monthStart.getDay() + 6) % 7; // 0 = Monday
    const daysInMonth = 30;
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        trained: trainedDays.includes(day),
        future: day > today,
        isToday: day === today,
      };
    });
    const mostRecent = [...trainedDays].reverse().find((d) => d <= today);
    const diff = mostRecent ? today - mostRecent : null;
    const lastTrainedLabel = diff === null ? "—" : diff === 0 ? "Hoy" : diff === 1 ? "Ayer" : `Hace ${diff} días`;
    return { days, leadingBlanks, lastTrainedLabel };
  }, []);

  const trainedCount = days.filter((d) => d.trained).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard label="Días entrenados" value={String(trainedCount)} />
        <StatCard label="Último registro" value={lastTrainedLabel} />
      </div>

      <div className="shadow-card rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Junio 2026</p>
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

function MusclesTab() {
  const [weekOffset, setWeekOffset] = useState(0);
  const intensity = useMemo(() => computeWeeklyMuscleIntensity(undefined, weekOffset), [weekOffset]);
  const recency = useMemo(() => daysSinceMuscleGroupTrained(), []);

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

export function ProgressScreen() {
  const [tab, setTab] = useState<SubTab>("ejercicio");
  const tabs: { id: SubTab; label: string }[] = [
    { id: "ejercicio", label: "Ejercicio" },
    { id: "semanal", label: "Semanal" },
    { id: "calendario", label: "Calendario" },
    { id: "musculos", label: "Músculos" },
  ];

  return (
    <div className="pb-4">
      <TopBar title="Progreso" />

      <GoalsCard />

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

      {tab === "ejercicio" && <ExerciseTab />}
      {tab === "semanal" && <WeeklyTab />}
      {tab === "calendario" && <CalendarTab />}
      {tab === "musculos" && <MusclesTab />}
    </div>
  );
}
