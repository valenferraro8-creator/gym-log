import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconButton } from "@/components/IconButton";
import { MuscleBody } from "@/components/MuscleBody";
import { muscleLabels, type MuscleId } from "@/data/bodyMapData";
import { getExerciseMedia } from "@/data/exerciseLibrary";

export function ExerciseInfoDialog({ name }: { name: string }) {
  const media = getExerciseMedia(name);
  const highlightedIds = media ? (Object.keys(media.highlights) as MuscleId[]) : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton icon={Info} label={`Ver músculos trabajados en ${name}`} className="h-7 w-7" />
      </DialogTrigger>
      <DialogContent className="max-w-sm gap-3 rounded-2xl border-border bg-card p-0 sm:rounded-2xl">
        {media ? (
          <div className="border-b border-border px-4 pt-5 pb-3">
            <MuscleBody view={media.view} highlights={media.highlights} />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center px-6 text-center text-xs font-medium text-muted-foreground">
            Todavía no hay diagrama guardado para este ejercicio.
          </div>
        )}

        <div className="space-y-3 px-5 pb-5">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold text-foreground">{name}</DialogTitle>
          </DialogHeader>

          {media && (
            <>
              <div>
                <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Músculos trabajados
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {highlightedIds.map((id) => {
                    const level = media.highlights[id];
                    return (
                      <span
                        key={id}
                        className={
                          level === "primary"
                            ? "rounded-full bg-[#e0473e]/15 px-2.5 py-1 text-[11.5px] font-semibold text-[#e0473e]"
                            : "rounded-full bg-[#c97a3a]/15 px-2.5 py-1 text-[11.5px] font-medium text-[#c97a3a]"
                        }
                      >
                        {muscleLabels[id]}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Equipo</p>
                <p className="text-sm text-foreground">{media.equipment}</p>
              </div>

              <div>
                <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Ejecución</p>
                <p className="text-sm leading-relaxed text-foreground">{media.instructions}</p>
              </div>

              {media.note && <p className="text-xs leading-relaxed text-muted-foreground">{media.note}</p>}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
