import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: config.name ?? 'gym-app',
  slug: config.slug ?? 'gym-app',
  owner: (config as any).owner ?? 'gonza96472',
  version: config.version ?? '1.0.0',
  orientation: config.orientation ?? 'portrait',
  icon: config.icon ?? './assets/icon.png',
  userInterfaceStyle: config.userInterfaceStyle ?? 'light',
  newArchEnabled: (config as any).newArchEnabled ?? false,
  splash: config.splash ?? {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    ...(config.ios || {}),
    bundleIdentifier: (config.ios as any)?.bundleIdentifier || 'com.gonza96472.gymapp',
    supportsTablet: (config.ios as any)?.supportsTablet ?? true,
  },
  android: {
    ...(config.android || {}),
    package: (config.android as any)?.package || 'com.gonza96472.gymapp',
    adaptiveIcon: (config.android as any)?.adaptiveIcon ?? {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: (config.android as any)?.edgeToEdgeEnabled ?? true,
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