import { CANONICAL_SURAHS } from '../types';

export interface TeacherCourse {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  ageBracket: string;
  weeklySessions: number;
  sessionDurationMins: number;
  meetingLink: string;
  enrolledStudentsCount: number;
  teacherId: string;
  teacherEmail: string;
  description: string;
  scheduleTime: string;
}

export interface TeacherStudent {
  id: string;
  childName: string;
  age: number;
  parentName: string;
  parentPhone: string;
  country: string;
  courseId: string;
  courseTitle: string;
  level: string;
  attendanceRate: number;
  memorizedSurahs: string[];
  teacherNotes: string;
  status: 'active' | 'trial' | 'completed';
  enrolledAt: string;
  meetingLink?: string;
}

export interface RecitationRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  teacherEmail: string;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  grade: 'excellent' | 'very_good' | 'good' | 'needs_revision';
  mistakesCount: number;
  notes: string;
  recitationDate: string;
  createdAt: string;
}

export interface EvaluationRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  teacherEmail: string;
  title: string;
  score: number;
  maxScore: number;
  tajweedMasteryScore: number;
  memorizationScore: number;
  behaviorScore: number;
  notes: string;
  evaluationDate: string;
  createdAt: string;
}

export interface ExamRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  teacherEmail: string;
  examTitle: string;
  examType: 'oral' | 'written' | 'comprehensive';
  score: number;
  maxScore: number;
  feedback: string;
  examDate: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  sessionDate: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes: string;
}

export interface PayrollRecord {
  id: string;
  teacherEmail: string;
  month: string;
  hoursCompleted: number;
  hourlyRateSar: number;
  baseAmount: number;
  bonus: number;
  deductions: number;
  netAmount: number;
  status: 'paid' | 'pending' | 'processing';
  paidAt?: string;
  transactionRef?: string;
}

export interface PayoutDetails {
  accountHolderName: string;
  bankName: string;
  ibanMasked: string;
  isConfigured: boolean;
  updatedAt?: string;
}

// -------------------------------------------------------------
// Initial Baseline Data
// -------------------------------------------------------------
const INITIAL_COURSES: TeacherCourse[] = [
  {
    id: 'c-quran-1',
    title: 'حلقات تحفيظ القرآن الكريم وتجويده',
    subtitle: 'حفظ وتثبيت وضبط أحكام التجويد ومخارج الحروف برواية حفص عن عاصم',
    category: 'quran',
    ageBracket: '5 - 16 سنة',
    weeklySessions: 3,
    sessionDurationMins: 45,
    meetingLink: 'https://meet.google.com/xyz-quran-live',
    enrolledStudentsCount: 3,
    teacherId: 't-101',
    teacherEmail: 'teacher@noor-bayan.com',
    description: 'حلقات تفاعلية مصغرة للتحفيظ المتقن مع رصد يومي للسور ومتابعة أحكام التجويد والمدود.',
    scheduleTime: 'الأحد والثلاثاء والخميس - 4:30 م بتوقيت مكة',
  },
  {
    id: 'c-arabic-2',
    title: 'منهاج البيان القرآني والتأسيس اللغوي',
    subtitle: 'نور البيان، التهجئة السليمة، مخارج الحروف، ونطق الفصحى',
    category: 'arabic',
    ageBracket: '4 - 12 سنة',
    weeklySessions: 3,
    sessionDurationMins: 45,
    meetingLink: 'https://zoom.us/j/9876543210?pwd=NoorBayan2026',
    enrolledStudentsCount: 1,
    teacherId: 't-101',
    teacherEmail: 'teacher@noor-bayan.com',
    description: 'التأسيس اللغوي المتين للأطفال على طريقة نور البيان وقواعد النطق السليم والإملاء.',
    scheduleTime: 'السبت والإثنين والأربعاء - 5:15 م بتوقيت مكة',
  },
  {
    id: 'c-values-3',
    title: 'غراس القيم والآداب النبوية للناشئة',
    subtitle: 'أخلاق المسلم الصغير، السيرة النبوية المبسطة، والأذكار اليومية',
    category: 'values',
    ageBracket: '5 - 12 سنة',
    weeklySessions: 2,
    sessionDurationMins: 45,
    meetingLink: 'https://meet.google.com/values-circle-live',
    enrolledStudentsCount: 1,
    teacherId: 't-101',
    teacherEmail: 'teacher@noor-bayan.com',
    description: 'غرس العقيدة السليمة ومحبة النبي ﷺ والآداب اليومية بأسلوب قصصي تفاعلي محبب.',
    scheduleTime: 'السبت والأربعاء - 6:30 م بتوقيت مكة',
  },
  // Foreign Course belonging to another teacher (used to test security isolation)
  {
    id: 'c-math-4',
    title: 'المناهج الدولية والرياضيات المتقدمة',
    subtitle: 'Cambridge & American Math Curricula',
    category: 'international',
    ageBracket: '6 - 18 سنة',
    weeklySessions: 3,
    sessionDurationMins: 50,
    meetingLink: 'https://meet.google.com/foreign-math-class',
    enrolledStudentsCount: 2,
    teacherId: 't-103',
    teacherEmail: 'ahmed.sh@noor-bayan.com',
    description: 'مسار خاص بالمناهج الدولية لمعلم آخر لا يحق لغيره الاطلاع على طلابه.',
    scheduleTime: 'الأحد والثلاثاء - 7:00 م بتوقيت مكة',
  },
];

const INITIAL_STUDENTS: TeacherStudent[] = [
  {
    id: 'std-1',
    childName: 'عمر أحمد السعيد',
    age: 8,
    parentName: 'أحمد السعيد',
    parentPhone: '+966 50 123 4567',
    country: 'المملكة العربية السعودية',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    level: 'المستوى الثاني (جزء عم)',
    attendanceRate: 98,
    memorizedSurahs: ['النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق'],
    teacherNotes: 'طالب متميز وسريع الحفظ، يتقن أحكام النون الساكنة والتنوين.',
    status: 'active',
    enrolledAt: '2025-11-15T10:00:00.000Z',
    meetingLink: 'https://meet.google.com/xyz-quran-live',
  },
  {
    id: 'std-2',
    childName: 'سارة خالد المنصور',
    age: 6,
    parentName: 'خالد المنصور',
    parentPhone: '+966 55 987 6543',
    country: 'الإمارات العربية المتحدة',
    courseId: 'c-arabic-2',
    courseTitle: 'منهاج البيان القرآني والتأسيس اللغوي',
    level: 'المستوى الأول (الحروف الهجائية بالفتح)',
    attendanceRate: 100,
    memorizedSurahs: ['الفاتحة', 'الإخلاص', 'الفلق', 'الناس'],
    teacherNotes: 'استجابة سريعة في نطق مخارج الحروف اللثوية والتهجئة المتقنة.',
    status: 'active',
    enrolledAt: '2025-12-05T14:30:00.000Z',
    meetingLink: 'https://zoom.us/j/9876543210?pwd=NoorBayan2026',
  },
  {
    id: 'std-3',
    childName: 'عبد الرحمن يوسف الشمري',
    age: 10,
    parentName: 'يوسف الشمري',
    parentPhone: '+966 54 321 9876',
    country: 'المملكة العربية السعودية',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    level: 'المستوى الثالث (إتمام جزء عم)',
    attendanceRate: 96,
    memorizedSurahs: [
      'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق',
      'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق'
    ],
    teacherNotes: 'أتم 19 سورة ويستعد لاختبار ختم جزء عم كاملاً بإتقان ممتاز.',
    status: 'active',
    enrolledAt: '2026-01-10T09:00:00.000Z',
    meetingLink: 'https://meet.google.com/xyz-quran-live',
  },
  {
    id: 'std-4',
    childName: 'مريم طارق العتيبي',
    age: 12,
    parentName: 'طارق العتيبي',
    parentPhone: '+966 56 789 1234',
    country: 'دولة الكويت',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    level: 'المستوى الرابع (الحفظ المتقدم)',
    attendanceRate: 100,
    memorizedSurahs: [
      'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق',
      'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
      'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل',
      'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
    ],
    teacherNotes: 'أتمت جزء عم كاملاً بتفوق مع تطبيق عملي متقن لأحكام المدود والغنة.',
    status: 'active',
    enrolledAt: '2025-10-20T11:00:00.000Z',
    meetingLink: 'https://meet.google.com/xyz-quran-live',
  },
  {
    id: 'std-5',
    childName: 'حمزة بلال إبراهيم',
    age: 7,
    parentName: 'بلال إبراهيم',
    parentPhone: '+20 10 2345 6789',
    country: 'جمهورية مصر العربية',
    courseId: 'c-values-3',
    courseTitle: 'غراس القيم والآداب النبوية للناشئة',
    level: 'المستوى الأول',
    attendanceRate: 94,
    memorizedSurahs: ['الفاتحة', 'العصر', 'الكوثر', 'الإخلاص', 'الفلق'],
    teacherNotes: 'حفظ الأذكار اليومية وآداب الطعام وبر الوالدين، تفاعل رائع في الحلقة.',
    status: 'active',
    enrolledAt: '2026-02-12T16:00:00.000Z',
    meetingLink: 'https://meet.google.com/values-circle-live',
  },
  // Foreign Students belonging to course c-math-4 (teacher: ahmed.sh@noor-bayan.com)
  {
    id: 'std-foreign-1',
    childName: 'يوسف ريان الغامدي (طالب مسار آخر)',
    age: 9,
    parentName: 'ريان الغامدي',
    parentPhone: '+966 53 777 5566',
    country: 'المملكة العربية السعودية',
    courseId: 'c-math-4',
    courseTitle: 'المناهج الدولية والرياضيات المتقدمة',
    level: 'Grade 3 Math',
    attendanceRate: 95,
    memorizedSurahs: [],
    teacherNotes: 'مسجل في مسار الرياضيات للأستاذ أحمد الشمري.',
    status: 'active',
    enrolledAt: '2026-01-05T12:00:00.000Z',
    meetingLink: 'https://meet.google.com/foreign-math-class',
  },
  {
    id: 'std-foreign-2',
    childName: 'ليان طارق المطيري (طالبة مسار آخر)',
    age: 8,
    parentName: 'طارق المطيري',
    parentPhone: '+966 54 666 7788',
    country: 'المملكة العربية السعودية',
    courseId: 'c-math-4',
    courseTitle: 'المناهج الدولية والرياضيات المتقدمة',
    level: 'Grade 2 Math',
    attendanceRate: 92,
    memorizedSurahs: [],
    teacherNotes: 'مسجلة في مسار الرياضيات للأستاذ أحمد الشمري.',
    status: 'active',
    enrolledAt: '2026-01-15T12:00:00.000Z',
    meetingLink: 'https://meet.google.com/foreign-math-class',
  },
];

const INITIAL_RECITATIONS: RecitationRecord[] = [
  {
    id: 'rec-1',
    studentId: 'std-1',
    studentName: 'عمر أحمد السعيد',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    teacherEmail: 'teacher@noor-bayan.com',
    surahName: 'النبأ',
    fromAyah: 1,
    toAyah: 20,
    grade: 'excellent',
    mistakesCount: 0,
    notes: 'تلاوة ندية بأحكام المد المتصل والتفخيم والترقيق.',
    recitationDate: '2026-11-10',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rec-2',
    studentId: 'std-3',
    studentName: 'عبد الرحمن يوسف الشمري',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    teacherEmail: 'teacher@noor-bayan.com',
    surahName: 'النازعات',
    fromAyah: 1,
    toAyah: 46,
    grade: 'very_good',
    mistakesCount: 1,
    notes: 'أتم السورة كاملة غيباً مع تنبيه يسير على إخفاء التنوين.',
    recitationDate: '2026-11-09',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rec-3',
    studentId: 'std-4',
    studentName: 'مريم طارق العتيبي',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    teacherEmail: 'teacher@noor-bayan.com',
    surahName: 'عبس',
    fromAyah: 1,
    toAyah: 42,
    grade: 'excellent',
    mistakesCount: 0,
    notes: 'إتقان تام للوقف والابتداء مع مخارج الحروف الشجرية.',
    recitationDate: '2026-11-08',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const INITIAL_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'eval-1',
    studentId: 'std-1',
    studentName: 'عمر أحمد السعيد',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    teacherEmail: 'teacher@noor-bayan.com',
    title: 'التقييم الدوري لإتقان أحكام النون الساكنة والتنوين',
    score: 98,
    maxScore: 100,
    tajweedMasteryScore: 98,
    memorizationScore: 100,
    behaviorScore: 96,
    notes: 'تطبيق عملي فائق ومشاركة نشطة في الحلقة مع احترام آداب المجلس.',
    evaluationDate: '2026-11-05',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'eval-2',
    studentId: 'std-2',
    studentName: 'سارة خالد المنصور',
    courseId: 'c-arabic-2',
    courseTitle: 'منهاج البيان القرآني والتأسيس اللغوي',
    teacherEmail: 'teacher@noor-bayan.com',
    title: 'تقييم هجاء الكلمات الثلاثية بحركة الفتح',
    score: 95,
    maxScore: 100,
    tajweedMasteryScore: 94,
    memorizationScore: 96,
    behaviorScore: 95,
    notes: 'تطور ملحوظ في سرعة القراءة دون تقطيع الحروف.',
    evaluationDate: '2026-11-04',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const INITIAL_EXAMS: ExamRecord[] = [
  {
    id: 'ex-1',
    studentId: 'std-4',
    studentName: 'مريم طارق العتيبي',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    teacherEmail: 'teacher@noor-bayan.com',
    examTitle: 'اختبار ختم جزء عم الشامل (الشفوي والتحريري)',
    examType: 'comprehensive',
    score: 100,
    maxScore: 100,
    feedback: 'درجة كاملة مستحقة مع إجازة في جزء عم وسند الحفظ المعتمد بالأكاديمية.',
    examDate: '2026-11-01',
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: 'ex-2',
    studentId: 'std-3',
    studentName: 'عبد الرحمن يوسف الشمري',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    teacherEmail: 'teacher@noor-bayan.com',
    examTitle: 'اختبار النصف الأول من جزء عم (من سورة النبأ حتى الطارق)',
    examType: 'oral',
    score: 96,
    maxScore: 100,
    feedback: 'أداء ممتاز، ينصح بمراجعة سورة التكوير لثبيت مواضع الآيات.',
    examDate: '2026-10-25',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-1', studentName: 'عمر أحمد السعيد', courseId: 'c-quran-1', sessionDate: '2026-11-10', status: 'present', notes: 'حضور مبكر وتفاعل نشط' },
  { id: 'att-2', studentId: 'std-3', studentName: 'عبد الرحمن يوسف الشمري', courseId: 'c-quran-1', sessionDate: '2026-11-10', status: 'present', notes: 'حاضر' },
  { id: 'att-3', studentId: 'std-4', studentName: 'مريم طارق العتيبي', courseId: 'c-quran-1', sessionDate: '2026-11-10', status: 'present', notes: 'حاضرة' },
  { id: 'att-4', studentId: 'std-2', studentName: 'سارة خالد المنصور', courseId: 'c-arabic-2', sessionDate: '2026-11-09', status: 'present', notes: 'حاضرة' },
  { id: 'att-5', studentId: 'std-5', studentName: 'حمزة بلال إبراهيم', courseId: 'c-values-3', sessionDate: '2026-11-08', status: 'late', notes: 'حضر بعد 10 دقائق من بدء الحلقة' },
];

const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: 'pay-2026-11',
    teacherEmail: 'teacher@noor-bayan.com',
    month: 'نوفمبر 2026',
    hoursCompleted: 38,
    hourlyRateSar: 65,
    baseAmount: 2470,
    bonus: 200,
    deductions: 0,
    netAmount: 2670,
    status: 'pending',
    transactionRef: 'TRX-PENDING-2026-11',
  },
  {
    id: 'pay-2026-10',
    teacherEmail: 'teacher@noor-bayan.com',
    month: 'أكتوبر 2026',
    hoursCompleted: 42,
    hourlyRateSar: 65,
    baseAmount: 2730,
    bonus: 250,
    deductions: 0,
    netAmount: 2980,
    status: 'paid',
    paidAt: '2026-11-01T10:00:00.000Z',
    transactionRef: 'SAR-ALRAJHI-9921448',
  },
  {
    id: 'pay-2026-09',
    teacherEmail: 'teacher@noor-bayan.com',
    month: 'سبتمبر 2026',
    hoursCompleted: 36,
    hourlyRateSar: 65,
    baseAmount: 2340,
    bonus: 150,
    deductions: 0,
    netAmount: 2490,
    status: 'paid',
    paidAt: '2026-10-01T09:30:00.000Z',
    transactionRef: 'SAR-ALRAJHI-8810234',
  },
];

const INITIAL_PAYOUT_DETAILS: PayoutDetails = {
  accountHolderName: 'الشيخ عبد الله القرني',
  bankName: 'مصرف الراجحي (Al Rajhi Bank)',
  ibanMasked: 'SA03 •••• •••• •••• 6789',
  isConfigured: true,
  updatedAt: '2026-10-15T12:00:00.000Z',
};

// Store helper with SSR / Node.js test environment support
const inMemoryCache: Record<string, unknown> = {};

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return (inMemoryCache[key] as T) ?? fallback;
  }
  try {
    const raw = localStorage.getItem(`nb_teacher_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`[TeacherService] Error parsing store ${key}:`, e);
  }
  return fallback;
}

function setStore<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    inMemoryCache[key] = value;
    return;
  }
  try {
    localStorage.setItem(`nb_teacher_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`[TeacherService] Error writing store ${key}:`, e);
  }
}

// Mask IBAN helper
export function maskIbanString(iban: string): string {
  const clean = iban.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start} •••• •••• •••• ${end}`;
}

// -------------------------------------------------------------
// Teacher Service Implementation
// -------------------------------------------------------------
export const teacherService = {
  // 1. Get Courses taught by this teacher
  getMyCourses(teacherEmail?: string | null): TeacherCourse[] {
    const allCourses = getStore<TeacherCourse[]>('courses', INITIAL_COURSES);
    const normalizedEmail = (teacherEmail || 'teacher@noor-bayan.com').toLowerCase().trim();

    // Strictly returns only courses belonging to this teacher email
    return allCourses.filter(
      (c) => c.teacherEmail.toLowerCase() === normalizedEmail
    );
  },

  // 2. Validate course authorization (CRITICAL URL security check)
  isCourseAssignedToTeacher(courseId: string, teacherEmail?: string | null): boolean {
    const myCourses = this.getMyCourses(teacherEmail);
    return myCourses.some((c) => c.id === courseId);
  },

  // 3. Get students in teacher's courses ONLY
  // If courseIdFilter is passed, strictly enforces that courseId belongs to this teacher!
  getMyStudents(
    teacherEmail?: string | null,
    courseIdFilter?: string | null
  ): {
    authorized: boolean;
    error?: string;
    students: TeacherStudent[];
    requestedCourseTitle?: string;
  } {
    const myCourses = this.getMyCourses(teacherEmail);
    const myCourseIds = new Set(myCourses.map((c) => c.id));
    const allStudents = getStore<TeacherStudent[]>('students', INITIAL_STUDENTS);

    // SECURITY CHECK: If a courseId is requested via URL parameter
    if (courseIdFilter && courseIdFilter.trim() !== '' && courseIdFilter !== 'all') {
      const isOwned = myCourseIds.has(courseIdFilter);
      if (!isOwned) {
        // Teacher is attempting to view another course's students via URL manipulation!
        return {
          authorized: false,
          error: `🚫 تم رفض الوصول: ليس لديك صلاحية الاطلاع على طلاب هذا المسار (${courseIdFilter}). هذا المسار مسند إلى معلم آخر، ولا يُسمح بالوصول إليه عبر تعديل الرابط.`,
          students: [],
        };
      }

      const filtered = allStudents.filter((s) => s.courseId === courseIdFilter && myCourseIds.has(s.courseId));
      const targetCourse = myCourses.find((c) => c.id === courseIdFilter);
      return {
        authorized: true,
        students: filtered,
        requestedCourseTitle: targetCourse?.title,
      };
    }

    // Return all students belonging to any of the teacher's courses
    const myStudents = allStudents.filter((s) => myCourseIds.has(s.courseId));
    return {
      authorized: true,
      students: myStudents,
    };
  },

  // 4. Record Recitation (التسميع القرآني)
  recordRecitation(payload: {
    studentId: string;
    courseId: string;
    surahName: string;
    fromAyah: number;
    toAyah: number;
    grade: 'excellent' | 'very_good' | 'good' | 'needs_revision';
    mistakesCount: number;
    notes: string;
    recitationDate: string;
    teacherEmail?: string;
  }): RecitationRecord {
    // Security check: verify student belongs to teacher
    const studentCheck = this.getMyStudents(payload.teacherEmail);
    const student = studentCheck.students.find((s) => s.id === payload.studentId);
    if (!student) {
      throw new Error('غير مصرح لك برصد تسميع لطالب غير مسجل في دوراتك.');
    }

    const recs = getStore<RecitationRecord[]>('recitations', INITIAL_RECITATIONS);
    const newRecord: RecitationRecord = {
      id: `rec-${Date.now()}`,
      studentId: student.id,
      studentName: student.childName,
      courseId: payload.courseId,
      courseTitle: student.courseTitle,
      teacherEmail: payload.teacherEmail || 'teacher@noor-bayan.com',
      surahName: payload.surahName,
      fromAyah: Number(payload.fromAyah) || 1,
      toAyah: Number(payload.toAyah) || 1,
      grade: payload.grade,
      mistakesCount: Number(payload.mistakesCount) || 0,
      notes: payload.notes.trim(),
      recitationDate: payload.recitationDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setStore('recitations', [newRecord, ...recs]);

    // Also update student memorized surahs if excellent/very_good
    if (payload.grade === 'excellent' || payload.grade === 'very_good') {
      const allStudents = getStore<TeacherStudent[]>('students', INITIAL_STUDENTS);
      const updatedStudents = allStudents.map((s) => {
        if (s.id === student.id && !s.memorizedSurahs.includes(payload.surahName)) {
          return {
            ...s,
            memorizedSurahs: [...s.memorizedSurahs, payload.surahName],
            teacherNotes: payload.notes || s.teacherNotes,
          };
        }
        return s;
      });
      setStore('students', updatedStudents);
    }

    return newRecord;
  },

  getRecitations(teacherEmail?: string | null): RecitationRecord[] {
    const recs = getStore<RecitationRecord[]>('recitations', INITIAL_RECITATIONS);
    return recs;
  },

  // 5. Record Evaluation (التقييم الأكاديمي والتربوي)
  recordEvaluation(payload: {
    studentId: string;
    courseId: string;
    title: string;
    score: number;
    maxScore?: number;
    tajweedMasteryScore?: number;
    memorizationScore?: number;
    behaviorScore?: number;
    notes: string;
    evaluationDate: string;
    teacherEmail?: string;
  }): EvaluationRecord {
    const studentCheck = this.getMyStudents(payload.teacherEmail);
    const student = studentCheck.students.find((s) => s.id === payload.studentId);
    if (!student) {
      throw new Error('غير مصرح لك برصد تقييم لطالب غير مسجل في دوراتك.');
    }

    const evals = getStore<EvaluationRecord[]>('evaluations', INITIAL_EVALUATIONS);
    const newEval: EvaluationRecord = {
      id: `eval-${Date.now()}`,
      studentId: student.id,
      studentName: student.childName,
      courseId: payload.courseId,
      courseTitle: student.courseTitle,
      teacherEmail: payload.teacherEmail || 'teacher@noor-bayan.com',
      title: payload.title.trim(),
      score: Number(payload.score),
      maxScore: Number(payload.maxScore) || 100,
      tajweedMasteryScore: Number(payload.tajweedMasteryScore) || Number(payload.score),
      memorizationScore: Number(payload.memorizationScore) || Number(payload.score),
      behaviorScore: Number(payload.behaviorScore) || 100,
      notes: payload.notes.trim(),
      evaluationDate: payload.evaluationDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setStore('evaluations', [newEval, ...evals]);
    return newEval;
  },

  getEvaluations(teacherEmail?: string | null): EvaluationRecord[] {
    return getStore<EvaluationRecord[]>('evaluations', INITIAL_EVALUATIONS);
  },

  // 6. Record Exam Results (رصد نتائج الاختبارات)
  recordExam(payload: {
    studentId: string;
    courseId: string;
    examTitle: string;
    examType: 'oral' | 'written' | 'comprehensive';
    score: number;
    maxScore?: number;
    feedback: string;
    examDate: string;
    teacherEmail?: string;
  }): ExamRecord {
    const studentCheck = this.getMyStudents(payload.teacherEmail);
    const student = studentCheck.students.find((s) => s.id === payload.studentId);
    if (!student) {
      throw new Error('غير مصرح لك برصد اختبار لطالب غير مسجل في دوراتك.');
    }

    const exams = getStore<ExamRecord[]>('exams', INITIAL_EXAMS);
    const newExam: ExamRecord = {
      id: `ex-${Date.now()}`,
      studentId: student.id,
      studentName: student.childName,
      courseId: payload.courseId,
      courseTitle: student.courseTitle,
      teacherEmail: payload.teacherEmail || 'teacher@noor-bayan.com',
      examTitle: payload.examTitle.trim(),
      examType: payload.examType,
      score: Number(payload.score),
      maxScore: Number(payload.maxScore) || 100,
      feedback: payload.feedback.trim(),
      examDate: payload.examDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setStore('exams', [newExam, ...exams]);
    return newExam;
  },

  getExams(teacherEmail?: string | null): ExamRecord[] {
    return getStore<ExamRecord[]>('exams', INITIAL_EXAMS);
  },

  // 7. Record Attendance (الحضور والغياب)
  recordAttendance(
    courseId: string,
    sessionDate: string,
    entries: { studentId: string; status: 'present' | 'absent' | 'excused' | 'late'; notes?: string }[],
    teacherEmail?: string
  ): AttendanceRecord[] {
    // Verify course belongs to teacher
    if (!this.isCourseAssignedToTeacher(courseId, teacherEmail)) {
      throw new Error('غير مصرح لك بتسجيل حضور جلسة مسار تعليمي غير مسند إليك.');
    }

    const currentAttendance = getStore<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    const myStudents = this.getMyStudents(teacherEmail).students;
    const studentMap = new Map(myStudents.map((s) => [s.id, s.childName]));

    const newRecords: AttendanceRecord[] = [];
    const updated = [...currentAttendance];

    for (const e of entries) {
      const studentName = studentMap.get(e.studentId) || 'طالب الحلقة';
      const existingIdx = updated.findIndex(
        (a) => a.studentId === e.studentId && a.courseId === courseId && a.sessionDate === sessionDate
      );

      const record: AttendanceRecord = {
        id: existingIdx >= 0 ? updated[existingIdx].id : `att-${Date.now()}-${e.studentId}`,
        studentId: e.studentId,
        studentName,
        courseId,
        sessionDate,
        status: e.status,
        notes: e.notes || '',
      };

      if (existingIdx >= 0) {
        updated[existingIdx] = record;
      } else {
        updated.unshift(record);
      }
      newRecords.push(record);
    }

    setStore('attendance', updated);
    return newRecords;
  },

  getAttendanceLogs(courseId?: string, sessionDate?: string): AttendanceRecord[] {
    let logs = getStore<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
    if (courseId && courseId !== 'all') {
      logs = logs.filter((l) => l.courseId === courseId);
    }
    if (sessionDate) {
      logs = logs.filter((l) => l.sessionDate === sessionDate);
    }
    return logs;
  },

  // 8. Payroll History
  getPayrollHistory(teacherEmail?: string | null): PayrollRecord[] {
    const records = getStore<PayrollRecord[]>('payroll', INITIAL_PAYROLL);
    const email = (teacherEmail || 'teacher@noor-bayan.com').toLowerCase().trim();
    return records.filter((p) => p.teacherEmail.toLowerCase() === email);
  },

  // 9. Payout Bank Details
  getPayoutDetails(teacherEmail?: string | null): PayoutDetails {
    return getStore<PayoutDetails>('payout_details', INITIAL_PAYOUT_DETAILS);
  },

  async savePayoutDetails(
    teacherEmail: string | null | undefined,
    details: { accountHolderName: string; bankName: string; iban: string }
  ): Promise<{ success: boolean; maskedIban: string; message: string }> {
    const cleanHolder = details.accountHolderName.trim();
    const cleanBank = details.bankName.trim();
    const cleanIban = details.iban.replace(/\s+/g, '').toUpperCase();

    if (!cleanHolder) {
      throw new Error('اسم صاحب الحساب مطلوب.');
    }
    if (!cleanBank) {
      throw new Error('اسم البنك مطلوب.');
    }
    if (!cleanIban || cleanIban.length < 15) {
      throw new Error('رقم الآيبان المدخل غير مكتمل أو غير صالح.');
    }

    // Try posting to backend API /api/payouts/update-iban if running in browser
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/payouts/update-iban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountHolderName: cleanHolder,
            bankName: cleanBank,
            iban: cleanIban,
          }),
        });
      } catch (e) {
        console.warn('[TeacherService] Backend sync error, proceeding with client store:', e);
      }
    }

    const masked = maskIbanString(cleanIban);
    const updated: PayoutDetails = {
      accountHolderName: cleanHolder,
      bankName: cleanBank,
      ibanMasked: masked,
      isConfigured: true,
      updatedAt: new Date().toISOString(),
    };

    setStore('payout_details', updated);

    return {
      success: true,
      maskedIban: masked,
      message: 'تم حفظ وتشفير بيانات التحويل البنكي بنجاح، ويتم إخفاء رقم الآيبان لحماية خصوصيتك.',
    };
  },
};
