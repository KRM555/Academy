import React, { useState, useEffect, useRef } from 'react';
import { UserAuth, Student, TeacherPayout } from '../types';
import { ProgramCourse } from '../../server';
import { Lock, Mail, Key, User, CreditCard, CheckCircle2, AlertCircle, X, Users, DollarSign, BookOpen, MessageCircle, LogOut, Plus, Edit2, Trash2, ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';

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
  isOpen = true,
  isFullPage = false,
  onClose,
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

  // Active Tab (Focused on practical management tools only)
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'payouts' | 'leads'>('courses');

  // Data States
  const [courses, setCourses] = useState<ProgramCourse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // Course Add/Edit Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState('');
  const [courseFormSubtitle, setCourseFormSubtitle] = useState('');
  const [courseFormAge, setCourseFormAge] = useState('5 - 12 سنة');
  const [courseFormPrice, setCourseFormPrice] = useState(250);
  const [courseFormDescription, setCourseFormDescription] = useState('');
  const [courseFormSessions, setCourseFormSessions] = useState(3);
  const [courseFormDuration, setCourseFormDuration] = useState(45);
  const [courseFormCategory, setCourseFormCategory] = useState<'quran' | 'arabic' | 'values' | 'tech' | 'mothers'>('quran');
  const [courseFormImage, setCourseFormImage] = useState<string>('');
  const [courseFeedback, setCourseFeedback] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update Student Modal/Form State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newSurahInput, setNewSurahInput] = useState('');
  const [teacherNotesInput, setTeacherNotesInput] = useState('');
  const [attendanceInput, setAttendanceInput] = useState<number>(95);
  const [updateFeedback, setUpdateFeedback] = useState('');

  // Update Visa / Payout Card State
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newIban, setNewIban] = useState('');
  const [cardUpdateSuccess, setCardUpdateSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
    if (currentUser) {
      fetchStudents();
      fetchPayouts();
      fetchLeads();
    }
  }, [currentUser]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (err) {
      console.error('Error fetching courses', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (err) {
      console.error('Error fetching students', err);
    }
  };

  const fetchPayouts = async () => {
    try {
      const url = currentUser?.role === 'teacher' ? `/api/payouts?email=${currentUser.email}` : '/api/payouts';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPayouts(data.payouts);
    } catch (err) {
      console.error('Error fetching payouts', err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    } catch (err) {
      console.error('Error fetching leads', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess({
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          token: data.token,
          permissions: data.user.permissions,
        });
      } else {
        setLoginError(data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setLoginError('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle local image file upload from user device
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCourseFeedback('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCourseFormImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Add Course Form
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseFormTitle('');
    setCourseFormSubtitle('');
    setCourseFormAge('5 - 12 سنة');
    setCourseFormPrice(260);
    setCourseFormDescription('');
    setCourseFormSessions(3);
    setCourseFormDuration(45);
    setCourseFormCategory('quran');
    setCourseFormImage('');
    setCourseFeedback('');
    setIsCourseModalOpen(true);
  };

  // Open Edit Course Form
  const handleOpenEditCourse = (course: ProgramCourse) => {
    setEditingCourseId(course.id);
    setCourseFormTitle(course.title);
    setCourseFormSubtitle(course.subtitle);
    setCourseFormAge(course.ageBracket);
    setCourseFormPrice(course.priceSar);
    setCourseFormDescription(course.description);
    setCourseFormSessions(course.weeklySessions);
    setCourseFormDuration(course.sessionDurationMins);
    setCourseFormCategory(course.category);
    setCourseFormImage(course.image || '');
    setCourseFeedback('');
    setIsCourseModalOpen(true);
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFeedback('');

    const payload = {
      title: courseFormTitle,
      subtitle: courseFormSubtitle,
      ageBracket: courseFormAge,
      priceSar: Number(courseFormPrice),
      description: courseFormDescription,
      weeklySessions: Number(courseFormSessions),
      sessionDurationMins: Number(courseFormDuration),
      category: courseFormCategory,
      image: courseFormImage || '/assets/aistudio/image_b7a2be8f.png',
      instructorName: 'معلم معتمد بأكاديمية نور وبيان',
    };

    try {
      if (editingCourseId) {
        const res = await fetch(`/api/courses/${editingCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setCourseFeedback('تم تحديث بيانات وصورة الحصة بنجاح!');
          fetchCourses();
          if (onCoursesUpdated) onCoursesUpdated();
          setTimeout(() => setIsCourseModalOpen(false), 1200);
        }
      } else {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setCourseFeedback('تمت إضافة الحصة بنجاح إلى منصة نور وبيان!');
          fetchCourses();
          if (onCoursesUpdated) onCoursesUpdated();
          setTimeout(() => setIsCourseModalOpen(false), 1200);
        }
      }
    } catch (err) {
      setCourseFeedback('حدث خطأ أثناء حفظ الحصة');
    }
  };

  // Delete Course with in-app confirmation (avoid window.confirm in iframe)
  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/courses/${courseToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteFeedback(`تم إلغاء وحذف الحصة (${courseToDelete.title}) بنجاح`);
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
        setTimeout(() => setDeleteFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setIsDeleting(false);
      setCourseToDelete(null);
    }
  };

  const handleSaveStudentProgress = async () => {
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/students/${editingStudent.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherNotes: teacherNotesInput,
          attendanceRate: attendanceInput,
          newSurah: newSurahInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdateFeedback('تم حفظ التعديلات بنجاح وتحديث ملف الطالب');
        fetchStudents();
        setTimeout(() => {
          setEditingStudent(null);
          setUpdateFeedback('');
          setNewSurahInput('');
        }, 1200);
      }
    } catch (err) {
      setUpdateFeedback('حدث خطأ أثناء الحفظ');
    }
  };

  const handleUpdatePayoutCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber) return;

    try {
      const res = await fetch('/api/payouts/update-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail: currentUser?.email,
          cardNumber: newCardNumber,
          bankName: newBankName,
          iban: newIban,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCardUpdateSuccess(data.message);
        setNewCardNumber('');
        setNewIban('');
        fetchPayouts();
        setTimeout(() => setCardUpdateSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen && !isFullPage) return null;

  const containerClasses = isFullPage
    ? 'min-h-screen bg-[#FAF9F6] dark:bg-[#070E18] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200'
    : 'fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto';

  const cardClasses = isFullPage
    ? 'max-w-5xl mx-auto bg-white dark:bg-[#111E2E] text-slate-800 dark:text-slate-100 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative'
    : 'bg-white dark:bg-[#111E2E] text-slate-800 dark:text-slate-100 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative';

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {/* Top Back / Close Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          {onNavigateHome ? (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0D9488] hover:text-[#0f766e] cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-slate-400">لوحة تحكم الأكاديمية</div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Not Logged In View */}
        {!currentUser ? (
          <div className="max-w-md mx-auto py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center mx-auto mb-3 shadow-md">
                <img src="/assets/aistudio/image_b7a2be8f.png" alt="شعار نور وبيان" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] font-display">
                بوابة الإدارة والمعلمين (أكاديمية نور وبيان)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                نظام إدارة فصول القرآن، إضافة وتعديل الحصص، ومتابعة الطلاب والمستحقات.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@academy.com أو teacher@academy.com"
                    required
                    className="w-full text-xs py-2.5 px-3 pr-9 border border-slate-300 rounded-xl focus:border-[#0D9488] outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full text-xs py-2.5 px-3 pr-9 border border-slate-300 rounded-xl focus:border-[#0D9488] outline-none"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Quick Demo Helper */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">بيانات سريعة للتجربة:</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@academy.com');
                      setPassword('admin123');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-800 cursor-pointer"
                  >
                    دخول كمدير نظام (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('teacher@academy.com');
                      setPassword('teacher123');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-800 cursor-pointer"
                  >
                    دخول كمعلم معتمد (Teacher)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard View */
          <div className="space-y-6">
            {/* User Profile Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#0F2942] text-white flex items-center justify-center font-bold text-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#0F2942] font-display">{currentUser.name}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      currentUser.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {currentUser.role === 'admin' ? 'مدير الأكاديمية' : 'معلم معتمد'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onLogout}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل خروج</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Strictly Practical) */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'courses' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>إدارة الحصص والكورسات ({courses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'students' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>الطلاب ومتابعة الحفظ ({students.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('payouts')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'payouts' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>المستحقات وبيانات الفيزا</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'leads' ? 'bg-[#0F2942] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>طلبات التسجيل ({leads.length})</span>
                </button>
              )}
            </div>

            {/* TAB 1: COURSES MANAGEMENT & CUSTOM IMAGE UPLOADING */}
            {activeTab === 'courses' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F2942]">إدارة وتعديل حصص الأكاديمية (أونلاين 100%)</h4>
                    <p className="text-xs text-slate-500">
                      يمكنك إضافة حصص جديدة، رفع صور مخصصة من جهازك، تعديل الأسعار، وإلغاء الحصص.
                    </p>
                  </div>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={handleOpenAddCourse}
                      className="px-4 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة حصة / كورس جديد</span>
                    </button>
                  )}
                </div>

                {deleteFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{deleteFeedback}</span>
                  </div>
                )}

                {/* Courses List */}
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={course.image || '/assets/aistudio/image_b7a2be8f.png'}
                          alt={course.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 bg-white"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-[#0F2942]">{course.title}</h5>
                            <span className="text-[11px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                              {course.ageBracket}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              أونلاين 100%
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">{course.subtitle}</p>
                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span className="font-bold text-[#0D9488] font-mono">{course.priceSar} ر.س / شهرياً</span>
                            <span aria-hidden="true">·</span>
                            <span>{course.weeklySessions} حصص أسبوعياً</span>
                          </div>
                        </div>
                      </div>

                      {currentUser.role === 'admin' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenEditCourse(course)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => setCourseToDelete({ id: course.id, title: course.title })}
                            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>إلغاء</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* In-App Deletion Confirmation Modal (Reliable in Iframe) */}
                {courseToDelete && (
                  <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
                      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                        <Trash2 className="w-7 h-7 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#0F2942]">تأكيد إلغاء وحذف الحصة</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          هل أنت متأكد من رغبتك في حذف الحصة <span className="font-bold text-rose-700">"{courseToDelete.title}"</span> نهائياً من منصة نور وبيان؟
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => setCourseToDelete(null)}
                          className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          تراجع
                        </button>
                        <button
                          type="button"
                          onClick={confirmDeleteCourse}
                          disabled={isDeleting}
                          className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isDeleting ? 'جاري الحذف...' : 'نعم، احذف الحصة'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Add / Edit Modal with Device File Upload */}
                {isCourseModalOpen && (
                  <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <h4 className="text-sm font-bold text-[#0F2942]">
                          {editingCourseId ? 'تعديل بيانات الحصة وصورتها' : 'إضافة حصة جديدة'}
                        </h4>
                        <button
                          onClick={() => setIsCourseModalOpen(false)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {courseFeedback && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{courseFeedback}</span>
                        </div>
                      )}

                      <form onSubmit={handleSaveCourse} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">اسم الحصة / الدورة:</label>
                          <input
                            type="text"
                            value={courseFormTitle}
                            onChange={(e) => setCourseFormTitle(e.target.value)}
                            placeholder="مثال: حلقات إتقان التجويد للصغار"
                            required
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:border-[#0D9488]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الفرعي (مختصر):</label>
                          <input
                            type="text"
                            value={courseFormSubtitle}
                            onChange={(e) => setCourseFormSubtitle(e.target.value)}
                            placeholder="مثال: حفظ وتلاوة مع تصحيح المخارج أونلاين"
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none focus:border-[#0D9488]"
                          />
                        </div>

                        {/* Custom Image Upload from Device */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            صورة الحصة (رفع صورة خاصة من جهازك):
                          </label>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageFileUpload}
                            accept="image/*"
                            className="hidden"
                          />

                          <div className="flex items-center gap-3">
                            {courseFormImage ? (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-slate-50 shrink-0">
                                <img
                                  src={courseFormImage}
                                  alt="معاينة صورة الحصة"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setCourseFormImage('')}
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                                  title="حذف الصورة"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{courseFormImage ? 'تغيير الصورة من جهازك' : 'اختر صورة من جهازك'}</span>
                              </button>
                              <div className="text-[11px] text-slate-500">
                                يمكنك رفع صورة من الكمبيوتر أو الهاتف (PNG أو JPG).
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">سعر الاشتراك (ر.س):</label>
                            <input
                              type="number"
                              min="50"
                              max="3000"
                              value={courseFormPrice}
                              onChange={(e) => setCourseFormPrice(Number(e.target.value))}
                              required
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">الفئة العمرية:</label>
                            <input
                              type="text"
                              value={courseFormAge}
                              onChange={(e) => setCourseFormAge(e.target.value)}
                              placeholder="مثال: 5 - 10 سنوات"
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف:</label>
                            <select
                              value={courseFormCategory}
                              onChange={(e: any) => setCourseFormCategory(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none"
                            >
                              <option value="quran">تحفيظ القرآن الكريم</option>
                              <option value="arabic">التأسيس اللغوي والقراءة السليمة</option>
                              <option value="values">غرس القيم وتعديل السلوك</option>
                              <option value="tech">البرمجة والذكاء الاصطناعي</option>
                              <option value="mothers">واحة الأمهات</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">عدد الحصص الأسبوعية:</label>
                            <input
                              type="number"
                              min="1"
                              max="7"
                              value={courseFormSessions}
                              onChange={(e) => setCourseFormSessions(Number(e.target.value))}
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">الوصف التفصيلي للحصة:</label>
                          <textarea
                            rows={3}
                            value={courseFormDescription}
                            onChange={(e) => setCourseFormDescription(e.target.value)}
                            placeholder="اكتب مخرجات الدورة وما سيتعلمه الطفل..."
                            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl outline-none"
                          />
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsCourseModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs"
                          >
                            {editingCourseId ? 'حفظ التعديلات' : 'إضافة الحصة الآن'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STUDENTS */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  قائمة طلاب الأكاديمية المسجلين بالحلقات الأونلاين. يمكنك تحديث السور المتقنة وملاحظات المعلم اليومية.
                </div>

                <div className="space-y-3">
                  {students.map((std) => (
                    <div
                      key={std.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0F2942]">{std.childName}</span>
                          <span className="text-[11px] text-slate-500">({std.age} سنوات · {std.country})</span>
                        </div>
                        <div className="text-xs text-[#0D9488] font-medium">{std.program}</div>
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">المستوى:</span> {std.level}
                        </div>
                        <div className="text-xs text-slate-500 italic">
                          <span className="font-semibold not-italic">الملاحظة الأخيرة:</span> "{std.teacherNotes}"
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-left font-mono">
                          <div className="text-xs font-bold text-emerald-700">{std.attendanceRate}% حضور</div>
                          <div className="text-[11px] text-slate-500">{std.memorizedSurahs.length} سور محفوظة</div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingStudent(std);
                            setTeacherNotesInput(std.teacherNotes);
                            setAttendanceInput(std.attendanceRate);
                          }}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl transition-colors cursor-pointer"
                        >
                          تحديث التقييم
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Student Progress Inline Modal */}
                {editingStudent && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#0F2942]">
                        تحديث سجل الطالب: <span className="text-[#0D9488]">{editingStudent.childName}</span>
                      </div>
                      <button
                        onClick={() => setEditingStudent(null)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          إضافة سورة أتقن حفظها اليوم:
                        </label>
                        <input
                          type="text"
                          value={newSurahInput}
                          onChange={(e) => setNewSurahInput(e.target.value)}
                          placeholder="مثال: سورة الغاشية"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#0D9488]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          نسبة الالتزام والحضور (%):
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={attendanceInput}
                          onChange={(e) => setAttendanceInput(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ملاحظة المعلم الأكاديمية والتربوية لولي الأمر:
                      </label>
                      <textarea
                        rows={2}
                        value={teacherNotesInput}
                        onChange={(e) => setTeacherNotesInput(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>

                    {updateFeedback && (
                      <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{updateFeedback}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSaveStudentProgress}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-xs"
                      >
                        حفظ في ملف الطالب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PAYOUTS & CARD MANAGEMENT */}
            {activeTab === 'payouts' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[#0F2942]">
                    المستحقات المالية وطرق استلام أرباح المعلمين (أكاديمية نور وبيان)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    بيانات البطاقات تُقنع وتُشفر تلقائياً لحماية الخصوصية (`**** **** **** 1234`).
                  </p>
                </div>

                <div className="space-y-3">
                  {payouts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800">{p.teacherName} · {p.month}</div>
                        <div className="text-xs text-slate-600 flex items-center gap-3">
                          <span>{p.hoursCompleted} ساعة تدريس أونلاين</span>
                          <span aria-hidden="true">·</span>
                          <span>المعدل: {p.hourlyRateSar} ر.س / ساعة</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>البطاقة المقنعة: {p.maskedCardNumber}</span>
                          <span>({p.bankName})</span>
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="text-base font-extrabold text-[#0F2942] font-mono tabular-nums">
                          {p.totalEarningsSar.toLocaleString('ar-SA')} ر.س
                        </div>
                        <div className={`text-[11px] font-bold ${
                          p.payoutStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {p.payoutStatus === 'paid' ? '✓ تم التحويل للحساب' : '⏳ جاري الصرف'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to update teacher payout card / bank */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#0D9488]" />
                    <span>تحديث وسيلة استلام المستحقات (فيزا / حساب بنكي):</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 mb-4">
                    ملاحظة: لا يتم حفظ رمز الأمان (CVV)، ويتم تشفير رقم البطاقة برمز مقنع لحمايتك.
                  </p>

                  {cardUpdateSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{cardUpdateSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePayoutCard} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          رقم بطاقة الفيزا أو مدى (آخر 4 أرقام):
                        </label>
                        <input
                          type="text"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          placeholder="مثال: 4111 2222 3333 5824"
                          required
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          اسم البنك:
                        </label>
                        <input
                          type="text"
                          value={newBankName}
                          onChange={(e) => setNewBankName(e.target.value)}
                          placeholder="مثال: مصرف الراجحي / البنك الأهلي"
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        رقم الآيبان (IBAN):
                      </label>
                      <input
                        type="text"
                        value={newIban}
                        onChange={(e) => setNewIban(e.target.value)}
                        placeholder="مثال: SA4480000000000000000000"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#0F2942] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>حفظ وسيلة الصرف</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: LEADS */}
            {activeTab === 'leads' && currentUser.role === 'admin' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  طلبات التسجيل والحصص التجريبية المجانية الواردة حديثاً من أولياء الأمور:
                </div>

                {leads.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    لا توجد طلبات جديدة حالياً.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{lead.childName}</span>
                            <span className="text-xs text-slate-500">({lead.childAge} سنوات)</span>
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                              {lead.country}
                            </span>
                          </div>
                          <div className="text-xs text-[#0D9488] font-medium mt-1">
                            البرنامج المطلوب: {lead.selectedProgram}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            ولي الأمر: {lead.parentName || 'غير محدد'} · الهاتف: <span className="font-mono">{lead.parentPhone}</span>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/${lead.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `أهلاً بك أستاذ(ة)، تواصلك بخصوص تسجيل طفلك (${lead.childName}) في أكاديمية نور وبيان.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-700" />
                          <span>واتساب فوري</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
