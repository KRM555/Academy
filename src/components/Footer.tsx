import React from 'react';
import { Language, translations } from '../data/translations';
import { BrandLogo } from './BrandLogo';
import { Globe, Mail, Lock } from 'lucide-react';
import { siteConfig, getWhatsAppUrl } from '../config/siteConfig';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenTrial: () => void;
  currentLanguage?: Language;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTrial, currentLanguage = 'ar' }) => {
  const t = translations[currentLanguage];

  return (
    <footer className="bg-[#0F2942] dark:bg-[#070E18] text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-5 space-y-4">
            <button onClick={() => onNavigate('home')} className="cursor-pointer rtl:text-right ltr:text-left">
              <BrandLogo size="md" lightText={true} />
            </button>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              {t.footerBio}
            </p>

            {/* Social Icons ONLY (No text words) */}
            <div className="flex items-center gap-3 pt-2">
              {siteConfig.facebookUrl && (
                <a
                  href={siteConfig.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {getWhatsAppUrl() && (
                <a
                  href={getWhatsAppUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.814 3.184 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.8-5.77-5.8zm3.393 8.358c-.144.405-.837.774-1.17.822-.312.043-.634.07-1.74-.388-1.411-.584-2.316-2.025-2.386-2.119-.071-.093-.574-.764-.574-1.458 0-.693.364-1.034.494-1.176.13-.142.285-.177.38-.177.094 0 .19.002.273.006.089.005.207-.033.324.249.12.288.409 1.001.445 1.074.036.074.06.16.012.257-.048.096-.073.156-.145.241-.072.086-.151.192-.216.257-.071.072-.146.15-.063.293.084.143.372.613.799.992.548.487 1.011.637 1.155.709.143.071.227.059.312-.038.084-.097.362-.423.458-.567.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.348-.108.753z" />
                  </svg>
                </a>
              )}

              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                title={siteConfig.supportEmail}
                aria-label={siteConfig.supportEmail}
              >
                <Mail className="w-4 h-4" />
              </a>

              <span className="text-xs text-slate-400 mx-2">
                {siteConfig.supportEmail}
              </span>
            </div>
          </div>

          {/* Col 2: Multi-Page Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-sm font-bold text-white">{t.footerPages}</div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programs')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navPrograms}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('advisor')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navAdvisor}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('testimonials')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navTestimonials}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navContact}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('progress')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navProgress}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('certificates')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {currentLanguage === 'ar' ? 'الشهادات واللوحات' : 'Certificates Studio'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('games')} className="hover:text-emerald-400 transition-colors cursor-pointer text-amber-400 hover:text-amber-300 font-bold">
                  {currentLanguage === 'ar' ? 'واحة الألعاب الذكية 🎮' : 'Smart Games Arcade 🎮'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mothers')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {t.navMothers}
                </button>
              </li>
              <li className="pt-1.5 border-t border-slate-800/80">
                <button
                  onClick={() => onNavigate('portal')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-emerald-300 font-semibold"
                >
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{currentLanguage === 'ar' ? 'بوابة الكادر والإدارة' : 'Admin & Staff Portal'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: 100% Online & Global Reach */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-sm font-bold text-white">{t.footerCoverage}</div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentLanguage === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentLanguage === 'ar' ? 'مصر ودول الخليج العربي' : 'Egypt & GCC Region'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentLanguage === 'ar' ? 'المغتربون في أوروبا وأمريكا' : 'Expats in Europe & USA'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal Links */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-sm font-bold text-white">{t.footerPolicies}</div>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('privacy')}
                className="block rtl:text-right ltr:text-left text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {t.footerPrivacy}
              </button>

              <button
                onClick={() => onNavigate('terms')}
                className="block rtl:text-right ltr:text-left text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {t.footerTerms}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <div>
            {t.footerRights}
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>{currentLanguage === 'ar' ? 'فصول أونلاين 100% عبر زوم' : '100% Live Online via Zoom'}</span>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('privacy')} className="hover:underline cursor-pointer">
              {currentLanguage === 'ar' ? 'الخصوصية' : 'Privacy'}
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('terms')} className="hover:underline cursor-pointer">
              {currentLanguage === 'ar' ? 'الشروط' : 'Terms'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

