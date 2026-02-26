import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ozzyl.app',
  appName: 'Ozzyl',
  webDir: 'build/client',
  server: {
    // For local development:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
    
    // For production (Wrapper mode):
    url: 'https://app.ozzyl.com', 
    androidScheme: 'https'
  }
};

export default config;
