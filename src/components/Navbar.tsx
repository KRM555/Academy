import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Award,
  PhoneCall,
  Activity,
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
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary links visible on desktop
  const primaryLinks = [
    { id: 'home', label: t.navHome },
    { id: 'programs', label: t.navPrograms },
    { id: 'advisor', label: t.navAdvisor },
    { id: 'mothers', label: t.navMothers },
    { id: 'games', label: isAr ? 'واحة الألعاب 🎮' : 'Games 🎮' },
  ];

  // Secondary links tucked cleanly under "المزيد" to prevent any viewport clipping
  const secondaryLinks = [
    { id: 'certificates', label: isAr ? 'الشهادات واللوحات' : 'Certificates Studio', icon: Award },
    { id: 'progress', label: isAr ? 'لوحة إنجاز الطفل' : 'Student Progress', icon: Activity },
    { id: 'contact', label: t.navContact, icon: PhoneCall },
  ];

  const allNavLinks = [
    ...primaryLinks,
    ...secondaryLinks,
  ];

  const isMoreActive = secondaryLinks.some((l) => l.id === currentPage);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-right cursor-pointer shrink-0"
        >
          <BrandLogo size="md" lightText={isDarkMode} />
        </button>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-200">
          {primaryLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`py-1.5 px-2.5 rounded-lg transition-all relative cursor-pointer whitespace-nowrap ${
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

          {/* "المزيد" (More) dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMoreDropdownOpen((prev) => !prev)}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                isMoreActive
                  ? 'text-[#0D9488] dark:text-emerald-400 font-extrabold bg-emerald-50/70 dark:bg-emerald-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0D9488] dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{isAr ? 'المزيد' : 'More'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreDropdownOpen && (
              <div className="absolute top-full mt-1.5 rtl:right-0 ltr:left-0 w-52 bg-white dark:bg-[#111E2E] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {secondaryLinks.map((subLink) => {
                  const Icon = subLink.icon;
                  return (
                    <button
                      key={subLink.id}
                      onClick={() => {
                        onNavigate(subLink.id);
                        setMoreDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-right rtl:text-right ltr:text-left transition-colors cursor-pointer ${
                        currentPage === subLink.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#0D9488] dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0D9488] dark:hover:text-emerald-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{subLink.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right side controls (Language, Theme, Staff Portal, CTA) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0D9488] dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={currentLanguage === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Languages className="w-3.5 h-3.5 text-[#0D9488] dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">{currentLanguage === 'ar' ? 'EN' : 'عربي'}</span>
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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
              <span className="hidden sm:inline">{currentLanguage === 'ar' ? 'دخول الإدارة' : 'Admin'}</span>
            </button>
          )}

          {/* Primary CTA: Never clipped, always prominent */}
          <button
            onClick={onOpenTrial}
            className="inline-flex px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            {t.btnTrial}
          </button>

          {/* Mobile / Tablet Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B1522] border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-1 text-sm font-bold text-slate-800 dark:text-slate-200">
            {allNavLinks.map((link) => (
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
              className="w-full py-2.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg text-center shadow-xs cursor-pointer"
            >
              {t.btnTrial}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
