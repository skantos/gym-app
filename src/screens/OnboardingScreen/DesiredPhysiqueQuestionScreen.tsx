import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';

const { height } = Dimensions.get('window');

type GoalId = 'athletic' | 'fitness' | 'muscular' | 'bodybuilder' | 'lean';

const OPTIONS: Array<{ id: GoalId; title: string; desc: string; imageKey: string }> = [
  { id: 'athletic', title: 'Delgado atlético', desc: 'Marco definido, bajo % graso', imageKey: 'delgado' },
  { id: 'fitness', title: 'Tonificado/fitness', desc: 'Estético y funcional', imageKey: 'normal' },
  { id: 'muscular', title: 'Musculoso', desc: 'Mayor masa muscular', imageKey: 'musculoso' },
  { id: 'bodybuilder', title: 'Fisicoculturista', desc: 'Volumen y definición máximos', imageKey: 'musculoso' },
  { id: 'lean', title: 'Definido', desc: 'Muy bajo % graso', imageKey: 'normal' },
];

const IMG_BY_KEY: Record<string, any> = {
  delgado: require('../../assets/images/delgado.png'),
  normal: require('../../assets/images/normal.jpg'),
  musculoso: require('../../assets/images/musculoso.png'),
};

export default function DesiredPhysiqueQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [value, setValue] = useState<GoalId | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from('initial_survey')
        .select('aesthetic_goal')
        .eq('user_id', userId)
        .maybeSingle();
      if (data?.aesthetic_goal) setValue(data.aesthetic_goal as GoalId);
    })();
  }, []);

  const onNext = async () => {
    try {
      if (!value) throw new Error('Selecciona un objetivo');
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      await supabase
        .from('initial_survey')
        .upsert(
          { user_id: userId, aesthetic_goal: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .select('user_id, aesthetic_goal')
        .single();
      navigation.navigate('DaysPerWeekQuestion');
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

        <Text style={[styles.title, { color: theme.colors.accent }]}>¿Qué físico quieres alcanzar?</Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>Elige el estilo que mejor representa tu objetivo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          const card = (
            <View style={styles.cardInner}>
              <View style={[styles.imageWrap, { borderColor: selected ? theme.colors.accent : theme.colors.borderNeon }]}> 
                <Image source={IMG_BY_KEY[opt.imageKey] || IMG_BY_KEY['normal']} style={styles.image} resizeMode="cover" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.cardTitle, { color: selected ? theme.colors.accent : theme.colors.text }]} numberOfLines={1}>
                  {opt.title}
                </Text>
                <Text style={[styles.cardDesc, { color: selected ? theme.colors.accent + 'CC' : '#9CA3AF' }]} numberOfLines={2}>
                  {opt.desc}
                </Text>
              </View>
              <View style={styles.trailing}>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={theme.colors.text + '66'} />
                )}
              </View>
            </View>
          );

          return (
            <TouchableOpacity key={opt.id} activeOpacity={0.9} onPress={() => setValue(opt.id)}>
              {selected ? (
                <LinearGradient colors={[theme.colors.accent + '30', theme.colors.accent + '10']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.cardGradient, { borderColor: theme.colors.accent }]}>
                  {card}
                </LinearGradient>
              ) : (
                <View style={[styles.card, { borderColor: theme.colors.borderNeon }]}>
                  {card}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={[styles.nextBtn, { opacity: loading || !value ? 0.6 : 1 }]} onPress={onNext} disabled={loading || !value}>
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
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '400', textAlign: 'center', opacity: 0.9 },
  listContainer: { paddingVertical: 8, gap: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 6 },
  cardGradient: { borderWidth: 1, borderRadius: 16, padding: 12, marginVertical: 6 },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imageWrap: { width: 64, height: 64, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, fontWeight: '500' },
  trailing: { width: 28, alignItems: 'center' },
  buttonSection: { paddingBottom: 40, alignItems: 'center' },
  nextBtn: { borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 300 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  nextTxt: { fontWeight: '700', fontSize: 16 },
});


