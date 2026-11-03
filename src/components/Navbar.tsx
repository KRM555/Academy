import React, { useState } from 'react';
import { Currency, TimezoneInfo } from '../types';
import { Language, translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import {
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenTrial: () => void;
  userRole?: 'admin' | 'teacher' | null;
  onLogout?: () => void;
  currentLanguage: Language;
  onToggleLanguage: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentCurrency?: Currency;
  onCurrencyChange?: (curr: Currency) => void;
  currentTimezone?: TimezoneInfo;
  onTimezoneChange?: (tz: TimezoneInfo) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenTrial,
  userRole,
  currentLanguage,
  onToggleLanguage,
  isDarkMode,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLanguage];

  // Clear, high-intent links including Certificate Canvas Studio
  const isAr = currentLanguage === 'ar';
  const navLinks = [
    { id: 'home', label: t.navHome },
    { id: 'programs', label: t.navPrograms },
    { id: 'advisor', label: t.navAdvisor },
    { id: 'certificates', label: isAr ? 'الشهادات واللوحات' : 'Certificates' },
    { id: 'games', label: isAr ? 'واحة الألعاب' : 'Games Arcade' },
    { id: 'mothers', label: t.navMothers },
    { id: 'contact', label: t.navContact },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-right cursor-pointer shrink-0"
        >
          <BrandLogo size="md" lightText={isDarkMode} />
        </button>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`py-1.5 px-3 rounded-lg transition-all relative cursor-pointer whitespace-nowrap ${
                currentPage === link.id
                  ? 'text-[#0D9488] dark:text-emerald-400 font-extrabold bg-emerald-50/70 dark:bg-emerald-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0D9488] dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {link.label}
              {currentPage === link.id && (
                <span className="absolute bottom-0 right-2 left-2 h-0.5 bg-[#0D9488] dark:bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Right side controls (Language, Theme, Staff Portal if auth, CTA) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0D9488] dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={currentLanguage === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Languages className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400 shrink-0" />
            <span>{currentLanguage === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={isDarkMode ? 'الوضع النهاري (Light Mode)' : 'الوضع الليلي (Dark Mode)'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Staff Portal / Admin Login Button */}
          {userRole ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                currentPage === 'dashboard' || currentPage === 'portal'
                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700'
              }`}
              title={t.navPortal}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.navPortal}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('portal')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#0D9488] dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
              title={currentLanguage === 'ar' ? 'تسجيل دخول الإدارة والمعلمين' : 'Admin & Staff Login'}
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{currentLanguage === 'ar' ? 'دخول الإدارة' : 'Admin Login'}</span>
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={onOpenTrial}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-extrabold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            {t.btnTrial}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B1522] border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-1 text-sm font-bold text-slate-800 dark:text-slate-200">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-right rtl:text-right ltr:text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#0D9488] dark:text-emerald-400 font-extrabold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Portal Link */}
            {userRole ? (
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="text-right rtl:text-right ltr:text-left px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{t.navPortal}</span>
                </span>
                <span className="text-xs text-emerald-400">لوحة التحكم</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('portal');
                  setMobileMenuOpen(false);
                }}
                className="text-right rtl:text-right ltr:text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-between cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{currentLanguage === 'ar' ? 'تسجيل دخول الإدارة والمعلمين' : 'Admin & Staff Login'}</span>
                </span>
                <span className="text-xs text-[#0D9488] dark:text-emerald-400">دخول</span>
              </button>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenTrial();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg text-center shadow-xs cursor-pointer"
            >
              {t.btnTrial}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
