export function HeroStat({
  label,
  value,
  unit,
  caption,
}: {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
}) {
  return (
    <div>
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-tabular font-hero mt-0.5 text-5xl font-black leading-none tracking-tight text-foreground">
        {value}
        {unit && <span className="ml-1.5 text-lg font-semibold text-muted-foreground">{unit}</span>}
      </p>
      {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
