import { Language } from '../data/translations';

export interface RouteSeoData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  noindex?: boolean;
  structuredData?: Record<string, any>;
}

export const ROUTE_SEO: Record<string, Record<Language, RouteSeoData>> = {
  '/': {
    ar: {
      title: 'أكاديمية نور وبيان للأطفال | تعليم القرآن الكريم والتأسيس اللغوي',
      description: 'أكاديمية تعليمية وتربوية رائدة للأطفال في السعودية والوطن العربي. حلقات قرآن تفاعلية أونلاين 100%، تأسيس اللغة والقراءة السليمة، وغرس القيم في فصول مصغرة ممتعة.',
      ogTitle: 'أكاديمية نور وبيان التعليمية للأطفال | فصول قرآن وتأسيس لغوي حية أونلاين',
      ogDescription: 'فصول تفاعلية حية أونلاين 100% لتعليم القرآن الكريم، اللغة العربية، وتعديل السلوك للأطفال في جميع أنحاء العالم.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'أكاديمية نور وبيان التعليمية للأطفال - معاً نتعلم ونبني المستقبل',
      imageWidth: 1200,
      imageHeight: 800,
      imageType: 'image/jpeg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'أكاديمية نور وبيان التعليمية',
        alternateName: 'Noor & Bayan Academy',
        url: 'https://noor-bayan.com',
        logo: '/assets/aistudio/image_b7a2be8f.png',
        description: 'منصة تفاعلية أونلاين 100% لتعليم القرآن الكريم والتأسيس اللغوي للأطفال.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SA',
        },
      },
    },
    en: {
      title: 'Noor & Bayan Academy | Online Quran, Arabic & Character Education for Kids',
      description: 'Premier online interactive academy for children in Saudi Arabia and worldwide. Live small-group Quran recitation with Tajweed, Arabic literacy, and moral character building.',
      ogTitle: 'Noor & Bayan Academy for Kids | Live Online Quran & Arabic Classes',
      ogDescription: '100% live interactive classes for Quran recitation, foundational Arabic, and moral development for kids worldwide.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'Noor & Bayan Academy for Kids - Together We Learn & Build the Future',
      imageWidth: 1200,
      imageHeight: 800,
      imageType: 'image/jpeg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Noor & Bayan Academy',
        url: 'https://noor-bayan.com',
        logo: '/assets/aistudio/image_b7a2be8f.png',
        description: '100% live online platform for Quran recitation and Arabic literacy for children.',
      },
    },
  },

  '/programs': {
    ar: {
      title: 'دليل البرامج والمناهج التعليمية | أكاديمية نور وبيان',
      description: 'استكشف برامج أكاديمية نور وبيان: التأسيس واللغة العربية، القرآن والعلوم الإسلامية، تعليم اللغات، المناهج الدولية، جميع المواد الدراسية، الحساب الذهني، وتنمية النطق.',
      ogTitle: 'دليل البرامج والمناهج التعليمية | أكاديمية نور وبيان',
      ogDescription: '8 مسارات تعليمية متكاملة بإشراف نخبة من المعلمين والمعلمات المجازين أونلاين 100% مع خطط تناسب كل طالب.',
      image: '/assets/programs/arabic_foundation.jpg',
      imageAlt: 'دليل برامج ومناهج أكاديمية نور وبيان التعليمية',
      imageWidth: 884,
      imageHeight: 710,
      imageType: 'image/jpeg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          { '@type': 'Course', name: 'التأسيس واللغة العربية (نور البيان)', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'القرآن والعلوم الإسلامية', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'تعليم اللغات المتعددة', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'المناهج الدولية والبريطانية', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'جميع المواد الدراسية', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'الحساب الذهني وتنمية المهارات', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'تنمية النطق والتخاطب', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'الدعم والمتابعة التعليمية', provider: 'أكاديمية نور وبيان' },
        ],
      },
    },
    en: {
      title: 'Curriculum & Programs Catalog | Noor & Bayan Academy',
      description: 'Explore live courses: Arabic Phonics (Noor Al-Bayan), Quran & Islamic studies, Languages, International Curricula, School Subjects, Mental Math, and Speech development.',
      ogTitle: 'Curriculum & Programs Catalog | Noor & Bayan Academy',
      ogDescription: 'Certified scholars teaching Quran, Arabic reading, ethics, and future skills in small virtual classrooms.',
      image: '/assets/programs/arabic_foundation.jpg',
      imageAlt: 'Noor & Bayan Academy Curriculum & Programs Catalog',
      imageWidth: 884,
      imageHeight: 710,
      imageType: 'image/jpeg',
    },
  },

  '/advisor': {
    ar: {
      title: 'مستشار المسار التعليمي وتحديد المستوى | أكاديمية نور وبيان',
      description: 'أداة تفاعلية ذكية تساعدك في اختيار البرنامج الأنسب لطفلك وتحديد مسار التعلم وحساب الرسوم تلقائياً بعملتك المحلية وتوقيتك المفضل.',
      ogTitle: 'مستشار المسار التعليمي للأطفال | أكاديمية نور وبيان',
      ogDescription: 'اختر المسار الأكاديمي المثالي لطفلك حسب عمره واحتياجاته مع حساب فوري للرسوم والمواعيد.',
      image: '/assets/aistudio/teacher_hijab_classroom.jpg',
      imageAlt: 'تحديد المستوى ومستشار المسار التعليمي في أكاديمية نور وبيان',
      imageWidth: 1024,
      imageHeight: 768,
      imageType: 'image/jpeg',
    },
    en: {
      title: 'Learning Path Advisor & Level Assessment | Noor & Bayan Academy',
      description: 'Interactive smart advisor helping parents discover the ideal learning track for their child with instant local currency pricing and schedule matching.',
      ogTitle: 'Learning Path Advisor | Noor & Bayan Academy',
      ogDescription: 'Find the right program and schedule for your child with personalized recommendations.',
      image: '/assets/aistudio/teacher_hijab_classroom.jpg',
      imageAlt: 'Learning Path Advisor - Noor & Bayan Academy',
      imageWidth: 1024,
      imageHeight: 768,
      imageType: 'image/jpeg',
    },
  },

  '/mothers': {
    ar: {
      title: 'واحة الأمهات والاستشارات الأسرية | أكاديمية نور وبيان',
      description: 'مساحة دعم متخصصة للأمهات تقدم استشارات تربوية معتمدة، وحلولاً عملية لتعديل سلوك الطفل، تنظيم وقت الشاشات، وتعزيز الاتصال الأسري.',
      ogTitle: 'واحة الأمهات والاستشارات التربوية | أكاديمية نور وبيان',
      ogDescription: 'جلسات استشارية حية ومجتمع داعم لكل أم تسعى لتربية إيجابية متوازنة لأبنائها.',
      image: '/images/mothers_session.jpg',
      imageAlt: 'واحة الأمهات والاستشارات التربوية والأسرية - أكاديمية نور وبيان',
      imageWidth: 1200,
      imageHeight: 630,
      imageType: 'image/jpeg',
    },
    en: {
      title: "Mothers' Oasis & Parenting Guidance | Noor & Bayan Academy",
      description: "Dedicated support haven for mothers offering expert child development counseling, screen-time balance strategies, and family wellness.",
      ogTitle: "Mothers' Oasis & Parenting Guidance | Noor & Bayan Academy",
      ogDescription: 'Evidence-based parenting advice and certified counselors for balanced child development.',
      image: '/images/mothers_session.jpg',
      imageAlt: "Mothers' Oasis & Family Guidance - Noor & Bayan Academy",
      imageWidth: 1200,
      imageHeight: 630,
      imageType: 'image/jpeg',
    },
  },

  '/progress': {
    ar: {
      title: 'لوحة متابعة إنجاز وحفظ الطالب | أكاديمية نور وبيان',
      description: 'نموذج تفاعلي يوضح كيف يتابع أولياء الأمور إنجاز الطفل في حفظ سور القرآن الكريم، وملاحظات المعلم المجاز وتقارير الحضور الدورية.',
      ogTitle: 'لوحة إنجاز وحفظ الطالب | أكاديمية نور وبيان',
      ogDescription: 'نظام شفاف لمتابعة تقدم طفلك التعليمي وحفظه القرآني حصة بحصة.',
      image: '/assets/programs/quran_islamic.jpg',
      imageAlt: 'لوحة إنجاز وحفظ الطالب - أكاديمية نور وبيان',
      imageWidth: 1040,
      imageHeight: 832,
      imageType: 'image/jpeg',
    },
    en: {
      title: 'Student Achievement & Progress Tracker | Noor & Bayan Academy',
      description: 'Interactive demonstration of student progress tracking: Quran surah milestones, certified teacher evaluations, and attendance reports.',
      ogTitle: 'Student Achievement Tracker | Noor & Bayan Academy',
      ogDescription: 'Transparent reporting and milestone tracking for every session.',
      image: '/assets/programs/quran_islamic.jpg',
      imageAlt: 'Student Achievement & Progress Tracker - Noor & Bayan Academy',
      imageWidth: 1040,
      imageHeight: 832,
      imageType: 'image/jpeg',
    },
  },

  '/certificates': {
    ar: {
      title: 'استوديو الشهادات ولوحات الشرف | أكاديمية نور وبيان',
      description: 'استعرض وصمّم شهادات التقدير وإتمام الحفظ والأوسمة التشجيعية الممنوحة لطلاب وطالبات أكاديمية نور وبيان.',
      ogTitle: 'استوديو الشهادات ولوحات الشرف | أكاديمية نور وبيان',
      ogDescription: 'شهادات إتمام الحفظ والتميز الدراسي الصادرة لطلاب أكاديمية نور وبيان.',
      image: '/assets/programs/quran_islamic.jpg',
      imageAlt: 'شهادات التقدير ولوحات الشرف - أكاديمية نور وبيان',
      imageWidth: 1040,
      imageHeight: 832,
      imageType: 'image/jpeg',
    },
    en: {
      title: 'Certificates & Honor Roll Studio | Noor & Bayan Academy',
      description: 'Explore and design student achievement certificates, completion diplomas, and honors awarded by Noor & Bayan Academy.',
      ogTitle: 'Certificates Studio | Noor & Bayan Academy',
      ogDescription: 'Official certificates of Quran completion and academic excellence.',
      image: '/assets/programs/quran_islamic.jpg',
      imageAlt: 'Honor Roll & Certificate Studio - Noor & Bayan Academy',
      imageWidth: 1040,
      imageHeight: 832,
      imageType: 'image/jpeg',
    },
  },

  '/games': {
    ar: {
      title: 'واحة الألعاب والمسابقات الذكية | أكاديمية نور وبيان',
      description: 'ألعاب تفاعلية علمية وقرآنية للأطفال: أركيد صائد التجويد 60fps، وتحدي رواد العلوم والإعجاز في القرآن، وسباق ترتيب الآيات والسور.',
      ogTitle: 'واحة الألعاب التعليمية والقرآنية | أكاديمية نور وبيان',
      ogDescription: 'ألعاب أركيد وتحديات علمية ممتعة تجمع بين التسلية المشوقة والفوائد المعرفية في التجويد والعلوم والقرآن.',
      image: '/images/arabic_stem_robotics_kids_1793317242654.jpg',
      imageAlt: 'واحة الألعاب والمسابقات التعليمية والقرآنية - أكاديمية نور وبيان',
      imageWidth: 1200,
      imageHeight: 630,
      imageType: 'image/jpeg',
    },
    en: {
      title: 'Smart Educational & Quran Games Arcade | Noor & Bayan Academy',
      description: 'Interactive educational games: 60fps Tajweed arcade, Quranic science wonders quest, and Ayah arrangement speed puzzle.',
      ogTitle: 'Educational Games Arcade | Noor & Bayan Academy',
      ogDescription: 'Real-time games combining arcade entertainment with Quranic and scientific knowledge for children.',
      image: '/images/arabic_stem_robotics_kids_1793317242654.jpg',
      imageAlt: 'Smart Educational Games Arcade - Noor & Bayan Academy',
      imageWidth: 1200,
      imageHeight: 630,
      imageType: 'image/jpeg',
    },
  },

  '/contact': {
    ar: {
      title: 'تواصل معنا وحجز المقاعد | أكاديمية نور وبيان',
      description: 'تواصل مع إدارة أكاديمية نور وبيان التعليمية لحجز حصة تجريبية مجانية أو طرح استفساراتك عبر نموذج المراسلة المباشر أو الواتساب الرسمي.',
      ogTitle: 'تواصل معنا | أكاديمية نور وبيان التعليمية للأطفال',
      ogDescription: 'فريق الإرشاد الأكاديمي جاهز للرد على استفساراتكم ومساعدتكم في اختيار الحلقات المناسبة.',
      image: '/assets/aistudio/teacher_hijab_classroom.jpg',
      imageAlt: 'تواصل مع أكاديمية نور وبيان التعليمية للأطفال',
      imageWidth: 1024,
      imageHeight: 768,
      imageType: 'image/jpeg',
    },
    en: {
      title: 'Contact Us & Free Trial Booking | Noor & Bayan Academy',
      description: 'Get in touch with Noor & Bayan Academy for free trial bookings, admissions inquiries, and support via WhatsApp or online ticket.',
      ogTitle: 'Contact Us | Noor & Bayan Academy',
      ogDescription: 'Our academic advisory team is available to answer your questions and arrange trial lessons.',
      image: '/assets/aistudio/teacher_hijab_classroom.jpg',
      imageAlt: 'Contact Noor & Bayan Academy',
      imageWidth: 1024,
      imageHeight: 768,
      imageType: 'image/jpeg',
    },
  },

  '/portal': {
    ar: {
      title: 'بوابة المعلمين والإدارة | أكاديمية نور وبيان',
      description: 'بوابة الدخول الآمنة لمعلمي وإداريي أكاديمية نور وبيان لإدارة الحلقات والطلاب وسجلات المتابعة.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'بوابة الإدارة والمعلمين - أكاديمية نور وبيان',
      noindex: true,
    },
    en: {
      title: 'Staff & Teacher Portal | Noor & Bayan Academy',
      description: 'Secure management portal for authorized teachers and staff at Noor & Bayan Academy.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'Staff & Teacher Portal - Noor & Bayan Academy',
      noindex: true,
    },
  },

  '/supabase-admin': {
    ar: {
      title: 'لوحة تحكم Supabase لإدارة الأكاديمية | أكاديمية نور وبيان',
      description: 'لوحة تحكم متكاملة لمدير الأكاديمية مرتبطة بقاعدة بيانات Supabase لإدارة الطلاب، المعلمين، الاشتراكات والدروس.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'لوحة تحكم Supabase - أكاديمية نور وبيان',
      noindex: true,
    },
    en: {
      title: 'Supabase Admin Dashboard | Noor & Bayan Academy',
      description: 'Full-featured academy admin dashboard integrated with Supabase database for students, teachers, subscriptions, and lessons.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'Supabase Admin Dashboard - Noor & Bayan Academy',
      noindex: true,
    },
  },

  '/privacy': {
    ar: {
      title: 'سياسة الخصوصية وحماية بيانات الأطفال | أكاديمية نور وبيان',
      description: 'سياسة الخصوصية وحماية بيانات الأطفال وأولياء الأمور في أكاديمية نور وبيان وفق أعلى معايير أمن المعلومات والسرية التامة.',
      ogTitle: 'سياسة الخصوصية وحماية البيانات | أكاديمية نور وبيان',
      ogDescription: 'التزامنا الكامل بحماية خصوصية الأطفال وسرية بيانات أولياء الأمور.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'سياسة الخصوصية - أكاديمية نور وبيان',
    },
    en: {
      title: 'Privacy Policy & Child Safety | Noor & Bayan Academy',
      description: 'Data protection standards, child privacy guidelines, and information confidentiality at Noor & Bayan Academy.',
      ogTitle: 'Privacy Policy | Noor & Bayan Academy',
      ogDescription: 'Our commitment to child data privacy and information security.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'Privacy Policy - Noor & Bayan Academy',
    },
  },

  '/terms': {
    ar: {
      title: 'الشروط والأحكام الأكاديمية | أكاديمية نور وبيان',
      description: 'الشروط والأحكام وسياسات الاشتراك والحصص والاشتراطات الأكاديمية لأكاديمية نور وبيان التعليمية للأطفال.',
      ogTitle: 'الشروط والأحكام | أكاديمية نور وبيان',
      ogDescription: 'سياسات الحضور والاشتراك والضوابط التعليمية في الأكاديمية.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'الشروط والأحكام الأكاديمية - أكاديمية نور وبيان',
    },
    en: {
      title: 'Terms & Academic Conditions | Noor & Bayan Academy',
      description: 'Terms of service, subscription policies, and academic guidelines of Noor & Bayan Academy.',
      ogTitle: 'Terms & Conditions | Noor & Bayan Academy',
      ogDescription: 'Policies for attendance, enrollment, and classroom participation.',
      image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
      imageAlt: 'Terms and Conditions - Noor & Bayan Academy',
    },
  },
};

export const NOT_FOUND_SEO: Record<Language, RouteSeoData> = {
  ar: {
    title: 'الصفحة غير موجودة (404) | أكاديمية نور وبيان',
    description: 'عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها في أكاديمية نور وبيان.',
    image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
    imageAlt: 'الصفحة غير موجودة - أكاديمية نور وبيان',
    noindex: true,
  },
  en: {
    title: 'Page Not Found (404) | Noor & Bayan Academy',
    description: 'Sorry, the requested page could not be found or has been moved on Noor & Bayan Academy.',
    image: '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg',
    imageAlt: 'Page Not Found - Noor & Bayan Academy',
    noindex: true,
  },
};
