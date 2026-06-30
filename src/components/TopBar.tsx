export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-40 -mx-4 mb-3 bg-gradient-to-b from-background via-background/95 to-background/0 px-4 pb-3 pt-[calc(0.9rem+env(safe-area-inset-top))] backdrop-blur-xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-0.5 text-xs font-medium text-muted-foreground">{subtitle}</p>}
    </header>
  );
}
