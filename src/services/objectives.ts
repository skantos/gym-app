import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
	const snap = await getDoc(doc(db, 'objectives', userId));
	if (!snap.exists()) return null;
	return snap.data() as ObjectiveDoc;
}


