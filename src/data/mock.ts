export type DropSet = {
  id: string;
  weight: string;
  reps: string;
  done: boolean;
};

export type SetEntry = {
  id: string;
  previous: string;
  weight: string;
  reps: string;
  done: boolean;
  isPR?: boolean;
  drops?: DropSet[];
};

export type ExerciseEntry = {
  id: string;
  name: string;
  muscle: string;
  supersetGroup?: string;
  sets: SetEntry[];
};

export type Routine = {
  id: string;
  name: string;
  tag: string;
  lastDone: string;
  exercises: { name: string; sets: number; reps: string }[];
};

export type TrainingSession = {
  daysAgo: number;
  exercises: { name: string; sets: number }[];
};

export type Goal = {
  id: string;
  label: string;
  unit: string;
  current: number;
  target: number;
};
