import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, Alert, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { fetchEquipmentCatalog, getEquipmentProfileItems, replaceEquipmentProfileItems } from '../../services/equipment';

const { height, width } = Dimensions.get('window');

// ACTUALIZADO: Cambiar slug por item_slug
type CatalogItem = { id: number; item_slug: string; name: string; image_url?: string; group?: string };

export default function EquipmentPickerScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupedItems, setGroupedItems] = useState<Record<string, CatalogItem[]>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;

      // Fetch catalog
      const { data: cat, error: catError } = await fetchEquipmentCatalog();
      if (catError) {
        console.error('Catalog error:', catError);
        Alert.alert('Error', 'No se pudo cargar el catálogo');
        return;
      }
      
      if (cat) {
        const sortedItems = (cat as CatalogItem[]).sort((a, b) => {
          if (a.group && b.group && a.group !== b.group) {
            return a.group.localeCompare(b.group);
          }
          return a.name.localeCompare(b.name);
        });
        
        setItems(sortedItems);
        
        // Agrupar elementos por categoría
        const grouped = sortedItems.reduce((acc, item) => {
          const group = item.group || 'Otros';
          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(item);
          return acc;
        }, {} as Record<string, CatalogItem[]>);
        
        setGroupedItems(grouped);
      }
      
      // Fetch user's selected items
      try {
        const profItems = await getEquipmentProfileItems(userId);
        setSelected(profItems.map((r: any) => r.item_slug));
      } catch (error) {
        console.error('Profile items error:', error);
        Alert.alert('Error', 'No se pudieron cargar los items seleccionados');
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Error al cargar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ACTUALIZADO: Cambiar parámetro de slug a item_slug
  const toggle = (item_slug: string) => {
    setSelected((prev) => (prev.includes(item_slug) ? prev.filter((s) => s !== item_slug) : [...prev, item_slug]));
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      
      const result = await replaceEquipmentProfileItems(userId, selected);
      
      if (result && 'error' in result) {
        throw result.error;
      }
      
      Alert.alert('Guardado', 'Equipamiento actualizado correctamente.');
      navigation.goBack();
    } catch (e: any) {
      console.error('Save error:', e);
      Alert.alert('Error', e?.message ?? 'No se pudo guardar el equipamiento');
    } finally { 
      setLoading(false); 
    }
  };

  const renderItem = ({ item }: { item: CatalogItem }) => {
    // ACTUALIZADO: Cambiar item.slug por item.item_slug
    const isSel = selected.includes(item.item_slug);
    return (
      <TouchableOpacity 
        // ACTUALIZADO: Cambiar item.slug por item.item_slug
        onPress={() => toggle(item.item_slug)} 
        style={[
          styles.card, 
          { 
            borderColor: isSel ? theme.colors.accent : theme.colors.borderNeon, 
            backgroundColor: isSel ? theme.colors.accent + '20' : 'rgba(255,255,255,0.05)' 
          }
        ]}
      > 
        <View style={styles.cardImageWrap}>
          {item.image_url ? (
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.cardImage} 
              resizeMode="contain" 
              onError={() => console.log('Image load error:', item.image_url)}
            />
          ) : (
            <View style={styles.placeholderIcon}>
              <Ionicons name="fitness-outline" size={24} color={theme.colors.text + '66'} />
            </View>
          )}
          {isSel && (
            <View style={[styles.checkBadge, { backgroundColor: theme.colors.accent }]}> 
              <Ionicons name="checkmark" size={14} color={theme.colors.background} />
            </View>
          )}
        </View>
        <Text 
          numberOfLines={2} 
          style={[styles.cardTitle, { color: isSel ? theme.colors.accent : theme.colors.text }]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Función para obtener el nombre legible del grupo
  const getGroupName = (group: string) => {
    const groupNames: Record<string, string> = {
      'small_gym': 'Gimnasio Pequeño',
      'commercial_gym': 'Gimnasio Comercial',
      'calisthenics': 'Calistenia',
      'Otros': 'Otros Equipos'
    };
    
    return groupNames[group] || group;
  };

  const renderGroup = ({ group, items }: { group: string; items: CatalogItem[] }) => (
    <View key={group} style={styles.groupContainer}>
      <Text style={[styles.groupTitle, { color: theme.colors.accent }]}>
        {getGroupName(group)}
      </Text>
      <FlatList
        data={items}
        numColumns={3}
        // ACTUALIZADO: Mejor key extractor
        keyExtractor={(it) => `${it.id}-${it.item_slug}`}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { borderColor: theme.colors.borderNeon }]}
        > 
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Equipamiento</Text>
        <TouchableOpacity onPress={onSave} disabled={loading || refreshing}>
          <Text style={[
            styles.saveLink, 
            { 
              color: theme.colors.accent, 
              opacity: (loading || refreshing) ? 0.6 : 1 
            }
          ]}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      >
        {Object.entries(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([group, items]) => 
            renderGroup({ group, items })
          )
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={48} color={theme.colors.text + '66'} />
            <Text style={[styles.emptyText, { color: theme.colors.text + '99' }]}>
              {refreshing ? 'Cargando...' : 'No hay equipamiento disponible'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const CARD = Math.floor((width - 20 - 24) / 3);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 10 
  },
  scrollContainer: {
    paddingBottom: 20,
    minHeight: height - 100,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12,
    marginBottom: 10,
    marginTop: 20,
  },
  backButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    borderWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800' 
  },
  saveLink: { 
    fontSize: 14, 
    fontWeight: '700' 
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingLeft: 10,
  },
  grid: { 
    gap: 8 
  },
  card: { 
    width: CARD, 
    borderWidth: 1, 
    borderRadius: 14, 
    padding: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: 4 
  },
  cardImageWrap: { 
    width: '100%', 
    height: CARD - 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  },
  cardImage: { 
    width: '100%', 
    height: '100%',
    borderRadius: 8,
  },
  placeholderIcon: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  checkBadge: { 
    position: 'absolute', 
    top: 6, 
    right: 6, 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  cardTitle: { 
    marginTop: 6, 
    fontSize: 12, 
    fontWeight: '700', 
    textAlign: 'center' 
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});