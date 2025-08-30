import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';

const { height, width } = Dimensions.get('window');

// Rangos para los selectores
// 🔹 Rango corregido con toFixed(1) y convertido a Number
    const WEIGHT_RANGE = Array.from({ length: 1510 }, (_, i) =>
        Number(((i + 400) / 10).toFixed(1)) // 40.0 → 190.9
    );
  const HEIGHT_RANGE = Array.from({ length: 91 }, (_, i) => i + 140); 

const ITEM_HEIGHT = 50; // Altura de cada item en el scroll
const VISIBLE_ITEMS = 5; // Número de items visibles
const TOP_SPACER_COUNT = Math.floor(VISIBLE_ITEMS / 2);

export default function WeightHeightQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [weight, setWeight] = useState<number>(70.0);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [loading, setLoading] = useState(false);
  
  const weightScrollRef = useRef<ScrollView>(null);
  const heightScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from('initial_survey')
        .select('weight_kg, height_cm')
        .eq('user_id', userId)
        .maybeSingle();
      if (data?.weight_kg != null) {
        setWeight(data.weight_kg);
        setTimeout(() => scrollToValue('weight', data.weight_kg), 100);
      }
      if (data?.height_cm != null) {
        setHeightCm(data.height_cm);
        setTimeout(() => scrollToValue('height', data.height_cm), 100);
      }
    })();
  }, []);

  const scrollToValue = (type: 'weight' | 'height', value: number) => {
    const index = type === 'weight'
      ? WEIGHT_RANGE.indexOf(Number(value.toFixed(1)))
      : HEIGHT_RANGE.indexOf(Math.round(value));
  
    if (index !== -1) {
      const scrollY = (index + TOP_SPACER_COUNT) * ITEM_HEIGHT;
      const scrollView = type === 'weight' ? weightScrollRef.current : heightScrollRef.current;
      scrollView?.scrollTo({ y: scrollY, animated: true });
    }
  };
  

  const handleWeightScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT) - TOP_SPACER_COUNT;
    if (index >= 0 && index < WEIGHT_RANGE.length) {
      setWeight(WEIGHT_RANGE[index]);
    }
  };
  

  const handleHeightScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT) - TOP_SPACER_COUNT;
    if (index >= 0 && index < HEIGHT_RANGE.length) {
      setHeightCm(HEIGHT_RANGE[index]);
    }
  };

  const onNext = async () => {
    try {
      if (weight <= 0) throw new Error('Peso inválido');
      if (heightCm <= 0) throw new Error('Altura inválida');
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      await supabase
        .from('initial_survey')
        .upsert({ user_id: userId, weight_kg: weight, height_cm: heightCm });
      navigation.navigate('DesiredPhysiqueQuestion');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  const renderSelector = (type: 'weight' | 'height', data: any[], value: number) => {
    const unit = type === 'weight' ? 'kg' : 'cm';
    const label = type === 'weight' ? 'Peso' : 'Altura';
    const scrollRef = type === 'weight' ? weightScrollRef : heightScrollRef;
    const handleScroll = type === 'weight' ? handleWeightScroll : handleHeightScroll;
    const displayValue = type === 'weight' ? value.toFixed(1) : value;

    return (
      <View style={[styles.selectorContainer, { 
        borderColor: theme.colors.borderNeon,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }]}>
        <Text style={[styles.selectorLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        
        {/* Valor destacado removido: el valor seleccionado se muestra centrado en el carril */}

        <View style={styles.selectorWheel}>
          {/* Línea indicadora central */}
          <View style={[styles.selectorIndicator, { 
            top: '50%', 
            backgroundColor: theme.colors.accent,
            height: 2,
          }]} />
          
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Items de relleno para centrado */}
            {Array.from({ length: TOP_SPACER_COUNT }).map((_, index) => (
              <View key={`empty-top-${index}`} style={styles.emptyItem} />
            ))}
            
            {data.map((item) => (
              <View
                key={item}
                style={[
                  styles.selectorItem,
                  { 
                    height: ITEM_HEIGHT,
                    opacity: item === value ? 1 : 0.6,
                  }
                ]}
              >
                <Text style={[
                  styles.selectorItemText,
                  { 
                    color: item === value ? theme.colors.accent : theme.colors.text,
                    fontSize: item === value ? 24 : 18,
                    fontWeight: item === value ? '800' : '600',
                  }
                ]}>
                  {type === 'weight' ? item.toFixed(1) : item}
                </Text>
              </View>
            ))}
            
            {/* Items de relleno para centrado */}
            {Array.from({ length: TOP_SPACER_COUNT }).map((_, index) => (
              <View key={`empty-bottom-${index}`} style={styles.emptyItem} />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}> 
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backButton, { 
              borderColor: theme.colors.borderNeon,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }]}
          > 
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { 
          color: theme.colors.accent,
          textShadowColor: theme.colors.accent + '80',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }]}>
          Tu peso y altura
        </Text>
        <Text style={[styles.subtitle, { 
          color: '#9CA3AF',
        }]}>
          Desliza para seleccionar tus datos
        </Text>
      </View>

      {/* Selectors Section */}
      <View style={styles.selectorsSection}>
        {renderSelector('weight', WEIGHT_RANGE, weight)}
        {renderSelector('height', HEIGHT_RANGE, heightCm)}
      </View>

      {/* BMI Indicator */}
      <View style={[styles.bmiSection, { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: theme.colors.borderNeon,
      }]}>
        <Text style={[styles.bmiLabel, { color: theme.colors.text }]}>
          Tu IMC aproximado:
        </Text>
        <Text style={[styles.bmiValue, { color: theme.colors.accent }]}>
          {(weight / ((heightCm / 100) ** 2)).toFixed(1)}
        </Text>
        <Text style={[styles.bmiCategory, { color: '#9CA3AF' }]}>
          {getBMICategory(weight / ((heightCm / 100) ** 2))}
        </Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[styles.nextBtn, { 
            opacity: loading ? 0.6 : 1,
          }]} 
          onPress={onNext}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.accent + 'CC']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextTxt, { 
              color: theme.colors.background,
            }]}>
              {loading ? 'Guardando...' : 'Continuar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Función auxiliar para categoría BMI
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidad grado I';
  if (bmi < 40) return 'Obesidad grado II';
  return 'Obesidad grado III';
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: '5%', // Usando porcentajes
    backgroundColor: '#000',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.04,
    marginBottom: '5%',
  },
  headerRow: {
    alignSelf: 'flex-start',
    marginBottom: '4%',
  },
  backButton: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1,
  },
  title: { 
    fontSize: 28,
    fontWeight: '800',
    marginBottom: '2%',
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: '10%',
    opacity: 0.9,
  },
  selectorsSection: {
    flex: 2.5,
    gap: '4%',
    marginBottom: 0,
  },
  selectorContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: '5%',
    height: '40%', 
    position: 'relative',
    overflow: 'hidden',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '4%',
  },
  selectorValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: '4%',
  },
  selectorValue: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 5,
  },
  selectorUnit: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectorWheel: {
    height: '70%',
    position: 'relative',
  },
  selectorItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorItemText: {
    textAlign: 'center',
  },
  emptyItem: {
    height: ITEM_HEIGHT,
  },
  selectorIndicator: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  bmiSection: {
    alignItems: 'center',
    marginTop: '2%',
    paddingTop: '2%',
    marginBottom: '6%',
    padding: '5%',
    borderRadius: 20,
    borderWidth: 1,
  },  
  bmiLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: '3%',
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: '2%',
  },
  bmiCategory: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonSection: {
    paddingBottom: '20%',
    alignItems: 'center',
  },
  nextBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 300,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTxt: { 
    fontWeight: '700',
    fontSize: 16,
  },
});