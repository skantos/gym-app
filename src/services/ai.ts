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
    exercises: Array<{ name: string; sets: number; reps: number; rest_seconds: number }>;
  }>;
};

export async function requestAIRoutine(routineName?: string): Promise<{ generated: GeneratedRoutine; saved: { routine_id: string } }>{
  if (!apiUrl) throw new Error('EXPO_PUBLIC_API_URL no configurada');
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  if (!accessToken) throw new Error('No hay sesión activa');

  const res = await fetch(`${apiUrl}/ai/routine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ routine_name: routineName ?? 'Mi rutina AI' }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error backend: ${res.status} ${txt}`);
  }

  const json = await res.json();
  return json.data;
}

// Lee la última rutina generada por IA desde Supabase (si la guardas en una tabla ai_routines)
export async function fetchLatestGeneratedRoutine(): Promise<GeneratedRoutine | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('ai_routines')
    .select('data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[AI] No se pudo leer ai_routines:', error.message);
    return null;
  }
  if (!data?.data) return null;
  return data.data as GeneratedRoutine;
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

