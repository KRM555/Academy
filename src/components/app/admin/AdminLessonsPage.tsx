import React, { useState, useEffect } from 'react';
import {
  Video,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { adminService, AdminLesson, AdminCourse } from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminLessonsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCourseId = searchParams.get('courseId') || 'all';

  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(urlCourseId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<AdminLesson | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Image Upload state
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    courseId: '',
    lessonNumber: 1,
    title: '',
    description: '',
    onlineLectureLink: 'https://meet.google.com/xyz-quran-live',
    imageUrl: '',
    durationMinutes: 45,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '16:30',
    status: 'scheduled' as AdminLesson['status'],
  });

  const loadData = () => {
    const allCourses = adminService.getCourses(false);
    setCourses(allCourses);
    setLessons(adminService.getLessons(selectedCourseId, showDeleted));
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId, showDeleted]);

  const handleCourseFilterChange = (cId: string) => {
    setSelectedCourseId(cId);
    if (cId === 'all') {
      searchParams.delete('courseId');
    } else {
      searchParams.set('courseId', cId);
    }
    setSearchParams(searchParams);
  };

  const handleOpenAddModal = () => {
    setEditingLesson(null);
    const initialCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
    const defaultCourseId = initialCourse?.id || '';
    const currentLessonsInCourse = adminService.getLessons(defaultCourseId, false);
    const nextLessonNumber = currentLessonsInCourse.length + 1;

    setFormData({
      courseId: defaultCourseId,
      lessonNumber: nextLessonNumber,
      title: '',
      description: '',
      onlineLectureLink: 'https://meet.google.com/xyz-quran-live',
      imageUrl: '/assets/programs/quran_islamic.jpg',
      durationMinutes: 45,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '16:30',
      status: 'scheduled',
    });
    setUploadedImagePreview('/assets/programs/quran_islamic.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lesson: AdminLesson) => {
    setEditingLesson(lesson);
    setFormData({
      courseId: lesson.courseId,
      lessonNumber: lesson.lessonNumber,
      title: lesson.title,
      description: lesson.description,
      onlineLectureLink: lesson.onlineLectureLink,
      imageUrl: lesson.imageUrl,
      durationMinutes: lesson.durationMinutes,
      scheduledDate: lesson.scheduledDate,
      scheduledTime: lesson.scheduledTime,
      status: lesson.status,
    });
    setUploadedImagePreview(lesson.imageUrl);
    setIsModalOpen(true);
  };

  // Image Upload handler for Storage
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP).' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUri = uploadEvent.target?.result as string;
      setUploadedImagePreview(dataUri);
      setFormData((prev) => ({ ...prev, imageUrl: dataUri }));
      setIsUploading(false);
      setFeedback({ type: 'success', text: 'تم تحميل صورة الدرس بنجاح لمعاينتها وتخزينها.' });
    };
    reader.onerror = () => {
      setIsUploading(false);
      setFeedback({ type: 'error', text: 'فشل قراءة ملف الصورة.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', text: 'يرجى إدخال عنوان الدرس.' });
      return;
    }
    if (!formData.onlineLectureLink.trim()) {
      setFeedback({ type: 'error', text: 'يرجى إدخال رابط المحاضرة المباشرة (Zoom / Google Meet).' });
      return;
    }

    try {
      const targetCourse = courses.find((c) => c.id === formData.courseId) || courses[0];
      if (editingLesson) {
        adminService.updateLesson(editingLesson.id, {
          ...formData,
          courseTitle: targetCourse?.title || editingLesson.courseTitle,
          imageUrl: uploadedImagePreview || formData.imageUrl,
        });
        setFeedback({ type: 'success', text: 'تم تحديث بيانات الدرس ورابط البث المباشر بنجاح.' });
      } else {
        adminService.createLesson({
          ...formData,
          courseTitle: targetCourse?.title || 'المسار التعليمي',
          imageUrl: uploadedImagePreview || formData.imageUrl || '/assets/programs/quran_islamic.jpg',
        });
        setFeedback({ type: 'success', text: 'تمت إضافة الدرس الجديد ورابط البث بنجاح.' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'حدث خطأ أثناء حفظ الدرس.' });
    }
  };

  const handleConfirmSoftDelete = () => {
    if (lessonToDelete) {
      adminService.softDeleteLesson(lessonToDelete.id);
      setFeedback({ type: 'success', text: `تم حذف الدرس (${lessonToDelete.title}) حذفاً ناعماً ونقله إلى الأرشيف.` });
      setLessonToDelete(null);
      loadData();
    }
  };

  const handleRestoreLesson = (les: AdminLesson) => {
    adminService.restoreLesson(les.id);
    setFeedback({ type: 'success', text: `تمت استعادة الدرس (${les.title}) بنجاح.` });
    loadData();
  };

  const filteredLessons = lessons.filter((l) => {
    const matchesSearch = l.title.includes(searchQuery) || l.description.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>إدارة الحصص والدروس الافتراضية</span>
          </div>
          <h1 className="text-2xl font-black text-white">إدارة الدروس وروابط البث والمرفقات</h1>
          <p className="text-teal-100/80 text-sm mt-1">
            جدولة الدروس، إضافة روابط القاعات الافتراضية المباشرة (Zoom / Google Meet)، ورفع صور الدروس إلى Storage.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة درس جديد</span>
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

      {/* Filter and Course selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseFilterChange(e.target.value)}
            className="text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex-1"
          >
            <option value="all">كافة المسارات التعليمية</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الدروس..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <span>إظهار الدروس المحذوفة ناعماً</span>
        </label>
      </div>

      {/* Lessons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800">
            لا توجد دروس مسجلة تطابق شروط التصفية الحالية.
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border transition flex flex-col justify-between ${
                lesson.isDeleted
                  ? 'border-rose-300 dark:border-rose-900/40 bg-rose-50/20 opacity-75'
                  : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              <div>
                {/* Lesson Image Preview */}
                <div className="relative h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={lesson.imageUrl || '/assets/programs/quran_islamic.jpg'}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/programs/quran_islamic.jpg';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-700 text-white font-bold text-xs shadow">
                      الدرس #{lesson.lessonNumber}
                    </span>
                    {lesson.isDeleted && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold text-[10px]">
                        محذوف ناعماً
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-mono">
                      {lesson.durationMinutes} دقيقة
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 mb-1">
                    {lesson.courseTitle}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1.5">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {lesson.description || 'لا يوجد وصف تفصيلي للدرس.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 py-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.scheduledTime}</span>
                    </div>
                  </div>

                  {/* Online Lecture Link Preview */}
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono truncate max-w-[190px]">
                      <LinkIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{lesson.onlineLectureLink}</span>
                    </div>
                    <a
                      href={lesson.onlineLectureLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>فتح القاعة</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0">
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {lesson.isDeleted ? (
                    <button
                      onClick={() => handleRestoreLesson(lesson)}
                      title="استعادة الدرس"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(lesson)}
                        title="تعديل الدرس"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLessonToDelete(lesson)}
                        title="حذف ناعم (Soft Delete)"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Lesson Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="h-1.5 bg-teal-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingLesson ? 'تعديل بيانات الدرس ورابط المحاضرة' : 'إضافة درس جديد للمسار'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-4 text-right">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الدرس</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.lessonNumber}
                      onChange={(e) => setFormData({ ...formData, lessonNumber: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الدرس</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: سورة النبأ من 1 إلى 20 - أحكام المد المتصل"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">وصف وأهداف الدرس</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ملخص محتوى الجلسة والنقاط المستهدفة..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Online Lecture Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رابط المحاضرة المباشرة (Zoom / Google Meet)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={formData.onlineLectureLink}
                      onChange={(e) => setFormData({ ...formData, onlineLectureLink: e.target.value })}
                      placeholder="https://meet.google.com/xyz-quran-live"
                      dir="ltr"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right"
                    />
                  </div>
                </div>

                {/* Image Upload to Storage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    صورة الدرس أو الغلاف (رفع إلى Storage)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <Upload className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {isUploading ? 'جارٍ رفع الصورة...' : 'اختر صورة من جهازك لرفعها'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadedImagePreview && (
                      <div className="w-16 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                        <img
                          src={uploadedImagePreview}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الجلسة</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوقت</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المدة (دقيقة)</label>
                    <input
                      type="number"
                      min={15}
                      max={120}
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
                    {editingLesson ? 'حفظ التعديلات' : 'إضافة الدرس'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(lessonToDelete)}
        onClose={() => setLessonToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم للدرس"
        itemTypeLabel="درس"
        itemName={lessonToDelete?.title || ''}
      />
    </div>
  );
};
