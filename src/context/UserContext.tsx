import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getFirebaseAuth } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getDb } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	hasCompletedSurvey?: boolean;
	surveyCompletedAt?: any;
}

interface UserContextType {
	user: User | null;
	isAuthenticated: boolean;
	loginWithEmail: (email: string, password: string) => Promise<void>;
	registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	markSurveyCompleted: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const auth = getFirebaseAuth();
		const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
			if (fbUser) {
				try {
					const db = getDb();
					const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
					const userData = userDoc.data();
					setUser({
						id: fbUser.uid,
						name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Usuario',
						email: fbUser.email ?? '',
						avatar: fbUser.photoURL ?? undefined,
						hasCompletedSurvey: userData?.hasCompletedSurvey ?? false,
						surveyCompletedAt: userData?.surveyCompletedAt,
					});
				} catch (error) {
					setUser({
						id: fbUser.uid,
						name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Usuario',
						email: fbUser.email ?? '',
						avatar: fbUser.photoURL ?? undefined,
						hasCompletedSurvey: false,
					});
				}
			} else {
				setUser(null);
			}
			setInitialized(true);
		});
		return () => unsub();
	}, []);

	const isAuthenticated = !!user;

	const loginWithEmail = async (email: string, password: string) => {
		const auth = getFirebaseAuth();
		const cred = await signInWithEmailAndPassword(auth, email, password);
		const db = getDb();
		await setDoc(doc(db, 'users', cred.user.uid), {
			lastLoginAt: serverTimestamp(),
		}, { merge: true });
	};

	const registerWithEmail = async (name: string, email: string, password: string) => {
		const auth = getFirebaseAuth();
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		if (cred.user && name) {
			await updateProfile(cred.user, { displayName: name });
		}
		const db = getDb();
		await setDoc(doc(db, 'users', cred.user.uid), {
			name: name || email.split('@')[0],
			email,
			createdAt: serverTimestamp(),
			hasCompletedSurvey: false,
		}, { merge: true });
	};

	const logout = async () => {
		const auth = getFirebaseAuth();
		await signOut(auth);
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
	}), [user, isAuthenticated]);

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