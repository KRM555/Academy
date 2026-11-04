import React, { useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, BookOpen, GraduationCap, CheckCircle2, Globe, Laptop, Maximize2, X } from 'lucide-react';
import { Language } from '../data/translations';

interface FutureVisionSectionProps {
  onOpenTrial: () => void;
  onExplorePrograms: () => void;
  currentLanguage?: Language;
}

export const FutureVisionSection: React.FC<FutureVisionSectionProps> = ({
  onOpenTrial,
  onExplorePrograms,
  currentLanguage = 'ar',
}) => {
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <section className="py-16 bg-gradient-to-b from-[#FAF9F6] via-white to-[#F3F4F6] dark:from-[#070E18] dark:via-[#0B1522] dark:to-[#070E18] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-500/10 dark:bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white dark:bg-[#0E1A2B] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Visual Classroom Card on one side */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-md w-full">
                {/* Clean Frame around the image */}
                <div className="p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500/30 via-slate-200 dark:via-slate-800 to-teal-500/30 shadow-xl">
                  <div className="relative rounded-[14px] sm:rounded-[20px] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src="/assets/aistudio/teacher_hijab_classroom.jpg"
                      alt={isAr ? 'معلمة أكاديمية نور وبيان والأطفال في فصل تفاعلي حديث' : 'Noor & Bayan Academy Teacher and Students in Modern Interactive Class'}
                      className="w-full h-auto aspect-[4/3] object-cover block cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                      onClick={() => setIsPreviewOpen(true)}
                      loading="lazy"
                      width={1024}
                      height={768}
                    />
                    
                    {/* Floating pill badge on the photo */}
                    <div className="absolute bottom-2.5 rtl:right-2.5 ltr:left-2.5 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'بيئة تفاعلية حية' : 'Live Interactive Classroom'}</span>
                    </div>

                    {/* Small preview overlay button on hover */}
                    <button
                      onClick={() => setIsPreviewOpen(true)}
                      className="absolute top-2.5 rtl:left-2.5 ltr:right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title={isAr ? 'عرض الصورة بالحجم الكامل' : 'View Full Image'}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Direct Call-to-Action on the other side */}
            <div className="lg:col-span-7 space-y-6 text-right rtl:text-right ltr:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-extrabold border border-purple-200/80 dark:border-purple-900/60 shadow-2xs">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{isAr ? 'رؤية وانطلاقة تعليمية' : 'Vision & Growth'}</span>
              </div>

              {/* Main Titles Matching the Poster */}
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2942] dark:text-white font-display tracking-tight leading-tight">
                  {isAr ? 'مستقبلك يبدأ من هنا!' : 'Your Future Begins Here!'}
                </h2>
                <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-display">
                  {isAr ? 'أكاديمية نور وبيان' : 'Noor & Bayan Academy'}
                </div>
              </div>

              {/* Slogan */}
              <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                {isAr
                  ? 'تعليم متكامل .. لغات متعددة .. مستقبل بلا حدود'
                  : 'Integrated Education · Multiple Languages · Boundless Future'}
              </div>

              {/* Official Mission Description from the User */}
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {isAr
                  ? 'نفتح لأبنائنا أبواب المعرفة والتميز من مرحلة التأسيس وحتى الجامعة، من خلال تعليم تفاعلي أونلاين، ومناهج متنوعة، ومعلمين متخصصين.'
                  : 'We open the doors of knowledge and distinction for our children from foundation to university, through interactive online education, diverse curricula, and specialized instructors.'}
              </p>

              {/* Quick Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Laptop className="w-4 h-4 text-[#0D9488] dark:text-emerald-400 shrink-0" />
                  <span>{isAr ? 'تعليم تفاعلي أونلاين 100%' : '100% Interactive Online'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>{isAr ? 'لغات متعددة ومناهج دولية' : 'Languages & Global Curricula'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{isAr ? 'من التأسيس حتى الجامعة' : 'From Foundation to University'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{isAr ? 'معلمون ومعلمات متخصصون' : 'Certified Specialized Teachers'}</span>
                </div>
              </div>

              {/* Call-to-Action Card Matching the Poster Footer */}
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 space-y-3">
                <div>
                  <h4 className="text-base sm:text-lg font-black text-purple-900 dark:text-purple-200 font-display">
                    {isAr ? 'ابدأ رحلتك التعليمية معنا' : 'Start Your Educational Journey With Us'}
                  </h4>
                  <p className="text-xs sm:text-sm text-purple-800/80 dark:text-purple-300/80 mt-0.5">
                    {isAr
                      ? 'احجز حصتك الآن واكتشف عالمًا من فرص التعلم والنجاح.'
                      : 'Book your class now and discover a world of learning and success opportunities.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={onOpenTrial}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>{isAr ? 'احجز حصتك التجريبية الآن' : 'Book Your Trial Class'}</span>
                    <ArrowIcon className="w-4 h-4 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onExplorePrograms}
                    className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{isAr ? 'استكشف المناهج والمسارات' : 'Explore Curricula & Tracks'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Lightbox Modal for Classroom Photo */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 rtl:left-4 ltr:right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src="/assets/aistudio/teacher_hijab_classroom.jpg"
              alt="Noor & Bayan Academy Classroom"
              className="w-full h-auto max-h-[85vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
};
