import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Language, translations } from '../../data/translations';
import { FloatingIllustrations } from './FloatingIllustrations';
import {
  CalendarCheck,
  Video,
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Laptop,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  MessageSquare,
  Volume2,
} from 'lucide-react';

interface PublicHowItWorksPageProps {
  currentLanguage?: Language;
  onOpenTrial: () => void;
}

export const PublicHowItWorksPage: React.FC<PublicHowItWorksPageProps> = ({
  currentLanguage = 'ar',
  onOpenTrial,
}) => {
  const [activeTab, setActiveTab] = useState<'classroom' | 'report' | 'guarantee'>('classroom');
  const shouldReduceMotion = useReducedMotion();
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const journeySteps = [
    {
      num: '01',
      title: isAr ? 'حجز الحصة التجريبية المجانية' : 'Book Free Trial Class',
      desc: isAr
        ? 'اختيار المسار التعليمي وتحديد التوقيت المناسب لأسرتكم عبر استمارة سريعة في أقل من دقيقة بدون أي التزام مالي.'
        : 'Select the program and convenient time slot in under a minute with zero upfront commitment.',
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/80',
    },
    {
      num: '02',
      title: isAr ? 'جلسة التقييم والتشخيص الفردي' : 'One-on-One Assessment',
      desc: isAr
        ? 'حصة تفاعلية حية (45 دقيقة) عبر زوم يتعرف فيها المعلم على مستوى الطفل، مخارج الحروف، ونقاط القوة لكسر حاجز الخوف.'
        : 'A 45-minute friendly live session assessing child readiness, phonetics, and learning style.',
      icon: Video,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80',
    },
    {
      num: '03',
      title: isAr ? 'رسم الخطة الأكاديمية والجدول' : 'Custom Tailored Roadmap',
      desc: isAr
        ? 'يقوم المشرف الأكاديمي بإعداد خطة فردية تلائم وتيرة طفلك، وتحديد مواعيد الحصص الأسبوعية بتوقيت مكة المكرمة.'
        : 'Our academic supervisor designs a personalized pace suited specifically to your child’s weekly rhythm.',
      icon: FileCheck,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-800/80',
    },
    {
      num: '04',
      title: isAr ? 'الانطلاق والتقارير الأسبوعية' : 'Learning & Weekly Insights',
      desc: isAr
        ? 'بدء الحصص التفاعلية، مع إرسال تقرير أسبوعي مفصل عبر الواتساب وبوابة ولي الأمر يرصد حفظ السور ونسب الإتقان.'
        : 'Regular interactive sessions with comprehensive weekly updates sent directly to your phone portal.',
      icon: Award,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/80',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] dark:bg-[#070E18] text-[#0F2942] dark:text-slate-100 transition-colors duration-200">
      <FloatingIllustrations />

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-100 dark:border-emerald-900/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{isAr ? 'رحلة تعلم سلسة وواضحة' : 'Seamless Onboarding Journey'}</span>
          </motion.div>

          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight text-balance max-w-3xl mx-auto"
          >
            {isAr
              ? 'كيف تبدأ طفلك رحلة التعلم في 4 خطوات بسيطة وميسرة؟'
              : 'How Your Child Begins Learning in 4 Simple Steps'}
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed"
          >
            {isAr
              ? 'صممنا تجربة تعليمية مريحة لولي الأمر ومبهجة للطفل، تجمع بين الفصول الافتراضية عالية الوضوح والمتابعة التربوية الصادقة خطوة بخطوة.'
              : 'From your first trial class to weekly progress metrics, discover how we make online learning inspiring, trustworthy, and effective.'}
          </motion.p>
        </div>
      </section>

      {/* 4 Steps Journey Section */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {journeySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-700">
                      {step.num}
                    </span>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.bg} ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0F2942] dark:text-white font-display mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>{isAr ? 'خطوة أساسية' : 'Key Stage'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Deep-Dive Tabs (Classroom Tech / Parent Report / Golden Guarantee) */}
        <div className="mt-16 sm:mt-24 bg-white dark:bg-[#111E2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xs">
          {/* Tabs Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('classroom')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'classroom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>{isAr ? 'تقنيات الفصل الافتراضي الحي' : 'Virtual Classroom Tech'}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{isAr ? 'نموذج تقرير ولي الأمر الأسبوعي' : 'Weekly Parent Report'}</span>
            </button>

            <button
              onClick={() => setActiveTab('guarantee')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'guarantee'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'الضمان الذهبي للأكاديمية' : 'Golden Satisfaction Guarantee'}</span>
            </button>
          </div>

          {/* Tab 1: Virtual Classroom Tech */}
          {activeTab === 'classroom' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-4">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {isAr ? 'فصول حية آمنة وتفاعلية' : 'Safe Interactive Sessions'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white font-display">
                  {isAr ? 'بيئة افتراضية صممت خصيصاً لجذب انتباه الطفل' : 'Designed to Keep Young Minds Engaged'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'نوظف تقنيات زوم التعليمية المتقدمة مع مشاركة المصحف الإلكتروني الملون، والسبورة الرقمية التفاعلية، لتعليم القراءة ومخارج الحروف مع إمكانية مراجعة تسجيلات الحصة في أي وقت.'
                    : 'High definition audio and video with digital Quran overlays, colored tajweed highlights, and interactive pen annotations.'}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isAr ? 'مصحف المدينة الملون مع تظليل أحكام التجويد والمدود' : 'Colored Tajweed Quran text highlighter'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isAr ? 'كاميرا واضحة لضبط مخارج الحروف وحركة الشفتين' : 'HD camera for lips and phonetic placement clarity'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isAr ? 'ألعاب تهجئة وقصص مصورة بعد كل جزء تعليمي' : 'Gamified spelling puzzles and reward stars'}</span>
                  </div>
                </div>
              </div>

              {/* Mock Classroom Interactive Screen */}
              <div className="bg-[#0B1522] rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-xl text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">{isAr ? 'جلسة تحفيظ مباشرة (زووم)' : 'Live Quran Session (Zoom)'}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono">00:32:15</span>
                </div>

                <div className="py-6 px-4 text-center space-y-3 bg-[#0F2942]/60 rounded-xl my-4 border border-slate-800">
                  <div className="text-amber-400 text-xs font-bold">
                    {isAr ? 'سورة النبأ - الآية 1 إلى 5' : 'Surah An-Naba (1-5)'}
                  </div>
                  <p className="text-lg sm:text-xl font-serif text-emerald-200 leading-loose">
                    ﴿ عَمَّ يَتَسَاءَلُونَ ۝ عَنِ النَّبَإِ الْعَظِيمِ ۝ الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ ﴾
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'ترتيل المعلم مع ترادف الطالب' : 'Teacher recitation & student repeat'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <span>{isAr ? 'المعلم: الشيخ عبد الله القرني' : 'Teacher: Sheikh Abdullah'}</span>
                  <span className="text-emerald-400 font-bold">{isAr ? 'إتقان التجويد: 100%' : 'Tajweed: 100%'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Weekly Parent Report */}
          {activeTab === 'report' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 uppercase tracking-wider">
                  {isAr ? 'شفافية كاملة ومتابعة دورية' : 'Full Parental Oversight'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white font-display">
                  {isAr ? 'تقرير إنجاز أسبوعي يصلك مباشرة' : 'Weekly Progress Card Sent To You'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'لا تحتاج للسؤال المتكرر عما أنجزه طفلك؛ يوثق المعلم في ختام كل أسبوع السور التي حفظها، ملاحظات التجويد، ومستوى الحضور، مع إتاحة لوحة تحكم إلكترونية لمتابعة المسيرة كاملة.'
                    : 'Clear data on memorized verses, attendance rates, behavioral points, and individualized teacher feedback.'}
                </p>
              </div>

              {/* Sample Report Card */}
              <div className="bg-[#FAF9F6] dark:bg-[#070E18] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F2942] dark:text-white">
                      {isAr ? 'بطاقة إنجاز الأسبوع: عمر أحمد' : 'Weekly Card: Omar Ahmed'}
                    </h4>
                    <span className="text-xs text-slate-500">{isAr ? 'المسار: حلقة جزء عم' : 'Track: Juz Amma'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    {isAr ? 'تقدير: ممتاز (98%)' : 'Grade: Excellent'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">{isAr ? 'السور المتقنة هذا الأسبوع:' : 'Surahs Mastered:'}</span>
                    <span className="font-bold text-[#0F2942] dark:text-white">{isAr ? 'النبأ، النازعات، عبس' : 'An-Naba, An-Naziat, Abasa'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">{isAr ? 'نسبة الحضور والالتزام:' : 'Attendance Rate:'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100% (3/3 حصص)</span>
                  </div>
                  <div className="py-2 text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#111E2E] p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{isAr ? 'ملاحظة المعلم:' : 'Teacher Note:'}</span>{' '}
                    {isAr
                      ? 'ما شاء الله، إتقان مذهل لأحكام الغنة والمد المتصل، وتركيز ممتاز طوال الحصة.'
                      : 'Outstanding mastery of tajweed rules and attentive participation.'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Golden Guarantee */}
          {activeTab === 'guarantee' && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center max-w-2xl mx-auto space-y-4 py-4"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white font-display">
                {isAr ? 'الضمان الذهبي لراحة بال أولياء الأمور' : '100% Peace of Mind Golden Guarantee'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'ثقتنا في كادرنا ومناهجنا مطلقة؛ إن لم ينسجم طفلك مع المعلم أو لم تشعر بالفرق الواضح خلال أول أسبوعين من التسجيل، يحق لك تغيير المعلم فوراً أو استرداد كامل الرسوم المتبقية دون أي تعقيد.'
                  : 'If you feel your child is not completely thriving within the first 14 days, change teachers instantly or receive a 100% prorated refund with no questions asked.'}
              </p>

              <div className="pt-4">
                <button
                  onClick={onOpenTrial}
                  className="px-6 py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isAr ? 'ابدأ بالحصة التجريبية المجانية الآن' : 'Start Your Free Trial Class Now'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 text-center">
          <button
            onClick={onOpenTrial}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7a6f] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>{isAr ? 'احجز حصة طفلك التجريبية المجانية اليوم' : 'Book Your Child’s Free Trial Class Today'}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
