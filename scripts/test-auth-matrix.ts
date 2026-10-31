import dotenv from 'dotenv';
import { getStorage } from '../src/server/storage';
import { hashPassword } from '../src/server/crypto';

dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function record(name: string, expectedStatus: number, actualStatus: number, notes?: string) {
  const passed = expectedStatus === actualStatus;
  results.push({ name, expectedStatus, actualStatus, passed, notes });
  const statusMark = passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`${statusMark} ${name} — Expected: ${expectedStatus}, Actual: ${actualStatus}${notes ? ` (${notes})` : ''}`);
}

async function request(
  endpoint: string,
  options: {
    method?: string;
    cookie?: string;
    body?: any;
  } = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.cookie) {
    headers['Cookie'] = options.cookie;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // not json
  }

  const setCookie = res.headers.get('set-cookie');
  let cookieHeader = '';
  if (setCookie) {
    const sessionMatch = setCookie.match(/nb_session=[^;]+/);
    if (sessionMatch) {
      cookieHeader = sessionMatch[0];
    }
  }

  return { status: res.status, data, cookieHeader };
}

async function run() {
  console.log('====================================================');
  console.log('   NOOR & BAYAN ACADEMY — AUTH MATRIX TEST SUITE   ');
  console.log(`   Target Server: ${BASE_URL}                      `);
  console.log('====================================================\n');

  // 1. Seed or ensure test users in storage
  const storage = await getStorage();
  const testAdminEmail = 'test-admin@noor-bayan.test';
  const testTeacherEmail = 'test-teacher@noor-bayan.test';
  const testPassword = 'TestPassword123!';

  const adminPassHash = await hashPassword(testPassword);
  let adminUser = await storage.findUserByEmail(testAdminEmail);
  if (!adminUser) {
    adminUser = await storage.createUser({
      id: 'usr-test-admin',
      email: testAdminEmail,
      passwordHash: adminPassHash,
      name: 'مدير الاختبار',
      role: 'admin',
      permissions: ['all'],
    });
  } else {
    await storage.updateUserPassword(adminUser.id, adminPassHash);
  }

  const teacherPassHash = await hashPassword(testPassword);
  let teacherUser = await storage.findUserByEmail(testTeacherEmail);
  if (!teacherUser) {
    teacherUser = await storage.createUser({
      id: 'usr-test-teacher',
      email: testTeacherEmail,
      passwordHash: teacherPassHash,
      name: 'أستاذ الاختبار',
      role: 'teacher',
      permissions: ['assigned_students', 'payouts'],
    });
  } else {
    await storage.updateUserPassword(teacherUser.id, teacherPassHash);
  }

  console.log('\n--- 1. Testing Public Routes ---');
  // GET /api/courses
  const resCourses = await request('/api/courses');
  record('GET /api/courses (Public)', 200, resCourses.status);

  // GET /api/settings
  const resSettings = await request('/api/settings');
  record('GET /api/settings (Public)', 200, resSettings.status);

  // POST /api/leads/register (valid)
  const resLead = await request('/api/leads/register', {
    method: 'POST',
    body: {
      childName: 'عبد الله محمد',
      childAge: 7,
      parentName: 'محمد أحمد',
      parentPhone: '+966512345678',
      country: 'المملكة العربية السعودية',
      programTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
      preferredTimezone: 'مكة المكرمة (GMT+3)',
      customNote: 'طلب تسجيل تجريبي',
    },
  });
  record('POST /api/leads/register (Public valid body)', 201, resLead.status);

  // POST /api/contact/submit (valid)
  const resContact = await request('/api/contact/submit', {
    method: 'POST',
    body: {
      fullName: 'أحمد محمود',
      email: 'parent@example.com',
      subject: 'استفسار عن حلقة التأسيس',
      message: 'نود الاستفسار عن تفاصيل الحلقات المسائية لطفل عمره 6 سنوات.',
    },
  });
  record('POST /api/contact/submit (Public valid body)', 200, resContact.status);

  console.log('\n--- 2. Testing Unauthenticated Access to Protected Routes (Must be 401) ---');
  const unauthTests = [
    { endpoint: '/api/courses', method: 'POST', body: { title: 'Test' } },
    { endpoint: '/api/courses/some-id', method: 'PUT', body: { title: 'Test' } },
    { endpoint: '/api/courses/some-id', method: 'DELETE' },
    { endpoint: '/api/students', method: 'GET' },
    { endpoint: '/api/students/std-1/progress', method: 'POST', body: { teacherNotes: 'test note' } },
    { endpoint: '/api/payouts', method: 'GET' },
    { endpoint: '/api/payouts/update-iban', method: 'POST', body: { iban: 'SA0000000000000000000000' } },
    { endpoint: '/api/leads', method: 'GET' },
    { endpoint: '/api/contact/inquiries', method: 'GET' },
  ];

  for (const t of unauthTests) {
    const res = await request(t.endpoint, { method: t.method, body: t.body });
    record(`${t.method} ${t.endpoint} (Unauthenticated)`, 401, res.status);
  }

  console.log('\n--- 3. Testing Teacher Role Authorization ---');
  // Login as Teacher
  const teacherLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: testTeacherEmail, password: testPassword },
  });
  record('POST /api/auth/login (Teacher Login)', 200, teacherLogin.status);
  const teacherCookie = teacherLogin.cookieHeader;

  // Teacher GET /api/students -> 200 (only their students)
  const teacherStudents = await request('/api/students', { cookie: teacherCookie });
  record('GET /api/students (Teacher sees assigned)', 200, teacherStudents.status);

  // Teacher GET /api/payouts -> 200 (only their payouts derived from session)
  const teacherPayouts = await request('/api/payouts', { cookie: teacherCookie });
  record('GET /api/payouts (Teacher sees own payouts)', 200, teacherPayouts.status);

  // Teacher POST /api/payouts/update-iban -> 200
  const teacherIban = await request('/api/payouts/update-iban', {
    method: 'POST',
    cookie: teacherCookie,
    body: {
      bankName: 'مصرف الراجحي',
      accountHolderName: 'أ. خديجة الأنصاري',
      iban: 'SA4420000001234567891234',
    },
  });
  record('POST /api/payouts/update-iban (Teacher updates own IBAN)', 200, teacherIban.status);

  // Teacher CANNOT create courses -> 403 Forbidden
  const teacherCreateCourse = await request('/api/courses', {
    method: 'POST',
    cookie: teacherCookie,
    body: {
      title: 'Unauthorized Course',
      subtitle: 'Sub',
      ageBracket: '5-10',
      minAge: 5,
      maxAge: 10,
      category: 'quran',
      priceSar: 200,
      billingUnit: 'شهرياً',
      image: '/images/hero_learning.jpg',
      description: 'Course description for test',
      weeklySessions: 2,
      sessionDurationMins: 45,
      features: ['Feature 1'],
    },
  });
  record('POST /api/courses (Teacher forbidden from creating courses)', 403, teacherCreateCourse.status);

  // Teacher CANNOT read leads -> 403 Forbidden
  const teacherLeads = await request('/api/leads', { cookie: teacherCookie });
  record('GET /api/leads (Teacher forbidden from viewing leads)', 403, teacherLeads.status);

  // Teacher CANNOT read contact inquiries -> 403 Forbidden
  const teacherInquiries = await request('/api/contact/inquiries', { cookie: teacherCookie });
  record('GET /api/contact/inquiries (Teacher forbidden from inquiries)', 403, teacherInquiries.status);

  console.log('\n--- 4. Testing Admin Role Authorization ---');
  // Login as Admin
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: testAdminEmail, password: testPassword },
  });
  record('POST /api/auth/login (Admin Login)', 200, adminLogin.status);
  const adminCookie = adminLogin.cookieHeader;

  // Admin GET /api/leads -> 200
  const adminLeads = await request('/api/leads', { cookie: adminCookie });
  record('GET /api/leads (Admin sees all leads)', 200, adminLeads.status);

  // Admin GET /api/contact/inquiries -> 200
  const adminInquiries = await request('/api/contact/inquiries', { cookie: adminCookie });
  record('GET /api/contact/inquiries (Admin sees inquiries)', 200, adminInquiries.status);

  // Admin POST /api/courses -> 201
  const adminCourse = await request('/api/courses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      title: 'دورة تجريبية للإدارة',
      subtitle: 'وصف فرعي للمنهج',
      ageBracket: '6 - 12 سنة',
      minAge: 6,
      maxAge: 12,
      category: 'quran',
      priceSar: 250,
      billingUnit: 'شهرياً',
      image: '/images/quran_kids.jpg',
      description: 'وصف الدورة التجريبية للاختبار المؤتمت لمصفوفة الصلاحيات',
      weeklySessions: 3,
      sessionDurationMins: 45,
      features: ['ميزة اختبار 1', 'ميزة اختبار 2'],
    },
  });
  record('POST /api/courses (Admin creates course)', 201, adminCourse.status);

  // Admin GET /api/students -> 200
  const adminStudents = await request('/api/students', { cookie: adminCookie });
  record('GET /api/students (Admin sees all students)', 200, adminStudents.status);

  // Admin GET /api/payouts -> 200
  const adminPayouts = await request('/api/payouts', { cookie: adminCookie });
  record('GET /api/payouts (Admin sees all payouts)', 200, adminPayouts.status);

  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`   TEST SUMMARY: ${passedCount} / ${totalCount} PASSED`);
  console.log('====================================================\n');

  if (passedCount === totalCount) {
    console.log('\x1b[32m✔ All Auth Matrix tests passed successfully!\x1b[0m');
    process.exit(0);
  } else {
    console.error(`\x1b[31m✖ ${totalCount - passedCount} test(s) failed.\x1b[0m`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});
