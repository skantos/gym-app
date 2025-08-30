import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';

const { height } = Dimensions.get('window');

type DaySlug = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
const WEEKDAYS: Array<{ slug: DaySlug; label: string }>= [
  { slug: 'mon', label: 'Lunes' },
  { slug: 'tue', label: 'Martes' },
  { slug: 'wed', label: 'Miércoles' },
  { slug: 'thu', label: 'Jueves' },
  { slug: 'fri', label: 'Viernes' },
  { slug: 'sat', label: 'Sábado' },
  { slug: 'sun', label: 'Domingo' },
];

export default function DaysPerWeekQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<DaySlug[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from('initial_survey')
        .select('days_per_week, training_days')
        .eq('user_id', userId)
        .maybeSingle();
      if (Array.isArray(data?.training_days)) {
        setSelected((data!.training_days as string[]).filter(Boolean) as DaySlug[]);
      } else if (data?.days_per_week != null) {
        // Prefill con próximos N días empezando lunes
        const n = Math.max(1, Math.min(7, Number(data.days_per_week)));
        setSelected(WEEKDAYS.slice(0, n).map(d => d.slug));
      }
    })();
  }, []);

  const onNext = async () => {
    try {
      if (!selected.length) throw new Error('Selecciona al menos un día');
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      await supabase.from('initial_survey').upsert({ 
        user_id: userId, 
        days_per_week: selected.length, 
        training_days: selected 
      });
      navigation.navigate('EquipmentTypeQuestion');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}> 
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { borderColor: theme.colors.borderNeon }]}> 
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: theme.colors.accent }]}>¿Qué días de la semana entrenas?</Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>Toca para seleccionar (puedes elegir varios)</Text>
      </View>

      <View style={styles.list}> 
        {WEEKDAYS.map((d) => {
          const isSelected = selected.includes(d.slug);
          return (
            <TouchableOpacity
              key={d.slug}
              onPress={() => setSelected((prev) => prev.includes(d.slug) ? prev.filter(x => x !== d.slug) : [...prev, d.slug])}
              activeOpacity={0.9}
              style={[styles.dayRow, { borderColor: isSelected ? theme.colors.accent : theme.colors.borderNeon, backgroundColor: isSelected ? theme.colors.accent + '20' : 'rgba(255,255,255,0.05)' }]}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.dayLabel, { color: isSelected ? theme.colors.accent : theme.colors.text }]}>{d.label}</Text>
                <Ionicons name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={isSelected ? theme.colors.accent : theme.colors.text + '66'} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={[styles.nextBtn, { opacity: loading || !selected.length ? 0.6 : 1 }]} onPress={onNext} disabled={loading || !selected.length}>
          <LinearGradient colors={[theme.colors.accent, theme.colors.accent + 'CC']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '400', textAlign: 'center', opacity: 0.9 },
  list: { gap: 12, paddingVertical: 20 },
  dayRow: { width: '100%', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },
  rowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLabel: { fontSize: 16, fontWeight: '800' },
  buttonSection: { paddingBottom: 40, alignItems: 'center' },
  nextBtn: { borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 300 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  nextTxt: { fontWeight: '700', fontSize: 16 },
});


