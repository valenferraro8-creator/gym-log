import { useEffect, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { WorkoutScreen } from "@/screens/WorkoutScreen";
import { RoutinesScreen } from "@/screens/RoutinesScreen";
import { ProgressScreen } from "@/screens/ProgressScreen";
import { AuthScreen } from "@/screens/AuthScreen";
import { useAuth } from "@/hooks/useAuth";
import { useRoutines } from "@/hooks/useRoutines";
import { saveWorkoutSession, loadLastSets } from "@/hooks/useWorkout";
import { type ExerciseEntry, type Routine } from "@/data/mock";

const STORAGE_KEY = "gym-log:active-workout";

function buildWorkoutFromRoutine(routine: Routine): ExerciseEntry[] {
  return routine.exercises.map((ex, i) => ({
    id: `${routine.id}-${i}`,
    name: ex.name,
    muscle: "",
    sets: Array.from({ length: ex.sets }, (_, s) => ({
      id: `${routine.id}-${i}-s${s}`,
      previous: "—",
      weight: "",
      reps: "",
      done: false,
    })),
  }));
}

function loadSaved(): { exercises: ExerciseEntry[]; routineName: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const { user, loading: authLoading } = useAuth();
  const { routines } = useRoutines(user);

  const [tab, setTab] = useState<Tab>("workout");
  const saved = loadSaved();
  const [exercises, setExercises] = useState<ExerciseEntry[]>(saved?.exercises ?? []);
  const [activeRoutineName, setActiveRoutineName] = useState(saved?.routineName ?? "");
  const [saving, setSaving] = useState(false);

  // Persist workout to localStorage on every change
  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ exercises, routineName: activeRoutineName }));
    }
  }, [exercises, activeRoutineName]);

  async function handleUseRoutine(routine: Routine) {
    const built = buildWorkoutFromRoutine(routine);

    // Load "anterior" from Supabase if logged in
    if (user) {
      const names = routine.exercises.map((e) => e.name);
      const lastSets = await loadLastSets(user.id, names);
      for (const ex of built) {
        const prev = lastSets[ex.name];
        if (prev) ex.sets = ex.sets.map((s) => ({ ...s, previous: prev }));
      }
    }

    setExercises(built);
    setActiveRoutineName(routine.name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ exercises: built, routineName: routine.name }));
    setTab("workout");
  }

  async function handleSaveWorkout() {
    if (!user || exercises.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      setExercises([]);
      setActiveRoutineName("");
      return;
    }

    setSaving(true);
    try {
      await saveWorkoutSession(user.id, exercises, activeRoutineName);
    } catch (e) {
      console.error("Error saving workout:", e);
    } finally {
      setSaving(false);
      localStorage.removeItem(STORAGE_KEY);
      setExercises([]);
      setActiveRoutineName("");
    }
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
                />
              )}
              {tab === "routines" && (
                <RoutinesScreen routines={routines} onUseRoutine={handleUseRoutine} />
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
