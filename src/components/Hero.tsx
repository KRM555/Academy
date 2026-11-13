import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck, BookOpen, Maximize2, X, Compass, Heart, Award } from 'lucide-react';

interface HeroProps {
  onOpenTrial: () => void;
  onExplorePrograms: () => void;
  onExploreAdvisor: () => void;
  currentLanguage?: Language;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenTrial,
  onExplorePrograms,
  onExploreAdvisor,
  currentLanguage = 'ar',
}) => {
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAF9F6] to-[#F3F4F6] dark:from-[#0B1522] dark:via-[#0E1A2B] dark:to-[#070E18] pt-6 sm:pt-10 pb-16 transition-colors duration-200">
      {/* Decorative ambient background glows */}
      <div className="absolute top-12 right-1/4 w-96 h-96 bg-teal-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* 1. FIRST: GRAND EYE-CATCHING OFFICIAL BANNER IMAGE (NO ARTIFICIAL FRAME, FULL 100% CRISP DISPLAY) */}
        <div className="max-w-5xl mx-auto">
          <img
            src="/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg"
            alt={isAr ? 'أكاديمية نور وبيان - معًا نتعلم ونبني المستقبل' : 'Noor & Bayan Academy Official Banner'}
            className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer block mx-auto"
            onClick={() => setIsPreviewOpen(true)}
            loading="eager"
            width={1600}
            height={1067}
          />
        </div>

        {/* 2. SECOND: OFFICIAL "من نحن؟" NARRATIVE & THREE PILLARS (Directly Below the Image) */}
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0D9488] dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/70 px-4 py-1.5 rounded-full border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{isAr ? 'من نحن؟ · هوية ورسالة الأكاديمية' : 'About Us · Noor & Bayan Academy'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2942] dark:text-white tracking-tight leading-[1.25] font-display">
            {isAr ? (
              <>
                من نحن؟ <span className="text-[#0D9488] dark:text-emerald-400">أكاديمية نور وبيان</span>
              </>
            ) : (
              <>
                About Us · <span className="text-[#0D9488] dark:text-emerald-400">Noor & Bayan Academy</span>
              </>
            )}
          </h1>

          {/* 3 Structured Official Cards for the Exact 3 Paragraphs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right rtl:text-right ltr:text-left">
            {/* Paragraph 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-emerald-950/80 text-[#0D9488] dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2942] dark:text-white mb-2">
                  {isAr ? 'الأصالة والحداثة' : 'Heritage & Modernity'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'أكاديمية نور وبيان هي منصة تعليمية إلكترونية متكاملة، تهدف إلى تقديم تعليم متميز يجمع بين الأصالة والحداثة.'
                    : 'Noor & Bayan Academy is a comprehensive online educational platform aimed at providing distinguished education combining authenticity with modernity.'}
                </p>
              </div>
            </div>

            {/* Paragraph 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5 fill-amber-500/20" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2942] dark:text-white mb-2">
                  {isAr ? 'رعاية وتطوير القدرات' : 'Nurturing Potential'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'نؤمن بأن كل طالب يمتلك قدرات خاصة تستحق الرعاية والتطوير، لذلك نوفر برامج تعليمية متنوعة تناسب مختلف الأعمار والمراحل والمناهج الدراسية.'
                    : 'We believe every student possesses unique capabilities worthy of care and development; therefore, we provide diverse educational programs tailored to all ages, stages, and school curricula.'}
                </p>
              </div>
            </div>

            {/* Paragraph 3 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2942] dark:text-white mb-2">
                  {isAr ? 'جيل واعٍ ومبدع' : 'Conscious & Creative Generation'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'نسعى إلى بناء جيل واعٍ، مبدع، متقن للعلم واللغات، وقادر على تحقيق طموحاته.'
                    : 'We strive to build a conscious, creative generation mastering knowledge and languages, capable of achieving its ambitions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Track Badges from the Official Poster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="py-2.5 px-3 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200/80 dark:border-pink-900/60">
              <div className="text-xs sm:text-sm font-bold text-pink-700 dark:text-pink-300">📖 {isAr ? 'قرآن كريم' : 'Holy Quran'}</div>
              <div className="text-[10px] text-pink-600/80 dark:text-pink-400/80">{isAr ? 'حفظ وتجويد متقن' : 'Tajweed & Memorization'}</div>
            </div>
            <div className="py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60">
              <div className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">ض {isAr ? 'لغة عربية' : 'Arabic Language'}</div>
              <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80">{isAr ? 'تأسيس ونور بيان' : 'Noor Al-Bayan'}</div>
            </div>
            <div className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/60">
              <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">🧮 {isAr ? 'رياضيات' : 'Mathematics'}</div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">{isAr ? 'تفكير منطقي وحساب' : 'Logic & Calculations'}</div>
            </div>
            <div className="py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-900/60">
              <div className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300">🌐 {isAr ? 'جميع المواد' : 'All Subjects'}</div>
              <div className="text-[10px] text-purple-600/80 dark:text-purple-400/80">{isAr ? 'متابعة شاملة للمناهج' : 'All Curricula'}</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <button
              onClick={onOpenTrial}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-extrabold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t.btnHeroTrial}</span>
              <ArrowIcon className="w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExplorePrograms}
              className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base font-bold text-[#0F2942] dark:text-slate-100 bg-white dark:bg-[#111E2E] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-5 h-5 text-[#0D9488] dark:text-emerald-400" />
              <span>{t.btnHeroPrograms}</span>
            </button>

            <button
              onClick={onExploreAdvisor}
              className="w-full sm:w-auto px-5 py-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer underline underline-offset-4"
            >
              <span>{t.btnHeroAdvisor}</span>
            </button>
          </div>

          {/* Social Trust Cue */}
          <div className="pt-1 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {isAr ? 'فصول تفاعلية حية أونلاين 100%' : '100% Live Interactive Classes'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{isAr ? 'تجربة مجانية دون أي رسوم مسبقة' : 'Free Trial With No Upfront Fees'}</span>
          </div>
        </div>

        {/* Feature Pillars Strip */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#111E2E]/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-base sm:text-lg font-extrabold text-[#0F2942] dark:text-white font-display">{t.statPillar1Title}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.statPillar1Desc}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#111E2E]/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-base sm:text-lg font-extrabold text-[#0D9488] dark:text-emerald-400 font-display">{t.statPillar2Title}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.statPillar2Desc}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#111E2E]/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-base sm:text-lg font-extrabold text-[#0F2942] dark:text-white font-display">{t.statPillar3Title}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.statPillar3Desc}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#111E2E]/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-base sm:text-lg font-extrabold text-[#0D9488] dark:text-emerald-400 font-display">{t.statPillar4Title}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.statPillar4Desc}</div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 rtl:left-4 ltr:right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src="/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg"
              alt="Noor & Bayan Academy Banner Full View"
              className="w-full h-auto max-h-[85vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
};
