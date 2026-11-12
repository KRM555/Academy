import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Award,
  Video,
  Clock,
  Sparkles,
  ArrowLeft,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService } from '../../../services/teacherService';

export const TeacherOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const courses = teacherService.getMyCourses(teacherEmail);
  const studentsResult = teacherService.getMyStudents(teacherEmail);
  const students = studentsResult.students;
  const payroll = teacherService.getPayrollHistory(teacherEmail);
  const recitations = teacherService.getRecitations(teacherEmail);
  const currentMonthPayroll = payroll[0];

  const pendingAmount = payroll
    .filter((p) => p.status === 'pending')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#0B1E19] to-teal-950/60 border border-emerald-500/20 p-6 sm:p-8">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                بوابة المعلم المعتمد
              </span>
              <span className="text-xs text-slate-400">الفصل الدراسي 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              أهلاً بك، {profile?.full_name || 'أستاذنا الفاضل'} 🌿
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              منصتك لإدارة حلقات التحفيظ، رصد تسميع الطلاب ودرجات الاختبارات، تسجيل الحضور المباشر، ومتابعة كشف المستحقات المالية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/app/attendance')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل حضور اليوم</span>
            </button>
            <button
              onClick={() => navigate('/app/evaluations')}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>رصد تسميع قرآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{students.length}</div>
            <div className="text-xs text-slate-400 font-bold">طلابي المسندين</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{courses.length}</div>
            <div className="text-xs text-slate-400 font-bold">دوراتي وحلقاتي</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {currentMonthPayroll?.hoursCompleted || 38} س
            </div>
            <div className="text-xs text-slate-400 font-bold">ساعات الشهر الحالي</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {pendingAmount} ر.س
            </div>
            <div className="text-xs text-slate-400 font-bold">مستحقات معلقة للصرف</div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Courses & Upcoming Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Courses Quick Access */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>دوراتي وحلقاتي التعليمية المعتمدة</span>
            </h2>
            <button
              onClick={() => navigate('/app/my-courses')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض جميع الدورات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-[#0D1815] border border-white/[0.08] hover:border-emerald-500/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{course.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                    {course.enrolledStudentsCount} طلاب مسجلين
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-4 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    <span>{course.scheduleTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{course.weeklySessions} حصص أسبوعياً ({course.sessionDurationMins} دقيقة)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <a
                    href={course.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>رابط الفصل الافتراضي</span>
                  </a>
                  <button
                    onClick={() => navigate(`/app/my-students?courseId=${course.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>عرض طلاب الحلقة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Links & Recent Recitations */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>آخر جلسات التسميع المرصودة</span>
          </h2>

          <div className="p-4 rounded-2xl bg-[#0D1815] border border-white/[0.08] space-y-3">
            {recitations.slice(0, 4).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">{rec.studentName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {rec.grade === 'excellent' ? 'ممتاز' : 'جيد جداً'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>سورة {rec.surahName} (الآيات {rec.fromAyah} - {rec.toAyah})</span>
                  <span className="font-mono text-[10px] text-slate-500">{rec.recitationDate}</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/app/evaluations')}
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>سجل التسميع والتقييمات الكامل ←</span>
            </button>
          </div>

          {/* Bank Payout Status Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1814] to-[#0A1310] border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>حساب التحويل البنكي</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                محمي ومشفّر
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تحويل المستحقات يتم شهرياً على الآيبان البنكي المعتمد. يمكنك تحديث بياناتك البنكية في أي وقت.
            </p>
            <button
              onClick={() => navigate('/app/payouts')}
              className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold border border-white/[0.1] transition-colors cursor-pointer"
            >
              <span>مراجعة المستحقات ورقم الآيبان ←</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
