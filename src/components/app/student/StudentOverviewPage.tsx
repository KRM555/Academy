import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  BookOpen,
  Award,
  Video,
  CheckCircle2,
  Bell,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  FileText,
  UserCheck,
} from 'lucide-react';

export const StudentOverviewPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  // Read-only state from Supabase under RLS
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recentRecitations, setRecentRecitations] = useState<any[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{ total: number; present: number; rate: number }>({
    total: 0,
    present: 0,
    rate: 0,
  });
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Enrollments with Course Details
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('id, meeting_link, status, course_id, courses(id, title, category, description)')
          .eq('student_id', user.id);

        if (isMounted && enrollData) {
          setEnrollments(enrollData);
        }

        // 2. Fetch Recent Recitations
        const { data: recitData } = await supabase
          .from('recitations')
          .select('*')
          .eq('student_id', user.id)
          .order('recitation_date', { ascending: false })
          .limit(4);

        if (isMounted && recitData) {
          setRecentRecitations(recitData);
        }

        // 3. Fetch Recent Evaluations
        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('student_id', user.id)
          .order('evaluation_date', { ascending: false })
          .limit(4);

        if (isMounted && evalData) {
          setRecentEvaluations(evalData);
        }

        // 4. Fetch Attendance Stats
        const { data: attData } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', user.id);

        if (isMounted && attData) {
          const total = attData.length;
          const present = attData.filter((a) => a.status === 'present' || a.status === 'late').length;
          const rate = total > 0 ? Math.round((present / total) * 100) : 100;
          setAttendanceStats({ total, present, rate });
        }

        // 5. Fetch Certificates Count
        const { count: certCount } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id);

        if (isMounted && typeof certCount === 'number') {
          setCertificatesCount(certCount);
        }

        // 6. Fetch Targeted Announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (isMounted && annData) {
          setLatestAnnouncements(annData);
        }
      } catch (err) {
        console.error('[StudentOverview] Error loading data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudentData();

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
        <p className="text-xs text-slate-400 font-mono">جاري تحميل سجلات الطالب المعتمدة من Supabase...</p>
      </div>
    );
  }

  // Active meeting link from first active enrollment
  const activeMeetingLink = enrollments.find((e) => e.meeting_link && e.status === 'active')?.meeting_link;

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Achievement Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C1F1A] via-[#0E2822] to-[#0A1A16] border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>لوحة إنجازات الطالب</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              أهلاً بك يا {profile?.full_name || 'بطل القرآن الكريم'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              واصل مسيرتك المباركة في حفظ وتدبر كتاب الله الكريم وإتقان العلوم النافعة مع نخبة معملي الأكاديمية.
            </p>
          </div>

          {/* Quick Action: Live Lecture Meeting Link */}
          {activeMeetingLink ? (
            <a
              href={activeMeetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>دخول قاعة الحصة المباشرة الآن</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 flex items-center gap-2 shrink-0">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>لا توجد جلسة مباشرة نشطة حالياً</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Achievement Metric Clusters (Animated Progress Bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Attendance Rate */}
        <div className="rounded-2xl bg-[#0D1815]/90 border border-white/[0.08] p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">نسبة الالتزام والحضور</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{attendanceStats.rate}%</span>
            <span className="text-[11px] text-slate-400">({attendanceStats.present} من {attendanceStats.total || '0'} جلسة)</span>
          </div>
          {/* Animated Achievement Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, attendanceStats.rate)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Enrolled Courses */}
        <div className="rounded-2xl bg-[#0D1815]/90 border border-white/[0.08] p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الحلقات والمسارات</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{enrollments.length}</span>
            <span className="text-[11px] text-slate-400">مسارات نشطة</span>
          </div>
          <NavLink
            to="/app/courses"
            className="text-[11px] text-teal-400 hover:text-teal-300 font-bold inline-flex items-center gap-1"
          >
            <span>استعراض المحاضرات والروابط</span>
            <ChevronLeft className="w-3 h-3" />
          </NavLink>
        </div>

        {/* Metric 3: Recitations Logged */}
        <div className="rounded-2xl bg-[#0D1815]/90 border border-white/[0.08] p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">جلسات التسميع المعتمدة</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{recentRecitations.length}</span>
            <span className="text-[11px] text-slate-400">جلسة مسجلة حديثاً</span>
          </div>
          <NavLink
            to="/app/evaluations"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
          >
            <span>عرض سجل التسميع والتقييمات</span>
            <ChevronLeft className="w-3 h-3" />
          </NavLink>
        </div>

        {/* Metric 4: Certificates Earned */}
        <div className="rounded-2xl bg-[#0D1815]/90 border border-white/[0.08] p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الشهادات والأوسمة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{certificatesCount}</span>
            <span className="text-[11px] text-slate-400">شهادة صادرة</span>
          </div>
          <NavLink
            to="/app/certificates"
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
          >
            <span>تحميل الشهادات المعتمدة</span>
            <ChevronLeft className="w-3 h-3" />
          </NavLink>
        </div>
      </div>

      {/* Main Grid: Courses & Recitation Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Enrolled Courses & Live Class Links */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>حلقاتي ومساراتي التعليمية النشطة</span>
            </h2>
            <NavLink to="/app/courses" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold">
              عرض الكل ←
            </NavLink>
          </div>

          {enrollments.length === 0 ? (
            /* Clear Empty State for Courses */
            <div className="rounded-2xl bg-[#0D1815]/70 border border-dashed border-white/[0.1] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">لا توجد مسارات مسجلة حالياً</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                لم يتم إسنادك إلى حلقة بعد. ستقوم إدارة الأكاديمية بإضافتك إلى حلقتك فور اعتماد الخطة الدراسية.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((en) => {
                const course = en.courses;
                return (
                  <div
                    key={en.id}
                    className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{course?.title || 'مسار تعليمي'}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          {course?.category || 'عام'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {course?.description || 'حلقة تفاعلية حية بإشراف معلم معتمد بالأكاديمية'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {en.meeting_link ? (
                        <a
                          href={en.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>رابط الحصة</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">الرابط غير متاح الآن</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Recitation Logs */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>آخر تقييمات التسميع المعتمدة</span>
              </h2>
              <NavLink to="/app/evaluations" className="text-xs text-teal-400 hover:text-teal-300 font-bold">
                سجل التسميع الكامل ←
              </NavLink>
            </div>

            {recentRecitations.length === 0 ? (
              /* Clear Empty State for Recitations */
              <div className="rounded-2xl bg-[#0D1815]/70 border border-dashed border-white/[0.1] p-6 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  لا توجد جلسات تسميع مسجلة حتى الآن. سيقوم المعلم برصد تسميعك بعد كل حلقة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentRecitations.map((rec) => {
                  const badge = getGradeBadge(rec.grade);
                  return (
                    <div
                      key={rec.id}
                      className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-['Amiri',serif]">
                          سورة {rec.surah_name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        الآيات: من {rec.from_ayah} إلى {rec.to_ayah}
                      </div>
                      {rec.notes && (
                        <p className="text-[11px] text-slate-300 bg-black/30 p-2 rounded-lg leading-relaxed">
                          ملاحظة المعلم: {rec.notes}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono text-left" dir="ltr">
                        {rec.recitation_date}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Announcements & Quick Stats */}
        <div className="space-y-6">
          {/* Targeted Announcements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>إعلانات وتنبيهات لي</span>
              </h2>
              <NavLink to="/app/announcements" className="text-xs text-amber-400 hover:text-amber-300 font-bold">
                عرض الكل ←
              </NavLink>
            </div>

            {latestAnnouncements.length === 0 ? (
              /* Clear Empty State for Announcements */
              <div className="rounded-2xl bg-[#0D1815]/70 border border-dashed border-white/[0.1] p-6 text-center space-y-2">
                <Bell className="w-5 h-5 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">لا توجد تعميمات جديدة موجهة إليك حالياً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                      <span className="text-[9px] text-slate-500 font-mono" dir="ltr">
                        {new Date(ann.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Profile Snapshot Card */}
          <div className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              بيانات حساب الطالب
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">الاسم:</span>
                <span className="text-white font-bold">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">البريد:</span>
                <span className="text-slate-300 font-mono text-[11px]">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">الصفة:</span>
                <span className="text-cyan-400 font-bold">طالب مسجل</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">حالة الحساب:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>نشط ومفعل</span>
                </span>
              </div>
            </div>

            <NavLink
              to="/app/settings"
              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <span>إدارة الحساب وكلمة المرور</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
