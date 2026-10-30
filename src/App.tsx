import React, { useState, useEffect } from 'react';
import { Currency, TimezoneInfo, UserAuth } from './types';
import { CURRENCIES, TIMEZONES } from './data/academyData';
import { Language, translations } from './data/translations';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PathAdvisor } from './components/PathAdvisor';
import { ProgramsCatalog } from './components/ProgramsCatalog';
import { StudentProgressDemo } from './components/StudentProgressDemo';
import { MothersClub } from './components/MothersClub';
import { AdminTeacherPortal } from './components/AdminTeacherPortal';
import { EnrollmentModal } from './components/EnrollmentModal';
import { LegalPages } from './components/LegalPages';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactForm } from './components/ContactForm';
import { HomeFeaturedServices } from './components/HomeFeaturedServices';
import { Footer } from './components/Footer';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Award, Heart, Check } from 'lucide-react';

export default function App() {
  // Navigation / Active Page State ('home', 'programs', 'advisor', 'progress', 'mothers', 'dashboard', 'privacy', 'terms')
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Global Language state ('ar' | 'en') & Theme State (Dark / Light)
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ar');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Global Currency & Timezone state
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(CURRENCIES[0]);
  const [currentTimezone, setCurrentTimezone] = useState<TimezoneInfo>(TIMEZONES[0]);

  // Auth & Admin/Teacher Session state
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);

  // Enrollment / Trial Class Modal state
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedProgramTitleForBooking, setSelectedProgramTitleForBooking] = useState<string | null>(null);
  const [customBookingNote, setCustomBookingNote] = useState('');
  const [coursesRefreshTrigger, setCoursesRefreshTrigger] = useState(0);

  // Check saved preferences and session on load & sync page from URL hash if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('academy_auth_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      const savedLang = localStorage.getItem('academy_lang') as Language;
      if (savedLang === 'ar' || savedLang === 'en') {
        setCurrentLanguage(savedLang);
      }

      const savedTheme = localStorage.getItem('academy_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      } else if (savedTheme === 'light') {
        setIsDarkMode(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }
    } catch (e) {
      console.warn('Session/preferences parse error', e);
    }

    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'testimonials') {
      setCurrentPage('home');
      setTimeout(() => {
        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (['programs', 'advisor', 'progress', 'mothers', 'dashboard', 'privacy', 'terms'].includes(hash)) {
      setCurrentPage(hash);
    }
  }, []);

  // Synchronize document dir, lang, and dark mode class
  useEffect(() => {
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    try {
      localStorage.setItem('academy_lang', currentLanguage);
    } catch (e) {
      console.warn(e);
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('academy_theme', 'dark');
      } catch (e) {
        console.warn(e);
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('academy_theme', 'light');
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isDarkMode]);

  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navigateTo = (page: string) => {
    if (page === 'testimonials') {
      setCurrentPage('home');
      window.location.hash = '#/testimonials';
      setTimeout(() => {
        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    if (page === 'contact') {
      setCurrentPage('home');
      window.location.hash = '#/contact';
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserAuth) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('academy_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('academy_auth_user');
    } catch (e) {
      console.warn(e);
    }
  };

  const openTrialBooking = (programTitle?: string, note?: string) => {
    setSelectedProgramTitleForBooking(programTitle || null);
    setCustomBookingNote(note || '');
    setIsEnrollmentModalOpen(true);
  };

  const t = translations[currentLanguage];
  const ArrowIcon = currentLanguage === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#070E18] text-[#0F2942] dark:text-slate-100 flex flex-col font-['Tajawal',sans-serif] transition-colors duration-200">
      {/* Top 3-Zone Navigation with Language Switcher and Dark Mode Toggle */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        currentCurrency={currentCurrency}
        onCurrencyChange={setCurrentCurrency}
        currentTimezone={currentTimezone}
        onTimezoneChange={setCurrentTimezone}
        onOpenTrial={() => openTrialBooking()}
        userRole={currentUser?.role}
        onLogout={handleLogout}
        currentLanguage={currentLanguage}
        onToggleLanguage={toggleLanguage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* MULTI-PAGE VIEW ROUTER */}
      <main className="flex-1">
        {/* PAGE 1: HOME (Focused, Airy, Uncluttered) */}
        {currentPage === 'home' && (
          <div>
            <Hero
              onOpenTrial={() => openTrialBooking()}
              onExplorePrograms={() => navigateTo('programs')}
              onExploreAdvisor={() => navigateTo('advisor')}
              currentLanguage={currentLanguage}
            />

            {/* Quick Teaser Cards Strip to explore each separate page */}
            <section className="py-20 bg-white dark:bg-[#0B1522] border-y border-slate-200 dark:border-slate-800 transition-colors duration-200 relative overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-14">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-100 dark:border-emerald-900/60 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{currentLanguage === 'ar' ? 'بوابات التعلم المتكاملة' : 'Integrated Learning Gateways'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight leading-snug">
                    {t.teaserTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {t.teaserDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Programs */}
                  <div
                    onClick={() => navigateTo('programs')}
                    className="p-6 bg-[#FAF9F6] dark:bg-[#111E2E] rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 shadow-xs hover:shadow-2xl hover:shadow-emerald-950/10 dark:hover:shadow-emerald-500/10 transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top ambient color glow on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -top-14 -right-14 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Top Row: Icon & Status Tag */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-950/80 dark:to-teal-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md group-hover:shadow-emerald-500/20">
                          <BookOpen className="w-6 h-6 text-[#0D9488] dark:text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-200/70 dark:border-emerald-850 transition-all duration-200 group-hover:scale-105">
                          {currentLanguage === 'ar' ? '5 مسارات تفاعلية' : '5 Core Tracks'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#0F2942] dark:text-white font-display group-hover:text-[#0D9488] dark:group-hover:text-emerald-400 transition-colors duration-200">
                        {t.teaserProgramsTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                        {t.teaserProgramsDesc}
                      </p>

                      {/* Mini Feature Highlights */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'حلقات مصغرة (1 - 5 أطفال)' : 'Small groups (1-5 children)'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'معلمون مجازون بالقراءات' : 'Certified expert scholars'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between mt-5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 group-hover:text-[#0f766e] dark:group-hover:text-emerald-300 transition-colors">
                        {t.teaserProgramsBtn}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0D9488] dark:text-emerald-400 group-hover:bg-[#0D9488] group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-[#0B1522] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-2xs">
                        <ArrowIcon className="w-3.5 h-3.5 transition-transform duration-300 ease-out rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Advisor */}
                  <div
                    onClick={() => navigateTo('advisor')}
                    className="p-6 bg-[#FAF9F6] dark:bg-[#111E2E] rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-400/50 shadow-xs hover:shadow-2xl hover:shadow-amber-950/10 dark:hover:shadow-amber-500/10 transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top ambient color glow on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -top-14 -right-14 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Top Row: Icon & Status Tag */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-950/80 dark:to-yellow-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md group-hover:shadow-amber-500/20">
                          <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-200/70 dark:border-amber-850 transition-all duration-200 group-hover:scale-105">
                          {currentLanguage === 'ar' ? 'توصية فورية' : 'Instant Match'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#0F2942] dark:text-white font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                        {t.teaserAdvisorTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                        {t.teaserAdvisorDesc}
                      </p>

                      {/* Mini Feature Highlights */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'اقتراح حسب عمر طفلك' : 'Tailored to child age'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'حساب الرسوم بعملتك' : 'Local currency calc'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between mt-5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                        {t.teaserAdvisorBtn}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-500 dark:group-hover:text-[#0B1522] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-2xs">
                        <ArrowIcon className="w-3.5 h-3.5 transition-transform duration-300 ease-out rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Progress */}
                  <div
                    onClick={() => navigateTo('progress')}
                    className="p-6 bg-[#FAF9F6] dark:bg-[#111E2E] rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 shadow-xs hover:shadow-2xl hover:shadow-blue-950/10 dark:hover:shadow-blue-500/10 transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top ambient color glow on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -top-14 -right-14 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Top Row: Icon & Status Tag */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-50 dark:from-blue-950/80 dark:to-sky-900/50 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md group-hover:shadow-blue-500/20">
                          <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-xl border border-blue-200/70 dark:border-blue-850 transition-all duration-200 group-hover:scale-105">
                          {currentLanguage === 'ar' ? 'تقارير وتسجيلات' : 'Live Reports'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#0F2942] dark:text-white font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {t.teaserProgressTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                        {t.teaserProgressDesc}
                      </p>

                      {/* Mini Feature Highlights */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'سجل السور والتسجيل الصوتي' : 'Surah tracker & audio notes'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'شهادات إتمام الحفظ والتفوق' : 'Certificates & badges'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between mt-5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {t.teaserProgressBtn}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-[#0B1522] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-2xs">
                        <ArrowIcon className="w-3.5 h-3.5 transition-transform duration-300 ease-out rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Mothers */}
                  <div
                    onClick={() => navigateTo('mothers')}
                    className="p-6 bg-[#FAF9F6] dark:bg-[#111E2E] rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-rose-500/50 dark:hover:border-rose-400/50 shadow-xs hover:shadow-2xl hover:shadow-rose-950/10 dark:hover:shadow-rose-500/10 transition-all duration-300 ease-out hover:-translate-y-2 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top ambient color glow on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -top-14 -right-14 w-32 h-32 bg-rose-500/10 dark:bg-rose-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Top Row: Icon & Status Tag */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950/80 dark:to-pink-900/50 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md group-hover:shadow-rose-500/20">
                          <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-xl border border-rose-200/70 dark:border-rose-850 transition-all duration-200 group-hover:scale-105">
                          {currentLanguage === 'ar' ? 'استشارات خاصة' : 'Mothers Oasis'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#0F2942] dark:text-white font-display group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-200">
                        {t.teaserMothersTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                        {t.teaserMothersDesc}
                      </p>

                      {/* Mini Feature Highlights */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'علاج العناد ونوبات الغضب' : 'Tantrums & behavior counsel'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{currentLanguage === 'ar' ? 'تقليص وقت الأجهزة والشاشات' : 'Screen time reduction'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between mt-5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                        {t.teaserMothersBtn}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-500 dark:group-hover:text-[#0B1522] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-2xs">
                        <ArrowIcon className="w-3.5 h-3.5 transition-transform duration-300 ease-out rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Educational Services & Courses */}
            <HomeFeaturedServices
              currentCurrency={currentCurrency}
              currentLanguage={currentLanguage}
              onOpenTrial={(programTitle, note) => openTrialBooking(programTitle, note)}
              onNavigateToPrograms={() => navigateTo('programs')}
            />

            {/* Testimonials Section: Real Stories from Parents & Students */}
            <TestimonialsSection
              currentLanguage={currentLanguage}
              onOpenTrial={() => openTrialBooking()}
            />

            {/* Contact Section: Inquiries & Form */}
            <ContactForm currentLanguage={currentLanguage} />
          </div>
        )}

        {/* PAGE 2: PROGRAMS CATALOG */}
        {currentPage === 'programs' && (
          <ProgramsCatalog
            currentCurrency={currentCurrency}
            currentTimezone={currentTimezone}
            onBookProgram={(programTitle) => openTrialBooking(programTitle)}
            refreshTrigger={coursesRefreshTrigger}
            currentLanguage={currentLanguage}
          />
        )}

        {/* PAGE 3: INTERACTIVE PATH ADVISOR */}
        {currentPage === 'advisor' && (
          <PathAdvisor
            currentCurrency={currentCurrency}
            currentTimezone={currentTimezone}
            onSelectProgramAndBook={(programTitle, planDetails) => openTrialBooking(programTitle, planDetails)}
            currentLanguage={currentLanguage}
          />
        )}

        {/* PAGE 4: STUDENT PROGRESS DEMO */}
        {currentPage === 'progress' && <StudentProgressDemo currentLanguage={currentLanguage} />}

        {/* PAGE 5: MOTHERS OASIS */}
        {currentPage === 'mothers' && (
          <MothersClub
            onOpenConsultation={() =>
              openTrialBooking(
                currentLanguage === 'ar' ? 'واحة الأمهات والاستشارات الأسرية' : "Mothers' Oasis & Family Consultation",
                currentLanguage === 'ar' ? 'طلب استشارة فردية للأم' : 'Individual mother consultation request'
              )
            }
            currentLanguage={currentLanguage}
          />
        )}

        {/* PAGE 6: ADMIN & TEACHER DASHBOARD (Dedicated Standalone Page) */}
        {currentPage === 'dashboard' && (
          <AdminTeacherPortal
            isFullPage={true}
            onNavigateHome={() => navigateTo('home')}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onCoursesUpdated={() => setCoursesRefreshTrigger((prev) => prev + 1)}
          />
        )}

        {/* PAGE 7: PRIVACY POLICY */}
        {currentPage === 'privacy' && (
          <LegalPages type="privacy" onBack={() => navigateTo('home')} currentLanguage={currentLanguage} />
        )}

        {/* PAGE 8: TERMS AND CONDITIONS */}
        {currentPage === 'terms' && (
          <LegalPages type="terms" onBack={() => navigateTo('home')} currentLanguage={currentLanguage} />
        )}
      </main>

      {/* Trial Class Modal (accessible from any page) */}
      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        preSelectedProgramTitle={selectedProgramTitleForBooking}
        customNote={customBookingNote}
        currentLanguage={currentLanguage}
      />

      {/* Footer (Always accessible, links to all pages and legal terms) */}
      <Footer
        onNavigate={navigateTo}
        onOpenTrial={() => openTrialBooking()}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}

