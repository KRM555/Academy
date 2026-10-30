export type CurrencyCode = 'SAR' | 'EGP' | 'AED' | 'KWD' | 'USD';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToSar: number; // Approximate conversion rate against base billing currency (SAR)
  isApproximate?: boolean;
  flag?: string; // Optional code/tag indicator (no broken Windows emojis in Phase 4)
}

export type TimezoneCode = 'makkah' | 'cairo' | 'dubai' | 'london';

export interface TimezoneInfo {
  code: TimezoneCode;
  name: string;
  ianaZone: string; // Real IANA timezone identifier for Intl.DateTimeFormat (Phase 3.4)
  offsetLabel: string;
  utcOffset?: number;
}

export interface SyllabusWeek {
  week: number;
  topic: string;
  details: string;
}

export type Program = ProgramCourse & {
  syllabusWeeks?: SyllabusWeek[];
};

export interface ProgramCourse {
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
  billingUnit: string; // e.g. 'شهرياً / monthly'
  installmentsEligible: boolean;
  features: string[];
  instructorName?: string;
  instructorTitle?: string;
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
  assignedTeacherEmail?: string;
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
  bankName: string;
  accountHolderName: string;
  ibanMasked: string; // Only masked IBAN returned to client (e.g. SA***4589)
}

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  permissions: string[];
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface RegisteredLead {
  id: string;
  childName: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  country: string;
  programTitle: string;
  preferredTimezone: string;
  customNote?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'scheduled' | 'enrolled';
}

// Canonical list of Surahs in the Holy Quran for strict server validation (Phase 3.10)
export const CANONICAL_SURAHS: readonly string[] = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة',
  'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس'
] as const;
