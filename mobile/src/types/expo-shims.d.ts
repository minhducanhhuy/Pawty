declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear?(): Promise<void>;
  };
  export default AsyncStorage;
}

declare module 'expo-image-picker' {
  export interface ImagePickerAsset {
    uri: string;
    width?: number;
    height?: number;
  }
  export interface ImagePickerResult {
    canceled: boolean;
    assets?: ImagePickerAsset[] | null;
  }
  export function launchImageLibraryAsync(options?: {
    mediaTypes?: string[];
    quality?: number;
  }): Promise<ImagePickerResult>;
}

declare module 'expo-clipboard' {
  export function setStringAsync(text: string): Promise<boolean>;
  export function getStringAsync(): Promise<string>;
}

