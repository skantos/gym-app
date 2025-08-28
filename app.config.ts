import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: config.name ?? 'gym-app',
  slug: config.slug ?? 'gym-app',
  version: config.version ?? '1.0.0',
  orientation: config.orientation ?? 'portrait',
  icon: config.icon ?? './assets/icon.png',
  userInterfaceStyle: config.userInterfaceStyle ?? 'light',
  newArchEnabled: (config as any).newArchEnabled ?? true,
  splash: config.splash ?? {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: config.ios ?? { supportsTablet: true },
  android: config.android ?? {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
  },
  web: config.web ?? { favicon: './assets/favicon.png' },
  plugins: config.plugins ?? ['expo-font'],
  extra: {
    ...(config.extra || {}),
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});