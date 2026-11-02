import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import { getStorage } from './src/server/storage';
import {
  requireAuth,
  requireRole,
  loginRateLimiter,
  publicFormRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
  signSessionToken,
  AuthenticatedRequest,
} from './src/server/middleware';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  courseSchema,
  courseUpdateSchema,
  studentProgressSchema,
  teacherIbanUpdateSchema,
  leadRegisterSchema,
  contactInquirySchema,
} from './src/server/schemas';
import { verifyPassword, hashPassword, isValidIBAN } from './src/server/crypto';
import { siteConfig } from './src/config/siteConfig';
import { sendPasswordResetEmail } from './src/server/email';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  if (process.env.NODE_ENV === 'production') {
    return process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  }
  return 3000;
}

const PORT = getPort();
const isProd = process.env.NODE_ENV === 'production';

const app = express();

// Security: Helmet configured for AI Studio preview iframe compatibility
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false,
  })
);

app.use(cookieParser());

// Enforce strict payload size limit (100kb global, prevents memory-exhaustion attacks)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// -------------------------------------------------------------
// Public Routes: Settings & Course Catalog
// -------------------------------------------------------------

// Academy settings (public)
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    academyName: siteConfig.academyNameAr,
    supportEmail: siteConfig.supportEmail,
    contactEmail: siteConfig.contactEmail,
    whatsappNumber: siteConfig.whatsappNumber,
    phoneNumber: siteConfig.phoneNumber,
    facebookUrl: siteConfig.facebookUrl,
    mode: 'فصول تفاعلية حية أونلاين عبر زوم',
  });
});

// Courses (public)
app.get('/api/courses', async (_req: Request, res: Response) => {
  try {
    const storage = await getStorage();
    const courses = await storage.getCourses();
    res.json({ success: true, courses });
  } catch (err) {
    console.error('[API /api/courses] Error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل الدورات.' });
  }
});

// -------------------------------------------------------------
// Authentication Endpoints (Phase 1.1)
// -------------------------------------------------------------

// POST /api/auth/login (Rate-limited, constant-time compare, httpOnly signed cookie, Zod validated)
app.post('/api/auth/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'بيانات الدخول غير صحيحة.';
      res.status(400).json({
        success: false,
        message: firstError,
        errors: parsed.error.format(),
      });
      return;
    }

    const { email, password } = parsed.data;
    const storage = await getStorage();
    const user = await storage.findUserByEmail(email);

    if (!user) {
      // Generic error message to prevent account enumeration
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
      return;
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة.' });
      return;
    }

    const token = signSessionToken(user);

    // Issue httpOnly, SameSite=Lax session cookie
    res.cookie('nb_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error('[API /api/auth/login] Error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع أثناء تسجيل الدخول.' });
  }
});

// POST /api/auth/register (Rate-limited, strong password policy enforced via Zod schema)
app.post('/api/auth/register', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'البيانات المدخلة لا تستوفي شروط التسجيل.';
      res.status(400).json({
        success: false,
        message: firstError,
        errors: parsed.error.format(),
      });
      return;
    }

    const { name, email, password, role } = parsed.data;
    const storage = await getStorage();
    const existing = await storage.findUserByEmail(email);

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول بدلاً من ذلك.',
      });
      return;
    }

    const passwordHash = await hashPassword(password);
    const id = `usr-${crypto.randomUUID()}`;
    const userRole = role === 'admin' ? 'admin' : 'teacher';
    const permissions = userRole === 'admin' ? ['all'] : ['assigned_students', 'payouts'];

    const user = await storage.createUser({
      id,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: userRole,
      permissions,
    });

    const token = signSessionToken(user);
    res.cookie('nb_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب وتسجيل الدخول بنجاح.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error('[API /api/auth/register] Error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع أثناء إنشاء الحساب.' });
  }
});

// POST /api/auth/forgot-password (Rate-limited, anti-enumeration, secure token generation & email dispatch, audit logged)
app.post('/api/auth/forgot-password', forgotPasswordRateLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'البريد الإلكتروني المدخل غير صالح.';
      res.status(400).json({
        success: false,
        message: firstError,
        errors: parsed.error.format(),
      });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const storage = await getStorage();
    const user = await storage.findUserByEmail(email);

    // Security audit log for the reset request
    await storage.logSecurityEvent({
      id: `log-${crypto.randomUUID()}`,
      action: 'forgot_password_request',
      email,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] as string | undefined,
      details: { userFound: !!user },
      timestamp: new Date().toISOString(),
    });

    if (user) {
      // 1. Generate 32-byte cryptographic random token
      const rawToken = crypto.randomBytes(32).toString('hex');
      // 2. Hash token using SHA-256 for secure storage at rest
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      // 3. Expiration: 15 minutes
      const expiresInMinutes = 15;
      const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

      await storage.createPasswordResetToken({
        id: `prt-${crypto.randomUUID()}`,
        tokenHash,
        userId: user.id,
        email: user.email,
        expiresAt,
        used: false,
        createdAt: Date.now(),
      });

      // Construct reset link
      const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
      const protocol = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
      const resetLink = `${protocol}://${host}/?resetToken=${rawToken}#reset-password`;

      // Dispatch email
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetLink,
        expiresInMinutes,
      });
    }

    // Always respond with identical message to avoid account enumeration
    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فقد تم إرسال رابط إعادة تعيين كلمة المرور إليه. يرجى مراجعة صندوق الوارد.',
    });
  } catch (err) {
    console.error('[API /api/auth/forgot-password] Error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع أثناء معالجة الطلب.' });
  }
});

// POST /api/auth/reset-password (Rate-limited, strong password policy enforced, single-use token, audit logged)
app.post('/api/auth/reset-password', resetPasswordRateLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'البيانات المدخلة لا تستوفي شروط كلمة المرور.';
      res.status(400).json({
        success: false,
        message: firstError,
        errors: parsed.error.format(),
      });
      return;
    }

    const { token, password } = parsed.data;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storage = await getStorage();
    const tokenRecord = await storage.findPasswordResetToken(tokenHash);

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] as string | undefined;

    if (!tokenRecord) {
      await storage.logSecurityEvent({
        id: `log-${crypto.randomUUID()}`,
        action: 'password_reset_invalid_token',
        email: 'unknown',
        ip: clientIp,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      res.status(400).json({
        success: false,
        message: 'رابط إعادة التعيين غير صالح أو غير موجود. يرجى طلب رابط جديد.',
      });
      return;
    }

    if (tokenRecord.used) {
      await storage.logSecurityEvent({
        id: `log-${crypto.randomUUID()}`,
        action: 'password_reset_token_already_used',
        email: tokenRecord.email,
        ip: clientIp,
        userAgent,
        details: { tokenId: tokenRecord.id },
        timestamp: new Date().toISOString(),
      });
      res.status(400).json({
        success: false,
        message: 'تم استخدام هذا الرابط مسبقاً. يرجى طلب رابط إعادة تعيين جديد.',
      });
      return;
    }

    if (Date.now() > tokenRecord.expiresAt) {
      await storage.logSecurityEvent({
        id: `log-${crypto.randomUUID()}`,
        action: 'password_reset_token_expired',
        email: tokenRecord.email,
        ip: clientIp,
        userAgent,
        details: { tokenId: tokenRecord.id, expiredAt: tokenRecord.expiresAt },
        timestamp: new Date().toISOString(),
      });
      res.status(400).json({
        success: false,
        message: 'انتهت صلاحية رابط إعادة التعيين (15 دقيقة). يرجى طلب رابط جديد.',
      });
      return;
    }

    const newPasswordHash = await hashPassword(password);
    const updated = await storage.updateUserPassword(tokenRecord.userId, newPasswordHash);
    if (!updated) {
      res.status(500).json({ success: false, message: 'تعذر تحديث كلمة المرور في قاعدة البيانات.' });
      return;
    }

    // Mark token as used to ensure single-use
    await storage.markPasswordResetTokenUsed(tokenRecord.id);

    // Audit log successful reset
    await storage.logSecurityEvent({
      id: `log-${crypto.randomUUID()}`,
      action: 'password_reset_success',
      email: tokenRecord.email,
      ip: clientIp,
      userAgent,
      details: { userId: tokenRecord.userId, tokenId: tokenRecord.id },
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول بحسابك.',
    });
  } catch (err) {
    console.error('[API /api/auth/reset-password] Error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع أثناء إعادة تعيين كلمة المرور.' });
  }
});

// GET /api/auth/me (Returns active session user or null)
app.get('/api/auth/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = req.cookies?.nb_session;
    if (!token) {
      res.json({ success: true, user: null });
      return;
    }
    // Call requireAuth logic inline to safely inspect
    await requireAuth(req, res, () => {
      if (!req.user) {
        res.json({ success: true, user: null });
        return;
      }
      res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          permissions: req.user.permissions,
        },
      });
    });
  } catch {
    res.json({ success: true, user: null });
  }
});

// POST /api/auth/logout (Clears session cookie)
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('nb_session', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح.' });
});

// -------------------------------------------------------------
// Course Management (Admin Only, Phase 1.2 & 3.9)
// -------------------------------------------------------------

app.post('/api/courses', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = courseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'البيانات المدخلة غير مكتملة أو غير صحيحة.', errors: parsed.error.format() });
      return;
    }
    const storage = await getStorage();
    const id = `prog-${crypto.randomUUID()}`;
    const course = await storage.createCourse({ ...parsed.data, id });
    res.status(201).json({ success: true, message: 'تم إضافة البرنامج بنجاح.', course });
  } catch (err) {
    console.error('[API POST /api/courses] Error:', err);
    res.status(500).json({ success: false, message: 'فشل حفظ البرنامج.' });
  }
});

app.put('/api/courses/:id', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = courseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'البيانات المدخلة غير صحيحة.', errors: parsed.error.format() });
      return;
    }
    const storage = await getStorage();
    const updated = await storage.updateCourse(req.params.id, parsed.data);
    if (!updated) {
      res.status(404).json({ success: false, message: 'البرنامج غير موجود.' });
      return;
    }
    res.json({ success: true, message: 'تم تحديث البرنامج بنجاح.', course: updated });
  } catch (err) {
    console.error('[API PUT /api/courses/:id] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحديث البرنامج.' });
  }
});

app.delete('/api/courses/:id', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const storage = await getStorage();
    const deleted = await storage.deleteCourse(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'البرنامج غير موجود أو تم حذفه مسبقاً.' });
      return;
    }
    res.json({ success: true, message: 'تم حذف البرنامج بنجاح.' });
  } catch (err) {
    console.error('[API DELETE /api/courses/:id] Error:', err);
    res.status(500).json({ success: false, message: 'فشل حذف البرنامج.' });
  }
});

// -------------------------------------------------------------
// Student Progress (Role-Scoped: Admin sees all; Teacher sees assigned only)
// -------------------------------------------------------------

app.get('/api/students', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const storage = await getStorage();
    const user = req.user!;
    const filter = user.role === 'admin' ? undefined : user.email;
    const students = await storage.getStudents(filter);
    res.json({ success: true, students });
  } catch (err) {
    console.error('[API GET /api/students] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحميل بيانات الطلاب.' });
  }
});

app.post('/api/students/:id/progress', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = studentProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'البيانات المدخلة غير صحيحة.', errors: parsed.error.format() });
      return;
    }

    const storage = await getStorage();
    const student = await storage.getStudentById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'سجل الطالب غير موجود.' });
      return;
    }

    const user = req.user!;
    // Teacher can only update students assigned to them
    if (user.role === 'teacher' && student.assignedTeacherEmail?.toLowerCase() !== user.email.toLowerCase()) {
      res.status(403).json({ success: false, message: 'غير مصرح لك بتعديل بيانات طالب غير مسند إليك.' });
      return;
    }

    const updated = await storage.updateStudentProgress(req.params.id, parsed.data.newSurah, parsed.data.teacherNotes);
    res.json({ success: true, message: 'تم تحديث إنجاز الطالب بنجاح.', student: updated });
  } catch (err) {
    console.error('[API POST /api/students/:id/progress] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحديث سجل الطالب.' });
  }
});

// -------------------------------------------------------------
// Teacher Payouts & IBAN Management (IDOR Protected, No Card Numbers)
// -------------------------------------------------------------

app.get('/api/payouts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const storage = await getStorage();
    const user = req.user!;
    // Teacher ONLY sees their own payouts, derived strictly from session
    const filter = user.role === 'admin' ? undefined : user.email;
    const payouts = await storage.getPayouts(filter);
    res.json({ success: true, payouts });
  } catch (err) {
    console.error('[API GET /api/payouts] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحميل كشف المستحقات.' });
  }
});

app.post('/api/payouts/update-iban', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = teacherIbanUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'البيانات البنكية غير صحيحة.', errors: parsed.error.format() });
      return;
    }

    const { bankName, accountHolderName, iban } = parsed.data;
    if (!isValidIBAN(iban)) {
      res.status(400).json({ success: false, message: 'رقم الآيبان المدخل غير صالح أو لا يطابق المواصفات المصرفية (MOD-97).' });
      return;
    }

    const storage = await getStorage();
    // Identity is DERIVED STRICTLY from the authenticated session (prevents IDOR)
    const teacherEmail = req.user!.email;

    const updated = await storage.updateTeacherBankDetails(teacherEmail, bankName, accountHolderName, iban);
    if (!updated) {
      res.status(404).json({ success: false, message: 'لم يتم العثور على سجل مستحقات للمعلم لتحديثه.' });
      return;
    }

    res.json({
      success: true,
      message: 'تم حفظ وتشفير البيانات البنكية بنجاح.',
      payout: updated,
    });
  } catch (err) {
    console.error('[API POST /api/payouts/update-iban] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحديث البيانات البنكية.' });
  }
});

// -------------------------------------------------------------
// Public Lead Registration & Inquiries (Rate-Limited, Honeypot-Protected)
// -------------------------------------------------------------

app.post('/api/leads/register', publicFormRateLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = leadRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'يرجى مراجعة وتصحيح الحقول المطلوبة.', errors: parsed.error.format() });
      return;
    }

    if (parsed.data.hp_website) {
      res.status(400).json({ success: false, message: 'Invalid submission.' });
      return;
    }

    const { hp_website, ...cleanLead } = parsed.data;
    const storage = await getStorage();
    const created = await storage.createLead(cleanLead);

    res.status(201).json({
      success: true,
      message: 'تم استلام طلب التسجيل بنجاح. سيتواصل معكم المشرف لتأكيد موعد الحصة التجريبية.',
      leadId: created.id,
    });
  } catch (err) {
    console.error('[API /api/leads/register] Error:', err);
    res.status(500).json({ success: false, message: 'تعذر إرسال طلب الحجز، يرجى المحاولة لاحقاً.' });
  }
});

app.get('/api/leads', requireAuth, requireRole('admin'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const storage = await getStorage();
    const leads = await storage.getLeads();
    res.json({ success: true, leads });
  } catch (err) {
    console.error('[API GET /api/leads] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحميل قائمة الحجوزات.' });
  }
});

app.post('/api/contact/submit', publicFormRateLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = contactInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'البيانات المدخلة غير صحيحة.', errors: parsed.error.format() });
      return;
    }

    if (parsed.data.hp_website) {
      res.status(400).json({ success: false, message: 'Invalid submission.' });
      return;
    }

    const { hp_website, ...cleanInquiry } = parsed.data;
    const storage = await getStorage();
    const created = await storage.createInquiry(cleanInquiry);

    // Honest response: do NOT claim automatic email dispatch if transactional email is unconfigured
    res.json({
      success: true,
      message: 'تم استلام استفسارك بنجاح وسيقوم فريق الأكاديمية بمراجعته والتواصل معكم قريباً.',
      ticketId: created.id,
    });
  } catch (err) {
    console.error('[API /api/contact/submit] Error:', err);
    res.status(500).json({ success: false, message: 'تعذر إرسال الاستفسار، يرجى المحاولة لاحقاً.' });
  }
});

app.get('/api/contact/inquiries', requireAuth, requireRole('admin'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const storage = await getStorage();
    const inquiries = await storage.getInquiries();
    res.json({ success: true, inquiries });
  } catch (err) {
    console.error('[API GET /api/contact/inquiries] Error:', err);
    res.status(500).json({ success: false, message: 'فشل تحميل الاستفسارات.' });
  }
});

// -------------------------------------------------------------
// Vite Middleware (Dev) or Static Bundle (Production)
// -------------------------------------------------------------
async function startServer() {
  // Initialize storage layer on boot
  await getStorage();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        if (vite && typeof vite.ssrFixStacktrace === 'function') {
          vite.ssrFixStacktrace(e as Error);
        }
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Noor & Bayan Academy running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server FATAL]', err);
  process.exit(1);
});
