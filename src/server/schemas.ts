import { z } from 'zod';
import { CANONICAL_SURAHS } from '../types';

// Strong Password Policy:
// - At least 8 characters, maximum 128 characters
// - At least one uppercase letter (A-Z)
// - At least one lowercase letter (a-z)
// - At least one digit (0-9)
// - At least one special symbol (!@#$%^&*...)
export const strongPasswordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
  .max(128, 'كلمة المرور يجب ألا تتجاوز 128 حرفاً')
  .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z)')
  .regex(/[a-z]/, 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل (a-z)')
  .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9)')
  .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل مثل (!@#$%^&*)');

// Auth login schema (validates email format and password policy requirements)
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة')
    .max(150, 'البريد الإلكتروني لا يتجاوز 150 حرفاً'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
    .max(128, 'كلمة المرور يجب ألا تتجاوز 128 حرفاً'),
});

// Auth registration schema with strong password enforcement & honeypot
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'الاسم الكامل مطلوب ويجب ألا يقل عن حرفين')
    .max(100, 'الاسم لا يتجاوز 100 حرف'),
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة')
    .max(150, 'البريد الإلكتروني لا يتجاوز 150 حرفاً'),
  password: strongPasswordSchema,
  role: z.enum(['admin', 'teacher']).default('teacher'),
  // Honeypot field
  hp_website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة')
    .max(150, 'البريد الإلكتروني لا يتجاوز 150 حرفاً'),
  hp_website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(32, 'رمز إعادة التعيين غير صالح أو قصير جداً')
    .max(256, 'رمز إعادة التعيين غير صالح'),
  password: strongPasswordSchema,
});

// Course schema (Full, symmetric for POST and PUT)
export const courseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  subtitle: z.string().trim().min(3).max(250),
  ageBracket: z.string().trim().min(2).max(50),
  minAge: z.coerce.number().int().min(3).max(20),
  maxAge: z.coerce.number().int().min(3).max(30),
  category: z.enum(['quran', 'arabic', 'values', 'tech', 'mothers']),
  deliveryMode: z.literal('online').default('online'),
  image: z.string().trim().min(1).max(500),
  description: z.string().trim().min(10).max(2000),
  weeklySessions: z.coerce.number().int().min(1).max(7),
  sessionDurationMins: z.coerce.number().int().min(15).max(180),
  priceSar: z.coerce.number().positive('السعر يجب أن يكون رقماً موجباً').max(50000),
  billingUnit: z.string().trim().max(100).default('شهرياً'),
  installmentsEligible: z.boolean().default(false),
  features: z.array(z.string().trim().min(1).max(200)).max(20),
  instructorName: z.string().trim().max(100).optional(),
  instructorTitle: z.string().trim().max(100).optional(),
});

export const courseUpdateSchema = courseSchema.partial();

// Student progress update schema
export const studentProgressSchema = z.object({
  newSurah: z
    .string()
    .trim()
    .refine((val) => !val || CANONICAL_SURAHS.includes(val), {
      message: 'السورة المدخلة غير موجودة في قائمة سور القرآن الكريم المعتمدة',
    })
    .optional(),
  teacherNotes: z.string().trim().max(1000, 'الملاحظة لا تتجاوز 1000 حرف').optional(),
});

// Teacher bank/IBAN update schema (Phase 1.3: No card numbers!)
export const teacherIbanUpdateSchema = z.object({
  bankName: z.string().trim().min(2, 'اسم البنك مطلوب').max(100),
  accountHolderName: z.string().trim().min(3, 'اسم صاحب الحساب مطلوب').max(150),
  iban: z
    .string()
    .trim()
    .min(15, 'رقم الآيبان قصير جداً')
    .max(34, 'رقم الآيبان غير صحيح'),
});

// Lead registration schema with honeypot
export const leadRegisterSchema = z.object({
  childName: z.string().trim().min(2, 'اسم الطفل مطلوب').max(100),
  childAge: z.coerce.number().int().min(3, 'العمر يجب أن يكون 3 سنوات على الأقل').max(18),
  parentName: z.string().trim().min(2, 'اسم ولي الأمر مطلوب').max(100),
  parentPhone: z.string().trim().min(7, 'رقم الهاتف غير صحيح').max(30),
  country: z.string().trim().min(2).max(60),
  programTitle: z.string().trim().min(2).max(150),
  preferredTimezone: z.string().trim().min(2).max(100),
  customNote: z.string().trim().max(500).optional(),
  // Honeypot field: robots fill this, real users don't see it
  hp_website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

// Contact inquiry schema with honeypot
export const contactInquirySchema = z.object({
  fullName: z.string().trim().min(2, 'الاسم الكامل مطلوب').max(100),
  email: z.string().trim().email('صيغة البريد الإلكتروني غير صحيحة').max(150),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3, 'الموضوع مطلوب').max(150),
  message: z.string().trim().min(10, 'نص الرسالة قصير جداً (10 أحرف على الأقل)').max(1500),
  // Honeypot field: robots fill this, real users don't see it
  hp_website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});
