-- Crear tabla de rutinas
CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]',
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER NOT NULL DEFAULT 30,
  category VARCHAR(20) NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'mixed')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_routines_created_by ON routines(created_by);
CREATE INDEX IF NOT EXISTS idx_routines_is_public ON routines(is_public);
CREATE INDEX IF NOT EXISTS idx_routines_category ON routines(category);
CREATE INDEX IF NOT EXISTS idx_routines_difficulty ON routines(difficulty);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Los usuarios pueden ver sus propias rutinas
CREATE POLICY "Users can view their own routines" ON routines
  FOR SELECT USING (auth.uid() = created_by);

-- Los usuarios pueden ver rutinas públicas
CREATE POLICY "Users can view public routines" ON routines
  FOR SELECT USING (is_public = true);

-- Los usuarios pueden crear rutinas
CREATE POLICY "Users can create routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Los usuarios pueden actualizar sus propias rutinas
CREATE POLICY "Users can update their own routines" ON routines
  FOR UPDATE USING (auth.uid() = created_by);

-- Los usuarios pueden eliminar sus propias rutinas
CREATE POLICY "Users can delete their own routines" ON routines
  FOR DELETE USING (auth.uid() = created_by);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
