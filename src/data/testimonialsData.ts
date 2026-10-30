export interface Testimonial {
  id: string;
  parentName: string;
  parentNameEn: string;
  childName: string;
  childNameEn: string;
  childAge: number;
  location: string;
  locationEn: string;
  courseCategory: 'quran' | 'arabic' | 'expat' | 'mothers' | 'values';
  courseName: string;
  courseNameEn: string;
  rating: number;
  feedback: string;
  feedbackEn: string;
  durationEnrolled: string;
  durationEnrolledEn: string;
  verified: boolean;
  avatarBg: string;
  highlightOutcome: string;
  highlightOutcomeEn: string;
}

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't-1',
    parentName: 'أم عبد الرحمن القحطاني',
    parentNameEn: 'Umm Abdulrahman Al-Qahtani',
    childName: 'عبد الرحمن',
    childNameEn: 'Abdulrahman',
    childAge: 7,
    location: 'الرياض، المملكة العربية السعودية',
    locationEn: 'Riyadh, Saudi Arabia',
    courseCategory: 'quran',
    courseName: 'حلقات "نور يتلى" لتحفيظ القرآن والتجويد',
    courseNameEn: '"Noor Yutla" Quran Memorization & Tajweed',
    rating: 5,
    feedback:
      'ما شاء الله لا قوة إلا بالله، ابني عبد الرحمن أتم حفظ جزأين بمخارج حروف متقنة جداً وتجويد سليم. المعلم في الأكاديمية صبور ومحبب للأطفال، والحلقات أونلاين وفرت علينا عناء المواصلات وزحام الشوارع.',
    feedbackEn:
      'MashaAllah, my 7-year-old son completed 2 Juz with precise articulation and proper Tajweed. The teacher is incredibly patient and encouraging. 100% online sessions saved us hours of daily commute.',
    durationEnrolled: 'مشترك منذ 8 أشهر',
    durationEnrolledEn: 'Enrolled for 8 months',
    verified: true,
    avatarBg: 'bg-emerald-600',
    highlightOutcome: 'أتم حفظ جزأين مع تطبيق أحكام النون والميم',
    highlightOutcomeEn: 'Mastered 2 full Juz with applied Tajweed rules',
  },
  {
    id: 't-2',
    parentName: 'د. طارق العمري (مبتعث)',
    parentNameEn: 'Dr. Tariq Al-Omari',
    childName: 'زياد وليان',
    childNameEn: 'Ziyad & Layan',
    childAge: 6,
    location: 'لندن، المملكة المتحدة 🇬🇧',
    locationEn: 'London, United Kingdom 🇬🇧',
    courseCategory: 'expat',
    courseName: 'التأسيس اللغوي والقراءة السليمة والتهجئة',
    courseNameEn: 'Foundational Arabic Reading & Phonetics',
    rating: 5,
    feedback:
      'أكبر هاجس كان لدينا في الغربة هو لسان أطفالنا ولغتهم العربية. بفضل الله ثم معلمات أكاديمية نور وبيان، أصبح زياد يقرأ قصص الأطفال بالعربية الفصحى ويهجئ آيات القرآن بكل طلاقة. الفصول أونلاين بمرونة عالية في التوقيت.',
    feedbackEn:
      'Our biggest worry living abroad was preserving our children’s Arabic identity. Thanks to Noor & Bayan Academy, Ziyad now reads Arabic storybooks fluently and decodes Quranic verses effortlessly.',
    durationEnrolled: 'مشترك منذ سنة كاملة',
    durationEnrolledEn: 'Enrolled for 1 year',
    verified: true,
    avatarBg: 'bg-blue-600',
    highlightOutcome: 'طلاقة في قراءة الكلمات والتهجئة السليمة في بلاد الغربة',
    highlightOutcomeEn: 'Fluent Arabic reading and speech while living in the UK',
  },
  {
    id: 't-3',
    parentName: 'م. أحمد زهران',
    parentNameEn: 'Eng. Ahmed Zahran',
    childName: 'سارة',
    childNameEn: 'Sarah',
    childAge: 5,
    location: 'القاهرة، مصر',
    locationEn: 'Cairo, Egypt',
    courseCategory: 'arabic',
    courseName: 'التأسيس اللغوي للأطفال ومخارج الحروف',
    courseNameEn: 'Arabic Letter Articulation & Early Literacy',
    rating: 5,
    feedback:
      'سارة كانت تعاني من لدغات في حرفي الراء والسين وترفض الذهاب للحصص التقليدية. في أكاديمية نور وبيان المعلمة استخدمت ألعاباً تفاعلية مرئية محببة جعلتها تنتظر موعد الحصة على زوم بكل شغف!',
    feedbackEn:
      'Sarah had difficulty pronouncing R and S sounds and disliked traditional schooling. Here, the instructor used interactive educational games that made her eagerly anticipate every live Zoom session.',
    durationEnrolled: 'مشتركة منذ 5 أشهر',
    durationEnrolledEn: 'Enrolled for 5 months',
    verified: true,
    avatarBg: 'bg-rose-500',
    highlightOutcome: 'تصحيح مخارج الحروف وحب التحدث بالفصحى',
    highlightOutcomeEn: 'Corrected speech phonetics and ignited passion for Arabic',
  },
  {
    id: 't-4',
    parentName: 'أم تميم الدوسري',
    parentNameEn: 'Umm Tamim Al-Dawsari',
    childName: 'تميم',
    childNameEn: 'Tamim',
    childAge: 9,
    location: 'الدمام، المملكة العربية السعودية',
    locationEn: 'Dammam, Saudi Arabia',
    courseCategory: 'values',
    courseName: 'برنامج "آية وحكاية" وغرس القيم والأخلاق',
    courseNameEn: '"Ayah & Story" Moral Character Development',
    rating: 5,
    feedback:
      'لاحظت تغيراً جذرياً في سلوك تميم؛ أصبح أكثر هدوءاً وبراً وتقليلاً لساعات الآيباد بعد اشتراكه في برنامج القيم وسماعه لقصص الصحابة والأنبياء بأسلوب تربوي عصري راقٍ.',
    feedbackEn:
      'I noticed a significant positive transformation in Tamim’s behavior; he became calmer, more respectful, and drastically reduced screen time after the values program.',
    durationEnrolled: 'مشترك منذ 6 أشهر',
    durationEnrolledEn: 'Enrolled for 6 months',
    verified: true,
    avatarBg: 'bg-amber-600',
    highlightOutcome: 'تعديل سلوكي ملموس وتقليل ساعات الأجهزة الذكية',
    highlightOutcomeEn: 'Noticeable behavioral improvement & less screen time',
  },
  {
    id: 't-5',
    parentName: 'أ. منى النجار',
    parentNameEn: 'Mona Al-Najjar',
    childName: 'يوسف ومريم',
    childNameEn: 'Youssef & Maryam',
    childAge: 8,
    location: 'تورونتو، كندا 🇨🇦',
    locationEn: 'Toronto, Canada 🇨🇦',
    courseCategory: 'expat',
    courseName: 'حلقات القرآن والتجويد للأطفال في المهجر',
    courseNameEn: 'Quran & Tajweed Circles for Diaspora Youth',
    rating: 5,
    feedback:
      'التنسيق في المواعيد ممتاز جداً بالنسبة لفرق التوقيت بين كندا والشرق الأوسط. تقرير ولي الأمر الأسبوعي والتسجيلات الصوتية تمنحنا راحة بال تامة ومتابعة مستمرة لإتقان يوسف ومريم.',
    feedbackEn:
      'Schedule coordination is seamless despite the time difference between Canada and the Middle East. Weekly reports and voice notes give us peace of mind and constant progress tracking.',
    durationEnrolled: 'مشتركون منذ 9 أشهر',
    durationEnrolledEn: 'Enrolled for 9 months',
    verified: true,
    avatarBg: 'bg-teal-600',
    highlightOutcome: 'مرونة مواعيد استثنائية تناسب توقيت كندا وأمريكا',
    highlightOutcomeEn: 'Flexible schedules perfectly aligned with Canadian timezones',
  },
  {
    id: 't-6',
    parentName: 'أم راشد المهيري',
    parentNameEn: 'Umm Rashed Al-Muhairi',
    childName: 'استشارة أسرية',
    childNameEn: 'Family Consultation',
    childAge: 34,
    location: 'دبي، الإمارات العربية المتحدة 🇦🇪',
    locationEn: 'Dubai, UAE 🇦🇪',
    courseCategory: 'mothers',
    courseName: 'واحة الأمهات والاستشارات التربوية المتخصصة',
    courseNameEn: "Mothers' Oasis & Parenting Advisory",
    rating: 5,
    feedback:
      'جلسات الدعم النفسي والتربوي في واحة الأمهات أعطتني أدوات عملية فورية للتعامل مع غضب الأطفال وتنظيم الروتين المنزلي بدون صراخ أو توتر. شكراً لإدارة ومعلمات الأكاديمية.',
    feedbackEn:
      'The parenting advisory sessions in Mothers Oasis gave me instant, practical tools to handle toddler anger and structure daily home routines without stress or conflict.',
    durationEnrolled: 'عضوية نشطة في واحة الأمهات',
    durationEnrolledEn: 'Active Oasis Member',
    verified: true,
    avatarBg: 'bg-purple-600',
    highlightOutcome: 'أدوات تربوية فعالة لإدارة الخلافات والهدوء الأسري',
    highlightOutcomeEn: 'Practical guidance for serene parenting and daily routines',
  },
];
