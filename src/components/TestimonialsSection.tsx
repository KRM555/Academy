import React, { useState } from 'react';
import { Language } from '../data/translations';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';
import { Star, ShieldCheck, Quote, CheckCircle2, Globe, Heart, BookOpen, Sparkles, UserCheck } from 'lucide-react';

interface TestimonialsSectionProps {
  currentLanguage: Language;
  onOpenTrial: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ currentLanguage, onOpenTrial }) => {
  const isAr = currentLanguage === 'ar';
  const [activeFilter, setActiveFilter] = useState<'all' | 'quran' | 'arabic' | 'expat' | 'mothers'>('all');

  const filteredTestimonials = activeFilter === 'all'
    ? TESTIMONIALS_DATA
    : TESTIMONIALS_DATA.filter((item) => item.courseCategory === activeFilter);

  const filterTabs = [
    { id: 'all', labelAr: 'جميع الآراء والتجارب', labelEn: 'All Reviews', icon: Star },
    { id: 'quran', labelAr: 'تحفيظ وتجويد القرآن', labelEn: 'Quran & Tajweed', icon: BookOpen },
    { id: 'arabic', labelAr: 'التأسيس اللغوي والقراءة', labelEn: 'Arabic Literacy', icon: Sparkles },
    { id: 'expat', labelAr: 'عائلاتنا في المهجر والغربة', labelEn: 'Expats & Diaspora', icon: Globe },
    { id: 'mothers', labelAr: 'واحة الأمهات والاستشارات', labelEn: "Mothers' Oasis", icon: Heart },
  ];

  return (
    <section id="testimonials" className="py-20 bg-slate-50 dark:bg-[#070E18] transition-colors duration-200 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <UserCheck className="w-4 h-4 text-[#0D9488] dark:text-emerald-400" />
            <span>
              {isAr ? 'آراء موثقة لأولياء الأمور والطلاب' : 'Verified Parent & Student Testimonials'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight leading-tight">
            {isAr ? (
              <>
                قصص نجاح نعتز بها من عائلات <span className="text-[#0D9488] dark:text-emerald-400">نور وبيان</span> حول العالم
              </>
            ) : (
              <>
                Success Stories from Our <span className="text-[#0D9488] dark:text-emerald-400">Noor & Bayan</span> Families Worldwide
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            {isAr
              ? 'نفخر بثقة آلاف الأسر في المملكة العربية السعودية، الدول العربية، والمغتربين في أوروبا وكندا وأمريكا. إليكم انطباعات وتجارب واقعية مع فصولنا التفاعلية الحية أونلاين 100%.'
              : 'Proudly trusted by thousands of families across Saudi Arabia, the Arab world, and the global diaspora in Europe, Canada, and the US. Here is their honest feedback on our 100% online classes.'}
          </p>

          {/* Quick Credibility Badges Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-[#0F2942] dark:text-white font-extrabold text-sm">4.98 / 5</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                {isAr ? '(+1,840 تقييم معتمد)' : '(+1,840 verified reviews)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? '100% فصول حية مسجلة وموثقة' : '100% Monitored Live Classes'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? '99.2% نسبة رضا وتجديد اشتراكات' : '99.2% Renewal & Satisfaction'}</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0D9488] text-white shadow-md shadow-emerald-700/20 scale-105'
                    : 'bg-white dark:bg-[#0B1522] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0D9488] dark:text-emerald-400'}`} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-[#0B1522] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 hover:border-[#0D9488]/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Parent Info & Verified Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${t.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {(isAr ? t.parentName : t.parentNameEn).charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2942] dark:text-white leading-tight font-display">
                        {isAr ? t.parentName : t.parentNameEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-[#0D9488] dark:text-emerald-400 shrink-0" />
                        <span>{isAr ? t.location : t.locationEn}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    {t.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>{isAr ? 'مشترك موثق' : 'Verified'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Name Tag */}
                <div className="mb-4 inline-block bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <span className="text-[#0D9488] dark:text-emerald-400 font-bold">
                    {isAr ? 'الدورة: ' : 'Course: '}
                  </span>
                  <span>{isAr ? t.courseName : t.courseNameEn}</span>
                </div>

                {/* Testimonial Quote */}
                <div className="relative mb-5">
                  <Quote className="w-6 h-6 text-slate-200 dark:text-slate-800 absolute -top-2 -right-1 rtl:-right-1 ltr:-left-1 rtl:rotate-180 -z-0 opacity-60" />
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed relative z-10 font-normal">
                    "{isAr ? t.feedback : t.feedbackEn}"
                  </p>
                </div>
              </div>

              {/* Footer: Concrete Outcome & Enrolled Duration */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-300 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{isAr ? t.highlightOutcome : t.highlightOutcomeEn}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-2.5">
                  <span>
                    {isAr ? `الطفل: ${t.childName}` : `Child: ${t.childNameEn}`}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {isAr ? t.durationEnrolled : t.durationEnrolledEn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card at Bottom of Testimonials */}
        <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-linear-to-r from-[#0F2942] to-[#133E68] dark:from-[#0B1522] dark:to-[#112338] text-white shadow-xl relative overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-right rtl:md:text-right ltr:md:text-left">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
                {isAr ? 'تجربة مجانية 100% بدون أي التزام' : '100% Free Trial · No Commitment'}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-display">
                {isAr
                  ? 'امنح طفلك فرصة الانضمام لجيل القرآن واللغة العربية السليمة'
                  : 'Empower Your Child with Quranic Fluency & Arabic Excellence'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {isAr
                  ? 'انضم إلى آلاف العائلات التي لمست التغيير الحقيقي في سلوك وأداء أبنائها. احجز حصة تجريبية مباشرة مع المعلم لتحديد المستوى بدقة.'
                  : 'Join thousands of families seeing tangible progress in their children’s learning and manners. Book a free live assessment session today.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={onOpenTrial}
                className="px-6 py-3.5 rounded-2xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-extrabold text-sm shadow-lg shadow-emerald-700/30 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                {isAr ? 'احجز حصة تجريبية مجانية الآن' : 'Book Free Trial Class Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
