import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  adminService,
  AdminCertificateRecord,
  AdminStudent,
  AdminCourse,
} from '../../../services/adminService';
import {
  renderCertificateToCanvas,
  downloadCanvasAsPng,
  CERTIFICATE_THEMES,
  generateVerificationCode,
} from '../../../utils/certificateEngine';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<AdminCertificateRecord[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Issue Certificate Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<AdminCertificateRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminCertificateRecord | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    achievementTitle: 'حفظ وإتقان جزء عم كاملاً برواية حفص عن عاصم',
    templateType: 'completion' as AdminCertificateRecord['templateType'],
    themeId: 'emerald_gold',
    grade: 'ممتاز مع مرتبة الشرف (100%)',
    issueDate: new Date().toISOString().split('T')[0],
    teacherName: 'الشيخ عبد الله القرني',
    supervisorName: 'د. عبد الرحمن السعدي',
  });

  // Canvas Refs
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadData = () => {
    setCertificates(adminService.getCertificates(showDeleted));
    const allStudents = adminService.getStudents(false);
    setStudents(allStudents);
    const allCourses = adminService.getCourses(false);
    setCourses(allCourses);
    if (allStudents.length > 0 && !formData.studentId) {
      setFormData((prev) => ({
        ...prev,
        studentId: allStudents[0].id,
        courseId: allStudents[0].courseId || allCourses[0]?.id || '',
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  // Update canvas in issue modal
  useEffect(() => {
    if (isModalOpen && modalCanvasRef.current) {
      const selectedStudent = students.find((s) => s.id === formData.studentId) || students[0];
      const selectedCourse = courses.find((c) => c.id === formData.courseId) || courses[0];
      const code = generateVerificationCode(
        selectedStudent?.childName || 'طالب',
        formData.issueDate,
        formData.achievementTitle || selectedCourse?.title || 'مسار'
      );

      renderCertificateToCanvas(modalCanvasRef.current, {
        studentName: selectedStudent?.childName || 'عمر أحمد السعيد',
        studentAge: selectedStudent?.age || 8,
        templateType: formData.templateType,
        trackTitle: selectedCourse?.title || 'حلقات تحفيظ القرآن الكريم',
        achievementTitle: formData.achievementTitle,
        congratulationText: 'مبارك إتمامك المبارك، ونسأل الله أن يجعل القرآن ربيع قلبك ونور صدرك.',
        quranAyah: '﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾',
        teacherName: formData.teacherName,
        supervisorName: formData.supervisorName,
        issueDate: formData.issueDate,
        grade: formData.grade,
        verificationCode: code,
        showSeal: true,
        themeId: formData.themeId,
      });
    }
  }, [isModalOpen, formData, students, courses]);

  // Update canvas in preview modal
  useEffect(() => {
    if (previewCert && previewCanvasRef.current) {
      renderCertificateToCanvas(previewCanvasRef.current, {
        studentName: previewCert.studentName,
        templateType: previewCert.templateType,
        trackTitle: previewCert.courseTitle,
        achievementTitle: previewCert.achievementTitle,
        congratulationText: 'مبارك إتمامك المبارك، ونسأل الله أن يجعل القرآن ربيع قلبك ونور صدرك.',
        quranAyah: '﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾',
        teacherName: previewCert.teacherName,
        supervisorName: previewCert.supervisorName,
        issueDate: previewCert.issueDate,
        grade: previewCert.grade,
        verificationCode: previewCert.verificationCode,
        showSeal: true,
        themeId: previewCert.themeId,
      });
    }
  }, [previewCert]);

  const handleOpenIssueModal = () => {
    const defaultStudent = students[0];
    const defaultCourse = courses[0];
    setFormData({
      studentId: defaultStudent?.id || '',
      courseId: defaultCourse?.id || '',
      achievementTitle: 'حفظ وإتقان جزء عم كاملاً برواية حفص عن عاصم',
      templateType: 'completion',
      themeId: 'emerald_gold',
      grade: 'ممتاز مع مرتبة الشرف (100%)',
      issueDate: new Date().toISOString().split('T')[0],
      teacherName: 'الشيخ عبد الله القرني',
      supervisorName: 'د. عبد الرحمن السعدي',
    });
    setIsModalOpen(true);
  };

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formData.studentId);
    const course = courses.find((c) => c.id === formData.courseId);

    if (!student || !course) {
      setFeedback({ type: 'error', text: 'يرجى اختيار الطالب والمسار التعليمي.' });
      return;
    }

    try {
      const created = adminService.issueCertificate({
        studentId: student.id,
        studentName: student.childName,
        courseId: course.id,
        courseTitle: course.title,
        achievementTitle: formData.achievementTitle,
        templateType: formData.templateType,
        themeId: formData.themeId,
        grade: formData.grade,
        issueDate: formData.issueDate,
        teacherName: formData.teacherName,
        supervisorName: formData.supervisorName,
      });

      setFeedback({
        type: 'success',
        text: `تم إصدار الشهادة الرسمية بنجاح للطالب (${created.studentName}) برمز توثيق: ${created.verificationCode}`,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'حدث خطأ أثناء إصدار الشهادة.' });
    }
  };

  const handleConfirmSoftDelete = () => {
    if (itemToDelete) {
      adminService.softDeleteCertificate(itemToDelete.id);
      setFeedback({
        type: 'success',
        text: `تم حذف الشهادة (${itemToDelete.verificationCode}) حذفاً ناعماً.`,
      });
      setItemToDelete(null);
      loadData();
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadPdf = (cert: AdminCertificateRecord) => {
    // Generate high-resolution canvas and trigger export
    const tempCanvas = document.createElement('canvas');
    renderCertificateToCanvas(
      tempCanvas,
      {
        studentName: cert.studentName,
        templateType: cert.templateType,
        trackTitle: cert.courseTitle,
        achievementTitle: cert.achievementTitle,
        congratulationText: 'مبارك إتمامك المبارك، ونسأل الله أن يجعل القرآن ربيع قلبك ونور صدرك.',
        quranAyah: '﴿ يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ ﴾',
        teacherName: cert.teacherName,
        supervisorName: cert.supervisorName,
        issueDate: cert.issueDate,
        grade: cert.grade,
        verificationCode: cert.verificationCode,
        showSeal: true,
        themeId: cert.themeId,
      },
      2
    );
    downloadCanvasAsPng(tempCanvas, `شهادة_${cert.studentName}_${cert.verificationCode}`);
  };

  const filteredCerts = certificates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.studentName.toLowerCase().includes(q) ||
      c.verificationCode.toLowerCase().includes(q) ||
      c.courseTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>محرك الشهادات والأوسمة القرآنية المعتمدة</span>
          </div>
          <h1 className="text-2xl font-black text-white">إصدار الشهادات الرسمية والتحميل (PDF)</h1>
          <p className="text-amber-100/80 text-sm mt-1">
            توليد شهادات الإجازة والإتمام برموز توثيق أكاديمية معتمدة قابلة للتحقق والطباعة الفورية.
          </p>
        </div>
        <button
          onClick={handleOpenIssueModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>إصدار شهادة جديدة</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، رمز التوثيق، أو المسار..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
          <span>إظهار الشهادات المؤرشفة (حذف ناعم)</span>
        </label>
      </div>

      {/* Certificates Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">رمز التوثيق المعتمد</th>
                <th className="py-3 px-4">الطالب</th>
                <th className="py-3 px-4">المسار والإنجاز</th>
                <th className="py-3 px-4">التقدير</th>
                <th className="py-3 px-4">تاريخ الإصدار</th>
                <th className="py-3 px-4">المعلم والمشرف</th>
                <th className="py-3 px-4 text-center">الإجراءات والتحميل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    لا توجد شهادات مسجلة تطابق شروط البحث.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr
                    key={cert.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                      cert.isDeleted ? 'bg-rose-50/20 opacity-75' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{cert.verificationCode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{cert.studentName}</span>
                        {cert.isDeleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                            محذوف ناعماً
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {cert.courseTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {cert.achievementTitle}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                        {cert.grade}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {cert.issueDate}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      <div>{cert.teacherName}</div>
                      <div className="text-[10px] text-slate-400">{cert.supervisorName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
                          title="معاينة الشهادة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(cert)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                          title="تحميل الشهادة (PDF / High-Res PNG)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </button>
                        <button
                          onClick={() => setItemToDelete(cert)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="حذف ناعم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal with Live Canvas Rendering */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 to-emerald-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>إصدار شهادة إتمام واعتماد أكاديمية</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Controls */}
                <form onSubmit={handleIssueCertificate} className="space-y-3.5 text-right">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الطالب المستحق</label>
                      <select
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.childName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المسار التعليمي</label>
                      <select
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الإنجاز الأكاديمي</label>
                    <input
                      type="text"
                      required
                      value={formData.achievementTitle}
                      onChange={(e) => setFormData({ ...formData, achievementTitle: e.target.value })}
                      placeholder="حفظ وإتقان جزء عم كاملاً برواية حفص عن عاصم"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع القالب</label>
                      <select
                        value={formData.templateType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            templateType: e.target.value as AdminCertificateRecord['templateType'],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="completion">شهادة إتمام وحفظ</option>
                        <option value="star_student">شهادة تميز وتفوق</option>
                        <option value="qaidah_diploma">إجازة نور البيان</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">النمط الزخرفي</label>
                      <select
                        value={formData.themeId}
                        onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="emerald_gold">الزمردي الملكي والذهب</option>
                        <option value="sapphire_gold">الياقوتي الكحلي والذهب</option>
                        <option value="antique_parchment">العاجي المعتق والأندلسي</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التقدير</label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الإصدار</label>
                      <input
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المعلم المجيز</label>
                      <input
                        type="text"
                        value={formData.teacherName}
                        onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المشرف العام</label>
                      <input
                        type="text"
                        value={formData.supervisorName}
                        onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      تأكيد إصدار الشهادة الرسمية
                    </button>
                  </div>
                </form>

                {/* Live Canvas Preview */}
                <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 mb-2">معاينة حية دقيقة للشهادة:</span>
                  <div className="w-full max-w-[360px] aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-700">
                    <canvas ref={modalCanvasRef} className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Print Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  معاينة الشهادة المعتمدة: {previewCert.verificationCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(previewCert)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل PDF</span>
                </button>
                <button
                  onClick={handlePrintCertificate}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
              <div className="w-full max-w-[640px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700">
                <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم للشهادة"
        itemTypeLabel="شهادة"
        itemName={`${itemToDelete?.studentName} (${itemToDelete?.verificationCode})`}
      />
    </div>
  );
};
