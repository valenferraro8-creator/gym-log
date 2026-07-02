import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { knownExercises } from "@/data/exerciseLibrary";
import type { NewGoal } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";

type GoalType = "exercise" | "frequency";

export function GoalEditDialog({
  trigger,
  customNames = [],
  onSave,
}: {
  trigger: ReactNode;
  customNames?: string[];
  onSave: (goal: NewGoal) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<GoalType>("exercise");
  const [label, setLabel] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setType("exercise");
    setLabel("");
    setExerciseName("");
    setTarget("");
  }

  const parsedTarget = parseFloat(target);
  const canSave =
    label.trim().length > 0 &&
    !Number.isNaN(parsedTarget) &&
    parsedTarget > 0 &&
    (type === "frequency" || exerciseName.trim().length > 0) &&
    !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        label: label.trim(),
        exercise_name: type === "exercise" ? exerciseName.trim() : null,
        unit: type === "exercise" ? "kg" : "sesiones/sem",
        target: parsedTarget,
      });
      setOpen(false);
      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm gap-3 rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-base font-bold text-foreground">Nuevo objetivo</DialogTitle>
        </DialogHeader>

        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nombre del objetivo (ej. Press banca 100kg)"
          className="rounded-xl bg-secondary"
        />

        <div className="flex gap-1.5">
          {(
            [
              { id: "exercise", label: "Peso en ejercicio" },
              { id: "frequency", label: "Frecuencia semanal" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setType(opt.id)}
              className={cn(
                "flex-1 rounded-lg border px-2.5 py-2 text-xs font-semibold",
                type === opt.id ? "border-primary bg-primary/15 text-primary" : "border-border bg-secondary text-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {type === "exercise" && (
          <>
            <Input
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ejercicio"
              list="goal-exercises"
              className="rounded-xl bg-secondary"
            />
            <datalist id="goal-exercises">
              {[...knownExercises, ...customNames].map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </>
        )}

        <Input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          type="number"
          inputMode="decimal"
          placeholder={type === "exercise" ? "Peso objetivo (kg)" : "Sesiones por semana"}
          className="rounded-xl bg-secondary"
        />

        <Button onClick={handleSave} disabled={!canSave} className="rounded-xl text-sm font-bold">
          {saving ? "Guardando..." : "Crear objetivo"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
