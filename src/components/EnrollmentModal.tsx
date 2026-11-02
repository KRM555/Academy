import React, { useState } from 'react';
import { Language } from '../data/translations';
import { X, MessageCircle, ShieldCheck, Sparkles, Send, Laptop } from 'lucide-react';
import { getWhatsAppUrl } from '../config/siteConfig';
import { api } from '../services/api';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProgramTitle?: string | null;
  customNote?: string;
  currentLanguage?: Language;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  preSelectedProgramTitle,
  customNote,
  currentLanguage = 'ar',
}) => {
  const isAr = currentLanguage === 'ar';
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(6);
  const [parentName, setParentName] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('المملكة العربية السعودية');
  const [preferredProgram, setPreferredProgram] = useState(preSelectedProgramTitle || 'حلقات "نور يتلى" لتحفيظ القرآن');
  const [preferredTime, setPreferredTime] = useState('الفترة المسائية (بعد العصر / المغرب)');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

    try {
      const data = await api.leads.register({
        childName,
        childAge,
        parentName,
        parentPhone: fullPhone,
        country,
        programTitle: preSelectedProgramTitle || preferredProgram,
        preferredTimezone: preferredTime,
      });

      if (data.success) {
        setIsSuccess(true);
        setLeadId(data.leadId);
      } else {
        setErrorMessage(data.message || (isAr ? 'حدث خطأ أثناء التسجيل، يرجى التحقق من البيانات.' : 'Error submitting registration, please verify details.'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? 'تعذر الاتصال بالخادم، يرجى المحاولة عبر الواتساب مباشرة.' : 'Connection error, please reach out via WhatsApp directly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullPhoneClean = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
  const whatsappUrl = getWhatsAppUrl(
    `السلام عليكم، قمت بطلب حجز حصة تقييم وتجربة مجانية أونلاين لطفلي (${childName} - ${childAge} سنوات) ببرنامج (${preSelectedProgramTitle || preferredProgram}). رقم هاتفي: ${fullPhoneClean} - ${country}.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111E2E] rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 rtl:left-5 ltr:right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] dark:text-emerald-400 mb-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'أكاديمية نور وبيان · حصة تجريبية أونلاين 100%' : 'Noor & Bayan · 100% Online Free Trial'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white font-display">
                {isAr ? 'سجّل مقعد طفلك الآن' : 'Reserve Your Child Seat'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'حصة تقييم وتجربة مجانية بدون أي التزام مالي مسبق' : 'Complimentary trial evaluation class with no advance obligation'}
              </p>
            </div>

            {preSelectedProgramTitle && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs">
                <div className="font-bold text-[#0D9488] dark:text-emerald-400 font-display">{preSelectedProgramTitle}</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  <span>{isAr ? 'فصل تفاعلي حي عبر زوم' : 'Live interactive Zoom classroom'}</span>
                </div>
              </div>
            )}

            {customNote && (
              <div className="mb-4 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono">
                {customNote}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم الطفل / الطفلة:' : 'Child Name:'}
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder={isAr ? 'مثال: عبد الله' : 'e.g. Abdullah'}
                    required
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#16253B] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-[#0D9488] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'عمر الطفل (سنوات):' : 'Child Age (Years):'}
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="15"
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#16253B] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-[#0D9488] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم ولي الأمر (الأب / الأم):' : 'Parent Name:'}
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder={isAr ? 'مثال: محمد العمري' : 'e.g. Mohammed Al-Omari'}
                  required
                  className="w-full text-xs p-2.5 bg-white dark:bg-[#16253B] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-[#0D9488] outline-none"
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'رقم الواتساب للتواصل وتأكيد موعد الحصة:' : 'WhatsApp Number for Class Confirmation:'}
                </label>
                <div className="flex gap-2" dir="ltr">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      if (e.target.value === '+966') setCountry('المملكة العربية السعودية');
                      if (e.target.value === '+20') setCountry('مصر');
                      if (e.target.value === '+971') setCountry('الإمارات العربية المتحدة');
                      if (e.target.value === '+965') setCountry('الكويت');
                      if (e.target.value === '+962') setCountry('الأردن');
                      if (e.target.value === '+1') setCountry('أمريكا / كندا');
                      if (e.target.value === '+44') setCountry('بريطانيا');
                    }}
                    className="text-xs p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-mono shrink-0"
                  >
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+962">🇯🇴 +962</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="50 123 4567"
                    required
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#16253B] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-[#0D9488] outline-none font-mono text-left"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'بلد الإقامة الحالي:' : 'Country of Residence:'}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-[#16253B] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-[#0D9488] outline-none"
                >
                  <option value="المملكة العربية السعودية">المملكة العربية السعودية (KSA)</option>
                  <option value="مصر">مصر (Egypt)</option>
                  <option value="الإمارات العربية المتحدة">الإمارات العربية المتحدة (UAE)</option>
                  <option value="الكويت">الكويت (Kuwait)</option>
                  <option value="قطر والبحرين وعُمان">قطر / البحرين / عُمان</option>
                  <option value="الأردن وفلسطين والشام">الأردن / فلسطين / لبنان</option>
                  <option value="المغرب العربي (الجزائر / المغرب / تونس)">المغرب العربي (North Africa)</option>
                  <option value="المملكة المتحدة وأوروبا (مغتربين)">أوروبا (Europe Expats)</option>
                  <option value="الولايات المتحدة وكندا (مغتربين)">أمريكا وكندا (USA & Canada)</option>
                </select>
              </div>

              {/* Preferred Timing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الموعد المفضل للحصص:' : 'Preferred Class Timing:'}
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white dark:bg-[#16253B] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-[#0D9488] outline-none"
                >
                  <option value="الفترة المسائية (بعد العصر / المغرب)">
                    {isAr ? 'الفترة المسائية (بعد العصر / المغرب)' : 'Afternoon / Evening'}
                  </option>
                  <option value="الفترة الليلية (بعد العشاء)">
                    {isAr ? 'الفترة الليلية (بعد العشاء)' : 'Night (After Isha)'}
                  </option>
                  <option value="الفترة الصباحية (عطلات نهاية الأسبوع)">
                    {isAr ? 'الفترة الصباحية (عطلات نهاية الأسبوع)' : 'Morning (Weekends)'}
                  </option>
                  <option value="توقيت مخصص للمغتربين بأوروبا وأمريكا">
                    {isAr ? 'توقيت مخصص للمغتربين بأوروبا وأمريكا' : 'Special Expat Schedule'}
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (isAr ? 'جاري تأكيد الحجز...' : 'Confirming Reservation...')
                      : (isAr ? 'تأكيد حجز الحصة التجريبية المجانية' : 'Confirm Free Trial Reservation')}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isAr ? 'حماية كاملة لبيانات الأطفال وأولياء الأمور' : '100% Confidential & Secure'}</span>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white font-display">
              {isAr ? 'تم تسجيل طلبكم بنجاح!' : 'Reservation Submitted Successfully!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {isAr ? (
                <>
                  يسعدنا انضمام طفلكم <span className="font-bold text-slate-900 dark:text-white">{childName}</span> إلى أسرة أكاديمية نور وبيان. تم تسجيل الطلب برقم: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{leadId}</span>.
                </>
              ) : (
                <>
                  We are delighted to welcome <span className="font-bold text-slate-900 dark:text-white">{childName}</span> to Noor & Bayan Academy. Booking Reference: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{leadId}</span>.
                </>
              )}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'فتح الواتساب لتأكيد موعد الحصة' : 'Open WhatsApp to Confirm'}</span>
                </a>
              )}

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

