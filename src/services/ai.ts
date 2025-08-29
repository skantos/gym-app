import Constants from 'expo-constants';
import { supabase } from './supabase';

const extra = (Constants.expoConfig?.extra as any)
  || ((Constants as any).manifest?.extra as any)
  || ((Constants as any).manifest2?.extra as any);

const apiUrl: string | undefined = extra?.apiUrl;

export type GeneratedRoutine = {
  name: string;
  description?: string;
  days?: Array<{
    day: string;
    exercises: Array<{ name: string; sets: number; reps: string | number; rest_seconds: number }>;
  }>;
  meta?: { saved?: { routine_id: string } | null; routine_id?: string };
};

export async function warmUpBackend(): Promise<void> {
  if (!apiUrl) return;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);
  try {
    await fetch(`${apiUrl}/health`, { signal: controller.signal });
  } catch {
    // ignorar errores de warmup
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestAIRoutine(routineName?: string): Promise<{ generated: GeneratedRoutine; saved: { routine_id: string } | null }>{
  if (!apiUrl) throw new Error('EXPO_PUBLIC_API_URL no configurada');
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  if (!accessToken) throw new Error('No hay sesión activa');

  // Calentar backend para evitar cold start
  await warmUpBackend();

  const callGenerate = async (timeoutMs: number): Promise<Response> => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(`${apiUrl}/generate-for-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(to);
    }
  };

  // Primer intento (60s), si falla por timeout/red, reintentar una vez (90s)
  let res: Response;
  try {
    res = await callGenerate(60000);
  } catch (e: any) {
    // reintento único
    res = await callGenerate(90000);
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error backend: ${res.status} ${txt}`);
  }

  const json = await res.json();
  // El backend devuelve directamente la rutina (GeneratedRoutine) y opcionalmente meta.saved
  const generated: GeneratedRoutine = {
    name: json?.name ?? (routineName ?? 'Mi rutina AI'),
    description: json?.description,
    days: json?.days,
    meta: { saved: json?.meta?.saved ?? null, routine_id: json?.meta?.saved?.routine_id }
  };
  const saved = (json?.meta && json.meta.saved) ? json.meta.saved : null;
  return { generated, saved };
}

// Lee la última rutina generada por IA desde Supabase (si la guardas en una tabla ai_routines)
export async function fetchLatestGeneratedRoutine(): Promise<GeneratedRoutine | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;
  // 1) Intentar tabla ai_routines si existiese
  try {
    const { data, error } = await supabase
      .from('ai_routines')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data?.data) return data.data as GeneratedRoutine;
  } catch {}

  // 2) Fallback: reconstruir desde routines + routine_exercises
  const { data: routine, error: rErr } = await supabase
    .from('routines')
    .select('id, name, description, created_at, user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (rErr || !routine?.id) return null;

  const { data: exercises, error: eErr } = await supabase
    .from('routine_exercises')
    .select('day_index, name, sets, reps, rest_seconds, notes, order_index')
    .eq('routine_id', routine.id)
    .order('day_index', { ascending: true })
    .order('order_index', { ascending: true });
  if (eErr || !exercises) return null;

  const byDay: Record<number, { name: string; sets: number; reps: string | number; rest_seconds: number; notes?: string }[]> = {};
  for (const ex of exercises as any[]) {
    const d = Number(ex.day_index) || 0;
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push({
      name: String(ex.name),
      sets: Number(ex.sets),
      reps: typeof ex.reps === 'number' ? ex.reps : String(ex.reps),
      rest_seconds: Number(ex.rest_seconds),
      notes: ex.notes ?? undefined,
    });
  }

  const days: GeneratedRoutine['days'] = Object.keys(byDay)
    .map((k) => Number(k))
    .sort((a, b) => a - b)
    .map((idx) => ({ day: `Día ${idx + 1}`, exercises: byDay[idx] }));

  return {
    name: routine.name ?? 'Mi rutina',
    description: routine.description ?? undefined,
    days,
    meta: { routine_id: routine.id }
  } as GeneratedRoutine;
}

// Fallback: leer la última fila de la tabla routines del usuario y adaptarla a GeneratedRoutine
export async function fetchLatestRoutineForUser(): Promise<GeneratedRoutine | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;

  // 1) Intentar tabla ai_routines
  const ai = await fetchLatestGeneratedRoutine();
  if (ai) return ai;

  // 2) Fallback a routines (estructura propia de la app)
  const { data, error } = await supabase
    .from('routines')
    .select('name, description, exercises')
    .eq('createdBy', userId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  if (!data) return null;

  const exercises = Array.isArray((data as any).exercises) ? (data as any).exercises : [];
  const mapped = exercises.map((ex: any) => ({
    name: String(ex.name ?? 'Ejercicio'),
    sets: Number(ex.sets ?? 3),
    reps: Number(ex.reps ?? 10),
    rest_seconds: Number(ex.restTime ?? 60),
  }));

  const generated: GeneratedRoutine = {
    name: String((data as any).name ?? 'Mi rutina'),
    description: (data as any).description ?? undefined,
    days: [
      {
        day: 'Día 1',
        exercises: mapped,
      },
    ],
  };
  return generated;
}

