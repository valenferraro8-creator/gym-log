import { useState, type CSSProperties } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Dumbbell, MoreHorizontal, Plus, Undo2, Zap } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";
import { ExerciseInfoDialog } from "@/components/ExerciseInfoDialog";
import { AddExerciseDialog, type NewExercise } from "@/components/AddExerciseDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPrimaryMuscleLabel } from "@/data/exerciseLibrary";
import type { DropSet, ExerciseEntry } from "@/data/mock";
import { cn } from "@/lib/utils";

function DropRow({
  index,
  drop,
  onChangeWeight,
  onChangeReps,
  onToggleDone,
}: {
  index: number;
  drop: DropSet;
  onChangeWeight: (value: string) => void;
  onChangeReps: (value: string) => void;
  onToggleDone: () => void;
}) {
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
        value={drop.weight}
        onChange={(e) => onChangeWeight(e.target.value)}
        placeholder="0"
        inputMode="decimal"
        className="font-tabular h-7 min-w-0 w-full rounded-md border border-border/70 bg-secondary/60 text-center font-mono text-xs font-semibold text-foreground outline-none focus:border-primary"
      />
      <input
        value={drop.reps}
        onChange={(e) => onChangeReps(e.target.value)}
        placeholder="0"
        inputMode="numeric"
        className="font-tabular h-7 min-w-0 w-full rounded-md border border-border/70 bg-secondary/60 text-center font-mono text-xs font-semibold text-foreground outline-none focus:border-primary"
      />
      <button
        onClick={onToggleDone}
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
  onChangeDropWeight,
  onChangeDropReps,
  onToggleDropDone,
  onAddDrop,
}: {
  index: number;
  set: ExerciseEntry["sets"][number];
  onChangeWeight: (value: string) => void;
  onChangeReps: (value: string) => void;
  onToggleDone: () => void;
  onChangeDropWeight: (dropId: string, value: string) => void;
  onChangeDropReps: (dropId: string, value: string) => void;
  onToggleDropDone: (dropId: string) => void;
  onAddDrop: () => void;
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
            <DropRow
              key={d.id}
              index={i}
              drop={d}
              onChangeWeight={(value) => onChangeDropWeight(d.id, value)}
              onChangeReps={(value) => onChangeDropReps(d.id, value)}
              onToggleDone={() => onToggleDropDone(d.id)}
            />
          ))}
          <button
            onClick={onAddDrop}
            className="flex items-center gap-1 py-0.5 text-[10px] font-semibold text-muted-foreground"
          >
            <Plus size={10} /> Agregar otro drop
          </button>
        </div>
      )}
      {set.done && (!set.drops || set.drops.length === 0) && (
        <button
          onClick={onAddDrop}
          className="ml-7 mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground"
        >
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
  onChangeDropWeight,
  onChangeDropReps,
  onToggleDropDone,
  onAddDrop,
  onAddSet,
  onRemoveExercise,
}: {
  ex: ExerciseEntry;
  onChangeSetWeight: (setId: string, value: string) => void;
  onChangeSetReps: (setId: string, value: string) => void;
  onToggleSetDone: (setId: string) => void;
  onChangeDropWeight: (setId: string, dropId: string, value: string) => void;
  onChangeDropReps: (setId: string, dropId: string, value: string) => void;
  onToggleDropDone: (setId: string, dropId: string) => void;
  onAddDrop: (setId: string) => void;
  onAddSet: () => void;
  onRemoveExercise: () => void;
}) {
  const muscleLabel = getPrimaryMuscleLabel(ex.name) ?? ex.muscle;
  const [confirmRemove, setConfirmRemove] = useState(false);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={MoreHorizontal} label="Más opciones del ejercicio" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border bg-card">
            <DropdownMenuItem
              onSelect={() => setConfirmRemove(true)}
              className="text-destructive focus:text-destructive"
            >
              Quitar ejercicio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Quitar ejercicio"
        description={`¿Seguro que querés quitar "${ex.name}" del registro de hoy?`}
        confirmLabel="Quitar"
        onConfirm={() => {
          setConfirmRemove(false);
          onRemoveExercise();
        }}
        onCancel={() => setConfirmRemove(false)}
      />

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
            onChangeDropWeight={(dropId, value) => onChangeDropWeight(s.id, dropId, value)}
            onChangeDropReps={(dropId, value) => onChangeDropReps(s.id, dropId, value)}
            onToggleDropDone={(dropId) => onToggleDropDone(s.id, dropId)}
            onAddDrop={() => onAddDrop(s.id)}
          />
        ))}
      </div>

      <button
        onClick={onAddSet}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground"
      >
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
  onChangeDropWeight,
  onChangeDropReps,
  onToggleDropDone,
  onAddDrop,
  onAddSet,
  onRemoveExercise,
}: {
  exercises: ExerciseEntry[];
  onChangeSetWeight: (exId: string, setId: string, value: string) => void;
  onChangeSetReps: (exId: string, setId: string, value: string) => void;
  onToggleSetDone: (exId: string, setId: string) => void;
  onChangeDropWeight: (exId: string, setId: string, dropId: string, value: string) => void;
  onChangeDropReps: (exId: string, setId: string, dropId: string, value: string) => void;
  onToggleDropDone: (exId: string, setId: string, dropId: string) => void;
  onAddDrop: (exId: string, setId: string) => void;
  onAddSet: (exId: string) => void;
  onRemoveExercise: (exId: string) => void;
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
            onChangeDropWeight={(setId, dropId, value) => onChangeDropWeight(ex.id, setId, dropId, value)}
            onChangeDropReps={(setId, dropId, value) => onChangeDropReps(ex.id, setId, dropId, value)}
            onToggleDropDone={(setId, dropId) => onToggleDropDone(ex.id, setId, dropId)}
            onAddDrop={(setId) => onAddDrop(ex.id, setId)}
            onAddSet={() => onAddSet(ex.id)}
            onRemoveExercise={() => onRemoveExercise(ex.id)}
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
  canUndo = false,
  onUndo,
}: {
  exercises: ExerciseEntry[];
  setExercises: React.Dispatch<React.SetStateAction<ExerciseEntry[]>>;
  routineName: string;
  onSave: () => void;
  saving?: boolean;
  canUndo?: boolean;
  onUndo?: () => void;
}) {
  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const groups = groupExercises(exercises);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const [confirmSave, setConfirmSave] = useState(false);

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

  function addSet(exId: string) {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { id: `${exId}-s${Date.now()}`, previous: last?.previous ?? "—", weight: "", reps: "", done: false },
          ],
        };
      })
    );
  }

  function removeExercise(exId: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== exId));
  }

  function addDrop(exId: string, setId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id !== setId
                  ? s
                  : {
                      ...s,
                      drops: [
                        ...(s.drops ?? []),
                        { id: `${setId}-d${Date.now()}`, weight: "", reps: "", done: false },
                      ],
                    }
              ),
            }
      )
    );
  }

  function updateDrop(exId: string, setId: string, dropId: string, patch: Partial<DropSet>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id !== setId
                  ? s
                  : { ...s, drops: (s.drops ?? []).map((d) => (d.id === dropId ? { ...d, ...patch } : d)) }
              ),
            }
      )
    );
  }

  function toggleDropDone(exId: string, setId: string, dropId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id !== setId
                  ? s
                  : { ...s, drops: (s.drops ?? []).map((d) => (d.id === dropId ? { ...d, done: !d.done } : d)) }
              ),
            }
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
        <>
          {canUndo && onUndo && (
            <div className="shadow-card mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card-flat p-3.5">
              <div>
                <p className="text-sm font-bold text-foreground">Registro guardado</p>
                <p className="mt-0.5 text-xs text-muted-foreground">¿Te equivocaste? Podés deshacerlo.</p>
              </div>
              <Button
                variant="secondary"
                onClick={onUndo}
                className="flex items-center gap-1.5 rounded-xl text-xs font-bold"
              >
                <Undo2 size={14} /> Deshacer
              </Button>
            </div>
          )}
          <EmptyState
            icon={Dumbbell}
            title="Sin entreno registrado hoy"
            description="Elegí una rutina desde la pestaña Rutinas y empezá a sumar series."
          />
        </>
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
                    onChangeDropWeight={(exId, setId, dropId, value) => updateDrop(exId, setId, dropId, { weight: value })}
                    onChangeDropReps={(exId, setId, dropId, value) => updateDrop(exId, setId, dropId, { reps: value })}
                    onToggleDropDone={toggleDropDone}
                    onAddDrop={addDrop}
                    onAddSet={addSet}
                    onRemoveExercise={removeExercise}
                  />
                ) : (
                  <div className="shadow-card card-interactive overflow-hidden rounded-2xl border border-border bg-card">
                    <ExerciseCard
                      ex={g.exercises[0]}
                      onChangeSetWeight={(setId, value) => updateSet(g.exercises[0].id, setId, { weight: value })}
                      onChangeSetReps={(setId, value) => updateSet(g.exercises[0].id, setId, { reps: value })}
                      onToggleSetDone={(setId) => toggleSetDone(g.exercises[0].id, setId)}
                      onChangeDropWeight={(setId, dropId, value) => updateDrop(g.exercises[0].id, setId, dropId, { weight: value })}
                      onChangeDropReps={(setId, dropId, value) => updateDrop(g.exercises[0].id, setId, dropId, { reps: value })}
                      onToggleDropDone={(setId, dropId) => toggleDropDone(g.exercises[0].id, setId, dropId)}
                      onAddDrop={(setId) => addDrop(g.exercises[0].id, setId)}
                      onAddSet={() => addSet(g.exercises[0].id)}
                      onRemoveExercise={() => removeExercise(g.exercises[0].id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <AddExerciseDialog onAdd={handleAdd} />

          <ConfirmDialog
            open={confirmSave}
            title="Guardar registro"
            description={`¿Confirmás guardar el entreno de hoy con ${exercises.length} ejercicios y ${totalSets} series?`}
            confirmLabel="Guardar"
            confirmVariant="default"
            onConfirm={() => {
              setConfirmSave(false);
              onSave();
            }}
            onCancel={() => setConfirmSave(false)}
          />

          <Button
            onClick={() => setConfirmSave(true)}
            disabled={saving}
            className="w-full rounded-xl py-3 text-sm font-bold"
          >
            {saving ? "Guardando..." : "Guardar registro"}
          </Button>
        </>
      )}
    </div>
  );
}
