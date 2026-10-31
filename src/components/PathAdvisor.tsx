import React, { useState } from 'react';
import { Currency, TimezoneInfo } from '../types';
import { Language, translations } from '../data/translations';
import { Sparkles, Clock, Check, ArrowLeft, ArrowRight, MessageCircle, Laptop } from 'lucide-react';
import { getWhatsAppUrl } from '../config/siteConfig';

interface PathAdvisorProps {
  currentCurrency: Currency;
  currentTimezone: TimezoneInfo;
  onSelectProgramAndBook: (programTitle: string, planDetails: string) => void;
  currentLanguage?: Language;
}

export const PathAdvisor: React.FC<PathAdvisorProps> = ({
  currentCurrency,
  currentTimezone,
  onSelectProgramAndBook,
  currentLanguage = 'ar',
}) => {
  const [selectedAge, setSelectedAge] = useState<number>(6);
  const [selectedGoal, setSelectedGoal] = useState<string>('quran');
  const [preferredPace, setPreferredPace] = useState<'standard' | 'intensive'>('standard');

  const t = translations[currentLanguage];
  const ArrowIcon = currentLanguage === 'ar' ? ArrowLeft : ArrowRight;

  const getRecommendation = () => {
    const isAr = currentLanguage === 'ar';
    if (selectedGoal === 'quran') {
      return {
        title: isAr
          ? 'مسار نور يتلى لتحفيظ القرآن والتجويد العملي (أونلاين 100%)'
          : 'Recited Light Path: Quran Memorization & Tajweed (100% Online)',
        description: isAr
          ? 'خطة حفظ تدريجية تبدأ من قصار السور مع تصحيح مخارج الحروف وأحكام التلاوة عبر فصول زوم المصغرة.'
          : 'A progressive memorization plan starting from short Surahs with articulation mastery in small Zoom circles.',
        baseSar: preferredPace === 'intensive' ? 360 : 280,
        sessionsPerWeek: preferredPace === 'intensive' ? 4 : 3,
        durationMins: 45,
        milestones: isAr
          ? ['إتقان مخارج الحروف الهجائية بالترتيل', 'حفظ جزء عم مع التفسير التربوي المبسط', 'وسام القارئ الصغير المعتمد']
          : ['Accurate Arabic letter articulation with Tajweed', 'Juz Amma memorization with simplified meanings', 'Certified Junior Reciter Badge'],
        suitableNote: selectedAge <= 6
          ? (isAr ? 'مصمم بحصص تفاعلية وتكرار نغمي محبب يناسب البراعم' : 'Designed with melodic repetition and fun interactive games for young buds')
          : (isAr ? 'يشمل مسابقات تحفيظ تفاعلية وأنشطة تدبر قصص القرآن' : 'Includes interactive memorization challenges and Quranic story reflections'),
      };
    }

    if (selectedGoal === 'reading' || selectedGoal === 'nooraniyah' || (selectedAge <= 6 && selectedGoal !== 'tech')) {
      return {
        title: isAr
          ? 'مسار التأسيس اللغوي والقراءة السليمة والتهجئة (أونلاين 100%)'
          : 'Arabic Reading Foundations & Fluency Path (100% Online)',
        description: isAr
          ? 'تأسيس الطفل في قراءة الكلمات والآيات بطلاقة وسرعة من خلال أحدث الأساليب التفاعلية ومخارج الحروف بحصص مرئية حية.'
          : 'Foundational Arabic reading through interactive phonics and letter articulation in live online classrooms.',
        baseSar: preferredPace === 'intensive' ? 320 : 240,
        sessionsPerWeek: preferredPace === 'intensive' ? 4 : 3,
        durationMins: 40,
        milestones: isAr
          ? ['نطق الحروف بحركاتها وسكناتها بدقة ومخارج نقية', 'قراءة الكلمات المركبة بدون تعثر', 'التهجئة السريعة لمفردات المصحف الشريف']
          : ['Accurate pronunciation of vowel marks (Harakaat)', 'Fluent reading of compound Arabic words', 'Rapid phonetic decoding of Quranic verses'],
        suitableNote: isAr ? 'مثالي للأطفال قبل سن المدرسة والصفوف المبكرة للتفوق الدراسي الفوري' : 'Ideal for preschoolers and early elementary children for accelerated reading mastery',
      };
    }

    if (selectedGoal === 'values') {
      return {
        title: isAr
          ? 'مسار "آية وحكاية" لبناء القيم وتعديل السلوك (أونلاين 100%)'
          : '"Ayah & Story": Islamic Values & Character Path (100% Online)',
        description: isAr
          ? 'غرس الأخلاق الإسلامية وتعديل السلوك اليومي عبر قصص الأنبياء والتطبيقات الحياتية الشيقة.'
          : 'Nurturing Islamic morals and refining everyday behavior through engaging prophetic stories.',
        baseSar: 220,
        sessionsPerWeek: 2,
        durationMins: 50,
        milestones: isAr
          ? ['مبادئ بر الوالدين والأمانة والصدق', 'تفريغ طاقة الغضب وإدارة العناد بوعي', 'مشروع إحسان أسبوعي داخل الأسرة']
          : ['Filial piety, honesty, and trustworthiness', 'Anger regulation and emotional calm', 'Weekly family Ihsan action projects'],
        suitableNote: isAr ? 'جلسات حوارية وقصصية ملهمة تلامس وجدان الطفل بعيداً عن أسلوب التلقين الجاف' : 'Heart-to-heart narrative discussions that inspire children beyond traditional lecturing',
      };
    }

    return {
      title: isAr
        ? 'مسار نادي رواد المستقبل (البرمجة والذكاء الاصطناعي أونلاين)'
        : 'Future Pioneers Club: Coding & AI for Kids (100% Online)',
      description: isAr
        ? 'تعليم التفكير الخوارزمي وصناعة الألعاب والبرمجة بلغات Scratch وبايثون المبسطة.'
        : 'Algorithmic thinking, game design, and visual coding with Scratch and simplified Python.',
      baseSar: 340,
      sessionsPerWeek: 2,
      durationMins: 60,
      milestones: isAr
        ? ['صناعة لعبتين تفاعليتين بنفسه', 'فهم منطق البرمجة وحل المشكلات الحياتية', 'شهادة مبرمج ناشئ من الأكاديمية']
        : ['Building 2 complete interactive games', 'Computational problem solving skills', 'Junior Coder Certificate from Academy'],
      suitableNote: isAr ? 'مخصص لبناء العقلية التحليلية واستثمار وقت الشاشات في شيء مفيد ومبتكر' : 'Transforms passive screen time into constructive, creative engineering skills',
    };
  };

  const rec = getRecommendation();
  const convertedPrice = Math.round(rec.baseSar * currentCurrency.rateToSar);
  const installmentPrice = Math.round(convertedPrice / 4);

  return (
    <section className="py-12 bg-white dark:bg-[#0B1522] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] dark:text-emerald-400 mb-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.advisorBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
            {t.advisorTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            {t.advisorDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Deck */}
          <div className="lg:col-span-6 bg-[#FAF9F6] dark:bg-[#111E2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.stepAge}</label>
                <span className="text-base font-extrabold text-[#0D9488] dark:text-emerald-400 tabular-nums font-mono">
                  {selectedAge} {currentLanguage === 'ar' ? 'سنوات' : 'years'}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="14"
                value={selectedAge}
                onChange={(e) => setSelectedAge(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                <span>4 {currentLanguage === 'ar' ? 'سنوات' : 'yrs'}</span>
                <span>8 {currentLanguage === 'ar' ? 'سنوات' : 'yrs'}</span>
                <span>14 {currentLanguage === 'ar' ? 'سنة' : 'yrs'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">{t.stepGoal}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'quran',
                    title: currentLanguage === 'ar' ? 'تحفيظ القرآن وتجويده' : 'Quran & Tajweed',
                    sub: currentLanguage === 'ar' ? 'مخارج صحيحة وترتيل متقن' : 'Precise recitation & rules',
                  },
                  {
                    id: 'reading',
                    title: currentLanguage === 'ar' ? 'التأسيس اللغوي والقراءة السليمة' : 'Reading & Phonics Foundations',
                    sub: currentLanguage === 'ar' ? 'تأسيس القراءة والطلاقة والتهجئة' : 'Letter articulation & decoding',
                  },
                  {
                    id: 'values',
                    title: currentLanguage === 'ar' ? 'غرس القيم وتعديل السلوك' : 'Islamic Values & Behavior',
                    sub: currentLanguage === 'ar' ? 'قصص الأنبياء وبناء الشخصية' : 'Prophetic stories & ethics',
                  },
                  {
                    id: 'tech',
                    title: currentLanguage === 'ar' ? 'البرمجة والذكاء الاصطناعي' : 'Kids Coding & AI',
                    sub: currentLanguage === 'ar' ? 'تفكير منطقي وصناعة ألعاب' : 'Logic & game design',
                  },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-3 rtl:text-right ltr:text-left rounded-2xl border transition-all text-xs cursor-pointer ${
                      selectedGoal === goal.id
                        ? 'border-[#0D9488] bg-emerald-50 dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-300 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#16253B] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold">{goal.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{goal.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{t.stepPace}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreferredPace('standard')}
                  className={`py-2.5 px-3 text-xs rounded-xl font-bold border text-center transition-all cursor-pointer ${
                    preferredPace === 'standard'
                      ? 'bg-[#0F2942] dark:bg-emerald-700 text-white border-[#0F2942] dark:border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-[#16253B] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {t.paceStandard}
                </button>
                <button
                  onClick={() => setPreferredPace('intensive')}
                  className={`py-2.5 px-3 text-xs rounded-xl font-bold border text-center transition-all cursor-pointer ${
                    preferredPace === 'intensive'
                      ? 'bg-[#0F2942] dark:bg-emerald-700 text-white border-[#0F2942] dark:border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-[#16253B] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {t.paceIntensive}
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-6 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/30 dark:from-[#0E2033] dark:via-[#111E2E] dark:to-[#182B42] p-6 sm:p-8 rounded-3xl border-2 border-emerald-600/30 dark:border-emerald-500/40 shadow-md relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{currentLanguage === 'ar' ? 'فصول أونلاين 100% عبر زوم' : '100% Live Online via Zoom'}</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {currentTimezone.offsetLabel}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#0F2942] dark:text-white font-display">
              {rec.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {rec.description}
            </p>

            <div className="mt-4 p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="font-bold text-[#0D9488] dark:text-emerald-400">{t.expertNote}</span>
              <span>{rec.suitableNote}</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.expectedOutcomes}</div>
              {rec.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t.monthlyFee}</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white tabular-nums font-mono">
                    {convertedPrice.toLocaleString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{currentCurrency.symbol}</span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {t.orInstallments} <span className="font-bold">{installmentPrice} {currentCurrency.symbol}</span> {t.monthly}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onSelectProgramAndBook(rec.title, `Age: ${selectedAge} - Pace: ${preferredPace}`)}
                  className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{t.btnBookAdvisor}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
                {getWhatsAppUrl(`Inquiry: ${rec.title} for child age ${selectedAge}`) && (
                  <a
                    href={getWhatsAppUrl(`Inquiry: ${rec.title} for child age ${selectedAge}`)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.btnWaAdvisor}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

