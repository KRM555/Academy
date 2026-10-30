import { z } from 'zod';
import { CANONICAL_SURAHS } from '../types';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().trim().email('صيغة البريد الإلكتروني غير صحيحة').max(150),
  password: z.string().min(1, 'كلمة المرور مطلوبة').max(128),
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
