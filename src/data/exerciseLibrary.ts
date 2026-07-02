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
  "press de banca con mancuernas": {
    view: "anterior",
    highlights: h([
      ["chest", "primary"],
      ["front-deltoids", "secondary"],
      ["triceps-anterior", "secondary"],
    ]),
    equipment: "Mancuernas y banco plano",
    instructions:
      "Acostado en el banco, bajá las mancuernas a los costados del pecho y empujá hacia arriba juntándolas levemente en la parte alta.",
  },
  "aperturas con mancuernas": {
    view: "anterior",
    highlights: h([
      ["chest", "primary"],
      ["front-deltoids", "secondary"],
    ]),
    equipment: "Mancuernas y banco",
    instructions:
      "Con los brazos semiflexionados, abrí las mancuernas hacia los costados en arco hasta sentir el estiramiento del pecho y volvé juntándolas arriba.",
  },
  "press militar con barra": {
    view: "anterior",
    highlights: h([
      ["front-deltoids", "primary"],
      ["triceps-anterior", "secondary"],
      ["trapezius", "secondary"],
    ]),
    equipment: "Barra y rack",
    instructions:
      "De pie o sentado, empujá la barra desde los hombros hasta arriba de la cabeza en línea recta, sin arquear la espalda baja.",
  },
  "press militar con mancuernas": {
    view: "anterior",
    highlights: h([
      ["front-deltoids", "primary"],
      ["triceps-anterior", "secondary"],
    ]),
    equipment: "Mancuernas",
    instructions:
      "Sentado o de pie, empujá las mancuernas hacia arriba desde la altura de los hombros hasta extender los codos sin bloquearlos del todo.",
  },
  "elevaciones frontales": {
    view: "anterior",
    highlights: h([["front-deltoids", "primary"]]),
    equipment: "Mancuernas o barra",
    instructions:
      "De pie, elevá el peso al frente hasta la altura de los hombros con los brazos casi extendidos, sin balancear el torso.",
  },
  "remo al menton": {
    view: "both",
    highlights: h([
      ["trapezius", "primary"],
      ["front-deltoids", "secondary"],
    ]),
    equipment: "Barra o polea baja",
    instructions:
      "De pie, tirá la barra hacia arriba pegada al cuerpo hasta la altura del pecho, llevando los codos por encima de las manos.",
  },
  "curl martillo": {
    view: "anterior",
    highlights: h([
      ["biceps", "primary"],
      ["forearm", "secondary"],
    ]),
    equipment: "Mancuernas",
    instructions:
      "De pie, con agarre neutro (palmas enfrentadas), flexioná los antebrazos llevando las mancuernas hacia los hombros sin girar la muñeca.",
  },
  "curl concentrado": {
    view: "anterior",
    highlights: h([["biceps", "primary"]]),
    equipment: "Mancuerna y banco",
    instructions:
      "Sentado, apoyá el codo en la cara interna del muslo y flexioná el antebrazo llevando la mancuerna hacia el hombro sin mover el brazo.",
  },
  "curl en banco scott": {
    view: "anterior",
    highlights: h([
      ["biceps", "primary"],
      ["forearm", "secondary"],
    ]),
    equipment: "Banco Scott y barra Z",
    instructions:
      "Con los brazos apoyados sobre el banco inclinado, flexioná los antebrazos sin despegar los tríceps del apoyo hasta arriba.",
  },
  "press frances": {
    view: "posterior",
    highlights: h([
      ["triceps-long", "primary"],
      ["triceps-lateral", "primary"],
    ]),
    equipment: "Barra Z o mancuernas y banco",
    instructions:
      "Acostado, bajá el peso controlado hacia la frente flexionando solo los codos, y extendé los antebrazos sin mover los brazos de posición.",
  },
  "patada de triceps": {
    view: "posterior",
    highlights: h([
      ["triceps-long", "primary"],
      ["triceps-lateral", "secondary"],
    ]),
    equipment: "Mancuerna y banco",
    instructions:
      "Tronco inclinado y brazo pegado al costado, extendé el antebrazo hacia atrás hasta trabar el codo y volvé controlado.",
  },
  "fondos en banco": {
    view: "posterior",
    highlights: h([
      ["triceps-lateral", "primary"],
      ["triceps-long", "secondary"],
    ]),
    equipment: "Banco",
    instructions:
      "Con las manos apoyadas en el borde del banco y piernas extendidas, bajá el cuerpo flexionando los codos y empujá de nuevo hacia arriba.",
  },
  "remo con mancuerna": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["biceps", "secondary"],
      ["back-deltoids", "secondary"],
    ]),
    equipment: "Mancuerna y banco",
    instructions:
      "Apoyado con una mano y rodilla en el banco, tirá la mancuerna hacia la cadera llevando el codo hacia atrás, sin rotar el torso.",
  },
  "remo en polea baja": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["biceps", "secondary"],
      ["trapezius", "secondary"],
    ]),
    equipment: "Polea baja con agarre en V",
    instructions:
      "Sentado con espalda recta, tirá el agarre hacia el abdomen llevando los codos atrás y juntando los omóplatos.",
  },
  "remo invertido": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["biceps", "secondary"],
      ["back-deltoids", "secondary"],
    ]),
    equipment: "Barra en rack bajo o TRX",
    instructions:
      "Colgado bajo la barra con el cuerpo recto, tirá el pecho hacia la barra llevando los codos hacia atrás y bajá controlado.",
  },
  "pull-over con mancuerna": {
    view: "both",
    highlights: h([
      ["upper-back", "primary"],
      ["chest", "secondary"],
      ["triceps-long", "secondary"],
    ]),
    equipment: "Mancuerna y banco",
    instructions:
      "Acostado transversal al banco, bajá la mancuerna en arco por detrás de la cabeza y volvé llevándola sobre el pecho sin flexionar mucho los codos.",
  },
  zancadas: {
    view: "both",
    highlights: h([
      ["quad-rectus", "primary"],
      ["glutes", "secondary"],
      ["hamstring-biceps-femoris", "secondary"],
    ]),
    equipment: "Mancuernas o barra",
    instructions:
      "Dando un paso largo hacia adelante, bajá hasta que ambas rodillas formen 90° y empujá con la pierna delantera para volver a la posición inicial.",
  },
  "sentadilla bulgara": {
    view: "both",
    highlights: h([
      ["quad-rectus", "primary"],
      ["quad-vastus-lateral", "primary"],
      ["glutes", "secondary"],
    ]),
    equipment: "Mancuernas y banco",
    instructions:
      "Con el pie trasero apoyado sobre un banco, bajá flexionando la pierna delantera hasta el paralelo y empujá para volver arriba.",
  },
  "hip thrust": {
    view: "posterior",
    highlights: h([
      ["glutes", "primary"],
      ["hamstring-biceps-femoris", "secondary"],
    ]),
    equipment: "Barra y banco",
    instructions:
      "Con la espalda apoyada en el banco y la barra sobre la cadera, empujá extendiendo las caderas hasta formar una línea recta con el torso.",
  },
  "peso muerto convencional": {
    view: "posterior",
    highlights: h([
      ["hamstring-biceps-femoris", "primary"],
      ["hamstring-medial", "primary"],
      ["glutes", "primary"],
      ["lower-back", "secondary"],
    ]),
    equipment: "Barra olímpica",
    instructions:
      "Con la barra pegada a las piernas y espalda neutra, extendé caderas y rodillas al mismo tiempo hasta quedar completamente de pie.",
  },
  "extension de cuadriceps": {
    view: "anterior",
    highlights: h([
      ["quad-rectus", "primary"],
      ["quad-vastus-lateral", "primary"],
      ["quad-vastus-medial", "primary"],
    ]),
    equipment: "Máquina de extensión de cuádriceps",
    instructions:
      "Sentado en la máquina, extendé las rodillas hasta casi trabarlas y bajá controlado sin soltar el peso de golpe.",
  },
  "aductores en maquina": {
    view: "anterior",
    highlights: h([["adductors", "primary"]]),
    equipment: "Máquina de aductores",
    instructions: "Sentado en la máquina, juntá las piernas contra la resistencia y volvé controlado a la posición abierta.",
  },
  "abductores en maquina": {
    view: "posterior",
    highlights: h([["hip-abductors", "primary"]]),
    equipment: "Máquina de abductores",
    instructions: "Sentado en la máquina, separá las piernas contra la resistencia y volvé controlado a la posición cerrada.",
  },
  "gemelos sentado": {
    view: "posterior",
    highlights: h([
      ["soleus", "primary"],
      ["calf-lateral", "secondary"],
      ["calf-medial", "secondary"],
    ]),
    equipment: "Máquina de gemelos sentado",
    instructions:
      "Sentado con las rodillas flexionadas a 90°, elevá los talones lo más alto posible y bajá controlado hasta el estiramiento completo.",
    note: "Con la rodilla flexionada, el sóleo trabaja más que el gastrocnemio (que se activa más con la pierna extendida).",
  },
  "plancha abdominal": {
    view: "anterior",
    highlights: h([
      ["abs", "primary"],
      ["obliques", "secondary"],
    ]),
    equipment: "Peso corporal",
    instructions:
      "Apoyado en antebrazos y punta de los pies, mantené el cuerpo en línea recta desde los hombros hasta los tobillos sin dejar caer la cadera.",
  },
  "crunch abdominal": {
    view: "anterior",
    highlights: h([["abs", "primary"]]),
    equipment: "Colchoneta",
    instructions:
      "Acostado con rodillas flexionadas, levantá los hombros del piso llevando las costillas hacia la pelvis, sin tirar del cuello.",
  },
  "elevacion de piernas colgado": {
    view: "anterior",
    highlights: h([
      ["abs", "primary"],
      ["obliques", "secondary"],
    ]),
    equipment: "Barra de dominadas",
    instructions:
      "Colgado de la barra, elevá las piernas (rectas o flexionadas) hasta la altura de la cadera controlando el balanceo del cuerpo.",
  },
  "rueda abdominal": {
    view: "both",
    highlights: h([
      ["abs", "primary"],
      ["obliques", "secondary"],
      ["lower-back", "secondary"],
    ]),
    equipment: "Rueda abdominal",
    instructions:
      "De rodillas, rodá la rueda hacia adelante manteniendo el core firme y volvé a la posición inicial sin arquear la espalda baja.",
  },
};

export const knownExercises: string[] = [
  "Press banca",
  "Press de banca con mancuernas",
  "Press inclinado mancuernas",
  "Aperturas con mancuernas",
  "Fondos en paralelas",
  "Fondos en banco",
  "Extensión de tríceps en polea",
  "Press francés",
  "Patada de tríceps",
  "Press militar con barra",
  "Press militar con mancuernas",
  "Elevaciones frontales",
  "Elevaciones laterales",
  "Remo al mentón",
  "Ski Ergometer - Tirón dorsal",
  "Dominadas",
  "Remo con barra",
  "Remo con mancuerna",
  "Remo en polea baja",
  "Remo invertido",
  "Pull-over con mancuerna",
  "Jalón al pecho",
  "Face pull",
  "Curl de bíceps con barra",
  "Curl martillo",
  "Curl concentrado",
  "Curl en banco Scott",
  "Sentadilla",
  "Sentadilla búlgara",
  "Zancadas",
  "Peso muerto rumano",
  "Peso muerto convencional",
  "Hip thrust",
  "Prensa de piernas",
  "Extensión de cuádriceps",
  "Curl femoral",
  "Aductores en máquina",
  "Abductores en máquina",
  "Elevación de talones",
  "Gemelos sentado",
  "Plancha abdominal",
  "Crunch abdominal",
  "Elevación de piernas colgado",
  "Rueda abdominal",
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
