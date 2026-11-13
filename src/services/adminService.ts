/**
 * Comprehensive Admin Data & Operations Service
 * Covers:
 * - Students (all, with level/classification, progress, soft delete)
 * - Teachers with assigned courses, rates, soft delete
 * - Courses CRUD (soft delete)
 * - Lessons CRUD (online lecture link, image upload to storage, soft delete)
 * - Enrollments (student to course linking, soft delete)
 * - Admission Requests (approve/reject workflow, soft delete)
 * - Announcements (targeting: all / course / specific students, soft delete)
 * - Certificates (issue, verification code, PDF/Canvas export, soft delete)
 * - Payroll (duplicate month guard, teacher payout details, soft delete)
 * - Audit Logs (immutable event stream)
 */

import { generateVerificationCode, CERTIFICATE_THEMES } from '../utils/certificateEngine';
import { maskIbanString } from './teacherService';

// -------------------------------------------------------------
// Interfaces
// -------------------------------------------------------------

export interface AdminStudent {
  id: string;
  childName: string;
  age: number;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  country: string;
  program: string;
  courseId: string;
  level: string; // classification / level
  assignedTeacherEmail: string;
  assignedTeacherName: string;
  memorizedSurahs: string[];
  attendanceRate: number;
  teacherNotes: string;
  status: 'active' | 'trial' | 'completed' | 'suspended';
  enrolledAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminTeacher {
  id: string;
  email: string;
  name: string;
  phone: string;
  specialty: string;
  assignedCourseIds: string[];
  assignedCourses: { id: string; title: string }[];
  hourlyRateSar: number;
  teachingHours: number;
  bankName: string;
  accountHolderName: string;
  ibanMasked: string;
  status: 'active' | 'on_leave' | 'inactive';
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  ageBracket: string;
  minAge: number;
  maxAge: number;
  priceSar: number;
  billingUnit: string;
  weeklySessions: number;
  sessionDurationMins: number;
  deliveryMode: 'online';
  image: string;
  description: string;
  features: string[];
  assignedTeacherEmail?: string;
  assignedTeacherName?: string;
  enrolledStudentsCount: number;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminLesson {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonNumber: number;
  title: string;
  description: string;
  onlineLectureLink: string; // Online lecture link (e.g. Zoom or Google Meet URL)
  imageUrl: string; // Image upload to storage URL / data URI
  durationMinutes: number;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'trial' | 'dropped';
  paymentStatus: 'paid' | 'pending' | 'free_trial';
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminAdmissionRequest {
  id: string;
  childName: string;
  age: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  country: string;
  selectedProgram: string;
  courseId?: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'course' | 'specific_students';
  targetCourseId?: string;
  targetCourseTitle?: string;
  targetStudentIds?: string[];
  targetStudentNames?: string[];
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  createdBy: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminCertificateRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  achievementTitle: string;
  templateType: 'completion' | 'star_student' | 'qaidah_diploma';
  themeId: string;
  grade: string;
  issueDate: string;
  verificationCode: string;
  teacherName: string;
  supervisorName: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminPayroll {
  id: string;
  teacherEmail: string;
  teacherName: string;
  month: string; // e.g. "نوفمبر 2026"
  hoursCompleted: number;
  hourlyRateSar: number;
  baseAmount: number;
  bonus: number;
  deductions: number;
  netAmount: number;
  status: 'paid' | 'pending';
  bankName: string;
  accountHolderName: string;
  ibanMasked: string;
  paidAt?: string;
  transactionRef?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'course' | 'lesson' | 'student' | 'teacher' | 'admission' | 'announcement' | 'certificate' | 'payroll' | 'security';
  actorEmail: string;
  ip: string;
  details: Record<string, unknown> | string;
  severity: 'info' | 'warning' | 'critical';
}

// -------------------------------------------------------------
// Initial Baseline Mock Data
// -------------------------------------------------------------

const INITIAL_STUDENTS: AdminStudent[] = [
  {
    id: 'std-1',
    childName: 'عمر أحمد السعيد',
    age: 8,
    parentName: 'أحمد السعيد',
    parentPhone: '+966 50 123 4567',
    parentEmail: 'ahmed.said@example.com',
    country: 'المملكة العربية السعودية',
    program: 'حلقات تحفيظ القرآن الكريم وتجويده',
    courseId: 'c-quran-1',
    level: 'المستوى الثاني (جزء عم)',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    memorizedSurahs: ['النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق'],
    attendanceRate: 98,
    teacherNotes: 'طالب متميز وسريع الحفظ، يتقن أحكام النون الساكنة والتنوين.',
    status: 'active',
    enrolledAt: '2025-11-15T10:00:00.000Z',
  },
  {
    id: 'std-2',
    childName: 'سارة خالد المنصور',
    age: 6,
    parentName: 'خالد المنصور',
    parentPhone: '+966 55 987 6543',
    parentEmail: 'khaled.mansoor@example.com',
    country: 'الإمارات العربية المتحدة',
    program: 'منهاج البيان القرآني والتأسيس اللغوي',
    courseId: 'c-arabic-2',
    level: 'المستوى التأسيسي الأول (نور البيان)',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    memorizedSurahs: ['الفاتحة', 'الإخلاص', 'الفلق', 'الناس'],
    attendanceRate: 100,
    teacherNotes: 'استجابة سريعة في نطق مخارج الحروف والتهجئة المتقنة.',
    status: 'active',
    enrolledAt: '2025-12-05T14:30:00.000Z',
  },
  {
    id: 'std-3',
    childName: 'عبد الرحمن يوسف الشمري',
    age: 10,
    parentName: 'يوسف الشمري',
    parentPhone: '+966 54 321 9876',
    parentEmail: 'yousef.shammari@example.com',
    country: 'المملكة العربية السعودية',
    program: 'حلقات تحفيظ القرآن الكريم وتجويده',
    courseId: 'c-quran-1',
    level: 'المستوى الثالث (إتمام جزء عم وبداية تبارك)',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    memorizedSurahs: ['النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'البروج', 'الطارق', 'الأعلى'],
    attendanceRate: 96,
    teacherNotes: 'أتم 19 سورة ويستعد لاختبار ختم جزء عم كاملاً بإتقان ممتاز.',
    status: 'active',
    enrolledAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'std-4',
    childName: 'مريم طارق العتيبي',
    age: 12,
    parentName: 'طارق العتيبي',
    parentPhone: '+966 56 789 1234',
    parentEmail: 'tariq.otaibi@example.com',
    country: 'دولة الكويت',
    program: 'حلقات تحفيظ القرآن الكريم وتجويده',
    courseId: 'c-quran-1',
    level: 'المستوى الرابع (المتقنون والإجازة)',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    memorizedSurahs: ['النبأ', 'النازعات', 'عبس', 'الملك', 'القلم', 'الحاقة'],
    attendanceRate: 100,
    teacherNotes: 'أتمت جزء عم كاملاً بتفوق مع تطبيق عملي متقن لأحكام المدود والغنة.',
    status: 'active',
    enrolledAt: '2025-10-20T11:00:00.000Z',
  },
  {
    id: 'std-5',
    childName: 'حمزة بلال إبراهيم',
    age: 7,
    parentName: 'بلال إبراهيم',
    parentPhone: '+20 10 2345 6789',
    parentEmail: 'bilal.ibrahim@example.com',
    country: 'جمهورية مصر العربية',
    program: 'غراس القيم والآداب النبوية للناشئة',
    courseId: 'c-values-3',
    level: 'المستوى الأول (السيرة والأخلاق)',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    memorizedSurahs: ['الفاتحة', 'العصر', 'الكوثر', 'الإخلاص'],
    attendanceRate: 94,
    teacherNotes: 'حفظ الأذكار اليومية وآداب الطعام وبر الوالدين، تفاعل رائع في الحلقة.',
    status: 'active',
    enrolledAt: '2026-02-12T16:00:00.000Z',
  },
];

const INITIAL_TEACHERS: AdminTeacher[] = [
  {
    id: 't-101',
    email: 'teacher@noor-bayan.com',
    name: 'الشيخ عبد الله القرني',
    phone: '+966 50 888 1234',
    specialty: 'القراءات القرآنية والتجويد وعلوم الحديث',
    assignedCourseIds: ['c-quran-1', 'c-arabic-2', 'c-values-3'],
    assignedCourses: [
      { id: 'c-quran-1', title: 'حلقات تحفيظ القرآن الكريم وتجويده' },
      { id: 'c-arabic-2', title: 'منهاج البيان القرآني والتأسيس اللغوي' },
      { id: 'c-values-3', title: 'غراس القيم والآداب النبوية للناشئة' },
    ],
    hourlyRateSar: 65,
    teachingHours: 38,
    bankName: 'مصرف الراجحي (Al Rajhi Bank)',
    accountHolderName: 'الشيخ عبد الله القرني',
    ibanMasked: 'SA03 •••• •••• •••• 6789',
    status: 'active',
  },
  {
    id: 't-102',
    email: 'asmaa.ibrahim@noor-bayan.com',
    name: 'أ. أسماء إبراهيم',
    phone: '+966 55 444 3210',
    specialty: 'تأسيس الأطفال وطريقة نور البيان وتعديل النطق',
    assignedCourseIds: ['c-arabic-2'],
    assignedCourses: [
      { id: 'c-arabic-2', title: 'منهاج البيان القرآني والتأسيس اللغوي' },
    ],
    hourlyRateSar: 60,
    teachingHours: 24,
    bankName: 'البنك الأهلي السعودي (SNB)',
    accountHolderName: 'أسماء إبراهيم محمد',
    ibanMasked: 'SA12 •••• •••• •••• 4455',
    status: 'active',
  },
  {
    id: 't-103',
    email: 'ahmed.sh@noor-bayan.com',
    name: 'أ. أحمد الشمري',
    phone: '+966 54 999 5544',
    specialty: 'المناهج الدولية والرياضيات والذكاء الحسابي',
    assignedCourseIds: ['c-math-4'],
    assignedCourses: [
      { id: 'c-math-4', title: 'المناهج الدولية والرياضيات المتقدمة' },
    ],
    hourlyRateSar: 70,
    teachingHours: 18,
    bankName: 'بنك الرياض (Riyad Bank)',
    accountHolderName: 'أحمد صالح الشمري',
    ibanMasked: 'SA55 •••• •••• •••• 9988',
    status: 'active',
  },
];

const INITIAL_COURSES: AdminCourse[] = [
  {
    id: 'c-quran-1',
    title: 'حلقات تحفيظ القرآن الكريم وتجويده',
    subtitle: 'حفظ وتثبيت وضبط أحكام التجويد ومخارج الحروف برواية حفص عن عاصم',
    category: 'quran',
    ageBracket: '5 - 16 سنة',
    minAge: 5,
    maxAge: 16,
    priceSar: 280,
    billingUnit: 'شهرياً',
    weeklySessions: 3,
    sessionDurationMins: 45,
    deliveryMode: 'online',
    image: '/assets/programs/quran_islamic.jpg',
    description: 'حلقات تفاعلية مصغرة للتحفيظ المتقن مع رصد يومي للسور ومتابعة أحكام التجويد والمدود.',
    features: ['حفظ متقن مع التجويد', 'حلقات فردية ومصغرة', 'إجازات وسند متصل', 'شهادات معتمدة وتطبيق جوال'],
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    enrolledStudentsCount: 3,
  },
  {
    id: 'c-arabic-2',
    title: 'منهاج البيان القرآني والتأسيس اللغوي',
    subtitle: 'نور البيان، التهجئة السليمة، مخارج الحروف، ونطق الفصحى',
    category: 'arabic',
    ageBracket: '4 - 12 سنة',
    minAge: 4,
    maxAge: 12,
    priceSar: 260,
    billingUnit: 'شهرياً',
    weeklySessions: 3,
    sessionDurationMins: 45,
    deliveryMode: 'online',
    image: '/assets/programs/arabic_foundation.jpg',
    description: 'التأسيس اللغوي المتين للأطفال على طريقة نور البيان وقواعد النطق السليم والإملاء.',
    features: ['طريقة نور البيان', 'تدريبات النطق ومخارج الحروف', 'قصص لغوية مشوقة', 'ألعاب تفاعلية للتهجئة'],
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    enrolledStudentsCount: 1,
  },
  {
    id: 'c-values-3',
    title: 'غراس القيم والآداب النبوية للناشئة',
    subtitle: 'أخلاق المسلم الصغير، السيرة النبوية المبسطة، والأذكار اليومية',
    category: 'values',
    ageBracket: '5 - 12 سنة',
    minAge: 5,
    maxAge: 12,
    priceSar: 220,
    billingUnit: 'شهرياً',
    weeklySessions: 2,
    sessionDurationMins: 45,
    deliveryMode: 'online',
    image: '/public/assets/programs/speech_development.jpg',
    description: 'غرس العقيدة السليمة ومحبة النبي ﷺ والآداب اليومية بأسلوب قصصي تفاعلي محبب.',
    features: ['قصص السيرة النبوية المبسطة', 'تطبيق عملي للآداب اليومية', 'حفظ الأذكار والأدعية', 'أنشطة ومسابقات أسبوعية'],
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    assignedTeacherName: 'الشيخ عبد الله القرني',
    enrolledStudentsCount: 1,
  },
  {
    id: 'c-math-4',
    title: 'المناهج الدولية والرياضيات المتقدمة',
    subtitle: 'Cambridge & American Math Curricula',
    category: 'international',
    ageBracket: '6 - 18 سنة',
    minAge: 6,
    maxAge: 18,
    priceSar: 350,
    billingUnit: 'شهرياً',
    weeklySessions: 3,
    sessionDurationMins: 50,
    deliveryMode: 'online',
    image: '/public/assets/programs/international_curricula.jpg',
    description: 'مسار خاص بالمناهج الدولية للرياضيات والحساب الذهني وحل المشكلات.',
    features: ['مناهج كامبريدج والأمريكية', 'حل المسائل الرياضية التفاعلية', 'تقارير أداء دورية', 'معلمون متخصصون'],
    assignedTeacherEmail: 'ahmed.sh@noor-bayan.com',
    assignedTeacherName: 'أ. أحمد الشمري',
    enrolledStudentsCount: 2,
  },
];

const INITIAL_LESSONS: AdminLesson[] = [
  {
    id: 'les-1',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    lessonNumber: 1,
    title: 'سورة النبأ من الآية 1 إلى 20 - أحكام المد المتصل',
    description: 'تسميع ومراجعة وضبط أحكام النون والميم المشددتين وتطبيق المد المتصل بمقداره الصحيح.',
    onlineLectureLink: 'https://meet.google.com/xyz-quran-live',
    imageUrl: '/assets/programs/quran_islamic.jpg',
    durationMinutes: 45,
    scheduledDate: '2026-11-15',
    scheduledTime: '16:30',
    status: 'scheduled',
  },
  {
    id: 'les-2',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    lessonNumber: 2,
    title: 'سورة النازعات - الوقف والابتداء ومخارج الحروف',
    description: 'تطبيق عملي على مواضع الوقف التام والكافي وضبط حروف القلقلة في مواضع السكون.',
    onlineLectureLink: 'https://meet.google.com/xyz-quran-live',
    imageUrl: '/public/images/quran_recitation_kids_1793317242043.jpg',
    durationMinutes: 45,
    scheduledDate: '2026-11-17',
    scheduledTime: '16:30',
    status: 'scheduled',
  },
  {
    id: 'les-3',
    courseId: 'c-arabic-2',
    courseTitle: 'منهاج البيان القرآني والتأسيس اللغوي',
    lessonNumber: 1,
    title: 'حركة الفتح وتهجئة الكلمات الثلاثية',
    description: 'قراءة كلمات بحركة الفتح مجردة من الحروف المتشابهة في النطق والتطبيق على السبورة الذكية.',
    onlineLectureLink: 'https://zoom.us/j/9876543210?pwd=NoorBayan2026',
    imageUrl: '/assets/programs/arabic_foundation.jpg',
    durationMinutes: 45,
    scheduledDate: '2026-11-16',
    scheduledTime: '17:15',
    status: 'scheduled',
  },
];

const INITIAL_ENROLLMENTS: AdminEnrollment[] = [
  {
    id: 'enr-1',
    studentId: 'std-1',
    studentName: 'عمر أحمد السعيد',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    enrolledAt: '2025-11-15T10:00:00.000Z',
    status: 'active',
    paymentStatus: 'paid',
  },
  {
    id: 'enr-2',
    studentId: 'std-2',
    studentName: 'سارة خالد المنصور',
    courseId: 'c-arabic-2',
    courseTitle: 'منهاج البيان القرآني والتأسيس اللغوي',
    enrolledAt: '2025-12-05T14:30:00.000Z',
    status: 'active',
    paymentStatus: 'paid',
  },
  {
    id: 'enr-3',
    studentId: 'std-3',
    studentName: 'عبد الرحمن يوسف الشمري',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    enrolledAt: '2026-01-10T09:00:00.000Z',
    status: 'active',
    paymentStatus: 'paid',
  },
  {
    id: 'enr-4',
    studentId: 'std-4',
    studentName: 'مريم طارق العتيبي',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    enrolledAt: '2025-10-20T11:00:00.000Z',
    status: 'active',
    paymentStatus: 'paid',
  },
  {
    id: 'enr-5',
    studentId: 'std-5',
    studentName: 'حمزة بلال إبراهيم',
    courseId: 'c-values-3',
    courseTitle: 'غراس القيم والآداب النبوية للناشئة',
    enrolledAt: '2026-02-12T16:00:00.000Z',
    status: 'active',
    paymentStatus: 'paid',
  },
];

const INITIAL_ADMISSIONS: AdminAdmissionRequest[] = [
  {
    id: 'adm-101',
    childName: 'فاطمة محمد الدوسري',
    age: 9,
    parentName: 'محمد الدوسري',
    parentPhone: '+966 50 777 8899',
    parentEmail: 'm.dawsari@example.com',
    country: 'المملكة العربية السعودية',
    selectedProgram: 'حلقات تحفيظ القرآن الكريم وتجويده',
    courseId: 'c-quran-1',
    preferredTime: 'الفترة المسائية (بعد صلاة العصر)',
    notes: 'الطفلة تحفظ قصار السور وترغب بحفظ جزء عم مع التجويد.',
    status: 'pending',
    submittedAt: '2026-11-11T14:20:00.000Z',
  },
  {
    id: 'adm-102',
    childName: 'سعود فيصل الحربي',
    age: 7,
    parentName: 'فيصل الحربي',
    parentPhone: '+966 55 222 1100',
    parentEmail: 'faisal.harbi@example.com',
    country: 'المملكة العربية السعودية',
    selectedProgram: 'منهاج البيان القرآني والتأسيس اللغوي',
    courseId: 'c-arabic-2',
    preferredTime: 'أيام السبت والإثنين والأربعاء',
    notes: 'تأسيس قراءة وكتابة تمهيداً للمرحلة الابتدائية.',
    status: 'pending',
    submittedAt: '2026-11-10T10:15:00.000Z',
  },
  {
    id: 'adm-103',
    childName: 'جنى إبراهيم القحطاني',
    age: 11,
    parentName: 'إبراهيم القحطاني',
    parentPhone: '+966 53 666 4433',
    parentEmail: 'ibrahim.q@example.com',
    country: 'المملكة العربية السعودية',
    selectedProgram: 'غراس القيم والآداب النبوية للناشئة',
    courseId: 'c-values-3',
    preferredTime: 'الفترة المسائية',
    notes: 'طلب التحاق بدورة السيرة والأخلاق النبوية.',
    status: 'approved',
    submittedAt: '2026-11-08T09:00:00.000Z',
    reviewedAt: '2026-11-09T11:00:00.000Z',
    reviewedBy: 'admin@noor-bayan.com',
  },
];

const INITIAL_ANNOUNCEMENTS: AdminAnnouncement[] = [
  {
    id: 'anc-1',
    title: 'افتتاح التسجيل في مسابقة ترتيل القرآن الكريم الفصلية',
    content: 'يسر إدارة أكاديمية نور وبيان الإعلان عن انطلاق مسابقة الترتيل لجميع المراحل العمرية مع جوائز تشجيعية كبرى وشهادات معتمدة.',
    targetAudience: 'all',
    priority: 'urgent',
    createdAt: '2026-11-10T08:00:00.000Z',
    createdBy: 'admin@noor-bayan.com',
  },
  {
    id: 'anc-2',
    title: 'تعديل موعد حلقة التجويد ليوم الخميس القادم',
    content: 'نحيطكم علماً بتقديم موعد حلقة القرآن الكريم وتجويده بمقدار 15 دقيقة نظراً لإقامة ورشة عمل المخارج الصوتية.',
    targetAudience: 'course',
    targetCourseId: 'c-quran-1',
    targetCourseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    priority: 'important',
    createdAt: '2026-11-09T12:30:00.000Z',
    createdBy: 'admin@noor-bayan.com',
  },
  {
    id: 'anc-3',
    title: 'تهنئة خاصة للطلاب المتميزين في اختبار جزء عم',
    content: 'تهنئ الأكاديمية الطالبة مريم العتيبي والطالب عبد الرحمن الشمري على تفوقهما الباهر في الاختبار الشفوي.',
    targetAudience: 'specific_students',
    targetStudentIds: ['std-3', 'std-4'],
    targetStudentNames: ['عبد الرحمن يوسف الشمري', 'مريم طارق العتيبي'],
    priority: 'normal',
    createdAt: '2026-11-08T15:00:00.000Z',
    createdBy: 'admin@noor-bayan.com',
  },
];

const INITIAL_CERTIFICATES: AdminCertificateRecord[] = [
  {
    id: 'cert-1',
    studentId: 'std-4',
    studentName: 'مريم طارق العتيبي',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    achievementTitle: 'حفظ وإتقان جزء عم كاملاً برواية حفص عن عاصم',
    templateType: 'completion',
    themeId: 'emerald_gold',
    grade: 'ممتاز مع مرتبة الشرف (100%)',
    issueDate: '2026-11-01',
    verificationCode: 'NB-QRN-2026-A8F2',
    teacherName: 'الشيخ عبد الله القرني',
    supervisorName: 'د. عبد الرحمن السعدي',
  },
  {
    id: 'cert-2',
    studentId: 'std-1',
    studentName: 'عمر أحمد السعيد',
    courseId: 'c-quran-1',
    courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
    achievementTitle: 'إتقان أحكام النون الساكنة والتنوين والمدود',
    templateType: 'star_student',
    themeId: 'sapphire_gold',
    grade: 'امتياز (98%)',
    issueDate: '2026-10-28',
    verificationCode: 'NB-QRN-2026-K4L9',
    teacherName: 'الشيخ عبد الله القرني',
    supervisorName: 'د. عبد الرحمن السعدي',
  },
];

const INITIAL_PAYROLL: AdminPayroll[] = [
  {
    id: 'pay-2026-11',
    teacherEmail: 'teacher@noor-bayan.com',
    teacherName: 'الشيخ عبد الله القرني',
    month: 'نوفمبر 2026',
    hoursCompleted: 38,
    hourlyRateSar: 65,
    baseAmount: 2470,
    bonus: 200,
    deductions: 0,
    netAmount: 2670,
    status: 'pending',
    bankName: 'مصرف الراجحي (Al Rajhi Bank)',
    accountHolderName: 'الشيخ عبد الله القرني',
    ibanMasked: 'SA03 •••• •••• •••• 6789',
    transactionRef: 'TRX-PENDING-2026-11',
  },
  {
    id: 'pay-2026-10',
    teacherEmail: 'teacher@noor-bayan.com',
    teacherName: 'الشيخ عبد الله القرني',
    month: 'أكتوبر 2026',
    hoursCompleted: 42,
    hourlyRateSar: 65,
    baseAmount: 2730,
    bonus: 250,
    deductions: 0,
    netAmount: 2980,
    status: 'paid',
    bankName: 'مصرف الراجحي (Al Rajhi Bank)',
    accountHolderName: 'الشيخ عبد الله القرني',
    ibanMasked: 'SA03 •••• •••• •••• 6789',
    paidAt: '2026-11-01T10:00:00.000Z',
    transactionRef: 'SAR-ALRAJHI-9921448',
  },
  {
    id: 'pay-asmaa-2026-10',
    teacherEmail: 'asmaa.ibrahim@noor-bayan.com',
    teacherName: 'أ. أسماء إبراهيم',
    month: 'أكتوبر 2026',
    hoursCompleted: 24,
    hourlyRateSar: 60,
    baseAmount: 1440,
    bonus: 100,
    deductions: 0,
    netAmount: 1540,
    status: 'paid',
    bankName: 'البنك الأهلي السعودي (SNB)',
    accountHolderName: 'أسماء إبراهيم محمد',
    ibanMasked: 'SA12 •••• •••• •••• 4455',
    paidAt: '2026-11-01T10:30:00.000Z',
    transactionRef: 'SAR-SNB-3388192',
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-12T07:30:00.000Z',
    action: 'تسجيل دخول مسؤول الإدارة',
    category: 'security',
    actorEmail: 'admin@noor-bayan.com',
    ip: '192.168.1.100',
    details: { event: 'admin_login_success', session: 'unified_shell' },
    severity: 'info',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-11T15:45:00.000Z',
    action: 'إصدار شهادة إتمام مسار جزء عم',
    category: 'certificate',
    actorEmail: 'admin@noor-bayan.com',
    ip: '192.168.1.100',
    details: { studentName: 'مريم طارق العتيبي', code: 'NB-QRN-2026-A8F2' },
    severity: 'info',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-10T14:20:00.000Z',
    action: 'استلام طلب تسجيل وقبول جديد',
    category: 'admission',
    actorEmail: 'system',
    ip: '172.56.21.90',
    details: { childName: 'فاطمة محمد الدوسري', program: 'حلقات تحفيظ القرآن الكريم' },
    severity: 'info',
  },
  {
    id: 'log-4',
    timestamp: '2026-11-09T11:00:00.000Z',
    action: 'اعتماد طلب قبول وانضمام طالب',
    category: 'admission',
    actorEmail: 'admin@noor-bayan.com',
    ip: '192.168.1.100',
    details: { childName: 'جنى إبراهيم القحطاني', status: 'approved' },
    severity: 'info',
  },
];

// -------------------------------------------------------------
// Store Helper
// -------------------------------------------------------------

const inMemoryStore: Record<string, unknown> = {};

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return (inMemoryStore[key] as T) ?? fallback;
  }
  try {
    const raw = localStorage.getItem(`nb_admin_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`[AdminService] Error reading store ${key}:`, e);
  }
  return fallback;
}

function setStore<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    inMemoryStore[key] = value;
    return;
  }
  try {
    localStorage.setItem(`nb_admin_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`[AdminService] Error saving store ${key}:`, e);
  }
}

let idCounter = 0;
function nextUniqueId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 6)}`;
}

// -------------------------------------------------------------
// Admin Service Implementation
// -------------------------------------------------------------

export const adminService = {
  // -----------------------------------------------------------
  // 1. Audit Logs (Immutable)
  // -----------------------------------------------------------
  getAuditLogs(): AdminAuditLog[] {
    return getStore<AdminAuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  },

  logAction(payload: {
    action: string;
    category: AdminAuditLog['category'];
    actorEmail?: string;
    details?: Record<string, unknown> | string;
    severity?: AdminAuditLog['severity'];
  }): AdminAuditLog {
    const logs = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action: payload.action,
      category: payload.category,
      actorEmail: payload.actorEmail || 'admin@noor-bayan.com',
      ip: typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1',
      details: payload.details || {},
      severity: payload.severity || 'info',
    };
    setStore('audit_logs', [newLog, ...logs]);
    return newLog;
  },

  // -----------------------------------------------------------
  // 2. Students Management (Classification, Progress, Soft Delete)
  // -----------------------------------------------------------
  getStudents(includeDeleted = false): AdminStudent[] {
    const list = getStore<AdminStudent[]>('students', INITIAL_STUDENTS);
    return includeDeleted ? list : list.filter((s) => !s.isDeleted);
  },

  getStudentById(id: string): AdminStudent | null {
    const list = getStore<AdminStudent[]>('students', INITIAL_STUDENTS);
    return list.find((s) => s.id === id) || null;
  },

  createStudent(data: Omit<AdminStudent, 'id' | 'enrolledAt' | 'isDeleted' | 'deletedAt'>): AdminStudent {
    const list = getStore<AdminStudent[]>('students', INITIAL_STUDENTS);
    const newStudent: AdminStudent = {
      ...data,
      id: nextUniqueId('std'),
      enrolledAt: new Date().toISOString(),
      isDeleted: false,
    };
    setStore('students', [newStudent, ...list]);
    this.logAction({
      action: `إضافة طالب جديد: ${newStudent.childName}`,
      category: 'student',
      details: { studentId: newStudent.id, name: newStudent.childName, level: newStudent.level },
    });
    return newStudent;
  },

  updateStudent(id: string, updates: Partial<AdminStudent>): AdminStudent {
    const list = getStore<AdminStudent[]>('students', INITIAL_STUDENTS);
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('الطالب غير موجود');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStore('students', list);
    this.logAction({
      action: `تعديل بيانات الطالب: ${updated.childName}`,
      category: 'student',
      details: { studentId: id, updates },
    });
    return updated;
  },

  softDeleteStudent(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminStudent[]>('students', INITIAL_STUDENTS);
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const student = list[idx];
    list[idx] = {
      ...student,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('students', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) للطالب: ${student.childName}`,
      category: 'student',
      actorEmail,
      severity: 'warning',
      details: { studentId: id, name: student.childName },
    });
    return true;
  },

  restoreStudent(id: string): boolean {
    const list = getStore<AdminStudent[]>('students', INITIAL_STUDENTS);
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      isDeleted: false,
      deletedAt: undefined,
    };
    setStore('students', list);
    this.logAction({
      action: `استعادة الطالب من الأرشيف: ${list[idx].childName}`,
      category: 'student',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 3. Teachers with Assigned Courses (Soft Delete)
  // -----------------------------------------------------------
  getTeachers(includeDeleted = false): AdminTeacher[] {
    const list = getStore<AdminTeacher[]>('teachers', INITIAL_TEACHERS);
    return includeDeleted ? list : list.filter((t) => !t.isDeleted);
  },

  createTeacher(data: Omit<AdminTeacher, 'id' | 'isDeleted' | 'deletedAt'>): AdminTeacher {
    const list = getStore<AdminTeacher[]>('teachers', INITIAL_TEACHERS);
    const newTeacher: AdminTeacher = {
      ...data,
      id: nextUniqueId('t'),
      isDeleted: false,
    };
    setStore('teachers', [newTeacher, ...list]);
    this.logAction({
      action: `إضافة معلم جديد: ${newTeacher.name}`,
      category: 'teacher',
      details: { teacherId: newTeacher.id, email: newTeacher.email },
    });
    return newTeacher;
  },

  updateTeacher(id: string, updates: Partial<AdminTeacher>): AdminTeacher {
    const list = getStore<AdminTeacher[]>('teachers', INITIAL_TEACHERS);
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('المعلم غير موجود');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStore('teachers', list);
    this.logAction({
      action: `تعديل بيانات المعلم: ${updated.name}`,
      category: 'teacher',
      details: { teacherId: id, updates },
    });
    return updated;
  },

  softDeleteTeacher(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminTeacher[]>('teachers', INITIAL_TEACHERS);
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const teacher = list[idx];
    list[idx] = {
      ...teacher,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('teachers', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) للمعلم: ${teacher.name}`,
      category: 'teacher',
      actorEmail,
      severity: 'warning',
      details: { teacherId: id, name: teacher.name, email: teacher.email },
    });
    return true;
  },

  restoreTeacher(id: string): boolean {
    const list = getStore<AdminTeacher[]>('teachers', INITIAL_TEACHERS);
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      isDeleted: false,
      deletedAt: undefined,
    };
    setStore('teachers', list);
    this.logAction({
      action: `استعادة المعلم من الأرشيف: ${list[idx].name}`,
      category: 'teacher',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 4. Courses CRUD (Soft Delete)
  // -----------------------------------------------------------
  getCourses(includeDeleted = false): AdminCourse[] {
    const list = getStore<AdminCourse[]>('courses', INITIAL_COURSES);
    return includeDeleted ? list : list.filter((c) => !c.isDeleted);
  },

  getCourseById(id: string): AdminCourse | null {
    const list = getStore<AdminCourse[]>('courses', INITIAL_COURSES);
    return list.find((c) => c.id === id) || null;
  },

  createCourse(data: Omit<AdminCourse, 'id' | 'enrolledStudentsCount' | 'isDeleted' | 'deletedAt'>): AdminCourse {
    const list = getStore<AdminCourse[]>('courses', INITIAL_COURSES);
    const newCourse: AdminCourse = {
      ...data,
      id: nextUniqueId('c'),
      enrolledStudentsCount: 0,
      isDeleted: false,
    };
    setStore('courses', [newCourse, ...list]);
    this.logAction({
      action: `إنشاء مسار تعليمي جديد: ${newCourse.title}`,
      category: 'course',
      details: { courseId: newCourse.id, title: newCourse.title, price: newCourse.priceSar },
    });
    return newCourse;
  },

  updateCourse(id: string, updates: Partial<AdminCourse>): AdminCourse {
    const list = getStore<AdminCourse[]>('courses', INITIAL_COURSES);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('المسار التعليمي غير موجود');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStore('courses', list);
    this.logAction({
      action: `تعديل المسار التعليمي: ${updated.title}`,
      category: 'course',
      details: { courseId: id, updates },
    });
    return updated;
  },

  softDeleteCourse(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminCourse[]>('courses', INITIAL_COURSES);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const course = list[idx];
    list[idx] = {
      ...course,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('courses', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) للمسار: ${course.title}`,
      category: 'course',
      actorEmail,
      severity: 'warning',
      details: { courseId: id, title: course.title },
    });
    return true;
  },

  restoreCourse(id: string): boolean {
    const list = getStore<AdminCourse[]>('courses', INITIAL_COURSES);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      isDeleted: false,
      deletedAt: undefined,
    };
    setStore('courses', list);
    this.logAction({
      action: `استعادة المسار التعليمي من الأرشيف: ${list[idx].title}`,
      category: 'course',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 5. Lessons CRUD (Lecture Link & Image Upload & Soft Delete)
  // -----------------------------------------------------------
  getLessons(courseId?: string, includeDeleted = false): AdminLesson[] {
    let list = getStore<AdminLesson[]>('lessons', INITIAL_LESSONS);
    if (courseId && courseId !== 'all') {
      list = list.filter((l) => l.courseId === courseId);
    }
    return includeDeleted ? list : list.filter((l) => !l.isDeleted);
  },

  createLesson(data: Omit<AdminLesson, 'id' | 'isDeleted' | 'deletedAt'>): AdminLesson {
    const list = getStore<AdminLesson[]>('lessons', INITIAL_LESSONS);
    const newLesson: AdminLesson = {
      ...data,
      id: nextUniqueId('les'),
      isDeleted: false,
    };
    setStore('lessons', [newLesson, ...list]);
    this.logAction({
      action: `إضافة درس جديد: ${newLesson.title}`,
      category: 'lesson',
      details: {
        lessonId: newLesson.id,
        courseId: newLesson.courseId,
        lectureLink: newLesson.onlineLectureLink,
        hasImage: Boolean(newLesson.imageUrl),
      },
    });
    return newLesson;
  },

  updateLesson(id: string, updates: Partial<AdminLesson>): AdminLesson {
    const list = getStore<AdminLesson[]>('lessons', INITIAL_LESSONS);
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('الدرس غير موجود');
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStore('lessons', list);
    this.logAction({
      action: `تعديل بيانات الدرس: ${updated.title}`,
      category: 'lesson',
      details: { lessonId: id, updates },
    });
    return updated;
  },

  softDeleteLesson(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminLesson[]>('lessons', INITIAL_LESSONS);
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    const lesson = list[idx];
    list[idx] = {
      ...lesson,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('lessons', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) للدرس: ${lesson.title}`,
      category: 'lesson',
      actorEmail,
      severity: 'warning',
      details: { lessonId: id, title: lesson.title, courseId: lesson.courseId },
    });
    return true;
  },

  restoreLesson(id: string): boolean {
    const list = getStore<AdminLesson[]>('lessons', INITIAL_LESSONS);
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      isDeleted: false,
      deletedAt: undefined,
    };
    setStore('lessons', list);
    this.logAction({
      action: `استعادة الدرس من الأرشيف: ${list[idx].title}`,
      category: 'lesson',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 6. Enrollments (Linking Students to Courses)
  // -----------------------------------------------------------
  getEnrollments(includeDeleted = false): AdminEnrollment[] {
    const list = getStore<AdminEnrollment[]>('enrollments', INITIAL_ENROLLMENTS);
    return includeDeleted ? list : list.filter((e) => !e.isDeleted);
  },

  createEnrollment(data: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    paymentStatus?: 'paid' | 'pending' | 'free_trial';
  }): AdminEnrollment {
    const list = getStore<AdminEnrollment[]>('enrollments', INITIAL_ENROLLMENTS);
    const newEnr: AdminEnrollment = {
      id: nextUniqueId('enr'),
      studentId: data.studentId,
      studentName: data.studentName,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      paymentStatus: data.paymentStatus || 'paid',
      isDeleted: false,
    };
    setStore('enrollments', [newEnr, ...list]);
    this.logAction({
      action: `تسجيل طالب في مسار تعليمي: ${data.studentName} -> ${data.courseTitle}`,
      category: 'student',
      details: { studentId: data.studentId, courseId: data.courseId },
    });
    return newEnr;
  },

  updateEnrollmentStatus(id: string, status: AdminEnrollment['status']): boolean {
    const list = getStore<AdminEnrollment[]>('enrollments', INITIAL_ENROLLMENTS);
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    list[idx].status = status;
    setStore('enrollments', list);
    this.logAction({
      action: `تعديل حالة التسجيل إلى: ${status}`,
      category: 'student',
      details: { enrollmentId: id, status },
    });
    return true;
  },

  softDeleteEnrollment(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminEnrollment[]>('enrollments', INITIAL_ENROLLMENTS);
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('enrollments', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) لتسجيل الطالب: ${list[idx].studentName}`,
      category: 'student',
      actorEmail,
      severity: 'warning',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 7. Admission Requests (Approve / Reject Workflow)
  // -----------------------------------------------------------
  getAdmissions(includeDeleted = false): AdminAdmissionRequest[] {
    const list = getStore<AdminAdmissionRequest[]>('admissions', INITIAL_ADMISSIONS);
    return includeDeleted ? list : list.filter((a) => !a.isDeleted);
  },

  approveAdmission(id: string, reviewerEmail?: string): { success: boolean; student?: AdminStudent; error?: string } {
    const list = getStore<AdminAdmissionRequest[]>('admissions', INITIAL_ADMISSIONS);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return { success: false, error: 'طلب القبول غير موجود' };
    const req = list[idx];

    // Mark as approved
    list[idx] = {
      ...req,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerEmail || 'admin@noor-bayan.com',
    };
    setStore('admissions', list);

    // Auto-create student record
    const targetCourse = this.getCourses().find((c) => c.id === req.courseId || c.title === req.selectedProgram) || this.getCourses()[0];
    const createdStudent = this.createStudent({
      childName: req.childName,
      age: req.age,
      parentName: req.parentName,
      parentPhone: req.parentPhone,
      parentEmail: req.parentEmail,
      country: req.country,
      program: targetCourse.title,
      courseId: targetCourse.id,
      level: 'المستوى الأول (جديد)',
      assignedTeacherEmail: targetCourse.assignedTeacherEmail || 'teacher@noor-bayan.com',
      assignedTeacherName: targetCourse.assignedTeacherName || 'الشيخ عبد الله القرني',
      memorizedSurahs: [],
      attendanceRate: 100,
      teacherNotes: `طالب مقبول حديثاً عبر طلب التسجيل #${req.id}. الملاحظات: ${req.notes || 'لا يوجد'}`,
      status: 'active',
    });

    // Auto-create enrollment
    this.createEnrollment({
      studentId: createdStudent.id,
      studentName: createdStudent.childName,
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      paymentStatus: 'paid',
    });

    this.logAction({
      action: `اعتماد وقبول طلب التسجيل: ${req.childName} وإنشاء ملف الطالب والالتحاق`,
      category: 'admission',
      actorEmail: reviewerEmail,
      details: { admissionId: id, studentId: createdStudent.id },
    });

    return { success: true, student: createdStudent };
  },

  rejectAdmission(id: string, reason: string, reviewerEmail?: string): boolean {
    const list = getStore<AdminAdmissionRequest[]>('admissions', INITIAL_ADMISSIONS);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    const req = list[idx];

    list[idx] = {
      ...req,
      status: 'rejected',
      rejectionReason: reason.trim() || 'لم يستوفِ الشروط العمرية أو لعدم توفر شواغر في الموعد المطلوب',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerEmail || 'admin@noor-bayan.com',
    };
    setStore('admissions', list);

    this.logAction({
      action: `رفض طلب التسجيل: ${req.childName}`,
      category: 'admission',
      actorEmail: reviewerEmail,
      severity: 'warning',
      details: { admissionId: id, reason },
    });

    return true;
  },

  softDeleteAdmission(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminAdmissionRequest[]>('admissions', INITIAL_ADMISSIONS);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('admissions', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) لطلب القبول: ${list[idx].childName}`,
      category: 'admission',
      actorEmail,
      severity: 'warning',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 8. Announcements (Targeting: All / Course / Specific Students)
  // -----------------------------------------------------------
  getAnnouncements(includeDeleted = false): AdminAnnouncement[] {
    const list = getStore<AdminAnnouncement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    return includeDeleted ? list : list.filter((a) => !a.isDeleted);
  },

  createAnnouncement(data: {
    title: string;
    content: string;
    targetAudience: 'all' | 'course' | 'specific_students';
    targetCourseId?: string;
    targetCourseTitle?: string;
    targetStudentIds?: string[];
    targetStudentNames?: string[];
    priority?: 'normal' | 'important' | 'urgent';
    createdBy?: string;
  }): AdminAnnouncement {
    const list = getStore<AdminAnnouncement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    const newAnc: AdminAnnouncement = {
      id: nextUniqueId('anc'),
      title: data.title.trim(),
      content: data.content.trim(),
      targetAudience: data.targetAudience,
      targetCourseId: data.targetCourseId,
      targetCourseTitle: data.targetCourseTitle,
      targetStudentIds: data.targetStudentIds || [],
      targetStudentNames: data.targetStudentNames || [],
      priority: data.priority || 'normal',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'admin@noor-bayan.com',
      isDeleted: false,
    };
    setStore('announcements', [newAnc, ...list]);
    this.logAction({
      action: `إصدار تعميم/تنبيه جديد: ${newAnc.title}`,
      category: 'announcement',
      details: {
        announcementId: newAnc.id,
        targetAudience: newAnc.targetAudience,
        targetCourseId: newAnc.targetCourseId,
      },
    });
    return newAnc;
  },

  softDeleteAnnouncement(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminAnnouncement[]>('announcements', INITIAL_ANNOUNCEMENTS);
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    const anc = list[idx];
    list[idx] = {
      ...anc,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('announcements', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) للتعميم: ${anc.title}`,
      category: 'announcement',
      actorEmail,
      severity: 'warning',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 9. Certificates (Issue + PDF / Canvas)
  // -----------------------------------------------------------
  getCertificates(includeDeleted = false): AdminCertificateRecord[] {
    const list = getStore<AdminCertificateRecord[]>('certificates', INITIAL_CERTIFICATES);
    return includeDeleted ? list : list.filter((c) => !c.isDeleted);
  },

  issueCertificate(data: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    achievementTitle: string;
    templateType: 'completion' | 'star_student' | 'qaidah_diploma';
    themeId?: string;
    grade?: string;
    issueDate?: string;
    teacherName?: string;
    supervisorName?: string;
  }): AdminCertificateRecord {
    const list = getStore<AdminCertificateRecord[]>('certificates', INITIAL_CERTIFICATES);
    const issueDate = data.issueDate || new Date().toISOString().split('T')[0];
    const verificationCode = generateVerificationCode(
      data.studentName,
      issueDate,
      data.achievementTitle || data.courseTitle
    );

    const newCert: AdminCertificateRecord = {
      id: nextUniqueId('cert'),
      studentId: data.studentId,
      studentName: data.studentName,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      achievementTitle: data.achievementTitle,
      templateType: data.templateType,
      themeId: data.themeId || 'emerald_gold',
      grade: data.grade || 'ممتاز مع مرتبة الشرف',
      issueDate,
      verificationCode,
      teacherName: data.teacherName || 'الشيخ عبد الله القرني',
      supervisorName: data.supervisorName || 'د. عبد الرحمن السعدي',
      isDeleted: false,
    };

    setStore('certificates', [newCert, ...list]);
    this.logAction({
      action: `إصدار شهادة معتمدة للطالب: ${newCert.studentName} برمز توثيق: ${newCert.verificationCode}`,
      category: 'certificate',
      details: {
        certificateId: newCert.id,
        code: newCert.verificationCode,
        studentName: newCert.studentName,
      },
    });

    return newCert;
  },

  softDeleteCertificate(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminCertificateRecord[]>('certificates', INITIAL_CERTIFICATES);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const cert = list[idx];
    list[idx] = {
      ...cert,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('certificates', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) للشهادة: ${cert.verificationCode} الخاصة بالطالب: ${cert.studentName}`,
      category: 'certificate',
      actorEmail,
      severity: 'warning',
    });
    return true;
  },

  // -----------------------------------------------------------
  // 10. Payroll (DUPLICATE MONTH GUARD & Teacher Payout Details)
  // -----------------------------------------------------------
  getPayroll(includeDeleted = false): AdminPayroll[] {
    const list = getStore<AdminPayroll[]>('payroll', INITIAL_PAYROLL);
    return includeDeleted ? list : list.filter((p) => !p.isDeleted);
  },

  createPayrollRun(data: {
    teacherEmail: string;
    teacherName: string;
    month: string; // e.g. "نوفمبر 2026"
    hoursCompleted: number;
    hourlyRateSar: number;
    bonus?: number;
    deductions?: number;
    bankName?: string;
    accountHolderName?: string;
    ibanMasked?: string;
  }): AdminPayroll {
    const list = getStore<AdminPayroll[]>('payroll', INITIAL_PAYROLL);
    const normalizedEmail = data.teacherEmail.trim().toLowerCase();
    const normalizedMonth = data.month.trim();

    // CRITICAL: DUPLICATE MONTH GUARD!
    // A teacher cannot have two active payroll records for the exact same month!
    const existingActiveRecord = list.find(
      (p) =>
        p.teacherEmail.toLowerCase() === normalizedEmail &&
        p.month === normalizedMonth &&
        !p.isDeleted
    );

    if (existingActiveRecord) {
      throw new Error(
        `🚫 تكرار غير مسموح: يوجد مسير رواتب مسجل مسبقاً للمعلم (${data.teacherName}) عن شهر (${normalizedMonth}). لا يمكن إضافة مسير مكرر لنفس الشهر!`
      );
    }

    const hours = Number(data.hoursCompleted) || 0;
    const rate = Number(data.hourlyRateSar) || 0;
    const bonus = Number(data.bonus) || 0;
    const deductions = Number(data.deductions) || 0;
    const baseAmount = hours * rate;
    const netAmount = Math.max(0, baseAmount + bonus - deductions);

    const newPayroll: AdminPayroll = {
      id: nextUniqueId('pay'),
      teacherEmail: data.teacherEmail,
      teacherName: data.teacherName,
      month: normalizedMonth,
      hoursCompleted: hours,
      hourlyRateSar: rate,
      baseAmount,
      bonus,
      deductions,
      netAmount,
      status: 'pending',
      bankName: data.bankName || 'مصرف الراجحي (Al Rajhi Bank)',
      accountHolderName: data.accountHolderName || data.teacherName,
      ibanMasked: data.ibanMasked || 'SA03 •••• •••• •••• 6789',
      transactionRef: `TRX-RUN-${Date.now()}`,
      isDeleted: false,
    };

    setStore('payroll', [newPayroll, ...list]);
    this.logAction({
      action: `إنشاء مسير رواتب جديد: ${newPayroll.teacherName} عن شهر ${newPayroll.month} بمبلغ صافي: ${newPayroll.netAmount} ر.س`,
      category: 'payroll',
      details: {
        payrollId: newPayroll.id,
        teacherEmail: newPayroll.teacherEmail,
        month: newPayroll.month,
        netAmount: newPayroll.netAmount,
      },
    });

    return newPayroll;
  },

  markPayrollPaid(id: string, transactionRef?: string): boolean {
    const list = getStore<AdminPayroll[]>('payroll', INITIAL_PAYROLL);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      status: 'paid',
      paidAt: new Date().toISOString(),
      transactionRef: transactionRef || `SAR-BANK-${Date.now()}`,
    };
    setStore('payroll', list);
    this.logAction({
      action: `تأكيد صرف راتب: ${list[idx].teacherName} عن شهر ${list[idx].month}`,
      category: 'payroll',
      details: { payrollId: id, netAmount: list[idx].netAmount },
    });
    return true;
  },

  softDeletePayroll(id: string, actorEmail?: string): boolean {
    const list = getStore<AdminPayroll[]>('payroll', INITIAL_PAYROLL);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const pay = list[idx];
    list[idx] = {
      ...pay,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };
    setStore('payroll', list);
    this.logAction({
      action: `حذف ناعم (Soft Delete) لمسير الرواتب: ${pay.teacherName} عن شهر ${pay.month}`,
      category: 'payroll',
      actorEmail,
      severity: 'warning',
    });
    return true;
  },
};
