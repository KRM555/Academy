import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Firestore,
} from 'firebase/firestore';
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
  updateUserPassword(id: string, newPasswordHash: string): Promise<boolean>;
  
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

  createPasswordResetToken(token: PasswordResetToken): Promise<PasswordResetToken>;
  findPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
  logSecurityEvent(event: SecurityAuditLog): Promise<void>;
}

export interface PasswordResetToken {
  id: string;
  tokenHash: string;
  userId: string;
  email: string;
  expiresAt: number;
  used: boolean;
  usedAt?: number;
  createdAt: number;
}

export interface SecurityAuditLog {
  id: string;
  action: string;
  email: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// -------------------------------------------------------------
// Firebase Firestore Storage Implementation (Cloud Persistent Database)
// -------------------------------------------------------------
export class FirestoreStorage implements IStorage {
  private db: Firestore;
  private config: any;

  constructor(config: any) {
    this.config = config;
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    this.db = getFirestore(app, config.firestoreDatabaseId);
  }

  async init(): Promise<void> {
    console.log(`[Storage] Initialized Firestore database: ${this.config.firestoreDatabaseId}`);
    await this.seedInitialStudentsAndPayouts();
  }

  private async seedInitialStudentsAndPayouts(): Promise<void> {
    try {
      const studentsSnap = await getDocs(collection(this.db, 'students'));
      if (studentsSnap.empty) {
        const demoStudents: Student[] = [
          {
            id: 'std-1',
            childName: 'عمر أحمد السعيد',
            age: 8,
            parentName: 'أحمد السعيد',
            parentPhone: '+966 50 123 4567',
            country: 'المملكة العربية السعودية',
            program: 'حلقات تحفيظ القرآن الكريم وتجويده',
            level: 'المستوى الثاني (جزء عم)',
            assignedTeacherEmail: 'teacher@noor-bayan.com',
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
            country: 'الإمارات العربية المتحدة',
            program: 'منهاج البيان القرآني والتأسيس اللغوي',
            level: 'المستوى الأول (الحروف الهجائية)',
            assignedTeacherEmail: 'teacher@noor-bayan.com',
            memorizedSurahs: ['الفاتحة', 'الإخلاص', 'الفلق', 'الناس'],
            attendanceRate: 100,
            teacherNotes: 'استجابة سريعة في نطق مخارج الحروف اللثوية والتهجئة.',
            status: 'active',
            enrolledAt: '2025-12-05T14:30:00.000Z',
          },
          {
            id: 'std-3',
            childName: 'عبد الرحمن يوسف الشمري',
            age: 10,
            parentName: 'يوسف الشمري',
            parentPhone: '+966 54 321 9876',
            country: 'المملكة العربية السعودية',
            program: 'حلقات تحفيظ القرآن الكريم وتجويده',
            level: 'المستوى الثالث (إتمام جزء عم)',
            assignedTeacherEmail: 'teacher@noor-bayan.com',
            memorizedSurahs: [
              'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق',
              'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق'
            ],
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
            country: 'دولة الكويت',
            program: 'حلقات تحفيظ القرآن الكريم وتجويده',
            level: 'المستوى الرابع (الحفظ المتقدم - جزأي عم وتبارك)',
            assignedTeacherEmail: 'teacher@noor-bayan.com',
            memorizedSurahs: [
              'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق',
              'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
              'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل',
              'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
            ],
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
            country: 'جمهورية مصر العربية',
            program: 'غراس القيم والآداب النبوية للناشئة',
            level: 'المستوى الأول',
            assignedTeacherEmail: 'teacher@noor-bayan.com',
            memorizedSurahs: ['الفاتحة', 'العصر', 'الكوثر', 'الإخلاص', 'الفلق'],
            attendanceRate: 94,
            teacherNotes: 'حفظ الأذكار اليومية وآداب الطعام وبر الوالدين، تفاعل رائع في الحصة.',
            status: 'active',
            enrolledAt: '2026-02-12T16:00:00.000Z',
          },
          {
            id: 'std-6',
            childName: 'ليان فهد الدوسري',
            age: 9,
            parentName: 'فهد الدوسري',
            parentPhone: '+974 55 123 456',
            country: 'دولة قطر',
            program: 'الذكاء الاصطناعي والبرمجة المرئية للصغار',
            level: 'مستوى المبتدئين (سكراتش ولغة بايثون التأسيسية)',
            assignedTeacherEmail: 'teacher@noor-bayan.com',
            memorizedSurahs: ['الفاتحة', 'الناس', 'الفلق', 'الإخلاص', 'الكوثر', 'النصر'],
            attendanceRate: 95,
            teacherNotes: 'أنجزت 4 مشاريع برمجية تفاعلية وقصصاً حركية عبر لغة سكراتش.',
            status: 'active',
            enrolledAt: '2026-02-20T15:00:00.000Z',
          },
        ];
        for (const s of demoStudents) {
          await setDoc(doc(this.db, 'students', s.id), s);
        }
      }

      const payoutsSnap = await getDocs(collection(this.db, 'payouts'));
      if (payoutsSnap.empty) {
        const demoPayout: TeacherPayoutRecord = {
          id: 'pay-2026-02',
          teacherEmail: 'teacher@noor-bayan.com',
          teacherName: 'أستاذ القرآن واللغة',
          month: 'فبراير 2026',
          hoursCompleted: 36,
          hourlyRateSar: 65,
          totalEarningsSar: 2340,
          payoutStatus: 'pending',
          bankName: 'مصرف الراجحي',
          accountHolderName: 'أستاذ القرآن واللغة',
          ibanEncrypted: encryptAtRest('SA0380000000608010167890'),
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(this.db, 'payouts', demoPayout.id), demoPayout);
      }
    } catch (err) {
      console.warn('[Storage] Firestore initial students/payouts seed check:', err);
    }
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    try {
      const q = query(collection(this.db, 'users'), where('emailLower', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as UserRecord;
    } catch {
      return null;
    }
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    try {
      const ref = doc(this.db, 'users', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return snap.data() as UserRecord;
    } catch {
      return null;
    }
  }

  async createUser(user: Omit<UserRecord, 'createdAt'>): Promise<UserRecord> {
    const now = new Date().toISOString();
    const fullUser: UserRecord & { emailLower: string } = {
      ...user,
      email: user.email.toLowerCase(),
      emailLower: user.email.toLowerCase(),
      createdAt: now,
    };
    await setDoc(doc(this.db, 'users', user.id), fullUser);
    return fullUser;
  }

  async updateUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
    try {
      const ref = doc(this.db, 'users', id);
      await updateDoc(ref, { passwordHash: newPasswordHash });
      return true;
    } catch {
      return false;
    }
  }

  async getCourses(): Promise<ProgramCourse[]> {
    const snap = await getDocs(collection(this.db, 'courses'));
    return snap.docs.map((d) => d.data() as ProgramCourse);
  }

  async getCourseById(id: string): Promise<ProgramCourse | null> {
    const ref = doc(this.db, 'courses', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as ProgramCourse;
  }

  async createCourse(course: ProgramCourse): Promise<ProgramCourse> {
    await setDoc(doc(this.db, 'courses', course.id), course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<ProgramCourse>): Promise<ProgramCourse | null> {
    const ref = doc(this.db, 'courses', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    await updateDoc(ref, updates);
    const updated = await getDoc(ref);
    return updated.data() as ProgramCourse;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const ref = doc(this.db, 'courses', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    await deleteDoc(ref);
    return true;
  }

  async getStudents(filterTeacherEmail?: string): Promise<Student[]> {
    let snap;
    if (filterTeacherEmail) {
      const q = query(collection(this.db, 'students'), where('assignedTeacherEmail', '==', filterTeacherEmail.toLowerCase()));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(this.db, 'students'));
    }
    return snap.docs.map((d) => d.data() as Student);
  }

  async getStudentById(id: string): Promise<Student | null> {
    const ref = doc(this.db, 'students', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Student;
  }

  async updateStudentProgress(
    id: string,
    newSurah?: string,
    teacherNotes?: string
  ): Promise<Student | null> {
    const ref = doc(this.db, 'students', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const current = snap.data() as Student;
    const memorized = [...(current.memorizedSurahs || [])];
    if (newSurah && !memorized.includes(newSurah)) {
      memorized.push(newSurah);
    }
    const updates: Partial<Student> = {
      memorizedSurahs: memorized,
      teacherNotes: teacherNotes !== undefined ? teacherNotes : current.teacherNotes,
    };
    await updateDoc(ref, updates);
    return { ...current, ...updates };
  }

  async getPayouts(filterTeacherEmail?: string): Promise<TeacherPayout[]> {
    let snap;
    if (filterTeacherEmail) {
      const q = query(collection(this.db, 'payouts'), where('teacherEmail', '==', filterTeacherEmail.toLowerCase()));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(this.db, 'payouts'));
    }
    return snap.docs.map((d) => {
      const p = d.data() as TeacherPayoutRecord;
      let ibanPlain = '';
      if (p.ibanEncrypted) {
        try {
          ibanPlain = decryptAtRest(p.ibanEncrypted);
        } catch {
          ibanPlain = '';
        }
      }
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
        ibanMasked: maskIban(ibanPlain),
      };
    });
  }

  async updateTeacherBankDetails(
    teacherEmail: string,
    bankName: string,
    accountHolderName: string,
    plainIban: string
  ): Promise<TeacherPayout | null> {
    const q = query(collection(this.db, 'payouts'), where('teacherEmail', '==', teacherEmail.toLowerCase()));
    const snap = await getDocs(q);
    const encrypted = encryptAtRest(plainIban);

    if (snap.empty) {
      const id = `pay-${Date.now()}`;
      const user = await this.findUserByEmail(teacherEmail);
      const teacherName = user?.name || 'أستاذ معتمد';
      const month = new Date().toISOString().slice(0, 7);
      const newPayout: TeacherPayoutRecord = {
        id,
        teacherEmail: teacherEmail.toLowerCase(),
        teacherName,
        month,
        hoursCompleted: 0,
        hourlyRateSar: 50,
        totalEarningsSar: 0,
        payoutStatus: 'pending',
        bankName,
        accountHolderName,
        ibanEncrypted: encrypted,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(this.db, 'payouts', id), newPayout);
      return {
        id,
        teacherEmail: newPayout.teacherEmail,
        teacherName: newPayout.teacherName,
        month: newPayout.month,
        hoursCompleted: 0,
        hourlyRateSar: 50,
        totalEarningsSar: 0,
        payoutStatus: 'pending',
        bankName,
        accountHolderName,
        ibanMasked: maskIban(plainIban),
      };
    }

    const targetDoc = snap.docs[0];
    await updateDoc(targetDoc.ref, {
      bankName,
      accountHolderName,
      ibanEncrypted: encrypted,
    });
    const updated = (await getDoc(targetDoc.ref)).data() as TeacherPayoutRecord;
    return {
      id: updated.id,
      teacherEmail: updated.teacherEmail,
      teacherName: updated.teacherName,
      month: updated.month,
      hoursCompleted: updated.hoursCompleted,
      hourlyRateSar: updated.hourlyRateSar,
      totalEarningsSar: updated.totalEarningsSar,
      payoutStatus: updated.payoutStatus,
      bankName: updated.bankName,
      accountHolderName: updated.accountHolderName,
      ibanMasked: maskIban(plainIban),
    };
  }

  async createLead(lead: Omit<RegisteredLead, 'id' | 'createdAt' | 'status'>): Promise<RegisteredLead> {
    const id = `lead-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const fullLead: RegisteredLead = {
      ...lead,
      id,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(this.db, 'leads', id), fullLead);
    return fullLead;
  }

  async getLeads(): Promise<RegisteredLead[]> {
    const snap = await getDocs(collection(this.db, 'leads'));
    return snap.docs.map((d) => d.data() as RegisteredLead);
  }

  async createInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt'>): Promise<ContactInquiry> {
    const id = `inq-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const fullInquiry: ContactInquiry = {
      ...inquiry,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(this.db, 'inquiries', id), fullInquiry);
    return fullInquiry;
  }

  async getInquiries(): Promise<ContactInquiry[]> {
    const snap = await getDocs(collection(this.db, 'inquiries'));
    return snap.docs.map((d) => d.data() as ContactInquiry);
  }

  async createPasswordResetToken(token: PasswordResetToken): Promise<PasswordResetToken> {
    await setDoc(doc(this.db, 'passwordResetTokens', token.id), token);
    return token;
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    const q = query(
      collection(this.db, 'passwordResetTokens'),
      where('tokenHash', '==', tokenHash)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as PasswordResetToken;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    const ref = doc(this.db, 'passwordResetTokens', id);
    await updateDoc(ref, {
      used: true,
      usedAt: Date.now(),
    });
  }

  async logSecurityEvent(event: SecurityAuditLog): Promise<void> {
    try {
      await setDoc(doc(this.db, 'auditLogs', event.id), event);
    } catch (err) {
      console.error('[Storage SecurityAudit] Error writing log:', err);
    }
  }
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

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id VARCHAR(64) PRIMARY KEY,
          token_hash VARCHAR(128) UNIQUE NOT NULL,
          user_id VARCHAR(64) NOT NULL,
          email VARCHAR(255) NOT NULL,
          expires_at BIGINT NOT NULL,
          used BOOLEAN NOT NULL DEFAULT FALSE,
          used_at BIGINT,
          created_at BIGINT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS security_audit_logs (
          id VARCHAR(64) PRIMARY KEY,
          action VARCHAR(64) NOT NULL,
          email VARCHAR(255) NOT NULL,
          ip VARCHAR(64) NOT NULL,
          user_agent TEXT,
          details JSONB,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

  async updateUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
    const res = await this.pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, id]);
    return (res.rowCount ?? 0) > 0;
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
    if (res.rows.length === 0) {
      const id = `pay-${crypto.randomUUID()}`;
      const userRes = await this.pool.query('SELECT name FROM users WHERE LOWER(email) = LOWER($1)', [teacherEmail.toLowerCase()]);
      const teacherName = userRes.rows[0]?.name || 'أستاذ معتمد';
      const month = new Date().toISOString().slice(0, 7);
      const insertRes = await this.pool.query(
        `INSERT INTO teacher_payouts (id, teacher_email, teacher_name, month, hours_completed, hourly_rate_sar, total_earnings_sar, payout_status, bank_name, account_holder_name, iban_encrypted)
         VALUES ($1, $2, $3, $4, 0, 50, 0, 'pending', $5, $6, $7)
         RETURNING *`,
        [id, teacherEmail.toLowerCase(), teacherName, month, bankName, accountHolderName, encrypted]
      );
      const r = insertRes.rows[0];
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

  async createPasswordResetToken(token: PasswordResetToken): Promise<PasswordResetToken> {
    await this.pool.query(
      'INSERT INTO password_reset_tokens (id, token_hash, user_id, email, expires_at, used, used_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [token.id, token.tokenHash, token.userId, token.email, token.expiresAt, token.used, token.usedAt || null, token.createdAt]
    );
    return token;
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    const res = await this.pool.query('SELECT * FROM password_reset_tokens WHERE token_hash = $1 LIMIT 1', [tokenHash]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      tokenHash: r.token_hash,
      userId: r.user_id,
      email: r.email,
      expiresAt: Number(r.expires_at),
      used: Boolean(r.used),
      usedAt: r.used_at ? Number(r.used_at) : undefined,
      createdAt: Number(r.created_at),
    };
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await this.pool.query('UPDATE password_reset_tokens SET used = true, used_at = $1 WHERE id = $2', [Date.now(), id]);
  }

  async logSecurityEvent(event: SecurityAuditLog): Promise<void> {
    try {
      await this.pool.query(
        'INSERT INTO security_audit_logs (id, action, email, ip, user_agent, details, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [event.id, event.action, event.email, event.ip, event.userAgent || null, JSON.stringify(event.details || {}), event.timestamp]
      );
    } catch (err) {
      console.error('[Postgres SecurityAudit] Error writing log:', err);
    }
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
  passwordResetTokens?: PasswordResetToken[];
  auditLogs?: SecurityAuditLog[];
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
    }

    if (!this.data.students || this.data.students.length === 0) {
      this.data.students = [
        {
          id: 'std-1',
          childName: 'عمر أحمد السعيد',
          age: 8,
          parentName: 'أحمد السعيد',
          parentPhone: '+966 50 123 4567',
          country: 'المملكة العربية السعودية',
          program: 'حلقات تحفيظ القرآن الكريم وتجويده',
          level: 'المستوى الثاني (جزء عم)',
          assignedTeacherEmail: 'teacher@noor-bayan.com',
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
          country: 'الإمارات العربية المتحدة',
          program: 'منهاج البيان القرآني والتأسيس اللغوي',
          level: 'المستوى الأول (الحروف الهجائية)',
          assignedTeacherEmail: 'teacher@noor-bayan.com',
          memorizedSurahs: ['الفاتحة', 'الإخلاص', 'الفلق', 'الناس'],
          attendanceRate: 100,
          teacherNotes: 'استجابة سريعة في نطق مخارج الحروف اللثوية والتهجئة.',
          status: 'active',
          enrolledAt: '2025-12-05T14:30:00.000Z',
        },
        {
          id: 'std-3',
          childName: 'عبد الرحمن يوسف الشمري',
          age: 10,
          parentName: 'يوسف الشمري',
          parentPhone: '+966 54 321 9876',
          country: 'المملكة العربية السعودية',
          program: 'حلقات تحفيظ القرآن الكريم وتجويده',
          level: 'المستوى الثالث (إتمام جزء عم)',
          assignedTeacherEmail: 'teacher@noor-bayan.com',
          memorizedSurahs: [
            'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق',
            'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق'
          ],
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
          country: 'دولة الكويت',
          program: 'حلقات تحفيظ القرآن الكريم وتجويده',
          level: 'المستوى الرابع (الحفظ المتقدم - جزأي عم وتبارك)',
          assignedTeacherEmail: 'teacher@noor-bayan.com',
          memorizedSurahs: [
            'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق',
            'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
            'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل',
            'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'
          ],
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
          country: 'جمهورية مصر العربية',
          program: 'غراس القيم والآداب النبوية للناشئة',
          level: 'المستوى الأول',
          assignedTeacherEmail: 'teacher@noor-bayan.com',
          memorizedSurahs: ['الفاتحة', 'العصر', 'الكوثر', 'الإخلاص', 'الفلق'],
          attendanceRate: 94,
          teacherNotes: 'حفظ الأذكار اليومية وآداب الطعام وبر الوالدين، تفاعل رائع في الحصة.',
          status: 'active',
          enrolledAt: '2026-02-12T16:00:00.000Z',
        },
        {
          id: 'std-6',
          childName: 'ليان فهد الدوسري',
          age: 9,
          parentName: 'فهد الدوسري',
          parentPhone: '+974 55 123 456',
          country: 'دولة قطر',
          program: 'الذكاء الاصطناعي والبرمجة المرئية للصغار',
          level: 'مستوى المبتدئين (سكراتش ولغة بايثون التأسيسية)',
          assignedTeacherEmail: 'teacher@noor-bayan.com',
          memorizedSurahs: ['الفاتحة', 'الناس', 'الفلق', 'الإخلاص', 'الكوثر', 'النصر'],
          attendanceRate: 95,
          teacherNotes: 'أنجزت 4 مشاريع برمجية تفاعلية وقصصاً حركية عبر لغة سكراتش.',
          status: 'active',
          enrolledAt: '2026-02-20T15:00:00.000Z',
        },
      ];
      this.save();
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
    this.reload();
    const fullUser: UserRecord = {
      ...user,
      email: user.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(fullUser);
    this.save();
    return fullUser;
  }

  async updateUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
    this.reload();
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.save();
    return true;
  }

  async getCourses(): Promise<ProgramCourse[]> {
    this.reload();
    return [...this.data.courses];
  }

  async getCourseById(id: string): Promise<ProgramCourse | null> {
    this.reload();
    return this.data.courses.find((c) => c.id === id) || null;
  }

  async createCourse(course: ProgramCourse): Promise<ProgramCourse> {
    this.reload();
    this.data.courses.push(course);
    this.save();
    return course;
  }

  async updateCourse(id: string, updates: Partial<ProgramCourse>): Promise<ProgramCourse | null> {
    this.reload();
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
    this.save();
    return this.data.courses[idx];
  }

  async deleteCourse(id: string): Promise<boolean> {
    this.reload();
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== id);
    if (this.data.courses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  async getStudents(filterTeacherEmail?: string): Promise<Student[]> {
    this.reload();
    if (!filterTeacherEmail) return [...this.data.students];
    return this.data.students.filter(
      (s) => s.assignedTeacherEmail && s.assignedTeacherEmail.toLowerCase() === filterTeacherEmail.toLowerCase()
    );
  }

  async getStudentById(id: string): Promise<Student | null> {
    this.reload();
    return this.data.students.find((s) => s.id === id) || null;
  }

  async updateStudentProgress(id: string, newSurah?: string, teacherNotes?: string): Promise<Student | null> {
    this.reload();
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
    this.reload();
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
    this.reload();
    let p = this.data.payouts.find((item) => item.teacherEmail.toLowerCase() === teacherEmail.toLowerCase());
    if (!p) {
      const teacher = this.data.users.find((u) => u.email.toLowerCase() === teacherEmail.toLowerCase());
      p = {
        id: `pay-${crypto.randomUUID()}`,
        teacherEmail: teacherEmail.toLowerCase(),
        teacherName: teacher ? teacher.name : 'أستاذ معتمد',
        month: new Date().toISOString().slice(0, 7),
        hoursCompleted: 0,
        hourlyRateSar: 50,
        totalEarningsSar: 0,
        payoutStatus: 'pending',
        bankName,
        accountHolderName,
        ibanEncrypted: encryptAtRest(plainIban),
        createdAt: new Date().toISOString(),
      };
      this.data.payouts.push(p);
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
    this.reload();
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
    this.reload();
    return [...this.data.leads];
  }

  async createInquiry(inquiryData: Omit<ContactInquiry, 'id' | 'createdAt'>): Promise<ContactInquiry> {
    this.reload();
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
    this.reload();
    return [...this.data.inquiries];
  }

  async createPasswordResetToken(token: PasswordResetToken): Promise<PasswordResetToken> {
    this.reload();
    if (!this.data.passwordResetTokens) this.data.passwordResetTokens = [];
    this.data.passwordResetTokens.push(token);
    this.save();
    return token;
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    this.reload();
    if (!this.data.passwordResetTokens) this.data.passwordResetTokens = [];
    const found = this.data.passwordResetTokens.find((t) => t.tokenHash === tokenHash);
    return found ? { ...found } : null;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    this.reload();
    if (!this.data.passwordResetTokens) this.data.passwordResetTokens = [];
    const t = this.data.passwordResetTokens.find((item) => item.id === id);
    if (t) {
      t.used = true;
      t.usedAt = Date.now();
      this.save();
    }
  }

  async logSecurityEvent(event: SecurityAuditLog): Promise<void> {
    this.reload();
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift(event);
    this.save();
  }
}

// -------------------------------------------------------------
// Storage Factory & Bootstrap
// -------------------------------------------------------------
let storageInstance: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (storageInstance) return storageInstance;

  // 1. Primary: Persistent Cloud Database via Firebase Firestore
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(raw);
      if (config.projectId && config.projectId !== 'remixed-project-id' && config.firestoreDatabaseId) {
        console.log(`[Storage] Connecting to Persistent Cloud Database (Firestore: ${config.firestoreDatabaseId})...`);
        const firestoreStorage = new FirestoreStorage(config);
        await firestoreStorage.init();
        await seedInitialAdminIfNeeded(firestoreStorage);
        await seedDefaultCoursesIfNeeded(firestoreStorage);
        storageInstance = firestoreStorage;
        return storageInstance;
      }
    } catch (err) {
      console.warn('[Storage] Could not initialize Firestore storage, trying next fallback:', err);
    }
  }

  // 2. Secondary: PostgreSQL relational database
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.trim() !== '') {
    console.log('[Storage] Connecting to PostgreSQL database...');
    storageInstance = new PostgresStorage(dbUrl);
    await storageInstance.init();
    await seedInitialAdminIfNeeded(storageInstance);
    await seedDefaultCoursesIfNeeded(storageInstance);
    return storageInstance;
  }

  // 3. Fallback: Local file store
  console.warn(
    '[Storage WARNING] Using local file storage fallback (.data/dev_store.json).'
  );
  storageInstance = new LocalFileStorage();
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
      console.warn('[Storage] ADMIN_PASSWORD_HASH not set. Generating dev admin credentials...');
      passwordHash = await hashPassword('DevAdminPass_2026!Secure');
      console.warn(`[Storage DEV] Initial admin seeded: ${adminEmail} / DevAdminPass_2026!Secure`);
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

// Seed baseline courses if course catalog is empty or contains old dummy/test courses
async function seedDefaultCoursesIfNeeded(storage: IStorage): Promise<void> {
  const existing = await storage.getCourses();
  const hasDummyCourses = existing.some(
    (c) =>
      c.title.includes('تجريبية للإدارة') ||
      (c.id.startsWith('prog-') &&
        !c.id.includes('arabic-foundation') &&
        !c.id.includes('languages') &&
        !c.id.includes('international') &&
        !c.id.includes('all-subjects') &&
        !c.id.includes('quran-islamic') &&
        !c.id.includes('mental-math') &&
        !c.id.includes('speech-development') &&
        !c.id.includes('educational-support'))
  );

  if (existing.length === 0 || hasDummyCourses) {
    // Clean out old dummy or obsolete courses
    for (const c of existing) {
      if (
        c.title.includes('تجريبية للإدارة') ||
        c.id === 'prog-quran-hifz' ||
        c.id === 'prog-arabic-foundations' ||
        c.id === 'prog-islamic-values' ||
        c.id === 'prog-stem-coding' ||
        c.id === 'prog-noor-yutla' ||
        c.id === 'prog-nooraniyah' ||
        c.id === 'prog-values-character' ||
        c.id === 'prog-young-coders' ||
        c.id.match(/^prog-[0-9a-f]{8}-/)
      ) {
        try {
          await storage.deleteCourse(c.id);
        } catch {
          // ignore
        }
      }
    }

    const officialCourses: ProgramCourse[] = [
      {
        id: 'prog-arabic-foundation',
        title: 'التأسيس واللغة العربية',
        subtitle: 'نور البيان، القراءة، الكتابة، النحو والإملاء',
        ageBracket: '4 - 12 سنة',
        minAge: 4,
        maxAge: 12,
        category: 'arabic',
        deliveryMode: 'online',
        image: '/assets/programs/arabic_foundation.jpg',
        description: 'منهج تأسيسي متكامل في نور البيان، القراءة السليمة، الكتابة والإملاء، والنحو المبسط لبناء فصاحة اللسان وتأسيس متميز للطفل.',
        weeklySessions: 3,
        sessionDurationMins: 45,
        priceSar: 260,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'تأسيس نور البيان والقراءة السليمة',
          'قواعد الإملاء والنطق ومخارج الحروف',
          'تدرج تعليمي مرن يناسب كل طفل',
          'متابعة مستمرة وتقييم دوري',
        ],
      },
      {
        id: 'prog-languages',
        title: 'تعليم اللغات',
        subtitle: 'الإنجليزية والعربية والفرنسية والألمانية وغيرها',
        ageBracket: '5 - 18 سنة',
        minAge: 5,
        maxAge: 18,
        category: 'languages',
        deliveryMode: 'online',
        image: '/assets/programs/languages.jpg',
        description: 'دورات لغات تفاعلية تركز على المحادثة، الاستماع، القواعد، والنطق السليم عبر معلمين ومعلمات معتمدين ومتخصصين.',
        weeklySessions: 2,
        sessionDurationMins: 50,
        priceSar: 290,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'تطوير مهارات المحادثة والاستماع',
          'مناهج معتمدة تناسب جميع المراحل',
          'فصول حوارية تفاعلية حية',
          'تدريب مستمر على النطق السليم',
        ],
      },
      {
        id: 'prog-international-curricula',
        title: 'المناهج الدولية',
        subtitle: 'المناهج البريطانية والأمريكية والدولية',
        ageBracket: '6 - 18 سنة',
        minAge: 6,
        maxAge: 18,
        category: 'international',
        deliveryMode: 'online',
        image: '/assets/programs/international_curricula.jpg',
        description: 'تدريس وشرح مكثف للمناهج الدولية (IGCSE, American, IB) بأسلوب تفاعلي حديث مع حل نماذج الامتحانات والتقييم الدوري.',
        weeklySessions: 3,
        sessionDurationMins: 50,
        priceSar: 350,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'مناهج بريطانية وأمريكية معتمدة',
          'شرح تفاعلي وحل تدريبات الامتحانات',
          'متابعة دورية مستمرة مع الأسرة',
          'خطط تعليمية تناسب مستوى كل طالب',
        ],
      },
      {
        id: 'prog-all-subjects',
        title: 'جميع المواد الدراسية',
        subtitle: 'رياضيات وعلوم وعربي وإنجليزي وجميع المواد',
        ageBracket: '6 - 18 سنة',
        minAge: 6,
        maxAge: 18,
        category: 'academic',
        deliveryMode: 'online',
        image: '/assets/programs/all_subjects.jpg',
        description: 'تغطية شاملة لكافة المناهج والمواد الدراسية (الرياضيات، العلوم، الأحياء، الكيمياء، الفيزياء، واللغات) بمتابعة مستمرة وتقييم دوري.',
        weeklySessions: 3,
        sessionDurationMins: 45,
        priceSar: 280,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'تغطية شاملة لجميع المقررات المدرسية',
          'تبسيط المفاهيم العلمية المعقدة',
          'مراجعات دورية واستعداد للاختبارات',
          'معلمون ومعلمات متخصصون في مختلف المجالات',
        ],
      },
      {
        id: 'prog-quran-islamic',
        title: 'القرآن والعلوم الإسلامية',
        subtitle: 'تحفيظ وتجويد وقيم إسلامية وسيرة نبوية',
        ageBracket: '5 - 16 سنة',
        minAge: 5,
        maxAge: 16,
        category: 'quran',
        deliveryMode: 'online',
        image: '/assets/programs/quran_islamic.jpg',
        description: 'حلقات تحفيظ وتجويد بروايات متصلة، مع مدارسة القيم الإسلامية، الآداب، والسيرة النبوية العطرة بأسلوب تربوي ميسر.',
        weeklySessions: 3,
        sessionDurationMins: 45,
        priceSar: 270,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'حفظ وتثبيت القرآن بأحكام التجويد',
          'مدارسة السيرة النبوية والآداب والأذكار',
          'مخارج الحروف وضبط اللسان',
          'شهادات إتمام وسجل إنجاز السور',
        ],
      },
      {
        id: 'prog-mental-math',
        title: 'الحساب الذهني وتنمية المهارات',
        subtitle: 'تنمية التركيز والذكاء والقدرات العقلية',
        ageBracket: '5 - 14 سنة',
        minAge: 5,
        maxAge: 14,
        category: 'skills',
        deliveryMode: 'online',
        image: '/assets/programs/mental_math.jpg',
        description: 'برنامج عبقري لتطوير سرعة الحساب الذهني، وتنمية التركيز، والذاكرة البصرية والقدرات العقلية لدى الأطفال باستخدام السوروبان والتقنيات الحديثة.',
        weeklySessions: 2,
        sessionDurationMins: 50,
        priceSar: 290,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'تقنيات السوروبان والحساب فائق السرعة',
          'تنشيط نصفي الدماغ وزيادة التركيز',
          'مسابقات وتمارين ذكاء دورية',
          'رفع مستوى الثقة والتفوق الدراسي',
        ],
      },
      {
        id: 'prog-speech-development',
        title: 'تنمية النطق والمهارات',
        subtitle: 'برامج متخصصة لتنمية التواصل والمهارات',
        ageBracket: '3 - 12 سنة',
        minAge: 3,
        maxAge: 12,
        category: 'speech',
        deliveryMode: 'online',
        image: '/assets/programs/speech_development.jpg',
        description: 'جلسات تخصصية فردية لعلاج وتطوير مهارات النطق، مخارج الحروف، التلعثم، وبناء مهارات التواصل الاجتماعي واللغوي لدى الطفل.',
        weeklySessions: 2,
        sessionDurationMins: 45,
        priceSar: 310,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'أخصائيون وأخصائيات تخاطب ونطق معتمدون',
          'خطة علاجية وتأهيلية فردية لكل طفل',
          'تمارين تفاعلية مرحة ومحفزة',
          'إرشادات عملية مستمرة لولي الأمر',
        ],
      },
      {
        id: 'prog-educational-support',
        title: 'الدعم والمتابعة التعليمية',
        subtitle: 'متابعة مستوى الطالب وتطوير أدائه باستمرار',
        ageBracket: '5 - 18 سنة',
        minAge: 5,
        maxAge: 18,
        category: 'support',
        deliveryMode: 'online',
        image: '/assets/programs/educational_support.jpg',
        description: 'خدمة دعم أكاديمي وتأسيسي شاملة تشمل الإشراف على الواجبات، سد الفجوات التعليمية، والتقييم المستمر لضمان أعلى مراتب التفوق.',
        weeklySessions: 3,
        sessionDurationMins: 45,
        priceSar: 250,
        billingUnit: 'شهرياً',
        installmentsEligible: true,
        features: [
          'متابعة شخصية مستمرة وتطوير الأداء',
          'معالجة نقاط الضعف الدراسية فوراً',
          'تقييمات دورية واختبارات قياس مستوى',
          'تنسيق مباشر مع أولياء الأمور',
        ],
      },
    ];

    for (const c of officialCourses) {
      await storage.createCourse(c);
    }
    console.log('[Storage] Seeded official 8 educational programs without dummy entries.');
  }
}
