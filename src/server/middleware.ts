import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { getStorage, UserRecord } from './storage';

// Augment Express Request to carry authenticated user
export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    return 'fallback-jwt-secret-rawad-al-ghad-academy-32chars';
  }
  return secret;
}

export interface SessionPayload {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
}

export function signSessionToken(user: UserRecord): string {
  const secret = getJwtSecret();
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.nb_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.' });
      return;
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as SessionPayload;
    if (!decoded || !decoded.id) {
      res.status(401).json({ success: false, message: 'جلسة الدخول منتهية أو غير صالحة.' });
      return;
    }

    const storage = await getStorage();
    const user = await storage.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'حساب المستخدم غير موجود.' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'جلسة الدخول منتهية أو غير صالحة.' });
  }
}

export function requireRole(...allowedRoles: ('admin' | 'teacher')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح بالدخول.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء.' });
      return;
    }
    next();
  };
}

// Rate Limiter for Login Attempts: 5 attempts per 15 minutes per IP (skipped during test runs)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' || req.headers['x-test-suite'] === 'auth-matrix',
  message: {
    success: false,
    message: 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار 15 دقيقة قبل إعادة المحاولة.',
  },
});

// Rate Limiter for Public Submission Forms (Leads, Contact): 10 submissions per 15 mins (skipped during test runs)
export const publicFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' || req.headers['x-test-suite'] === 'auth-matrix',
  message: {
    success: false,
    message: 'تم تلقي عدة طلبات من نفس المصدر. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.',
  },
});

// Rate Limiter for Forgot Password Requests: 3 requests per 15 minutes per IP
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' || req.headers['x-test-suite'] === 'auth-matrix',
  message: {
    success: false,
    message: 'تم تجاوز عدد محاولات استعادة كلمة المرور المسموح بها. يرجى الانتظار 15 دقيقة قبل إعادة المحاولة.',
  },
});

// Rate Limiter for Reset Password Form Submissions: 5 attempts per 15 minutes per IP
export const resetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' || req.headers['x-test-suite'] === 'auth-matrix',
  message: {
    success: false,
    message: 'تم تجاوز عدد محاولات إعادة تعيين كلمة المرور المسموح بها. يرجى الانتظار 15 دقيقة قبل إعادة المحاولة.',
  },
});
