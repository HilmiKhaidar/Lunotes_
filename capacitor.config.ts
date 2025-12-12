import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lunetix.lunotes',
  appName: 'Lunotes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      backgroundColor: '#FBBF24',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FBBF24'
    }
  }
};

export default config;
