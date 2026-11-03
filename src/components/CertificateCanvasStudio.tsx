import React, { useState, useEffect, useRef } from 'react';
import {
  CertificateData,
  CertificateTemplateType,
  CERTIFICATE_THEMES,
  generateVerificationCode,
  renderCertificateToCanvas,
  downloadCanvasAsPng,
} from '../utils/certificateEngine';
import { Language } from '../data/translations';
import {
  Award,
  Download,
  Printer,
  Sparkles,
  Check,
  RefreshCw,
  Copy,
  Sliders,
  Palette,
  X,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface CertificateCanvasStudioProps {
  initialStudentName?: string;
  initialProgram?: string;
  initialAchievement?: string;
  currentLanguage?: Language;
  onClose?: () => void;
  isModal?: boolean;
}

const PRESET_TEACHERS = [
  'الشيخ د. عبد الرحمن البشير (مجاز بالقراءات العشر)',
  'الشيخة فاطمة المنشاوي (معلمة القرآن المعتمدة)',
  'الشيخ محمود القزاز (مشرف حلقات التجويد)',
];

const PRESET_AYAHS = [
  'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
  'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
  'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
  'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
];

export const CertificateCanvasStudio: React.FC<CertificateCanvasStudioProps> = ({
  initialStudentName = 'عمر بن الخطاب الجوهري',
  initialProgram = 'حلقات تحفيظ وتجويد القرآن الكريم (عن بُعد)',
  initialAchievement = 'حفظ وإتقان جزء عمّ كاملاً برواية حفص عن عاصم',
  currentLanguage = 'ar',
  onClose,
  isModal = false,
}) => {
  const isAr = currentLanguage === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [studentName, setStudentName] = useState(initialStudentName);
  const [templateType, setTemplateType] = useState<CertificateTemplateType>('completion');
  const [trackTitle, setTrackTitle] = useState(initialProgram);
  const [achievementTitle, setAchievementTitle] = useState(initialAchievement);
  const [quranAyah, setQuranAyah] = useState(PRESET_AYAHS[0]);
  const [teacherName, setTeacherName] = useState(PRESET_TEACHERS[0]);
  const [supervisorName, setSupervisorName] = useState('أ.د. عبد الله المكي (رئيس الشؤون التعليمية)');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState('ممتاز مع مرتبة الشرف الأولى');
  const [themeId, setThemeId] = useState('emerald_gold');
  const [showSeal, setShowSeal] = useState(true);
  const [congratulationText, setCongratulationText] = useState(
    'تثميناً لجهوده المباركة ومواظبته على مدارسة كتاب الله وإتقان مخارج الحروف والوقف والابتداء.'
  );

  const [copiedCode, setCopiedCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute dynamic verification code
  const verificationCode = generateVerificationCode(studentName, issueDate, achievementTitle);

  // Redraw canvas whenever any parameter changes
  useEffect(() => {
    if (!canvasRef.current) return;
    const certData: CertificateData = {
      studentName,
      templateType,
      trackTitle,
      achievementTitle,
      congratulationText,
      quranAyah,
      teacherName,
      supervisorName,
      issueDate,
      grade,
      verificationCode,
      showSeal,
      themeId,
    };
    renderCertificateToCanvas(canvasRef.current, certData, 1);
  }, [
    studentName,
    templateType,
    trackTitle,
    achievementTitle,
    congratulationText,
    quranAyah,
    teacherName,
    supervisorName,
    issueDate,
    grade,
    verificationCode,
    showSeal,
    themeId,
  ]);

  const handleDownloadPng = () => {
    setIsExporting(true);
    try {
      // Create high-res offscreen canvas at 1.8x scale (2520x1710 for ultra crisp print quality)
      const offscreen = document.createElement('canvas');
      const certData: CertificateData = {
        studentName,
        templateType,
        trackTitle,
        achievementTitle,
        congratulationText,
        quranAyah,
        teacherName,
        supervisorName,
        issueDate,
        grade,
        verificationCode,
        showSeal,
        themeId,
      };
      renderCertificateToCanvas(offscreen, certData, 1.8);
      const cleanFilename = `شهادة_${studentName.replace(/\s+/g, '_')}_${issueDate}`;
      downloadCanvasAsPng(offscreen, cleanFilename);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className={`relative ${isModal ? 'w-full max-w-6xl mx-auto' : 'min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8'}`}>
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200/60 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? 'محرك Canvas لتصميم وتصدير الشهادات' : 'Quranic Canvas Certificate Engine'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2942] dark:text-white font-display flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>{isAr ? 'استوديو الشهادات واللوحات التكريمية' : 'Certificate & Award Studio'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isAr
              ? 'توليد فوري لشهادات إتمام الحفظ وبوسترات تكريم الحفاظ باستخدام تقنية HTML5 Canvas بدقة فائقة جاهزة للطباعة والتنزيل.'
              : 'Instant vector-like HTML5 Canvas certificate generation with high-res PNG export & direct print.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Controls on Left/Right, Canvas Preview Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-[#111E2E] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sliders className="w-4 h-4 text-[#0D9488]" />
              <span>{isAr ? 'تخصيص بيانات الشهادة' : 'Certificate Parameters'}</span>
            </div>
            <button
              onClick={() => {
                setStudentName(initialStudentName);
                setTemplateType('completion');
                setThemeId('emerald_gold');
                setShowSeal(true);
              }}
              className="text-[11px] text-slate-500 hover:text-[#0D9488] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
            </button>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {isAr ? 'نوع النموذج والتصميم' : 'Template Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTemplateType('completion');
                  setAchievementTitle('حفظ وإتقان جزء عمّ كاملاً برواية حفص عن عاصم');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  templateType === 'completion'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                <span className="text-[11px] block">{isAr ? 'شهادة إتقان' : 'Mastery Cert'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateType('star_student');
                  setAchievementTitle('المواظبة والتلاوة المتميزة على مدار الأسبوع');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  templateType === 'star_student'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                <span className="text-[11px] block">{isAr ? 'بطل الأسبوع' : 'Weekly Star'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateType('qaidah_diploma');
                  setAchievementTitle('إتمام القاعدة النورانية ومخارج الحروف والتأسيس');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  templateType === 'qaidah_diploma'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <span className="text-[11px] block">{isAr ? 'إجازة تأسيس' : 'Qaidah Diploma'}</span>
              </button>
            </div>
          </div>

          {/* Color Theme Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? 'نسق الألوان الملكي' : 'Royal Color Palette'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(CERTIFICATE_THEMES).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setThemeId(th.id)}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    themeId === th.id
                      ? 'border-[#0D9488] bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] leading-tight">{isAr ? th.nameAr : th.nameEn}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: th.accentColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'اسم الطالب المكرم' : 'Student Full Name'}
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0D9488] text-slate-900 dark:text-white"
              placeholder={isAr ? 'اكتب اسم الطالب...' : 'Enter student name...'}
            />
          </div>

          {/* Achievement Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'الإنجاز القرآني المبارك' : 'Quranic Achievement'}
            </label>
            <input
              type="text"
              value={achievementTitle}
              onChange={(e) => setAchievementTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0D9488] text-slate-900 dark:text-white"
            />
          </div>

          {/* Track and Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'المسار التعليمي' : 'Track'}
              </label>
              <select
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="حلقات تحفيظ وتجويد القرآن الكريم (عن بُعد)">حلقات تحفيظ القرآن</option>
                <option value="مسار القاعدة النورانية والتأسيس اللغوي">القاعدة النورانية والتأسيس</option>
                <option value="دورة تصحيح التلاوة وأحكام التجويد">تصحيح التلاوة والتجويد</option>
                <option value="برنامج الإتقان للناطقين بغير العربية">برنامج غير الناطقين بالعربية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'التقدير' : 'Honors Grade'}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="ممتاز مع مرتبة الشرف الأولى">ممتاز مع مرتبة الشرف الأولى</option>
                <option value="ممتاز مع مرتبة الشرف">ممتاز مع مرتبة الشرف</option>
                <option value="ممتاز بنسبة 98%">ممتاز (98%)</option>
                <option value="جيد جداً مرتفع">جيد جداً مرتفع</option>
              </select>
            </div>
          </div>

          {/* Ayah Quote */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'الآية أو الحديث الشريف المتوج للشهادة' : 'Ayah / Hadith Citation'}
            </label>
            <select
              value={quranAyah}
              onChange={(e) => setQuranAyah(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {PRESET_AYAHS.map((ay, idx) => (
                <option key={idx} value={ay}>
                  {ay}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'المعلم المشرف' : 'Teacher'}
              </label>
              <select
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-2.5 py-2 text-[11px] bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {PRESET_TEACHERS.map((tc, idx) => (
                  <option key={idx} value={tc}>
                    {tc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'تاريخ التكريم' : 'Issue Date'}
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F6] dark:bg-[#070E18] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Official Seal Switch */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showSeal}
                onChange={(e) => setShowSeal(e.target.checked)}
                className="w-4 h-4 rounded text-[#0D9488] focus:ring-emerald-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'ختم الاعتماد الذهبي للأكاديمية' : 'Official Gold Seal'}</span>
              </span>
            </label>
          </div>
        </div>

        {/* Canvas Live Preview & Export Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white dark:bg-[#111E2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                {verificationCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 text-slate-500 hover:text-[#0D9488] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={isAr ? 'نسخ رمز التوثيق' : 'Copy verification code'}
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isExporting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? (isAr ? 'جاري المعالجة...' : 'Exporting...') : isAr ? 'تحميل PNG فائق الدقة' : 'Download Ultra PNG'}</span>
              </button>
            </div>
          </div>

          {/* Real-time HTML5 Canvas Container */}
          <div className="relative bg-slate-900/5 dark:bg-black/40 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
            <div className="w-full aspect-[1400/950] relative rounded-2xl overflow-hidden shadow-xl border border-amber-300/30">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block select-none"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Printable Area Helper Card */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isAr
                  ? 'الشهادة معتمدة رقمياً بنظام التجزئة المشفرة، وتطابق مواصفات الطباعة على ورق فاخر قياس A4 أفقي.'
                  : 'Digital hash verified certificate, formatted for standard A4 landscape artboard.'}
              </span>
            </div>
            <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0 mr-2">300 DPI Export</span>
          </div>
        </div>
      </div>
    </div>
  );
};
