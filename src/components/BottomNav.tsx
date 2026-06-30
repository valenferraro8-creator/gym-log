import { Dumbbell, ListChecks, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "workout" | "routines" | "progress";

const items: { id: Tab; label: string; icon: typeof Dumbbell }[] = [
  { id: "workout", label: "Registro", icon: Dumbbell },
  { id: "routines", label: "Rutinas", icon: ListChecks },
  { id: "progress", label: "Progreso", icon: LineChart },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex shrink-0 border-t border-border bg-[hsl(222,13%,9%)]/95 backdrop-blur-xl">
      {items.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.4 : 1.8}
              className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
            />
            <span
              className={cn(
                "text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
