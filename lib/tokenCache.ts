import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const createTokenCache = () => {
  return {
    getToken: async (key: string) => {
      try {
        if (Platform.OS === 'web') {
          return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem(key, token);
        } else {
          await SecureStore.setItemAsync(key, token);
        }
      } catch (error) {
        console.error('Error saving token:', error);
      }
    },
  };
};

export const tokenCache = createTokenCache();
