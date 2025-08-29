import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const extra = (Constants.expoConfig?.extra as any)
	|| ((Constants as any).manifest?.extra as any)
	|| ((Constants as any).manifest2?.extra as any);

const supabaseUrl = extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = extra?.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('[Supabase] Variables EXPO_PUBLIC_SUPABASE_URL/ANON_KEY no definidas en extra.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: false,
		detectSessionInUrl: false
	}
});