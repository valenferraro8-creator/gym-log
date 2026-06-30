import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon: LucideIcon;
    label: string;
    className?: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>
>(({ icon: Icon, label, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      {...props}
    >
      <Icon size={18} strokeWidth={1.8} />
    </button>
  );
});
IconButton.displayName = "IconButton";
