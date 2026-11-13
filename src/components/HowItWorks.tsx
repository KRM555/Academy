import React from 'react';
import { Language, translations } from '../data/translations';
import { CalendarCheck, Video, FileCheck, ArrowLeft, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  currentLanguage: Language;
  onOpenTrial: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ currentLanguage, onOpenTrial }) => {
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const steps = [
    {
      num: t.howStep1Num,
      title: t.howStep1Title,
      desc: t.howStep1Desc,
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      num: t.howStep2Num,
      title: t.howStep2Title,
      desc: t.howStep2Desc,
      icon: Video,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
    },
    {
      num: t.howStep3Num,
      title: t.howStep3Title,
      desc: t.howStep3Desc,
      icon: FileCheck,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/60 dark:border-teal-800/60',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-[#0B1522] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] dark:text-emerald-400">
            {isAr ? 'خطوات سهلة ومضمونة' : 'Simple & Transparent'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white mt-1.5 font-display">
            {t.howTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5">
            {t.howSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#FAF9F6] dark:bg-[#111E2E] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.bg}`}>
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">
                      0{step.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0F2942] dark:text-white font-display">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-[#0D9488] dark:text-emerald-400 flex items-center gap-1">
                  <span>{isAr ? 'بدون أي التزام مالي' : 'Zero obligation'}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onOpenTrial}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <span>{t.btnTrial}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
