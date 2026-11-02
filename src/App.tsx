import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Currency, TimezoneInfo, UserAuth } from './types';
import { CURRENCIES, TIMEZONES } from './data/academyData';
import { Language, translations } from './data/translations';
import { api } from './services/api';
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
import { HowItWorks } from './components/HowItWorks';
import { FaqSection } from './components/FaqSection';
import { NotFoundPage } from './components/NotFoundPage';
import { FloatingTrialButton } from './components/FloatingTrialButton';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, Award, Heart, Check } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Check saved preferences and verify session with server on load
  useEffect(() => {
    // Verify session via httpOnly cookie on boot
    api.auth.getMe().then((res) => {
      if (res.user) {
        setCurrentUser(res.user);
      }
    }).catch(() => {});

    try {
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
      console.warn('Preferences parse error', e);
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

  // Sync document title per route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = currentLanguage === 'ar'
        ? 'أكاديمية نور وبيان | تعليم القرآن واللغة والقيم للأطفال'
        : 'Noor & Bayan Academy | Quran, Arabic & Values for Kids';
    } else if (path === '/programs') {
      document.title = currentLanguage === 'ar'
        ? 'البرامج والمناهج | أكاديمية نور وبيان'
        : 'Programs & Curriculum | Noor & Bayan Academy';
    } else if (path === '/advisor') {
      document.title = currentLanguage === 'ar'
        ? 'مستشار المسار التعليمي | أكاديمية نور وبيان'
        : 'Learning Path Advisor | Noor & Bayan Academy';
    } else if (path === '/mothers') {
      document.title = currentLanguage === 'ar'
        ? 'واحة الأمهات والاستشارات التربوية | أكاديمية نور وبيان'
        : "Mothers' Oasis & Guidance | Noor & Bayan Academy";
    } else if (path === '/progress') {
      document.title = currentLanguage === 'ar'
        ? 'لوحة إنجاز الطفل | أكاديمية نور وبيان'
        : 'Student Progress Demo | Noor & Bayan Academy';
    } else if (path === '/contact') {
      document.title = currentLanguage === 'ar'
        ? 'تواصل معنا | أكاديمية نور وبيان'
        : 'Contact Us | Noor & Bayan Academy';
    } else if (path === '/portal' || path === '/dashboard') {
      document.title = currentLanguage === 'ar'
        ? 'بوابة المعلم والإدارة | أكاديمية نور وبيان'
        : 'Staff & Teacher Portal | Noor & Bayan Academy';
    } else if (path === '/privacy') {
      document.title = currentLanguage === 'ar'
        ? 'سياسة الخصوصية | أكاديمية نور وبيان'
        : 'Privacy Policy | Noor & Bayan Academy';
    } else if (path === '/terms') {
      document.title = currentLanguage === 'ar'
        ? 'الشروط والأحكام | أكاديمية نور وبيان'
        : 'Terms & Conditions | Noor & Bayan Academy';
    } else {
      document.title = currentLanguage === 'ar'
        ? 'الصفحة غير موجودة | أكاديمية نور وبيان'
        : 'Page Not Found | Noor & Bayan Academy';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, currentLanguage]);

  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navigateTo = (target: string) => {
    if (target === 'home' || target === '/') {
      navigate('/');
    } else if (target === 'testimonials') {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'dashboard' || target === 'portal') {
      navigate('/portal');
    } else if (target.startsWith('/')) {
      navigate(target);
    } else {
      navigate(`/${target}`);
    }
  };

  const handleLoginSuccess = (user: UserAuth) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Continue client cleanup
    }
    setCurrentUser(null);
  };

  const openTrialBooking = (programTitle?: string, note?: string) => {
    setSelectedProgramTitleForBooking(programTitle || null);
    setCustomBookingNote(note || '');
    setIsEnrollmentModalOpen(true);
  };

  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const currentNavPage = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');

  // 4 high-intent gateways for the homepage
  const teaserCards = [
    {
      id: 'programs',
      title: t.teaserProgramsTitle,
      desc: t.teaserProgramsDesc,
      badge: isAr ? '5 مسارات تفاعلية' : '5 Core Tracks',
      icon: BookOpen,
      btn: t.teaserProgramsBtn,
      highlights: [
        isAr ? 'حلقات مصغرة (1 - 5 أطفال)' : 'Small groups (1-5 children)',
        isAr ? 'معلمون مجازون متخصصون' : 'Certified expert scholars',
      ],
    },
    {
      id: 'advisor',
      title: t.teaserAdvisorTitle,
      desc: t.teaserAdvisorDesc,
      badge: isAr ? 'توصية فورية' : 'Instant Match',
      icon: Sparkles,
      btn: t.teaserAdvisorBtn,
      highlights: [
        isAr ? 'اقتراح حسب عمر طفلك' : 'Tailored to child age',
        isAr ? 'حساب الرسوم بعملتك' : 'Local currency calc',
      ],
    },
    {
      id: 'progress',
      title: t.teaserProgressTitle,
      desc: t.teaserProgressDesc,
      badge: isAr ? 'تقارير ومتابعة' : 'Progress Reports',
      icon: Award,
      btn: t.teaserProgressBtn,
      highlights: [
        isAr ? 'سجل السور والمتابعة' : 'Surah tracker & notes',
        isAr ? 'شهادات إتمام الحفظ' : 'Certificates & badges',
      ],
    },
    {
      id: 'mothers',
      title: t.teaserMothersTitle,
      desc: t.teaserMothersDesc,
      badge: isAr ? 'استشارات خاصة' : 'Mothers Oasis',
      icon: Heart,
      btn: t.teaserMothersBtn,
      highlights: [
        isAr ? 'استشارات تربوية متخصصة' : 'Educational counseling',
        isAr ? 'تقليص وقت الشاشات' : 'Screen time reduction',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#070E18] text-[#0F2942] dark:text-slate-100 flex flex-col font-['Tajawal',sans-serif] transition-colors duration-200">
      {/* Streamlined, single-tier ~64px tall Navbar */}
      <Navbar
        currentPage={currentNavPage}
        onNavigate={navigateTo}
        onOpenTrial={() => openTrialBooking()}
        userRole={currentUser?.role}
        onLogout={handleLogout}
        currentLanguage={currentLanguage}
        onToggleLanguage={toggleLanguage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        <ErrorBoundary key={location.pathname} currentLanguage={currentLanguage}>
          <Routes>
          {/* HOME ROUTE */}
          <Route
            path="/"
            element={
              <div>
                <Hero
                  onOpenTrial={() => openTrialBooking()}
                  onExplorePrograms={() => navigateTo('programs')}
                  onExploreAdvisor={() => navigateTo('advisor')}
                  currentLanguage={currentLanguage}
                />

                {/* Gateway Cards Strip */}
                <section className="py-16 bg-white dark:bg-[#0B1522] border-y border-slate-200 dark:border-slate-800 transition-colors duration-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-100 dark:border-emerald-900/60">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isAr ? 'بوابات التعلم المتكاملة' : 'Integrated Learning Gateways'}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
                        {t.teaserTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
                        {t.teaserDesc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {teaserCards.map((card) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.id}
                            onClick={() => navigateTo(card.id)}
                            className="p-5 bg-[#FAF9F6] dark:bg-[#111E2E] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-[#0D9488] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200/70 dark:border-emerald-800">
                                  {card.badge}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-[#0F2942] dark:text-white font-display group-hover:text-[#0D9488] dark:group-hover:text-emerald-400 transition-colors">
                                {card.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-2">
                                {card.desc}
                              </p>

                              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                                {card.highlights.map((item, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="pt-3 flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold text-[#0D9488] dark:text-emerald-400">
                                {card.btn}
                              </span>
                              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0D9488] dark:text-emerald-400 group-hover:bg-[#0D9488] group-hover:text-white flex items-center justify-center transition-colors">
                                <ArrowIcon className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* How a Trial Class Works (3 Steps) */}
                <HowItWorks currentLanguage={currentLanguage} onOpenTrial={() => openTrialBooking()} />

                {/* Featured Educational Services & Courses */}
                <HomeFeaturedServices
                  currentCurrency={currentCurrency}
                  currentLanguage={currentLanguage}
                  onOpenTrial={(programTitle, note) => openTrialBooking(programTitle, note)}
                  onNavigateToPrograms={() => navigateTo('programs')}
                />

                {/* FAQ Section */}
                <FaqSection currentLanguage={currentLanguage} />

                {/* Testimonials Section (renders null if empty) */}
                <TestimonialsSection
                  currentLanguage={currentLanguage}
                  onOpenTrial={() => openTrialBooking()}
                />

                {/* Contact Section */}
                <ContactForm currentLanguage={currentLanguage} />
              </div>
            }
          />

          {/* PROGRAMS CATALOG */}
          <Route
            path="/programs"
            element={
              <ProgramsCatalog
                currentCurrency={currentCurrency}
                onCurrencyChange={setCurrentCurrency}
                currentTimezone={currentTimezone}
                onTimezoneChange={setCurrentTimezone}
                onBookProgram={(programTitle) => openTrialBooking(programTitle)}
                refreshTrigger={coursesRefreshTrigger}
                currentLanguage={currentLanguage}
              />
            }
          />

          {/* PATH ADVISOR */}
          <Route
            path="/advisor"
            element={
              <PathAdvisor
                currentCurrency={currentCurrency}
                currentTimezone={currentTimezone}
                onSelectProgramAndBook={(programTitle, planDetails) => openTrialBooking(programTitle, planDetails)}
                currentLanguage={currentLanguage}
              />
            }
          />

          {/* STUDENT PROGRESS DEMO */}
          <Route
            path="/progress"
            element={<StudentProgressDemo currentLanguage={currentLanguage} />}
          />

          {/* MOTHERS OASIS */}
          <Route
            path="/mothers"
            element={
              <MothersClub
                onOpenConsultation={() =>
                  openTrialBooking(
                    isAr ? 'واحة الأمهات والاستشارات الأسرية' : "Mothers' Oasis & Family Consultation",
                    isAr ? 'طلب استشارة فردية للأم' : 'Individual mother consultation request'
                  )
                }
                currentLanguage={currentLanguage}
              />
            }
          />

          {/* CONTACT PAGE */}
          <Route
            path="/contact"
            element={<ContactForm currentLanguage={currentLanguage} />}
          />

          {/* ADMIN & TEACHER PORTAL */}
          <Route
            path="/portal"
            element={
              <AdminTeacherPortal
                isFullPage={true}
                onNavigateHome={() => navigateTo('home')}
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onCoursesUpdated={() => setCoursesRefreshTrigger((prev) => prev + 1)}
              />
            }
          />
          {/* Legacy alias for /portal */}
          <Route
            path="/dashboard"
            element={
              <AdminTeacherPortal
                isFullPage={true}
                onNavigateHome={() => navigateTo('home')}
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onCoursesUpdated={() => setCoursesRefreshTrigger((prev) => prev + 1)}
              />
            }
          />

          {/* PRIVACY POLICY */}
          <Route
            path="/privacy"
            element={
              <LegalPages type="privacy" onBack={() => navigateTo('home')} currentLanguage={currentLanguage} />
            }
          />

          {/* TERMS AND CONDITIONS */}
          <Route
            path="/terms"
            element={
              <LegalPages type="terms" onBack={() => navigateTo('home')} currentLanguage={currentLanguage} />
            }
          />

          {/* 404 NOT FOUND */}
          <Route
            path="*"
            element={<NotFoundPage currentLanguage={currentLanguage} />}
          />
        </Routes>
        </ErrorBoundary>
      </main>

      {/* Trial Class Modal (accessible from any page) */}
      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        preSelectedProgramTitle={selectedProgramTitleForBooking}
        customNote={customBookingNote}
        currentLanguage={currentLanguage}
      />

      {/* Floating 'Book a Trial' Quick Action Button */}
      <FloatingTrialButton
        onOpenTrial={() => openTrialBooking()}
        currentLanguage={currentLanguage}
        isHidden={isEnrollmentModalOpen}
      />

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenTrial={() => openTrialBooking()}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
