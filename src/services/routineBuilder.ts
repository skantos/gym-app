import { Exercise, fetchExercisesMapByMuscle } from './exercises';

export type RoutineDay = {
  day: string;
  muscleFocus: string[];
  exercises: Array<{ name: string; sets: number; reps: number; rest_seconds: number; muscle_group?: string }>
};

export type RoutinePlan = {
  name: string;
  description?: string;
  days: RoutineDay[];
};

type SplitType = 'upper_lower' | 'push_pull_legs' | 'full_body';

// Selección simple de split en base a días disponibles
export function pickSplit(daysPerWeek: number | null | undefined): SplitType {
  if (!daysPerWeek || daysPerWeek <= 3) return 'full_body';
  if (daysPerWeek === 4) return 'upper_lower';
  return 'push_pull_legs';
}

function sample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function defaultRepRange(experience?: 'beginner' | 'intermediate' | 'advanced' | ''): number {
  switch (experience) {
    case 'advanced': return 6;
    case 'intermediate': return 8;
    default: return 10;
  }
}

export async function buildRoutineFromDB(params: {
  muscleGroups: string[];
  daysPerWeek: number | null | undefined;
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  equipmentAccess?: 'full_gym' | 'home_dumbbells_bands' | 'bodyweight' | '';
}): Promise<RoutinePlan> {
  const split = pickSplit(params.daysPerWeek);
  const equip = params.equipmentAccess === 'full_gym' ? undefined
    : params.equipmentAccess === 'home_dumbbells_bands' ? ['dumbbells','bands']
    : params.equipmentAccess === 'bodyweight' ? ['bodyweight']
    : undefined;
  const map = await fetchExercisesMapByMuscle(params.muscleGroups, params.experience || undefined, equip);

  const rep = defaultRepRange(params.experience);
  const rest = 60;

  // Helpers
  const getFor = (key: string, n: number): Exercise[] => sample(map[key] || [], n);

  const days: RoutineDay[] = [];

  if (split === 'full_body') {
    // 3 días (o hasta daysPerWeek) con selección balanceada
    const numDays = Math.min(Math.max(params.daysPerWeek ?? 3, 2), 4);
    const templates = [
      { day: 'Día 1', focus: ['quadriceps','chest','upper-back','abs'] },
      { day: 'Día 2', focus: ['hamstring','deltoids','biceps','obliques'] },
      { day: 'Día 3', focus: ['gluteal','triceps','lats','core'] },
      { day: 'Día 4', focus: ['calves','chest','upper-back','abs'] },
    ];
    for (let i = 0; i < numDays; i++) {
      const t = templates[i];
      // Dar prioridad a objetivos del usuario: 2 ejercicios por grupo objetivo, 1 por el resto
      const picksRaw: Exercise[] = [];
      for (const m of t.focus) {
        const isObjective = params.muscleGroups.includes(m);
        const count = isObjective ? 2 : 1;
        picksRaw.push(...getFor(m, count));
      }
      // Asegurar 5-6 ejercicios por sesión
      let picks = picksRaw;
      if (picks.length < 5) {
        // completar con grupos objetivo globales
        for (const m of params.muscleGroups) {
          if (picks.length >= 5) break;
          picks.push(...getFor(m, 1));
        }
      }
      if (picks.length > 6) {
        picks = picks.slice(0, 6);
      }
      const exs = picks.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined }));
      days.push({ day: t.day, muscleFocus: t.focus, exercises: exs });
    }
  }

  if (split === 'upper_lower') {
    const upper1 = ['chest','upper-back','deltoids','biceps','triceps'];
    const lower1 = ['quadriceps','hamstring','gluteal','calves','abs'];
    const d1 = upper1.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : (m === 'chest' || m === 'upper-back' ? 2 : 1)));
    const d2 = lower1.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : (m === 'quadriceps' ? 2 : 1)));
    const d3 = upper1.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : 1));
    const d4 = lower1.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : 1));
    days.push(
      { day: 'Upper A', muscleFocus: upper1, exercises: d1.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Lower A', muscleFocus: lower1, exercises: d2.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Upper B', muscleFocus: upper1, exercises: d3.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Lower B', muscleFocus: lower1, exercises: d4.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
    );
  }

  if (split === 'push_pull_legs') {
    const push = ['chest','deltoids','triceps'];
    const pull = ['upper-back','biceps','forearm'];
    const legs = ['quadriceps','hamstring','gluteal','calves','abs'];
    const d1 = push.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : (m === 'chest' ? 2 : 1)));
    const d2 = pull.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : (m === 'upper-back' ? 2 : 1)));
    const d3 = legs.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : (m === 'quadriceps' ? 2 : 1)));
    const d4 = push.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : 1));
    const d5 = pull.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : 1));
    const d6 = legs.flatMap((m) => getFor(m, params.muscleGroups.includes(m) ? 2 : 1));
    days.push(
      { day: 'Push A', muscleFocus: push, exercises: d1.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Pull A', muscleFocus: pull, exercises: d2.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Legs A', muscleFocus: legs, exercises: d3.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Push B', muscleFocus: push, exercises: d4.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Pull B', muscleFocus: pull, exercises: d5.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
      { day: 'Legs B', muscleFocus: legs, exercises: d6.map((e) => ({ name: e.name, sets: 3, reps: rep, rest_seconds: rest, muscle_group: e.muscle_group || undefined })) },
    );
  }

  const plan: RoutinePlan = {
    name: 'Rutina estructurada con BD',
    description: 'Generada a partir de grupos musculares y dificultad usando base de datos',
    days,
  };
  return plan;
}


