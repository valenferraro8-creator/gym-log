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

export const activeWorkout: ExerciseEntry[] = [
  {
    id: "e1",
    name: "Press banca",
    muscle: "Pecho",
    sets: [
      { id: "s1", previous: "80kg x 8", weight: "82.5", reps: "8", done: true, isPR: true },
      { id: "s2", previous: "80kg x 8", weight: "82.5", reps: "8", done: true },
      { id: "s3", previous: "80kg x 7", weight: "82.5", reps: "7", done: true },
      {
        id: "s4",
        previous: "80kg x 6",
        weight: "82.5",
        reps: "6",
        done: true,
        drops: [
          { id: "s4d1", weight: "62.5", reps: "8", done: true },
          { id: "s4d2", weight: "47.5", reps: "10", done: false },
        ],
      },
    ],
  },
  {
    id: "e2",
    name: "Press inclinado mancuernas",
    muscle: "Pecho",
    supersetGroup: "ss1",
    sets: [
      { id: "s5", previous: "26kg x 10", weight: "28", reps: "10", done: true },
      { id: "s6", previous: "26kg x 10", weight: "28", reps: "9", done: false },
    ],
  },
  {
    id: "e3",
    name: "Fondos en paralelas",
    muscle: "Tríceps",
    supersetGroup: "ss1",
    sets: [
      { id: "s7", previous: "+10kg x 12", weight: "10", reps: "12", done: true },
      { id: "s8", previous: "+10kg x 11", weight: "", reps: "", done: false },
    ],
  },
  {
    id: "e4",
    name: "Extensión de tríceps en polea",
    muscle: "Tríceps",
    sets: [
      { id: "s9", previous: "22kg x 14", weight: "", reps: "", done: false },
      { id: "s10", previous: "22kg x 12", weight: "", reps: "", done: false },
      { id: "s11", previous: "20kg x 14", weight: "", reps: "", done: false },
    ],
  },
  {
    id: "e5",
    name: "Ski Ergometer - Tirón dorsal",
    muscle: "Espalda",
    sets: [
      { id: "s12", previous: "—", weight: "", reps: "", done: false },
      { id: "s13", previous: "—", weight: "", reps: "", done: false },
    ],
  },
];

export type Routine = {
  id: string;
  name: string;
  tag: string;
  lastDone: string;
  exercises: { name: string; sets: number; reps: string }[];
};

export const routines: Routine[] = [
  {
    id: "r1",
    name: "Push Day",
    tag: "Empuje",
    lastDone: "Hace 2 días",
    exercises: [
      { name: "Press banca", sets: 4, reps: "6-8" },
      { name: "Press inclinado mancuernas", sets: 3, reps: "8-10" },
      { name: "Fondos en paralelas", sets: 3, reps: "10-12" },
      { name: "Extensión de tríceps en polea", sets: 3, reps: "12-15" },
      { name: "Elevaciones laterales", sets: 4, reps: "12-15" },
    ],
  },
  {
    id: "r2",
    name: "Pull Day",
    tag: "Tracción",
    lastDone: "Hace 4 días",
    exercises: [
      { name: "Dominadas", sets: 4, reps: "6-10" },
      { name: "Remo con barra", sets: 4, reps: "8-10" },
      { name: "Jalón al pecho", sets: 3, reps: "10-12" },
      { name: "Ski Ergometer - Tirón dorsal", sets: 3, reps: "12-15" },
      { name: "Curl de bíceps con barra", sets: 3, reps: "10-12" },
      { name: "Face pull", sets: 3, reps: "15-20" },
    ],
  },
  {
    id: "r3",
    name: "Leg Day",
    tag: "Piernas",
    lastDone: "Hace 6 días",
    exercises: [
      { name: "Sentadilla", sets: 5, reps: "5-8" },
      { name: "Peso muerto rumano", sets: 4, reps: "8-10" },
      { name: "Prensa de piernas", sets: 4, reps: "10-12" },
      { name: "Curl femoral", sets: 3, reps: "12-15" },
      { name: "Elevación de talones", sets: 4, reps: "15-20" },
    ],
  },
];

export const weightProgress = [
  { date: "1 may", weight: 75 },
  { date: "8 may", weight: 76.5 },
  { date: "15 may", weight: 77.5 },
  { date: "22 may", weight: 77 },
  { date: "29 may", weight: 79 },
  { date: "5 jun", weight: 80 },
  { date: "12 jun", weight: 80 },
  { date: "19 jun", weight: 82.5 },
  { date: "26 jun", weight: 82.5 },
];

export const weeklyVolume = [
  { week: "S1", volume: 8200 },
  { week: "S2", volume: 8900 },
  { week: "S3", volume: 8400 },
  { week: "S4", volume: 9600 },
  { week: "S5", volume: 10100 },
  { week: "S6", volume: 11200 },
];

export const exerciseStats = {
  best1RM: "97.4 kg",
  bestSet: "82.5kg x 8",
  totalVolume: "2,420 kg",
  totalSets: 4,
};

export type TrainingSession = {
  daysAgo: number;
  exercises: { name: string; sets: number }[];
};

export const recentSessions: TrainingSession[] = [
  {
    daysAgo: 1,
    exercises: [
      { name: "Press banca", sets: 4 },
      { name: "Press inclinado mancuernas", sets: 3 },
      { name: "Fondos en paralelas", sets: 3 },
      { name: "Extensión de tríceps en polea", sets: 3 },
      { name: "Elevaciones laterales", sets: 4 },
    ],
  },
  {
    daysAgo: 3,
    exercises: [
      { name: "Dominadas", sets: 4 },
      { name: "Remo con barra", sets: 4 },
      { name: "Jalón al pecho", sets: 3 },
      { name: "Curl de bíceps con barra", sets: 3 },
      { name: "Face pull", sets: 3 },
    ],
  },
  {
    daysAgo: 5,
    exercises: [
      { name: "Sentadilla", sets: 5 },
      { name: "Peso muerto rumano", sets: 4 },
      { name: "Prensa de piernas", sets: 4 },
      { name: "Curl femoral", sets: 3 },
      { name: "Elevación de talones", sets: 4 },
    ],
  },
  {
    daysAgo: 8,
    exercises: [
      { name: "Press banca", sets: 4 },
      { name: "Fondos en paralelas", sets: 3 },
      { name: "Extensión de tríceps en polea", sets: 3 },
    ],
  },
  {
    daysAgo: 9,
    exercises: [
      { name: "Dominadas", sets: 3 },
      { name: "Remo con barra", sets: 3 },
    ],
  },
];

export type Goal = {
  id: string;
  label: string;
  unit: string;
  current: number;
  target: number;
};

export const goals: Goal[] = [
  {
    id: "bench-press",
    label: "Press banca",
    unit: "kg",
    current: weightProgress[weightProgress.length - 1].weight,
    target: 100,
  },
  {
    id: "weekly-frequency",
    label: "Entrenos por semana",
    unit: "/sem",
    current: 3.5,
    target: 4,
  },
];
