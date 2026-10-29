export type PawtyThemeId = 'coral' | 'mint' | 'mocha' | 'dark';

export interface PawtyThemePalette {
  id: PawtyThemeId;
  name: string;
  description: string;
  bg: string;
  card: string;
  subtle: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  secondarySoft: string;
  text: string;
  textMuted: string;
  border: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  isDark: boolean;
}

export const PAWTY_THEMES: Record<PawtyThemeId, PawtyThemePalette> = {
  coral: {
    id: 'coral',
    name: 'San Hô Ấm',
    description: 'Tông kem ấm và cam san hô dịu nhẹ',
    bg: '#FDFBF7',
    card: '#FFFFFF',
    subtle: '#F6F2EC',
    primary: '#E06B58',
    primarySoft: '#FCEEEB',
    secondary: '#3D8B7A',
    secondarySoft: '#E8F5F1',
    text: '#262522',
    textMuted: '#6E6A63',
    border: '#EDE7DD',
    danger: '#D94E4E',
    dangerSoft: '#FDECEC',
    warning: '#C87D28',
    warningSoft: '#FDF4E7',
    isDark: false,
  },
  mint: {
    id: 'mint',
    name: 'Xanh Lá Dịu',
    description: 'Tươi mát, nhẹ nhàng cho mắt',
    bg: '#F8FBF9',
    card: '#FFFFFF',
    subtle: '#EDF4F1',
    primary: '#347E6E',
    primarySoft: '#E3F2EE',
    secondary: '#D9735E',
    secondarySoft: '#FCEEEB',
    text: '#1F2926',
    textMuted: '#5F6F6A',
    border: '#DFECE7',
    danger: '#D94E4E',
    dangerSoft: '#FDECEC',
    warning: '#C87D28',
    warningSoft: '#FDF4E7',
    isDark: false,
  },
  mocha: {
    id: 'mocha',
    name: 'Nâu Latte',
    description: 'Trầm ấm, tối giản phong cách Bắc Âu',
    bg: '#FCF9F5',
    card: '#FFFFFF',
    subtle: '#F4EDE4',
    primary: '#8C6246',
    primarySoft: '#F3E7DD',
    secondary: '#4A7C6F',
    secondarySoft: '#E8F2EF',
    text: '#2B231D',
    textMuted: '#75685E',
    border: '#EAE0D5',
    danger: '#D94E4E',
    dangerSoft: '#FDECEC',
    warning: '#C87D28',
    warningSoft: '#FDF4E7',
    isDark: false,
  },
  dark: {
    id: 'dark',
    name: 'Tối Dịu Mắt',
    description: 'Nền tối ấm áp khi dùng buổi tối',
    bg: '#17191E',
    card: '#22252C',
    subtle: '#2B2F38',
    primary: '#ED7D6B',
    primarySoft: '#3B2826',
    secondary: '#56B39E',
    secondarySoft: '#203833',
    text: '#F5F3EF',
    textMuted: '#9CA3AF',
    border: '#323640',
    danger: '#EF6B6B',
    dangerSoft: '#3B2225',
    warning: '#E5A445',
    warningSoft: '#382E1E',
    isDark: true,
  },
};

export const PAWTY_COLORS = {
  coral: '#E06B58',
  coralDark: '#C95644',
  coralSoft: '#FCEEEB',
  mint: '#3D8B7A',
  mintDark: '#2E6F60',
  mintSoft: '#E8F5F1',
  cream: '#FDFBF7',
  white: '#FFFFFF',
  charcoal: '#262522',
  slate: '#6E6A63',
  muted: '#9CA3AF',
  border: '#EDE7DD',
  amber: '#C87D28',
  amberSoft: '#FDF4E7',
  danger: '#D94E4E',
  dangerSoft: '#FDECEC',
  gold: '#C87D28',
  goldSoft: '#FDF4E7',
} as const;
