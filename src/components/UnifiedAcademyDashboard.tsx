import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  Calendar,
  Video,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  LogOut,
  Shield,
  ShieldCheck,
  User,
  Sliders,
  DollarSign,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronDown,
  Menu,
  X,
  Lock,
  Mail,
  Copy,
  Check,
  HelpCircle,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import {
  supabaseService,
  SupabaseStudent,
  SupabaseTeacher,
  SupabaseSubscription,
  SupabaseLesson,
  DashboardStats,
  SupabaseLead,
} from '../services/supabaseClient';
import type { UserAuth, TeacherPermissionConfig } from '../types';
import { api } from '../services/api';

interface UnifiedAcademyDashboardProps {
  onBackToMain?: () => void;
  currentUser?: UserAuth | null;
  onLoginSuccess?: (user: UserAuth) => void;
  onLogout?: () => void;
}

export const UnifiedAcademyDashboard: React.FC<UnifiedAcademyDashboardProps> = ({
  onBackToMain,
  currentUser: initialUser,
  onLoginSuccess,
  onLogout,
}) => {
  // Session & Authentication State (Strictly Server-Authoritative)
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(initialUser || null);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(!initialUser);

  // Server Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Active Tab: Overview, Students, Teachers (Admin), Lessons, Subscriptions, Leads
  const [activeTab, setActiveTab] = useState<
    'overview' | 'students' | 'teachers' | 'lessons' | 'subscriptions' | 'leads'
  >('overview');

  // Mobile sidebar open/close
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Search / Command Bar
  const [searchQuery, setSearchQuery] = useState('');

  // Live Data States
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalLessons: 0,
  });
  const [students, setStudents] = useState<SupabaseStudent[]>([]);
  const [teachers, setTeachers] = useState<SupabaseTeacher[]>([]);
  const [subscriptions, setSubscriptions] = useState<SupabaseSubscription[]>([]);
  const [lessons, setLessons] = useState<SupabaseLesson[]>([]);
  const [leads, setLeads] = useState<SupabaseLead[]>([]);
  const [teacherPermissions, setTeacherPermissions] = useState<TeacherPermissionConfig[]>([]);

  // Modals for CRUD
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedTeacherForPerms, setSelectedTeacherForPerms] = useState<TeacherPermissionConfig | null>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states for Student
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState<number>(7);
  const [studentParentName, setStudentParentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentTeacherId, setStudentTeacherId] = useState<string>('');
  const [studentStatus, setStudentStatus] = useState<'active' | 'trial' | 'inactive'>('active');
  const [studentMeetingLink, setStudentMeetingLink] = useState('');
  const [studentFormError, setStudentFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Form states for Teacher
  const [teacherName, setTeacherName] = useState('');
  const [teacherSpecialty, setTeacherSpecialty] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');

  // Form states for Lesson
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonCategory, setLessonCategory] = useState('قرآن وتجويد');
  const [lessonFileUrl, setLessonFileUrl] = useState('');
  const [lessonMeetingLink, setLessonMeetingLink] = useState('');
  const [lessonTeacherId, setLessonTeacherId] = useState('');

  // Form states for Subscription
  const [subStudentId, setSubStudentId] = useState('');
  const [subPlanName, setSubPlanName] = useState('باقة التميز القرآني (3 حصص أسبوعياً)');
  const [subAmount, setSubAmount] = useState<number>(320);
  const [subCurrency, setSubCurrency] = useState('SAR');
  const [subStartDate, setSubStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [subEndDate, setSubEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [subStatus, setSubStatus] = useState<'active' | 'pending' | 'expired'>('active');

  // Quick edit meeting link modal
  const [editingMeetingEntity, setEditingMeetingEntity] = useState<{
    id: string;
    type: 'student' | 'lesson';
    currentLink: string;
    title: string;
  } | null>(null);
  const [newMeetingLinkInput, setNewMeetingLinkInput] = useState('');

  // Load all live data from Supabase
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [fetchedStats, fetchedStudents, fetchedTeachers, fetchedSubs, fetchedLessons, fetchedLeads] =
        await Promise.all([
          supabaseService.getOverviewStats(),
          supabaseService.getStudents(),
          supabaseService.getTeachers(),
          supabaseService.getSubscriptions(),
          supabaseService.getLessons(),
          supabaseService.getLeads(),
        ]);

      setStats(fetchedStats);
      setStudents(fetchedStudents);
      setTeachers(fetchedTeachers);
      setSubscriptions(fetchedSubs);
      setLessons(fetchedLessons);
      setLeads(fetchedLeads);
      setTeacherPermissions(supabaseService.getTeacherPermissions());
    } catch (err: any) {
      console.warn('Dashboard data fetch error:', err);
      showFeedback('تعذر الاتصال المباشر بقاعدة البيانات، جاري استخدام الذاكرة المحلية.', true);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Verify server session on boot & load live Supabase data
  useEffect(() => {
    let active = true;
    if (initialUser) {
      setCurrentUser(initialUser);
      setIsVerifyingSession(false);
      loadData();
      return;
    }

    api.auth
      .getMe()
      .then((res) => {
        if (!active) return;
        if (res.user) {
          setCurrentUser(res.user);
          loadData();
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setCurrentUser(null);
      })
      .finally(() => {
        if (active) setIsVerifyingSession(false);
      });

    return () => {
      active = false;
    };
  }, [initialUser]);

  const showFeedback = (text: string, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Determine permissions for current user
  const isAdmin = currentUser?.role === 'admin';
  const currentTeacherConfig = useMemo<TeacherPermissionConfig | null>(() => {
    if (isAdmin || !currentUser) return null;
    return (
      teacherPermissions.find(
        (p) =>
          p.teacherEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          p.teacherId === currentUser.id
      ) || {
        teacherId: currentUser.id,
        teacherEmail: currentUser.email,
        teacherName: currentUser.name,
        canViewAllStudents: false,
        canEditStudentProgress: true,
        canManageMeetingLinks: true,
        canAddLessons: false,
        canViewFinancials: true,
      }
    );
  }, [currentUser, teacherPermissions, isAdmin]);

  // Filter students based on teacher permissions
  const accessibleStudents = useMemo(() => {
    if (isAdmin) return students;
    if (currentTeacherConfig?.canViewAllStudents) return students;
    // Otherwise only assigned students
    const teacherId = teachers.find(
      (t) => t.email?.toLowerCase() === currentUser?.email.toLowerCase()
    )?.id;
    if (!teacherId) return students.filter((s) => s.status === 'trial');
    return students.filter((s) => s.teacher_id === teacherId);
  }, [students, isAdmin, currentTeacherConfig, teachers, currentUser]);

  // Filter items based on global search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return accessibleStudents;
    const q = searchQuery.toLowerCase();
    return accessibleStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.parent_name.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  }, [accessibleStudents, searchQuery]);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.phone.includes(q)
    );
  }, [teachers, searchQuery]);

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const q = searchQuery.toLowerCase();
    return lessons.filter(
      (l) => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
    );
  }, [lessons, searchQuery]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.child_name.toLowerCase().includes(q) ||
        l.parent_name.toLowerCase().includes(q) ||
        l.parent_phone.includes(q)
    );
  }, [leads, searchQuery]);

  // Server-Authoritative Login Handler
  const handleServerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setSubmittingLogin(true);
    try {
      const res = await api.auth.login(loginEmail.trim(), loginPassword);
      if (res.user) {
        setCurrentUser(res.user);
        onLoginSuccess?.(res.user);
        showFeedback(`تم تسجيل الدخول بنجاح: ${res.user.name}`);
        loadData();
      } else {
        setLoginError(res.message || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'بيانات الدخول غير صحيحة.');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setCurrentUser(null);
    onLogout?.();
  };

  // Add Student Handler (Matching exact 7-field schema)
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError(null);
    if (!studentName.trim() || !studentParentName.trim() || !studentPhone.trim()) {
      setStudentFormError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    setSubmittingForm(true);
    try {
      const cleanAge = Number(studentAge) || 7;
      const cleanTeacherId =
        studentTeacherId && studentTeacherId.trim() !== '' ? studentTeacherId.trim() : null;

      const payload = {
        name: studentName.trim(),
        age: cleanAge,
        parent_name: studentParentName.trim(),
        phone: studentPhone.trim(),
        teacher_id: cleanTeacherId,
        status: studentStatus,
        meeting_link: studentMeetingLink.trim() || null,
      };

      await supabaseService.addStudent(payload);
      setIsStudentModalOpen(false);
      setStudentName('');
      setStudentParentName('');
      setStudentPhone('');
      setStudentMeetingLink('');
      setStudentTeacherId('');
      showFeedback('تم حفظ الطالب في جدول students بنجاح!');
      await loadData(true);
    } catch (err: any) {
      console.error('Student add error:', err);
      setStudentFormError(err.message || 'فشل حفظ الطالب في Supabase.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Add Teacher Handler
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherSpecialty || !teacherPhone) return;
    setSubmittingForm(true);
    try {
      const created = await supabaseService.addTeacher({
        name: teacherName.trim(),
        specialty: teacherSpecialty.trim(),
        phone: teacherPhone.trim(),
        email: teacherEmail.trim() || null,
      });

      // Default permissions for newly created teacher
      supabaseService.saveTeacherPermission({
        teacherId: created.id,
        teacherEmail: teacherEmail.trim() || `${created.id}@noor-bayan.com`,
        teacherName: teacherName.trim(),
        canViewAllStudents: false,
        canEditStudentProgress: true,
        canManageMeetingLinks: true,
        canAddLessons: false,
        canViewFinancials: true,
      });

      setIsTeacherModalOpen(false);
      setTeacherName('');
      setTeacherSpecialty('');
      setTeacherPhone('');
      setTeacherEmail('');
      showFeedback('تم حفظ المعلم في جدول teachers بنجاح!');
      await loadData(true);
    } catch (err: any) {
      showFeedback(err.message || 'فشل حفظ المعلم.', true);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Add Lesson Handler
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !lessonCategory) return;
    setSubmittingForm(true);
    try {
      await supabaseService.addLesson({
        title: lessonTitle.trim(),
        description: lessonDesc.trim(),
        category: lessonCategory,
        file_url: lessonFileUrl.trim() || 'https://drive.google.com',
        meeting_link: lessonMeetingLink.trim() || null,
        teacher_id: lessonTeacherId || null,
      });

      setIsLessonModalOpen(false);
      setLessonTitle('');
      setLessonDesc('');
      setLessonMeetingLink('');
      showFeedback('تم حفظ الدرس في جدول lessons بنجاح!');
      await loadData(true);
    } catch (err: any) {
      showFeedback(err.message || 'فشل حفظ الدرس.', true);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Add Subscription Handler
  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subStudentId || !subPlanName) return;
    setSubmittingForm(true);
    try {
      await supabaseService.addSubscription({
        student_id: subStudentId,
        plan_name: subPlanName,
        amount: Number(subAmount) || 0,
        currency: subCurrency,
        status: subStatus,
        start_date: subStartDate,
        end_date: subEndDate,
      });

      setIsSubModalOpen(false);
      showFeedback('تم حفظ الاشتراك في جدول subscriptions بنجاح!');
      await loadData(true);
    } catch (err: any) {
      showFeedback(err.message || 'فشل حفظ الاشتراك.', true);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Update Meeting Link
  const handleSaveMeetingLink = async () => {
    if (!editingMeetingEntity) return;
    setSubmittingForm(true);
    try {
      if (editingMeetingEntity.type === 'student') {
        await supabaseService.updateStudentMeetingLink(
          editingMeetingEntity.id,
          newMeetingLinkInput.trim()
        );
      } else {
        await supabaseService.updateLessonMeetingLink(
          editingMeetingEntity.id,
          newMeetingLinkInput.trim()
        );
      }
      setEditingMeetingEntity(null);
      showFeedback('تم تحديث رابط المحاضرة المباشرة بنجاح!');
      await loadData(true);
    } catch (err: any) {
      showFeedback(err.message || 'فشل تحديث الرابط.', true);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Save Teacher Permissions (Admin Only)
  const handleSaveTeacherPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForPerms) return;
    supabaseService.saveTeacherPermission(selectedTeacherForPerms);
    setTeacherPermissions(supabaseService.getTeacherPermissions());
    setIsPermissionsModalOpen(false);
    showFeedback(`تم تحديث صلاحيات المعلم (${selectedTeacherForPerms.teacherName}) بنجاح!`);
  };

  // Delete Entity Handler
  const handleDeleteItem = async (type: 'student' | 'teacher' | 'lesson' | 'sub', id: string, name: string) => {
    if (!isAdmin) {
      showFeedback('عذراً، هذا الإجراء متاح فقط لمدير المنصة.', true);
      return;
    }
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف: "${name}" من قاعدة البيانات؟`)) return;

    try {
      if (type === 'student') await supabaseService.deleteStudent(id);
      if (type === 'teacher') await supabaseService.deleteTeacher(id);
      if (type === 'lesson') await supabaseService.deleteLesson(id);
      if (type === 'sub') await supabaseService.deleteSubscription(id);

      showFeedback(`تم حذف "${name}" بنجاح من قاعدة البيانات.`);
      await loadData(true);
    } catch (err: any) {
      showFeedback(err.message || 'تعذر إتمام عملية الحذف.', true);
    }
  };

  // If verifying session on initial mount, show sleek loading spinner
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#070D0B] text-slate-100 flex flex-col items-center justify-center font-['Tajawal',sans-serif] p-4" dir="rtl">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-xs sm:text-sm font-bold text-slate-300">جاري التحقق من جلسة الدخول المعتمدة...</p>
      </div>
    );
  }

  // If there is no valid server session, show the login page instead of any dashboard
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070D0B] text-slate-100 flex flex-col justify-center items-center p-4 font-['Tajawal',sans-serif] selection:bg-emerald-500/30" dir="rtl">
        <div className="w-full max-w-md bg-[#0D1815] border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">لوحة الإدارة والمعلمين الموحدة</h1>
            <p className="text-xs text-slate-400">
              يرجى تسجيل الدخول بحسابك المعتمد للوصول إلى لوحة التحكم
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleServerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@noor-bayan.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm pl-9"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm pl-9"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submittingLogin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {onBackToMain && (
            <div className="pt-2 border-t border-white/[0.06] text-center">
              <button
                onClick={onBackToMain}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة إلى الصفحة الرئيسية</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D0B] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background radial glow matching Verdelo smoked glass mint glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-[-150px] w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-100px] right-10 w-[550px] h-[550px] bg-emerald-600/8 rounded-full blur-[140px]" />
      </div>

      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-[#0C1412]/80 backdrop-blur-xl border-b border-emerald-950/70 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-950/50"
            aria-label="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  أكاديمية نور وبيان
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  لوحة التحكم الذكية
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                إدارة موحدة وشاملة متصلة مباشرة بسحابة Supabase
              </p>
            </div>
          </div>
        </div>

        {/* Center Search / Command Bar */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع عن الطلاب، المعلمين، الدروس، أو أرقام الهواتف..."
              className="w-full pr-9 pl-4 py-2 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-[#0E1A16] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-xs text-white placeholder-slate-400 outline-none transition-all font-sans"
            />
          </div>
        </div>

        {/* User Profile, Role Badge, and Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-emerald-950/60 border border-white/[0.08] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="تحديث البيانات من Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">مزامنة</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isAdmin
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isAdmin ? 'مدير عام' : 'معلم'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentUser.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogoutClick}
                className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              الموقع العام
            </button>
          )}
        </div>
      </header>

      {/* Feedback Alert Toast */}
      {feedback && (
        <div
          className={`fixed bottom-5 left-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            feedback.isError
              ? 'bg-rose-950 text-rose-200 border border-rose-800'
              : 'bg-emerald-950 text-emerald-200 border border-emerald-800'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="max-w-[1440px] mx-auto flex">
        {/* Sidebar Navigation (Verdelo Smoked Glass Style) */}
        <aside
          className={`fixed md:sticky top-16 md:top-[61px] z-30 w-64 h-[calc(100vh-61px)] bg-[#0A1210]/90 backdrop-blur-2xl border-l border-emerald-950/70 p-4 flex flex-col justify-between transition-transform duration-200 ${
            isMobileSidebarOpen
              ? 'translate-x-0'
              : 'translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-6 overflow-y-auto">
            {/* Live Database Status Indicator */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900/60 border border-emerald-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>متصل بقاعدة Supabase</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                الجداول السحابية متزامنة مباشرة بدون وسطاء.
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>نظرة عامة والتحليلات</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('students');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>إدارة الطلاب ({accessibleStudents.length})</span>
                </div>
                {accessibleStudents.filter((s) => s.status === 'trial').length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                    {accessibleStudents.filter((s) => s.status === 'trial').length} تجربة
                  </span>
                )}
              </button>

              {/* Teachers Management (Admin view or limited teacher roster) */}
              <button
                onClick={() => {
                  setActiveTab('teachers');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isAdmin ? 'المعلمون والصلاحيات' : 'دليل المعلمين المعتمدين'} ({teachers.length})
                  </span>
                </div>
                {isAdmin && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                    تحكم
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('lessons');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'lessons'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>الدروس والمحاضرات ({lessons.length})</span>
                </div>
              </button>

              {/* Subscriptions Tab (Admin only or if teacher permitted) */}
              {(isAdmin || currentTeacherConfig?.canViewFinancials) && (
                <button
                  onClick={() => {
                    setActiveTab('subscriptions');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'subscriptions'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>الاشتراكات والمالية ({subscriptions.length})</span>
                  </div>
                </button>
              )}

              {/* Leads / Free Trials Tab */}
              {(isAdmin || currentTeacherConfig?.canViewAllStudents) && (
                <button
                  onClick={() => {
                    setActiveTab('leads');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'leads'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>طلبات الحجز والتسجيل ({leads.length})</span>
                  </div>
                  {leads.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 font-mono">
                      {leads.length}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* User Role Card & Footer */}
          <div className="pt-4 border-t border-emerald-950/60">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-300">مستوى الصلاحية:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isAdmin ? 'مدير عام المنصة' : 'معلم معتمد'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isAdmin
                  ? 'تمتلك كافة صلاحيات التعديل، الحذف، وتحديد صلاحيات المعلمين.'
                  : 'صلاحيات محددة لإدارة طلابك والحصص والمحاضرات الخاصة بك.'}
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-[#0C1A16] to-[#0A1412] border border-emerald-800/40 p-6 sm:p-8 shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مرحباً بك، {currentUser?.name}</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                    لوحة التحكم والمؤشرات الأكاديمية الحية
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    منظومة متكاملة لربط إدارة الطلاب والمعلمين والحصص المباشرة والاشتراكات بقاعدة بيانات Supabase مباشرة دون تشتت.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    {isAdmin && (
                      <button
                        onClick={() => setIsStudentModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة طالب جديد</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setIsTeacherModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>إضافة معلم</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsLessonModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-teal-400" />
                      <span>إضافة محاضرة / درس</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards (Verdelo Glass Style) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.07] hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold">إجمالي الطلاب</span>
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    {stats.totalStudents}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    {students.filter((s) => s.status === 'active').length} منتظم ·{' '}
                    {students.filter((s) => s.status === 'trial').length} حصة تجريبية
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.07] hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold">المعلمون المعتمدون</span>
                    <Users className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    {stats.totalTeachers}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-1">
                    متخصصون في القرآن واللغات
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.07] hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold">الاشتراكات النشطة</span>
                    <CreditCard className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    {stats.activeSubscriptions}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    سارية وجارية المتابعة
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.07] hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold">الحصص والمحتوى</span>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    {stats.totalLessons}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-1">
                    محاضرة مسجلة وتفاعلية
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Students List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Students & Live Lecture Access */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        آخر الطلاب المسجلين وروابط المحاضرات
                      </h3>
                      <p className="text-xs text-slate-400">
                        متابعة سريعة للدخول المباشر إلى Zoom أو Google Meet
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('students')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      عرض الكل ({accessibleStudents.length}) ←
                    </button>
                  </div>

                  <div className="divide-y divide-white/[0.05]">
                    {accessibleStudents.slice(0, 5).map((st) => (
                      <div
                        key={st.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{st.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                  st.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : st.status === 'trial'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-500/20 text-slate-400'
                                }`}
                              >
                                {st.status === 'active'
                                  ? 'منتظم'
                                  : st.status === 'trial'
                                  ? 'تجربة'
                                  : 'غير نشط'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              عمر {st.age} سنوات · ولي الأمر: {st.parent_name} ({st.phone})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {st.meeting_link ? (
                            <a
                              href={st.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>انضم للمحاضرة</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingMeetingEntity({
                                  id: st.id,
                                  type: 'student',
                                  currentLink: '',
                                  title: st.name,
                                });
                                setNewMeetingLinkInput('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>إضافة رابط زوم</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Status / RBAC Summary */}
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>نظام الصلاحيات الموحد (RBAC)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      المدير يمتلك كامل التحكم. المعلمون يدخلون بصلاحيات محددة فقط لحماية البيانات والاشتراكات.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                        <span className="text-slate-300">صلاحية المدير العام:</span>
                        <span className="font-bold text-amber-300 font-mono">كاملة 100%</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                        <span className="text-slate-300">صلاحية المعلمين:</span>
                        <span className="font-bold text-emerald-300 font-mono">مخصصة من الإدارة</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                        <span className="text-slate-300">طلبات التجربة الجديدة:</span>
                        <span className="font-bold text-teal-300 font-mono">{leads.length} طلب</span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('teachers')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      تعديل وضبط صلاحيات المعلمين ←
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    قائمة وسجل الطلاب ({filteredStudents.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    مزامنة حية من جدول students في Supabase مع روابط المحاضرات وحالة القيد.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setStudentFormError(null);
                      setIsStudentModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة طالب جديد</span>
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="py-3.5 px-4">اسم الطالب</th>
                        <th className="py-3.5 px-4">العمر</th>
                        <th className="py-3.5 px-4">ولي الأمر</th>
                        <th className="py-3.5 px-4">الهاتف</th>
                        <th className="py-3.5 px-4">المعلم المسؤول</th>
                        <th className="py-3.5 px-4">الحالة</th>
                        <th className="py-3.5 px-4">المحاضرة المباشرة</th>
                        {isAdmin && <th className="py-3.5 px-4 text-center">الإجراءات</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            لا يوجد طلاب مطابقون لبحثك.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st) => (
                          <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4 font-bold text-white">{st.name}</td>
                            <td className="py-3 px-4 font-mono">{st.age} سنوات</td>
                            <td className="py-3 px-4">{st.parent_name}</td>
                            <td className="py-3 px-4 font-mono dir-ltr">{st.phone}</td>
                            <td className="py-3 px-4 text-slate-300">
                              {st.teacher?.name ? st.teacher.name : <span className="text-slate-500">غير محدد</span>}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  st.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : st.status === 'trial'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-500/20 text-slate-400'
                                }`}
                              >
                                {st.status === 'active'
                                  ? 'منتظم'
                                  : st.status === 'trial'
                                  ? 'حصة تجريبية'
                                  : 'غير نشط'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {st.meeting_link ? (
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={st.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <Video className="w-3 h-3" />
                                    <span>انضم</span>
                                  </a>
                                  {(isAdmin || currentTeacherConfig?.canManageMeetingLinks) && (
                                    <button
                                      onClick={() => {
                                        setEditingMeetingEntity({
                                          id: st.id,
                                          type: 'student',
                                          currentLink: st.meeting_link || '',
                                          title: st.name,
                                        });
                                        setNewMeetingLinkInput(st.meeting_link || '');
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                                      title="تعديل الرابط"
                                    >
                                      <Sliders className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                (isAdmin || currentTeacherConfig?.canManageMeetingLinks) && (
                                  <button
                                    onClick={() => {
                                      setEditingMeetingEntity({
                                        id: st.id,
                                        type: 'student',
                                        currentLink: '',
                                        title: st.name,
                                      });
                                      setNewMeetingLinkInput('');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>تعيين رابط</span>
                                  </button>
                                )
                              )}
                            </td>
                            {isAdmin && (
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleDeleteItem('student', st.id, st.name)}
                                  className="text-rose-400 hover:text-rose-300 text-[11px] font-bold p-1 rounded-lg hover:bg-rose-950/40 transition-colors"
                                >
                                  حذف
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEACHERS & PERMISSIONS (RBAC) */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {isAdmin ? 'إدارة المعلمين وتحديد الصلاحيات (RBAC)' : 'دليل المعلمين المعتمدين'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isAdmin
                      ? 'يمكنك من هنا ضبط ما يحق لكل معلم رؤيته أو تعديله في لوحة التحكم الخاصة به.'
                      : 'قائمة المعلمين المعتمدين لدى أكاديمية نور وبيان.'}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsTeacherModalOpen(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة معلم جديد</span>
                  </button>
                )}
              </div>

              {/* Teachers Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((t) => {
                  const perm = teacherPermissions.find(
                    (p) =>
                      p.teacherId === t.id ||
                      (t.email && p.teacherEmail.toLowerCase() === t.email.toLowerCase())
                  );

                  return (
                    <div
                      key={t.id}
                      className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-400/20 text-emerald-300 flex items-center justify-center font-bold text-base border border-emerald-500/30">
                            {t.name.charAt(0)}
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedTeacherForPerms(
                                  perm || {
                                    teacherId: t.id,
                                    teacherEmail: t.email || `${t.id}@noor-bayan.com`,
                                    teacherName: t.name,
                                    canViewAllStudents: false,
                                    canEditStudentProgress: true,
                                    canManageMeetingLinks: true,
                                    canAddLessons: false,
                                    canViewFinancials: true,
                                  }
                                );
                                setIsPermissionsModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-white/[0.08] flex items-center gap-1"
                            >
                              <Shield className="w-3 h-3" />
                              <span>ضبط الصلاحيات</span>
                            </button>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white">{t.name}</h3>
                        <div className="text-xs text-emerald-400 font-medium">{t.specialty}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">{t.phone}</div>
                        {t.email && (
                          <div className="text-[11px] text-slate-400 font-mono">{t.email}</div>
                        )}

                        {/* Permissions Summary Badges */}
                        {isAdmin && (
                          <div className="mt-3 pt-3 border-t border-white/[0.05] space-y-1">
                            <span className="text-[10px] text-slate-500 block">الصلاحيات الممنوحة:</span>
                            <div className="flex flex-wrap gap-1">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  perm?.canViewAllStudents
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {perm?.canViewAllStudents ? 'كل الطلاب' : 'طلابه فقط'}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  perm?.canManageMeetingLinks
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {perm?.canManageMeetingLinks ? 'روابط زوم' : 'بدون تعديل روابط'}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  perm?.canEditStudentProgress
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {perm?.canEditStudentProgress ? 'تحديث السجل' : 'للقراءة'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center justify-end pt-2">
                          <button
                            onClick={() => handleDeleteItem('teacher', t.id, t.name)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                          >
                            حذف المعلم
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: LESSONS & LIVE CLASSES */}
          {activeTab === 'lessons' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    الدروس والمحاضرات المباشرة ({filteredLessons.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    جدول الدروس المحفوظة في Supabase مع روابط البث المباشر (Google Meet / Zoom).
                  </p>
                </div>
                {(isAdmin || currentTeacherConfig?.canAddLessons) && (
                  <button
                    onClick={() => setIsLessonModalOpen(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة درس جديد</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLessons.map((l) => (
                  <div
                    key={l.id}
                    className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between space-y-3 hover:border-emerald-500/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {l.category}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteItem('lesson', l.id, l.title)}
                            className="text-rose-400 hover:text-rose-300 text-xs"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{l.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{l.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                      {l.meeting_link ? (
                        <a
                          href={l.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>دخول المحاضرة</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">لا يوجد رابط بث مباشر</span>
                      )}

                      {(isAdmin || currentTeacherConfig?.canManageMeetingLinks) && (
                        <button
                          onClick={() => {
                            setEditingMeetingEntity({
                              id: l.id,
                              type: 'lesson',
                              currentLink: l.meeting_link || '',
                              title: l.title,
                            });
                            setNewMeetingLinkInput(l.meeting_link || '');
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          تعديل الرابط ←
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS & FINANCIALS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    الاشتراكات والمالية ({subscriptions.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    متابعة باقات الطلاب والتحصيل المالي المرتبط بـ Supabase.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsSubModalOpen(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة اشتراك</span>
                  </button>
                )}
              </div>

              {/* Subscriptions Table */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="py-3.5 px-4">الطالب</th>
                        <th className="py-3.5 px-4">الباقة التعليمية</th>
                        <th className="py-3.5 px-4">المبلغ</th>
                        <th className="py-3.5 px-4">الحالة</th>
                        <th className="py-3.5 px-4">تاريخ البدء</th>
                        <th className="py-3.5 px-4">تاريخ الانتهاء</th>
                        {isAdmin && <th className="py-3.5 px-4 text-center">الإجراء</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            {sub.student?.name || 'طالب مسجل'}
                          </td>
                          <td className="py-3 px-4">{sub.plan_name}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-300">
                            {sub.amount} {sub.currency}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {sub.status === 'active' ? 'نشط' : sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{sub.start_date}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{sub.end_date}</td>
                          {isAdmin && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteItem('sub', sub.id, sub.plan_name)}
                                className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                              >
                                حذف
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LEADS & TRIAL BOOKINGS */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  طلبات الحجز والتسجيل الواردة ({filteredLeads.length})
                </h2>
                <p className="text-xs text-slate-400">
                  كافة الحجوزات القادمة من موقع الأكاديمية مع إمكانية التواصل الفوري عبر الواتساب.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-white/[0.03] text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="py-3.5 px-4">الطفل</th>
                        <th className="py-3.5 px-4">ولي الأمر</th>
                        <th className="py-3.5 px-4">الهاتف</th>
                        <th className="py-3.5 px-4">البرنامج</th>
                        <th className="py-3.5 px-4">التاريخ</th>
                        <th className="py-3.5 px-4 text-center">التواصل وتأكيد الحصة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredLeads.map((ld) => {
                        const cleanDigits = ld.parent_phone.replace(/\D/g, '');
                        const waMsg = encodeURIComponent(
                          `السلام عليكم ورحمة الله، مرحباً أستاذ/ة ${ld.parent_name}. نحن نتواصل معكم من إدارة أكاديمية نور وبيان بخصوص طلب الحصة التجريبية للطفل/ة (${ld.child_name}) لتأكيد موعد الحصة ورابط المحاضرة المباشرة.`
                        );
                        const waLink = `https://wa.me/${cleanDigits}?text=${waMsg}`;
                        return (
                          <tr key={ld.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4 font-bold text-white">
                              {ld.child_name} ({ld.child_age} سنوات)
                            </td>
                            <td className="py-3 px-4">{ld.parent_name}</td>
                            <td className="py-3 px-4 font-mono text-left" dir="ltr">
                              {ld.parent_phone}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{ld.program_title}</td>
                            <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                              {ld.created_at
                                ? new Date(ld.created_at).toLocaleDateString('ar-SA')
                                : '—'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>مراسلة واتساب</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>



      {/* ------------------------------------------------------------- */}
      {/* MODAL: TEACHER PERMISSIONS RBAC MATRIX (ADMIN ONLY)           */}
      {/* ------------------------------------------------------------- */}
      {isPermissionsModalOpen && selectedTeacherForPerms && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D1815] border border-emerald-800/50 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">
                  صلاحيات المعلم: {selectedTeacherForPerms.teacherName}
                </h3>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              قم بتحديد الصلاحيات المسموحة لهذا المعلم عند تسجيل دخوله بحسابه الخاص:
            </p>

            <form onSubmit={handleSaveTeacherPermissions} className="space-y-3.5">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">رؤية جميع الطلاب في الأكاديمية</span>
                  <span className="text-[11px] text-slate-400">
                    عند التعطيل، يرى المعلم فقط الطلاب المسندين إليه في جدول students.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedTeacherForPerms.canViewAllStudents}
                  onChange={(e) =>
                    setSelectedTeacherForPerms({
                      ...selectedTeacherForPerms,
                      canViewAllStudents: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">تحديث وتعديل روابط البث المباشر (Zoom)</span>
                  <span className="text-[11px] text-slate-400">
                    يسمح للمعلم بوضع وتعديل رابط المحاضرة لطلابه.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedTeacherForPerms.canManageMeetingLinks}
                  onChange={(e) =>
                    setSelectedTeacherForPerms({
                      ...selectedTeacherForPerms,
                      canManageMeetingLinks: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">تحديث سجل حفظ وإنجاز الطالب</span>
                  <span className="text-[11px] text-slate-400">
                    تسجيل السور المحفوظة والتقييمات الدورية.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedTeacherForPerms.canEditStudentProgress}
                  onChange={(e) =>
                    setSelectedTeacherForPerms({
                      ...selectedTeacherForPerms,
                      canEditStudentProgress: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">إضافة ورفع دروس ومحتوى تعليمي</span>
                  <span className="text-[11px] text-slate-400">
                    إمكانية إضافة عناصر إلى جدول lessons.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedTeacherForPerms.canAddLessons}
                  onChange={(e) =>
                    setSelectedTeacherForPerms({
                      ...selectedTeacherForPerms,
                      canAddLessons: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  حفظ الصلاحيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD STUDENT (SUPABASE STRICT SCHEMA MATCH)             */}
      {/* ------------------------------------------------------------- */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D1815] border border-emerald-800/50 p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">إضافة طالب جديد (جدول students)</h3>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {studentFormError && (
              <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-bold">
                {studentFormError}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="مثال: يوسف أحمد السبيعي"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عمر الطالب (سنوات) *</label>
                  <input
                    type="number"
                    min={4}
                    max={18}
                    required
                    value={studentAge}
                    onChange={(e) => setStudentAge(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم ولي الأمر *</label>
                  <input
                    type="text"
                    required
                    value={studentParentName}
                    onChange={(e) => setStudentParentName(e.target.value)}
                    placeholder="أحمد السبيعي"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (واتساب) *</label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Dedicated Meeting Link */}
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-900/60">
                <label className="block text-xs font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span>رابط المحاضرة المباشرة (Zoom / Google Meet)</span>
                </label>
                <input
                  type="url"
                  value={studentMeetingLink}
                  onChange={(e) => setStudentMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-xyz أو رابط زوم"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-blue-800 text-white text-xs outline-none focus:border-blue-400 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المعلم المسؤول</label>
                  <select
                    value={studentTeacherId}
                    onChange={(e) => setStudentTeacherId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0D1815] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="">بدون تعيين حالياً (null)</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">حالة القيد</label>
                  <select
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0D1815] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="active">منتظم (Active)</option>
                    <option value="trial">حصة تجريبية (Trial)</option>
                    <option value="inactive">غير نشط (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ في Supabase...' : 'حفظ الطالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD TEACHER                                            */}
      {/* ------------------------------------------------------------- */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0D1815] border border-emerald-800/50 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">إضافة معلم جديد (جدول teachers)</h3>
              </div>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المعلم / المعلمة *</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="مثال: الشيخ عبد الرحمن الغامدي"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">التخصص والخبرة *</label>
                <input
                  type="text"
                  required
                  value={teacherSpecialty}
                  onChange={(e) => setTeacherSpecialty(e.target.value)}
                  placeholder="حفظ وتجويد القرآن / تأسيس نور البيان / لغة إنجليزية"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  placeholder="+966 50 111 2233"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني (لتسجيل الدخول)</label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@noor-bayan.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ المعلم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUICK EDIT MEETING LINK                                */}
      {/* ------------------------------------------------------------- */}
      {editingMeetingEntity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0D1815] border border-blue-900/60 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-white">
                  رابط المحاضرة المباشرة: {editingMeetingEntity.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingMeetingEntity(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              أدخل رابط غرفة الزوم أو جوجل ميت المخصصة لهذا الطالب/الدرس:
            </p>

            <input
              type="url"
              value={newMeetingLinkInput}
              onChange={(e) => setNewMeetingLinkInput(e.target.value)}
              placeholder="https://meet.google.com/xyz-live أو رابط زوم"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-blue-800 text-white text-xs outline-none focus:border-blue-400 font-mono"
              dir="ltr"
            />

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMeetingEntity(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveMeetingLink}
                disabled={submittingForm}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                {submittingForm ? 'جاري التحديث...' : 'حفظ الرابط في Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
