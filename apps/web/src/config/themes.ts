import type { PetProfile } from '@pawty/types';

export interface SearchableUserTag {
  id: string;
  tag: string;
  displayName: string;
  avatarUrl: string;
  area: string;
  petsSummary: string;
}

export interface AppNotificationItem {
  id: string;
  type: 'care_invite' | 'walk_invite' | 'task_done' | 'system';
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  invitePayload?: {
    fromUserName: string;
    fromUserTag: string;
    petId: string;
    petName: string;
    petSpecies: 'dog' | 'cat';
    petBreed: string;
    petWeightKg: number;
    petAgeLabel: string;
    petAvatarUrl: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export const SUGGESTED_HASHTAGS: string[] = [
  '#DiDaoChieu',
  '#ChamSocCho',
  '#ChamSocMeo',
  '#DinhDuong',
  '#TimBanDiDao',
  '#KinhNghiemNuoi',
  '#GocDangYeu',
  '#ThuY',
];

export const EMPTY_WEB_PET: PetProfile = {
  id: '',
  householdId: '',
  ownerId: '',
  name: 'Thú cưng',
  species: 'dog',
  breed: 'Chưa cập nhật',
  gender: 'unknown',
  dateOfBirth: '',
  ageDisplay: '',
  weightKg: 0,
  sizeCategory: 'medium',
  energyLevel: 'medium',
  avatarUrl: '/assets/pawty-icon.png',
  coverPhotoUrl: '/assets/pawty-logo-full.png',
  isNeutered: false,
  allergies: '',
  medicalNotes: '',
  vetName: '',
  vetContact: '',
  vaccinationStatus: 'unknown',
  isPublic: true,
  followerCount: 0,
  behaviors: [],
  vaccinations: [],
  weightHistory: [],
};

export type WebThemeId = 'coral' | 'mint' | 'mocha' | 'dark';

export interface WebThemePalette {
  id: WebThemeId;
  name: string;
  description: string;
  primary: string;
  primarySoft: string;
  bg: string;
  surface: string;
  text: string;
  textSoft: string;
  border: string;
}

export const WEB_THEMES: Record<WebThemeId, WebThemePalette> = {
  coral: {
    id: 'coral',
    name: 'San Hô Ấm',
    description: 'Tông cam san hô nhẹ nhàng, nền kem ấm áp',
    primary: '#E86A58',
    primarySoft: '#FDECE9',
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    text: '#23201E',
    textSoft: '#605A55',
    border: '#EAE4DC',
  },
  mint: {
    id: 'mint',
    name: 'Xanh Lá Dịu',
    description: 'Tông xanh lá tự nhiên, mát mắt và thư giãn',
    primary: '#2F8F78',
    primarySoft: '#E3F4EF',
    bg: '#F6FAF8',
    surface: '#FFFFFF',
    text: '#1D2825',
    textSoft: '#52635E',
    border: '#DCE8E3',
  },
  mocha: {
    id: 'mocha',
    name: 'Nâu Latte',
    description: 'Tông nâu cà phê sữa tối giản, sang trọng',
    primary: '#9C6B4E',
    primarySoft: '#F5EBE4',
    bg: '#FAF7F4',
    surface: '#FFFFFF',
    text: '#29221E',
    textSoft: '#695C54',
    border: '#E8DFD8',
  },
  dark: {
    id: 'dark',
    name: 'Tối Dịu Mắt',
    description: 'Nền tối ấm áp, giảm mỏi mắt khi dùng ban đêm',
    primary: '#F07B6B',
    primarySoft: '#362523',
    bg: '#161514',
    surface: '#211F1D',
    text: '#F5F2EE',
    textSoft: '#B8B0A8',
    border: '#332F2C',
  },
};

