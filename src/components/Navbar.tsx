import React, { useState } from 'react';
import { Currency, TimezoneInfo } from '../types';
import { CURRENCIES, TIMEZONES } from '../data/academyData';
import { Language, translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import {
  Globe,
  Clock,
  ShieldCheck,
  Lock,
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  ChevronDown,
  Award,
  Heart,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentCurrency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  currentTimezone: TimezoneInfo;
  onTimezoneChange: (tz: TimezoneInfo) => void;
  onOpenTrial: () => void;
  userRole?: 'admin' | 'teacher' | null;
  onLogout?: () => void;
  currentLanguage: Language;
  onToggleLanguage: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentCurrency,
  onCurrencyChange,
  currentTimezone,
  onTimezoneChange,
  onOpenTrial,
  userRole,
  currentLanguage,
  onToggleLanguage,
  isDarkMode,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showTzMenu, setShowTzMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const t = translations[currentLanguage];

  // Core visible desktop links (balanced, fits perfectly without horizontal overflow)
  const primaryNavLinks = [
    { id: 'home', label: t.navHome },
    { id: 'programs', label: t.navPrograms },
    { id: 'advisor', label: t.navAdvisor },
    { id: 'testimonials', label: t.navTestimonials },
    { id: 'contact', label: t.navContact },
  ];

  // All links for mobile navigation drawer
  const allNavLinks = [
    { id: 'home', label: t.navHome },
    { id: 'programs', label: t.navPrograms },
    { id: 'advisor', label: t.navAdvisorFull || t.navAdvisor },
    { id: 'testimonials', label: t.navTestimonials },
    { id: 'progress', label: t.navProgress },
    { id: 'mothers', label: t.navMothers },
    { id: 'contact', label: t.navContact },
  ];

  const isMoreActive = currentPage === 'progress' || currentPage === 'mothers';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Invisible backdrop for closing dropdown menus when clicking outside */}
      {(showCurrencyMenu || showTzMenu || showMoreMenu) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowCurrencyMenu(false);
            setShowTzMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}

      {/* Top Banner Notice with Global Utilities (Always spans 100% full width) */}
      <div className="w-full bg-[#0F2942] dark:bg-[#070E18] text-slate-200 text-xs py-1.5 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
          {/* Right side in RTL: Academy Mode Notice */}
          <div className="flex items-center gap-2 shrink-0 truncate">
            <span className="font-bold text-amber-300 shrink-0">{t.onlineBanner}</span>
            <span aria-hidden="true" className="text-slate-500 shrink-0 hidden sm:inline">·</span>
            <span className="text-[11px] sm:text-xs text-slate-300 truncate hidden sm:inline">{t.onlineDesc}</span>
          </div>

          {/* Left side in RTL: Utilities (Language Switcher, Dark Mode, Currency, Timezone, Social, Security) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-xs">
            {/* 1. Language Switcher Button (AR / EN) */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title={currentLanguage === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Languages className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{currentLanguage === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* 2. Theme Switcher (Dark / Light Mode) */}
            <button
              onClick={onToggleTheme}
              className="p-1 text-slate-200 hover:text-amber-300 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={isDarkMode ? 'الوضع النهاري (Light Mode)' : 'الوضع الليلي (Dark Mode)'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            <span aria-hidden="true" className="text-slate-600 hidden xs:inline">|</span>

            {/* 3. Currency Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrencyMenu(!showCurrencyMenu);
                  setShowTzMenu(false);
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                title="تغيير العملة"
              >
                <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{currentCurrency.code}</span>
                <span className="text-[10px] text-slate-400 font-mono">({currentCurrency.symbol})</span>
              </button>

              {showCurrencyMenu && (
                <div className="absolute left-0 rtl:right-0 rtl:left-auto mt-1.5 w-52 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    {t.currencySelect}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          onCurrencyChange(curr);
                          setShowCurrencyMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          curr.code === currentCurrency.code
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-400 font-bold">{curr.code}</span>
                          <span>{curr.name}</span>
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{curr.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Timezone Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTzMenu(!showTzMenu);
                  setShowCurrencyMenu(false);
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                title="توقيت الحصص"
              >
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{currentTimezone.offsetLabel}</span>
              </button>

              {showTzMenu && (
                <div className="absolute left-0 rtl:right-0 rtl:left-auto mt-1.5 w-64 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    {t.timezoneSelect}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {TIMEZONES.map((tz) => (
                      <button
                        key={tz.code}
                        onClick={() => {
                          onTimezoneChange(tz);
                          setShowTzMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          tz.code === currentTimezone.code
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{tz.name}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">{tz.offsetLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">|</span>

            {/* 5. Social Icons */}
            <div className="flex items-center gap-1.5">
              <a
                href="https://www.facebook.com/share/1Evoqg1BVn/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-transform hover:scale-110 shadow-2xs"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-transform hover:scale-110 shadow-2xs"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.814 3.184 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.8-5.77-5.8zm3.393 8.358c-.144.405-.837.774-1.17.822-.312.043-.634.07-1.74-.388-1.411-.584-2.316-2.025-2.386-2.119-.071-.093-.574-.764-.574-1.458 0-.693.364-1.034.494-1.176.13-.142.285-.177.38-.177.094 0 .19.002.273.006.089.005.207-.033.324.249.12.288.409 1.001.445 1.074.036.074.06.16.012.257-.048.096-.073.156-.145.241-.072.086-.151.192-.216.257-.071.072-.146.15-.063.293.084.143.372.613.799.992.548.487 1.011.637 1.155.709.143.071.227.059.312-.038.084-.097.362-.423.458-.567.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z" />
                </svg>
              </a>
            </div>

            <span aria-hidden="true" className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.secureBadge}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation (Fits perfectly within 7xl container with zero overflow) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 lg:gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-right cursor-pointer shrink-0"
        >
          <BrandLogo size="md" lightText={isDarkMode} />
        </button>

        {/* Desktop Navigation Links (Visible on lg and above) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2.5 text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-200">
          {primaryNavLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`py-2 px-2.5 rounded-xl transition-all relative cursor-pointer whitespace-nowrap ${
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

          {/* "More" / المزيد Dropdown for Secondary Sections */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowCurrencyMenu(false);
                setShowTzMenu(false);
              }}
              className={`flex items-center gap-1.5 py-2 px-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isMoreActive
                  ? 'text-[#0D9488] dark:text-emerald-400 font-extrabold bg-emerald-50/70 dark:bg-emerald-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0D9488] dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{t.navMore}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showMoreMenu ? 'rotate-180 text-[#0D9488] dark:text-emerald-400' : 'text-slate-400'
                }`}
              />
              {isMoreActive && (
                <span className="absolute bottom-0 right-2 left-2 h-0.5 bg-[#0D9488] dark:bg-emerald-400 rounded-full" />
              )}
            </button>

            {/* Dropdown Menu Box */}
            {showMoreMenu && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Child Progress Tracker Link */}
                <button
                  onClick={() => {
                    onNavigate('progress');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full text-right rtl:text-right ltr:text-left flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                    currentPage === 'progress'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-[#0D9488] dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{t.navProgress}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.navProgressSub}</div>
                  </div>
                </button>

                {/* Mothers' Oasis Link */}
                <button
                  onClick={() => {
                    onNavigate('mothers');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full text-right rtl:text-right ltr:text-left flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                    currentPage === 'mothers'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{t.navMothers}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.navMothersSub}</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Action Controls: User Portal (only when authenticated) & CTA Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {userRole && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-2xs ${
                currentPage === 'dashboard'
                  ? 'bg-[#0F2942] text-white border-[#0F2942] ring-2 ring-emerald-400/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700'
              }`}
              title={t.navPortal}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.navPortal}</span>
            </button>
          )}

          {/* Primary CTA (Free Trial Class) */}
          <button
            onClick={onOpenTrial}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-extrabold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            {t.btnTrial}
          </button>

          {/* Mobile Drawer Toggle Button (Visible on screens < lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B1522] border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
            {allNavLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-right px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#0D9488] dark:text-emerald-400 font-extrabold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Portal Link in Drawer (only for authenticated staff) */}
            {userRole && (
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="text-right px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{t.navPortal}</span>
                </span>
                <span className="text-xs text-emerald-400">لوحة التحكم</span>
              </button>
            )}
          </div>

          {/* Mobile Utilities Strip (Language & Dark Mode) */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={onToggleLanguage}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[#0D9488] dark:text-emerald-400" />
              <span>{currentLanguage === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>الوضع النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Currency & Timezone Selector */}
          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
            {/* Currency picker */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{t.currencySelect}</label>
              <select
                value={currentCurrency.code}
                onChange={(e) => {
                  const found = CURRENCIES.find((c) => c.code === e.target.value);
                  if (found) onCurrencyChange(found);
                }}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone picker */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{t.timezoneSelect}</label>
              <select
                value={currentTimezone.code}
                onChange={(e) => {
                  const found = TIMEZONES.find((tz) => tz.code === e.target.value);
                  if (found) onTimezoneChange(found);
                }}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.code} value={tz.code}>
                    {tz.name} ({tz.offsetLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenTrial();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#0D9488] rounded-xl text-center shadow-xs cursor-pointer"
            >
              {t.btnTrial}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
