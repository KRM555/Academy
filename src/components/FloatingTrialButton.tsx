import React from 'react';
import { Language, translations } from '../data/translations';
import { CalendarCheck, Sparkles } from 'lucide-react';

interface FloatingTrialButtonProps {
  onOpenTrial: () => void;
  currentLanguage: Language;
  isHidden?: boolean;
}

export const FloatingTrialButton: React.FC<FloatingTrialButtonProps> = ({
  onOpenTrial,
  currentLanguage,
  isHidden = false,
}) => {
  if (isHidden) return null;

  const t = translations[currentLanguage];

  return (
    <div className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-40">
      <button
        onClick={onOpenTrial}
        aria-label={t.floatingTrialBtn}
        className="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-[#0D9488] via-[#0f766e] to-[#0D9488] hover:from-[#0f766e] hover:to-[#0D9488] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-xl shadow-teal-950/25 dark:shadow-black/60 border border-white/20 dark:border-emerald-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-950/40 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer select-none"
      >
        {/* Subtle Pulse Light Dot */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
        </span>

        {/* Icon with interactive bounce on hover */}
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
          <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>

        {/* Label */}
        <span className="tracking-wide whitespace-nowrap font-display">
          {t.floatingTrialBtn}
        </span>

        {/* 100% Free pill tag */}
        <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs group-hover:bg-amber-300 transition-colors">
          <Sparkles className="w-2.5 h-2.5 text-slate-900" />
          <span>{t.floatingTrialBadge}</span>
        </span>
      </button>
    </div>
  );
};
