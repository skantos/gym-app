import { supabase } from './supabase';
import { Exercise, Routine, CreateRoutineData } from '../types/routines';

// Crear una nueva rutina
export const createRoutine = async (
  routineData: CreateRoutineData
): Promise<Routine> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const routine: Routine = {
      ...routineData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('routines')
      .insert([routine])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al crear rutina:', error);
    throw error;
  }
};

// Obtener rutinas del usuario
export const getUserRoutines = async (): Promise<Routine[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('createdBy', user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    throw error;
  }
};

// Obtener rutina por ID
export const getRoutineById = async (
  routineId: string
): Promise<Routine | null> => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al obtener rutina:', error);
    throw error;
  }
};

// Actualizar rutina
export const updateRoutine = async (
  routineId: string,
  updates: Partial<Routine>
): Promise<Routine> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('routines')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', routineId)
      .eq('createdBy', user.id) // Solo el creador puede actualizar
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    throw error;
  }
};

// Eliminar rutina
export const deleteRoutine = async (routineId: string): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', routineId)
      .eq('createdBy', user.id); // Solo el creador puede eliminar

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    throw error;
  }
};

// Obtener rutinas públicas
export const getPublicRoutines = async (): Promise<Routine[]> => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('isPublic', true)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error al obtener rutinas públicas:', error);
    throw error;
  }
};
