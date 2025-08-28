import { supabase } from './supabase';

export type Exercise = {
  id: string;
  category_id: string | null;
  name: string;
  description?: string | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
  equipment?: string | null;
  muscle_group?: string | null; // ejemplo: 'chest','back','quadriceps'
};

export async function fetchExercisesByMuscles(
  muscleGroups: string[],
  difficulty?: Exercise['difficulty'],
  allowedEquipment?: string[]
): Promise<Exercise[]> {
  let query = supabase
    .from('exercises')
    .select('*')
    .in('muscle_group', muscleGroups);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  if (allowedEquipment && allowedEquipment.length > 0) {
    query = query.in('equipment', allowedEquipment);
  }

  const { data, error } = await query.limit(500);
  if (error) throw error;
  return (data ?? []) as Exercise[];
}

export async function fetchExercisesMapByMuscle(
  muscleGroups: string[],
  difficulty?: Exercise['difficulty'],
  allowedEquipment?: string[]
): Promise<Record<string, Exercise[]>> {
  const all = await fetchExercisesByMuscles(muscleGroups, difficulty, allowedEquipment);
  const map: Record<string, Exercise[]> = {};
  for (const ex of all) {
    const key = (ex.muscle_group ?? 'other').toLowerCase();
    if (!map[key]) map[key] = [];
    map[key].push(ex);
  }
  return map;
}

export async function seedExercisesIfEmpty(seed: Array<Omit<Exercise, 'id'>>): Promise<number> {
  const { count, error } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return 0;

  const { error: insErr } = await supabase.from('exercises').insert(seed);
  if (insErr) throw insErr;
  return seed.length;
}


