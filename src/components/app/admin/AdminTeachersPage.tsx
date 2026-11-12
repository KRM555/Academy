import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  BookOpen,
  DollarSign,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { adminService, AdminTeacher, AdminCourse } from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<AdminTeacher | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    hourlyRateSar: 65,
    teachingHours: 30,
    bankName: 'مصرف الراجحي (Al Rajhi Bank)',
    accountHolderName: '',
    ibanMasked: 'SA03 •••• •••• •••• 6789',
    assignedCourseIds: [] as string[],
    status: 'active' as AdminTeacher['status'],
  });

  const loadData = () => {
    setTeachers(adminService.getTeachers(showDeleted));
    setCourses(adminService.getCourses(false));
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '+966 50 ',
      specialty: 'القراءات والتجويد',
      hourlyRateSar: 65,
      teachingHours: 30,
      bankName: 'مصرف الراجحي (Al Rajhi Bank)',
      accountHolderName: '',
      ibanMasked: 'SA03 •••• •••• •••• 6789',
      assignedCourseIds: [],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: AdminTeacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      email: t.email,
      phone: t.phone,
      specialty: t.specialty,
      hourlyRateSar: t.hourlyRateSar,
      teachingHours: t.teachingHours,
      bankName: t.bankName,
      accountHolderName: t.accountHolderName,
      ibanMasked: t.ibanMasked,
      assignedCourseIds: t.assignedCourseIds,
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleCourseAssignment = (courseId: string) => {
    const current = formData.assignedCourseIds;
    if (current.includes(courseId)) {
      setFormData({ ...formData, assignedCourseIds: current.filter((id) => id !== courseId) });
    } else {
      setFormData({ ...formData, assignedCourseIds: [...current, courseId] });
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFeedback({ type: 'error', text: 'يرجى إدخال اسم المعلم والبريد الإلكتروني.' });
      return;
    }

    try {
      const assignedCoursesObjs = courses
        .filter((c) => formData.assignedCourseIds.includes(c.id))
        .map((c) => ({ id: c.id, title: c.title }));

      if (editingTeacher) {
        adminService.updateTeacher(editingTeacher.id, {
          ...formData,
          assignedCourses: assignedCoursesObjs,
        });
        setFeedback({ type: 'success', text: 'تم تحديث بيانات المعلم والمسارات المسندة بنجاح.' });
      } else {
        adminService.createTeacher({
          ...formData,
          accountHolderName: formData.accountHolderName || formData.name,
          assignedCourses: assignedCoursesObjs,
        });
        setFeedback({ type: 'success', text: 'تمت إضافة المعلم الجديد بنجاح.' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'حدث خطأ أثناء حفظ المعلم.' });
    }
  };

  const handleConfirmSoftDelete = () => {
    if (teacherToDelete) {
      adminService.softDeleteTeacher(teacherToDelete.id);
      setFeedback({ type: 'success', text: `تم حذف المعلم (${teacherToDelete.name}) حذفاً ناعماً ونقله إلى الأرشيف.` });
      setTeacherToDelete(null);
      loadData();
    }
  };

  const handleRestoreTeacher = (t: AdminTeacher) => {
    adminService.restoreTeacher(t.id);
    setFeedback({ type: 'success', text: `تمت استعادة المعلم (${t.name}) بنجاح.` });
    loadData();
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.specialty.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>إدارة الكادر التعليمي</span>
          </div>
          <h1 className="text-2xl font-black text-white">إدارة المعلمين وتعيين المسارات التعليمية</h1>
          <p className="text-teal-100/80 text-sm mt-1">
            إسناد حلقات القرآن والمناهج للمعلمين، متابعة الساعات المعتمدة وأجر الساعة، والبيانات البنكية المشفرة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة معلم جديد</span>
          </button>
        </div>
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
            placeholder="بحث باسم المعلم، البريد الإلكتروني، أو التخصص..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <span>إظهار المعلمين المؤرشفين (حذف ناعم)</span>
        </label>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border transition flex flex-col justify-between ${
              teacher.isDeleted
                ? 'border-rose-300 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 opacity-75'
                : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-lg">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{teacher.name}</span>
                      {teacher.isDeleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold">
                          محذوف ناعماً
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{teacher.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {teacher.isDeleted ? (
                    <button
                      onClick={() => handleRestoreTeacher(teacher)}
                      title="استعادة المعلم"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(teacher)}
                        title="تعديل"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTeacherToDelete(teacher)}
                        title="حذف ناعم"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span dir="ltr">{teacher.phone}</span>
                </div>
              </div>

              {/* Assigned Courses Badges */}
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  المسارات التعليمية المسندة ({teacher.assignedCourses.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.assignedCourses.length === 0 ? (
                    <span className="text-xs text-slate-400">لا توجد مسارات مسندة حالياً</span>
                  ) : (
                    teacher.assignedCourses.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-semibold"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{c.title}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Financial and Banking Details */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">أجر الساعة</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {teacher.hourlyRateSar} ر.س / ساعة
                </span>
              </div>
              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">الحساب البنكي (الآيبان)</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {teacher.ibanMasked}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="h-1.5 bg-teal-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingTeacher ? 'تعديل بيانات المعلم والمسارات' : 'إضافة معلم جديد للكادر'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTeacher} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المعلم كاملاً</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: الشيخ عبد الله القرني"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="teacher@noor-bayan.com"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف / واتساب</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966 50 123 4567"
                      dir="ltr"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التخصص والخبرة</label>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      placeholder="مثال: القراءات العشر وتأسيس الأطفال"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">أجر الساعة (ريال سعودي)</label>
                    <input
                      type="number"
                      min={30}
                      max={300}
                      value={formData.hourlyRateSar}
                      onChange={(e) => setFormData({ ...formData, hourlyRateSar: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Assign Courses Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    تعيين المسارات التعليمية والحلقات للمعلم:
                  </label>
                  <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 max-h-36 overflow-y-auto">
                    {courses.map((course) => {
                      const isAssigned = formData.assignedCourseIds.includes(course.id);
                      return (
                        <label key={course.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleCourseAssignment(course.id)}
                            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                          />
                          <span>{course.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم البنك</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="مصرف الراجحي"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الآيبان (IBAN)</label>
                    <input
                      type="text"
                      value={formData.ibanMasked}
                      onChange={(e) => setFormData({ ...formData, ibanMasked: e.target.value })}
                      placeholder="SA03 •••• •••• •••• 6789"
                      dir="ltr"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right"
                    />
                  </div>
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
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition"
                  >
                    {editingTeacher ? 'حفظ التعديلات' : 'إضافة المعلم'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(teacherToDelete)}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم للمعلم"
        itemTypeLabel="معلم"
        itemName={teacherToDelete?.name || ''}
      />
    </div>
  );
};
