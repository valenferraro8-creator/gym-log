import type { Goal } from "@/data/mock";
import { cn } from "@/lib/utils";

export function GoalRow({ goal }: { goal: Goal }) {
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const reached = goal.current >= goal.target;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-semibold text-foreground">{goal.label}</span>
        <span className="font-tabular font-mono text-xs text-muted-foreground">
          <span className={cn("font-bold", reached ? "text-success" : "text-foreground")}>{goal.current}</span>
          {" / "}
          {goal.target}
          {goal.unit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", reached ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
