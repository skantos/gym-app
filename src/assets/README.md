# Assets (imágenes)

Guarda aquí las imágenes de la app. Recomendación: organizar por secciones, por ejemplo:

- images/onboarding/
- images/profile/
- images/routines/

Ejemplo de uso en React Native/Expo:

```ts
// Import estático (requiere ruta relativa fija)
import exampleImg from '../assets/images/onboarding/example.png';

// O con require dinámico (cuando la ruta es fija en tiempo de build)
const img = require('../assets/images/onboarding/example.png');
```

Nota: Para cargas remotas usa { uri: 'https://...' } en lugar de require/import.
