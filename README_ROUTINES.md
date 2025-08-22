# 🏋️ Sistema de Rutinas Personalizadas

Este proyecto incluye un sistema completo para crear, gestionar y personalizar rutinas de ejercicios.

## ✨ Características Principales

### 🎯 Crear Rutinas Personalizadas

- **Formulario completo** para configurar rutinas
- **Múltiples ejercicios** por rutina
- **Configuración detallada**: series, repeticiones, peso, descanso
- **Categorías**: Fuerza, Cardio, Flexibilidad, Mixto
- **Niveles de dificultad**: Principiante, Intermedio, Avanzado
- **Duración estimada** en minutos
- **Opciones de privacidad** (pública/privada)

### 📱 Pantallas Disponibles

#### 1. **CreateRoutineScreen**

- Formulario para crear nuevas rutinas
- Gestión dinámica de ejercicios
- Validaciones en tiempo real
- Interfaz intuitiva y responsive

#### 2. **MyRoutinesScreen**

- Lista de todas las rutinas del usuario
- Vista previa de ejercicios
- Estadísticas de cada rutina
- Opciones para editar y eliminar
- Estado vacío con call-to-action

### 🔧 Servicios y API

#### **Routines Service** (`src/services/routines.ts`)

- `createRoutine()` - Crear nueva rutina
- `getUserRoutines()` - Obtener rutinas del usuario
- `getRoutineById()` - Obtener rutina específica
- `updateRoutine()` - Actualizar rutina existente
- `deleteRoutine()` - Eliminar rutina
- `getPublicRoutines()` - Obtener rutinas públicas

## 🗄️ Base de Datos

### Tabla `routines`

```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  estimated_duration INTEGER NOT NULL,
  category VARCHAR(20) NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Seguridad

- **Row Level Security (RLS)** habilitado
- Usuarios solo pueden acceder a sus propias rutinas
- Rutinas públicas visibles para todos los usuarios autenticados
- Políticas de seguridad implementadas

## 🚀 Configuración

### 1. Base de Datos

Ejecuta el script SQL en tu proyecto de Supabase:

```bash
# Ve a SQL Editor en Supabase
# Copia y pega el contenido de database/migrations/create_routines_table.sql
# Ejecuta el script
```

### 2. Navegación

La funcionalidad está integrada en el navegador principal:

- **ProfileScreen** → Botón "Crear rutina personalizada"
- **ProfileScreen** → Menú "Mis Rutinas"
- **Navegación modal** para crear rutinas
- **Navegación de tarjeta** para ver rutinas

## 📱 Uso de la Aplicación

### Crear una Nueva Rutina

1. Ve a **Perfil** → **Crear rutina personalizada**
2. Completa la información básica:
   - Nombre de la rutina
   - Descripción (opcional)
   - Dificultad y categoría
   - Duración estimada
   - Visibilidad (pública/privada)
3. Agrega ejercicios:
   - Nombre del ejercicio
   - Series y repeticiones
   - Peso (opcional)
   - Tiempo de descanso
   - Notas (opcional)
4. Guarda la rutina

### Gestionar Rutinas

1. Ve a **Perfil** → **Mis Rutinas**
2. Visualiza todas tus rutinas creadas
3. Accede a estadísticas y detalles
4. Edita o elimina rutinas según necesites

## 🎨 Interfaz de Usuario

### Diseño Responsive

- **Adaptable** a diferentes tamaños de pantalla
- **Tema dinámico** que se adapta al contexto del usuario
- **Animaciones suaves** y transiciones
- **Iconografía clara** y consistente

### Componentes Reutilizables

- **ExerciseCard** - Tarjeta de ejercicio individual
- **RoutineCard** - Tarjeta de rutina completa
- **MenuItem** - Elementos de menú consistentes
- **Formularios** - Inputs y controles estandarizados

## 🔮 Próximas Funcionalidades

- [ ] **Edición de rutinas** existentes
- [ ] **Plantillas de ejercicios** predefinidas
- [ ] **Compartir rutinas** con otros usuarios
- [ ] **Importar/exportar** rutinas
- [ ] **Seguimiento de progreso** por rutina
- [ ] **Notificaciones** de recordatorio
- [ ] **Estadísticas avanzadas** de uso

## 🐛 Solución de Problemas

### Error al crear rutina

- Verifica que estés autenticado
- Asegúrate de que la tabla `routines` esté creada
- Revisa los logs de Supabase

### Rutinas no se cargan

- Verifica la conexión a internet
- Revisa que las políticas RLS estén configuradas
- Confirma que el usuario tenga permisos

### Problemas de navegación

- Verifica que las pantallas estén registradas en el navegador
- Confirma que los nombres de ruta coincidan

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [Expo](https://docs.expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)

---

**¡Disfruta creando y gestionando tus rutinas de ejercicios personalizadas! 💪**
