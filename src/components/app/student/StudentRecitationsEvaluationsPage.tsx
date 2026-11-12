import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  CheckCircle2,
  BookOpen,
  FileText,
  Sparkles,
  Calendar,
  MessageSquare,
  Award,
} from 'lucide-react';

export const StudentRecitationsEvaluationsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'recitations' | 'evaluations'>('recitations');
  const [loading, setLoading] = useState(true);
  const [recitations, setRecitations] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Recitations
        const { data: recData, error: recErr } = await supabase
          .from('recitations')
          .select('id, surah_name, from_ayah, to_ayah, grade, notes, recitation_date, course_id, courses(title)')
          .eq('student_id', user.id)
          .order('recitation_date', { ascending: false });

        if (recErr) console.error('[Recitations] Error:', recErr);
        if (isMounted && recData) setRecitations(recData);

        // 2. Fetch Evaluations
        const { data: evalData, error: evalErr } = await supabase
          .from('evaluations')
          .select('id, title, score, max_score, notes, evaluation_date, course_id, courses(title)')
          .eq('student_id', user.id)
          .order('evaluation_date', { ascending: false });

        if (evalErr) console.error('[Evaluations] Error:', evalErr);
        if (isMounted && evalData) setEvaluations(evalData);
      } catch (err) {
        console.error('[StudentRecitations] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'excellent':
        return { label: 'ممتاز', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'very_good':
        return { label: 'جيد جداً', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'good':
        return { label: 'جيد', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'needs_revision':
        return { label: 'يحتاج مراجعة', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      default:
        return { label: grade, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">جاري تحميل سجل التسميع والتقييمات من Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              سجل التسميع القرآني والتقييمات
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              قراءة فقط (RLS Enforced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            متابعة دقيقة لكل جلسة تسميع ومقدار الآيات المنجزة ومستوى إتقان التجويد مع رصد الدرجات الدورية.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('recitations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'recitations'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>سجل التسميع ({recitations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'evaluations'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>التقييمات الدورية ({evaluations.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RECITATIONS */}
      {activeTab === 'recitations' && (
        <div className="space-y-4">
          {recitations.length === 0 ? (
            /* Clear Empty State for Recitations */
            <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  لا توجد جلسات تسميع مسجلة بعد
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  يقوم المعلم برصد تسميع السور والآيات ومستوى إتقان التجويد بعد كل حلقة مباشرة. ستظهر سجلاتك هنا فور اعتمادها.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recitations.map((rec) => {
                const badge = getGradeBadge(rec.grade);
                return (
                  <div
                    key={rec.id}
                    className="rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-emerald-500/40 p-5 space-y-3 shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {rec.courses?.title || 'حلقة قرآنية'}
                        </span>
                        <h3 className="text-lg font-bold text-white font-['Amiri',serif]">
                          سورة {rec.surah_name}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] text-xs text-slate-300 font-mono flex items-center justify-between">
                      <span>نطاق التسميع:</span>
                      <span className="font-bold text-emerald-400">
                        من آية {rec.from_ayah || 1} إلى آية {rec.to_ayah}
                      </span>
                    </div>

                    {rec.notes && (
                      <div className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 block">ملاحظات التجويد:</span>
                        <p className="leading-relaxed">{rec.notes}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>تاريخ الجلسة:</span>
                      <span dir="ltr">{rec.recitation_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          {evaluations.length === 0 ? (
            /* Clear Empty State for Evaluations */
            <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  لا توجد تقييمات دورية مسجلة بعد
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  تُسجل التقييمات الشهرية والشاملة لمستوى الحفظ والسلوك والالتزام من قبل معلم الحلقة وإدارة الأكاديمية.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluations.map((ev) => {
                const score = Number(ev.score) || 0;
                const max = Number(ev.max_score) || 100;
                const pct = max > 0 ? Math.round((score / max) * 100) : 0;
                return (
                  <div
                    key={ev.id}
                    className="rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-teal-500/40 p-6 space-y-4 shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                          {ev.courses?.title || 'تقييم عام'}
                        </span>
                        <h3 className="text-base font-extrabold text-white">
                          {ev.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                        {ev.evaluation_date}
                      </span>
                    </div>

                    {/* Animated Achievement Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="text-slate-400">النتيجة المعتمدة:</span>
                        <span className="text-sm font-bold text-white">
                          <span className="text-teal-400">{score}</span> / {max} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>

                    {ev.notes && (
                      <div className="pt-2 border-t border-white/[0.06] text-xs text-slate-300 bg-black/30 p-3 rounded-xl flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{ev.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
