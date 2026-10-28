import { Platform } from 'react-native';

export const FONTS = {
  heading: Platform.select({ ios: 'Fredoka', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'Nunito', android: 'sans-serif', default: 'System' }),
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    fontWeight: '800' as const,
    lineHeight: 32,
  },
  h2: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  h3: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
} as const;
