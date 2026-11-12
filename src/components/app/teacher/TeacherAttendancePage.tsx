import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  Save,
  BookOpen,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService, AttendanceRecord } from '../../../services/teacherService';

export const TeacherAttendancePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCourseId = searchParams.get('courseId');
  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const myCourses = useMemo(() => teacherService.getMyCourses(teacherEmail), [teacherEmail]);
  const defaultCourseId = requestedCourseId || (myCourses[0]?.id ?? '');

  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get students for selected course
  const studentsResult = useMemo(() => {
    return teacherService.getMyStudents(teacherEmail, selectedCourseId);
  }, [teacherEmail, selectedCourseId]);

  const students = studentsResult.students;

  // Local attendance form state: Map<studentId, { status, notes }>
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: 'present' | 'absent' | 'excused' | 'late'; notes: string }>
  >({});

  // Initialize state when students load
  React.useEffect(() => {
    const existingLogs = teacherService.getAttendanceLogs(selectedCourseId, sessionDate);
    const logMap = new Map(existingLogs.map((l) => [l.studentId, l]));

    const initial: Record<string, { status: 'present' | 'absent' | 'excused' | 'late'; notes: string }> = {};
    students.forEach((s) => {
      const existing = logMap.get(s.id);
      initial[s.id] = {
        status: existing?.status || 'present',
        notes: existing?.notes || '',
      };
    });
    setAttendanceState(initial);
  }, [students, selectedCourseId, sessionDate]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'excused' | 'late') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updated = { ...attendanceState };
    students.forEach((s) => {
      if (updated[s.id]) {
        updated[s.id].status = status;
      }
    });
    setAttendanceState(updated);
  };

  const handleSaveAttendance = () => {
    if (!selectedCourseId || students.length === 0) return;

    try {
      const entries = students.map((s) => ({
        studentId: s.id,
        status: attendanceState[s.id]?.status || 'present',
        notes: attendanceState[s.id]?.notes || '',
      }));

      teacherService.recordAttendance(selectedCourseId, sessionDate, entries, teacherEmail);
      setSuccessMessage(`تم حفظ واعتماد كشف الحضور والغياب ليوم ${sessionDate} بنجاح.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ الحضور');
    }
  };

  const attendanceLogs = useMemo(() => {
    return teacherService.getAttendanceLogs(selectedCourseId);
  }, [selectedCourseId, successMessage]);

  const statusOptions = [
    { value: 'present', label: 'حاضر', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { value: 'late', label: 'متأخر', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { value: 'excused', label: 'معتذر', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
    { value: 'absent', label: 'غائب', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              تسجيل الحضور والغياب المباشر
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              خاص بالمعلم
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            رصد حضور جلسات الحفظ والفصول الافتراضية المباشرة لطلاب حلقاتك وتوثيق الغياب والأعذار.
          </p>
        </div>

        {/* Date & Course Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                searchParams.set('courseId', e.target.value);
                setSearchParams(searchParams);
              }}
              className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer pr-3"
            >
              {myCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Bulk Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0D1815] border border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">إجراء سريع:</span>
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
          >
            تحديد الكل كحاضر ✓
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
          >
            تحديد الكل كغائب ✕
          </button>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ واعتماد كشف الجلسة</span>
        </button>
      </div>

      {/* Attendance Form Cards */}
      <div className="space-y-3">
        {students.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0D1815] border border-white/[0.08] text-xs text-slate-400">
            لا يوجد طلاب مسجلين في هذا المسار حالياً.
          </div>
        ) : (
          students.map((student) => {
            const currentStatus = attendanceState[student.id]?.status || 'present';
            const currentNotes = attendanceState[student.id]?.notes || '';

            return (
              <div
                key={student.id}
                className="p-4 rounded-2xl bg-[#0D1815] border border-white/[0.08] hover:border-white/[0.12] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                    {student.childName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{student.childName}</h3>
                    <div className="text-[11px] text-slate-400">
                      {student.level} • ولي الأمر: {student.parentName}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                    {statusOptions.map((opt) => {
                      const isSelected = currentStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleStatusChange(student.id, opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? `${opt.color} shadow-xs font-black`
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Per student note */}
                  <input
                    type="text"
                    value={currentNotes}
                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                    placeholder="ملاحظة خاصة بالجلسة..."
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-48"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Attendance History Log */}
      <div className="space-y-3 pt-4 border-t border-white/[0.08]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>سجل الجلسات السابقة المرصودة لهذا المسار ({attendanceLogs.length})</span>
        </h2>

        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#0D1815]">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-bold">
                <th className="py-3 px-4">تاريخ الجلسة</th>
                <th className="py-3 px-4">اسم الطالب</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {attendanceLogs.slice(0, 10).map((log) => {
                const opt = statusOptions.find((o) => o.value === log.status);
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.sessionDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {log.studentName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${opt?.color}`}>
                        {opt?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
