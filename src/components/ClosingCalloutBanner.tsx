import React from 'react';
import { Language } from '../data/translations';
import { Sparkles, ArrowLeft, ArrowRight, Heart, PhoneCall, CalendarCheck } from 'lucide-react';
import { getWhatsAppUrl } from '../config/siteConfig';

interface ClosingCalloutBannerProps {
  currentLanguage?: Language;
  onOpenTrial?: () => void;
  onContact?: () => void;
}

export const ClosingCalloutBanner: React.FC<ClosingCalloutBannerProps> = ({
  currentLanguage = 'ar',
  onOpenTrial,
  onContact,
}) => {
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const whatsappUrl = getWhatsAppUrl(
    isAr
      ? 'السلام عليكم، أود الاستفسار عن التسجيل في أكاديمية نور وبيان'
      : 'Hello, I would like to inquire about enrolling in Noor & Bayan Academy'
  );

  return (
    <section aria-label="Closing Callout" className="relative py-8 sm:py-12 bg-transparent transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Royal Violet Signature Card Matching the User's Official Design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B1F80] via-[#2F1668] to-[#1E0B49] text-white p-7 sm:p-12 lg:p-14 shadow-2xl border border-purple-400/25">
          {/* Subtle Decorative Starbursts & Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Faint Islamic / Geometric Motifs */}
          <div className="absolute -top-12 -left-12 opacity-5 pointer-events-none">
            <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,0 63,38 100,50 63,62 50,100 38,62 0,50 38,38" />
            </svg>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,0 63,38 100,50 63,62 50,100 38,62 0,50 38,38" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            {/* Top Brand Name */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? 'أكاديمية نور وبيان' : 'Noor & Bayan Academy'}</span>
            </div>

            {/* Title 1: نور وبيان */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-display drop-shadow-sm">
              {isAr ? 'نور وبيان' : 'Noor & Bayan'}
            </h2>

            {/* Subtitle in Warm Golden / Yellow: لأن مستقبل أبنائنا يستحق الأفضل */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FCD34D] dark:text-[#FDE68A] tracking-normal leading-snug drop-shadow-sm">
              {isAr
                ? 'لأن مستقبل أبنائنا يستحق الأفضل'
                : "Because Our Children's Future Deserves the Very Best"}
            </p>

            {/* Slogan: نعلّم بشغف.. نطوّر بتميز.. ونبني مستقبلاً مشرقًا. */}
            <p className="text-base sm:text-xl text-white/95 font-medium leading-relaxed max-w-2xl mx-auto">
              {isAr
                ? 'نعلّم بشغف.. نطوّر بتميز.. ونبني مستقبلاً مشرقًا.'
                : 'Teaching with passion.. Developing with excellence.. And building a brighter future.'}
            </p>

            {/* Call To Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              {onOpenTrial && (
                <button
                  onClick={onOpenTrial}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#1E0B49] font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 text-[#1E0B49]" />
                  <span>{isAr ? 'احجز حصة تجريبية مجانية الآن' : 'Book a Free Trial Session Now'}</span>
                  <ArrowIcon className="w-4 h-4 text-[#1E0B49]" />
                </button>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-300" />
                  <span>{isAr ? 'تواصل معنا عبر واتساب' : 'Contact on WhatsApp'}</span>
                </a>
              )}

              {onContact && (
                <button
                  onClick={onContact}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-transparent hover:bg-white/10 text-white/90 hover:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer underline underline-offset-4"
                >
                  <span>{isAr ? 'صفحة التواصل والمساعدة' : 'Contact & Support Page'}</span>
                </button>
              )}
            </div>

            {/* Subtle Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-purple-200/80">
              <Heart className="w-3.5 h-3.5 text-pink-300 fill-pink-300" />
              <span>{isAr ? 'تعليم معتمد · فصول مباشرة 100% · بيئة تربوية آمنة' : 'Certified Education · 100% Live · Safe & Nurturing'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
