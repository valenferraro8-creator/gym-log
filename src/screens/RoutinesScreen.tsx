import { useState, type CSSProperties } from "react";
import { ListChecks, MoreVertical, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/IconButton";
import { EmptyState } from "@/components/EmptyState";
import { ExerciseInfoDialog } from "@/components/ExerciseInfoDialog";
import type { Routine } from "@/data/mock";

function RoutineCard({ r, onUseRoutine }: { r: Routine; onUseRoutine: (r: Routine) => void }) {
  const [open, setOpen] = useState(false);
  const previewNames = r.exercises.slice(0, 3).map((e) => e.name).join(", ");
  const remaining = r.exercises.length - 3;

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
        <IconButton icon={MoreVertical} label="Más opciones de la rutina" />
      </div>

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
        <Button variant="secondary" className="flex-1 rounded-xl text-sm font-semibold">
          Editar
        </Button>
        <Button onClick={() => onUseRoutine(r)} className="flex-1 rounded-xl text-sm font-semibold">
          Usar hoy
        </Button>
      </div>
    </div>
  );
}

export function RoutinesScreen({
  routines,
  onUseRoutine,
}: {
  routines: Routine[];
  onUseRoutine: (r: Routine) => void;
}) {
  return (
    <div className="pb-4">
      <TopBar title="Rutinas" subtitle={`${routines.length} rutinas guardadas`} />

      <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-bold text-primary">
        <Plus size={16} /> Crear rutina
      </button>

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
              <RoutineCard r={r} onUseRoutine={onUseRoutine} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
