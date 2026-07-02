import { useState, type CSSProperties } from "react";
import { ListChecks, MoreVertical, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";
import { ExerciseInfoDialog } from "@/components/ExerciseInfoDialog";
import { RoutineEditDialog } from "@/components/RoutineEditDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Routine } from "@/data/mock";
import type { RoutineExerciseInput } from "@/hooks/useRoutines";

function RoutineCard({
  r,
  onUseRoutine,
  onUpdate,
  onDelete,
  hasActiveWorkout,
  customNames,
}: {
  r: Routine;
  onUseRoutine: (r: Routine) => void;
  onUpdate: (id: string, name: string, tag: string, exercises: RoutineExerciseInput[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  hasActiveWorkout: boolean;
  customNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const previewNames = r.exercises.slice(0, 3).map((e) => e.name).join(", ");
  const remaining = r.exercises.length - 3;

  async function handleDelete() {
    setConfirmDelete(false);
    setDeleteError(null);
    try {
      await onDelete(r.id);
    } catch (e) {
      console.error("Error deleting routine:", e);
      setDeleteError("No se pudo eliminar la rutina. Probá de nuevo.");
    }
  }

  return (
    <div className="shadow-card card-interactive rounded-2xl border border-border bg-card-flat p-4">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => setOpen((o) => !o)} className="flex-1 text-left">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{r.tag}</p>
          <h3 className="font-display text-lg font-bold leading-tight text-foreground">{r.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {r.exercises.length} ejercicios · {r.lastDone}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {previewNames}
            {remaining > 0 && !open && <span className="font-semibold text-primary"> +{remaining} más</span>}
          </p>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={MoreVertical} label="Más opciones de la rutina" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border bg-card">
            <DropdownMenuItem
              onSelect={() => setConfirmDelete(true)}
              className="text-destructive focus:text-destructive"
            >
              Eliminar rutina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar rutina"
        description={`¿Seguro que querés eliminar "${r.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {deleteError && <p className="mt-2 text-xs font-medium text-destructive">{deleteError}</p>}

      <ConfirmDialog
        open={confirmSwitch}
        title="Reemplazar registro de hoy"
        description={`Ya tenés un registro en progreso. Si arrancás "${r.name}" ahora, vas a perder los datos que no hayas guardado.`}
        confirmLabel="Reemplazar"
        onConfirm={() => {
          setConfirmSwitch(false);
          onUseRoutine(r);
        }}
        onCancel={() => setConfirmSwitch(false)}
      />

      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {r.exercises.map((ex) => (
            <div key={ex.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">{ex.name}</span>
                <ExerciseInfoDialog name={ex.name} />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {ex.sets} x {ex.reps}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex gap-2">
        <RoutineEditDialog
          initial={r}
          onSave={(name, tag, exercises) => onUpdate(r.id, name, tag, exercises)}
          customNames={customNames}
          trigger={
            <Button variant="secondary" className="flex-1 rounded-xl text-sm font-semibold">
              Editar
            </Button>
          }
        />
        <Button
          onClick={() => (hasActiveWorkout ? setConfirmSwitch(true) : onUseRoutine(r))}
          className="flex-1 rounded-xl text-sm font-semibold"
        >
          Usar hoy
        </Button>
      </div>
    </div>
  );
}

export function RoutinesScreen({
  routines,
  onUseRoutine,
  onCreate,
  onUpdate,
  onDelete,
  hasActiveWorkout = false,
  customExerciseNames = [],
}: {
  routines: Routine[];
  onUseRoutine: (r: Routine) => void;
  onCreate: (name: string, tag: string, exercises: RoutineExerciseInput[]) => Promise<void>;
  onUpdate: (id: string, name: string, tag: string, exercises: RoutineExerciseInput[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  hasActiveWorkout?: boolean;
  customExerciseNames?: string[];
}) {
  return (
    <div className="pb-4">
      <TopBar title="Rutinas" subtitle={`${routines.length} rutinas guardadas`} />

      <RoutineEditDialog
        onSave={onCreate}
        customNames={customExerciseNames}
        trigger={
          <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-bold text-primary">
            <Plus size={16} /> Crear rutina
          </button>
        }
      />

      {routines.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Todavía no creaste ninguna rutina"
          description="Armá tu primera rutina para tener los ejercicios listos antes de entrenar."
        />
      ) : (
        <div className="space-y-3">
          {routines.map((r, i) => (
            <div key={r.id} className="stagger-item" style={{ "--stagger-delay": `${i * 50}ms` } as CSSProperties}>
              <RoutineCard
                r={r}
                onUseRoutine={onUseRoutine}
                onUpdate={onUpdate}
                onDelete={onDelete}
                hasActiveWorkout={hasActiveWorkout}
                customNames={customExerciseNames}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
