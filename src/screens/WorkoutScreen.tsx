import type { CSSProperties } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Dumbbell, MoreHorizontal, Plus, Zap } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";
import { ExerciseInfoDialog } from "@/components/ExerciseInfoDialog";
import { AddExerciseDialog, type NewExercise } from "@/components/AddExerciseDialog";
import { getPrimaryMuscleLabel } from "@/data/exerciseLibrary";
import type { DropSet, ExerciseEntry } from "@/data/mock";
import { cn } from "@/lib/utils";

function DropRow({ index, drop }: { index: number; drop: DropSet }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[24px_56px_1fr_1fr_36px] items-center gap-2 rounded-lg py-1",
        drop.done && "bg-success/10"
      )}
    >
      <span className="min-w-0 text-center text-[10px] font-bold text-muted-foreground/60">↳ {index + 1}</span>
      <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">Drop</span>
      <input
        defaultValue={drop.weight}
        placeholder="0"
        inputMode="decimal"
        className="font-tabular h-7 min-w-0 w-full rounded-md border border-border/70 bg-secondary/60 text-center font-mono text-xs font-semibold text-foreground outline-none focus:border-primary"
      />
      <input
        defaultValue={drop.reps}
        placeholder="0"
        inputMode="numeric"
        className="font-tabular h-7 min-w-0 w-full rounded-md border border-border/70 bg-secondary/60 text-center font-mono text-xs font-semibold text-foreground outline-none focus:border-primary"
      />
      <button
        aria-label={drop.done ? "Marcar dropset como no completado" : "Marcar dropset como completado"}
        className={cn(
          "grid h-7 w-7 min-w-0 place-items-center rounded-md border transition-colors justify-self-end",
          drop.done
            ? "border-success bg-success text-success-foreground"
            : "border-border/70 bg-secondary/60 text-muted-foreground"
        )}
      >
        <Check size={13} strokeWidth={3} />
      </button>
    </div>
  );
}

function parsePrevious(previous: string): { weight: number; reps: number } | null {
  const m = previous.match(/^[+]?([\d.]+)kg\s*x\s*(\d+)$/);
  if (!m) return null;
  return { weight: parseFloat(m[1]), reps: parseInt(m[2], 10) };
}

function computeDelta(previous: string, weight: string, reps: string) {
  const prev = parsePrevious(previous);
  const curWeight = parseFloat(weight);
  const curReps = parseInt(reps, 10);
  if (!prev || Number.isNaN(curWeight) || Number.isNaN(curReps)) return null;

  const weightDiff = Math.round((curWeight - prev.weight) * 100) / 100;
  const repsDiff = curReps - prev.reps;

  if (weightDiff === 0 && repsDiff === 0) {
    return { text: "Igual que la vez anterior", direction: "flat" as const };
  }
  if (weightDiff !== 0) {
    return { text: `${weightDiff > 0 ? "+" : ""}${weightDiff}kg vs. anterior`, direction: weightDiff > 0 ? "up" : ("down" as const) };
  }
  return {
    text: `${repsDiff > 0 ? "+" : ""}${repsDiff} rep${Math.abs(repsDiff) > 1 ? "s" : ""} vs. anterior`,
    direction: repsDiff > 0 ? "up" : ("down" as const),
  };
}

function SetRow({
  index,
  set,
  onChangeWeight,
  onChangeReps,
  onToggleDone,
}: {
  index: number;
  set: ExerciseEntry["sets"][number];
  onChangeWeight: (value: string) => void;
  onChangeReps: (value: string) => void;
  onToggleDone: () => void;
}) {
  const delta = set.weight.trim() !== "" && set.reps.trim() !== "" ? computeDelta(set.previous, set.weight, set.reps) : null;

  return (
    <div>
      <div
        className={cn(
          "grid grid-cols-[24px_56px_1fr_1fr_36px] items-center gap-2 rounded-lg px-1 py-1.5",
          set.done && "bg-success/10"
        )}
      >
        <span className="min-w-0 font-mono text-center text-xs font-bold text-muted-foreground">{index + 1}</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/70">{set.previous}</span>
        <input
          value={set.weight}
          onChange={(e) => onChangeWeight(e.target.value)}
          placeholder="0"
          inputMode="decimal"
          className="font-hero h-9 min-w-0 w-full rounded-md border border-border bg-secondary text-center text-base font-black text-foreground outline-none focus:border-primary"
        />
        <input
          value={set.reps}
          onChange={(e) => onChangeReps(e.target.value)}
          placeholder="0"
          inputMode="numeric"
          className="font-hero h-9 min-w-0 w-full rounded-md border border-border bg-secondary text-center text-base font-black text-foreground outline-none focus:border-primary"
        />
        <button
          onClick={onToggleDone}
          aria-label={set.done ? "Marcar serie como no completada" : "Marcar serie como completada"}
          className={cn(
            "grid h-9 w-9 min-w-0 place-items-center rounded-md border transition-colors justify-self-end",
            set.done
              ? "border-success bg-success text-success-foreground"
              : "border-border bg-secondary text-muted-foreground"
          )}
        >
          <Check size={16} strokeWidth={3} />
        </button>
      </div>

      {delta && (
        <div
          className={cn(
            "ml-7 mt-0.5 text-[11px] font-semibold",
            delta.direction === "up" ? "text-primary" : delta.direction === "down" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {delta.text}
        </div>
      )}

      {set.isPR && <div className="ml-7 mt-0.5 text-[11px] font-semibold text-gold">Mejor marca personal</div>}

      {set.drops && set.drops.length > 0 && (
        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-dashed border-border pl-2">
          {set.drops.map((d, i) => (
            <DropRow key={d.id} index={i} drop={d} />
          ))}
          <button className="flex items-center gap-1 py-0.5 text-[10px] font-semibold text-muted-foreground">
            <Plus size={10} /> Agregar otro drop
          </button>
        </div>
      )}
      {set.done && (!set.drops || set.drops.length === 0) && (
        <button className="ml-7 mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
          <Plus size={10} /> Agregar dropset
        </button>
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  onChangeSetWeight,
  onChangeSetReps,
  onToggleSetDone,
}: {
  ex: ExerciseEntry;
  onChangeSetWeight: (setId: string, value: string) => void;
  onChangeSetReps: (setId: string, value: string) => void;
  onToggleSetDone: (setId: string) => void;
}) {
  const muscleLabel = getPrimaryMuscleLabel(ex.name) ?? ex.muscle;
  return (
    <div className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-1">
          <div>
            <h3 className="font-display text-[15px] font-bold leading-tight text-foreground">{ex.name}</h3>
            {muscleLabel && (
              <span className="mt-1 inline-block rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {muscleLabel}
              </span>
            )}
          </div>
          <ExerciseInfoDialog name={ex.name} />
        </div>
        <IconButton icon={MoreHorizontal} label="Más opciones del ejercicio" />
      </div>

      <div className="mb-1 grid grid-cols-[24px_56px_1fr_1fr_36px] gap-2 px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
        <span className="text-center">Set</span>
        <span>Anterior</span>
        <span className="text-center">Kg</span>
        <span className="text-center">Reps</span>
        <span></span>
      </div>

      <div className="space-y-1">
        {ex.sets.map((s, i) => (
          <SetRow
            key={s.id}
            index={i}
            set={s}
            onChangeWeight={(value) => onChangeSetWeight(s.id, value)}
            onChangeReps={(value) => onChangeSetReps(s.id, value)}
            onToggleDone={() => onToggleSetDone(s.id)}
          />
        ))}
      </div>

      <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground">
        <Plus size={14} /> Agregar serie
      </button>
    </div>
  );
}

function SupersetGroup({
  exercises,
  onChangeSetWeight,
  onChangeSetReps,
  onToggleSetDone,
}: {
  exercises: ExerciseEntry[];
  onChangeSetWeight: (exId: string, setId: string, value: string) => void;
  onChangeSetReps: (exId: string, setId: string, value: string) => void;
  onToggleSetDone: (exId: string, setId: string) => void;
}) {
  return (
    <div className="shadow-card overflow-hidden rounded-2xl border border-border border-l-[3px] border-l-violet-400 bg-card">
      <div className="flex items-center gap-1.5 px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-violet-400">
        <Zap size={12} strokeWidth={2.5} />
        Superserie — sin descanso entre ejercicios
      </div>
      <div className="divide-y divide-border">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            onChangeSetWeight={(setId, value) => onChangeSetWeight(ex.id, setId, value)}
            onChangeSetReps={(setId, value) => onChangeSetReps(ex.id, setId, value)}
            onToggleSetDone={(setId) => onToggleSetDone(ex.id, setId)}
          />
        ))}
      </div>
    </div>
  );
}

function groupExercises(exercises: ExerciseEntry[]) {
  const groups: { type: "single" | "superset"; exercises: ExerciseEntry[] }[] = [];
  for (const ex of exercises) {
    const last = groups[groups.length - 1];
    if (ex.supersetGroup && last?.type === "superset" && last.exercises[0].supersetGroup === ex.supersetGroup) {
      last.exercises.push(ex);
    } else if (ex.supersetGroup) {
      groups.push({ type: "superset", exercises: [ex] });
    } else {
      groups.push({ type: "single", exercises: [ex] });
    }
  }
  return groups;
}

export function WorkoutScreen({
  exercises,
  setExercises,
  routineName,
  onSave,
  saving = false,
}: {
  exercises: ExerciseEntry[];
  setExercises: React.Dispatch<React.SetStateAction<ExerciseEntry[]>>;
  routineName: string;
  onSave: () => void;
  saving?: boolean;
}) {
  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const groups = groupExercises(exercises);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  function updateSet(exId: string, setId: string, patch: Partial<ExerciseEntry["sets"][number]>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
      )
    );
  }

  function toggleSetDone(exId: string, setId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)) }
      )
    );
  }

  function handleAdd(newEx: NewExercise) {
    setExercises((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newEx.name,
        muscle: newEx.muscle,
        sets: [{ id: `custom-${Date.now()}-s1`, previous: "—", weight: "", reps: "", done: false }],
      },
    ]);
  }

  return (
    <div className="pb-4">
      <TopBar title="Registro" subtitle={routineName ? `${routineName} · ${todayLabel}` : todayLabel} />

      {exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sin entreno registrado hoy"
          description="Elegí una rutina desde la pestaña Rutinas y empezá a sumar series."
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {exercises.length} ejercicios · {totalSets} series
            </span>
          </div>

          <div className="space-y-3">
            {groups.map((g, i) => (
              <div key={i} className="stagger-item" style={{ "--stagger-delay": `${i * 50}ms` } as CSSProperties}>
                {g.type === "superset" ? (
                  <SupersetGroup
                    exercises={g.exercises}
                    onChangeSetWeight={(exId, setId, value) => updateSet(exId, setId, { weight: value })}
                    onChangeSetReps={(exId, setId, value) => updateSet(exId, setId, { reps: value })}
                    onToggleSetDone={toggleSetDone}
                  />
                ) : (
                  <div className="shadow-card card-interactive overflow-hidden rounded-2xl border border-border bg-card">
                    <ExerciseCard
                      ex={g.exercises[0]}
                      onChangeSetWeight={(setId, value) => updateSet(g.exercises[0].id, setId, { weight: value })}
                      onChangeSetReps={(setId, value) => updateSet(g.exercises[0].id, setId, { reps: value })}
                      onToggleSetDone={(setId) => toggleSetDone(g.exercises[0].id, setId)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <AddExerciseDialog onAdd={handleAdd} />

          <Button onClick={onSave} disabled={saving} className="w-full rounded-xl py-3 text-sm font-bold">
            {saving ? "Guardando..." : "Guardar registro"}
          </Button>
        </>
      )}
    </div>
  );
}
