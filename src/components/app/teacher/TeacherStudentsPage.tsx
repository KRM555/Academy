import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Award,
  Calendar,
  Phone,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService, TeacherStudent, TeacherCourse } from '../../../services/teacherService';

export const TeacherStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const requestedCourseId = searchParams.get('courseId');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<TeacherStudent | null>(null);

  // Fetch teacher's valid courses
  const myCourses = useMemo(() => {
    return teacherService.getMyCourses(teacherEmail);
  }, [teacherEmail]);

  // Fetch scoped students with strict URL security verification
  const studentsResult = useMemo(() => {
    return teacherService.getMyStudents(teacherEmail, requestedCourseId);
  }, [teacherEmail, requestedCourseId]);

  // Filter students by name / parent phone
  const filteredStudents = useMemo(() => {
    if (!studentsResult.authorized) return [];
    return studentsResult.students.filter(
      (s) =>
        s.childName.includes(searchTerm) ||
        s.parentName.includes(searchTerm) ||
        s.parentPhone.includes(searchTerm) ||
        s.courseTitle.includes(searchTerm)
    );
  }, [studentsResult, searchTerm]);

  const handleCourseFilterChange = (courseId: string) => {
    if (courseId === 'all') {
      searchParams.delete('courseId');
      setSearchParams(searchParams);
    } else {
      searchParams.set('courseId', courseId);
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              طلابي وحلقاتي المعتمدة
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              خاص بالمعلم فقط
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            قائمة الطلاب المسجلين حصرياً في المسارات التعليمية وحلقات التحفيظ المسندة إليك.
          </p>
        </div>

        {/* Course Filter Dropdown & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={requestedCourseId || 'all'}
              onChange={(e) => handleCourseFilterChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer pr-3"
            >
              <option value="all">جميع دوراتي المسندة ({myCourses.length})</option>
              {myCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم الطالب أو ولي الأمر..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors pl-8"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* CRITICAL URL TAMPER SECURITY CHECK FAILURE BANNER */}
      {!studentsResult.authorized && (
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/40 border-2 border-rose-500/50 shadow-2xl shadow-rose-950/40 space-y-4 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-rose-300">
                  تم رفض الوصول: مسار تعليمي غير مصرّح به
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 font-bold">
                  Security Guard Enforced
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {studentsResult.error}
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-slate-400 space-y-1">
                <div>المعرف المطلوب في الرابط: <span className="text-rose-400">{requestedCourseId}</span></div>
                <div>حالة الصلاحية: <span className="text-rose-400">مرفوض (غير مسند لحساب المعلم)</span></div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCourseFilterChange('all')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لعرض طلابي المعتمدين فقط</span>
            </button>
            <button
              onClick={() => navigate('/app/my-courses')}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs border border-white/[0.1] transition-colors cursor-pointer"
            >
              <span>استعراض دوراتي المسندة</span>
            </button>
          </div>
        </div>
      )}

      {/* AUTHORIZED CONTENT: Students Table & Cards */}
      {studentsResult.authorized && (
        <div className="space-y-4">
          {/* Active Filter Indicator */}
          {requestedCourseId && requestedCourseId !== 'all' && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>المسار المحدد: {studentsResult.requestedCourseTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                  {filteredStudents.length} طلاب
                </span>
              </div>
              <button
                onClick={() => handleCourseFilterChange('all')}
                className="text-slate-400 hover:text-white underline text-xs cursor-pointer font-bold"
              >
                إلغاء التصفية وعرض الكل
              </button>
            </div>
          )}

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0D1815] border border-white/[0.08] space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا يوجد طلاب مطابقين للبحث</h3>
              <p className="text-xs text-slate-400">
                لم يتم العثور على طلاب مسجلين في هذا المسار أو مطابقين لكلمة البحث الحالية.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-5 rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4 shadow-xl shadow-black/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-extrabold text-slate-950 text-sm shadow-md">
                          {student.childName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-white leading-snug">
                            {student.childName}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {student.age} سنوات • {student.country}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {student.attendanceRate}% حضور
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">المسار:</span>
                        <span className="font-bold text-white truncate max-w-[180px]">
                          {student.courseTitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">المستوى:</span>
                        <span className="font-mono text-emerald-400">{student.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">السور المنجزة:</span>
                        <span className="font-mono font-bold text-teal-300">
                          {student.memorizedSurahs.length} سور
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/[0.04]">
                        <span className="text-slate-400">ولي الأمر:</span>
                        <span className="text-slate-300">{student.parentName}</span>
                      </div>
                    </div>

                    {student.teacherNotes && (
                      <p className="text-[11px] text-slate-400 italic bg-black/20 p-2.5 rounded-xl border border-white/[0.03] line-clamp-2">
                        "{student.teacherNotes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar for each student */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/app/evaluations?studentId=${student.id}&courseId=${student.courseId}`)}
                        className="py-1.5 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="رصد تسميع قرآن"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>رصد تسميع</span>
                      </button>

                      <button
                        onClick={() => navigate(`/app/exams?studentId=${student.id}&courseId=${student.courseId}`)}
                        className="py-1.5 px-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="رصد درجة اختبار"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                        <span>رصد اختبار</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/app/attendance?courseId=${student.courseId}&studentId=${student.id}`)}
                        className="py-1.5 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="تسجيل الحضور"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تسجيل حضور</span>
                      </button>

                      <button
                        onClick={() => setSelectedStudentForDetail(student)}
                        className="py-1.5 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>عرض التفاصيل</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0C1513] border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                  {selectedStudentForDetail.childName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {selectedStudentForDetail.childName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {selectedStudentForDetail.courseTitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">المستوى الحالي:</span>
                  <span className="font-bold text-emerald-400">{selectedStudentForDetail.level}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">نسبة الحضور:</span>
                  <span className="font-bold text-teal-300">{selectedStudentForDetail.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ولي الأمر:</span>
                  <span className="text-white font-bold">{selectedStudentForDetail.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">هاتف التواصل:</span>
                  <span className="text-white font-mono" dir="ltr">{selectedStudentForDetail.parentPhone}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>السور القرآنية المنجزة ({selectedStudentForDetail.memorizedSurahs.length}):</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                  {selectedStudentForDetail.memorizedSurahs.length > 0 ? (
                    selectedStudentForDetail.memorizedSurahs.map((surah) => (
                      <span
                        key={surah}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                      >
                        سورة {surah}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500">لم يتم رصد سور بعد</span>
                  )}
                </div>
              </div>

              {selectedStudentForDetail.teacherNotes && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">ملاحظات المعلم السابقة:</h4>
                  <p className="text-[11px] text-slate-300 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] leading-relaxed">
                    {selectedStudentForDetail.teacherNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const s = selectedStudentForDetail;
                  setSelectedStudentForDetail(null);
                  navigate(`/app/evaluations?studentId=${s.id}&courseId=${s.courseId}`);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                رصد تسميع جديد للطالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
