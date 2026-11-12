import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadAttendance = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('id, session_date, status, notes, course_id, courses(title)')
          .eq('student_id', user.id)
          .order('session_date', { ascending: false });

        if (error) console.error('[Attendance] Error:', error);
        if (isMounted && data) {
          setAttendanceLogs(data);
        }
      } catch (err) {
        console.error('[StudentAttendance] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAttendance();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Status badge config
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return { label: 'حاضر', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 };
      case 'late':
        return { label: 'حضور متأخر', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: Clock };
      case 'excused':
        return { label: 'غياب بعذر', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30', icon: AlertCircle };
      case 'absent':
        return { label: 'غياب بدون عذر', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: XCircle };
      default:
        return { label: status, color: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: CheckCircle2 };
    }
  };

  const total = attendanceLogs.length;
  const presentCount = attendanceLogs.filter((a) => a.status === 'present').length;
  const lateCount = attendanceLogs.filter((a) => a.status === 'late').length;
  const excusedCount = attendanceLogs.filter((a) => a.status === 'excused').length;
  const absentCount = attendanceLogs.filter((a) => a.status === 'absent').length;
  const overallRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">جاري استرجاع سجل الحضور والغياب من Supabase...</p>
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
              سجل الحضور والغياب
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              قراءة فقط (RLS Enforced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            متابعة جلسات الحفظ واللقاءات التفاعلية ونسبة الالتزام بالحضور للجلسات المباشرة.
          </p>
        </div>
      </div>

      {/* Attendance Stats Cards with Animated Achievement Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 space-y-2">
          <span className="text-xs text-slate-400">نسبة الالتزام العامة</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{overallRate}%</div>
          {/* Animated Achievement Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, overallRate)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 space-y-2">
          <span className="text-xs text-slate-400">جلسات الحضور</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {presentCount} <span className="text-xs text-slate-500">حصة</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">حضور كامل في الموعد</span>
        </div>

        <div className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 space-y-2">
          <span className="text-xs text-slate-400">غياب بعذر مسبق</span>
          <div className="text-2xl font-extrabold text-teal-300 font-mono">
            {excusedCount} <span className="text-xs text-slate-500">حصة</span>
          </div>
          <span className="text-[11px] text-teal-400 font-mono">معتمد من الإدارة</span>
        </div>

        <div className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 space-y-2">
          <span className="text-xs text-slate-400">غياب بدون عذر</span>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {absentCount} <span className="text-xs text-slate-500">حصة</span>
          </div>
          <span className="text-[11px] text-rose-400 font-mono">
            {absentCount === 0 ? 'سجل ناصع متميز' : 'يرجى تلافي الغياب'}
          </span>
        </div>
      </div>

      {attendanceLogs.length === 0 ? (
        /* Clear Empty State for Attendance */
        <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white">
              لا توجد سجلات حضور مسجلة حتى الآن
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              يقوم المعلم بتسجيل حضور الطلاب مع بداية كل حلقة مباشرة. ستظهر جميع الجلسات المسجلة هنا فورياً.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#0D1815] border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">سجل الجلسات والحصص</h3>
            <span className="text-xs text-slate-400 font-mono">إجمالي الجلسات: {total}</span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {attendanceLogs.map((log) => {
              const badge = getStatusBadge(log.status);
              const Icon = badge.icon;
              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {log.courses?.title || 'جلسة قرآنية'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                        {log.session_date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.notes && (
                      <span className="text-xs text-slate-400 bg-black/40 px-3 py-1 rounded-lg">
                        {log.notes}
                      </span>
                    )}

                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 shrink-0 ${badge.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
