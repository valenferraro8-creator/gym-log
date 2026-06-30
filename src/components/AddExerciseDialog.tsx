import { useMemo, useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MuscleBody } from "@/components/MuscleBody";
import { muscleGroupOptions, viewForIds, type MuscleId } from "@/data/bodyMapData";
import { getExerciseMedia, knownExercises, registerCustomExercise } from "@/data/exerciseLibrary";
import { cn } from "@/lib/utils";

export type NewExercise = {
  name: string;
  muscle: string;
};

export function AddExerciseDialog({ onAdd }: { onAdd: (ex: NewExercise) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "custom">("search");
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedIds, setSelectedIds] = useState<MuscleId[]>([]);

  const results = useMemo(
    () => knownExercises.filter((n) => n.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  function reset() {
    setMode("search");
    setQuery("");
    setCustomName("");
    setSelectedIds([]);
  }

  function pickKnown(name: string) {
    const media = getExerciseMedia(name);
    const primaryLabel = media
      ? (Object.keys(media.highlights) as MuscleId[]).find((id) => media.highlights[id] === "primary")
      : undefined;
    onAdd({ name, muscle: primaryLabel ?? "" });
    setOpen(false);
    reset();
  }

  function toggleId(ids: MuscleId[]) {
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  }

  function confirmCustom() {
    if (!customName.trim() || selectedIds.length === 0) return;
    registerCustomExercise(customName.trim(), {
      view: customView,
      highlights: customHighlights,
      equipment: "Sin especificar",
      instructions: "Ejercicio agregado manualmente — todavía no tiene una técnica de ejecución guardada.",
    });
    onAdd({ name: customName.trim(), muscle: "" });
    setOpen(false);
    reset();
  }

  const customView = selectedIds.length > 0 ? viewForIds(selectedIds) : "anterior";
  const customHighlights = Object.fromEntries(selectedIds.map((id) => [id, "primary"])) as Record<MuscleId, "primary">;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <button className="mt-4 mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-bold text-primary">
          <Search size={16} /> Agregar ejercicio
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm gap-3 rounded-2xl border-border bg-card">
        {mode === "search" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-foreground">Agregar ejercicio</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar ejercicio..."
                className="rounded-xl bg-secondary pl-9"
              />
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {results.map((name) => (
                <button
                  key={name}
                  onClick={() => pickKnown(name)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {name}
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-2.5 py-4 text-center text-xs text-muted-foreground">Sin resultados para "{query}"</p>
              )}
            </div>
            <button
              onClick={() => setMode("custom")}
              className="rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground"
            >
              No está en la lista — crear ejercicio nuevo
            </button>
          </>
        ) : (
          <>
            <DialogHeader className="flex-row items-center gap-2 space-y-0">
              <button onClick={() => setMode("search")} className="text-muted-foreground">
                <ArrowLeft size={18} />
              </button>
              <DialogTitle className="font-display text-base font-bold text-foreground">Ejercicio nuevo</DialogTitle>
            </DialogHeader>

            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del ejercicio"
              className="rounded-xl bg-secondary"
            />

            <div>
              <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                ¿Qué músculo trabaja? (elegí uno o más)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {muscleGroupOptions.map((g) => {
                  const active = g.ids.every((id) => selectedIds.includes(id));
                  return (
                    <button
                      key={g.label}
                      onClick={() => toggleId(g.ids)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium",
                        active ? "border-primary bg-primary/15 text-primary" : "border-border bg-secondary text-muted-foreground"
                      )}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="rounded-xl bg-secondary py-2">
                <MuscleBody view={customView} highlights={customHighlights} />
              </div>
            )}

            <Button onClick={confirmCustom} disabled={!customName.trim() || selectedIds.length === 0} className="rounded-xl text-sm font-bold">
              Agregar ejercicio
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
