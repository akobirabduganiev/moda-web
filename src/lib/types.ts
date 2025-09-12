// Shared DTO types aligned with backend

export type TotalItem = {
  moodType: string;
  count: number;
  percent: number;
  emoji?: string;
};

export type LiveStatsDto = {
  scope: string; // GLOBAL or COUNTRY code
  country?: string | null;
  date: string; // YYYY-MM-DD
  totalCount: number;
  top: string[];
  totals: TotalItem[];
};

export type CountryDto = {
  code: string;
  name: string;
  emoji: string;
};

export type ShareTotalItem = {
  moodType: string;
  label: string;
  emoji: string;
  count: number;
  percent: number;
};

export type ShareTodayResponse = {
  scope: string;
  country: string | null;
  countryName: string | null;
  countryEmoji: string | null;
  date: string;
  totalCount: number;
  top: string[];
  totals: ShareTotalItem[];
};

// Auth
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = {
  sent: boolean;
  verificationToken?: string | null;
};

// Mood types
export type MoodTypeDto = {
  code: string;
  label: string;
  emoji: string;
};

// Mood submit
export type SubmitMoodRequest = {
  moodType: string;
  country: string;
  comment?: string | null;
};

export type SubmitMoodResponse = {
  status: string;
  shareCardUrl: string;
};
