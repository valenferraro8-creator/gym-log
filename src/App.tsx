import { useEffect, useRef, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { WorkoutScreen } from "@/screens/WorkoutScreen";
import { RoutinesScreen } from "@/screens/RoutinesScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { AuthScreen } from "@/screens/AuthScreen";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines, type RoutineExerciseInput } from "@/hooks/useRoutines";
import { saveWorkoutSession, loadLastSets, type PreviousSets } from "@/hooks/useWorkout";
import { useCustomExercises } from "@/hooks/useCustomExercises";
import { supabase } from "@/lib/supabase";
import { type ExerciseEntry, type Routine } from "@/data/mock";

const STORAGE_KEY = "gym-log:active-workout";
const UNDO_WINDOW_MS = 60_000;

type LastSaved = {
  sessionId: string;
  exercises: ExerciseEntry[];
  routineName: string;
  routineId: string;
};

function buildWorkoutFromRoutine(routine: Routine, previousSets: PreviousSets = {}): ExerciseEntry[] {
  return routine.exercises.map((ex, i) => {
    const prevForExercise = previousSets[ex.name] ?? [];
    return {
      id: `${routine.id}-${i}`,
      name: ex.name,
      muscle: "",
      sets: Array.from({ length: ex.sets }, (_, s) => ({
        id: `${routine.id}-${i}-s${s}`,
        previous: prevForExercise[s] ?? "—",
        weight: "",
        reps: "",
        done: false,
      })),
    };
  });
}

function loadSaved(): { exercises: ExerciseEntry[]; routineName: string; routineId: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Builds the routine's exercise list (name/sets/reps) from today's in-progress workout. */
function routineInputFromWorkout(exercises: ExerciseEntry[], routine: Routine): RoutineExerciseInput[] {
  return exercises.map((ex) => {
    const existing = routine.exercises.find((re) => re.name === ex.name);
    if (existing) return existing;
    return { name: ex.name, sets: ex.sets.length || 1, reps: "8-12" };
  });
}

function sameExerciseNames(a: { name: string }[], b: { name: string }[]) {
  if (a.length !== b.length) return false;
  const namesB = b.map((x) => x.name);
  return a.every((x) => namesB.includes(x.name)) && b.every((x) => a.some((y) => y.name === x.name));
}

function App() {
  const { user, loading: authLoading } = useAuth();
  const { routines, create: createRoutine, update: updateRoutine, remove: removeRoutine } = useRoutines(user);
  const { customNames: customExerciseNames, create: createCustomExercise } = useCustomExercises(user);

  const [tab, setTab] = useState<Tab>("workout");
  const saved = loadSaved();
  const [exercises, setExercises] = useState<ExerciseEntry[]>(saved?.exercises ?? []);
  const [activeRoutineName, setActiveRoutineName] = useState(saved?.routineName ?? "");
  const [activeRoutineId, setActiveRoutineId] = useState(saved?.routineId ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<LastSaved | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist workout to localStorage on every change
  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ exercises, routineName: activeRoutineName, routineId: activeRoutineId })
      );
    }
  }, [exercises, activeRoutineName, activeRoutineId]);

  // Registro -> Rutina: if exercises are added/removed from today's workout while a
  // routine is active, mirror that exercise list back into the routine in Supabase.
  useEffect(() => {
    if (!activeRoutineId) return;
    const routine = routines.find((r) => r.id === activeRoutineId);
    if (!routine) return;
    if (sameExerciseNames(exercises, routine.exercises)) return;

    updateRoutine(routine.id, routine.name, routine.tag, routineInputFromWorkout(exercises, routine));
    // Only react to changes in the workout's own exercise list here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises]);

  // Rutina -> Registro: if the active routine is edited (exercises added/removed),
  // mirror that into today's in-progress workout, keeping sets already logged.
  useEffect(() => {
    if (!activeRoutineId) return;
    const routine = routines.find((r) => r.id === activeRoutineId);
    if (!routine) return;

    setExercises((prev) => {
      if (sameExerciseNames(prev, routine.exercises)) return prev;

      const routineNames = routine.exercises.map((re) => re.name);
      // Keep exercises still in the routine, or ones with sets already logged today
      // (so removing an exercise from the routine mid-workout doesn't drop your data).
      const kept = prev.filter((ex) => routineNames.includes(ex.name) || ex.sets.some((s) => s.done));
      const keptNames = kept.map((ex) => ex.name);
      const added: ExerciseEntry[] = routine.exercises
        .filter((re) => !keptNames.includes(re.name))
        .map((re, i) => ({
          id: `${routine.id}-sync-${Date.now()}-${i}`,
          name: re.name,
          muscle: "",
          sets: Array.from({ length: re.sets }, (_, s) => ({
            id: `${routine.id}-sync-${Date.now()}-${i}-s${s}`,
            previous: "—",
            weight: "",
            reps: "",
            done: false,
          })),
        }));
      return [...kept, ...added];
    });
  }, [routines, activeRoutineId]);

  function clearUndoTimer() {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  async function handleUseRoutine(routine: Routine) {
    clearUndoTimer();
    setLastSaved(null);

    let previousSets: PreviousSets = {};
    if (user) {
      const names = routine.exercises.map((e) => e.name);
      previousSets = await loadLastSets(user.id, names);
    }

    const built = buildWorkoutFromRoutine(routine, previousSets);
    setExercises(built);
    setActiveRoutineName(routine.name);
    setActiveRoutineId(routine.id);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ exercises: built, routineName: routine.name, routineId: routine.id })
    );
    setTab("workout");
  }

  async function handleSaveWorkout() {
    if (!user || exercises.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      setExercises([]);
      setActiveRoutineName("");
      setActiveRoutineId("");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const session = await saveWorkoutSession(user.id, exercises, activeRoutineName, activeRoutineId || null);
      clearUndoTimer();
      setLastSaved({ sessionId: session.id, exercises, routineName: activeRoutineName, routineId: activeRoutineId });
      undoTimerRef.current = setTimeout(() => setLastSaved(null), UNDO_WINDOW_MS);
      // Only clear the in-progress workout once it's actually confirmed saved —
      // if the insert above throws, the draft stays in state/localStorage so
      // nothing is lost and the user can just try saving again.
      localStorage.removeItem(STORAGE_KEY);
      setExercises([]);
      setActiveRoutineName("");
      setActiveRoutineId("");
    } catch (e) {
      console.error("Error saving workout:", e);
      setSaveError("No se pudo guardar el registro. Revisá tu conexión e intentá de nuevo — no se perdió nada.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUndoSave() {
    if (!lastSaved) return;
    clearUndoTimer();
    try {
      await supabase.from("workout_sessions").delete().eq("id", lastSaved.sessionId);
    } catch (e) {
      console.error("Error undoing save:", e);
    }
    setExercises(lastSaved.exercises);
    setActiveRoutineName(lastSaved.routineName);
    setActiveRoutineId(lastSaved.routineId);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ exercises: lastSaved.exercises, routineName: lastSaved.routineName, routineId: lastSaved.routineId })
    );
    setLastSaved(null);
  }

  if (authLoading) {
    return (
      <div className="app-backdrop flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-backdrop flex min-h-screen w-full items-center justify-center sm:p-8">
        <div className="phone-shell relative flex h-screen w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:w-[390px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-neutral-950 sm:shadow-2xl">
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="app-backdrop flex min-h-screen w-full items-center justify-center sm:p-8">
      <div className="phone-shell relative flex h-screen w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:w-[390px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-neutral-950 sm:shadow-2xl">
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-md px-4">
            <div key={tab} className="animate-in fade-in-0 duration-200">
              {tab === "workout" && (
                <WorkoutScreen
                  exercises={exercises}
                  setExercises={setExercises}
                  routineName={activeRoutineName}
                  onSave={handleSaveWorkout}
                  saving={saving}
                  saveError={saveError}
                  canUndo={lastSaved !== null}
                  onUndo={handleUndoSave}
                  customExerciseNames={customExerciseNames}
                  onCreateCustomExercise={createCustomExercise}
                />
              )}
              {tab === "routines" && (
                <RoutinesScreen
                  routines={routines}
                  onUseRoutine={handleUseRoutine}
                  onCreate={createRoutine}
                  onUpdate={updateRoutine}
                  onDelete={removeRoutine}
                  hasActiveWorkout={exercises.length > 0}
                  customExerciseNames={customExerciseNames}
                />
              )}
              {tab === "progress" && <ProgressScreen />}
            </div>
          </div>
        </div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}

export default App;
