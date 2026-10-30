import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { ProgramCourse, Student, TeacherPayout, UserAuth, ContactInquiry, RegisteredLead } from '../types';
import { encryptAtRest, decryptAtRest, maskIban, hashPassword } from './crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'teacher';
  permissions: string[];
  createdAt: string;
}

export interface TeacherPayoutRecord {
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
  ibanEncrypted: string;
  createdAt: string;
}

export interface IStorage {
  init(): Promise<void>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(user: Omit<UserRecord, 'createdAt'>): Promise<UserRecord>;
  
  getCourses(): Promise<ProgramCourse[]>;
  getCourseById(id: string): Promise<ProgramCourse | null>;
  createCourse(course: ProgramCourse): Promise<ProgramCourse>;
  updateCourse(id: string, updates: Partial<ProgramCourse>): Promise<ProgramCourse | null>;
  deleteCourse(id: string): Promise<boolean>;

  getStudents(filterTeacherEmail?: string): Promise<Student[]>;
  getStudentById(id: string): Promise<Student | null>;
  updateStudentProgress(id: string, newSurah?: string, teacherNotes?: string): Promise<Student | null>;

  getPayouts(filterTeacherEmail?: string): Promise<TeacherPayout[]>;
  updateTeacherBankDetails(
    teacherEmail: string,
    bankName: string,
    accountHolderName: string,
    plainIban: string
  ): Promise<TeacherPayout | null>;

  createLead(lead: Omit<RegisteredLead, 'id' | 'createdAt' | 'status'>): Promise<RegisteredLead>;
  getLeads(): Promise<RegisteredLead[]>;

  createInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt'>): Promise<ContactInquiry>;
  getInquiries(): Promise<ContactInquiry[]>;
}

// -------------------------------------------------------------
// PostgreSQL Storage Implementation (Production & Configured Dev)
// -------------------------------------------------------------
class PostgresStorage implements IStorage {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }

  async init(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(32) NOT NULL,
          permissions JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS courses (
          id VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS students (
          id VARCHAR(64) PRIMARY KEY,
          child_name VARCHAR(255) NOT NULL,
          age INT NOT NULL,
          parent_name VARCHAR(255) NOT NULL,
          parent_phone VARCHAR(64) NOT NULL,
          country VARCHAR(64) NOT NULL,
          program VARCHAR(255) NOT NULL,
          level VARCHAR(64) NOT NULL,
          assigned_teacher_email VARCHAR(255),
          memorized_surahs JSONB NOT NULL DEFAULT '[]',
          attendance_rate INT NOT NULL DEFAULT 100,
          teacher_notes TEXT NOT NULL DEFAULT '',
          status VARCHAR(32) NOT NULL DEFAULT 'active',
          enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS teacher_payouts (
          id VARCHAR(64) PRIMARY KEY,
          teacher_email VARCHAR(255) NOT NULL,
          teacher_name VARCHAR(255) NOT NULL,
          month VARCHAR(32) NOT NULL,
          hours_completed NUMERIC NOT NULL,
          hourly_rate_sar NUMERIC NOT NULL,
          total_earnings_sar NUMERIC NOT NULL,
          payout_status VARCHAR(32) NOT NULL DEFAULT 'pending',
          bank_name VARCHAR(255) NOT NULL DEFAULT '',
          account_holder_name VARCHAR(255) NOT NULL DEFAULT '',
          iban_encrypted TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS leads (
          id VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS inquiries (
          id VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      console.log('[Storage] PostgreSQL schema initialized successfully.');
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      permissions: r.permissions,
      createdAt: r.created_at.toISOString(),
    };
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      permissions: r.permissions,
      createdAt: r.created_at.toISOString(),
    };
  }

  async createUser(user: Omit<UserRecord, 'createdAt'>): Promise<UserRecord> {
    const now = new Date();
    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, permissions, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.id, user.email.toLowerCase(), user.passwordHash, user.name, user.role, JSON.stringify(user.permissions), now]
    );
    return { ...user, createdAt: now.toISOString() };
  }

  async getCourses(): Promise<ProgramCourse[]> {
    const res = await this.pool.query('SELECT data FROM courses ORDER BY created_at ASC');
    return res.rows.map((r) => r.data as ProgramCourse);
  }

  async getCourseById(id: string): Promise<ProgramCourse | null> {
    const res = await this.pool.query('SELECT data FROM courses WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data as ProgramCourse;
  }

  async createCourse(course: ProgramCourse): Promise<ProgramCourse> {
    await this.pool.query(
      'INSERT INTO courses (id, data, created_at) VALUES ($1, $2, NOW())',
      [course.id, JSON.stringify(course)]
    );
    return course;
  }

  async updateCourse(id: string, updates: Partial<ProgramCourse>): Promise<ProgramCourse | null> {
    const current = await this.getCourseById(id);
    if (!current) return null;
    const merged = { ...current, ...updates };
    await this.pool.query('UPDATE courses SET data = $1 WHERE id = $2', [JSON.stringify(merged), id]);
    return merged;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM courses WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getStudents(filterTeacherEmail?: string): Promise<Student[]> {
    let query = 'SELECT * FROM students';
    const params: string[] = [];
    if (filterTeacherEmail) {
      query += ' WHERE LOWER(assigned_teacher_email) = LOWER($1)';
      params.push(filterTeacherEmail);
    }
    query += ' ORDER BY enrolled_at DESC';
    const res = await this.pool.query(query, params);
    return res.rows.map((r) => ({
      id: r.id,
      childName: r.child_name,
      age: r.age,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      country: r.country,
      program: r.program,
      level: r.level,
      assignedTeacherEmail: r.assigned_teacher_email,
      memorizedSurahs: r.memorized_surahs,
      attendanceRate: r.attendance_rate,
      teacherNotes: r.teacher_notes,
      status: r.status,
      enrolledAt: r.enrolled_at.toISOString(),
    }));
  }

  async getStudentById(id: string): Promise<Student | null> {
    const res = await this.pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      childName: r.child_name,
      age: r.age,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      country: r.country,
      program: r.program,
      level: r.level,
      assignedTeacherEmail: r.assigned_teacher_email,
      memorizedSurahs: r.memorized_surahs,
      attendanceRate: r.attendance_rate,
      teacherNotes: r.teacher_notes,
      status: r.status,
      enrolledAt: r.enrolled_at.toISOString(),
    };
  }

  async updateStudentProgress(id: string, newSurah?: string, teacherNotes?: string): Promise<Student | null> {
    const student = await this.getStudentById(id);
    if (!student) return null;

    let surahs = [...student.memorizedSurahs];
    if (newSurah && !surahs.includes(newSurah)) {
      surahs.push(newSurah);
    }

    const notes = teacherNotes !== undefined ? teacherNotes : student.teacherNotes;
    await this.pool.query(
      `UPDATE students SET memorized_surahs = $1, teacher_notes = $2 WHERE id = $3`,
      [JSON.stringify(surahs), notes, id]
    );

    return {
      ...student,
      memorizedSurahs: surahs,
      teacherNotes: notes,
    };
  }

  async getPayouts(filterTeacherEmail?: string): Promise<TeacherPayout[]> {
    let query = 'SELECT * FROM teacher_payouts';
    const params: string[] = [];
    if (filterTeacherEmail) {
      query += ' WHERE LOWER(teacher_email) = LOWER($1)';
      params.push(filterTeacherEmail);
    }
    query += ' ORDER BY created_at DESC';
    const res = await this.pool.query(query, params);
    return res.rows.map((r) => {
      const decryptedIban = r.iban_encrypted ? decryptAtRest(r.iban_encrypted) : '';
      return {
        id: r.id,
        teacherEmail: r.teacher_email,
        teacherName: r.teacher_name,
        month: r.month,
        hoursCompleted: Number(r.hours_completed),
        hourlyRateSar: Number(r.hourly_rate_sar),
        totalEarningsSar: Number(r.total_earnings_sar),
        payoutStatus: r.payout_status,
        bankName: r.bank_name || '',
        accountHolderName: r.account_holder_name || '',
        ibanMasked: maskIban(decryptedIban),
      };
    });
  }

  async updateTeacherBankDetails(
    teacherEmail: string,
    bankName: string,
    accountHolderName: string,
    plainIban: string
  ): Promise<TeacherPayout | null> {
    const encrypted = encryptAtRest(plainIban);
    const res = await this.pool.query(
      `UPDATE teacher_payouts
       SET bank_name = $1, account_holder_name = $2, iban_encrypted = $3
       WHERE LOWER(teacher_email) = LOWER($4)
       RETURNING *`,
      [bankName, accountHolderName, encrypted, teacherEmail.toLowerCase()]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      teacherEmail: r.teacher_email,
      teacherName: r.teacher_name,
      month: r.month,
      hoursCompleted: Number(r.hours_completed),
      hourlyRateSar: Number(r.hourly_rate_sar),
      totalEarningsSar: Number(r.total_earnings_sar),
      payoutStatus: r.payout_status,
      bankName: r.bank_name,
      accountHolderName: r.account_holder_name,
      ibanMasked: maskIban(plainIban),
    };
  }

  async createLead(leadData: Omit<RegisteredLead, 'id' | 'createdAt' | 'status'>): Promise<RegisteredLead> {
    const id = `lead-${crypto.randomUUID()}`;
    const fullLead: RegisteredLead = {
      ...leadData,
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    await this.pool.query(
      'INSERT INTO leads (id, data, created_at) VALUES ($1, $2, NOW())',
      [id, JSON.stringify(fullLead)]
    );
    return fullLead;
  }

  async getLeads(): Promise<RegisteredLead[]> {
    const res = await this.pool.query('SELECT data FROM leads ORDER BY created_at DESC');
    return res.rows.map((r) => r.data as RegisteredLead);
  }

  async createInquiry(inquiryData: Omit<ContactInquiry, 'id' | 'createdAt'>): Promise<ContactInquiry> {
    const id = `inq-${crypto.randomUUID()}`;
    const fullInquiry: ContactInquiry = {
      ...inquiryData,
      id,
      createdAt: new Date().toISOString(),
    };
    await this.pool.query(
      'INSERT INTO inquiries (id, data, created_at) VALUES ($1, $2, NOW())',
      [id, JSON.stringify(fullInquiry)]
    );
    return fullInquiry;
  }

  async getInquiries(): Promise<ContactInquiry[]> {
    const res = await this.pool.query('SELECT data FROM inquiries ORDER BY created_at DESC');
    return res.rows.map((r) => r.data as ContactInquiry);
  }
}

// -------------------------------------------------------------
// File-backed Local Storage (Dev fallback when DATABASE_URL is not configured)
// -------------------------------------------------------------
interface LocalDataSchema {
  users: UserRecord[];
  courses: ProgramCourse[];
  students: Student[];
  payouts: TeacherPayoutRecord[];
  leads: RegisteredLead[];
  inquiries: ContactInquiry[];
}

class LocalFileStorage implements IStorage {
  private filePath: string;
  private data: LocalDataSchema = {
    users: [],
    courses: [],
    students: [],
    payouts: [],
    leads: [],
    inquiries: [],
  };

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback to memory
      }
    }
    this.filePath = path.join(dataDir, 'dev_store.json');
  }

  async init(): Promise<void> {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        console.log(`[Storage] Loaded persistent dev store from ${this.filePath}`);
      } catch (err) {
        console.warn('[Storage] Error reading dev store, initializing empty.', err);
      }
    } else {
      this.save();
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[Storage] Could not write local store:', err);
    }
  private reload(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      } catch {
        // Keep in-memory
      }
    }
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    this.reload();
    const found = this.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    return found || null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    this.reload();
    const found = this.data.users.find((u) => u.id === id);
    return found || null;
  }

  async createUser(user: Omit<UserRecord, 'createdAt'>): Promise<UserRecord> {
    const fullUser: UserRecord = {
      ...user,
      email: user.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(fullUser);
    this.save();
    return fullUser;
  }

  async getCourses(): Promise<ProgramCourse[]> {
    return [...this.data.courses];
  }

  async getCourseById(id: string): Promise<ProgramCourse | null> {
    return this.data.courses.find((c) => c.id === id) || null;
  }

  async createCourse(course: ProgramCourse): Promise<ProgramCourse> {
    this.data.courses.push(course);
    this.save();
    return course;
  }

  async updateCourse(id: string, updates: Partial<ProgramCourse>): Promise<ProgramCourse | null> {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
    this.save();
    return this.data.courses[idx];
  }

  async deleteCourse(id: string): Promise<boolean> {
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== id);
    if (this.data.courses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  async getStudents(filterTeacherEmail?: string): Promise<Student[]> {
    if (!filterTeacherEmail) return [...this.data.students];
    return this.data.students.filter(
      (s) => s.assignedTeacherEmail && s.assignedTeacherEmail.toLowerCase() === filterTeacherEmail.toLowerCase()
    );
  }

  async getStudentById(id: string): Promise<Student | null> {
    return this.data.students.find((s) => s.id === id) || null;
  }

  async updateStudentProgress(id: string, newSurah?: string, teacherNotes?: string): Promise<Student | null> {
    const student = this.data.students.find((s) => s.id === id);
    if (!student) return null;

    if (newSurah && !student.memorizedSurahs.includes(newSurah)) {
      student.memorizedSurahs.push(newSurah);
    }
    if (teacherNotes !== undefined) {
      student.teacherNotes = teacherNotes;
    }
    this.save();
    return { ...student };
  }

  async getPayouts(filterTeacherEmail?: string): Promise<TeacherPayout[]> {
    let list = this.data.payouts;
    if (filterTeacherEmail) {
      list = list.filter((p) => p.teacherEmail.toLowerCase() === filterTeacherEmail.toLowerCase());
    }
    return list.map((p) => {
      const decryptedIban = p.ibanEncrypted ? decryptAtRest(p.ibanEncrypted) : '';
      return {
        id: p.id,
        teacherEmail: p.teacherEmail,
        teacherName: p.teacherName,
        month: p.month,
        hoursCompleted: p.hoursCompleted,
        hourlyRateSar: p.hourlyRateSar,
        totalEarningsSar: p.totalEarningsSar,
        payoutStatus: p.payoutStatus,
        bankName: p.bankName || '',
        accountHolderName: p.accountHolderName || '',
        ibanMasked: maskIban(decryptedIban),
      };
    });
  }

  async updateTeacherBankDetails(
    teacherEmail: string,
    bankName: string,
    accountHolderName: string,
    plainIban: string
  ): Promise<TeacherPayout | null> {
    const p = this.data.payouts.find((item) => item.teacherEmail.toLowerCase() === teacherEmail.toLowerCase());
    if (!p) return null;
    p.bankName = bankName;
    p.accountHolderName = accountHolderName;
    p.ibanEncrypted = encryptAtRest(plainIban);
    this.save();
    return {
      id: p.id,
      teacherEmail: p.teacherEmail,
      teacherName: p.teacherName,
      month: p.month,
      hoursCompleted: p.hoursCompleted,
      hourlyRateSar: p.hourlyRateSar,
      totalEarningsSar: p.totalEarningsSar,
      payoutStatus: p.payoutStatus,
      bankName: p.bankName,
      accountHolderName: p.accountHolderName,
      ibanMasked: maskIban(plainIban),
    };
  }

  async createLead(leadData: Omit<RegisteredLead, 'id' | 'createdAt' | 'status'>): Promise<RegisteredLead> {
    const id = `lead-${crypto.randomUUID()}`;
    const fullLead: RegisteredLead = {
      ...leadData,
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    this.data.leads.unshift(fullLead);
    this.save();
    return fullLead;
  }

  async getLeads(): Promise<RegisteredLead[]> {
    return [...this.data.leads];
  }

  async createInquiry(inquiryData: Omit<ContactInquiry, 'id' | 'createdAt'>): Promise<ContactInquiry> {
    const id = `inq-${crypto.randomUUID()}`;
    const fullInquiry: ContactInquiry = {
      ...inquiryData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.inquiries.unshift(fullInquiry);
    this.save();
    return fullInquiry;
  }

  async getInquiries(): Promise<ContactInquiry[]> {
    return [...this.data.inquiries];
  }
}

// -------------------------------------------------------------
// Storage Factory & Bootstrap
// -------------------------------------------------------------
let storageInstance: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (storageInstance) return storageInstance;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.trim() !== '') {
    console.log('[Storage] Connecting to PostgreSQL database...');
    storageInstance = new PostgresStorage(dbUrl);
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL CONFIGURATION ERROR: DATABASE_URL is not set in production. ' +
        'Cloud Run has an ephemeral filesystem. Configure DATABASE_URL in environment secrets.'
      );
    }
    console.warn(
      '[Storage WARNING] DATABASE_URL is not set. Using local file storage fallback for development (.data/dev_store.json).'
    );
    storageInstance = new LocalFileStorage();
  }

  await storageInstance.init();
  await seedInitialAdminIfNeeded(storageInstance);
  await seedDefaultCoursesIfNeeded(storageInstance);
  return storageInstance;
}

// Seed admin from environment variables (ADMIN_EMAIL and ADMIN_PASSWORD_HASH)
async function seedInitialAdminIfNeeded(storage: IStorage): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@noor-bayan.com';
  const existing = await storage.findUserByEmail(adminEmail);
  if (!existing) {
    let passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!passwordHash) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: ADMIN_PASSWORD_HASH is required in production to initialize the admin user.');
      }
      // In development only, if no hash was set, generate a random secure hash
      console.warn('[Storage] ADMIN_PASSWORD_HASH not set. Generating dev admin credentials...');
      passwordHash = await hashPassword('DevAdminPass_2026!Secure');
      console.warn(`[Storage DEV] Initial dev admin seeded: ${adminEmail} / DevAdminPass_2026!Secure`);
    }

    await storage.createUser({
      id: `usr-${crypto.randomUUID()}`,
      email: adminEmail,
      passwordHash,
      name: 'مشرف المنصة',
      role: 'admin',
      permissions: ['all'],
    });
    console.log(`[Storage] Initial admin account verified: ${adminEmail}`);
  }
}

// Seed baseline courses if course catalog is empty
async function seedDefaultCoursesIfNeeded(storage: IStorage): Promise<void> {
  const existing = await storage.getCourses();
  if (existing.length === 0) {
    const defaultCourses: ProgramCourse[] = [
      {
        id: 'prog-quran-hifz',
        title: 'حلقات تحفيظ القرآن الكريم وتجويده',
        subtitle: 'حفظ وتثبيت القرآن الكريم بأحكام التلاوة الصحيحة ومخارج الحروف',
        ageBracket: '5 - 15 سنة',
        minAge: 5,
        maxAge: 15,
        category: 'quran',
        deliveryMode: 'online',
        image: '/images/hero_learning.webp',
        description: 'حلقات مصغرة مباشرة عبر غرف زوم التفاعلية، تركز على الحفظ المتقن والتجويد العملي.',
        weeklySessions: 3,
        sessionDurationMins: 45,
        priceSar: 280,
        billingUnit: 'شهرياً (حسب خطة الحصص)',
        installmentsEligible: true,
        features: ['حلقات مصغرة مباشرة', 'متابعة فردية لمخارج الحروف', 'تقارير أسبوعية لولي الأمر'],
      },
      {
        id: 'prog-arabic-foundations',
        title: 'برنامج التأسيس اللغوي والقراءة السليمة',
        subtitle: 'بناء الطلاقة اللغوية ومخارج الحروف والنطق الفصيح',
        ageBracket: '4 - 9 سنوات',
        minAge: 4,
        maxAge: 9,
        category: 'arabic',
        deliveryMode: 'online',
        image: '/images/quran_kids.webp',
        description: 'منهج تأسيسي متدرج للأطفال لبناء المهارات القرائية السليمة وتعزيز الفصاحة.',
        weeklySessions: 3,
        sessionDurationMins: 45,
        priceSar: 260,
        billingUnit: 'شهرياً (حسب خطة الحصص)',
        installmentsEligible: true,
        features: ['تعليم الحروف بحركاتها ومخارجها', 'قراءة الكلمات والجمل الفصيحة', 'قصص تفاعلية مصورة'],
      },
      {
        id: 'prog-islamic-values',
        title: 'مسار غرس القيم وبناء الشخصية المسلمة',
        subtitle: 'الآداب النبوية، السيرة العطرة، وتعديل السلوك الإيجابي',
        ageBracket: '6 - 13 سنة',
        minAge: 6,
        maxAge: 13,
        category: 'values',
        deliveryMode: 'online',
        image: '/images/mothers_session.webp',
        description: 'جلسات تربوية حوارية تغرس القيم والأخلاق الحميدة والأذكار اليومية بأسلوب تفاعلي.',
        weeklySessions: 2,
        sessionDurationMins: 50,
        priceSar: 230,
        billingUnit: 'شهرياً (حسب خطة الحصص)',
        installmentsEligible: false,
        features: ['سيرة النبي ﷺ وقصص الصحابة', 'الآداب والأذكار اليومية', 'تطبيقات عملية في الحياة اليومية'],
      },
      {
        id: 'prog-stem-coding',
        title: 'نادي البرمجة والتفكير المنطقي للصغار',
        subtitle: 'مبادئ التفكير البرمجي وبناء الألعاب التفاعلية باللغة العربية',
        ageBracket: '7 - 14 سنة',
        minAge: 7,
        maxAge: 14,
        category: 'tech',
        deliveryMode: 'online',
        image: '/images/stem_robotics.webp',
        description: 'مدخل ممتع ومحمي لعلوم الحاسوب وبناء القصص والألعاب الرقمية.',
        weeklySessions: 2,
        sessionDurationMins: 60,
        priceSar: 340,
        billingUnit: 'شهرياً (حسب خطة الحصص)',
        installmentsEligible: true,
        features: ['البرمجة المرئية التفاعلية', 'حل المشكلات والتفكير الإبداعي', 'مشاريع عملية أسبوعية'],
      },
    ];

    for (const c of defaultCourses) {
      await storage.createCourse(c);
    }
    console.log('[Storage] Seeded baseline verified courses.');
  }
}
