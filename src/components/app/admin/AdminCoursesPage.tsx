import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService, AdminCourse, AdminTeacher } from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<AdminCourse | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'quran',
    ageBracket: '5 - 15 سنة',
    minAge: 5,
    maxAge: 15,
    priceSar: 260,
    billingUnit: 'شهرياً',
    weeklySessions: 3,
    sessionDurationMins: 45,
    deliveryMode: 'online' as const,
    image: '/assets/programs/quran_islamic.jpg',
    description: '',
    featuresText: 'حلقات تفاعلية حية عبر زوم\nمتابعة مستمرة وإتقان التجويد\nتقارير أسبوعية لولي الأمر',
    assignedTeacherEmail: 'teacher@noor-bayan.com',
  });

  const loadData = () => {
    setCourses(adminService.getCourses(showDeleted));
    setTeachers(adminService.getTeachers(false));
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      subtitle: '',
      category: 'quran',
      ageBracket: '5 - 15 سنة',
      minAge: 5,
      maxAge: 15,
      priceSar: 260,
      billingUnit: 'شهرياً',
      weeklySessions: 3,
      sessionDurationMins: 45,
      deliveryMode: 'online',
      image: '/assets/programs/quran_islamic.jpg',
      description: '',
      featuresText: 'حلقات تفاعلية حية\nمتابعة أسبوعية دقيقة\nشهادات إتمام معتمدة',
      assignedTeacherEmail: teachers[0]?.email || 'teacher@noor-bayan.com',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: AdminCourse) => {
    setEditingCourse(c);
    setFormData({
      title: c.title,
      subtitle: c.subtitle,
      category: c.category,
      ageBracket: c.ageBracket,
      minAge: c.minAge,
      maxAge: c.maxAge,
      priceSar: c.priceSar,
      billingUnit: c.billingUnit,
      weeklySessions: c.weeklySessions,
      sessionDurationMins: c.sessionDurationMins,
      deliveryMode: c.deliveryMode,
      image: c.image,
      description: c.description,
      featuresText: c.features.join('\n'),
      assignedTeacherEmail: c.assignedTeacherEmail || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', text: 'يرجى إدخال عنوان المسار التعليمي.' });
      return;
    }

    try {
      const assignedTeacher = teachers.find((t) => t.email === formData.assignedTeacherEmail);
      const featuresArray = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      if (editingCourse) {
        adminService.updateCourse(editingCourse.id, {
          title: formData.title,
          subtitle: formData.subtitle,
          category: formData.category,
          ageBracket: formData.ageBracket,
          minAge: formData.minAge,
          maxAge: formData.maxAge,
          priceSar: formData.priceSar,
          billingUnit: formData.billingUnit,
          weeklySessions: formData.weeklySessions,
          sessionDurationMins: formData.sessionDurationMins,
          deliveryMode: formData.deliveryMode,
          image: formData.image,
          description: formData.description,
          features: featuresArray,
          assignedTeacherEmail: formData.assignedTeacherEmail,
          assignedTeacherName: assignedTeacher?.name || 'الشيخ عبد الله القرني',
        });
        setFeedback({ type: 'success', text: 'تم تحديث بيانات المسار التعليمي بنجاح.' });
      } else {
        adminService.createCourse({
          title: formData.title,
          subtitle: formData.subtitle,
          category: formData.category,
          ageBracket: formData.ageBracket,
          minAge: formData.minAge,
          maxAge: formData.maxAge,
          priceSar: formData.priceSar,
          billingUnit: formData.billingUnit,
          weeklySessions: formData.weeklySessions,
          sessionDurationMins: formData.sessionDurationMins,
          deliveryMode: formData.deliveryMode,
          image: formData.image,
          description: formData.description,
          features: featuresArray,
          assignedTeacherEmail: formData.assignedTeacherEmail,
          assignedTeacherName: assignedTeacher?.name || 'الشيخ عبد الله القرني',
        });
        setFeedback({ type: 'success', text: 'تم إنشاء المسار التعليمي الجديد بنجاح.' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'حدث خطأ أثناء حفظ المسار.' });
    }
  };

  const handleConfirmSoftDelete = () => {
    if (courseToDelete) {
      adminService.softDeleteCourse(courseToDelete.id);
      setFeedback({ type: 'success', text: `تم حذف المسار (${courseToDelete.title}) حذفاً ناعماً ونقله إلى الأرشيف.` });
      setCourseToDelete(null);
      loadData();
    }
  };

  const handleRestoreCourse = (c: AdminCourse) => {
    adminService.restoreCourse(c.id);
    setFeedback({ type: 'success', text: `تمت استعادة المسار (${c.title}) بنجاح.` });
    loadData();
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.includes(searchQuery) || c.subtitle.includes(searchQuery);
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>إدارة المناهج والمسارات الأكاديمية</span>
          </div>
          <h1 className="text-2xl font-black text-white">المسارات والبرامج التعليمية (CRUD)</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            إنشاء وتعديل البرامج التعليمية، تسعير الاشتراكات، تعيين المعلمين، وإدارة الدروس المرتبطة.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مسار تعليمي جديد</span>
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
            placeholder="بحث في أسماء المسارات والبرامج..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
          >
            <option value="all">كافة الفئات</option>
            <option value="quran">القرآن الكريم والتجويد</option>
            <option value="arabic">اللغة والتأسيس (نور البيان)</option>
            <option value="values">القيم والآداب النبوية</option>
            <option value="international">المناهج الدولية والرياضيات</option>
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>إظهار المسارات المحذوفة ناعماً</span>
          </label>
        </div>
      </div>

      {/* Courses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border transition flex flex-col justify-between ${
              course.isDeleted
                ? 'border-rose-300 dark:border-rose-900/40 bg-rose-50/20 opacity-75'
                : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
            }`}
          >
            <div>
              {/* Image banner */}
              <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/programs/quran_islamic.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow">
                    {course.category === 'quran'
                      ? 'القرآن الكريم'
                      : course.category === 'arabic'
                      ? 'التأسيس اللغوي'
                      : course.category === 'values'
                      ? 'غراس القيم'
                      : 'المناهج الدولية'}
                  </span>
                  {course.isDeleted && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      محذوف ناعماً
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2.5 right-3 text-white">
                  <span className="text-xs font-semibold">{course.ageBracket}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{course.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {course.subtitle || course.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800 mb-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.weeklySessions} حصص أسبوعياً</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.sessionDurationMins} دقيقة / جلسة</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-slate-500">المعلم المسند: </span>
                  <span>{course.assignedTeacherName || 'لم يعين معلم بعد'}</span>
                </div>

                {/* Features list */}
                <div className="space-y-1">
                  {course.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {course.priceSar} ر.س
                  </span>
                  <span className="text-[11px] text-slate-400 mr-1">/ {course.billingUnit}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/app/lessons?courseId=${course.id}`}
                    title="إدارة الدروس والمحاضرات"
                    className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition text-xs font-bold flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>الدروس</span>
                  </Link>

                  {course.isDeleted ? (
                    <button
                      onClick={() => handleRestoreCourse(course)}
                      title="استعادة المسار"
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(course)}
                        title="تعديل المسار"
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCourseToDelete(course)}
                        title="حذف ناعم (Soft Delete)"
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="h-1.5 bg-emerald-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingCourse ? 'تعديل المسار التعليمي' : 'إنشاء مسار تعليمي جديد'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المسار</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: حلقات تحفيظ القرآن الكريم وتجويده"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان الفرعي والوصف الموجز</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="حفظ وتثبيت وضبط أحكام التجويد ومخارج الحروف"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفئة الأكاديمية</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="quran">القرآن الكريم والتجويد</option>
                      <option value="arabic">اللغة والتأسيس (نور البيان)</option>
                      <option value="values">القيم والآداب النبوية</option>
                      <option value="international">المناهج الدولية والرياضيات</option>
                      <option value="languages">اللغات الحية</option>
                      <option value="tech">الذكاء والبرمجة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المعلم المسند للمسار</label>
                    <select
                      value={formData.assignedTeacherEmail}
                      onChange={(e) => setFormData({ ...formData, assignedTeacherEmail: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.email}>{t.name} ({t.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">السعر (ر.س)</label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={formData.priceSar}
                      onChange={(e) => setFormData({ ...formData, priceSar: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الحصص أسبوعياً</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={formData.weeklySessions}
                      onChange={(e) => setFormData({ ...formData, weeklySessions: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">مدة الحصة (دقيقة)</label>
                    <input
                      type="number"
                      min={20}
                      max={120}
                      value={formData.sessionDurationMins}
                      onChange={(e) => setFormData({ ...formData, sessionDurationMins: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الفئة العمرية</label>
                    <input
                      type="text"
                      value={formData.ageBracket}
                      onChange={(e) => setFormData({ ...formData, ageBracket: e.target.value })}
                      placeholder="5 - 15 سنة"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة المسار</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/assets/programs/quran_islamic.jpg"
                      dir="ltr"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مميزات المسار (سطر لكل ميزة)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
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
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                  >
                    {editingCourse ? 'حفظ التعديلات' : 'إنشاء المسار'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم للمسار التعليمي"
        itemTypeLabel="مسار تعليمي"
        itemName={courseToDelete?.title || ''}
      />
    </div>
  );
};
