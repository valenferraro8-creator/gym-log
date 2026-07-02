import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  confirmVariant = "destructive",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 px-6" onClick={onCancel}>
      <div
        className="shadow-card w-full max-w-sm rounded-2xl border border-border bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1 rounded-xl text-sm font-semibold" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={confirmVariant} className="flex-1 rounded-xl text-sm font-semibold" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
