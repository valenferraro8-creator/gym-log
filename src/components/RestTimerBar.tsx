import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_REST_SECONDS = 90;

/**
 * Rest countdown between sets. Controlled via `startSignal`: bump it (e.g. a
 * counter incremented on every "set marked done") to (re)start a fresh timer.
 * Renders nothing until the first signal, and nothing again once dismissed.
 */
export function RestTimerBar({ startSignal }: { startSignal: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [total, setTotal] = useState(DEFAULT_REST_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstRender = useRef(true);

  function clearTick() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function tick() {
    clearTick();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearTick();
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setTotal(DEFAULT_REST_SECONDS);
    setSecondsLeft(DEFAULT_REST_SECONDS);
    tick();
    // Only the signal bump should (re)start the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSignal]);

  useEffect(() => clearTick, []);

  function adjust(delta: number) {
    setSecondsLeft((prev) => {
      if (prev === null) return null;
      const next = Math.max(0, prev + delta);
      if (next > 0 && !intervalRef.current) tick();
      setTotal((t) => Math.max(t, next));
      return next;
    });
  }

  function dismiss() {
    clearTick();
    setSecondsLeft(null);
  }

  if (secondsLeft === null) return null;

  const pct = total > 0 ? Math.max(0, Math.min(100, (secondsLeft / total) * 100)) : 0;
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const isDone = secondsLeft === 0;

  return (
    <div
      className={cn(
        "shadow-card sticky bottom-2 z-30 mb-3 rounded-2xl border border-border bg-card p-3.5 backdrop-blur-xl",
        isDone && "border-success/50 bg-success/10"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
          {isDone ? "¡Descanso terminado!" : "Descanso"}
        </span>
        <span className="font-tabular font-mono text-lg font-black text-foreground">
          {mm}:{String(ss).padStart(2, "0")}
        </span>
      </div>
      <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all", isDone ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => adjust(15)}
          className="flex-1 rounded-lg py-1.5 text-xs font-bold"
        >
          +15s
        </Button>
        <Button variant="secondary" onClick={dismiss} className="flex-1 rounded-lg py-1.5 text-xs font-bold">
          {isDone ? "Cerrar" : "Saltar"}
        </Button>
      </div>
    </div>
  );
}
