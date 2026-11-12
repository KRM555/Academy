import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  PlusCircle,
  Search,
  Sparkles,
  Users,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService, RecitationRecord, EvaluationRecord } from '../../../services/teacherService';
import { CANONICAL_SURAHS } from '../../../types';

export const TeacherEvaluationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedStudentId = searchParams.get('studentId');
  const initialTab = searchParams.get('tab') === 'evaluations' ? 'evaluations' : 'recitations';

  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const [activeTab, setActiveTab] = useState<'recitations' | 'evaluations'>(initialTab);
  const [showRecitationForm, setShowRecitationForm] = useState(Boolean(preSelectedStudentId));
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Recitation Form State
  const [recStudentId, setRecStudentId] = useState(preSelectedStudentId || '');
  const [recSurah, setRecSurah] = useState('النبأ');
  const [recFromAyah, setRecFromAyah] = useState(1);
  const [recToAyah, setRecToAyah] = useState(20);
  const [recGrade, setRecGrade] = useState<'excellent' | 'very_good' | 'good' | 'needs_revision'>('excellent');
  const [recMistakes, setRecMistakes] = useState(0);
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [recNotes, setRecNotes] = useState('');

  // Evaluation Form State
  const [evalStudentId, setEvalStudentId] = useState(preSelectedStudentId || '');
  const [evalTitle, setEvalTitle] = useState('التقييم الشهري لإتقان التجويد والحفظ');
  const [evalScore, setEvalScore] = useState(95);
  const [evalTajweed, setEvalTajweed] = useState(95);
  const [evalMemorization, setEvalMemorization] = useState(95);
  const [evalBehavior, setEvalBehavior] = useState(100);
  const [evalDate, setEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [evalNotes, setEvalNotes] = useState('');

  // Data
  const myStudents = useMemo(() => {
    return teacherService.getMyStudents(teacherEmail).students;
  }, [teacherEmail]);

  const [recitationsList, setRecitationsList] = useState<RecitationRecord[]>(() => {
    return teacherService.getRecitations(teacherEmail);
  });

  const [evaluationsList, setEvaluationsList] = useState<EvaluationRecord[]>(() => {
    return teacherService.getEvaluations(teacherEmail);
  });

  // Ensure default student is selected
  React.useEffect(() => {
    if (!recStudentId && myStudents.length > 0) {
      setRecStudentId(myStudents[0].id);
    }
    if (!evalStudentId && myStudents.length > 0) {
      setEvalStudentId(myStudents[0].id);
    }
  }, [myStudents, recStudentId, evalStudentId]);

  const handleRecitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recStudentId) return;

    const student = myStudents.find((s) => s.id === recStudentId);
    if (!student) return;

    try {
      const record = teacherService.recordRecitation({
        studentId: student.id,
        courseId: student.courseId,
        surahName: recSurah,
        fromAyah: Number(recFromAyah),
        toAyah: Number(recToAyah),
        grade: recGrade,
        mistakesCount: Number(recMistakes),
        notes: recNotes,
        recitationDate: recDate,
        teacherEmail,
      });

      setRecitationsList([record, ...recitationsList]);
      setSuccessMessage(`تم رصد جلسة التسميع للطالب (${student.childName}) لسورة ${recSurah} بنجاح.`);
      setShowRecitationForm(false);
      setRecNotes('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ التسميع');
    }
  };

  const handleEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalStudentId) return;

    const student = myStudents.find((s) => s.id === evalStudentId);
    if (!student) return;

    try {
      const record = teacherService.recordEvaluation({
        studentId: student.id,
        courseId: student.courseId,
        title: evalTitle,
        score: Number(evalScore),
        maxScore: 100,
        tajweedMasteryScore: Number(evalTajweed),
        memorizationScore: Number(evalMemorization),
        behaviorScore: Number(evalBehavior),
        notes: evalNotes,
        evaluationDate: evalDate,
        teacherEmail,
      });

      setEvaluationsList([record, ...evaluationsList]);
      setSuccessMessage(`تم حفظ التقييم الأكاديمي للطالب (${student.childName}) بنجاح.`);
      setShowEvaluationForm(false);
      setEvalNotes('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ التقييم');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              سجل التسميع والتقييمات الأكاديمية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              خاص بالمعلم
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            رصد يومي لإتقان التلاوة ومقدار السور المحفوظة والتقييمات السلوكية والتربوية لطلاب حلقاتك.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'recitations' ? (
            <button
              onClick={() => setShowRecitationForm(!showRecitationForm)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showRecitationForm ? 'إلغاء الإدخال' : 'رصد تسميع جديد'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowEvaluationForm(!showEvaluationForm)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-teal-950/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showEvaluationForm ? 'إلغاء الإدخال' : 'رصد تقييم جديد'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] gap-4">
        <button
          onClick={() => setActiveTab('recitations')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'recitations'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>سجل التسميع القرآني ({recitationsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'evaluations'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>التقييمات والملاحظات الدورية ({evaluationsList.length})</span>
        </button>
      </div>

      {/* NEW RECITATION FORM */}
      {activeTab === 'recitations' && showRecitationForm && (
        <form
          onSubmit={handleRecitationSubmit}
          className="p-6 rounded-3xl bg-[#0D1815] border border-emerald-500/30 space-y-4 shadow-2xl animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>إدخال جلسة تسميع قرآن كريم جديدة</span>
            </h3>
            <span className="text-[11px] text-slate-400">حفظ فوري في سجل الطالب</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Student Select */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">اختر الطالب المسند:</label>
              <select
                value={recStudentId}
                onChange={(e) => setRecStudentId(e.target.value)}
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

            {/* Surah Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">السورة الكريمة:</label>
              <select
                value={recSurah}
                onChange={(e) => setRecSurah(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
              >
                {CANONICAL_SURAHS.map((surah) => (
                  <option key={surah} value={surah}>
                    سورة {surah}
                  </option>
                ))}
              </select>
            </div>

            {/* From Ayah */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">من الآية:</label>
              <input
                type="number"
                min="1"
                value={recFromAyah}
                onChange={(e) => setRecFromAyah(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* To Ayah */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">إلى الآية:</label>
              <input
                type="number"
                min={recFromAyah}
                value={recToAyah}
                onChange={(e) => setRecToAyah(parseInt(e.target.value) || recFromAyah)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">مستوى الإتقان والتجويد:</label>
              <select
                value={recGrade}
                onChange={(e: any) => setRecGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="excellent">ممتاز (إتقان تام مع أحكام التجويد)</option>
                <option value="very_good">جيد جداً (أخطاء يسيرة في الحفظ)</option>
                <option value="good">جيد (يحتاج مزيداً من التثبيت)</option>
                <option value="needs_revision">يحتاج مراجعة وإعادة تسميع</option>
              </select>
            </div>

            {/* Mistakes Count */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">عدد التنبيهات / الأخطاء:</label>
              <input
                type="number"
                min="0"
                value={recMistakes}
                onChange={(e) => setRecMistakes(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">تاريخ جلسة التسميع:</label>
              <input
                type="date"
                value={recDate}
                onChange={(e) => setRecDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-slate-300 font-bold mb-1.5">
                ملاحظات وتوجيهات المعلم للطالب وولي الأمر:
              </label>
              <input
                type="text"
                value={recNotes}
                onChange={(e) => setRecNotes(e.target.value)}
                placeholder="مثال: إتقان رائع لأحكام النون الساكنة مع ثبات الحفظ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowRecitationForm(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-colors cursor-pointer"
            >
              اعتماد وحفظ جلسة التسميع
            </button>
          </div>
        </form>
      )}

      {/* NEW EVALUATION FORM */}
      {activeTab === 'evaluations' && showEvaluationForm && (
        <form
          onSubmit={handleEvaluationSubmit}
          className="p-6 rounded-3xl bg-[#0D1815] border border-teal-500/30 space-y-4 shadow-2xl animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>إدخال تقييم دوري وملاحظات المعلم</span>
            </h3>
            <span className="text-[11px] text-slate-400">تقييم شامل للتحصيل والسلوك</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">اختر الطالب:</label>
              <select
                value={evalStudentId}
                onChange={(e) => setEvalStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-teal-500"
              >
                {myStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.childName} ({s.courseTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">عنوان التقييم:</label>
              <input
                type="text"
                value={evalTitle}
                onChange={(e) => setEvalTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">الدرجة الإجمالية (من 100):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={evalScore}
                onChange={(e) => setEvalScore(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">تاريخ التقييم:</label>
              <input
                type="date"
                value={evalDate}
                onChange={(e) => setEvalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-slate-300 font-bold mb-1.5">
                توجيهات وملاحظات تفصيلية لولي الأمر:
              </label>
              <textarea
                rows={2}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="تفاصيل التطور الدراسي، نقاط القوة، والمجالات التي تحتاج متابعة منزلية..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowEvaluationForm(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-md transition-colors cursor-pointer"
            >
              حفظ التقييم الدوري
            </button>
          </div>
        </form>
      )}

      {/* Recitations Table View */}
      {activeTab === 'recitations' && (
        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#0D1815]">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-bold">
                <th className="py-3.5 px-4">اسم الطالب</th>
                <th className="py-3.5 px-4">المسار التعليمي</th>
                <th className="py-3.5 px-4">السورة الكريمة</th>
                <th className="py-3.5 px-4">الآيات</th>
                <th className="py-3.5 px-4">الدرجة والإتقان</th>
                <th className="py-3.5 px-4">التنبيهات</th>
                <th className="py-3.5 px-4">ملاحظات المعلم</th>
                <th className="py-3.5 px-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recitationsList.map((rec) => {
                const badge = getGradeBadge(rec.grade);
                return (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {rec.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {rec.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 whitespace-nowrap">
                      سورة {rec.surahName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {rec.fromAyah} - {rec.toAyah}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {rec.mistakesCount}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {rec.recitationDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Evaluations Table View */}
      {activeTab === 'evaluations' && (
        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#0D1815]">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-bold">
                <th className="py-3.5 px-4">اسم الطالب</th>
                <th className="py-3.5 px-4">المسار</th>
                <th className="py-3.5 px-4">عنوان التقييم</th>
                <th className="py-3.5 px-4">الدرجة</th>
                <th className="py-3.5 px-4">ملاحظات وتوجيهات</th>
                <th className="py-3.5 px-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {evaluationsList.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {ev.studentName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {ev.courseTitle}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-teal-300">
                    {ev.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {ev.score} / {ev.maxScore}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">
                    {ev.notes || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {ev.evaluationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
