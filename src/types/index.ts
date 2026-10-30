export type CurrencyCode = 'SAR' | 'EGP' | 'AED' | 'KWD' | 'USD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToSar: number; // 1 SAR = X target currency
  flag: string;
}

export type TimezoneCode = 'makkah' | 'cairo' | 'dubai' | 'london';

export interface TimezoneInfo {
  code: TimezoneCode;
  name: string;
  offsetLabel: string;
  utcOffset: number;
}

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  ageBracket: string;
  minAge: number;
  maxAge: number;
  category: 'quran' | 'arabic' | 'values' | 'tech' | 'mothers';
  deliveryMode: 'online';
  image: string;
  description: string;
  weeklySessions: number;
  sessionDurationMins: number;
  priceSar: number;
  installmentsEligible: boolean;
  features: string[];
  syllabusWeeks: { week: number; topic: string; details: string }[];
  instructorName: string;
  instructorTitle: string;
}

export interface Student {
  id: string;
  childName: string;
  age: number;
  parentName: string;
  parentPhone: string;
  country: string;
  program: string;
  level: string;
  memorizedSurahs: string[];
  attendanceRate: number;
  teacherNotes: string;
  status: 'active' | 'trial' | 'completed';
  enrolledAt: string;
}

export interface TeacherPayout {
  id: string;
  teacherEmail: string;
  teacherName: string;
  month: string;
  hoursCompleted: number;
  hourlyRateSar: number;
  totalEarningsSar: number;
  payoutStatus: 'paid' | 'pending';
  maskedCardNumber: string;
  bankName: string;
  ibanMasked: string;
}

export interface UserAuth {
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  token: string;
  permissions: string[];
}
