import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  BookOpen,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';
import { adminService, AdminStudent, AdminCourse, AdminEnrollment } from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'enrollments'>('students');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminStudent | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<AdminEnrollment | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    childName: '',
    age: 8,
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    country: 'المملكة العربية السعودية',
    courseId: '',
    level: 'المستوى الثاني (جزء عم)',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
    status: 'active' as AdminStudent['status'],
    teacherNotes: '',
  });

  const loadData = () => {
    setStudents(adminService.getStudents(showDeleted));
    setCourses(adminService.getCourses(false));
    setEnrollments(adminService.getEnrollments(showDeleted));
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      childName: '',
      age: 8,
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      country: 'المملكة العربية السعودية',
      courseId: courses[0]?.id || '',
      level: 'المستوى الثاني (جزء عم)',
      assignedTeacherEmail: 'teacher@noor-bayan.com',
      status: 'active',
      teacherNotes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: AdminStudent) => {
    setEditingStudent(student);
    setFormData({
      childName: student.childName,
      age: student.age,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      country: student.country,
      courseId: student.courseId,
      level: student.level,
      assignedTeacherEmail: student.assignedTeacherEmail,
      status: student.status,
      teacherNotes: student.teacherNotes,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childName.trim() || !formData.parentName.trim()) {
      setFeedbackMessage({ type: 'error', text: 'يرجى إدخال اسم الطالب واسم ولي الأمر.' });
      return;
    }

    try {
      const selectedCourse = courses.find((c) => c.id === formData.courseId) || courses[0];
      if (editingStudent) {
        adminService.updateStudent(editingStudent.id, {
          ...formData,
          program: selectedCourse?.title || editingStudent.program,
          courseId: selectedCourse?.id || editingStudent.courseId,
          assignedTeacherName: selectedCourse?.assignedTeacherName || 'الشيخ عبد الله القرني',
        });
        setFeedbackMessage({ type: 'success', text: 'تم تحديث بيانات الطالب وتصنيفه بنجاح.' });
      } else {
        const created = adminService.createStudent({
          ...formData,
          program: selectedCourse?.title || 'حلقات تحفيظ القرآن الكريم',
          assignedTeacherName: selectedCourse?.assignedTeacherName || 'الشيخ عبد الله القرني',
          memorizedSurahs: [],
          attendanceRate: 100,
        });
        // Also auto-enroll in course
        if (selectedCourse) {
          adminService.createEnrollment({
            studentId: created.id,
            studentName: created.childName,
            courseId: selectedCourse.id,
            courseTitle: selectedCourse.title,
            paymentStatus: 'paid',
          });
        }
        setFeedbackMessage({ type: 'success', text: 'تمت إضافة الطالب الجديد وإدراجه في المسار بنجاح.' });
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err?.message || 'حدث خطأ أثناء حفظ الطالب.' });
    }
  };

  const handleConfirmSoftDelete = () => {
    if (itemToDelete) {
      adminService.softDeleteStudent(itemToDelete.id);
      setFeedbackMessage({ type: 'success', text: `تم حذف الطالب (${itemToDelete.childName}) حذفاً ناعماً ونقله للأرشيف.` });
      setItemToDelete(null);
      loadData();
    }
  };

  const handleRestoreStudent = (student: AdminStudent) => {
    adminService.restoreStudent(student.id);
    setFeedbackMessage({ type: 'success', text: `تمت استعادة الطالب (${student.childName}) بنجاح.` });
    loadData();
  };

  const handleConfirmEnrollmentDelete = () => {
    if (enrollmentToDelete) {
      adminService.softDeleteEnrollment(enrollmentToDelete.id);
      setFeedbackMessage({ type: 'success', text: `تم حذف التسجيل للطالب (${enrollmentToDelete.studentName}) حذفاً ناعماً.` });
      setEnrollmentToDelete(null);
      loadData();
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.childName.includes(searchQuery) ||
      s.parentName.includes(searchQuery) ||
      s.parentPhone.includes(searchQuery);
    const matchesLevel = levelFilter === 'all' || s.level.includes(levelFilter);
    const matchesCourse = courseFilter === 'all' || s.courseId === courseFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesLevel && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Quick Stats */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>بوابة الإدارة المركزية للأكاديمية</span>
          </div>
          <h1 className="text-2xl font-black text-white">إدارة الطلاب والتصنيفات والمستويات</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            عرض وتصنيف كافة الطلاب، متابعة مراحل الحفظ، وإدارة التسجيلات والمسارات مع الحذف الناعم المؤمن.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            قائمة الطلاب ({filteredStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'enrollments'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            سجلات الالتحاق والتسجيل ({enrollments.length})
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span>إظهار المحذوفات ناعماً (الأرشيف)</span>
        </label>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'students' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، ولي الأمر، أو رقم الهاتف..."
                className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
              >
                <option value="all">كافة المسارات</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
              >
                <option value="all">كافة المستويات</option>
                <option value="التمهيدي">المستوى التمهيدي</option>
                <option value="الأول">المستوى الأول</option>
                <option value="الثاني">المستوى الثاني</option>
                <option value="الثالث">المستوى الثالث</option>
                <option value="الرابع">المستوى الرابع / المتقنون</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
              >
                <option value="all">كافة الحالات</option>
                <option value="active">منتظم نشط</option>
                <option value="trial">تجريبي</option>
                <option value="completed">أتم المسار</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">الطالب</th>
                    <th className="py-3 px-4">المستوى والتصنيف</th>
                    <th className="py-3 px-4">المسار التعليمي</th>
                    <th className="py-3 px-4">المعلم المسند</th>
                    <th className="py-3 px-4">السور المنجزة</th>
                    <th className="py-3 px-4">نسبة الحضور</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        لا يوجد طلاب يطابقون شروط البحث والتصفية.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => (
                      <tr
                        key={std.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                          std.isDeleted ? 'bg-rose-50/30 dark:bg-rose-950/20 opacity-75' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{std.childName}</span>
                            {std.isDeleted && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold">
                                محذوف ناعماً
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{std.age} سنوات</span>
                            <span>•</span>
                            <span>ولي الأمر: {std.parentName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{std.parentPhone}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                            {std.level}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 text-xs font-medium">
                          {std.program}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                          {std.assignedTeacherName}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {std.memorizedSurahs.length} سور
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {std.memorizedSurahs.slice(0, 3).join('، ')}
                            {std.memorizedSurahs.length > 3 ? '...' : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              %{std.attendanceRate}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${std.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                              std.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : std.status === 'trial'
                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {std.status === 'active' ? 'منتظم' : std.status === 'trial' ? 'تجريبي' : 'مكتمل'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {std.isDeleted ? (
                              <button
                                onClick={() => handleRestoreStudent(std)}
                                title="استعادة من الأرشيف"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(std)}
                                  title="تعديل البيانات والتصنيف"
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setItemToDelete(std)}
                                  title="حذف ناعم (Soft Delete)"
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Enrollments Tab */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">معرف الالتحاق</th>
                  <th className="py-3 px-4">اسم الطالب</th>
                  <th className="py-3 px-4">المسار المسجل فيه</th>
                  <th className="py-3 px-4">تاريخ التسجيل</th>
                  <th className="py-3 px-4">حالة الرسوم</th>
                  <th className="py-3 px-4">حالة الالتحاق</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{enr.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{enr.studentName}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {enr.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(enr.enrolledAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        {enr.paymentStatus === 'paid' ? 'مسدد' : 'قيد السداد'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {enr.status === 'active' ? 'نشط' : enr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setEnrollmentToDelete(enr)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="إلغاء التسجيل وحذفه ناعماً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="h-1.5 bg-emerald-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingStudent ? 'تعديل بيانات الطالب وتصنيفه' : 'إضافة طالب جديد إلى الأكاديمية'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4 text-right">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الطالب الرباعي</label>
                    <input
                      type="text"
                      required
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      placeholder="مثال: عمر أحمد السعيد"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عمر الطالب (سنوات)</label>
                    <input
                      type="number"
                      required
                      min={4}
                      max={18}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم ولي الأمر</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="مثال: أحمد السعيد"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">هاتف ولي الأمر / واتساب</label>
                    <input
                      type="text"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="+966 50 123 4567"
                      dir="ltr"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المسار التعليمي</label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المستوى والتصنيف الأكاديمي</label>
                    <input
                      type="text"
                      required
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      placeholder="مثال: المستوى الثاني (جزء عم)"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات توجيهية للمعلم</label>
                  <textarea
                    rows={2}
                    value={formData.teacherNotes}
                    onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                    placeholder="ملاحظات حول مستوى الطالب، حفظه السابق، أو التوجيهات الخاصة..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                  >
                    {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal for Student */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم للطالب"
        itemTypeLabel="طالب"
        itemName={itemToDelete?.childName || ''}
      />

      {/* Soft Delete Confirmation Modal for Enrollment */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(enrollmentToDelete)}
        onClose={() => setEnrollmentToDelete(null)}
        onConfirm={handleConfirmEnrollmentDelete}
        title="تأكيد حذف تسجيل الطالب في المسار"
        itemTypeLabel="سجل التحاق"
        itemName={`${enrollmentToDelete?.studentName} - ${enrollmentToDelete?.courseTitle}`}
      />
    </div>
  );
};
