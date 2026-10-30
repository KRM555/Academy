import React, { useState, useEffect } from 'react';
import type { UserAuth, Student, TeacherPayout, ProgramCourse, RegisteredLead } from '../types';
import { CANONICAL_SURAHS } from '../types';
import { api, ApiError } from '../services/api';
import {
  Lock,
  Mail,
  Key,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  DollarSign,
  BookOpen,
  MessageCircle,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AdminTeacherPortalProps {
  isOpen?: boolean;
  isFullPage?: boolean;
  onClose?: () => void;
  onNavigateHome?: () => void;
  currentUser: UserAuth | null;
  onLoginSuccess: (user: UserAuth) => void;
  onLogout: () => void;
  onCoursesUpdated?: () => void;
}

export const AdminTeacherPortal: React.FC<AdminTeacherPortalProps> = ({
  isFullPage = false,
  onNavigateHome,
  currentUser,
  onLoginSuccess,
  onLogout,
  onCoursesUpdated,
}) => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'payouts' | 'leads'>('courses');

  // Data States
  const [courses, setCourses] = useState<ProgramCourse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [leads, setLeads] = useState<RegisteredLead[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Course Add/Edit Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState('');
  const [courseFormSubtitle, setCourseFormSubtitle] = useState('');
  const [courseFormAgeBracket, setCourseFormAgeBracket] = useState('5 - 12 سنة');
  const [courseFormMinAge, setCourseFormMinAge] = useState(5);
  const [courseFormMaxAge, setCourseFormMaxAge] = useState(12);
  const [courseFormPrice, setCourseFormPrice] = useState(260);
  const [courseFormBillingUnit, setCourseFormBillingUnit] = useState('شهرياً');
  const [courseFormDescription, setCourseFormDescription] = useState('');
  const [courseFormSessions, setCourseFormSessions] = useState(3);
  const [courseFormDuration, setCourseFormDuration] = useState(45);
  const [courseFormCategory, setCourseFormCategory] = useState<'quran' | 'arabic' | 'values' | 'tech' | 'mothers'>('quran');
  const [courseFormImage, setCourseFormImage] = useState('/images/hero_learning.jpg');
  const [courseFormFeatures, setCourseFormFeatures] = useState('حلقات تفاعلية حية\nمتابعة أسبوعية');
  const [courseFeedback, setCourseFeedback] = useState('');

  // Delete Course Confirmation Modal
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Student Progress Update State
  const [selectedStudentForNotes, setSelectedStudentForNotes] = useState<Student | null>(null);
  const [newSurahToAdd, setNewSurahToAdd] = useState('');
  const [studentNoteInput, setStudentNoteInput] = useState('');
  const [progressFeedback, setProgressFeedback] = useState('');

  // Teacher Bank Account (IBAN) Update State
  const [bankNameInput, setBankNameInput] = useState('');
  const [accountHolderInput, setAccountHolderInput] = useState('');
  const [ibanInput, setIbanInput] = useState('');
  const [bankUpdateFeedback, setBankUpdateFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Fetch data on session change or active tab change
  useEffect(() => {
    if (!currentUser) return;
    loadTabData();
  }, [currentUser, activeTab]);

  const loadTabData = async () => {
    setLoadingData(true);
    setGeneralError('');
    try {
      if (activeTab === 'courses') {
        const res = await api.courses.list();
        setCourses(res.courses);
      } else if (activeTab === 'students') {
        const res = await api.students.list();
        setStudents(res.students);
      } else if (activeTab === 'payouts') {
        const res = await api.payouts.list();
        setPayouts(res.payouts);
      } else if (activeTab === 'leads' && currentUser?.role === 'admin') {
        const res = await api.leads.list();
        setLeads(res.leads);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await api.auth.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Continue client logout
    }
    onLogout();
  };

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseFormTitle('');
    setCourseFormSubtitle('');
    setCourseFormAgeBracket('5 - 12 سنة');
    setCourseFormMinAge(5);
    setCourseFormMaxAge(12);
    setCourseFormPrice(260);
    setCourseFormBillingUnit('شهرياً');
    setCourseFormDescription('');
    setCourseFormSessions(3);
    setCourseFormDuration(45);
    setCourseFormCategory('quran');
    setCourseFormImage('/images/hero_learning.jpg');
    setCourseFormFeatures('حلقات تفاعلية حية\nمتابعة أسبوعية');
    setCourseFeedback('');
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: ProgramCourse) => {
    setEditingCourseId(course.id);
    setCourseFormTitle(course.title);
    setCourseFormSubtitle(course.subtitle);
    setCourseFormAgeBracket(course.ageBracket);
    setCourseFormMinAge(course.minAge);
    setCourseFormMaxAge(course.maxAge);
    setCourseFormPrice(course.priceSar);
    setCourseFormBillingUnit(course.billingUnit || 'شهرياً');
    setCourseFormDescription(course.description);
    setCourseFormSessions(course.weeklySessions);
    setCourseFormDuration(course.sessionDurationMins);
    setCourseFormCategory(course.category);
    setCourseFormImage(course.image);
    setCourseFormFeatures((course.features || []).join('\n'));
    setCourseFeedback('');
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFeedback('');

    const featuresList = courseFormFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      title: courseFormTitle.trim(),
      subtitle: courseFormSubtitle.trim(),
      ageBracket: courseFormAgeBracket.trim(),
      minAge: Number(courseFormMinAge),
      maxAge: Number(courseFormMaxAge),
      category: courseFormCategory,
      deliveryMode: 'online' as const,
      image: courseFormImage.trim() || '/images/hero_learning.jpg',
      description: courseFormDescription.trim(),
      weeklySessions: Number(courseFormSessions),
      sessionDurationMins: Number(courseFormDuration),
      priceSar: Number(courseFormPrice),
      billingUnit: courseFormBillingUnit.trim() || 'شهرياً',
      installmentsEligible: true,
      features: featuresList,
    };

    try {
      if (editingCourseId) {
        await api.courses.update(editingCourseId, payload);
      } else {
        await api.courses.create(payload);
      }
      setIsCourseModalOpen(false);
      await loadTabData();
      onCoursesUpdated?.();
    } catch (err: any) {
      setCourseFeedback(err.message || 'فشل حفظ البرنامج. يرجى مراجعة البيانات.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await api.courses.delete(courseToDelete.id);
      setCourseToDelete(null);
      await loadTabData();
      onCoursesUpdated?.();
    } catch (err: any) {
      alert(err.message || 'فشل حذف البرنامج.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveStudentProgress = async () => {
    if (!selectedStudentForNotes) return;
    setProgressFeedback('');
    try {
      const res = await api.students.updateProgress(
        selectedStudentForNotes.id,
        newSurahToAdd ? newSurahToAdd.trim() : undefined,
        studentNoteInput.trim()
      );
      setProgressFeedback('تم تحديث إنجاز الطالب بنجاح.');
      setNewSurahToAdd('');
      setSelectedStudentForNotes(res.student);
      await loadTabData();
    } catch (err: any) {
      setProgressFeedback(err.message || 'فشل تحديث الإنجاز.');
    }
  };

  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankUpdateFeedback(null);
    try {
      const res = await api.payouts.updateBankDetails(
        bankNameInput.trim(),
        accountHolderInput.trim(),
        ibanInput.trim()
      );
      setBankUpdateFeedback({ text: res.message || 'تم تحديث وتشفير الحساب البنكي بنجاح.', isError: false });
      setIbanInput('');
      await loadTabData();
    } catch (err: any) {
      setBankUpdateFeedback({ text: err.message || 'فشل تحديث الآيبان البنكي.', isError: true });
    }
  };

  // -------------------------------------------------------------
  // View 1: Unauthenticated Login Form
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className={`${isFullPage ? 'min-h-[80vh]' : 'py-12'} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-[#0F2942] dark:text-white">بوابة المعلمين والإدارة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              منصة محصنة ومسجلة لمتابعة فصول الأكاديمية والطلاب
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                البريد الإلكتروني المعتمد:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@noor-bayan.com"
                  required
                  autoComplete="email"
                  className="w-full text-xs py-2.5 px-3 pr-9 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-[#0D9488] outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full text-xs py-2.5 px-3 pr-9 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:border-[#0D9488] outline-none transition-colors"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول الآمن'}
            </button>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 mt-2 cursor-pointer"
              >
                العودة للصفحة الرئيسية
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // View 2: Authenticated Dashboard (Admin & Teacher Tabs)
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {currentUser.role === 'admin' ? 'مدير المنصة (Admin)' : 'معلم معتمد (Teacher)'}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              الموقع العام
            </button>
          )}
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>دليل البرامج والمناهج</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>متابعة إنجاز الطلاب</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>المستحقات البنكية والحسابات</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>طلبات الحجز والتسجيل</span>
          </button>
        )}
      </div>

      {generalError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-800 dark:text-red-300">
          {generalError}
        </div>
      )}

      {loadingData ? (
        <div className="text-center py-12 text-xs text-slate-500">جاري تحميل البيانات...</div>
      ) : (
        <>
          {/* TAB 1: COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F2942] dark:text-white">
                  قائمة البرامج الأكاديمية ({courses.length})
                </h3>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={handleOpenAddCourse}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مسار جديد</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-5 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {course.ageBracket}
                        </span>
                        <span className="text-xs font-extrabold text-[#0D9488] dark:text-emerald-400">
                          {course.priceSar} ر.س / {course.billingUnit || 'شهرياً'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F2942] dark:text-white">{course.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{course.description}</p>
                    </div>

                    {currentUser.role === 'admin' && (
                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditCourse(course)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="تعديل البرنامج"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCourseToDelete({ id: course.id, title: course.title })}
                          className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="حذف البرنامج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white">
                قائمة متابعة الطلاب ({students.length})
              </h3>
              <div className="bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">اسم الطالب</th>
                        <th className="py-3 px-4">العمر</th>
                        <th className="py-3 px-4">المسار</th>
                        <th className="py-3 px-4">السور المحفوظة</th>
                        <th className="py-3 px-4">الملاحظات</th>
                        <th className="py-3 px-4 text-center">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-[#0F2942] dark:text-white">{st.childName}</td>
                          <td className="py-3 px-4">{st.age} سنوات</td>
                          <td className="py-3 px-4">{st.program}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                              {st.memorizedSurahs.length} سورة
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {st.teacherNotes || '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedStudentForNotes(st);
                                setStudentNoteInput(st.teacherNotes || '');
                                setNewSurahToAdd('');
                                setProgressFeedback('');
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              تحديث السجل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYOUTS (IBAN Only, No Cards) */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#0F2942] dark:text-white">
                  كشف المستحقات المالية وطرق التحويل البنكي
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  تُودع مستحقات المعلمين عبر التحويل البنكي المباشر (IBAN). يتم تشفير وحماية بيانات الحساب البنكي.
                </p>
              </div>

              {/* Payouts List */}
              <div className="space-y-3">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.teacherName} · {p.month}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                        <span>{p.hoursCompleted} ساعة تدريس</span>
                        <span>·</span>
                        <span>المعدل: {p.hourlyRateSar} ر.س / ساعة</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-mono">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>البنك: {p.bankName || 'لم يُحدد بعد'}</span>
                        {p.ibanMasked && <span className="font-bold">({p.ibanMasked})</span>}
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="text-base font-extrabold text-[#0F2942] dark:text-white font-mono tabular-nums">
                        {p.totalEarningsSar.toLocaleString('ar-SA')} ر.س
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          p.payoutStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {p.payoutStatus === 'paid' ? 'تم التحويل' : 'قيد المعالجة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form to Update IBAN (Protected at rest) */}
              <div className="p-5 bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0D9488]" />
                  <span>تحديث الحساب البنكي لاستلام المستحقات (IBAN):</span>
                </h4>

                {bankUpdateFeedback && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      bankUpdateFeedback.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {bankUpdateFeedback.isError ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    )}
                    <span>{bankUpdateFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateBankDetails} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم البنك:
                      </label>
                      <input
                        type="text"
                        value={bankNameInput}
                        onChange={(e) => setBankNameInput(e.target.value)}
                        placeholder="مثال: مصرف الراجحي / البنك الأهلي"
                        required
                        className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم صاحب الحساب:
                      </label>
                      <input
                        type="text"
                        value={accountHolderInput}
                        onChange={(e) => setAccountHolderInput(e.target.value)}
                        placeholder="الاسم المطابق لبطاقة الحساب"
                        required
                        className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم الآيبان الدولي (IBAN):
                      </label>
                      <input
                        type="text"
                        value={ibanInput}
                        onChange={(e) => setIbanInput(e.target.value)}
                        placeholder="SA0000000000000000000000"
                        required
                        className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    حفظ وتشفير الآيبان البنكي
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: LEADS (Admin Only) */}
          {activeTab === 'leads' && currentUser.role === 'admin' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0F2942] dark:text-white">
                طلبات التسجيل والحجز الواردة ({leads.length})
              </h3>
              <div className="bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">الطفل</th>
                        <th className="py-3 px-4">ولي الأمر</th>
                        <th className="py-3 px-4">الهاتف</th>
                        <th className="py-3 px-4">الدولة</th>
                        <th className="py-3 px-4">المسار المطلوب</th>
                        <th className="py-3 px-4">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold">{lead.childName} ({lead.childAge} سنوات)</td>
                          <td className="py-3 px-4">{lead.parentName}</td>
                          <td className="py-3 px-4 font-mono">{lead.parentPhone}</td>
                          <td className="py-3 px-4">{lead.country}</td>
                          <td className="py-3 px-4">{lead.programTitle}</td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(lead.createdAt).toLocaleDateString('ar-SA')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Add/Edit Course */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-[#0F2942] dark:text-white">
                {editingCourseId ? 'تعديل مسار تعليمي' : 'إضافة مسار تعليمي جديد'}
              </h4>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {courseFeedback && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
                {courseFeedback}
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">عنوان المسار:</label>
                <input
                  type="text"
                  value={courseFormTitle}
                  onChange={(e) => setCourseFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">العنوان الفرعي:</label>
                <input
                  type="text"
                  value={courseFormSubtitle}
                  onChange={(e) => setCourseFormSubtitle(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">الفئة المستهدفة:</label>
                  <input
                    type="text"
                    value={courseFormAgeBracket}
                    onChange={(e) => setCourseFormAgeBracket(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">السعر بالريال (SAR):</label>
                  <input
                    type="number"
                    value={courseFormPrice}
                    onChange={(e) => setCourseFormPrice(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">الوصف:</label>
                <textarea
                  value={courseFormDescription}
                  onChange={(e) => setCourseFormDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold rounded-xl"
                >
                  حفظ المسار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Student Progress */}
      {selectedStudentForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-[#0F2942] dark:text-white">
                تحديث إنجاز الطالب: {selectedStudentForNotes.childName}
              </h4>
              <button
                onClick={() => setSelectedStudentForNotes(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {progressFeedback && (
              <div className="mb-3 p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200">
                {progressFeedback}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">إضافة سورة أتم الطالب حفظها:</label>
                <select
                  value={newSurahToAdd}
                  onChange={(e) => setNewSurahToAdd(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                >
                  <option value="">-- اختر السورة من القائمة المعتمدة --</option>
                  {CANONICAL_SURAHS.map((surah) => (
                    <option key={surah} value={surah}>
                      سورة {surah}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">ملاحظات المعلم وتوجيهاته:</label>
                <textarea
                  value={studentNoteInput}
                  onChange={(e) => setStudentNoteInput(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none"
                  placeholder="ملاحظات حول مخارج الحروف، التجويد، والحضور..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForNotes(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudentProgress}
                  className="px-5 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold rounded-xl"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111E2E] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">تأكيد حذف البرنامج</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              هل أنت متأكد من حذف &quot;{courseToDelete.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
