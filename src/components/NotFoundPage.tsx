import React from 'react';
import { Link } from 'react-router-dom';
import { Language, translations } from '../data/translations';
import { Compass, Home } from 'lucide-react';

interface NotFoundPageProps {
  currentLanguage: Language;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white dark:bg-[#111E2E] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 dark:border-amber-800/60">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white font-display mb-2">
          {t.notFoundTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {t.notFoundDesc}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all"
        >
          <Home className="w-4 h-4" />
          <span>{t.notFoundBtn}</span>
        </Link>
      </div>
    </div>
  );
};
