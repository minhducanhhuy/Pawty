declare module '@expo/vector-icons' {
  import * as React from 'react';
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  export const Feather: React.ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };
}

