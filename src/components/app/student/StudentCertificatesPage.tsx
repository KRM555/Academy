import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  Award,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
  Calendar,
  X,
  FileCheck,
} from 'lucide-react';
import {
  renderCertificateToCanvas,
  downloadCanvasAsPng,
  CERTIFICATE_THEMES,
  CertificateData,
} from '../../../utils/certificateEngine';

export const StudentCertificatesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadCertificates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('id, title, certificate_code, issue_date, certificate_url, course_id, courses(title)')
          .eq('student_id', user.id)
          .order('issue_date', { ascending: false });

        if (error) console.error('[Certificates] Error:', error);
        if (isMounted && data) {
          setCertificates(data);
        }
      } catch (err) {
        console.error('[StudentCertificates] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCertificates();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle immediate download of certificate
  const handleDownloadCertificate = async (cert: any) => {
    setIsGenerating(cert.id);
    try {
      const offscreenCanvas = document.createElement('canvas');
      const certData: CertificateData = {
        studentName: profile?.full_name || 'طالب الأكاديمية',
        templateType: 'completion',
        trackTitle: cert.courses?.title || 'مسار القرآن الكريم والتجويد',
        achievementTitle: cert.title || 'إتمام المسار الأكاديمي',
        congratulationText: 'تَقْدِيراً لِجُهُودِهِ المُبَارَكَةِ وَحِرْصِهِ عَلَى تَعَلُّمِ كِتَابِ اللَّهِ وَإِتْقَانِ تِلَاوَتِهِ',
        quranAyah: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
        teacherName: 'الهيئة التعليمية المعتمدة',
        supervisorName: 'د. عبد الرحمن السعدي',
        issueDate: cert.issue_date,
        grade: 'مُجَازٌ بِمَرْتَبَةِ الشَّرَفِ',
        verificationCode: cert.certificate_code,
        showSeal: true,
        themeId: 'emerald_gold',
      };

      renderCertificateToCanvas(offscreenCanvas, certData, 2);
      downloadCanvasAsPng(offscreenCanvas, `شهادة-${profile?.full_name || 'طالب'}-${cert.certificate_code}`);
    } catch (err) {
      console.error('Download certificate error:', err);
    } finally {
      setIsGenerating(null);
    }
  };

  // Render modal preview on canvas
  useEffect(() => {
    if (previewCert && previewCanvasRef.current) {
      const certData: CertificateData = {
        studentName: profile?.full_name || 'طالب الأكاديمية',
        templateType: 'completion',
        trackTitle: previewCert.courses?.title || 'مسار القرآن الكريم والتجويد',
        achievementTitle: previewCert.title || 'إتمام المسار الأكاديمي',
        congratulationText: 'تَقْدِيراً لِجُهُودِهِ المُبَارَكَةِ وَحِرْصِهِ عَلَى تَعَلُّمِ كِتَابِ اللَّهِ وَإِتْقَانِ تِلَاوَتِهِ',
        quranAyah: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
        teacherName: 'الهيئة التعليمية المعتمدة',
        supervisorName: 'د. عبد الرحمن السعدي',
        issueDate: previewCert.issue_date,
        grade: 'مُجَازٌ بِمَرْتَبَةِ الشَّرَفِ',
        verificationCode: previewCert.certificate_code,
        showSeal: true,
        themeId: 'emerald_gold',
      };

      renderCertificateToCanvas(previewCanvasRef.current, certData, 1);
    }
  }, [previewCert, profile]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">جاري استرجاع شهادات الطالب المعتمدة من Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              شهاداتي وأوسمتي المعتمدة
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              قراءة فقط (RLS Enforced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            شهادات إتمام الأجزاء، إجازات التلاوة، وأوسمة التميز المعتمدة والموثقة برمز إلكتروني فريد.
          </p>
        </div>

        {certificates.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span>إجمالي الشهادات المكتسبة: {certificates.length}</span>
          </div>
        )}
      </div>

      {certificates.length === 0 ? (
        /* Clear Empty State for Certificates */
        <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white">
              لا توجد شهادات صادرة حتى الآن
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              عند إتمامك لأحد الأجزاء القرآنية أو اجتياز الدورة التأسيسية المعتمدة، ستصدر إدارة الأكاديمية شهادة رسمية تحمل اسمك ورمز التوثيق لتتمكن من تحميلها وطباعتها.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-3xl bg-gradient-to-b from-[#0F241F] to-[#0A1814] border border-amber-500/40 p-6 space-y-4 shadow-xl relative overflow-hidden group hover:border-amber-400 transition-all"
            >
              {/* Subtle animated achievement glow for earned awards */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-inner">
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/40 text-amber-300 border border-amber-500/30">
                  {cert.certificate_code}
                </span>
              </div>

              <div className="space-y-1 relative z-10">
                <span className="text-[11px] font-mono text-emerald-400">
                  {cert.courses?.title || 'أكاديمية نور وبيان'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Amiri',serif]">
                  {cert.title}
                </h3>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.04] text-xs text-slate-300 space-y-1.5 relative z-10">
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم الطالب:</span>
                  <span className="text-white font-bold">{profile?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ الإصدار:</span>
                  <span className="text-slate-300 font-mono" dir="ltr">{cert.issue_date}</span>
                </div>
              </div>

              {/* Action Buttons: Preview & Download */}
              <div className="pt-2 flex items-center gap-2 relative z-10">
                <button
                  onClick={() => handleDownloadCertificate(cert)}
                  disabled={isGenerating === cert.id}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGenerating === cert.id ? 'جاري التحميل...' : 'تحميل الشهادة (PNG)'}</span>
                </button>

                <button
                  onClick={() => setPreviewCert(cert)}
                  className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="معاينة الشهادة"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0C1513] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">معاينة الشهادة الرسمية المعتمدة</h3>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Preview Container */}
            <div className="flex justify-center overflow-x-auto p-2 bg-black/60 rounded-2xl border border-white/[0.06]">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto rounded-xl shadow-2xl"
                style={{ width: '840px', height: '594px' }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownloadCertificate(previewCert)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل بدقة عالية جاهزة للطباعة</span>
              </button>
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
