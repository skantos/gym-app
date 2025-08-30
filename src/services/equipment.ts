import { supabase } from './supabase';

export type EquipmentType = 'custom' | 'commercial_gym' | 'small_gym' | 'calisthenics' | 'no_equipment';

export async function getEquipmentProfile(userId: string) {
  return await supabase.from('equipment_profiles').select('items').eq('id', userId).maybeSingle();
}

export async function upsertEquipmentProfile(userId: string, items: string[]) {
  return await supabase.from('equipment_profiles').upsert({ id: userId, items });
}

export async function fetchEquipmentCatalog() {
  return await supabase.from('equipment_items_catalog').select('*').order('group', { ascending: true });
}


