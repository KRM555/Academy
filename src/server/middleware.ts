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
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL CONFIG ERROR: JWT_SECRET environment variable is missing in production.');
    }
    return 'dev-insecure-jwt-secret-do-not-use-in-production-32chars';
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

// Rate Limiter for Login Attempts: 5 attempts per 15 minutes per IP
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى الانتظار 15 دقيقة قبل إعادة المحاولة.',
  },
});

// Rate Limiter for Public Submission Forms (Leads, Contact): 10 submissions per 15 mins
export const publicFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تم تلقي عدة طلبات من نفس المصدر. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.',
  },
});
