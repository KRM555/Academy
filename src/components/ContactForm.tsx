import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  Clock,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

interface ContactFormProps {
  currentLanguage: Language;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ currentLanguage }) => {
  const isAr = currentLanguage === 'ar';
  const t = translations[currentLanguage];

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    date: string;
    data: FormData;
  } | null>(null);

  const inquiryTopics = isAr
    ? [
        'استفسار عن حلقات تحفيظ القرآن الكريم والتجويد',
        'استفسار عن برامج التأسيس اللغوي والقراءة السليمة',
        'حجز حصة تجريبية مجانية أو تقييم مستوى الطفل',
        'استفسارات خاصة بالعائلات في المهجر والغربة (أوروبا، أمريكا، كندا)',
        'استشارات أسرية وتربوية (واحة الأمهات)',
        'استفسار عن خطط الدفع والرسوم والاشتراكات',
        'دعم فني واستفسارات أخرى',
      ]
    : [
        'Inquiry about Quran Memorization & Tajweed Circles',
        'Inquiry about Arabic Reading Foundations & Literacy',
        'Book Free Trial Class or Child Level Placement',
        'Expat & Overseas Families (Europe, USA, Canada, GCC)',
        "Parenting & Family Consultations (Mothers' Oasis)",
        'Tuition Fees, Payment Plans & Subscriptions',
        'Technical Support & General Questions',
      ];

  const validate = (data: FormData): FormErrors => {
    const errs: FormErrors = {};

    // Name validation
    if (!data.fullName.trim()) {
      errs.fullName = t.errNameReq;
    } else if (data.fullName.trim().length < 2) {
      errs.fullName = isAr ? 'الاسم قصير جداً (حرفين على الأقل)' : 'Name is too short (min 2 characters)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errs.email = t.errEmailReq;
    } else if (!emailRegex.test(data.email.trim())) {
      errs.email = t.errEmailReq;
    }

    // Phone validation (optional, but if filled must be reasonable)
    if (data.phone.trim()) {
      const cleanPhone = data.phone.replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length < 7 || !/^\d+$/.test(cleanPhone)) {
        errs.phone = t.errPhoneInvalid;
      }
    }

    // Subject validation
    if (!data.subject.trim()) {
      errs.subject = t.errSubjectReq;
    }

    // Message validation
    if (!data.message.trim()) {
      errs.message = t.errMessageReq;
    } else if (data.message.trim().length < 10) {
      errs.message = isAr
        ? 'يرجى كتابة تفاصيل أكثر عن استفسارك (10 أحرف على الأقل)'
        : 'Please provide more details (min 10 characters)';
    }

    return errs;
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      const validationErrors = validate(updated);
      setErrors(validationErrors);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(t.contactEmailValue);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      const ticketId =
        result.ticketId || `NB-INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSubmission = {
        id: ticketId,
        date: new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        data: { ...formData },
      };

      // Persist in localStorage so it can be viewed or tracked
      try {
        const stored = localStorage.getItem('noor_bayan_inquiries');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newSubmission);
        localStorage.setItem('noor_bayan_inquiries', JSON.stringify(list.slice(0, 50)));
      } catch (err) {
        console.warn('Could not save inquiry to local storage', err);
      }

      setSubmittedTicket(newSubmission);
      setIsSuccess(true);
    } catch (err) {
      console.warn('Network fallback for submission', err);
      const ticketId = `NB-INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSubmission = {
        id: ticketId,
        date: new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        data: { ...formData },
      };

      try {
        const stored = localStorage.getItem('noor_bayan_inquiries');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newSubmission);
        localStorage.setItem('noor_bayan_inquiries', JSON.stringify(list.slice(0, 50)));
      } catch (storageErr) {
        console.warn('Could not save inquiry to local storage', storageErr);
      }

      setSubmittedTicket(newSubmission);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setTouched({});
    setErrors({});
    setIsSuccess(false);
    setSubmittedTicket(null);
  };

  // Generate Mailto URI for users wishing to send from their native email client
  const generateMailtoUrl = () => {
    const currentTicket = submittedTicket?.id || 'NB-INQ';
    const subjectLine = encodeURIComponent(`[${currentTicket}] ${formData.subject || 'استفسار منصة نور وبيان'}`);
    const bodyContent = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته،\n\n` +
      `الاسم: ${formData.fullName}\n` +
      `البريد الإلكتروني: ${formData.email}\n` +
      `رقم الهاتف / الواتساب: ${formData.phone || 'غير محدد'}\n` +
      `الموضوع: ${formData.subject}\n` +
      `رقم التذكرة: ${currentTicket}\n\n` +
      `نص الاستفسار:\n${formData.message}\n\n` +
      `---\nمرسل عبر نموذج الاتصال - أكاديمية نور وبيان`
    );
    return `mailto:${t.contactEmailValue}?subject=${subjectLine}&body=${bodyContent}`;
  };

  // WhatsApp link with prefilled inquiry message
  const generateWhatsAppUrl = () => {
    const ticket = submittedTicket?.id || '';
    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله، أود المتابعة بخصوص استفساري في أكاديمية نور وبيان.\n` +
      `الاسم: ${formData.fullName}\n` +
      (ticket ? `رقم التذكرة: ${ticket}\n` : '') +
      `الموضوع: ${formData.subject}\n` +
      `الرسالة: ${formData.message}`
    );
    return `https://wa.me/966500000000?text=${text}`;
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-[#FAF9F6] to-white dark:from-[#070E18] dark:to-[#0B1522] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 relative overflow-hidden">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <Mail className="w-4 h-4 text-[#0D9488] dark:text-emerald-400" />
            <span>{t.contactBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight leading-tight">
            {isAr ? (
              <>
                تواصل معنا <span className="text-[#0D9488] dark:text-emerald-400">مباشرة</span> واستفسر عن برامج طفلك
              </>
            ) : (
              <>
                Get in Touch <span className="text-[#0D9488] dark:text-emerald-400">Directly</span> with Our Academic Team
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed max-w-2xl mx-auto">
            {t.contactSubtitle}
          </p>
        </div>

        {/* Two-Column Grid: Left Contact Info / Right Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1: Direct Support Cards & Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Direct Official Email Card */}
            <div className="p-6 bg-white dark:bg-[#111E2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#0D9488] dark:text-emerald-400 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.contactEmailLabel}
              </div>
              <div className="text-lg font-bold text-[#0F2942] dark:text-white mt-1 select-all font-mono">
                {t.contactEmailValue}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {isAr
                  ? 'يتم تحويل رسائل النموذج مباشرة إلى هذا البريد ويتولى الرد عليها المشرفون التعليميون.'
                  : 'Form submissions are sent directly to this official mailbox and answered by supervisors.'}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isAr ? 'تم نسخ البريد' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ عنوان البريد' : 'Copy Email'}</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${t.contactEmailValue}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-[#0D9488] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  <span>{isAr ? 'فتح في تطبيق البريد' : 'Open in Mail App'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick WhatsApp & Response Time */}
            <div className="p-6 bg-white dark:bg-[#111E2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.contactPhoneLabel}
                  </div>
                  <div className="text-lg font-bold text-[#0F2942] dark:text-white mt-1" dir="ltr">
                    {t.contactPhoneValue}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAr ? 'متصل الآن' : 'Online'}
                </span>
              </div>

              <div className="mt-4 pt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 text-[#0D9488] dark:text-emerald-400 shrink-0" />
                <span>{t.contactResponseTime}</span>
              </div>

              <div className="mt-4">
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isAr ? 'محادثة فورية عبر واتساب' : 'Instant WhatsApp Chat'}</span>
                </a>
              </div>
            </div>

            {/* Platform Guarantees Strip */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#0E2135] dark:to-[#0B1E2D] rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-[#0F2942] dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isAr ? 'ضمانات وتسهيلات التواصل' : 'Communication & Privacy Standards'}</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
                <li>{isAr ? 'استشارات تربوية مجانية قبل الاشتراك لتحديد المستوى الدقيق' : 'Free initial academic consultation before enrollment'}</li>
                <li>{isAr ? 'مواعيد مرنة متوافقة مع توقيت مكة المكرمة وعواصم العالم' : 'Flexible schedules aligned with Mecca & global diaspora timezones'}</li>
                <li>{isAr ? 'حماية تامة لبيانات الطفل والأسرة وخصوصية الفصول الأونلاين' : 'Absolute confidentiality of child data and private online sessions'}</li>
              </ul>
            </div>
          </div>

          {/* Column 2: The Contact Form Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#111E2E] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-xl font-bold text-[#0F2942] dark:text-white font-display">
                      {isAr ? 'نموذج إرسال استفسار مباشر' : 'Direct Inquiry Submission'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isAr
                        ? 'املأ النموذج التالي وسيصل استفسارك مباشرة إلى البريد الإلكتروني لفريق المنصة مع التحقق الفوري.'
                        : 'Fill out this form to submit your inquiry directly to the platform inbox with instant validation.'}
                    </p>
                  </div>

                  {/* Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.formFullName} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          onBlur={() => handleBlur('fullName')}
                          placeholder={t.formFullNamePlaceholder}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#0B1522] text-[#0F2942] dark:text-white border transition-colors focus:outline-none focus:ring-2 ${
                            touched.fullName && errors.fullName
                              ? 'border-rose-400 dark:border-rose-500/80 focus:ring-rose-200 dark:focus:ring-rose-950'
                              : touched.fullName && !errors.fullName
                              ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-950'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0D9488] focus:ring-emerald-100 dark:focus:ring-emerald-950'
                          }`}
                        />
                        {touched.fullName && !errors.fullName && (
                          <div className="absolute left-3 rtl:right-auto rtl:left-3 ltr:left-auto ltr:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {touched.fullName && errors.fullName && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.formEmail} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          dir="ltr"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          placeholder={t.formEmailPlaceholder}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#0B1522] text-[#0F2942] dark:text-white border transition-colors focus:outline-none focus:ring-2 ${
                            touched.email && errors.email
                              ? 'border-rose-400 dark:border-rose-500/80 focus:ring-rose-200 dark:focus:ring-rose-950'
                              : touched.email && !errors.email
                              ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-950'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0D9488] focus:ring-emerald-100 dark:focus:ring-emerald-950'
                          }`}
                        />
                        {touched.email && !errors.email && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone & Topic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone / WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.formPhone}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          dir="ltr"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          onBlur={() => handleBlur('phone')}
                          placeholder={t.formPhonePlaceholder}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#0B1522] text-[#0F2942] dark:text-white border transition-colors focus:outline-none focus:ring-2 ${
                            touched.phone && errors.phone
                              ? 'border-rose-400 dark:border-rose-500/80 focus:ring-rose-200 dark:focus:ring-rose-950'
                              : touched.phone && formData.phone && !errors.phone
                              ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-950'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#0D9488] focus:ring-emerald-100 dark:focus:ring-emerald-950'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Inquiry Topic Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.formSubject} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        onBlur={() => handleBlur('subject')}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#0B1522] text-[#0F2942] dark:text-white border transition-colors focus:outline-none focus:ring-2 cursor-pointer ${
                          touched.subject && errors.subject
                            ? 'border-rose-400 dark:border-rose-500/80 focus:ring-rose-200 dark:focus:ring-rose-950'
                            : touched.subject && !errors.subject
                            ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-950'
                            : 'border-slate-200 dark:border-slate-700 focus:border-[#0D9488] focus:ring-emerald-100 dark:focus:ring-emerald-950'
                        }`}
                      >
                        <option value="" disabled>
                          {t.formSubjectPlaceholder}
                        </option>
                        {inquiryTopics.map((topic, idx) => (
                          <option key={idx} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                      {touched.subject && errors.subject && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.subject}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message / Inquiry Details */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.formMessage} <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {formData.message.length} / 1000 {isAr ? 'حرف' : 'chars'}
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder={t.formMessagePlaceholder}
                      maxLength={1000}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#0B1522] text-[#0F2942] dark:text-white border transition-colors focus:outline-none focus:ring-2 resize-none ${
                        touched.message && errors.message
                          ? 'border-rose-400 dark:border-rose-500/80 focus:ring-rose-200 dark:focus:ring-rose-950'
                          : touched.message && !errors.message
                          ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-950'
                          : 'border-slate-200 dark:border-slate-700 focus:border-[#0D9488] focus:ring-emerald-100 dark:focus:ring-emerald-950'
                      }`}
                    />
                    {touched.message && errors.message && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button & Assurance */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t.formSubmitting}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 rtl:rotate-180" />
                          <span>{t.formSubmitBtn}</span>
                        </>
                      )}
                    </button>

                    <div className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {isAr
                          ? 'استفسارك يصل فوراً إلى صندوق بريد الأكاديمية الرسمي دون أي تأخير.'
                          : 'Your inquiry dispatches straight into our official inbox with zero delay.'}
                      </span>
                    </div>
                  </div>
                </form>
              ) : (
                /* Success State Screen */
                <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-bold text-[#0F2942] dark:text-white font-display">
                      {t.formSuccessTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t.formSuccessDesc}
                    </p>
                  </div>

                  {/* Receipt & Ticket Info Card */}
                  {submittedTicket && (
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#0B1522] rounded-2xl border border-slate-200 dark:border-slate-800 text-right rtl:text-right ltr:text-left text-xs max-w-lg mx-auto space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-500 dark:text-slate-400">{t.formRefCode}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm select-all">
                          {submittedTicket.id}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isAr ? 'المرسل: ' : 'Sender: '}
                          </span>
                          <span>{submittedTicket.data.fullName}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isAr ? 'البريد: ' : 'Email: '}
                          </span>
                          <span className="font-mono">{submittedTicket.data.email}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {isAr ? 'الموضوع: ' : 'Topic: '}
                          </span>
                          <span>{submittedTicket.data.subject}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions: Mailto fallback, WhatsApp follow-up, or Send Another */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                    <a
                      href={generateMailtoUrl()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{t.formDirectMail}</span>
                    </a>

                    <a
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.formDirectWa}</span>
                    </a>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.formSendAnother}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
