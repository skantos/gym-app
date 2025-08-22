# Configuración de la Base de Datos

## Tabla de Rutinas

Para que la funcionalidad de crear rutinas personalizadas funcione correctamente, necesitas ejecutar el script SQL en tu base de datos de Supabase.

### Pasos para configurar:

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `create_routines_table.sql`
4. Ejecuta el script

### Estructura de la tabla:

La tabla `routines` incluye los siguientes campos:

- **id**: Identificador único de la rutina (UUID)
- **name**: Nombre de la rutina
- **description**: Descripción opcional
- **exercises**: Array JSON con los ejercicios de la rutina
- **difficulty**: Nivel de dificultad (beginner, intermediate, advanced)
- **estimated_duration**: Duración estimada en minutos
- **category**: Categoría de la rutina (strength, cardio, flexibility, mixed)
- **is_public**: Si la rutina es pública o privada
- **created_by**: ID del usuario que creó la rutina
- **created_at**: Fecha de creación
- **updated_at**: Fecha de última actualización

### Seguridad:

- Se ha habilitado Row Level Security (RLS)
- Los usuarios solo pueden ver, editar y eliminar sus propias rutinas
- Las rutinas públicas son visibles para todos los usuarios autenticados
- Se incluyen índices para optimizar el rendimiento

### Ejemplo de datos de ejercicio:

```json
{
  "id": "unique_id",
  "name": "Press de banca",
  "sets": 3,
  "reps": 10,
  "weight": 80,
  "restTime": 120,
  "notes": "Mantener la espalda recta"
}
```
