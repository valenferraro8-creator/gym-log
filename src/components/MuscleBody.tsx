import { anteriorPolygons, posteriorPolygons, type MuscleId } from "@/data/bodyMapData";

export type HighlightLevel = "primary" | "secondary";
export type Highlights = Partial<Record<MuscleId, HighlightLevel>>;
export type Intensity = Partial<Record<MuscleId, number>>;

const BASE_RGB = [75, 85, 99] as const;
const MID_RGB = [251, 146, 60] as const;   // amber-400
const PRIMARY_RGB = [239, 68, 68] as const; // red-500
const PRIMARY_FILL = "#ef4444";
const SECONDARY_FILL = "#f97316";

function intensityFill(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const [from, to, pct] =
    clamped < 0.5
      ? ([BASE_RGB, MID_RGB, clamped * 2] as const)
      : ([MID_RGB, PRIMARY_RGB, (clamped - 0.5) * 2] as const);
  const r = Math.round(from[0] + (to[0] - from[0]) * pct);
  const g = Math.round(from[1] + (to[1] - from[1]) * pct);
  const b = Math.round(from[2] + (to[2] - from[2]) * pct);
  return `rgb(${r}, ${g}, ${b})`;
}

function Body({
  view,
  highlights,
  intensity,
}: {
  view: "anterior" | "posterior";
  highlights: Highlights;
  intensity?: Intensity;
}) {
  const polygons = view === "anterior" ? anteriorPolygons : posteriorPolygons;
  return (
    <svg viewBox="0 0 100 220" className="h-full w-auto">
      {polygons.map((p, i) => {
        const t = intensity?.[p.id];
        let fill: string;
        if (t !== undefined) {
          fill = intensityFill(t);
        } else {
          const level = highlights[p.id];
          fill = level === "primary" ? PRIMARY_FILL : level === "secondary" ? SECONDARY_FILL : intensityFill(0);
        }
        return <polygon key={`${p.id}-${i}`} points={p.points} fill={fill} />;
      })}
    </svg>
  );
}

export function MuscleBody({
  view,
  highlights = {},
  intensity,
}: {
  view: "anterior" | "posterior" | "both";
  highlights?: Highlights;
  intensity?: Intensity;
}) {
  return (
    <div className="flex h-56 items-center justify-center gap-3">
      {view !== "posterior" && <Body view="anterior" highlights={highlights} intensity={intensity} />}
      {view !== "anterior" && <Body view="posterior" highlights={highlights} intensity={intensity} />}
    </div>
  );
}
