import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const StudentCoursesLessonsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadCoursesAndLessons = async () => {
      setLoading(true);
      try {
        // 1. Fetch Student Enrollments and Courses under RLS
        const { data: enrollData, error: enrollErr } = await supabase
          .from('enrollments')
          .select('id, meeting_link, status, course_id, enrolled_at, courses(id, title, category, description, is_active)')
          .eq('student_id', user.id);

        if (enrollErr) console.error('[Courses] Enrollments error:', enrollErr);
        if (isMounted && enrollData) {
          setEnrollments(enrollData);
        }

        // 2. Fetch Targeted Lessons under RLS
        // (RLS policy students_read_targeted_lessons filters to target_type all, course, or specific_students)
        const { data: lessonsData, error: lessonsErr } = await supabase
          .from('lessons')
          .select('id, title, content, attachment_url, target_type, course_id, created_at, courses(title)')
          .order('created_at', { ascending: false });

        if (lessonsErr) console.error('[Courses] Lessons error:', lessonsErr);
        if (isMounted && lessonsData) {
          setLessons(lessonsData);
        }
      } catch (err) {
        console.error('[StudentCourses] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCoursesAndLessons();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredLessons =
    selectedCourseId === 'all'
      ? lessons
      : lessons.filter((l) => l.course_id === selectedCourseId);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">جاري تحميل الدورات والمحاضرات من Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              دوراتي والمحاضرات التعليمية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              قراءة فقط (RLS Enforced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            استعراض الحلقات المسجل بها، روابط قاعات البث المباشر، والملفات والشروحات الموجهة إليك.
          </p>
        </div>
      </div>

      {/* SECTION 1: ENROLLED COURSES & LIVE LECTURE LINKS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>حلقاتي المعتمدة وروابط القاعات المباشرة</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">({enrollments.length} مسارات)</span>
        </div>

        {enrollments.length === 0 ? (
          /* Clear Empty State for Courses */
          <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">لا توجد مسارات دراسية مسجلة بعد</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              لم تسجل إدارة الأكاديمية أي حلقة على هذا الحساب حتى الآن. فور اعتماد تسجيلك في الحلقات القرآنية أو اللغوية ستظهر بياناتها وروابط القاعات هنا فورياً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((en) => {
              const course = en.courses;
              const hasLink = Boolean(en.meeting_link);
              return (
                <div
                  key={en.id}
                  className="rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-emerald-500/40 p-6 space-y-4 shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {course?.category || 'حلقة قرآنية'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          مسجل منذ {new Date(en.enrolled_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white">
                        {course?.title || 'مسار تعليمي'}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {course?.description || 'حلقة تفاعلية حية بإشراف نخبة من مشايخ ومعلمي الأكاديمية المجازين.'}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    {hasLink ? (
                      <a
                        href={en.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>دخول قاعة البث المباشر (Zoom / Meet)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="flex-1 py-2 px-3 rounded-xl bg-white/[0.03] text-slate-400 text-xs text-center font-mono">
                        رابط القاعة سيحدده المعلم قبل موعد الجلسة
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: TARGETED LESSONS & ATTACHMENTS */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-bold text-white">
              المحاضرات والشروحات والملفات التعليمية
            </h2>
          </div>

          {/* Filter by course if more than 1 enrollment exists */}
          {enrollments.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">تصفية حسب المسار:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="all">جميع المسارات</option>
                {enrollments.map((en) => (
                  <option key={en.course_id} value={en.course_id}>
                    {en.courses?.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredLessons.length === 0 ? (
          /* Clear Empty State for Lessons */
          <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">لا توجد محاضرات أو مرفقات مرفوعة حالياً</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              عندما يقوم معلم الحلقة برفع تسجيلات أو ملفات PDF تعليمية موجهة لحلقتك ستظهر هنا فورياً لتحميلها ومراجعتها.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-2xl bg-[#0D1815] border border-white/[0.08] p-5 hover:border-teal-500/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {lesson.courses?.title || 'محاضرة عامة'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                        {new Date(lesson.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {lesson.title}
                    </h4>
                  </div>

                  {lesson.attachment_url && (
                    <a
                      href={lesson.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل المرفق التعليمي</span>
                    </a>
                  )}
                </div>

                {lesson.content && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl">
                    {lesson.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
