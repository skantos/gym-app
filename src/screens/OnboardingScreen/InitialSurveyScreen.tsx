import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { getDb } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

type SurveyData = {
  goal: string;
  targetDays: number;
  bodyType: string;
  hoursPerWeek: number;
  hasGym: boolean;
  experience: string;
  motivation: string;
};

const GOALS = [
  { id: 'lose_weight', label: 'Perder peso', icon: 'trending-down' },
  { id: 'gain_muscle', label: 'Ganar músculo', icon: 'fitness' },
  { id: 'maintain', label: 'Mantener forma', icon: 'heart' },
  { id: 'strength', label: 'Aumentar fuerza', icon: 'flash' },
  { id: 'endurance', label: 'Mejorar resistencia', icon: 'timer' },
];

const BODY_TYPES = [
  { id: 'athletic', label: 'Atlético', icon: 'body' },
  { id: 'slim', label: 'Delgado', icon: 'person' },
  { id: 'muscular', label: 'Musculoso', icon: 'fitness' },
  { id: 'curvy', label: 'Curvilíneo', icon: 'body' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Principiante', description: 'Nunca he entrenado' },
  { id: 'intermediate', label: 'Intermedio', description: 'Algo de experiencia' },
  { id: 'advanced', label: 'Avanzado', description: 'Entreno regularmente' },
];

export default function InitialSurveyScreen({ navigation }: any) {
  const theme = useTheme();
  const { user, markSurveyCompleted } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    goal: '',
    targetDays: 30,
    bodyType: '',
    hoursPerWeek: 3,
    hasGym: true,
    experience: '',
    motivation: '',
  });

  const steps = [
    {
      title: '¿Cuál es tu meta principal?',
      subtitle: 'Elige lo que más te motiva',
      component: (
        <View style={styles.optionsContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.goal === goal.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, goal: goal.id })}
            >
              <Ionicons name={goal.icon as any} size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{goal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    },
    {
      title: '¿En cuántos días quieres lograr tu meta?',
      subtitle: 'Sé realista con tu tiempo',
      component: (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Días objetivo</Text>
          <TextInput
            style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.card }]}
            value={surveyData.targetDays.toString()}
            onChangeText={(text) => setSurveyData({ ...surveyData, targetDays: parseInt(text) || 30 })}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor="#aaa"
          />
          <Text style={[styles.inputHint, { color: theme.colors.text }]}>
            Recomendamos entre 30-90 días para resultados sostenibles
          </Text>
        </View>
      )
    },
    {
      title: '¿Qué tipo de cuerpo quieres lograr?',
      subtitle: 'Elige tu objetivo físico',
      component: (
        <View style={styles.optionsContainer}>
          {BODY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.bodyType === type.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, bodyType: type.id })}
            >
              <Ionicons name={type.icon as any} size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    },
    {
      title: '¿Cuántas horas por semana puedes dedicar?',
      subtitle: 'Sé honesto con tu disponibilidad',
      component: (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Horas por semana</Text>
          <TextInput
            style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.card }]}
            value={surveyData.hoursPerWeek.toString()}
            onChangeText={(text) => setSurveyData({ ...surveyData, hoursPerWeek: parseInt(text) || 3 })}
            keyboardType="numeric"
            placeholder="3"
            placeholderTextColor="#aaa"
          />
          <Text style={[styles.inputHint, { color: theme.colors.text }]}>
            Incluye tiempo de entrenamiento y preparación
          </Text>
        </View>
      )
    },
    {
      title: '¿Tienes acceso a un gimnasio?',
      subtitle: 'Esto nos ayudará a personalizar tu rutina',
      component: (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.card },
              surveyData.hasGym && { borderColor: theme.colors.accent, borderWidth: 2 }
            ]}
            onPress={() => setSurveyData({ ...surveyData, hasGym: true })}
          >
            <Ionicons name="fitness" size={24} color={theme.colors.accent} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Sí, tengo gimnasio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.card },
              !surveyData.hasGym && { borderColor: theme.colors.accent, borderWidth: 2 }
            ]}
            onPress={() => setSurveyData({ ...surveyData, hasGym: false })}
          >
            <Ionicons name="home" size={24} color={theme.colors.accent} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Solo en casa</Text>
          </TouchableOpacity>
        </View>
      )
    },
    {
      title: '¿Cuál es tu nivel de experiencia?',
      subtitle: 'Para adaptar la dificultad',
      component: (
        <View style={styles.optionsContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.experience === level.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, experience: level.id })}
            >
              <View style={styles.experienceContent}>
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{level.label}</Text>
                <Text style={[styles.experienceDescription, { color: theme.colors.text }]}>{level.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )
    },
    {
      title: '¿Qué te motiva más?',
      subtitle: 'Cuéntanos tu principal motivación',
      component: (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Tu motivación</Text>
          <TextInput
            style={[styles.textArea, { color: theme.colors.text, borderColor: theme.colors.card }]}
            value={surveyData.motivation}
            onChangeText={(text) => setSurveyData({ ...surveyData, motivation: text })}
            placeholder="Ej: Quiero sentirme más fuerte y confiado..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )
    }
  ];

  const canProceed = () => {
    const step = steps[currentStep];
    if (step.title.includes('meta principal') && !surveyData.goal) return false;
    if (step.title.includes('tipo de cuerpo') && !surveyData.bodyType) return false;
    if (step.title.includes('experiencia') && !surveyData.experience) return false;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      if (!user?.id) return;
      
      const db = getDb();
      await setDoc(doc(db, 'initial_survey', user.id), {
        ...surveyData,
        userId: user.id,
        completedAt: serverTimestamp(),
      });

      // Marcar que el usuario ya completó el survey
      await setDoc(doc(db, 'users', user.id), {
        hasCompletedSurvey: true,
        surveyCompletedAt: serverTimestamp(),
      }, { merge: true });

      // Actualizar estado local para que AppNavigator redirija
      try { require('../../context/UserContext'); } catch {}
      // Usar el hook para marcar completado
      // Nota: ya tenemos useUser arriba
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      markSurveyCompleted && markSurveyCompleted();

      Alert.alert(
        '¡Perfecto!',
        'Tu perfil ha sido configurado. Ahora podemos crear rutinas personalizadas para ti.',
        [{ text: 'Continuar', onPress: () => {/* AppNavigator decidirá destino */} }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar tu información. Intenta de nuevo.');
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.card }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.accent,
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {currentStep + 1} de {steps.length}
          </Text>
        </View>

        {/* Step Content */}
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            {currentStepData.title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.text }]}>
            {currentStepData.subtitle}
          </Text>
          
          <View style={styles.stepContent}>
            {currentStepData.component}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backButton, { borderColor: theme.colors.card }]}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            <Text style={[styles.navButtonText, { color: theme.colors.text }]}>Atrás</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton, 
            { backgroundColor: theme.colors.accent },
            !canProceed() && { opacity: 0.5 }
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[styles.navButtonText, { color: '#000' }]}>
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Text>
          {currentStep < steps.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 40,
  },
  stepContent: {
    flex: 1,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  experienceContent: {
    flex: 1,
    marginLeft: 16,
  },
  experienceDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  inputHint: {
    fontSize: 14,
    opacity: 0.7,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
  },
  backButton: {
    borderWidth: 1,
  },
  nextButton: {
    flex: 2,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});
