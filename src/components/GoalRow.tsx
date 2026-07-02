import { useState } from "react";
import { X } from "lucide-react";
import type { Goal } from "@/data/mock";
import { IconButton } from "@/components/IconButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";

export function GoalRow({ goal, onDelete }: { goal: Goal; onDelete?: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const reached = goal.current >= goal.target;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">{goal.label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-tabular font-mono text-xs text-muted-foreground">
            <span className={cn("font-bold", reached ? "text-success" : "text-foreground")}>{goal.current}</span>
            {" / "}
            {goal.target}
            {goal.unit}
          </span>
          {onDelete && (
            <IconButton
              icon={X}
              label={`Eliminar objetivo "${goal.label}"`}
              className="h-5 w-5"
              onClick={() => setConfirmDelete(true)}
            />
          )}
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", reached ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {onDelete && (
        <ConfirmDialog
          open={confirmDelete}
          title="Eliminar objetivo"
          description={`¿Seguro que querés eliminar "${goal.label}"?`}
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete();
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
