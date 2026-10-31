import React, { useState, useEffect } from 'react';
import { Currency, TimezoneInfo } from '../types';
import { Language, translations } from '../data/translations';
import { ACADEMY_PROGRAMS } from '../data/academyData';
import { CURRENCIES, TIMEZONES } from '../data/academyData';
import { Clock, Calendar, Check, X, Laptop, Globe } from 'lucide-react';

interface ProgramsCatalogProps {
  currentCurrency: Currency;
  onCurrencyChange?: (curr: Currency) => void;
  currentTimezone: TimezoneInfo;
  onTimezoneChange?: (tz: TimezoneInfo) => void;
  onBookProgram: (programTitle: string, planDetails?: string) => void;
  refreshTrigger?: number;
  currentLanguage?: Language;
}

export const ProgramsCatalog: React.FC<ProgramsCatalogProps> = ({
  currentCurrency,
  onCurrencyChange,
  currentTimezone,
  onTimezoneChange,
  onBookProgram,
  refreshTrigger = 0,
  currentLanguage = 'ar',
}) => {
  const [courses, setCourses] = useState<any[]>(ACADEMY_PROGRAMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalProgram, setActiveModalProgram] = useState<any | null>(null);

  const t = translations[currentLanguage];

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.courses?.length > 0) {
          setCourses(data.courses);
        }
      })
      .catch((err) => console.warn('Using fallback courses', err));
  }, [refreshTrigger]);

  const filteredPrograms = courses.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: t.catAll },
    { id: 'quran', label: t.catQuran },
    { id: 'arabic', label: t.catArabic },
    { id: 'values', label: t.catValues },
    { id: 'tech', label: t.catTech },
    { id: 'mothers', label: t.catMothers },
  ];

  return (
    <section className="py-12 bg-[#FAF9F6] dark:bg-[#070E18] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 mb-1">{t.catalogBadge}</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
              {t.catalogTitle}
            </h2>
          </div>
          
          {/* Currency & Timezone Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {onCurrencyChange && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{currentLanguage === 'ar' ? 'العملة:' : 'Currency:'}</span>
                <select
                  value={currentCurrency.code}
                  onChange={(e) => {
                    const found = CURRENCIES.find((c) => c.code === e.target.value);
                    if (found) onCurrencyChange(found);
                  }}
                  className="text-xs font-bold bg-transparent text-[#0F2942] dark:text-white focus:outline-none cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="dark:bg-[#111E2E]">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onTimezoneChange && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{currentLanguage === 'ar' ? 'التوقيت:' : 'Timezone:'}</span>
                <select
                  value={currentTimezone.code}
                  onChange={(e) => {
                    const found = TIMEZONES.find((tz) => tz.code === e.target.value);
                    if (found) onTimezoneChange(found);
                  }}
                  className="text-xs font-bold bg-transparent text-[#0F2942] dark:text-white focus:outline-none cursor-pointer"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.code} value={tz.code} className="dark:bg-[#111E2E]">
                      {tz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#0F2942] dark:bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111E2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const convertedPrice = Math.round(prog.priceSar * currentCurrency.rateToSar);
            const installmentAmount = Math.round(convertedPrice / 4);

            return (
              <div
                key={prog.id}
                className="bg-white dark:bg-[#111E2E] rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-2xl hover:shadow-emerald-950/10 dark:hover:shadow-emerald-500/10 hover:border-emerald-500/50 dark:hover:border-emerald-400/40 transition-all duration-300 ease-out hover:-translate-y-2 flex flex-col justify-between group relative"
              >
                {/* Top accent glow line on hover */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                <div>
                  <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={prog.image}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-xs transition-transform duration-300 group-hover:scale-105">
                      {prog.ageBracket}
                    </div>
                    <div className="absolute top-3 left-3 bg-[#0D9488] text-white px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Laptop className="w-3 h-3" />
                      <span>{currentLanguage === 'ar' ? 'أونلاين 100%' : '100% Online'}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F2942] dark:text-white group-hover:text-[#0D9488] dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-1 font-display">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {prog.subtitle}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400" />
                        <span>{prog.weeklySessions || 3} {currentLanguage === 'ar' ? 'حصص أسبوعياً' : 'classes/wk'}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400" />
                        <span>{prog.sessionDurationMins || 45} {currentLanguage === 'ar' ? 'دقيقة' : 'mins'}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {(prog.features || [
                        currentLanguage === 'ar' ? 'حلقات فردية ومصغرة أونلاين' : 'Small virtual online groups',
                        currentLanguage === 'ar' ? 'معلمون مجازون بالقراءات' : 'Certified expert scholars',
                      ]).slice(0, 2).map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & CTA */}
                <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{currentLanguage === 'ar' ? 'الاشتراك الشهري' : 'Monthly'}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#0F2942] dark:text-white tabular-nums font-mono">
                        {convertedPrice.toLocaleString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{currentCurrency.symbol}</span>
                    </div>
                    {prog.installmentsEligible && (
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        {currentLanguage === 'ar' ? `أو ${installmentAmount} ${currentCurrency.symbol} / شهر` : `Or ${installmentAmount} ${currentCurrency.symbol} / mo`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalProgram(prog)}
                      className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#16253B] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      {t.btnDetails}
                    </button>
                    <button
                      onClick={() => onBookProgram(prog.title)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs hover:shadow-md hover:shadow-emerald-700/20 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      {t.btnEnroll}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Program Details */}
        {activeModalProgram && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111E2E] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
              <button
                onClick={() => setActiveModalProgram(null)}
                className="absolute top-4 rtl:left-4 ltr:right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 mb-1">
                    {activeModalProgram.ageBracket} · {currentLanguage === 'ar' ? 'فصول أونلاين 100%' : '100% Live Online'}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F2942] dark:text-white font-display">
                    {activeModalProgram.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {activeModalProgram.description}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold text-lg font-display shrink-0">
                    {(activeModalProgram.instructorName || 'نور').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">{t.modalSupervisor}</div>
                    <div className="text-sm font-bold text-[#0F2942] dark:text-white">{activeModalProgram.instructorName}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{activeModalProgram.instructorTitle}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.monthlyFee}</div>
                    <div className="text-2xl font-extrabold text-[#0F2942] dark:text-white tabular-nums font-mono">
                      {Math.round(activeModalProgram.priceSar * currentCurrency.rateToSar).toLocaleString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US')}{' '}
                      <span className="text-xs font-semibold">{currentCurrency.symbol}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const title = activeModalProgram.title;
                        setActiveModalProgram(null);
                        onBookProgram(title);
                      }}
                      className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {t.btnBookSeat}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

