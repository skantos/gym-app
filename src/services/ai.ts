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


