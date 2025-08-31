import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { fetchEquipmentCatalog, replaceEquipmentProfileItems } from '../../services/equipment';

const { height } = Dimensions.get('window');

type EquipmentType = 'custom' | 'commercial_gym' | 'small_gym' | 'calisthenics' | 'no_equipment';

export default function EquipmentTypeQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [value, setValue] = useState<EquipmentType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      
      // Obtener el tipo de equipo seleccionado previamente
      const { data } = await supabase
        .from('initial_survey')
        .select('equipment_type')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data?.equipment_type) {
        setValue(data.equipment_type as EquipmentType);
      }
    })();
  }, []);

  const onNext = async () => {
    try {
      if (!value) throw new Error('Selecciona una opción');
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
  
      console.log('User ID:', userId);
      console.log('Selected equipment type:', value);
  
      await supabase.from('initial_survey').upsert({ user_id: userId, equipment_type: value });
  
      if (value !== 'custom') {
        // Construir items dinámicamente desde el catálogo
        const { data: catalog, error } = await fetchEquipmentCatalog();
        if (error) throw error as any;
        
        console.log('Catalog data:', catalog);
  
        // Asegúrate de que el catalog tiene item_slug
        const items = (catalog || []).map((c: any) => ({ 
          item_slug: c.item_slug, // DEBE ser item_slug, no slug
          group: c.group as string | null 
        }));
  
        console.log('Processed items:', items);
  
        let selectedSlugs: string[] = [];
        if (value === 'commercial_gym') {
          selectedSlugs = items.map(i => i.item_slug);
        } else if (value === 'calisthenics') {
          selectedSlugs = items.filter(i => i.group === 'calisthenics').map(i => i.item_slug);
        } else if (value === 'small_gym') {
          selectedSlugs = items.filter(i => i.group === 'small_gym').map(i => i.item_slug);
        } else if (value === 'no_equipment') {
          selectedSlugs = [];
        }
  
        console.log('Selected slugs:', selectedSlugs);

        console.log('Catalog data structure:', catalog);
        console.log('First catalog item:', catalog[0]);
        console.log('Does first item have item_slug?', catalog[0]?.item_slug);
        console.log('Does first item have slug?', catalog[0]?.slug);
  
        const result = await replaceEquipmentProfileItems(userId, selectedSlugs);
        
        if (result && 'error' in result) {
          console.warn('[EquipmentType] replace items error', result.error);
          throw result.error;
        }
        
        console.log('Successfully saved equipment');
        return navigation.goBack();
      }
      
      navigation.navigate('EquipmentPicker');
      
    } catch (e: any) {
      console.error('Error in onNext:', e);
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}> 
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backButton, { borderColor: theme.colors.borderNeon }]}
          > 
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: theme.colors.accent }]}>
          ¿Qué equipo tienes disponible?
        </Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>
          Mantén presionada una opción para editar el equipo disponible
        </Text>
      </View>

      <View style={styles.list}>
        {([
          { id: 'custom', title: 'Elegir a tu gusto', icon: 'build-outline' },
          { id: 'commercial_gym', title: 'Gym Comercial', icon: 'barbell-outline' },
          { id: 'small_gym', title: 'Gym Pequeño', icon: 'fitness-outline' },
          { id: 'calisthenics', title: 'Calistenia', icon: 'walk-outline' },
          { id: 'no_equipment', title: 'Sin equipamiento', icon: 'body-outline' },
        ] as Array<{id: EquipmentType; title: string; icon: any}>).map(opt => {
          const selected = value === opt.id;
          return (
            <TouchableOpacity 
              key={opt.id} 
              onPress={() => setValue(opt.id)} 
              activeOpacity={0.9} 
              style={[
                styles.row, { 
                  borderColor: selected ? theme.colors.accent : theme.colors.borderNeon, 
                  backgroundColor: selected ? theme.colors.accent + '20' : 'rgba(255,255,255,0.05)' 
                }
              ]}
            > 
              <View style={styles.rowContent}>
                <View style={[
                  styles.leadIcon, { 
                    borderColor: selected ? theme.colors.accent : theme.colors.borderNeon 
                  }
                ]}>
                  <Ionicons 
                    name={opt.icon} 
                    size={20} 
                    color={selected ? theme.colors.accent : theme.colors.text} 
                  />
                </View>
                <Text style={[
                  styles.rowTitle, { 
                    color: selected ? theme.colors.accent : theme.colors.text 
                  }
                ]}>
                  {opt.title}
                </Text>
                <Ionicons 
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={20} 
                  color={selected ? theme.colors.accent : theme.colors.text + '66'} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[styles.nextBtn, { opacity: loading || !value ? 0.6 : 1 }]} 
          onPress={onNext} 
          disabled={loading || !value}
        >
          <LinearGradient 
            colors={[theme.colors.accent, theme.colors.accent + 'CC']} 
            style={styles.buttonGradient} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextTxt, { color: theme.colors.background }]}>
              {loading ? 'Guardando...' : 'Continuar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerSection: { alignItems: 'center', marginTop: height * 0.05, marginBottom: 16 },
  headerRow: { alignSelf: 'flex-start', marginBottom: 16 },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 13, 
    fontWeight: '400', 
    textAlign: 'center', 
    opacity: 0.9 
  },
  list: { 
    gap: 12, 
    paddingVertical: 20 
  },
  row: { 
    width: '100%', 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    borderRadius: 16, 
    borderWidth: 1 
  },
  rowContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  leadIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    borderWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  rowTitle: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '800', 
    marginLeft: 12 
  },
  buttonSection: { 
    paddingBottom: 40, 
    alignItems: 'center' 
  },
  nextBtn: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    width: '100%', 
    maxWidth: 300 
  },
  buttonGradient: { 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  nextTxt: { 
    fontWeight: '700', 
    fontSize: 16 
  },
});