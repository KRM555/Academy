import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  Award,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const StudentExamsResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadExams = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('id, exam_title, score, max_score, feedback, exam_date, course_id, courses(title)')
          .eq('student_id', user.id)
          .order('exam_date', { ascending: false });

        if (error) console.error('[Exams] Load error:', error);
        if (isMounted && data) {
          setExams(data);
        }
      } catch (err) {
        console.error('[StudentExams] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadExams();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getScoreDetails = (score: number, maxScore: number) => {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    if (percentage >= 90) {
      return {
        label: 'ممتاز مع مرتبة الشرف',
        percentage,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        barGrad: 'from-emerald-500 to-teal-400',
      };
    }
    if (percentage >= 80) {
      return {
        label: 'جيد جداً مرتفع',
        percentage,
        color: 'text-teal-400',
        bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
        barGrad: 'from-teal-500 to-cyan-400',
      };
    }
    if (percentage >= 70) {
      return {
        label: 'جيد',
        percentage,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        barGrad: 'from-amber-500 to-yellow-400',
      };
    }
    return {
      label: 'يحتاج لمزيد من المراجعة',
      percentage,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      barGrad: 'from-rose-500 to-orange-400',
    };
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">جاري استرجاع سجل الاختبارات والنتائج...</p>
      </div>
    );
  }

  // Calculate Overall Average
  const totalExams = exams.length;
  const avgPercentage =
    totalExams > 0
      ? Math.round(
          exams.reduce((acc, curr) => acc + (curr.max_score > 0 ? (curr.score / curr.max_score) * 100 : 0), 0) /
            totalExams
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              سجل الاختبارات والنتائج الأكاديمية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              قراءة فقط (RLS Enforced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            سجل الاختبارات الدورية والنهائية، الدرجات المرصودة وملاحظات المعلم وتوجيهاته.
          </p>
        </div>

        {totalExams > 0 && (
          <div className="flex items-center gap-3 bg-[#0D1815] border border-white/[0.08] px-4 py-2 rounded-2xl">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono">المعدل التراكمي العام</div>
              <div className="text-lg font-extrabold text-white font-mono">{avgPercentage}%</div>
            </div>
          </div>
        )}
      </div>

      {exams.length === 0 ? (
        /* Clear Empty State for Exams */
        <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white">
              لا توجد اختبارات مسجلة حتى الآن
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              عندما يعقد معلم الحلقة اختباراً تحريرياً أو شفوياً ويعتمد رصد درجاته، ستظهر تفاصيل النتيجة وملاحظات التوجيه هنا فورياً.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const details = getScoreDetails(Number(exam.score), Number(exam.max_score));
            return (
              <div
                key={exam.id}
                className="rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-emerald-500/40 p-6 space-y-4 shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                        {exam.courses?.title || 'اختبار عام'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                        {exam.exam_date}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">
                      {exam.exam_title}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${details.bg}`}>
                    {details.label}
                  </span>
                </div>

                {/* Score & Animated Progress Bar (Animation restricted strictly to progress/achievements) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-400">الدرجة المحققة:</span>
                    <span className="text-sm font-bold text-white">
                      <span className={details.color}>{exam.score}</span> / {exam.max_score} ({details.percentage}%)
                    </span>
                  </div>

                  {/* Animated Progress Fill */}
                  <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                    <div
                      className={`h-full bg-gradient-to-r ${details.barGrad} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(100, details.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Teacher Feedback Note */}
                {exam.feedback && (
                  <div className="pt-2 border-t border-white/[0.06] text-xs text-slate-300 bg-black/30 p-3 rounded-xl flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-400 block text-[10px]">توجيه المعلم:</span>
                      <p className="leading-relaxed">{exam.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
