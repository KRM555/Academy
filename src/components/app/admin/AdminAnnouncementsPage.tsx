import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  Users,
  BookOpen,
  User,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import {
  adminService,
  AdminAnnouncement,
  AdminCourse,
  AdminStudent,
} from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdminAnnouncement | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as AdminAnnouncement['targetAudience'],
    targetCourseId: '',
    targetStudentIds: [] as string[],
    priority: 'normal' as AdminAnnouncement['priority'],
  });

  const loadData = () => {
    setAnnouncements(adminService.getAnnouncements(showDeleted));
    setCourses(adminService.getCourses(false));
    setStudents(adminService.getStudents(false));
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      content: '',
      targetAudience: 'all',
      targetCourseId: courses[0]?.id || '',
      targetStudentIds: [],
      priority: 'normal',
    });
    setIsModalOpen(true);
  };

  const handleToggleStudentSelection = (studentId: string) => {
    const current = formData.targetStudentIds;
    if (current.includes(studentId)) {
      setFormData({ ...formData, targetStudentIds: current.filter((id) => id !== studentId) });
    } else {
      setFormData({ ...formData, targetStudentIds: [...current, studentId] });
    }
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setFeedback({ type: 'error', text: 'يرجى كتابة عنوان ونص التعميم.' });
      return;
    }

    try {
      let targetCourseTitle = '';
      if (formData.targetAudience === 'course') {
        const foundCourse = courses.find((c) => c.id === formData.targetCourseId);
        targetCourseTitle = foundCourse?.title || 'مسار تعليمي';
      }

      let targetStudentNames: string[] = [];
      if (formData.targetAudience === 'specific_students') {
        targetStudentNames = students
          .filter((s) => formData.targetStudentIds.includes(s.id))
          .map((s) => s.childName);
      }

      adminService.createAnnouncement({
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience,
        targetCourseId: formData.targetCourseId,
        targetCourseTitle,
        targetStudentIds: formData.targetStudentIds,
        targetStudentNames,
        priority: formData.priority,
      });

      setFeedback({ type: 'success', text: 'تم إرسال ونشر التعميم الرسمي بنجاح للجمهور المستهدف.' });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'حدث خطأ أثناء حفظ التعميم.' });
    }
  };

  const handleConfirmSoftDelete = () => {
    if (itemToDelete) {
      adminService.softDeleteAnnouncement(itemToDelete.id);
      setFeedback({
        type: 'success',
        text: `تم حذف التعميم (${itemToDelete.title}) حذفاً ناعماً.`,
      });
      setItemToDelete(null);
      loadData();
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.includes(searchQuery) || a.content.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>نظام البث والتنبيهات الموجهة</span>
          </div>
          <h1 className="text-2xl font-black text-white">التعميمات والتوجيهات الإدارية</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            إرسال إعلانات موجهة (للجميع، لمسار تعليمي محدد، أو لطلاب بعينهم) مع تحديد درجة الأهمية والأرشفة.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء تعميم جديد</span>
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
            placeholder="بحث في محتوى وعناوين التعميمات..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span>إظهار التعميمات المحذوفة ناعماً</span>
        </label>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
            لا توجد تعميمات مسجلة تطابق شروط التصفية.
          </div>
        ) : (
          filteredAnnouncements.map((anc) => (
            <div
              key={anc.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                anc.isDeleted
                  ? 'border-rose-300 dark:border-rose-900/40 bg-rose-50/20 opacity-75'
                  : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      anc.priority === 'urgent'
                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                        : anc.priority === 'important'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {anc.priority === 'urgent' ? 'عاجل' : anc.priority === 'important' ? 'هام' : 'عادي'}
                  </span>

                  {/* Audience Badge */}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                    {anc.targetAudience === 'all' ? (
                      <>
                        <Users className="w-3 h-3" />
                        <span>موجه لكافة المشتركين (الجميع)</span>
                      </>
                    ) : anc.targetAudience === 'course' ? (
                      <>
                        <BookOpen className="w-3 h-3" />
                        <span>مسار: {anc.targetCourseTitle}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        <span>طلاب محددون ({anc.targetStudentNames?.join('، ')})</span>
                      </>
                    )}
                  </span>

                  {anc.isDeleted && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      محذوف ناعماً
                    </span>
                  )}

                  <span className="text-xs text-slate-400 mr-auto">
                    {new Date(anc.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{anc.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {anc.content}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => setItemToDelete(anc)}
                  className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="حذف ناعم (Soft Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="h-1.5 bg-emerald-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  إنشاء وبث تعميم إداري جديد
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان التعميم / التنبيه
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: موعد اختبارات نهاية الفصل ومسابقة الترتيل"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الجمهور المستهدف
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAudience: e.target.value as AdminAnnouncement['targetAudience'],
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                    >
                      <option value="all">الجميع (كافة الطلاب والمعلمين والأولياء)</option>
                      <option value="course">مسار تعليمي محدد</option>
                      <option value="specific_students">طلاب محددون فقط</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      درجة الأهمية
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as AdminAnnouncement['priority'],
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                    >
                      <option value="normal">عادي</option>
                      <option value="important">هام</option>
                      <option value="urgent">عاجل وفوري</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Course Selector */}
                {formData.targetAudience === 'course' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اختر المسار التعليمي المستهدف:
                    </label>
                    <select
                      value={formData.targetCourseId}
                      onChange={(e) => setFormData({ ...formData, targetCourseId: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Conditional Specific Students Multi-select */}
                {formData.targetAudience === 'specific_students' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      حدد الطلاب المستهدفين بهذا التعميم:
                    </label>
                    <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 max-h-36 overflow-y-auto">
                      {students.map((student) => {
                        const isSelected = formData.targetStudentIds.includes(student.id);
                        return (
                          <label key={student.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleStudentSelection(student.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span>{student.childName} ({student.program})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نص وتفاصيل التعميم
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="اكتب التوجيه أو التعميم بأسلوب واضح ومحدد..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>نشر التعميم الآن</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم للتعميم"
        itemTypeLabel="تعميم إداري"
        itemName={itemToDelete?.title || ''}
      />
    </div>
  );
};
