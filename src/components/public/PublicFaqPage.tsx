import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Language, translations } from '../../data/translations';
import { FloatingIllustrations } from './FloatingIllustrations';
import { siteConfig, getWhatsAppUrl } from '../../config/siteConfig';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface PublicFaqPageProps {
  currentLanguage?: Language;
  onOpenTrial: () => void;
}

interface FaqItem {
  id: string;
  category: 'quran' | 'arabic' | 'schedule' | 'tech' | 'pricing' | 'teachers';
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

const FAQ_DATABASE: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'quran',
    qAr: 'هل الحلقات القرآنية فردية أم جماعية؟ وما هو الفارق؟',
    qEn: 'Are Quran sessions one-on-one or in groups?',
    aAr: 'نقدم مسارين رئيسيين: الحلقات الفردية الخاصة (1:1) للتركيز التام وتصحيح التلاوة بدقة وفق وتيرة الطفل الخاصة، وحلقات المجموعات المصغرة (3 إلى 5 أطفال كحد أقصى) لخلق روح التنافس الشريف والتحفيز المتبادل.',
    aEn: 'We offer two pathways: Private 1-on-1 sessions for customized individual pacing, and micro-groups (max 3-5 students) fostering healthy motivation and friendly peer encouragement.',
  },
  {
    id: 'faq-2',
    category: 'tech',
    qAr: 'كيف تتم الحصص أونلاين؟ وما هي البرامج المطلوبة؟',
    qEn: 'How are online classes conducted, and what software is needed?',
    aAr: 'تُقام الحصص عبر تطبيق زووم (Zoom) أو جوجل ميت (Google Meet) بفصول تفاعلية مشفرة وآمنة. لا تحتاج سوى جهاز لوحي (آيباد/تابلت) أو لابتوب مع اتصال إنترنت مستقر وكاميرا وميكروفون يعملان بكفاءة.',
    aEn: 'Sessions are hosted via Zoom or Google Meet using secure classrooms. All you need is an iPad/tablet or computer with stable internet, camera, and microphone.',
  },
  {
    id: 'faq-3',
    category: 'arabic',
    qAr: 'طفلي عمره 5 سنوات ولا يعرف الحروف، هل يناسبه منهج نور البيان؟',
    qEn: 'My child is 5 and does not know letters. Is Noor Al-Bayan suitable?',
    aAr: 'نعم بكل تأكيد! منهج نور البيان هو الأنسب للأعمار من 4 إلى 10 سنوات، حيث يبدأ من الصفر تماماً عبر ربط الحرف بصورته وصوته وحركاته القصيرة والطويلة، بأسلوب بصري تفاعلي يتيح للطفل التهجئة والقراءة في فترة وجيزة.',
    aEn: 'Absolutely! Noor Al-Bayan is the premier foundation curriculum for ages 4-10, starting from scratch with multisensory letter recognition and phonetic spelling.',
  },
  {
    id: 'faq-4',
    category: 'schedule',
    qAr: 'ماذا لو تغيب طفلي عن حصة بسبب ظرف طارئ أو سفر؟',
    qEn: 'What happens if my child misses a class due to an emergency?',
    aAr: 'نراعي ظروف الأسر تماماً؛ يكفي إبلاغ الإدارة أو المعلم قبل موعد الحصة بـ 4 ساعات على الأقل، ويتم تعويض الحصة في موعد بديل يتم التنسيق بشأنه، دون أن يفقد الطالب درسه.',
    aEn: 'We understand family schedules. Notify us at least 4 hours in advance to reschedule a makeup session at a mutually agreed time without losing credits.',
  },
  {
    id: 'faq-5',
    category: 'teachers',
    qAr: 'من هم المعلمون؟ وهل يمكنني اختيار معلمة لطفلتي الصغيرة؟',
    qEn: 'Who are the teachers, and can I choose a female teacher for my daughter?',
    aAr: 'جميع معلمينا ومعلماتنا من خريجي الكليات الشرعية واللغوية وحملة الإجازات القرآنية المسندة. نوفر معلمات متخصصات ومجازات للبنات والأطفال الصغار، ويمكن لولي الأمر تحديد تفضيله (معلم أو معلمة) عند التسجيل.',
    aEn: 'All instructors are certified scholars and ijazah holders. We provide dedicated female educators for young girls and early learners upon parent request.',
  },
  {
    id: 'faq-6',
    category: 'pricing',
    qAr: 'ما هي طرق الدفع المتاحة؟ وهل تتوفر خصومات للأخوة؟',
    qEn: 'What payment methods are supported, and are there sibling discounts?',
    aAr: 'ندعم الدفع الآمن بالبطاقات الائتمانية، مدى، أبل باي (Apple Pay)، والتحويل البنكي المباشر. كما نقدم خصماً تشجيعياً قدره 15% عند تسجيل الأخ الثاني أو أكثر، مع توفير خطط دفع شهرية مرنة.',
    aEn: 'We accept Mada, Apple Pay, credit cards, and direct bank transfers. We also provide a 15% discount for second siblings and flexible monthly plans.',
  },
  {
    id: 'faq-7',
    category: 'pricing',
    qAr: 'ما هو الضمان الذهبي لاسترداد الرسوم؟',
    qEn: 'What is the Golden Satisfaction Guarantee?',
    aAr: 'إذا لم تشعر بالرضا التام والفرق الواضح على طفلك خلال أول 14 يوماً من بدء الدراسة، يحق لك تغيير المعلم فوراً أو استرداد كامل الرسوم المتبقية دون أي شروط أو خصومات إدارية.',
    aEn: 'If you are not 100% satisfied within the first 14 days, you may switch instructors immediately or receive a full prorated refund with no administrative penalty.',
  },
  {
    id: 'faq-8',
    category: 'schedule',
    qAr: 'هل المواعيد مناسبة لتوقيت دول الخليج وأوروبا وأمريكا؟',
    qEn: 'Are time slots suitable for Gulf, Europe, and North America time zones?',
    aAr: 'نعم، تمتد فترات التدريس في الأكاديمية على مدار اليوم من الساعة 8:00 صباحاً وحتى 11:00 مساءً بتوقيت مكة المكرمة، لتغطية كافة فروق التوقيت للطلاب في السعودية والخليج ومبتعثي الخارج.',
    aEn: 'Yes! Classes run daily from 8:00 AM to 11:00 PM Makkah time (GMT+3), accommodating families across the Gulf, UK/Europe, and North American time zones.',
  },
];

export const PublicFaqPage: React.FC<PublicFaqPageProps> = ({
  currentLanguage = 'ar',
  onOpenTrial,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const shouldReduceMotion = useReducedMotion();
  const isAr = currentLanguage === 'ar';

  const categories = [
    { id: 'all', label: isAr ? 'جميع الأسئلة' : 'All Questions' },
    { id: 'quran', label: isAr ? 'القرآن والتجويد' : 'Quran & Tajweed' },
    { id: 'arabic', label: isAr ? 'نور البيان والتأسيس' : 'Arabic & Foundation' },
    { id: 'schedule', label: isAr ? 'المواعيد والحصص' : 'Schedule' },
    { id: 'tech', label: isAr ? 'التقنية والزووم' : 'Virtual Tech' },
    { id: 'teachers', label: isAr ? 'الكادر التعليمي' : 'Teachers' },
    { id: 'pricing', label: isAr ? 'الرسوم والضمانات' : 'Tuition & Guarantee' },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATABASE.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const qText = isAr ? item.qAr : item.qEn;
      const aText = isAr ? item.aAr : item.aEn;
      const matchesSearch =
        searchQuery.trim() === '' ||
        qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, isAr]);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

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
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{isAr ? 'مركز المساعدة والأسئلة الشائعة' : 'Help Center & Direct Answers'}</span>
          </motion.div>

          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight text-balance max-w-3xl mx-auto"
          >
            {isAr
              ? 'كل ما تحتاج لمعرفته حول التسجيل والحصص وضمانات التعلم'
              : 'Everything You Need to Know About Enrollment & Classes'}
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed"
          >
            {isAr
              ? 'إجابات واضحة وشفافة عن أكثر التساؤلات تكراراً من أولياء الأمور حول آليات الحصص، المواعيد، الرسوم، والضمان الذهبي للأكاديمية.'
              : 'Comprehensive answers to common questions about schedules, trial sessions, technology, and tuition.'}
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="max-w-xl mx-auto mt-8 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن سؤالك هنا (مثال: الرسوم، زووم، الغياب...)' : 'Search your question here...'}
              className="w-full bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-xl rtl:pr-11 ltr:pl-11 rtl:pl-4 ltr:pr-4 py-3 text-sm text-[#0F2942] dark:text-white shadow-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
            />
          </motion.div>
        </div>
      </section>

      {/* Main FAQ Content */}
      <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111E2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white">
                {isAr ? 'لم نعثر على نتائج مطابقة لبحثك' : 'No matching questions found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? 'جرب البحث بكلمات أخرى أو تواصل مباشرة مع فريق الدعم.' : 'Try different keywords or reach out via WhatsApp.'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openId === faq.id;
              const question = isAr ? faq.qAr : faq.qEn;
              const answer = isAr ? faq.aAr : faq.aEn;

              return (
                <motion.div
                  key={faq.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="bg-white dark:bg-[#111E2E] rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs hover:border-emerald-500/40 transition-colors"
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full text-right rtl:text-right ltr:text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#0F2942] dark:text-white font-display">
                      {question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                          {answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Live Support Callout */}
        <div className="mt-14 p-6 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F2942] dark:text-white font-display">
              {isAr ? 'هل لديك سؤال آخر لم تجد إجابته هنا؟' : 'Still have questions?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md">
              {isAr
                ? 'فريق الاستشارات الأكاديمية متواجد لمساعدتك واقتراح المسار الأمثل لطفلك فوراً.'
                : 'Our education advisory team is ready to assist you right away via WhatsApp.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {getWhatsAppUrl() && (
              <a
                href={getWhatsAppUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'محادثة واتساب مباشرة' : 'Chat on WhatsApp'}</span>
              </a>
            )}

            <button
              onClick={onOpenTrial}
              className="px-4 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#1E3A5F] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#0F2942] font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isAr ? 'حجز الحصة التجريبية' : 'Book Trial Class'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
