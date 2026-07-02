import { useEffect, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { knownExercises } from "@/data/exerciseLibrary";
import type { Routine } from "@/data/mock";
import type { RoutineExerciseInput } from "@/hooks/useRoutines";

type Row = { key: string; name: string; sets: string; reps: string };

function emptyRow(): Row {
  return { key: `row-${Date.now()}-${Math.random()}`, name: "", sets: "3", reps: "8-12" };
}

function toRow(ex: RoutineExerciseInput): Row {
  return { key: `row-${Math.random()}`, name: ex.name, sets: String(ex.sets), reps: ex.reps };
}

export function RoutineEditDialog({
  trigger,
  initial,
  onSave,
  customNames = [],
}: {
  trigger: ReactNode;
  initial?: Routine;
  onSave: (name: string, tag: string, exercises: RoutineExerciseInput[]) => Promise<void>;
  customNames?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [rows, setRows] = useState<Row[]>(
    initial ? initial.exercises.map(toRow) : [emptyRow()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setTag(initial?.tag ?? "");
      setRows(initial ? initial.exercises.map(toRow) : [emptyRow()]);
      setError(null);
    }
  }, [open, initial]);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  const validRows = rows.filter((r) => r.name.trim().length > 0);
  const canSave = name.trim().length > 0 && validRows.length > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(
        name.trim(),
        tag.trim(),
        validRows.map((r) => ({
          name: r.name.trim(),
          sets: Math.max(1, parseInt(r.sets, 10) || 3),
          reps: r.reps.trim() || "8-12",
        }))
      );
      setOpen(false);
    } catch (e) {
      console.error("Error saving routine:", e);
      setError("No se pudo guardar la rutina. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm gap-3 rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-base font-bold text-foreground">
            {initial ? "Editar rutina" : "Rutina nueva"}
          </DialogTitle>
        </DialogHeader>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la rutina"
          className="rounded-xl bg-secondary"
        />
        <Input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Etiqueta (ej. Empuje, Piernas)"
          className="rounded-xl bg-secondary"
        />

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_44px_56px_28px] items-center gap-1.5">
              <Input
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                placeholder="Ejercicio"
                list="known-exercises"
                className="h-9 rounded-lg bg-secondary text-sm"
              />
              <Input
                value={row.sets}
                onChange={(e) => updateRow(row.key, { sets: e.target.value })}
                type="number"
                inputMode="numeric"
                placeholder="Sets"
                className="h-9 rounded-lg bg-secondary text-center text-sm"
              />
              <Input
                value={row.reps}
                onChange={(e) => updateRow(row.key, { reps: e.target.value })}
                placeholder="Reps"
                className="h-9 rounded-lg bg-secondary text-center text-sm"
              />
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label="Quitar ejercicio"
                className="grid h-9 w-7 place-items-center text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <datalist id="known-exercises">
            {[...knownExercises, ...customNames].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>

        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground"
        >
          <Plus size={14} /> Agregar ejercicio
        </button>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}

        <Button onClick={handleSave} disabled={!canSave} className="rounded-xl text-sm font-bold">
          {saving ? "Guardando..." : initial ? "Guardar cambios" : "Crear rutina"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
