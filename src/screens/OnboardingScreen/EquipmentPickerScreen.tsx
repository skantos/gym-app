import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { fetchEquipmentCatalog, getEquipmentProfile, upsertEquipmentProfile } from '../../services/equipment';

const { height, width } = Dimensions.get('window');

type CatalogItem = { id: number; slug: string; name: string; image_url?: string; group?: string };

export default function EquipmentPickerScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data: cat } = await fetchEquipmentCatalog();
      setItems((cat ?? []) as CatalogItem[]);
      const { data: prof } = await getEquipmentProfile(userId);
      if (prof?.items) setSelected(prof.items as string[]);
    })();
  }, []);

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      await upsertEquipmentProfile(userId, selected);
      Alert.alert('Guardado', 'Equipamiento actualizado.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally { setLoading(false); }
  };

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const isSel = selected.includes(item.slug);
    return (
      <TouchableOpacity onPress={() => toggle(item.slug)} style={[styles.card, { borderColor: isSel ? theme.colors.accent : theme.colors.borderNeon, backgroundColor: isSel ? theme.colors.accent + '20' : 'rgba(255,255,255,0.05)' }]}> 
        <View style={styles.cardImageWrap}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="contain" />
          ) : (
            <Ionicons name="image-outline" size={24} color={theme.colors.text + '99'} />
          )}
          {isSel && (
            <View style={[styles.checkBadge, { backgroundColor: theme.colors.accent }]}> 
              <Ionicons name="checkmark" size={14} color={theme.colors.background} />
            </View>
          )}
        </View>
        <Text numberOfLines={2} style={[styles.cardTitle, { color: isSel ? theme.colors.accent : theme.colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { borderColor: theme.colors.borderNeon }]}> 
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Equipamiento</Text>
        <TouchableOpacity onPress={onSave} disabled={loading}>
          <Text style={[styles.saveLink, { color: '#60A5FA', opacity: loading ? 0.6 : 1 }]}>{loading ? '...' : 'guardar'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        numColumns={3}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
      />
    </View>
  );
}

const CARD = Math.floor((width - 20 - 24) / 3);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  saveLink: { fontSize: 14, fontWeight: '700' },
  grid: { paddingVertical: 8, gap: 8 },
  card: { width: CARD, borderWidth: 1, borderRadius: 14, padding: 8, alignItems: 'center', justifyContent: 'center', margin: 4 },
  cardImageWrap: { width: '100%', height: CARD - 40, alignItems: 'center', justifyContent: 'center' },
  cardImage: { width: '100%', height: '100%' },
  checkBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { marginTop: 6, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});


