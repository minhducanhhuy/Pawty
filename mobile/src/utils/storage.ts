import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe wrapper around AsyncStorage with in-memory fallback
const memFallback = new Map<string, string>();

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(key);
        return val;
      }
    } catch (err) {
      console.warn('[Storage] AsyncStorage.getItem failed, using fallback:', err);
    }
    return memFallback.get(key) ?? null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
        return;
      }
    } catch (err) {
      console.warn('[Storage] AsyncStorage.setItem failed, using fallback:', err);
    }
    memFallback.set(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
        return;
      }
    } catch (err) {
      console.warn('[Storage] AsyncStorage.removeItem failed, using fallback:', err);
    }
    memFallback.delete(key);
  },

  clear: async (): Promise<void> => {
    try {
      const anyStorage = AsyncStorage as any;
      if (anyStorage && typeof anyStorage.clear === 'function') {
        await anyStorage.clear();
        return;
      }
    } catch (err) {
      console.warn('[Storage] AsyncStorage.clear failed, using fallback:', err);
    }
    memFallback.clear();
  },
};

export default storage;
