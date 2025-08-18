import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

type FirebaseConfig = {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
	measurementId?: string;
};

// Soportar distintos entornos de Expo (dev/Expo Go/EAS)
const extra = (Constants.expoConfig?.extra as any)
	|| ((Constants as any).manifest?.extra as any)
	|| ((Constants as any).manifest2?.extra as any);

const config = extra?.firebase as FirebaseConfig | undefined;

if (!config || !config.apiKey) {
	// eslint-disable-next-line no-console
	console.warn('Firebase config ausente en app.json -> expo.extra.firebase');
}

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
	if (!firebaseApp) {
		firebaseApp = initializeApp(config as any);
	}
	return firebaseApp;
}

export function getFirebaseAuth(): Auth {
	if (!auth) {
		const app = getFirebaseApp();
		if (Platform.OS === 'web') {
			// En web la persistencia ya es local por defecto
			auth = getAuth(app);
		} else {
			// En nativo debemos proveer AsyncStorage para persistir la sesión
			try {
				// Cargar APIs específicas de RN de manera dinámica para evitar problemas de tipos
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const rnAuth = require('firebase/auth');
				auth = rnAuth.initializeAuth(app, {
					persistence: rnAuth.getReactNativePersistence(ReactNativeAsyncStorage),
				});
			} catch (_e) {
				// Si Auth ya fue inicializado, usamos la instancia existente
				auth = getAuth(app);
			}
		}
	}
	return auth as Auth;
}

export function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}


