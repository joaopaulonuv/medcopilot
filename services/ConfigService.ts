import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppConfig {
  serverUrl: string;
  autoAnalysis: boolean;
  highQualityAudio: boolean;
  notifications: boolean;
}

export class ConfigService {
  private static readonly CONFIG_KEY = 'app_config';
  
  private static readonly defaultConfig: AppConfig = {
    serverUrl: 'http://localhost:3000',
    autoAnalysis: true,
    highQualityAudio: true,
    notifications: true,
  };

  static async getConfig(): Promise<AppConfig> {
    try {
      const configData = await AsyncStorage.getItem(this.CONFIG_KEY);
      
      if (!configData) {
        return this.defaultConfig;
      }

      const config = JSON.parse(configData) as AppConfig;
      return { ...this.defaultConfig, ...config };
    } catch (error) {
      console.error('Failed to load config:', error);
      return this.defaultConfig;
    }
  }

  static async saveConfig(config: Partial<AppConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      
      await AsyncStorage.setItem(this.CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  static async resetConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CONFIG_KEY);
    } catch (error) {
      console.error('Failed to reset config:', error);
      throw new Error('Failed to reset configuration');
    }
  }
}