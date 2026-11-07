import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase Credentials requested by the user
export const DEFAULT_SUPABASE_URL = 'https://xxtgdvboqjeezemwoimr.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_SEI7HRK_XIZVhRNp5E9j-g_cv-ucCTI';

// Types for Supabase Database Tables
export interface SupabaseTeacher {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string | null;
  created_at?: string;
}

export interface SupabaseStudent {
  id: string;
  name: string;
  age: number;
  parent_name: string;
  phone: string;
  teacher_id: string | null;
  status: 'active' | 'inactive' | 'trial';
  notes?: string | null;
  meeting_link?: string | null; // e.g. Zoom, Google Meet, Microsoft Teams link
  created_at?: string;
  teacher?: SupabaseTeacher | null;
}

export interface SupabaseSubscription {
  id: string;
  student_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  created_at?: string;
  student?: SupabaseStudent | null;
}

export interface SupabaseLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  meeting_link?: string | null; // Live lecture / meeting link for the classroom
  teacher_id?: string | null;
  duration_minutes?: number | null;
  created_at?: string;
  teacher?: SupabaseTeacher | null;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalLessons: number;
}

// Initial demo seed data for graceful fallback & immediate testing
const INITIAL_DEMO_TEACHERS: SupabaseTeacher[] = [
  {
    id: 't-101',
    name: 'الشيخ عبد الله القرني',
    specialty: 'حفظ وتجويد القرآن بالقراءات العشر',
    phone: '+966 50 123 4567',
    email: 'abdullah.q@noor-bayan.com',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 't-102',
    name: 'الأستاذة فاطمة الزهراني',
    specialty: 'تأسيس اللغة العربية والقراءة السليمة (نور البيان)',
    phone: '+966 55 987 6543',
    email: 'fatimah.z@noor-bayan.com',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 't-103',
    name: 'الأستاذ أحمد الشمري',
    specialty: 'المناهج الدولية والرياضيات والعلوم',
    phone: '+966 54 333 2211',
    email: 'ahmed.sh@noor-bayan.com',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 't-104',
    name: 'الأستاذة مريم الدوسري',
    specialty: 'الحساب الذهني والذكاء وتنمية المهارات',
    phone: '+966 56 444 8899',
    email: 'maryam.d@noor-bayan.com',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const INITIAL_DEMO_STUDENTS: SupabaseStudent[] = [
  {
    id: 's-201',
    name: 'عمر فهد القحطاني',
    age: 7,
    parent_name: 'فهد القحطاني',
    phone: '+966 50 999 1122',
    teacher_id: 't-101',
    status: 'active',
    notes: 'أتم حفظ جزء عم، متميز في مخارج الحروف وأحكام النون الساكنة.',
    meeting_link: 'https://meet.google.com/xyz-quran-live',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 's-202',
    name: 'سارة خالد العتيبي',
    age: 6,
    parent_name: 'خالد العتيبي',
    phone: '+966 55 888 3344',
    teacher_id: 't-102',
    status: 'active',
    notes: 'تدرس المستوى الثاني في نور البيان، قراءة الحركات الطويلة.',
    meeting_link: 'https://zoom.us/j/9876543210?pwd=NoorBayan2026',
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: 's-203',
    name: 'يوسف ريان الغامدي',
    age: 9,
    parent_name: 'ريان الغامدي',
    phone: '+966 53 777 5566',
    teacher_id: 't-103',
    status: 'active',
    notes: 'منهج بريطاني Cambridge Math Grade 3.',
    meeting_link: 'https://meet.google.com/abc-math-live',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 's-204',
    name: 'ليان طارق المطيري',
    age: 8,
    parent_name: 'طارق المطيري',
    phone: '+966 54 666 7788',
    teacher_id: 't-104',
    status: 'trial',
    notes: 'حصة تجريبية في الحساب الذهني والسوروبان.',
    meeting_link: 'https://zoom.us/j/1234567890?pwd=TrialClass2026',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 's-205',
    name: 'حمزة إبراهيم السبيعي',
    age: 10,
    parent_name: 'إبراهيم السبيعي',
    phone: '+966 56 111 4455',
    teacher_id: 't-101',
    status: 'active',
    notes: 'حفظ سورتي الملك والقلم مع تطبيق المدود.',
    meeting_link: 'https://meet.google.com/xyz-quran-live',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

const INITIAL_DEMO_SUBSCRIPTIONS: SupabaseSubscription[] = [
  {
    id: 'sub-301',
    student_id: 's-201',
    plan_name: 'باقة التميز القرآني المكثفة (3 حصص أسبوعياً)',
    amount: 320,
    currency: 'SAR',
    status: 'active',
    start_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'sub-302',
    student_id: 's-202',
    plan_name: 'باقة تأسيس نور البيان الشاملة (حصتان أسبوعياً)',
    amount: 240,
    currency: 'SAR',
    status: 'active',
    start_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'sub-303',
    student_id: 's-203',
    plan_name: 'باقة المناهج الدولية والرياضيات (3 حصص)',
    amount: 350,
    currency: 'SAR',
    status: 'active',
    start_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'sub-304',
    student_id: 's-204',
    plan_name: 'اشتراك حصة تجريبية تمهيدية',
    amount: 0,
    currency: 'SAR',
    status: 'pending',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-305',
    student_id: 's-205',
    plan_name: 'باقة الحفظ والمراجعة الدورية (حصتان)',
    amount: 260,
    currency: 'SAR',
    status: 'active',
    start_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const INITIAL_DEMO_LESSONS: SupabaseLesson[] = [
  {
    id: 'les-401',
    title: 'مخارج الحروف: الحلق واللسان والشفتان',
    description: 'شرح تفاعلي لمخارج الحروف مع أمثلة صوتية من جزء عم وتطبيق عملي على سورة الفاتحة.',
    category: 'القرآن والتجويد',
    file_url: 'https://example.com/lessons/makharij-presentation.pdf',
    meeting_link: 'https://meet.google.com/xyz-quran-live',
    teacher_id: 't-101',
    duration_minutes: 45,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'les-402',
    title: 'قاعدة نور البيان: حركة الفتح والمد بالألف',
    description: 'تأسيس القراءة السريعة وتهجئة الكلمات الثلاثية بحركة الفتح مع بطاقات الحروف المصورة.',
    category: 'تأسيس اللغة العربية',
    file_url: 'https://example.com/lessons/noor-bayan-fatha.pdf',
    meeting_link: 'https://zoom.us/j/9876543210?pwd=NoorBayan2026',
    teacher_id: 't-102',
    duration_minutes: 40,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'les-403',
    title: 'العمليات الحسابية الذهنية السريعة (مستوى 1)',
    description: 'تدريب على عداد السوروبان الجمع والطرح المباشر وتنمية سرعة الاستجابة الذهنية للأطفال.',
    category: 'الحساب الذهني والذكاء',
    file_url: 'https://example.com/lessons/soroban-level1.pdf',
    meeting_link: 'https://meet.google.com/soroban-speed-class',
    teacher_id: 't-104',
    duration_minutes: 45,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'les-404',
    title: 'Science: States of Matter & Water Cycle',
    description: 'Interactive slides and experiment video covering solids, liquids, and condensation for primary kids.',
    category: 'المناهج الدولية والعلوم',
    file_url: 'https://example.com/lessons/states-of-matter.mp4',
    meeting_link: 'https://meet.google.com/abc-math-live',
    teacher_id: 't-103',
    duration_minutes: 50,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// Helper to get configuration keys from env or defaults
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  let envUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  let envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  // Allow override from localStorage for live testing in browser
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('supabase_custom_url');
    const customKey = localStorage.getItem('supabase_custom_key');
    if (customUrl && customKey) {
      envUrl = customUrl.trim();
      envKey = customKey.trim();
    }
  }

  const isValidUrl =
    Boolean(envUrl) &&
    envUrl.startsWith('http') &&
    !envUrl.includes('your-project') &&
    !envUrl.includes('example.com');
  const isValidKey = Boolean(envKey) && envKey.length > 15;

  return {
    url: envUrl,
    anonKey: envKey,
    isConfigured: isValidUrl && isValidKey,
  };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('supabase_custom_url', url.trim());
      localStorage.setItem('supabase_custom_key', anonKey.trim());
    } else {
      localStorage.removeItem('supabase_custom_url');
      localStorage.removeItem('supabase_custom_key');
    }
    // Re-initialize client singleton
    cachedClient = null;
  }
}

let cachedClient: SupabaseClient | null = null;

// Initialize Supabase Client singleton
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

// Export default initialized client instance
export const supabase: SupabaseClient =
  getSupabaseClient() || createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

// -------------------------------------------------------------
// Local Storage Simulation Store for immediate interactivity
// when offline or developing
// -------------------------------------------------------------
function getLocalStore<T>(key: string, initial: T[]): T[] {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = localStorage.getItem(`sb_demo_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading local storage for ${key}:`, e);
  }
  return initial;
}

function setLocalStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`sb_demo_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing local storage for ${key}:`, e);
  }
}

// -------------------------------------------------------------
// High-Level Data Service Layer (CRUD Operations with Fallback)
// -------------------------------------------------------------

export const supabaseService = {
  // 1. Overview Statistics
  async getOverviewStats(): Promise<DashboardStats> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const [
          { count: studentsCount, error: err1 },
          { count: teachersCount, error: err2 },
          { count: activeSubsCount, error: err3 },
          { count: lessonsCount, error: err4 },
          { data: subsData, error: err5 },
        ] = await Promise.all([
          client.from('students').select('*', { count: 'exact', head: true }),
          client.from('teachers').select('*', { count: 'exact', head: true }),
          client.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          client.from('lessons').select('*', { count: 'exact', head: true }),
          client.from('subscriptions').select('amount').eq('status', 'active'),
        ]);

        if (!err1 && !err2 && !err3 && !err4) {
          const totalRevenue = (subsData || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
          return {
            totalStudents: studentsCount || 0,
            totalTeachers: teachersCount || 0,
            activeSubscriptions: activeSubsCount || 0,
            totalRevenue,
            totalLessons: lessonsCount || 0,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch overview error, falling back to local simulation:', err);
      }
    }

    // Fallback calculation
    const students = getLocalStore<SupabaseStudent>('students', INITIAL_DEMO_STUDENTS);
    const teachers = getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);
    const subs = getLocalStore<SupabaseSubscription>('subscriptions', INITIAL_DEMO_SUBSCRIPTIONS);
    const lessons = getLocalStore<SupabaseLesson>('lessons', INITIAL_DEMO_LESSONS);

    const activeSubs = subs.filter((s) => s.status === 'active');
    const totalRev = activeSubs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      activeSubscriptions: activeSubs.length,
      totalRevenue: totalRev,
      totalLessons: lessons.length,
    };
  },

  // 2. Teachers Management
  async getTeachers(): Promise<SupabaseTeacher[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('teachers')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as SupabaseTeacher[];
      } catch (e) {
        console.warn('Falling back to local teachers:', e);
      }
    }
    return getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);
  },

  async addTeacher(teacher: Omit<SupabaseTeacher, 'id' | 'created_at'>): Promise<SupabaseTeacher> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('teachers')
          .insert([teacher])
          .select()
          .single();
        if (!error && data) return data as SupabaseTeacher;
        if (error) throw new Error(error.message);
      } catch (e: any) {
        console.warn('Supabase addTeacher remote error, falling back to local store:', e);
      }
    }

    // Local simulation fallback
    const teachers = getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);
    const newTeacher: SupabaseTeacher = {
      ...teacher,
      id: `t-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    setLocalStore('teachers', [newTeacher, ...teachers]);
    return newTeacher;
  },

  // 3. Students Management (With Foreign Key Relation to Teachers and Live Meeting Link)
  async getStudents(): Promise<SupabaseStudent[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('students')
          .select(`
            *,
            teacher:teachers(*)
          `)
          .order('created_at', { ascending: false });
        if (!error && data) return data as SupabaseStudent[];
      } catch (e) {
        console.warn('Falling back to local students:', e);
      }
    }

    // Local simulation fallback with joined teacher
    const students = getLocalStore<SupabaseStudent>('students', INITIAL_DEMO_STUDENTS);
    const teachers = getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);

    return students.map((s) => ({
      ...s,
      teacher: teachers.find((t) => t.id === s.teacher_id) || null,
    }));
  },

  async addStudent(student: {
    name: string;
    age: number | string;
    parent_name: string;
    phone: string;
    teacher_id?: string | null;
    status?: 'active' | 'inactive' | 'trial';
    meeting_link?: string | null;
  }): Promise<SupabaseStudent> {
    const client = getSupabaseClient();
    if (client) {
      // 1. Convert age to Number and teacher_id to null if empty
      const cleanAge = Number(student.age);
      const cleanTeacherId =
        student.teacher_id && typeof student.teacher_id === 'string' && student.teacher_id.trim() !== ''
          ? student.teacher_id.trim()
          : null;

      // 2. Send only matching schema columns: (name, age, parent_name, phone, teacher_id, status, meeting_link)
      const payload: Record<string, any> = {
        name: student.name.trim(),
        age: isNaN(cleanAge) ? 7 : cleanAge,
        parent_name: student.parent_name.trim(),
        phone: student.phone.trim(),
        teacher_id: cleanTeacherId,
        status: student.status || 'active',
        meeting_link:
          student.meeting_link && student.meeting_link.trim() !== ''
            ? student.meeting_link.trim()
            : null,
      };

      console.log('Sending student payload to Supabase:', payload);

      const { data, error } = await client
        .from('students')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error in addStudent:', error);
        throw new Error(error.message || `خطأ Supabase: ${JSON.stringify(error)}`);
      }

      if (data) {
        return data as SupabaseStudent;
      }
    }

    // Local simulation fallback ONLY if client is not configured
    const students = getLocalStore<SupabaseStudent>('students', INITIAL_DEMO_STUDENTS);
    const teachers = getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);
    const assignedTeacher = teachers.find((t) => t.id === student.teacher_id) || null;

    const newStudent: SupabaseStudent = {
      id: `s-${Date.now().toString().slice(-4)}`,
      name: student.name.trim(),
      age: Number(student.age) || 7,
      parent_name: student.parent_name.trim(),
      phone: student.phone.trim(),
      teacher_id: student.teacher_id || null,
      status: student.status || 'active',
      meeting_link: student.meeting_link || null,
      created_at: new Date().toISOString(),
      teacher: assignedTeacher,
    };
    setLocalStore('students', [newStudent, ...students]);
    return newStudent;
  },

  async updateStudentMeetingLink(studentId: string, meetingLink: string): Promise<SupabaseStudent | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('students')
          .update({ meeting_link: meetingLink.trim() })
          .eq('id', studentId)
          .select(`
            *,
            teacher:teachers(*)
          `)
          .single();
        if (!error && data) return data as SupabaseStudent;
        if (error) throw new Error(error.message);
      } catch (e: any) {
        console.warn('Supabase updateStudentMeetingLink remote error, updating local store:', e);
      }
    }

    // Local simulation fallback
    const students = getLocalStore<SupabaseStudent>('students', INITIAL_DEMO_STUDENTS);
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, meeting_link: meetingLink.trim() } : s
    );
    setLocalStore('students', updated);
    return updated.find((s) => s.id === studentId) || null;
  },

  // 4. Subscriptions Management (With Foreign Key Relation to Students)
  async getSubscriptions(): Promise<SupabaseSubscription[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('subscriptions')
          .select(`
            *,
            student:students(*)
          `)
          .order('created_at', { ascending: false });
        if (!error && data) return data as SupabaseSubscription[];
      } catch (e) {
        console.warn('Falling back to local subscriptions:', e);
      }
    }

    // Local simulation fallback with joined student
    const subs = getLocalStore<SupabaseSubscription>('subscriptions', INITIAL_DEMO_SUBSCRIPTIONS);
    const students = getLocalStore<SupabaseStudent>('students', INITIAL_DEMO_STUDENTS);

    return subs.map((sub) => ({
      ...sub,
      student: students.find((s) => s.id === sub.student_id) || null,
    }));
  },

  async addSubscription(
    subscription: Omit<SupabaseSubscription, 'id' | 'created_at' | 'student'>
  ): Promise<SupabaseSubscription> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('subscriptions')
          .insert([subscription])
          .select(`
            *,
            student:students(*)
          `)
          .single();
        if (!error && data) return data as SupabaseSubscription;
        if (error) throw new Error(error.message);
      } catch (e: any) {
        console.warn('Supabase addSubscription remote error, falling back to local store:', e);
      }
    }

    // Local simulation fallback
    const subs = getLocalStore<SupabaseSubscription>('subscriptions', INITIAL_DEMO_SUBSCRIPTIONS);
    const students = getLocalStore<SupabaseStudent>('students', INITIAL_DEMO_STUDENTS);
    const linkedStudent = students.find((s) => s.id === subscription.student_id) || null;

    const newSub: SupabaseSubscription = {
      ...subscription,
      id: `sub-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      student: linkedStudent,
    };
    setLocalStore('subscriptions', [newSub, ...subs]);
    return newSub;
  },

  // 5. Lessons Management (With Meeting Link)
  async getLessons(): Promise<SupabaseLesson[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('lessons')
          .select(`
            *,
            teacher:teachers(*)
          `)
          .order('created_at', { ascending: false });
        if (!error && data) return data as SupabaseLesson[];
      } catch (e) {
        console.warn('Falling back to local lessons:', e);
      }
    }

    // Local simulation fallback with joined teacher
    const lessons = getLocalStore<SupabaseLesson>('lessons', INITIAL_DEMO_LESSONS);
    const teachers = getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);

    return lessons.map((l) => ({
      ...l,
      teacher: teachers.find((t) => t.id === l.teacher_id) || null,
    }));
  },

  async addLesson(lesson: Omit<SupabaseLesson, 'id' | 'created_at' | 'teacher'>): Promise<SupabaseLesson> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('lessons')
          .insert([lesson])
          .select(`
            *,
            teacher:teachers(*)
          `)
          .single();
        if (!error && data) return data as SupabaseLesson;
        if (error) throw new Error(error.message);
      } catch (e: any) {
        console.warn('Supabase addLesson remote error, falling back to local store:', e);
      }
    }

    // Local simulation fallback
    const lessons = getLocalStore<SupabaseLesson>('lessons', INITIAL_DEMO_LESSONS);
    const teachers = getLocalStore<SupabaseTeacher>('teachers', INITIAL_DEMO_TEACHERS);
    const linkedTeacher = teachers.find((t) => t.id === lesson.teacher_id) || null;

    const newLesson: SupabaseLesson = {
      ...lesson,
      id: `les-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      teacher: linkedTeacher,
    };
    setLocalStore('lessons', [newLesson, ...lessons]);
    return newLesson;
  },

  async updateLessonMeetingLink(lessonId: string, meetingLink: string): Promise<SupabaseLesson | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('lessons')
          .update({ meeting_link: meetingLink.trim() })
          .eq('id', lessonId)
          .select(`
            *,
            teacher:teachers(*)
          `)
          .single();
        if (!error && data) return data as SupabaseLesson;
        if (error) throw new Error(error.message);
      } catch (e: any) {
        console.warn('Supabase updateLessonMeetingLink remote error, updating local store:', e);
      }
    }

    // Local simulation fallback
    const lessons = getLocalStore<SupabaseLesson>('lessons', INITIAL_DEMO_LESSONS);
    const updated = lessons.map((l) =>
      l.id === lessonId ? { ...l, meeting_link: meetingLink.trim() } : l
    );
    setLocalStore('lessons', updated);
    return updated.find((l) => l.id === lessonId) || null;
  },

  // SQL Schema Script for easy 1-click copy into Supabase SQL Editor
  getSqlSchemaScript(): string {
    return `-- ==========================================================
-- أكاديمية نور وبيان التعليمية للأطفال | Noor & Bayan Academy
-- مخطط جداول Supabase الكامل (PostgreSQL DDL + Live Meeting Links)
-- انسخ هذا الكود والصقه في محرّر SQL في لوحة Supabase
-- ==========================================================

-- 1. تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول المعلمين والمحفظين (teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الطلاب (students) مع ربط المعلم المسؤول ورابط المحاضرة المباشرة
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial')),
  notes TEXT,
  meeting_link TEXT, -- رابط المحاضرة المباشرة (Zoom / Google Meet / Teams)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة عمود رابط المحاضرة المباشرة إن كان الجدول موجوداً مسبقاً
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- 4. جدول الاشتراكات والمالية (subscriptions) مع ربط الطالب
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الدروس والمحتوى التعليمي (lessons) مع رابط المحاضرة المباشرة
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  meeting_link TEXT, -- رابط المحاضرة المباشرة للحصة
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  duration_minutes INT DEFAULT 45,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة عمود رابط المحاضرة المباشرة للدروس إن كان موجوداً مسبقاً
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- 6. تفعيل سياسات الأمان Row Level Security (RLS)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 7. سياسات الوصول العام (Anon Key للوحة الإدارة)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public teachers') THEN
    CREATE POLICY "Allow public teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public students') THEN
    CREATE POLICY "Allow public students" ON public.students FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public subscriptions') THEN
    CREATE POLICY "Allow public subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public lessons') THEN
    CREATE POLICY "Allow public lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 8. بيانات تجريبية أولية (اختياري)
INSERT INTO public.teachers (name, specialty, phone, email)
VALUES
  ('الشيخ عبد الله القرني', 'حفظ وتجويد القرآن بالقراءات العشر', '+966 50 123 4567', 'abdullah.q@noor-bayan.com'),
  ('الأستاذة فاطمة الزهراني', 'تأسيس اللغة العربية والقراءة السليمة (نور البيان)', '+966 55 987 6543', 'fatimah.z@noor-bayan.com'),
  ('الأستاذ أحمد الشمري', 'المناهج الدولية والرياضيات والعلوم', '+966 54 333 2211', 'ahmed.sh@noor-bayan.com')
ON CONFLICT DO NOTHING;
`;
  },
};
