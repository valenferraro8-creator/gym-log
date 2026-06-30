import { muscleGroupShort, type MuscleId } from "@/data/bodyMapData";
import type { Highlights } from "@/components/MuscleBody";

export type ExerciseMedia = {
  view: "anterior" | "posterior" | "both";
  highlights: Highlights;
  equipment: string;
  instructions: string;
  note?: string;
};

function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function h(entries: [MuscleId, "primary" | "secondary"][]): Highlights {
  return Object.fromEntries(entries) as Highlights;
}

const library: Record<string, ExerciseMedia> = {
  "press banca": {
    view: "anterior",
    highlights: h([
      ["chest", "primary"],
      ["front-deltoids", "secondary"],
      ["triceps-anterior", "secondary"],
    ]),
    equipment: "Barra y banco plano",
    instructions:
      "Acostado en el banco, bajá la barra controlada hasta el pecho y empujá hacia arriba extendiendo los codos sin bloquearlos del todo.",
  },
  "press inclinado mancuernas": {
    view: "anterior",
    highlights: h([
      ["chest", "primary"],
      ["front-deltoids", "secondary"],
      ["triceps-anterior", "secondary"],
    ]),
    equipment: "Mancuernas y banco inclinado (30-45°)",
    instructions:
      "Con el banco inclinado, empujá las mancuernas hacia arriba y levemente hacia adentro, bajando hasta sentir el estiramiento en la parte alta del pecho.",
  },
  "fondos en paralelas": {
    view: "both",
    highlights: h([
      ["triceps-long", "primary"],
      ["triceps-lateral", "primary"],
      ["chest", "secondary"],
      ["front-deltoids", "secondary"],
    ]),
    equipment: "Paralelas",
    instructions:
      "Bajá el cuerpo flexionando los codos hasta 90° y empujá de nuevo hacia arriba. Inclinar el torso hacia adelante suma más pecho; mantenerlo vertical enfatiza tríceps.",
  },
  "extension de triceps en polea": {
    view: "posterior",
    highlights: h([
      ["triceps-lateral", "primary"],
      ["triceps-long", "secondary"],
      ["triceps-anterior", "secondary"],
    ]),
    equipment: "Polea alta con cuerda o barra recta",
    instructions:
      "Codos fijos al costado del torso, extendé los antebrazos hacia abajo sin mover los hombros. El agarre con barra recta enfatiza más la cabeza lateral.",
    note: "La cabeza medial del tríceps participa pero no es visible desde la superficie en este diagrama.",
  },
  "ski ergometer - tiron dorsal": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["back-deltoids", "secondary"],
      ["biceps", "secondary"],
    ]),
    equipment: "Polea doble / ergómetro de esquí",
    instructions:
      "De pie, tronco inclinado hacia adelante. Tirá ambos cables hacia abajo y atrás extendiendo los brazos, simulando el remo de esquí de fondo.",
  },
  dominadas: {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["biceps", "secondary"],
      ["back-deltoids", "secondary"],
      ["trapezius", "secondary"],
    ]),
    equipment: "Barra de dominadas",
    instructions:
      "Colgado de la barra con agarre prono, tirá el cuerpo hacia arriba hasta que el mentón pase la barra, controlando la bajada.",
  },
  "remo con barra": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["lower-back", "secondary"],
      ["biceps", "secondary"],
      ["back-deltoids", "secondary"],
      ["trapezius", "secondary"],
    ]),
    equipment: "Barra olímpica",
    instructions:
      "Tronco inclinado hacia adelante con espalda neutra, tirá la barra hacia el abdomen llevando los codos hacia atrás.",
  },
  "jalon al pecho": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["biceps", "secondary"],
      ["back-deltoids", "secondary"],
      ["trapezius", "secondary"],
    ]),
    equipment: "Polea alta con barra ancha",
    instructions:
      "Sentado, tirá la barra hacia la parte alta del pecho llevando los codos hacia abajo y atrás, sin balancear el torso.",
  },
  "curl de biceps con barra": {
    view: "anterior",
    highlights: h([
      ["biceps", "primary"],
      ["forearm", "secondary"],
    ]),
    equipment: "Barra recta o Z",
    instructions:
      "De pie, codos fijos al costado del torso, flexioná los antebrazos llevando la barra hacia los hombros sin balancear el cuerpo.",
  },
  "face pull": {
    view: "posterior",
    highlights: h([
      ["back-deltoids", "primary"],
      ["trapezius", "secondary"],
      ["upper-back", "secondary"],
    ]),
    equipment: "Polea con cuerda, a la altura de la cara",
    instructions:
      "Tirá la cuerda hacia la cara separando las manos, llevando los codos hacia atrás y arriba para activar la espalda alta.",
  },
  sentadilla: {
    view: "both",
    highlights: h([
      ["quad-rectus", "primary"],
      ["quad-vastus-lateral", "primary"],
      ["quad-vastus-medial", "primary"],
      ["glutes", "secondary"],
      ["adductors", "secondary"],
      ["lower-back", "secondary"],
    ]),
    equipment: "Barra olímpica y rack",
    instructions:
      "Con la barra sobre la espalda alta, bajá flexionando caderas y rodillas hasta los muslos paralelos al piso, manteniendo el pecho erguido.",
  },
  "peso muerto rumano": {
    view: "posterior",
    highlights: h([
      ["hamstring-biceps-femoris", "primary"],
      ["hamstring-medial", "primary"],
      ["glutes", "secondary"],
      ["lower-back", "secondary"],
    ]),
    equipment: "Barra olímpica",
    instructions:
      "Con rodillas semiflexionadas, bajá la barra pegada a las piernas llevando la cadera hacia atrás, hasta sentir el estiramiento en isquiotibiales.",
  },
  "prensa de piernas": {
    view: "both",
    highlights: h([
      ["quad-rectus", "primary"],
      ["quad-vastus-lateral", "primary"],
      ["quad-vastus-medial", "primary"],
      ["glutes", "secondary"],
      ["adductors", "secondary"],
    ]),
    equipment: "Máquina de prensa",
    instructions:
      "Apoyá los pies en la plataforma a la altura de los hombros y empujá extendiendo las rodillas sin bloquearlas del todo.",
  },
  "curl femoral": {
    view: "posterior",
    highlights: h([
      ["hamstring-biceps-femoris", "primary"],
      ["hamstring-medial", "primary"],
      ["calf-lateral", "secondary"],
      ["calf-medial", "secondary"],
    ]),
    equipment: "Máquina de curl femoral",
    instructions:
      "Acostado o sentado en la máquina, flexioná las rodillas llevando el rodillo hacia los glúteos de forma controlada.",
  },
  "elevacion de talones": {
    view: "posterior",
    highlights: h([
      ["calf-lateral", "primary"],
      ["calf-medial", "primary"],
      ["soleus", "secondary"],
    ]),
    equipment: "Máquina de pantorrillas o step",
    instructions:
      "De pie, elevá los talones lo más alto posible apoyando solo la punta del pie, y bajá controlado hasta el estiramiento completo.",
  },
  "elevaciones laterales": {
    view: "both",
    highlights: h([
      ["front-deltoids", "secondary"],
      ["back-deltoids", "secondary"],
      ["trapezius", "secondary"],
    ]),
    equipment: "Mancuernas",
    instructions:
      "De pie, elevá los brazos hacia los costados hasta la altura de los hombros con una leve flexión de codos, sin usar impulso.",
    note: "El deltoides lateral (cabeza media) es el motor principal — no tiene polígono propio en este diagrama. Los deltoides anterior y posterior asisten; el trapecio superior eleva la escápula.",
  },
};

export const knownExercises: string[] = [
  "Press banca",
  "Press inclinado mancuernas",
  "Fondos en paralelas",
  "Extensión de tríceps en polea",
  "Ski Ergometer - Tirón dorsal",
  "Dominadas",
  "Remo con barra",
  "Jalón al pecho",
  "Curl de bíceps con barra",
  "Face pull",
  "Sentadilla",
  "Peso muerto rumano",
  "Prensa de piernas",
  "Curl femoral",
  "Elevación de talones",
  "Elevaciones laterales",
];

const customRegistry: Record<string, ExerciseMedia> = {};

export function registerCustomExercise(name: string, media: ExerciseMedia) {
  customRegistry[normalize(name)] = media;
}

export function getExerciseMedia(name: string): ExerciseMedia | undefined {
  return library[normalize(name)] ?? customRegistry[normalize(name)];
}

export function getPrimaryMuscleLabel(name: string): string | undefined {
  const media = getExerciseMedia(name);
  if (!media) return undefined;
  const primaryId = (Object.keys(media.highlights) as MuscleId[]).find((id) => media.highlights[id] === "primary");
  return primaryId ? muscleGroupShort[primaryId] : undefined;
}
