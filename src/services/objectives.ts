import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { getDb } from './firebase';

export type ObjectiveDoc = {
	userId: string;
	muscleGroups: string[];
	createdAt?: any;
	updatedAt?: any;
};

export async function saveObjectives(userId: string, muscleGroups: string[]): Promise<void> {
	const db = getDb();
	await setDoc(
		doc(db, 'objectives', userId),
		{
			userId,
			muscleGroups,
			updatedAt: serverTimestamp(),
			createdAt: serverTimestamp(),
		} as ObjectiveDoc,
		{ merge: true },
	);
}

export async function getObjectives(userId: string): Promise<ObjectiveDoc | null> {
	const db = getDb();
	// 1) Intentar por documento con ID = uid
	const byIdSnap = await getDoc(doc(db, 'objectives', userId));
	if (byIdSnap.exists()) return byIdSnap.data() as ObjectiveDoc;

	// 2) Si no existe, buscar por campo userId (por si fue creado con auto-ID)
	const q = query(
		collection(db, 'objectives'),
		where('userId', '==', userId),
		limit(1),
	);
	const list = await getDocs(q);
	if (list.empty) return null;
	return list.docs[0].data() as ObjectiveDoc;
}


