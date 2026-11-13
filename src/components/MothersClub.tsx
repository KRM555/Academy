import React from 'react';
import { Language, translations } from '../data/translations';
import { Heart, Sparkles, CheckCircle2, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getWhatsAppUrl } from '../config/siteConfig';

interface MothersClubProps {
  onOpenConsultation: () => void;
  currentLanguage?: Language;
}

export const MothersClub: React.FC<MothersClubProps> = ({ onOpenConsultation, currentLanguage = 'ar' }) => {
  const t = translations[currentLanguage];
  const ArrowIcon = currentLanguage === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="mothers-club" className="py-16 bg-[#FAF9F6] dark:bg-[#070E18] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111E2E]">
              <img
                src="/images/mothers_educational_session_1793317242529.jpg"
                alt="Mothers Educational Consultation Session"
                className="w-full h-auto object-cover aspect-4/3"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            {/* Stat bubble */}
            <div className="absolute -bottom-4 rtl:right-6 ltr:left-6 bg-white dark:bg-[#16253B] p-3.5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Heart className="w-5 h-5 fill-amber-600 dark:fill-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F2942] dark:text-white">
                  {currentLanguage === 'ar' ? '+2,800 أم ومربية مستفيدة' : '+2,800 Supported Mothers'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentLanguage === 'ar' ? 'استشارات أسبوعية ومجتمع دعم مستمر' : 'Weekly counseling & peer support circles'}
                </div>
              </div>
            </div>
          </div>

          {/* Copy Column */}
          <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.mothersBadge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white leading-tight font-display">
              {t.mothersTitle}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.mothersDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.mothersPoint1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.mothersPoint2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.mothersPoint3}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.mothersPoint4}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onOpenConsultation}
                className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.btnMothersBook}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
              {getWhatsAppUrl(
                currentLanguage === 'ar'
                  ? 'السلام عليكم، أود الانضمام لمجتمع واحة الأمهات'
                  : 'Hello, I would like to join the Mothers Oasis community'
              ) && (
                <a
                  href={getWhatsAppUrl(
                    currentLanguage === 'ar'
                      ? 'السلام عليكم، أود الانضمام لمجتمع واحة الأمهات'
                      : 'Hello, I would like to join the Mothers Oasis community'
                  )!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.btnMothersCommunity}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

