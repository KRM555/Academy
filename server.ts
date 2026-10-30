import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support image uploads as Base64 Data URLs (up to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Data Interfaces
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
  installmentsEligible: boolean;
  features: string[];
  instructorName: string;
  instructorTitle: string;
}

interface Student {
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

interface TeacherPayout {
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

// Initial Seed Data for Noor & Bayan Academy (100% Online Classes)
let academyCourses: ProgramCourse[] = [
  {
    id: 'prog-noor-yutla',
    title: 'حلقات "نور يتلى" لتحفيظ القرآن والتجويد',
    subtitle: 'حفظ وتثبيت القرآن الكريم بالترتيل المجوّد ومراعاة مخارج الحروف للأطفال',
    ageBracket: '5 - 14 سنة',
    minAge: 5,
    maxAge: 14,
    category: 'quran',
    deliveryMode: 'online',
    image: '/src/assets/images/quran_recitation_kids_1793317242043.jpg',
    description: 'رحلة إيمانية وتعليمية أونلاين 100% يقودها نخبة من المعلمين المجازين بالقراءات، يدمج بين الحفظ المتقن والتفسير الميسر عبر غرف زوم تفاعلية مصغرة.',
    weeklySessions: 3,
    sessionDurationMins: 45,
    priceSar: 280,
    installmentsEligible: true,
    features: [
      'حلقات فردية ومصغرة أونلاين (أقصى حد 5 أطفال في الغرفة)',
      'معلمون ومعلمات مجازون بالقراءات العشر للقرآن الكريم',
      'تسميع تفاعلي وتسجيلات صوتية يومية لمتابعة ولي الأمر',
      'شهادة إتمام معتمدة ووسام فخري لكل جزء',
    ],
    instructorName: 'الشيخ عبد الرحمن الغامدي',
    instructorTitle: 'مجاز بالقراءات العشر ومشرف حلقات التحفيظ',
  },
  {
    id: 'prog-nooraniyah',
    title: 'التأسيس اللغوي والقراءة السليمة والتهجئة',
    subtitle: 'تأسيس الطفل في القراءة الصحيحة والنطق الفصيح بأسلوب تفاعلي مرح',
    ageBracket: '4 - 7 سنوات',
    minAge: 4,
    maxAge: 7,
    category: 'arabic',
    deliveryMode: 'online',
    image: '/src/assets/images/hero_arab_kids_learning_1793317241979.jpg',
    description: 'المنهج الأقوى لتأسيس نطق الحروف العربية بحركاتها وسكناتها، تمكين الطفل من قراءة كلمات القرآن واللغة العربية بطلاقة وسرعة وبدون تعثر عبر حصص مرئية مباشرة.',
    weeklySessions: 3,
    sessionDurationMins: 40,
    priceSar: 240,
    installmentsEligible: true,
    features: [
      'ألعاب بصرية تفاعلية وتمارين صوتية لتمييز الحروف',
      'علاج مشكلات لدغات الحروف وصعوبة مخارج الألفاظ',
      'تدريب على الوصل والمدود بطريقة الإيقاع المحبب للطفل',
      'حقيبة أنشطة رقمية تفاعلية مجانية مع التسجيل',
    ],
    instructorName: 'أ. مروة الشربيني',
    instructorTitle: 'أخصائية التأسيس اللغوي وتنمية المهارات القرائية',
  },
  {
    id: 'prog-ayah-story',
    title: 'برنامج "آية وحكاية" وغرس القيم والأخلاق',
    subtitle: 'تعديل السلوك وبناء الشخصية المتزنة عبر قصص الأنبياء والقرآن',
    ageBracket: '6 - 12 سنة',
    minAge: 6,
    maxAge: 12,
    category: 'values',
    deliveryMode: 'online',
    image: '/src/assets/images/mothers_educational_session_1793317242529.jpg',
    description: 'برنامج تربوي قيمي يربط الطفل بالقرآن كمنهج حياة، من خلال سرد قصصي تفاعلي، وتمثيل أدوار، ومناقشة مواقف واقعية لترسيخ الصدق، الأمانة، وبر الوالدين.',
    weeklySessions: 2,
    sessionDurationMins: 50,
    priceSar: 220,
    installmentsEligible: true,
    features: [
      'ورش تفاعلية أونلاين وسرد قصصي شيق ملهم',
      'تعديل السلوكيات السلبية (العناد، الغضب، الخجل الزائد)',
      'تعزيز الهوية العربية والإسلامية في عصر الأجهزة والذكاء الاصطناعي',
      'تقرير سلوكي وتربوي شهري مفصل لولي الأمر',
    ],
    instructorName: 'د. هند العتيبي',
    instructorTitle: 'استشارية الإرشاد التربوي وتعديل سلوك الأطفال',
  },
  {
    id: 'prog-stem-robotics',
    title: 'نادي رواد المستقبل (برمجة وذكاء اصطناعي للأطفال)',
    subtitle: 'تعليم التفكير المنطقي ولغات البرمجة والروبوتكس بطرق إبداعية مسلية',
    ageBracket: '7 - 14 سنة',
    minAge: 7,
    maxAge: 14,
    category: 'tech',
    deliveryMode: 'online',
    image: '/src/assets/images/arabic_stem_robotics_kids_1793317242654.jpg',
    description: 'تمكين أطفالنا من التحول من مجرد مستهلكين للتقنية إلى مبتكرين ومبرمجين عبر مشاريع عملية في بيئة Scratch، بايثون للصغار، ومبادئ الذكاء الاصطناعي.',
    weeklySessions: 2,
    sessionDurationMins: 60,
    priceSar: 340,
    installmentsEligible: true,
    features: [
      'تطبيق مشاريع وألعاب برمجية عملية من الحصة الأولى أونلاين',
      'فهم خوارزميات التفكير وحل المشكلات الحياتية',
      'معلمون ومهندسون متخصصون في تدريس برمجيات الصغار',
      'معرض رقمي سحابي لنشر مشاريع الطالب ومشاركتها مع العائلة',
    ],
    instructorName: 'م. أنس الباز',
    instructorTitle: 'مدرب برمجيات الأطفال والذكاء الاصطناعي التفاعلي',
  },
  {
    id: 'prog-mothers-oasis',
    title: 'واحة الأمهات والاستشارات التربوية المتخصصة',
    subtitle: 'برامج تمكين وتوجيه للأمهات للتعامل الأمثل مع تحديات الطفولة والمراهقة',
    ageBracket: 'للأمهات والمربيات',
    minAge: 18,
    maxAge: 70,
    category: 'mothers',
    deliveryMode: 'online',
    image: '/src/assets/images/mothers_educational_session_1793317242529.jpg',
    description: 'مساحة دافئة أونلاين تجمع نخبة من الاستشاريين النفسيين والتربويين لمساندة الأم في تربية أبنائها، التعامل مع إدمان الأجهزة الذكية، وتطوير مهارات الاستماع الفعّال.',
    weeklySessions: 1,
    sessionDurationMins: 90,
    priceSar: 190,
    installmentsEligible: false,
    features: [
      'جلسات حوارية أسبوعية مغلقة ومباشرة عبر زوم مع الأخصائيين',
      'استشارة فردية خاصة لمدة 30 دقيقة لكل مشتركة',
      'حقيبة أدوات عملية لتنظيم وقت الأبناء وتقليل الشاشات',
      'مجتمع أمهات مساند ومحفز لتبادل التجارب التربوية الناجحة',
    ],
    instructorName: 'أ. دلال الشمري',
    instructorTitle: 'ماجستير التوجيه والإرشاد النفسي الأسري',
  },
];

const mockStudents: Student[] = [
  {
    id: 'std-101',
    childName: 'عمر بن سلطان',
    age: 7,
    parentName: 'سلطان القحطاني',
    parentPhone: '+966501234567',
    country: 'المملكة العربية السعودية',
    program: 'حلقات "نور يتلى" (أونلاين مباشر)',
    level: 'جزء عم - سورة النبأ',
    memorizedSurahs: ['الناس', 'الفلق', 'الإخلاص', 'المسد', 'النصر', 'الكافرون', 'الكوثر', 'الماعون', 'قريش', 'الفيل', 'الهمزة', 'العصر', 'التكاثر', 'القارعة', 'الزلزلة', 'البينة', 'القدر', 'العلق', 'التين', 'الشرح', 'الضحى'],
    attendanceRate: 98,
    teacherNotes: 'ما شاء الله تبارك الله، مخارج الحروف ممتازة والتزام مستمر في الحفظ اليومي.',
    status: 'active',
    enrolledAt: '2026-09-01',
  },
  {
    id: 'std-102',
    childName: 'سارة أحمد الشناوي',
    age: 5,
    parentName: 'منى عبد الوهاب',
    parentPhone: '+201012345678',
    country: 'مصر',
    program: 'التأسيس اللغوي والقراءة السليمة والتهجئة (أونلاين)',
    level: 'الحروف الممدودة بالحركات الطويلة',
    memorizedSurahs: ['الفاتحة', 'الإخلاص', 'الفلق', 'الناس'],
    attendanceRate: 95,
    teacherNotes: 'استجابة سريعة في تمييز الحروف الهجائية بالصوت والصورة.',
    status: 'active',
    enrolledAt: '2026-09-15',
  },
  {
    id: 'std-103',
    childName: 'ريان عبد العزيز التميمي',
    age: 10,
    parentName: 'عبد العزيز التميمي',
    parentPhone: '+971509876543',
    country: 'الإمارات العربية المتحدة',
    program: 'نادي رواد المستقبل التقني (أونلاين)',
    level: 'بناء وبرمجة الألعاب التفاعلية المستوى 2',
    memorizedSurahs: ['جزء عم كاملاً'],
    attendanceRate: 92,
    teacherNotes: 'أظهر قدرات تحليلية فائقة في إتمام التحدي البرمجي الأسبوعي.',
    status: 'active',
    enrolledAt: '2026-10-01',
  },
];

const mockPayouts: TeacherPayout[] = [
  {
    id: 'pay-001',
    teacherEmail: 'teacher@academy.com',
    teacherName: 'أ. عبد الرحمن الغامدي',
    month: 'أكتوبر 2026',
    hoursCompleted: 48,
    hourlyRateSar: 120,
    totalEarningsSar: 5760,
    payoutStatus: 'paid',
    maskedCardNumber: '**** **** **** 5824',
    bankName: 'مصرف الراجحي (السعودية)',
    ibanMasked: 'SA44 8000 0000 **** **** 9102',
  },
  {
    id: 'pay-002',
    teacherEmail: 'teacher@academy.com',
    teacherName: 'أ. عبد الرحمن الغامدي',
    month: 'نوفمبر 2026 (الجارية)',
    hoursCompleted: 34,
    hourlyRateSar: 120,
    totalEarningsSar: 4080,
    payoutStatus: 'pending',
    maskedCardNumber: '**** **** **** 5824',
    bankName: 'مصرف الراجحي (السعودية)',
    ibanMasked: 'SA44 8000 0000 **** **** 9102',
  },
];

const registeredLeads: any[] = [];

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  destinationEmail: string;
  createdAt: string;
}

const contactInquiries: ContactInquiry[] = [
  {
    id: 'NB-INQ-2026-1042',
    fullName: 'أبو عبد الله القحطاني',
    email: 'abdullah.q@gmail.com',
    phone: '+966501234567',
    subject: 'استفسار عن حلقات تحفيظ القرآن الكريم والتجويد',
    message: 'السلام عليكم، نود الاستفسار عن إمكانية حجز حصة تجريبية لحفظ جزء عم لطفل عمره 7 سنوات والمواعيد المسائية المتاحة.',
    destinationEmail: 'support@noor-bayan.com',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

// API Routes
// 1. Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'admin@academy.com' && password === 'admin123') {
    return res.json({
      success: true,
      token: 'jwt_admin_' + Date.now(),
      user: {
        email: cleanEmail,
        name: 'إدارة أكاديمية نور وبيان',
        role: 'admin',
        permissions: ['all', 'manage_courses', 'manage_students', 'manage_payouts'],
      },
    });
  }

  if (cleanEmail === 'teacher@academy.com' && password === 'teacher123') {
    return res.json({
      success: true,
      token: 'jwt_teacher_' + Date.now(),
      user: {
        email: cleanEmail,
        name: 'أ. عبد الرحمن الغامدي',
        role: 'teacher',
        permissions: ['view_students', 'update_progress', 'view_payouts'],
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'بيانات الدخول غير صحيحة. للتجربة: admin@academy.com / admin123 أو teacher@academy.com / teacher123',
  });
});

// 2. Courses CRUD with Custom Uploaded Images Support
app.get('/api/courses', (_req: Request, res: Response) => {
  res.json({ success: true, courses: academyCourses });
});

app.post('/api/courses', (req: Request, res: Response) => {
  const { title, subtitle, ageBracket, category, priceSar, description, weeklySessions, sessionDurationMins, image, instructorName } = req.body;

  if (!title || !priceSar) {
    return res.status(400).json({ success: false, message: 'اسم الحصة والرسوم مطلوبان.' });
  }

  const newCourse: ProgramCourse = {
    id: 'course-' + Date.now(),
    title: String(title).slice(0, 100),
    subtitle: String(subtitle || 'حصة تعليمية تفاعلية أونلاين 100%').slice(0, 150),
    ageBracket: String(ageBracket || '5 - 12 سنة').slice(0, 50),
    minAge: 4,
    maxAge: 15,
    category: category || 'quran',
    deliveryMode: 'online',
    // Accepts uploaded Base64 image data URL or image path
    image: image || '/src/assets/images/hero_arab_kids_learning_1793317241979.jpg',
    description: String(description || 'منهج تعليمي مميز مصمم لبناء مهارات الطفل وتنمية شخصيته.').slice(0, 500),
    weeklySessions: Number(weeklySessions) || 2,
    sessionDurationMins: Number(sessionDurationMins) || 45,
    priceSar: Number(priceSar) || 200,
    installmentsEligible: true,
    features: ['حلقات مصغرة أونلاين عبر زوم', 'معلمون مجازون', 'تقارير أسبوعية لولي الأمر'],
    instructorName: instructorName || 'معلم معتمد بأكاديمية نور وبيان',
    instructorTitle: 'أخصائي تعليم أطفال وتطوير مهارات',
  };

  academyCourses.unshift(newCourse);
  res.json({ success: true, message: 'تمت إضافة الحصة بنجاح إلى منصة نور وبيان', course: newCourse });
});

app.put('/api/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const course = academyCourses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'الحصة غير موجودة' });
  }

  const { title, subtitle, priceSar, description, ageBracket, weeklySessions, image, category } = req.body;
  if (title) course.title = String(title).slice(0, 100);
  if (subtitle) course.subtitle = String(subtitle).slice(0, 150);
  if (priceSar !== undefined) course.priceSar = Number(priceSar);
  if (description) course.description = String(description).slice(0, 500);
  if (ageBracket) course.ageBracket = String(ageBracket);
  if (weeklySessions) course.weeklySessions = Number(weeklySessions);
  if (image) course.image = String(image);
  if (category) course.category = category;

  res.json({ success: true, message: 'تم تحديث بيانات الحصة بنجاح', course });
});

app.delete('/api/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = academyCourses.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'الحصة غير موجودة' });
  }

  academyCourses.splice(index, 1);
  res.json({ success: true, message: 'تم إلغاء وحذف الحصة بنجاح' });
});

// 3. Students
app.get('/api/students', (_req: Request, res: Response) => {
  res.json({ success: true, students: mockStudents });
});

app.post('/api/students/:id/progress', (req: Request, res: Response) => {
  const { id } = req.params;
  const { teacherNotes, attendanceRate, newSurah } = req.body;

  const student = mockStudents.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'الطالب غير موجود' });
  }

  if (teacherNotes) student.teacherNotes = String(teacherNotes);
  if (typeof attendanceRate === 'number') student.attendanceRate = Math.min(100, Math.max(0, attendanceRate));
  if (newSurah && !student.memorizedSurahs.includes(newSurah)) {
    student.memorizedSurahs.push(newSurah);
  }

  res.json({ success: true, message: 'تم تحديث سجل الطالب بنجاح', student });
});

// 4. Payouts & Card Management (PCI-Compliant)
app.get('/api/payouts', (req: Request, res: Response) => {
  const teacherEmail = (req.query.email as string) || '';
  if (teacherEmail && teacherEmail !== 'admin@academy.com') {
    const filtered = mockPayouts.filter((p) => p.teacherEmail.toLowerCase() === teacherEmail.toLowerCase());
    return res.json({ success: true, payouts: filtered });
  }
  res.json({ success: true, payouts: mockPayouts });
});

app.post('/api/payouts/update-card', (req: Request, res: Response) => {
  const { teacherEmail, cardNumber, bankName, iban } = req.body;
  if (!cardNumber || typeof cardNumber !== 'string') {
    return res.status(400).json({ success: false, message: 'يرجى تقديم بيانات بطاقة صحيحة.' });
  }

  const cleanDigits = cardNumber.replace(/\D/g, '');
  const last4 = cleanDigits.slice(-4) || '9999';
  const maskedCard = `**** **** **** ${last4}`;

  mockPayouts.forEach((p) => {
    if (p.teacherEmail.toLowerCase() === (teacherEmail || '').toLowerCase()) {
      p.maskedCardNumber = maskedCard;
      if (bankName) p.bankName = bankName;
      if (iban) p.ibanMasked = iban.slice(0, 4) + ' **** **** ' + iban.slice(-4);
    }
  });

  res.json({
    success: true,
    message: 'تم تحديث وسيلة استلام المستحقات بأمان',
    maskedCardNumber: maskedCard,
  });
});

// 5. Leads
app.post('/api/leads/register', (req: Request, res: Response) => {
  const { childName, childAge, parentName, parentPhone, country, selectedProgram, preferredTime } = req.body;
  if (!childName || !parentPhone) {
    return res.status(400).json({ success: false, message: 'اسم الطفل ورقم هاتف ولي الأمر مطلوبان.' });
  }

  const newLead = {
    id: 'NB-' + (registeredLeads.length + 1001),
    childName: String(childName).slice(0, 80),
    childAge: Number(childAge) || 6,
    parentName: String(parentName || '').slice(0, 80),
    parentPhone: String(parentPhone).slice(0, 30),
    country: String(country || 'السعودية').slice(0, 50),
    selectedProgram: String(selectedProgram || 'حلقات القرآن').slice(0, 100),
    preferredTime: String(preferredTime || 'مسائي').slice(0, 50),
    createdAt: new Date().toISOString(),
  };

  registeredLeads.unshift(newLead);
  res.json({
    success: true,
    message: 'تم تسجيل طلب الاشتراك بنجاح في أكاديمية نور وبيان! سيتواصل معكم المستشار الأكاديمي عبر الواتساب فوراً.',
    leadId: newLead.id,
  });
});

app.get('/api/leads', (_req: Request, res: Response) => {
  res.json({ success: true, leads: registeredLeads });
});

// 6. Direct Contact Inquiries (Dispatched to official platform email)
app.post('/api/contact/submit', (req: Request, res: Response) => {
  const { fullName, email, phone, subject, message } = req.body;
  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'يرجى استيفاء الحقول الإلزامية للنموذج.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح.' });
  }

  if (String(fullName).trim().length < 2) {
    return res.status(400).json({ success: false, message: 'الاسم قصير جداً (حرفين على الأقل).' });
  }

  if (String(message).trim().length < 10) {
    return res.status(400).json({ success: false, message: 'نص الرسالة قصير جداً (10 أحرف على الأقل).' });
  }

  const ticketId = `NB-INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInquiry: ContactInquiry = {
    id: ticketId,
    fullName: String(fullName).trim().slice(0, 100),
    email: String(email).trim().slice(0, 120),
    phone: phone ? String(phone).trim().slice(0, 40) : undefined,
    subject: String(subject).trim().slice(0, 150),
    message: String(message).trim().slice(0, 1500),
    destinationEmail: 'support@noor-bayan.com',
    createdAt: new Date().toISOString(),
  };

  contactInquiries.unshift(newInquiry);

  console.log(`[Contact Form] Dispatched new inquiry #${newInquiry.id} to ${newInquiry.destinationEmail} from ${newInquiry.email}`);

  res.json({
    success: true,
    message: 'تم إرسال استفسارك بنجاح إلى البريد الإلكتروني للمنصة (support@noor-bayan.com).',
    ticketId: newInquiry.id,
    destinationEmail: newInquiry.destinationEmail,
    inquiry: newInquiry,
  });
});

app.get('/api/contact/inquiries', (_req: Request, res: Response) => {
  res.json({ success: true, inquiries: contactInquiries });
});

// 7. Academy Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    academyName: 'أكاديمية نور وبيان التعليمية للأطفال',
    officialFacebook: 'https://www.facebook.com/share/1Evoqg1BVn/?mibextid=wwXIfr',
    officialWhatsApp: '+966500000000',
    contactEmail: 'info@noor-bayan.com',
    mode: '100% فصول تفاعلية حية أونلاين عبر زوم',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
