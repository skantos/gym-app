import { supabase } from './supabase';

export type ObjectiveDoc = {
	userId: string;
	muscleGroups: string[];
	createdAt?: any;
	updatedAt?: any;
};

export async function saveObjectives(userId: string, muscleGroups: string[]): Promise<void> {
	const { error } = await supabase
		.from('objectives')
		.upsert({ user_id: userId, muscle_groups: muscleGroups, updated_at: new Date().toISOString() });
	if (error) throw error;
}

export async function getObjectives(userId: string): Promise<ObjectiveDoc | null> {
	const { data, error } = await supabase
		.from('objectives')
		.select('muscle_groups')
		.eq('user_id', userId)
		.single();
	if (error && (error as any).code !== 'PGRST116') throw error; // 116 = no rows
	if (!data) return null;
	return { userId, muscleGroups: data.muscle_groups ?? [] };
}


