import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Language, translations } from '../../data/translations';
import { FloatingIllustrations } from './FloatingIllustrations';
import { AnimatedCounter } from './AnimatedCounter';
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Search,
  Sparkles,
  Star,
  Users,
  Video,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface PublicTeachersPageProps {
  currentLanguage?: Language;
  onOpenTrial: (teacherName?: string) => void;
}

interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  category: 'all' | 'quran' | 'arabic' | 'values' | 'international';
  ijazah: string;
  experienceYears: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  photoUrl: string;
  bio: string;
  philosophy: string;
  courses: string[];
}

const TEACHERS_FACULTY: TeacherProfile[] = [
  {
    id: 't-101',
    name: 'الشيخ عبد الله بن محمد القرني',
    title: 'كبير مقرئي الأكاديمية ومشرف الحلقات القرآنية',
    specialty: 'القراءات القرآنية العشر والتجويد وأصول الترتيل',
    category: 'quran',
    ijazah: 'إجازة مسندة بالسند المتصل برواية حفص وشعبة عن عاصم',
    experienceYears: 14,
    studentsCount: 180,
    rating: 4.98,
    reviewsCount: 142,
    photoUrl: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
    bio: 'خريج كلية القرآن الكريم والدراسات الإسلامية بالجامعة الإسلامية، حافظ للقرآن الكريم متقن لمخارج الحروف وطرائق تحفيظ الأطفال بالتشجيع والتحفيز.',
    philosophy: 'القرآن يُغرس في قلب الصغير بالحب والرفق قبل الحفظ والتلقين.',
    courses: ['حلقات تحفيظ القرآن الكريم وتجويده', 'مسار التجويد المتقدم وتحفة الأطفال'],
  },
  {
    id: 't-102',
    name: 'أ. أسماء بنت إبراهيم المحمدي',
    title: 'المشرفة التربوية لمسار نور البيان والتأسيس اللغوي',
    specialty: 'تأسيس القراءة والكتابة وعلاج عيوب النطق للأطفال',
    category: 'arabic',
    ijazah: 'مدربة معتمدة في قاعدة نور البيان والفتح الرباني والتهجئة السليمة',
    experienceYears: 10,
    studentsCount: 220,
    rating: 4.96,
    reviewsCount: 178,
    photoUrl: '/assets/aistudio/teacher_hijab_classroom.jpg',
    bio: 'ماجستير في المناهج وطرائق تدريس اللغة العربية للأطفال، تبتكر وسائل بصرية وألعاباً تعليمية تجعل الطفل يقرأ ويكتب بطلاقة خلال أسابيع معدودة.',
    philosophy: 'كل طفل قادر على القراءة بفصاحة إذا وجد المعلم الصبور والمنهج الممتع.',
    courses: ['منهاج البيان القرآني والتأسيس اللغوي', 'تأسيس القراءة والكتابة السريعة'],
  },
  {
    id: 't-103',
    name: 'أ. أحمد بن صالح الشمري',
    title: 'رئيس قسم المناهج الدولية والرياضيات التفاعلية',
    specialty: 'Cambridge & American Math والحساب الذهني السريع',
    category: 'international',
    ijazah: 'بكالوريوس الرياضيات والعلوم التطبيقية، شهادة تدريب كامبريدج الدولية',
    experienceYears: 8,
    studentsCount: 140,
    rating: 4.94,
    reviewsCount: 95,
    photoUrl: '/assets/aistudio/0d4d7825-4ec4-415d-9145-d1d2bed7db1a_0728e0ae.jpg',
    bio: 'خبير في تدريس مناهج الرياضيات الدولية لمدارس اللغات والإنترناشونال بالسعودية، يركز على الفهم المنطقي وحل المسائل بربطها بالواقع اليومي.',
    philosophy: 'الرياضيات ليست حفظاً للمعادلات، بل متعة في حل الألغاز والتفكير المنطقي.',
    courses: ['المناهج الدولية والرياضيات المتقدمة', 'الحساب الذهني وتنمية الذكاء'],
  },
  {
    id: 't-104',
    name: 'الشيخة مريم بنت خالد السبيعي',
    title: 'معلمة مسار غراس القيم والآداب النبوية للناشئة',
    specialty: 'السيرة النبوية المبسطة وقيم الأخلاق الإسلامية للأطفال',
    category: 'values',
    ijazah: 'إجازة في حفظ الأربعين النووية، ودبلوم التربية الإيمانية للأبناء',
    experienceYears: 7,
    studentsCount: 110,
    rating: 4.97,
    reviewsCount: 88,
    photoUrl: '/assets/aistudio/classroom_teacher_students_crop.jpg',
    bio: 'متخصصة في سرد السيرة النبوية للأطفال بأسلوب تفاعلي قصصي يغرس في الناشئة محبة النبي ﷺ والاقتداء بأخلاقه في الصدق والأمانة وبر الوالدين.',
    philosophy: 'أثر القصة الصادقة في وجدان الطفل يستمر معه طوال العمر.',
    courses: ['غراس القيم والآداب النبوية للناشئة', 'أذكار وأخلاق المسلم الصغير'],
  },
  {
    id: 't-105',
    name: 'د. يوسف بن عبد الرحمن الصالح',
    title: 'أستاذ اللسانيات وتنمية النطق والتخاطب',
    specialty: 'تطوير النطق، علاج التأتأة، والطلاقة التعبيرية',
    category: 'arabic',
    ijazah: 'دكتوراه في اضطرابات النطق والكلام، أخصائي تخاطب سريري معتمد',
    experienceYears: 12,
    studentsCount: 95,
    rating: 4.95,
    reviewsCount: 74,
    photoUrl: '/assets/aistudio/1acdb7f3-e219-42dd-a685-a7f3ae59d536_ab6cf851.jpg',
    bio: 'يساعد الأطفال على التغلب على صعوبات النطق ومخارج الحروف اللثوية والحلقية بتمارين نطق متخصصة مصممة برفق وتشجيع تام.',
    philosophy: 'الثقة بالنفس هي أولى خطوات الطلاقة وفصاحة اللسان.',
    courses: ['برنامج تنمية النطق والتخاطب اللغوي'],
  },
];

export const PublicTeachersPage: React.FC<PublicTeachersPageProps> = ({
  currentLanguage = 'ar',
  onOpenTrial,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const shouldReduceMotion = useReducedMotion();
  const isAr = currentLanguage === 'ar';

  const categories = [
    { id: 'all', label: isAr ? 'جميع الكادر التعليمي' : 'All Teachers' },
    { id: 'quran', label: isAr ? 'القرآن الكريم والتجويد' : 'Quran & Tajweed' },
    { id: 'arabic', label: isAr ? 'التأسيس ونور البيان' : 'Arabic & Foundation' },
    { id: 'values', label: isAr ? 'القيم والآداب النبوية' : 'Values & Prophetic Ethics' },
    { id: 'international', label: isAr ? 'المناهج والرياضيات' : 'Math & International' },
  ];

  const filteredTeachers = TEACHERS_FACULTY.filter((teacher) => {
    const matchesCategory = selectedCategory === 'all' || teacher.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] dark:bg-[#070E18] text-[#0F2942] dark:text-slate-100 transition-colors duration-200">
      {/* Subtle Floating Educational Illustrations */}
      <FloatingIllustrations />

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-100 dark:border-emerald-900/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{isAr ? 'نخبة المعلمين والمعلمات المجازين' : 'Certified Elite Faculty'}</span>
          </motion.div>

          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F2942] dark:text-white font-display tracking-tight text-balance max-w-4xl mx-auto"
          >
            {isAr
              ? 'معلمون مجازون بالسند المتصل يجمعون بين الإتقان والرفق التربوي'
              : 'Certified Quranic Scholars & Passionate Educators'}
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed"
          >
            {isAr
              ? 'نختار معلمي ومعلمات الأكاديمية بعناية فائقة وفق معايير الإجازة الشرعية، الخبرة التربوية مع الأطفال، والقدرة على خلق بيئة تعليمية حانية ومحفزة تجعل الطفل ينتظر موعد درسه بفارغ الصبر.'
              : 'Our faculty members hold authentic connected ijazahs and specialized degrees in early childhood pedagogy, ensuring your child learns with love, accuracy, and inspiration.'}
          </motion.p>

          {/* Animated Stats KPI Strip */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/60"
          >
            <div className="p-3.5 bg-white dark:bg-[#111E2E] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                <AnimatedCounter value={45} prefix="+" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {isAr ? 'معلم ومعلمة معتمدين' : 'Certified Teachers'}
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#111E2E] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D9488] dark:text-emerald-400 font-display">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {isAr ? 'مجازون بالسند المتصل' : 'Connected Ijazahs'}
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#111E2E] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 dark:text-amber-400 font-display">
                <AnimatedCounter value={12500} prefix="+" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {isAr ? 'ساعة تدريس تفاعلية' : 'Interactive Hours'}
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#111E2E] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-display">
                4.98
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{isAr ? 'تقييم أولياء الأمور' : 'Parents Rating'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Faculty Section: Filters & Grid */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls: Search & Category Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#111E2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم المعلم أو تخصصه...' : 'Search teacher or track...'}
              className="w-full bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-lg rtl:pr-9 ltr:pl-9 rtl:pl-3 ltr:pr-3 py-2 text-xs text-[#0F2942] dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>

        {/* Teachers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Header Badge */}
                <div className="relative h-52 sm:h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={teacher.photoUrl}
                    alt={teacher.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Top Floating Badge */}
                  <div className="absolute top-3 rtl:right-3 ltr:left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-[#0F2942]/95 backdrop-blur-md text-[11px] font-bold text-emerald-800 dark:text-emerald-300 shadow-xs border border-white/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isAr ? 'معلم معتمد ومجاز' : 'Verified Faculty'}</span>
                  </div>

                  {/* Bottom Teacher Info in Overlay */}
                  <div className="absolute bottom-3 rtl:right-3 rtl:left-3 ltr:left-3 ltr:right-3 text-white">
                    <h2 className="text-base sm:text-lg font-bold font-display leading-snug drop-shadow-sm">
                      {teacher.name}
                    </h2>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5 line-clamp-1">
                      {teacher.title}
                    </p>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Ijazah & Credentials */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-start gap-1.5 font-bold mb-0.5 text-emerald-800 dark:text-emerald-300">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{isAr ? 'الإجازة والاعتماد:' : 'Ijazah & Credentials:'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed font-sans">
                      {teacher.ijazah}
                    </p>
                  </div>

                  {/* Bio Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {teacher.bio}
                  </p>

                  {/* Philosophy Quote */}
                  <blockquote className="text-xs italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border-r-2 rtl:border-r-2 ltr:border-l-2 border-emerald-500">
                    "{teacher.philosophy}"
                  </blockquote>

                  {/* Courses Tags */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      {isAr ? 'المسارات المسندة للمعلم:' : 'Assigned Tracks:'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.courses.map((course, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Rating & CTA Button */}
              <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{teacher.rating}</span>
                  <span className="text-slate-400 text-[11px]">({teacher.reviewsCount})</span>
                </div>

                <button
                  onClick={() => onOpenTrial(teacher.name)}
                  className="px-3.5 py-2 text-xs font-bold bg-[#0D9488] hover:bg-[#0b7a6f] text-white rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حجز حصة تجريبية' : 'Book Trial Class'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4-Stage Teacher Vetting Standards */}
        <div className="mt-16 sm:mt-24 p-6 sm:p-8 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 uppercase tracking-wider">
              {isAr ? 'ضمان الأمانة والإتقان' : 'Trust & Rigor'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white mt-1.5 font-display">
              {isAr ? 'معايير اختيار الكادر التعليمي في الأكاديمية' : 'Our 4-Stage Faculty Selection Rigor'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              {isAr
                ? 'يمر كل معلم ومعلمة بأربع مراحل فحص دقيقة قبل اعتماد انضمامهم، ونقبل أقل من 5% من المتقدمين فقط.'
                : 'Every candidate undergoes a rigorous 4-step pedagogical audition before leading classes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200/80 dark:border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center mb-2.5">
                01
              </div>
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white font-display">
                {isAr ? 'الإجازة بالسند المتصل' : 'Connected Ijazah'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isAr
                  ? 'التثبت المباشر من صحة الإجازات القرآنية ودرجات الشهادات الأكاديمية المتخصصة.'
                  : 'Verification of connected recitation chains and academic degrees.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200/80 dark:border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center mb-2.5">
                02
              </div>
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white font-display">
                {isAr ? 'المحاكاة والتدريس الحي' : 'Live Mock Class'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isAr
                  ? 'تقديم حصة تجريبية حية أمام لجنة الإشراف الأكاديمي لتقييم أسلوب الشرح والتفاعل.'
                  : 'Live pedagogical simulation assessing interaction and engagement.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200/80 dark:border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center mb-2.5">
                03
              </div>
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white font-display">
                {isAr ? 'السمات التربوية والنفسية' : 'Child Psychology'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isAr
                  ? 'فحص الصبر، اللين، واستيعاب الفروق الفردية وحالات التردد والخجل لدى الأطفال.'
                  : 'Assessing patience, empathy, and positive reinforcement techniques.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200/80 dark:border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center mb-2.5">
                04
              </div>
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white font-display">
                {isAr ? 'التقييم الدوري المستمر' : 'Continuous Quality'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isAr
                  ? 'متابعة دورية لحصص كل معلم ومراجعة تقييمات أولياء الأمور أسبوعياً لضمان أعلى جودة.'
                  : 'Weekly session audits and parent feedback review.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
