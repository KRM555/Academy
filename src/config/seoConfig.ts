import { Language } from '../data/translations';

export interface RouteSeoData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
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
      image: '/images/hero_learning.jpg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'أكاديمية نور وبيان التعليمية',
        alternateName: 'Noor & Bayan Academy',
        url: 'https://academy.com',
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
      image: '/images/hero_learning.jpg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Noor & Bayan Academy',
        url: 'https://academy.com',
        description: '100% live online platform for Quran recitation and Arabic literacy for children.',
      },
    },
  },

  '/programs': {
    ar: {
      title: 'دليل البرامج والمناهج التعليمية | أكاديمية نور وبيان',
      description: 'استكشف برامج أكاديمية نور وبيان: حلقات تحفيظ القرآن، القاعدة النورانية، فصاحة اللسان العربي، غرس القيم والأخلاق، ونادي البرمجة والذكاء للأطفال.',
      ogTitle: 'دليل البرامج والمناهج التعليمية | أكاديمية نور وبيان',
      ogDescription: 'مناهج حية ومتكاملة بإشراف معلمين مجازين: قرآن كريم، لغة عربية، قيم وسلوك، ومهارات المستقبل.',
      image: '/images/quran_kids.jpg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: [
          { '@type': 'Course', name: 'حلقات "نور يتلى" لتحفيظ القرآن', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'منهاج "البيان القرآني" والتأسيس اللغوي', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'برنامج "أشبال القرآن" وغرس القيم', provider: 'أكاديمية نور وبيان' },
          { '@type': 'Course', name: 'نادي المهارات الذكية والبرمجة', provider: 'أكاديمية نور وبيان' },
        ],
      },
    },
    en: {
      title: 'Curriculum & Programs Catalog | Noor & Bayan Academy',
      description: 'Explore live courses: Quran memorization with Tajweed, Noorani Arabic literacy, character values, and STEM coding for kids.',
      ogTitle: 'Curriculum & Programs Catalog | Noor & Bayan Academy',
      ogDescription: 'Certified scholars teaching Quran, Arabic reading, ethics, and future tech skills in small virtual classrooms.',
      image: '/images/quran_kids.jpg',
    },
  },

  '/advisor': {
    ar: {
      title: 'مستشار المسار التعليمي وتحديد المستوى | أكاديمية نور وبيان',
      description: 'أداة تفاعلية ذكية تساعدك في اختيار البرنامج الأنسب لطفلك وتحديد مسار التعلم وحساب الرسوم تلقائياً بعملتك المحلية وتوقيتك المفضل.',
      ogTitle: 'مستشار المسار التعليمي للأطفال | أكاديمية نور وبيان',
      ogDescription: 'اختر المسار الأكاديمي المثالي لطفلك حسب عمره واحتياجاته مع حساب فوري للرسوم والمواعيد.',
      image: '/images/hero_learning.jpg',
    },
    en: {
      title: 'Learning Path Advisor & Level Assessment | Noor & Bayan Academy',
      description: 'Interactive smart advisor helping parents discover the ideal learning track for their child with instant local currency pricing and schedule matching.',
      ogTitle: 'Learning Path Advisor | Noor & Bayan Academy',
      ogDescription: 'Find the right program and schedule for your child with personalized recommendations.',
      image: '/images/hero_learning.jpg',
    },
  },

  '/mothers': {
    ar: {
      title: 'واحة الأمهات والاستشارات الأسرية | أكاديمية نور وبيان',
      description: 'مساحة دعم متخصصة للأمهات تقدم استشارات تربوية معتمدة، وحلولاً عملية لتعديل سلوك الطفل، تنظيم وقت الشاشات، وتعزيز الاتصال الأسري.',
      ogTitle: 'واحة الأمهات والاستشارات التربوية | أكاديمية نور وبيان',
      ogDescription: 'جلسات استشارية حية ومجتمع داعم لكل أم تسعى لتربية إيجابية متوازنة لأبنائها.',
      image: '/images/mothers_session.jpg',
    },
    en: {
      title: "Mothers' Oasis & Parenting Guidance | Noor & Bayan Academy",
      description: "Dedicated support haven for mothers offering expert child development counseling, screen-time balance strategies, and family wellness.",
      ogTitle: "Mothers' Oasis & Parenting Guidance | Noor & Bayan Academy",
      ogDescription: 'Evidence-based parenting advice and certified counselors for balanced child development.',
      image: '/images/mothers_session.jpg',
    },
  },

  '/progress': {
    ar: {
      title: 'لوحة متابعة إنجاز وحفظ الطالب | أكاديمية نور وبيان',
      description: 'نموذج تفاعلي يوضح كيف يتابع أولياء الأمور إنجاز الطفل في حفظ سور القرآن الكريم، وملاحظات المعلم المجاز وتقارير الحضور الدورية.',
      ogTitle: 'لوحة إنجاز وحفظ الطالب | أكاديمية نور وبيان',
      ogDescription: 'نظام شفاف لمتابعة تقدم طفلك التعليمي وحفظه القرآني حصة بحصة.',
      image: '/images/quran_kids.jpg',
    },
    en: {
      title: 'Student Achievement & Progress Tracker | Noor & Bayan Academy',
      description: 'Interactive demonstration of student progress tracking: Quran surah milestones, certified teacher evaluations, and attendance reports.',
      ogTitle: 'Student Achievement Tracker | Noor & Bayan Academy',
      ogDescription: 'Transparent reporting and milestone tracking for every session.',
      image: '/images/quran_kids.jpg',
    },
  },

  '/contact': {
    ar: {
      title: 'تواصل معنا وحجز المقاعد | أكاديمية نور وبيان',
      description: 'تواصل مع إدارة أكاديمية نور وبيان التعليمية لحجز حصة تجريبية مجانية أو طرح استفساراتك عبر نموذج المراسلة المباشر أو الواتساب الرسمي.',
      ogTitle: 'تواصل معنا | أكاديمية نور وبيان التعليمية للأطفال',
      ogDescription: 'فريق الإرشاد الأكاديمي جاهز للرد على استفساراتكم ومساعدتكم في اختيار الحلقات المناسبة.',
      image: '/images/hero_learning.jpg',
    },
    en: {
      title: 'Contact Us & Free Trial Booking | Noor & Bayan Academy',
      description: 'Get in touch with Noor & Bayan Academy for free trial bookings, admissions inquiries, and support via WhatsApp or online ticket.',
      ogTitle: 'Contact Us | Noor & Bayan Academy',
      ogDescription: 'Our academic advisory team is available to answer your questions and arrange trial lessons.',
      image: '/images/hero_learning.jpg',
    },
  },

  '/portal': {
    ar: {
      title: 'بوابة المعلمين والإدارة | أكاديمية نور وبيان',
      description: 'بوابة الدخول الآمنة لمعلمي وإداريي أكاديمية نور وبيان لإدارة الحلقات والطلاب وسجلات المتابعة.',
      noindex: true,
    },
    en: {
      title: 'Staff & Teacher Portal | Noor & Bayan Academy',
      description: 'Secure management portal for authorized teachers and staff at Noor & Bayan Academy.',
      noindex: true,
    },
  },

  '/privacy': {
    ar: {
      title: 'سياسة الخصوصية وحماية بيانات الأطفال | أكاديمية نور وبيان',
      description: 'سياسة الخصوصية وحماية بيانات الأطفال وأولياء الأمور في أكاديمية نور وبيان وفق أعلى معايير أمن المعلومات والسرية التامة.',
      ogTitle: 'سياسة الخصوصية وحماية البيانات | أكاديمية نور وبيان',
      ogDescription: 'التزامنا الكامل بحماية خصوصية الأطفال وسرية بيانات أولياء الأمور.',
      image: '/images/hero_learning.jpg',
    },
    en: {
      title: 'Privacy Policy & Child Safety | Noor & Bayan Academy',
      description: 'Data protection standards, child privacy guidelines, and information confidentiality at Noor & Bayan Academy.',
      ogTitle: 'Privacy Policy | Noor & Bayan Academy',
      ogDescription: 'Our commitment to child data privacy and information security.',
      image: '/images/hero_learning.jpg',
    },
  },

  '/terms': {
    ar: {
      title: 'الشروط والأحكام الأكاديمية | أكاديمية نور وبيان',
      description: 'الشروط والأحكام وسياسات الاشتراك والحصص والاشتراطات الأكاديمية لأكاديمية نور وبيان التعليمية للأطفال.',
      ogTitle: 'الشروط والأحكام | أكاديمية نور وبيان',
      ogDescription: 'سياسات الحضور والاشتراك والضوابط التعليمية في الأكاديمية.',
      image: '/images/hero_learning.jpg',
    },
    en: {
      title: 'Terms & Academic Conditions | Noor & Bayan Academy',
      description: 'Terms of service, subscription policies, and academic guidelines of Noor & Bayan Academy.',
      ogTitle: 'Terms & Conditions | Noor & Bayan Academy',
      ogDescription: 'Policies for attendance, enrollment, and classroom participation.',
      image: '/images/hero_learning.jpg',
    },
  },
};

export const NOT_FOUND_SEO: Record<Language, RouteSeoData> = {
  ar: {
    title: 'الصفحة غير موجودة (404) | أكاديمية نور وبيان',
    description: 'عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها في أكاديمية نور وبيان.',
    noindex: true,
  },
  en: {
    title: 'Page Not Found (404) | Noor & Bayan Academy',
    description: 'Sorry, the requested page could not be found or has been moved on Noor & Bayan Academy.',
    noindex: true,
  },
};
