import React from 'react';
import { Language, translations } from '../data/translations';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Play, BookOpen } from 'lucide-react';

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
  const ArrowIcon = currentLanguage === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAF9F6] to-[#F3F4F6] dark:from-[#0B1522] dark:via-[#0E1A2B] dark:to-[#070E18] pt-10 sm:pt-14 lg:pt-16 pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Subtle Tagline */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0D9488] dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.heroTag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F2942] dark:text-white tracking-tight leading-[1.25] text-balance font-display">
              {t.heroTitlePart1}
              <span className="text-[#0D9488] dark:text-emerald-400">{t.heroTitleHighlight}</span>
              {t.heroTitlePart2}
            </h1>

            {/* Sub-copy */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t.heroDesc}
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.heroCheck1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.heroCheck2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.heroCheck3}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.heroCheck4}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
              <button
                onClick={onOpenTrial}
                className="px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{t.btnHeroTrial}</span>
                <ArrowIcon className="w-4 h-4 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplorePrograms}
                className="px-5 py-3.5 text-sm sm:text-base font-bold text-[#0F2942] dark:text-slate-100 bg-white dark:bg-[#111E2E] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-[#0D9488] dark:text-emerald-400" />
                <span>{t.btnHeroPrograms}</span>
              </button>

              <button
                onClick={onExploreAdvisor}
                className="px-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer underline"
              >
                <span>{t.btnHeroAdvisor}</span>
              </button>
            </div>

            {/* Social Trust Cue */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.heroSatisfaction.split('·')[0]}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t.heroSatisfaction.split('·')[1] || t.heroSatisfaction}</span>
            </div>
          </div>

          {/* Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111E2E]">
              <img
                src="/src/assets/images/hero_arab_kids_learning_1793317241979.jpg"
                alt="Noor & Bayan Academy Online Interactive Live Class"
                className="w-full h-auto object-cover aspect-16/10"
                referrerPolicy="no-referrer"
              />

              <div className="absolute bottom-4 right-4 left-4 bg-white/95 dark:bg-[#111E2E]/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                    <Play className="w-4 h-4 fill-emerald-800 dark:fill-emerald-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{t.liveClassBadge}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.liveClassSub}</div>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-1 rounded-lg">
                  {t.liveClassTag}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Strip */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white tabular-nums font-mono">{t.statGraduates}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{t.statGraduatesLabel}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0D9488] dark:text-emerald-400 tabular-nums font-mono">{t.statTeachers}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{t.statTeachersLabel}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white tabular-nums font-mono">{t.statMode}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{t.statModeLabel}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums font-mono">{t.statSatisfaction}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{t.statSatisfactionLabel}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

