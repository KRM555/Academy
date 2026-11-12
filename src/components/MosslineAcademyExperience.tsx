import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Award,
  GraduationCap,
  Calculator,
  Video,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Compass,
  Layers,
  ChevronDown,
  ExternalLink,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Language } from '../data/translations';

interface MosslineAcademyExperienceProps {
  currentLanguage: Language;
  onOpenTrial: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPrograms?: () => void;
}

export const MosslineAcademyExperience: React.FC<MosslineAcademyExperienceProps> = ({
  currentLanguage,
  onOpenTrial,
  onNavigateToDashboard,
  onNavigateToPrograms,
}) => {
  const isAr = currentLanguage === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Video scrub & scroll state
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [videoDuration, setVideoDuration] = useState(5.04);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Sparkline animated progress (Beat 4)
  const [sparklineHoverIndex, setSparklineHoverIndex] = useState<number | null>(null);

  // 3D Card tilt state (Beat 5)
  const [cardTilt, setCardTilt] = useState<{ [key: number]: { x: number; y: number } }>({});

  const videoUrl =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261106_025717_906b686d-9a9a-4dea-bab4-ae2454f8390e.mp4';

  // Scrub video on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalHeight, 0), 1);
      setScrollProgress(progress);

      // Scrub the video time
      if (videoRef.current && isVideoLoaded && videoRef.current.duration) {
        const targetTime = progress * videoRef.current.duration;
        // Only update if difference > 0.05s to prevent jerky video stalls
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.04) {
          videoRef.current.currentTime = targetTime;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVideoLoaded]);

  // Handle video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 5.04);
      setIsVideoLoaded(true);
      videoRef.current.pause();
    }
  };

  // Hotspots definitions (Beat 3)
  const hotspots = [
    {
      id: 1,
      title: isAr ? 'حلقات القرآن والتجويد بالسند' : 'Quran & Tajweed with Sanad',
      desc: isAr
        ? 'حفظ متقن مع تصحيح مخارج الحروف وأحكام التلاوة مع نخبة مشايخ الأزهر الشريف.'
        : 'Mastery of memorization and Tajweed rules with certified Azhar scholars.',
      icon: BookOpen,
      top: '38%',
      left: isAr ? '70%' : '30%',
      category: isAr ? 'إتقان التلاوة' : 'Mastery',
      studentsCount: 240,
    },
    {
      id: 2,
      title: isAr ? 'تأسيس نور البيان والقراءة الفصيحة' : 'Noor Al-Bayan Arabic Literacy',
      desc: isAr
        ? 'منهجية تفاعلية تمكّن الطفل من القراءة والكتابة والطلاقة اللغوية خلال أسابيع معدودة.'
        : 'Proven interactive methodology enabling fluent Arabic reading & writing.',
      icon: Sparkles,
      top: '52%',
      left: isAr ? '30%' : '65%',
      category: isAr ? 'اللغة العربية' : 'Arabic Core',
      studentsCount: 310,
    },
    {
      id: 3,
      title: isAr ? 'المناهج الدولية واللغات الأجنبية' : 'International Curricula & English',
      desc: isAr
        ? 'شرح تفاعلي لكافة المواد العلمية واللغوية بأساليب التفكير النقدي وحل المشكلات.'
        : 'Comprehensive support for international curricula and language acquisition.',
      icon: GraduationCap,
      top: '68%',
      left: isAr ? '75%' : '25%',
      category: isAr ? 'المناهج المدرسية' : 'Curricula',
      studentsCount: 180,
    },
    {
      id: 4,
      title: isAr ? 'الحساب الذهني والسوروبان والذكاء' : 'Mental Math, Soroban & Logic',
      desc: isAr
        ? 'تنشيط نصفي الدماغ وزيادة التركيز الحسابي الفائق وسرعة البديهة الرياضية للطفل.'
        : 'Activating mental agility, rapid calculation, and concentration for youth.',
      icon: Calculator,
      top: '48%',
      left: isAr ? '50%' : '50%',
      category: isAr ? 'العبقرية الذهنية' : 'Brain Agility',
      studentsCount: 195,
    },
  ];

  // Learning hours count-up calculated from progress (Beat 4)
  const learningHours = useMemo(() => {
    const base = 12400;
    const added = Math.floor(scrollProgress * 2420);
    return (base + added).toLocaleString('ar-EG');
  }, [scrollProgress]);

  // Feature rows (Beat 4)
  const features = [
    {
      title: isAr ? 'فصول تفاعلية حية 1-على-1 ومجموعات مصغرة' : 'Live Interactive 1-on-1 & Micro Groups',
      desc: isAr ? 'لا تسجيلات مسجلة سلبية؛ الحصة تفاعلية ومباشرة بالكامل مع المعلم' : '100% live video interactions with teachers, no passive video recording',
    },
    {
      title: isAr ? 'روابط محاضرات Zoom و Meet مشفرة ومتصلة بـ Supabase' : 'Encrypted Zoom & Meet links synced to Supabase',
      desc: isAr ? 'دخول فوري بضغطة زر واحدة لكل طالب من لوحته الخاصة' : 'One-click direct room access for assigned students and teachers',
    },
    {
      title: isAr ? 'معلمون ومعلمات مجازون متخصصون في نفسية الطفل' : 'Certified scholars & certified child pedagogy experts',
      desc: isAr ? 'أساليب تحفيزية بالنجوم والأوسمة تبني حب التعلم بلا إكراه' : 'Positive reinforcement with digital awards, badges, and warm mentorship',
    },
    {
      title: isAr ? 'تقارير أداء فورية لولي الأمر مع شهادات تكريم رقمية' : 'Live parent progress tracking & digital verified certificates',
      desc: isAr ? 'متابعة دورية لكل حصة، مراجعة السور، ودفتر الملاحظات اليومي' : 'Real-time parent alerts on lessons, homework, and weekly achievements',
    },
    {
      title: isAr ? 'حصة تجريبية مجانية 100% وتحديد دقيق للمستوى' : '100% Free Trial Class & Accurate Placement Test',
      desc: isAr ? 'جرب الحصة الأولى مجاناً وتعرّف على المعلم المناسب لطفلك' : 'Experience the first lesson completely free with zero commitment',
    },
  ];

  // Solution cards (Beat 5)
  const solutionCards = [
    {
      id: 1,
      badge: isAr ? 'مسار القرآن الكريم' : 'Quran Track',
      title: isAr ? 'التاج الذهبي لحفظ القرآن وتجويده' : 'Golden Crown Quran Memorization',
      desc: isAr
        ? 'حفظ فردي مصمم بدقة ليتناسب مع سن الطفل وقدرته الاستيعابية، مع تصحيح مخارج الحروف وأحكام التجويد والوقف والابتداء.'
        : 'Tailored Quran recitation & memorization with certified Tajweed masters.',
      img: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=700&q=80',
      tag: 'QURAN & TAJWEED',
      accent: '#c6f35c',
    },
    {
      id: 2,
      badge: isAr ? 'مسار القراءة والبيان' : 'Arabic & Noor Bayan',
      title: isAr ? 'أكاديمية نور البيان والطلاقة اللغوية' : 'Noor Al-Bayan Arabic Fluency',
      desc: isAr
        ? 'تأسيس متين للأطفال الناطقين بالعربية والمغتربين لقراءة المصحف والكتب بطلاقة وسلاسة والتعبير بفصاحة واعتزاز.'
        : 'Foundational literacy for Arab kids and expats to read Quran & texts fluently.',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80',
      tag: 'LANGUAGE & VALUES',
      accent: '#34d399',
    },
    {
      id: 3,
      badge: isAr ? 'مسار العبقرية الذهنية' : 'Mental Agility',
      title: isAr ? 'السوروبان والحساب الذهني والذكاء' : 'Soroban & Mental Arithmetic',
      desc: isAr
        ? 'تدريب الطفل على إجراء العمليات الحسابية المعقدة في ثوانٍ معدودة بدون آلة حاسبة، مما يضاعف الثقة بالنفس والتركيز الأكاديمي.'
        : 'Rapid calculation & memory training without calculators to boost brainpower.',
      img: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=700&q=80',
      tag: 'LOGIC & MATH',
      accent: '#38bdf8',
    },
  ];

  // Mouse move handler for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setCardTilt((prev) => ({ ...prev, [cardId]: { x: rotateX, y: rotateY } }));
  };

  const handleMouseLeave = (cardId: number) => {
    setCardTilt((prev) => ({ ...prev, [cardId]: { x: 0, y: 0 } }));
  };

  // Sparkline points (24 data points representing weekly learning hours)
  const sparklineData = [18, 22, 28, 32, 30, 38, 45, 52, 58, 64, 70, 78, 85, 92, 98, 108, 115, 122, 130, 142, 155, 168, 180, 196];
  const maxVal = Math.max(...sparklineData);
  const minVal = Math.min(...sparklineData);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#e7ebe8] text-[#10291a] selection:bg-[#c6f35c] selection:text-[#10291a] font-['Tajawal',sans-serif]"
      style={{
        // 5-beat scroll pinned track (approx 450vh for cinematic scrub feel)
        height: '450vh',
      }}
    >
      {/* Sticky Fullscreen Story Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Background Scrubbed Video Layer */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#e7ebe8]">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            muted
            preload="auto"
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.04]"
          />
          {/* Subtle mist gradient overlay to keep text legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#e7ebe8]/90 via-transparent to-[#e7ebe8]/60 pointer-events-none" />

          {/* Dynamic Rolling Fog Bank (Beat 3) */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#e7ebe8] via-[#e7ebe8]/70 to-transparent transition-opacity duration-700 pointer-events-none"
            style={{
              opacity: scrollProgress >= 0.35 && scrollProgress <= 0.7 ? 0.85 : 0,
            }}
          />
        </div>

        {/* Top HUD Bar (Verdelo / Mossline Style) */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-[3px] bg-[#c6f35c] text-[#10291a] font-mono text-[10.5px] font-bold tracking-[0.16em] uppercase shadow-xs">
              NOOR & BAYAN
            </span>
            <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-[#2c4434]">
              {isAr ? 'المنصة التعليمية الذكية' : 'ECOSYSTEM FOR SMART LEARNING'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToDashboard}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-[#10291a]/80 hover:bg-[#10291a] text-[#c6f35c] text-xs font-mono tracking-wider backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6f35c] animate-pulse" />
              <span>{isAr ? 'لوحة التحكم الموحدة' : 'UNIFIED DASHBOARD'}</span>
            </button>

            <button
              onClick={onOpenTrial}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] bg-[#c6f35c] hover:bg-[#a9dd3a] text-[#10291a] text-xs font-bold transition-all cursor-pointer shadow-xs font-mono uppercase tracking-wider"
            >
              <span>{isAr ? 'حصة تجريبية مجاناً' : 'FREE TRIAL'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* BEAT 1: HERO (0% to 20% scroll) */}
        {/* ============================================================ */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 my-auto transition-all duration-500 pointer-events-none"
          style={{
            opacity: scrollProgress < 0.22 ? 1 - scrollProgress * 4 : 0,
            transform: `translateY(${scrollProgress * -80}px) scale(${1 - scrollProgress * 0.1})`,
            display: scrollProgress < 0.25 ? 'block' : 'none',
          }}
        >
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#c6f35c] text-[#10291a] text-xs font-mono font-bold tracking-[0.16em] uppercase mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'الجزيرة التعليمية التفاعلية للأطفال' : 'SMART LIVING LEARNING ISLAND'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#10291a] tracking-tight leading-[1.08] font-['Tajawal'] mb-5">
              {isAr ? (
                <>
                  اغرس في طفلك <span className="underline decoration-[#c6f35c] decoration-wavy decoration-4">حب القرآن</span> والعلم
                </>
              ) : (
                'Measure & Grow the Living Intellect'
              )}
            </h1>

            <p className="text-base sm:text-xl text-[#2c4434] max-w-2xl font-medium leading-relaxed mb-6">
              {isAr
                ? 'فصول قرآنية وتربوية حية 100%، تربط أطفالكم ومعلميهم مباشرة على مدار الساعة بتقنيات تفاعلية حديثة وسوبابيز الموثوقة.'
                : 'Interactive 100% live Quranic & academic sessions, connecting students and certified teachers with zero latency.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
              <button
                onClick={onOpenTrial}
                className="px-6 py-3 rounded-lg bg-[#10291a] hover:bg-[#1a3d27] text-[#c6f35c] font-bold text-sm sm:text-base flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-xl cursor-pointer"
              >
                <span>{isAr ? 'ابدأ الحصة التجريبية المجانية' : 'Book Free Placement Lesson'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToPrograms}
                className="px-5 py-3 rounded-lg bg-white/70 hover:bg-white text-[#10291a] font-bold text-sm sm:text-base backdrop-blur-md border border-[#10291a]/15 transition-all cursor-pointer shadow-xs"
              >
                <span>{isAr ? 'استكشف المسارات التعليمية' : 'Explore Programs'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BEAT 2: FLY-IN VISION STATEMENT (20% to 45% scroll) */}
        {/* ============================================================ */}
        <div
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 my-auto transition-all duration-500 pointer-events-none"
          style={{
            opacity:
              scrollProgress >= 0.18 && scrollProgress < 0.45
                ? Math.min((scrollProgress - 0.18) * 8, 1) * (1 - Math.max((scrollProgress - 0.38) * 12, 0))
                : 0,
            transform: `translateY(${(0.3 - scrollProgress) * 60}px)`,
            filter: `blur(${Math.max(Math.abs(scrollProgress - 0.3) * 20 - 1, 0)}px)`,
            display: scrollProgress >= 0.18 && scrollProgress < 0.45 ? 'block' : 'none',
          }}
        >
          <div className="bg-[#10291a]/85 backdrop-blur-xl border border-white/20 p-6 sm:p-10 rounded-2xl shadow-2xl text-white">
            <span className="inline-block px-2.5 py-0.5 rounded bg-[#c6f35c] text-[#10291a] font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-3">
              THE VISION
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-snug tracking-tight text-[#f6f7f4]">
              {isAr
                ? '«تعليم حي يوقظ الفطرة، يُنير العقول بالقرآن، ويهيئ أجيال المستقبل بالفصاحة والذكاء»'
                : '“Live personalized education that nurtures faith, sparks intellectual curiosity, and empowers global youth.”'}
            </h2>
            <div className="mt-5 flex items-center gap-4 text-xs font-mono text-[#c6f35c]">
              <span>// 100% LIVE INTERACTIVE</span>
              <span>// CERTIFIED SCHOLARS</span>
              <span>// ONE UNIFIED PORTAL</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BEAT 3: LANDSCAPE WITH 4 LIME HOTSPOTS (40% to 65% scroll) */}
        {/* ============================================================ */}
        <div
          className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 pointer-events-none"
          style={{
            opacity:
              scrollProgress >= 0.4 && scrollProgress < 0.65
                ? Math.min((scrollProgress - 0.4) * 8, 1) * (1 - Math.max((scrollProgress - 0.58) * 12, 0))
                : 0,
            display: scrollProgress >= 0.4 && scrollProgress < 0.65 ? 'flex' : 'none',
          }}
        >
          {/* Accounting paragraph that writes in */}
          <div className="max-w-xl bg-white/80 dark:bg-[#10291a]/80 backdrop-blur-md p-5 sm:p-6 rounded-xl border border-[#10291a]/15 shadow-lg pointer-events-auto mt-16 sm:mt-24">
            <span className="inline-block px-2 py-0.5 rounded bg-[#c6f35c] text-[#10291a] font-mono text-[10px] font-bold tracking-widest uppercase mb-2">
              DISCOVER LEARNING HOTSPOTS
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#10291a] dark:text-white mb-2">
              {isAr ? 'أربعة أركان راسخة لبناء الطفل المتكامل' : 'Four Pillars of Holistic Growth'}
            </h3>
            <p className="text-xs sm:text-sm text-[#2c4434] dark:text-slate-300 leading-relaxed">
              {isAr
                ? 'انقر على النقاط المضيئة لاستكشاف المسارات التعليمية التي توفرها الأكاديمية لأطفالكم في بيئة آمنة ومحفزة.'
                : 'Hover or click the glowing hotspots on the landscape to explore our core learning tracks.'}
            </p>
          </div>

          {/* Interactive Lime Hotspots positioned over the landscape */}
          <div className="absolute inset-0 pointer-events-none">
            {hotspots.map((spot) => {
              const Icon = spot.icon;
              const isActive = activeHotspot === spot.id;
              return (
                <div
                  key={spot.id}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: spot.top, left: spot.left }}
                >
                  <button
                    onClick={() => setActiveHotspot(isActive ? null : spot.id)}
                    className="relative group cursor-pointer"
                  >
                    {/* Pulsing ring */}
                    <span className="absolute -inset-2 rounded-full bg-[#c6f35c] opacity-75 animate-ping" />
                    <span className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#c6f35c] text-[#10291a] font-bold shadow-lg border-2 border-[#10291a] hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </span>
                  </button>

                  {/* Hotspot details card */}
                  {isActive && (
                    <div className="absolute bottom-full mb-3 rtl:right-1/2 rtl:translate-x-1/2 ltr:left-1/2 ltr:-translate-x-1/2 w-64 sm:w-72 bg-[#10291a] text-white p-4 rounded-xl shadow-2xl border border-[#c6f35c]/40 z-30 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-[#c6f35c] uppercase font-bold tracking-wider">
                          {spot.category}
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {spot.studentsCount}+ {isAr ? 'طالب مسجل' : 'Students'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{spot.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{spot.desc}</p>
                      <button
                        onClick={onOpenTrial}
                        className="w-full py-1.5 rounded bg-[#c6f35c] text-[#10291a] font-bold text-xs hover:bg-[#a9dd3a] transition-colors"
                      >
                        {isAr ? 'حجز حصة تجريبية في هذا المسار' : 'Book Trial for this Track'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* BEAT 4: STATION & ACCUMULATED BALANCE (60% to 82% scroll) */}
        {/* ============================================================ */}
        <div
          className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 my-auto transition-all duration-500 pointer-events-none"
          style={{
            opacity:
              scrollProgress >= 0.58 && scrollProgress < 0.82
                ? Math.min((scrollProgress - 0.58) * 8, 1) * (1 - Math.max((scrollProgress - 0.76) * 12, 0))
                : 0,
            transform: `translateY(${(0.7 - scrollProgress) * 50}px)`,
            display: scrollProgress >= 0.58 && scrollProgress < 0.82 ? 'block' : 'none',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Left/Right: Glass Accumulated Balance Card */}
            <div className="lg:col-span-5 bg-[#10291a]/90 backdrop-blur-xl border border-white/20 p-5 sm:p-7 rounded-2xl shadow-2xl text-white pointer-events-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded bg-[#c6f35c] text-[#10291a] font-mono text-[10.5px] font-bold tracking-widest uppercase">
                  LIVE METRICS
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SUPABASE SYNCED</span>
                </span>
              </div>

              <div className="text-xs uppercase tracking-wider text-slate-300 font-mono">
                {isAr ? 'رصيد ساعات التعلم المباشر المنجزة' : 'ACCUMULATED LIVE LEARNING HOURS'}
              </div>

              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold text-[#c6f35c] mt-2 mb-4 tracking-tight">
                +{learningHours}
              </div>

              {/* Drawing Sparkline */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[11px] font-mono text-slate-300 mb-2 flex justify-between">
                  <span>{isAr ? 'معدل الحصص الأسبوعية' : 'Weekly Live Sessions'}</span>
                  <span className="text-[#c6f35c] font-bold">+28% {isAr ? 'نمو شهري' : 'MoM'}</span>
                </div>
                <div className="h-16 w-full flex items-end gap-1.5">
                  {sparklineData.map((val, idx) => {
                    const heightPercent = ((val - minVal) / (maxVal - minVal)) * 80 + 20;
                    const isHovered = sparklineHoverIndex === idx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setSparklineHoverIndex(idx)}
                        onMouseLeave={() => setSparklineHoverIndex(null)}
                        className="flex-1 rounded-t-xs transition-all duration-150 cursor-pointer relative group"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: isHovered ? '#ffffff' : idx > 18 ? '#c6f35c' : 'rgba(198, 243, 92, 0.45)',
                        }}
                      >
                        {isHovered && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black text-[#c6f35c] font-mono text-[9px] font-bold whitespace-nowrap z-20">
                            {val}h
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5-Row Feature List */}
            <div className="lg:col-span-7 bg-white/90 dark:bg-[#10291a]/85 backdrop-blur-md p-5 sm:p-7 rounded-2xl border border-[#10291a]/15 shadow-xl text-[#10291a] dark:text-white pointer-events-auto">
              <h3 className="text-lg sm:text-xl font-extrabold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-[#c6f35c]" />
                <span>{isAr ? 'منظومة الجودة الأكاديمية المباشرة' : 'Ecosystem of Direct Quality'}</span>
              </h3>
              <div className="divide-y divide-slate-200 dark:divide-white/10">
                {features.map((feat, i) => (
                  <div key={i} className="py-2.5 sm:py-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#c6f35c] text-[#10291a] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#10291a] dark:text-white">{feat.title}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-4 flex items-center justify-between text-xs font-mono text-[#2c4434] pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10291a]" />
            <span>
              {isAr ? 'مرر للأسفل لاستكشاف الجزيرة' : 'SCROLL TO FLY IN'} ({Math.round(scrollProgress * 100)}%)
            </span>
          </div>

          <div className="w-32 sm:w-48 h-1 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10291a] transition-all duration-100"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
        </footer>
      </div>

      {/* ============================================================ */}
      {/* BEAT 5: SOLUTIONS SECTION (Slides up on final scroll) */}
      {/* ============================================================ */}
      <section className="relative z-30 w-full bg-[#f6f7f4] text-[#10291a] rounded-t-[32px] sm:rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] -mt-20 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-block px-3 py-1 rounded-[3px] bg-[#c6f35c] text-[#10291a] font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-3 shadow-xs">
              TRACKS & SOLUTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#10291a] font-['Tajawal'] mb-4">
              {isAr ? 'مسارات أكاديمية متكاملة تصنع الفارق' : 'Holistic Pathways Built for Excellence'}
            </h2>
            <p className="text-sm sm:text-base text-[#2c4434] leading-relaxed">
              {isAr
                ? 'نجمع بين أصالة العلوم الشرعية واللغة العربية، وأحدث مناهج التفكير الرياضي واللغات الدولية.'
                : 'Combining the authenticity of Quranic sciences with cutting-edge academic excellence.'}
            </p>
          </div>

          {/* 3 Tilting Image Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {solutionCards.map((card) => {
              const tilt = cardTilt[card.id] || { x: 0, y: 0 };
              return (
                <div
                  key={card.id}
                  onMouseMove={(e) => handleMouseMove(e, card.id)}
                  onMouseLeave={() => handleMouseLeave(card.id)}
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 hover:shadow-2xl transition-shadow flex flex-col justify-between group"
                >
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 rtl:right-4 ltr:left-4">
                      <span className="px-2.5 py-1 rounded bg-[#10291a]/80 backdrop-blur-md text-[#c6f35c] font-mono text-[10px] font-bold tracking-wider uppercase border border-white/10">
                        {card.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-4 rtl:right-4 ltr:left-4">
                      <span className="text-xs font-bold text-white bg-black/40 px-2.5 py-0.5 rounded backdrop-blur-sm">
                        {card.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#10291a] mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5">
                        {card.desc}
                      </p>
                    </div>

                    <button
                      onClick={onOpenTrial}
                      className="w-full py-2.5 rounded-lg bg-[#10291a] hover:bg-[#1a3d27] text-[#c6f35c] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group-hover:bg-[#c6f35c] group-hover:text-[#10291a]"
                    >
                      <span>{isAr ? 'حجز حصة تجريبية في هذا المسار' : 'Book Free Placement'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4 Count-Up Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-md mb-12">
            <div className="text-center p-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold text-[#10291a] mb-1">
                100%
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold">
                {isAr ? 'رضا أولياء الأمور' : 'Parent Satisfaction'}
              </div>
              <div className="text-[11px] font-mono text-emerald-600 mt-1">VERIFIED REVIEWS</div>
            </div>

            <div className="text-center p-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold text-[#10291a] mb-1">
                15+
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold">
                {isAr ? 'دولة حول العالم' : 'Countries Served'}
              </div>
              <div className="text-[11px] font-mono text-emerald-600 mt-1">GLOBAL PRESENCE</div>
            </div>

            <div className="text-center p-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold text-[#10291a] mb-1">
                98%
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold">
                {isAr ? 'إتقان التجويد والقراءة' : 'Tajweed Mastery Rate'}
              </div>
              <div className="text-[11px] font-mono text-emerald-600 mt-1">CERTIFIED SCHOLARS</div>
            </div>

            <div className="text-center p-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold text-[#10291a] mb-1">
                0 min
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold">
                {isAr ? 'هدر وقت بالروابط المباشرة' : 'Zero Setup Friction'}
              </div>
              <div className="text-[11px] font-mono text-emerald-600 mt-1">1-CLICK ZOOM/MEET</div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div className="bg-[#10291a] text-white p-6 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#c6f35c] text-[#10291a] font-mono text-[10px] font-bold uppercase mb-2">
                READY TO START?
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-white">
                {isAr ? 'ابدأ تجربة طفلك التعليمية اليوم مجاناً' : 'Start your child’s learning journey today'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isAr
                  ? 'حصة تجريبية تقييمية مع معلم متخصص بدون أي التزام مالي مسبق'
                  : 'Free placement class with an expert mentor, no payment required.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={onOpenTrial}
                className="px-6 py-3 rounded-lg bg-[#c6f35c] hover:bg-[#a9dd3a] text-[#10291a] font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>{isAr ? 'حجز الحصة التجريبية الآن' : 'Claim Free Trial Now'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToDashboard}
                className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <span>{isAr ? 'دخول لوحة التحكم' : 'Staff Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
