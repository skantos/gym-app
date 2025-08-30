import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

interface User {
	id: string;
	name: string;
	firstName?: string;
	lastName?: string;
	email: string;
	avatar?: string;
	gender?: 'male' | 'female';
	hasCompletedSurvey?: boolean;
	surveyCompletedAt?: any;
}

interface UserContextType {
	user: User | null;
	isAuthenticated: boolean;
	loginWithEmail: (email: string, password: string) => Promise<void>;
	registerWithEmail: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	markSurveyCompleted: () => void;
  forceLoginOnStart: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [initialized, setInitialized] = useState(false);
  const [forceLoginOnStart, setForceLoginOnStart] = useState<boolean>(false);

	useEffect(() => {
		// Leer preferencia local para forzar login al iniciar
		(async () => {
			try {
				const v = await AsyncStorage.getItem('forceLoginOnStart');
				setForceLoginOnStart(v === 'true');
			} catch { /* ignore */ }
		})();

		// Hidratar sesión actual y perfil al arranque (sin depender del evento)
		(async () => {
			try {
				const { data: sess } = await supabase.auth.getSession();
				const authUser = sess.session?.user;
				if (authUser?.id) {
					try {
						const { data: profile } = await supabase
							.from('users')
							.select('*')
							.eq('id', authUser.id)
							.single();
						setUser({
							id: authUser.id,
							name: profile?.name ?? (([profile?.first_name, profile?.last_name].filter(Boolean).join(' ')) || (authUser.email?.split('@')[0] ?? 'Usuario')),
							firstName: profile?.first_name ?? undefined,
							lastName: profile?.last_name ?? undefined,
							email: authUser.email ?? '',
							avatar: profile?.avatar ?? undefined,
							gender: profile?.gender === 'female' ? 'female' : profile?.gender === 'male' ? 'male' : undefined,
							hasCompletedSurvey: !!profile?.has_completed_survey,
							surveyCompletedAt: profile?.survey_completed_at,
						});
					} catch {}
				}
			} finally {
				// no bloquear arranque si falla
			}
		})();

		const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
			const authUser = session?.user;
			if (authUser?.id) {
				try {
					let { data: profile } = await supabase
						.from('users')
						.select('*')
						.eq('id', authUser.id)
						.single();

					// Si no existe el perfil, crearlo con metadatos
					if (!profile) {
						const meta = authUser.user_metadata || {};
						await supabase.from('users').upsert({
							id: authUser.id,
							email: authUser.email ?? null,
							first_name: meta.first_name ?? null,
							last_name: meta.last_name ?? null,
						});
						const res = await supabase
							.from('users')
							.select('*')
							.eq('id', authUser.id)
							.single();
						profile = res.data as any;
					}
					setUser({
						id: authUser.id,
						name: profile?.name ?? (([profile?.first_name, profile?.last_name].filter(Boolean).join(' ')) || (authUser.email?.split('@')[0] ?? 'Usuario')),
						email: authUser.email ?? '',
						avatar: profile?.avatar ?? undefined,
						gender: profile?.gender === 'female' ? 'female' : profile?.gender === 'male' ? 'male' : undefined,
						hasCompletedSurvey: !!profile?.has_completed_survey,
						surveyCompletedAt: profile?.survey_completed_at,
					});
				} catch {
					setUser({
						id: authUser.id,
						name: authUser.email?.split('@')[0] ?? 'Usuario',
						email: authUser.email ?? '',
					});
				}
			} else {
				setUser(null);
			}
			setInitialized(true);
		});
		return () => subscription.subscription?.unsubscribe();
	}, []);

	const isAuthenticated = !!user;

	const loginWithEmail = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) throw error;
    // Ya no forzar login al próximo arranque
    setForceLoginOnStart(false);
    try { await AsyncStorage.setItem('forceLoginOnStart', 'false'); } catch {}
	};

	const registerWithEmail = async (firstName: string, lastName: string, email: string, password: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { first_name: firstName, last_name: lastName },
			},
		});
		if (error) throw error;
		// Asegurar sesión inmediata (por si confirm email está desactivado pero no llega session)
		let sessionUserId = data.session?.user?.id ?? data.user?.id ?? null;
		if (!data.session && data.user) {
			const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
			if (signInErr) throw signInErr;
			sessionUserId = signInData.session?.user?.id ?? sessionUserId;
		}

		// Crear/actualizar perfil inmediatamente como respaldo al trigger
		if (sessionUserId) {
			await supabase.from('users').upsert({
				id: sessionUserId,
				email,
				first_name: firstName,
				last_name: lastName,
			});
		}
    // Ya no forzar login al próximo arranque
    setForceLoginOnStart(false);
    try { await AsyncStorage.setItem('forceLoginOnStart', 'false'); } catch {}
	};

	const logout = async () => {
		await supabase.auth.signOut();
    // Forzar login en próximo arranque
    setForceLoginOnStart(true);
    try { await AsyncStorage.setItem('forceLoginOnStart', 'true'); } catch {}
	};

	const markSurveyCompleted = () => {
		setUser((prev) => prev ? { ...prev, hasCompletedSurvey: true, surveyCompletedAt: new Date().toISOString() } : prev);
	};

	const value = useMemo<UserContextType>(() => ({
		user,
		isAuthenticated,
		loginWithEmail,
		registerWithEmail,
		logout,
		markSurveyCompleted,
    forceLoginOnStart,
	}), [user, isAuthenticated, forceLoginOnStart]);

	if (!initialized) {
		return null;
	}

	return (
		<UserContext.Provider value={value}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
}