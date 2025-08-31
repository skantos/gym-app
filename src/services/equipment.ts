// services/equipment.ts - CON NUEVO NOMBRE DE CAMPO
import { supabase } from './supabase';

export type EquipmentType = 'custom' | 'commercial_gym' | 'small_gym' | 'calisthenics' | 'no_equipment';

export async function getEquipmentProfile(userId: string) {
  return await supabase.from('equipment_profiles').select('items').eq('id', userId).maybeSingle();
}

export async function upsertEquipmentProfile(userId: string, items: string[]) {
  return await supabase.from('equipment_profiles').upsert({ id: userId, items });
}

export async function fetchEquipmentCatalog() {
  return await supabase
    .from('equipment_items_catalog')
    .select('id, item_slug, name, image_url, group') // Asegúrate de usar item_slug
    .order('group', { ascending: true });
}

export async function getEquipmentProfileItems(userId: string) {
  try {
    const { data, error } = await supabase
      .from('equipment_profile_items')
      .select('item_slug')
      .eq('profile_id', userId);

    if (error) throw error;
    
    return data ? data.map(item => ({ item_slug: item.item_slug })) : [];
  } catch (error) {
    console.error('Get profile items error:', error);
    throw error;
  }
}

export async function replaceEquipmentProfileItems(userId: string, nextSlugs: string[]) {
  const uniqueSlugs = Array.from(new Set(nextSlugs));
  
  try {
    console.log('Starting equipment replacement for user:', userId);

    // 1. Eliminar items antiguos
    const { error: deleteError } = await supabase
      .from('equipment_profile_items')
      .delete()
      .eq('profile_id', userId);

    if (deleteError) throw deleteError;

    // 2. Insertar nuevos items si hay alguno
    if (uniqueSlugs.length > 0) {
      const rows = uniqueSlugs.map(item_slug => ({
        profile_id: userId,
        item_slug
      }));

      const { error: insertError } = await supabase
        .from('equipment_profile_items')
        .insert(rows);

      if (insertError) throw insertError;
    }

    // 3. Actualizar el perfil
    const { error: updateError } = await supabase
      .from('equipment_profiles')
      .upsert({
        id: userId,
        items: uniqueSlugs,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (updateError) throw updateError;

    console.log('Equipment replacement successful');
    return { ok: true } as const;
    
  } catch (error) {
    console.error('Replace items error:', error);
    throw error;
  }
}