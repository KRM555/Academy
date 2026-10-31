import React, { useState } from 'react';
import { Currency } from '../types';
import { Language, translations } from '../data/translations';
import { ACADEMY_PROGRAMS } from '../data/academyData';
import {
  Calendar,
  Clock,
  Check,
  Laptop,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen
} from 'lucide-react';

interface HomeFeaturedServicesProps {
  currentCurrency: Currency;
  currentLanguage: Language;
  onOpenTrial: (programTitle?: string, note?: string) => void;
  onNavigateToPrograms: () => void;
}

export const HomeFeaturedServices: React.FC<HomeFeaturedServicesProps> = ({
  currentCurrency,
  currentLanguage,
  onOpenTrial,
  onNavigateToPrograms,
}) => {
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const [activeModalProgram, setActiveModalProgram] = useState<any | null>(null);

  // Take the 3 flagship educational services for the homepage spotlight
  const featuredPrograms = ACADEMY_PROGRAMS.slice(0, 3);

  const getHighlightBadge = (index: number) => {
    if (index === 0) return { label: t.featuredTagQuran, bg: 'bg-emerald-600 text-white' };
    if (index === 1) return { label: t.featuredTagArabic, bg: 'bg-amber-600 text-white' };
    return { label: t.featuredTagValues, bg: 'bg-purple-600 text-white' };
  };

  return (
    <section className="py-20 bg-[#FAF9F6] dark:bg-[#070E18] transition-colors duration-200 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200/80 dark:border-emerald-850 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.featuredServicesBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight leading-snug">
              {t.featuredServicesTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {t.featuredServicesDesc}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={onNavigateToPrograms}
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#111E2E] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-[#0D9488] dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer text-xs sm:text-sm font-bold"
            >
              <span>{t.btnViewAllCourses}</span>
              <ArrowIcon className="w-4 h-4 transition-transform duration-300 rtl:group-hover:-translate-x-1.5 ltr:group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>

        {/* Featured Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPrograms.map((prog, index) => {
            const convertedPrice = Math.round(prog.priceSar * currentCurrency.rateToSar);
            const installmentAmount = Math.round(convertedPrice / 4);
            const badge = getHighlightBadge(index);

            return (
              <div
                key={prog.id}
                className="group relative bg-white dark:bg-[#111E2E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs hover:shadow-2xl hover:shadow-emerald-950/10 dark:hover:shadow-emerald-500/10 hover:border-emerald-500/50 dark:hover:border-emerald-400/40 transition-all duration-300 ease-out hover:-translate-y-2 flex flex-col justify-between"
              >
                {/* Top Ambient Glow & Accent Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Card Media Header with Zoom & Badges */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={prog.image}
                      alt={prog.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold shadow-sm transition-transform duration-300 group-hover:scale-105 ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1 bg-[#0D9488] text-white px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold shadow-sm">
                        <Laptop className="w-3 h-3" />
                        <span>{isAr ? 'أونلاين 100%' : '100% Online'}</span>
                      </span>
                    </div>

                    {/* Age Bracket Overlay at bottom of image */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white z-10 text-xs">
                      <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl font-bold border border-white/10 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{prog.ageBracket}</span>
                      </span>

                      <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl font-medium border border-white/10 text-[11px] text-emerald-200">
                        {isAr ? 'حلقات مصغرة (1 - 5)' : 'Small Groups (1-5)'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-3.5">
                    <h3 className="text-lg font-bold text-[#0F2942] dark:text-white font-display group-hover:text-[#0D9488] dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-1">
                      {prog.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {prog.subtitle}
                    </p>

                    {/* Class Details Strip */}
                    <div className="pt-2 pb-1 border-y border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400" />
                        <span>{prog.weeklySessions || 3} {isAr ? 'حصص أسبوعياً' : 'classes/wk'}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">•</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400" />
                        <span>{prog.sessionDurationMins || 45} {isAr ? 'دقيقة للحصة' : 'mins/class'}</span>
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 pt-1">
                      {(prog.features || [
                        isAr ? 'حلقات فردية ومصغرة أونلاين' : 'Small virtual online groups',
                        isAr ? 'معلمون مجازون بالقراءات' : 'Certified expert scholars',
                      ]).slice(0, 2).map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Pricing & Action Buttons */}
                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{isAr ? 'الاشتراك الشهري' : 'Monthly Fee'}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black text-[#0F2942] dark:text-white tabular-nums font-mono">
                        {convertedPrice.toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{currentCurrency.symbol}</span>
                    </div>
                    {prog.installmentsEligible && (
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                        {isAr ? `أو ${installmentAmount} ${currentCurrency.symbol} / شهر` : `Or ${installmentAmount} ${currentCurrency.symbol} / mo`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalProgram(prog)}
                      className="px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#16253B] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-200 hover:shadow-2xs cursor-pointer"
                    >
                      {t.btnDetails}
                    </button>
                    <button
                      onClick={() => onOpenTrial(prog.title)}
                      className="px-3.5 py-2.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs hover:shadow-md hover:shadow-emerald-700/20 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      {t.btnEnroll}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Details Modal */}
      {activeModalProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111E2E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModalProgram(null)}
              className="absolute top-4 rtl:left-4 ltr:right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0">
                  <BookOpen className="w-6 h-6 text-[#0D9488] dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#0F2942] dark:text-white font-display">
                    {activeModalProgram.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeModalProgram.subtitle}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeModalProgram.description}
              </div>

              {activeModalProgram.features && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    {isAr ? 'مميزات المسار التعليمي:' : 'Program Features:'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {activeModalProgram.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalProgram.syllabusWeeks && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    {isAr ? 'خطة الشهر الأول (نموذج منهجي):' : 'Month 1 Curriculum Syllabus:'}
                  </h4>
                  <div className="space-y-2">
                    {activeModalProgram.syllabusWeeks.map((wk: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="font-bold text-[#0D9488] dark:text-emerald-400 mb-0.5">
                          {isAr ? `الأسبوع ${wk.week}: ${wk.topic}` : `Week ${wk.week}: ${wk.topic}`}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">{wk.details}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.modalSupervisor} {activeModalProgram.instructorName}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {activeModalProgram.instructorTitle}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const title = activeModalProgram.title;
                    setActiveModalProgram(null);
                    onOpenTrial(title);
                  }}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {t.btnBookSeat}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
