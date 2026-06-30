import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <Icon size={18} strokeWidth={1.8} />
    </button>
  );
}
