import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Award,
  CheckCircle2,
  Calendar,
  PlusCircle,
  Trophy,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService, ExamRecord } from '../../../services/teacherService';

export const TeacherExamsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get('studentId');
  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const [showExamForm, setShowExamForm] = useState(Boolean(preSelectedStudentId));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Scoped students
  const myStudents = useMemo(() => {
    return teacherService.getMyStudents(teacherEmail).students;
  }, [teacherEmail]);

  // Form State
  const [studentId, setStudentId] = useState(preSelectedStudentId || '');
  const [examTitle, setExamTitle] = useState('اختبار إتمام جزء عم الشامل');
  const [examType, setExamType] = useState<'oral' | 'written' | 'comprehensive'>('comprehensive');
  const [score, setScore] = useState(95);
  const [maxScore, setMaxScore] = useState(100);
  const [feedback, setFeedback] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);

  const [examsList, setExamsList] = useState<ExamRecord[]>(() => {
    return teacherService.getExams(teacherEmail);
  });

  React.useEffect(() => {
    if (!studentId && myStudents.length > 0) {
      setStudentId(myStudents[0].id);
    }
  }, [myStudents, studentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    const student = myStudents.find((s) => s.id === studentId);
    if (!student) return;

    try {
      const record = teacherService.recordExam({
        studentId: student.id,
        courseId: student.courseId,
        examTitle,
        examType,
        score: Number(score),
        maxScore: Number(maxScore) || 100,
        feedback,
        examDate,
        teacherEmail,
      });

      setExamsList([record, ...examsList]);
      setSuccessMessage(`تم اعتماد ورصد نتيجة اختبار الطالب (${student.childName}) بنجاح.`);
      setShowExamForm(false);
      setFeedback('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رصد نتيجة الاختبار.');
    }
  };

  const getScoreDetails = (sc: number, max: number) => {
    const pct = max > 0 ? Math.round((sc / max) * 100) : 0;
    if (pct >= 95) {
      return { label: 'ممتاز مع مرتبة الشرف', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    } else if (pct >= 85) {
      return { label: 'ممتاز', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    } else if (pct >= 75) {
      return { label: 'جيد جداً', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    } else if (pct >= 60) {
      return { label: 'جيد', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    return { label: 'يحتاج إعادة', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              رصد الاختبارات والنتائج الأكاديمية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              خاص بالمعلم
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            رصد نتائج الاختبارات الشفوية والتحريرية لحلقاتك، وإصدار شهادات الإتمام والتقييمات الرسمية.
          </p>
        </div>

        <button
          onClick={() => setShowExamForm(!showExamForm)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showExamForm ? 'إلغاء الإدخال' : 'رصد نتيجة اختبار جديدة'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* NEW EXAM ENTRY FORM */}
      {showExamForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-[#0D1815] border border-emerald-500/30 space-y-4 shadow-2xl animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>إدخال نتيجة اختبار معتمد لطالب</span>
            </h3>
            <span className="text-[11px] text-slate-400">اعتماد فوري في تقرير الطالب</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Student Select */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">اختر الطالب:</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
              >
                {myStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.childName} ({s.courseTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Title */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">عنوان الاختبار:</label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="مثال: اختبار جزء عم الشامل"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">نوع الاختبار:</label>
              <select
                value={examType}
                onChange={(e: any) => setExamType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="comprehensive">اختبار شامل (شفوي وتحريري)</option>
                <option value="oral">اختبار شفوي (تسميع مباشر)</option>
                <option value="written">اختبار تحريري (أحكام تجويد/لغة)</option>
              </select>
            </div>

            {/* Score */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">الدرجة المحققة:</label>
              <input
                type="number"
                min="0"
                max={maxScore}
                required
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Max Score */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">الدرجة العظمى:</label>
              <input
                type="number"
                min="1"
                required
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">تاريخ الاختبار:</label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Feedback */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-slate-300 font-bold mb-1.5">
                توجيهات المعلم والتقرير المكتوب للطالب:
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="أداء متألق مع إتقان مخارج الحروف، يوصى بالانتقال للمستوى التالي..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowExamForm(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-colors cursor-pointer"
            >
              اعتماد النتيجة في السجل الرسمي
            </button>
          </div>
        </form>
      )}

      {/* Exams Results Table */}
      <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#0D1815]">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-bold">
              <th className="py-3.5 px-4">اسم الطالب</th>
              <th className="py-3.5 px-4">المسار التعليمي</th>
              <th className="py-3.5 px-4">عنوان الاختبار</th>
              <th className="py-3.5 px-4">النوع</th>
              <th className="py-3.5 px-4">الدرجة المحققة</th>
              <th className="py-3.5 px-4">التقدير</th>
              <th className="py-3.5 px-4">توجيهات المعلم</th>
              <th className="py-3.5 px-4">تاريخ الاختبار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {examsList.map((ex) => {
              const details = getScoreDetails(ex.score, ex.maxScore);
              return (
                <tr key={ex.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {ex.studentName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {ex.courseTitle}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-teal-300">
                    {ex.examTitle}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                      {ex.examType === 'comprehensive' ? 'شامل' : ex.examType === 'oral' ? 'شفوي' : 'تحريري'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-emerald-400 whitespace-nowrap">
                    {ex.score} / {ex.maxScore}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${details.color}`}>
                      {details.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">
                    {ex.feedback || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {ex.examDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
