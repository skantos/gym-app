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


// Busca grupos musculares por nombres exactos de ejercicio.
// Nota: usa coincidencia exacta; si la IA devuelve nombres distintos a tu catálogo, algunos quedarán sin mapear.
export async function fetchMuscleGroupsForExerciseNames(names: string[]): Promise<Record<string, string | undefined>> {
  if (!names.length) return {};
  // evitar listas muy grandes
  const unique = Array.from(new Set(names)).slice(0, 300);
  const { data, error } = await supabase
    .from('exercises')
    .select('name, muscle_group')
    .in('name', unique);
  if (error) throw error;
  const direct: Record<string, string | undefined> = {};
  for (const row of (data || []) as any[]) {
    if (!row?.name) continue;
    direct[String(row.name)] = row.muscle_group || undefined;
  }

  // Si cubrió todo, listo
  if (Object.keys(direct).length >= unique.length) return direct;

  // Fallback: normalizar y hacer matching difuso contra catálogo completo
  const normalize = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s]/g, '') // quitar signos
    .replace(/\s+/g, ' ') // espacios simples
    .trim();

  const { data: all, error: allErr } = await supabase
    .from('exercises')
    .select('name, muscle_group')
    .limit(2000);
  if (allErr) throw allErr;
  const dbNormMap = new Map<string, { name: string; group?: string }>();
  for (const row of (all || []) as any[]) {
    if (!row?.name) continue;
    dbNormMap.set(normalize(String(row.name)), { name: String(row.name), group: row.muscle_group || undefined });
  }

  const out: Record<string, string | undefined> = { ...direct };
  for (const reqName of unique) {
    if (out[reqName] !== undefined) continue;
    const norm = normalize(reqName);
    const hit = dbNormMap.get(norm);
    if (hit) { out[reqName] = hit.group; continue; }
    // intento contains simple
    for (const [k, v] of dbNormMap.entries()) {
      if (k.includes(norm) || norm.includes(k)) { out[reqName] = v.group; break; }
    }
    if (out[reqName] === undefined) out[reqName] = undefined;
  }
  return out;
}


