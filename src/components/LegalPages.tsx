import React from 'react';
import { Language } from '../data/translations';
import { FileText, ArrowRight, ArrowLeft, Lock } from 'lucide-react';

interface LegalPagesProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
  currentLanguage?: Language;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, onBack, currentLanguage = 'ar' }) => {
  const isAr = currentLanguage === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#070E18] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111E2E] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Top Back Navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0D9488] dark:text-emerald-400 hover:text-[#0f766e] mb-6 cursor-pointer"
        >
          <BackArrow className="w-4 h-4" />
          <span>{isAr ? 'الرجوع إلى الصفحة الرئيسية' : 'Return to Home Page'}</span>
        </button>

        {type === 'privacy' ? (
          /* Privacy Policy View */
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Lock className="w-6 h-6 text-[#0D9488] dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
                  {isAr ? 'سياسة الخصوصية وأمان بيانات الأطفال' : 'Privacy Policy & Child Safety Standards'}
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAr ? 'أكاديمية نور وبيان التعليمية · آخر تحديث: 2026' : 'Noor & Bayan Educational Academy · Updated: 2026'}
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
              {isAr
                ? 'تلتزم أكاديمية نور وبيان بأعلى معايير حماية خصوصية الأطفال وأولياء الأمور وفقاً للأنظمة والتشريعات الرقمية العربية والدولية (بما فيها نظام حماية البيانات الشخصية في المملكة العربية السعودية ومعايير COPPA لحماية خصوصية الأطفال على الإنترنت).'
                : 'Noor & Bayan Academy complies with the highest standards of child data protection, adhering to international COPPA guidelines and regional data privacy frameworks.'}
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '1. البيانات التي نقوم بجمعها' : '1. Data We Collect'}
                </h3>
                <p>
                  {isAr
                    ? 'نجمع فقط الحد الأدنى اللازم لتقديم الحصص التفاعلية: اسم الطفل الأول وعمره، اسم ولي الأمر، ورقم التواصل لتنسيق الحصص. لا نقوم إطلاقاً بطلب أي وثائق هوية حكومية للطفل.'
                    : 'We collect minimal information necessary to deliver classes: child first name, age bracket, and parent contact details for scheduling. No unnecessary sensitive records are requested.'}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '2. أمان وخصوصية الفصول الافتراضية الأونلاين (100% Online)' : '2. 100% Online Classroom Security'}
                </h3>
                <p>
                  {isAr
                    ? 'تُعقد جميع الحصص عبر غرف اتصال افتراضية خاصة ومغلقة برمز مرور وغرفة انتظار (Waiting Room) تحت إشراف معلمين مجازين وموثوقين. يُحظر تماماً تصوير أو تسجيل جلسات الأطفال المرئية بدون إذن وموافقة كتابية صريحة ومسبقة من ولي الأمر لأغراض المتابعة التعليمية فقط.'
                    : 'All sessions are held in password-protected virtual rooms with waiting rooms under certified instructors. Video sessions are strictly confidential.'}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '3. حماية المعاملات والبيانات المالية' : '3. Payment & Financial Data Protection'}
                </h3>
                <p>
                  {isAr
                    ? 'لا تقوم الأكاديمية بتخزين أي أرقام بطاقات مصرفية أو أرقام سرية (CVV) على خوادمها الخاصة. جميع عمليات الدفع تتم عبر بوابات دفع بنكية معتمدة ومشفرة بتشفير آمن.'
                    : 'We do not store full card numbers or CVV codes on our servers. All transactions are securely routed through certified and encrypted payment processors.'}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '4. عدم مشاركة البيانات مع أي طرف ثالث' : '4. Zero Third-Party Data Sharing'}
                </h3>
                <p>
                  {isAr
                    ? 'نتعهد تعهداً قاطعاً بعدم بيع أو تأجير أو مشاركة أي بيانات تخص أطفالكم أو أرقام هواتفكم مع أي شركات إعلانية أو جهات خارجية مهما كان المقابل.'
                    : 'We guarantee zero selling, renting, or unauthorized distribution of family records to advertising agencies or outside third parties.'}
                </p>
              </section>
            </div>
          </div>
        ) : (
          /* Terms and Conditions View */
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
                  {isAr ? 'الشروط والأحكام وسياسة الاشتراكات' : 'Terms of Service & Subscriptions'}
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAr ? 'أكاديمية نور وبيان التعليمية · اتفاقية الخدمة' : 'Noor & Bayan Educational Academy · Service Agreement'}
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              {isAr
                ? 'تسري هذه الشروط على جميع المسجلين والمستفيدين من برامج أكاديمية نور وبيان للتعليم والتربية عن بُعد. بتسجيل طفلك، فإنك توافق على البنود الموضحة أدناه لضمان بيئة تربوية رائدة.'
                : 'These terms apply to all enrolled students and parents at Noor & Bayan Academy. Enrollment constitutes agreement to ensure an upright academic and moral environment.'}
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '1. طبيعة الخدمات التعليمية (أونلاين 100%)' : '1. 100% Virtual Classrooms'}
                </h3>
                <p>
                  {isAr
                    ? 'تقدم أكاديمية نور وبيان برامجها التعليمية (حلقات القرآن، التأسيس اللغوي والقراءة السليمة، غرس القيم، ونادي التفكير والبرمجة) بصورة تفاعلية مباشرة عبر الإنترنت بنسبة 100% لجميع الطلاب في السعودية والعالم العربي والمغتربين.'
                    : 'All educational programs (Quran, Arabic reading foundations, Values, and Kids Coding) are conducted 100% online through live virtual sessions.'}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '2. الحصة التجريبية وضمان الرضا الكامل' : '2. Free Trial & Full Satisfaction Guarantee'}
                </h3>
                <p>
                  {isAr
                    ? 'يحق لكل طفل جديد الاستفادة من حصة تقييم وتجربة مجانية كاملة قبل سداد أي رسوم اشتراك، للتعرف على المعلم وطريقة التدريس. في حال سداد الاشتراك ولم يناسب البرنامج طفلك، نضمن لك استرداد الرسوم كاملة خلال الأيام السبعة الأولى من بدء الدورة.'
                    : 'Every new student is entitled to a complimentary diagnostic trial session before any commitment. A 7-day money-back guarantee applies upon enrollment.'}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '3. الحضور والغياب وإعادة الجدولة' : '3. Attendance & Makeup Sessions'}
                </h3>
                <p>
                  {isAr
                    ? 'يلتزم ولي الأمر بتهيئة مكان هادئ وتوفير اتصال إنترنت جيد للطفل أثناء الحصة. في حال تعذر حضور الطالب لحصة معينة بسبب عذر طارئ، يتم إشعار إدارة الأكاديمية قبل الموعد بـ 6 ساعات على الأقل لترتيب حصة تعويضية مناسبة.'
                    : 'Parents provide a quiet learning space and stable connection. Notice of at least 6 hours is required to arrange makeup sessions for excused absences.'}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#0F2942] dark:text-white">
                  {isAr ? '4. تجديد الاشتراكات وخيارات التقسيط' : '4. Multi-Currency Subscriptions & Installments'}
                </h3>
                <p>
                  {isAr
                    ? 'تُسدد الاشتراكات شهرياً بالعملة التي يختارها ولي الأمر (ريال سعودي، جنيه مصري، درهم، دولار، دينار). وتتيح الأكاديمية التقسيط بدون فوائد عبر شريكي الدفع المعتمدين (تابي وتمارا) في الدول المدعومة.'
                    : 'Subscriptions can be billed in SAR, EGP, AED, USD, or KWD. 4-month zero-interest installments are supported via Tabby and Tamara.'}
                </p>
              </section>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#0F2942] dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer"
          >
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

