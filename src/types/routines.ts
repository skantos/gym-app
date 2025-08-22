export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime: number;
  notes?: string;
}

export interface Routine {
  id?: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // en minutos
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  isPublic: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoutineData {
  name: string;
  description?: string;
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  isPublic: boolean;
}

export interface UpdateRoutineData extends Partial<CreateRoutineData> {
  id: string;
}

// Tipos para la navegación
export type RoutineStackParamList = {
  MainTabs: undefined;
  CreateRoutine: undefined;
  MyRoutines: undefined;
  EditRoutine: { routineId: string };
  ViewRoutine: { routineId: string };
};

// Tipos para los filtros de rutinas
export interface RoutineFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  maxDuration?: number;
  isPublic?: boolean;
}

// Tipos para las estadísticas de rutinas
export interface RoutineStats {
  totalRoutines: number;
  totalExercises: number;
  averageDuration: number;
  mostUsedCategory: string;
  mostUsedDifficulty: string;
}
