import { Currency, TimezoneInfo, Program } from '../types';

export const CURRENCIES: Currency[] = [
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rateToSar: 1, isApproximate: false },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري (تقريبي)', rateToSar: 13.1, isApproximate: true },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي (تقريبي)', rateToSar: 0.98, isApproximate: true },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي (تقريبي)', rateToSar: 0.082, isApproximate: true },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي (تقريبي)', rateToSar: 0.27, isApproximate: true },
];

export const TIMEZONES: TimezoneInfo[] = [
  { code: 'makkah', name: 'توقيت مكة المكرمة (السعودية والخليج)', ianaZone: 'Asia/Riyadh', offsetLabel: 'GMT+3', utcOffset: 3 },
  { code: 'cairo', name: 'توقيت القاهرة (مصر والشام)', ianaZone: 'Africa/Cairo', offsetLabel: 'توقيت مصر', utcOffset: 2 },
  { code: 'dubai', name: 'توقيت دبي (الإمارات وعُمان)', ianaZone: 'Asia/Dubai', offsetLabel: 'GMT+4', utcOffset: 4 },
  { code: 'london', name: 'توقيت لندن / غرب أوروبا', ianaZone: 'Europe/London', offsetLabel: 'توقيت لندن', utcOffset: 0 },
];

// Helper to format current time in an IANA timezone dynamically accounting for DST
export function formatTimezoneClock(ianaZone: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      timeZone: ianaZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return '';
  }
}

export const ACADEMY_PROGRAMS: Program[] = [
  {
    id: 'prog-noor-yutla',
    title: 'حلقات تحفيظ القرآن الكريم وتجويده',
    subtitle: 'حفظ وتثبيت القرآن الكريم بالترتيل المجوّد ومراعاة مخارج الحروف للأطفال',
    ageBracket: '5 - 14 سنة',
    minAge: 5,
    maxAge: 14,
    category: 'quran',
    deliveryMode: 'online',
    image: '/images/quran_kids.jpg',
    description: 'رحلة إيمانية وتعليمية أونلاين عبر غرف زوم التفاعلية، تركز على الحفظ المتقن، التفسير الميسر، وفهم معاني الآيات بأسلوب تربوي يناسب مدارك الطفل.',
    weeklySessions: 3,
    sessionDurationMins: 45,
    priceSar: 280,
    billingUnit: 'شهرياً',
    installmentsEligible: true,
    features: [
      'حلقات مصغرة مباشرة عبر زوم',
      'معلمون متخصصون في تعليم الصغار برفق وتشجيع',
      'تسميع تفاعلي ومتابعة مستمرة لولي الأمر',
      'سجل متابعة إنجاز لكل سورة يتم إتمامها',
    ],
    syllabusWeeks: [
      { week: 1, topic: 'ضبط مخارج الحروف والاستعاذة والبسملة', details: 'تدريب صوتي تفاعلي على مخرج الحلق واللسان والشفتين مع سورة الفاتحة.' },
      { week: 2, topic: 'حفظ وتثبيت قصار السور من جزء عم', details: 'حفظ سور الإخلاص، الفلق، الناس، والمسد مع فهم المعاني العامة.' },
      { week: 3, topic: 'أحكام النون الساكنة والتنوين (الإظهار والإدغام)', details: 'تطبيقات عملية على أمثلة من الآيات بتوجيه المعلم.' },
      { week: 4, topic: 'الوقف والابتداء والترتيل المتصل', details: 'مراجعة تثبيت ومتابعة صوتية مع ولي الأمر.' },
    ],
  },
  {
    id: 'prog-nooraniyah',
    title: 'التأسيس اللغوي والقراءة السليمة والتهجئة',
    subtitle: 'تأسيس الطفل في القراءة الصحيحة والنطق الفصيح بأسلوب تفاعلي مرح',
    ageBracket: '4 - 7 سنوات',
    minAge: 4,
    maxAge: 7,
    category: 'arabic',
    deliveryMode: 'online',
    image: '/images/hero_learning.jpg',
    description: 'منهج متدرج لتأسيس نطق الحروف العربية بحركاتها وسكناتها، وتمكين الطفل من قراءة كلمات القرآن واللغة العربية بطلاقة وسرعة وبدون تعثر.',
    weeklySessions: 3,
    sessionDurationMins: 45,
    priceSar: 260,
    billingUnit: 'شهرياً',
    installmentsEligible: true,
    features: [
      'التدرج من الحروف المجردة إلى الكلمات والجمل',
      'تدريب النطق الفصيح والمخارج الدقيقة',
      'تمارين قراءة بصرية وتمييز الأصوات المتشابهة',
      'بطاقات تعليمية رقمية مساعدة للتدريب المنزلي',
    ],
    syllabusWeeks: [
      { week: 1, topic: 'أصوات الحروف بالحركات القصيرة (الفتح والكسر والضم)', details: 'تمييز نطق الحروف المشابهة صوتياً مثل (ت/ط، د/ض، س/ص).' },
      { week: 2, topic: 'المدود الطويلة (مد بالألف، الواو، والياء)', details: 'تدريبات إيقاعية لتمديد الصوت دون إفراط وقراءة مقاطع ثنائية.' },
      { week: 3, topic: 'السكون ومفهوم المقطع الساكن', details: 'نطق الحرف الساكن متصلاً بما قبله وتفكيك الكلمات لمقاطع.' },
      { week: 4, topic: 'قراءة كلمات ثلاثية ورباعية من المصحف الشريف', details: 'قراءة جمل قصيرة فصيحة وتكريم الطفل على إتقان التهجئة.' },
    ],
  },
  {
    id: 'prog-values-character',
    title: 'غرس القيم وبناء الشخصية وتعديل السلوك',
    subtitle: 'برنامج تربوي قيمي يدمج الآداب النبوية والسلوكيات الإيجابية في مواقف تفاعلية',
    ageBracket: '6 - 12 سنة',
    minAge: 6,
    maxAge: 12,
    category: 'values',
    deliveryMode: 'online',
    image: '/images/mothers_session.jpg',
    description: 'فصول حوارية تفاعلية تعزز بر الوالدين، الصدق، الأمانة، احترام الآخرين، وترويض نوبات الغضب والتعلق بالشاشات بأسلوب قصصي ملهم.',
    weeklySessions: 2,
    sessionDurationMins: 50,
    priceSar: 240,
    billingUnit: 'شهرياً',
    installmentsEligible: true,
    features: [
      'جلسات حوارية وقصص ملهمة من السيرة النبوية',
      'أنشطة وتحديات سلوكية أسبوعية تطبق في المنزل',
      'توجيه تربوي متزن لتعديل السلوك وبناء الثقة',
      'تواصل منتظم مع الأسرة لقياس أثر التغيير الإيجابي',
    ],
    syllabusWeeks: [
      { week: 1, topic: 'قيمة الصدق والشجاعة الأدبية', details: 'موقف قصصي تفاعلي يوضح الفرق بين الاعتراف بالخطأ والتهرب منه.' },
      { week: 2, topic: 'بر الوالدين وخفض الجناح في المنزل', details: 'تحدي أسبوعي لتقديم مساعدة تطوعية للأم والأب مع بطاقة امتنان.' },
      { week: 3, topic: 'إدارة المشاعر والغضب عند الخسارة', details: 'تمارين عملية للتحكم في الانفعال وحل الخلافات مع الإخوة والأصدقاء.' },
      { week: 4, topic: 'الأمانة والمحافظة على مقتنيات الآخرين', details: 'تطبيق عملي حول احترام ملكية الغير وحفظ الأسرار والعهود.' },
    ],
  },
  {
    id: 'prog-young-coders',
    title: 'نادي البرمجة والتفكير المنطقي للصغار',
    subtitle: 'تعليم أساسيات التفكير الخوارزمي وبناء الألعاب والقصص التفاعلية',
    ageBracket: '7 - 14 سنة',
    minAge: 7,
    maxAge: 14,
    category: 'tech',
    deliveryMode: 'online',
    image: '/images/stem_robotics.jpg',
    description: 'بيئة تعليمية ممتعة باللغة العربية تمكن الطفل من فهم كيفية عمل التكنولوجيا والبرمجة من خلال لغات بصرية قائمة على الكتل البرمجية.',
    weeklySessions: 2,
    sessionDurationMins: 60,
    priceSar: 340,
    billingUnit: 'شهرياً',
    installmentsEligible: true,
    features: [
      'مشاريع تطبيقية لبناء ألعاب وقصص تفاعلية',
      'تطوير التفكير المنطقي ومهارات حل المشكلات',
      'منصة آمنة وموجهة للأطفال مع معلمين متخصصين',
      'عرض مشاريع الطلاب الأسبوعية ومشاركتها مع الأهل',
    ],
    syllabusWeeks: [
      { week: 1, topic: 'مفهوم الخوارزميات والتسلسل المنطقي', details: 'تمارين تفاعلية لترتيب الأوامر والخطوات بدقة لتحقيق هدف محدد.' },
      { week: 2, topic: 'الحلقات التكرارية والشروط البرمجية', details: 'بناء حركة متكررة لشخصية كرتونية مع شرط التفاعل عند الضغط.' },
      { week: 3, topic: 'الأحداث والتفاعل مع لوحة المفاتيح والفأرة', details: 'تصميم لعبة بسيطة تتفاعل مع حركة أسهم لوحة المفاتيح والقفز.' },
      { week: 4, topic: 'المشروع الختامي: إطلاق لعبة تفاعلية كاملة', details: 'برمجة لعبة متكاملة ونشرها على المنصة الآمنة للأطفال.' },
    ],
  },
];
