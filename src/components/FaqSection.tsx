import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqSectionProps {
  currentLanguage: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 },
    { q: t.faqQ5, a: t.faqA5 },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-[#FAF9F6] dark:bg-[#070E18] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-[#0D9488] dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-100 dark:border-emerald-900/60">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{currentLanguage === 'ar' ? 'شفافية وإجابات مباشرة' : 'Transparency & Direct Answers'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
            {t.faqTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#111E2E] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-right rtl:text-right ltr:text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#0F2942] dark:text-white font-display">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0D9488] dark:text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
