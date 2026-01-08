import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.multistoresaas.app',
  appName: 'Multi Store SaaS',
  webDir: 'build/client',
  server: {
    // For local development:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
    
    // For production (Wrapper mode):
    url: 'https://digitalcare.site', 
    androidScheme: 'https'
  }
};

export default config;
