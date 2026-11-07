import React, { useState, useEffect } from 'react';
import {
  SupabaseTeacher,
  SupabaseStudent,
  SupabaseSubscription,
  SupabaseLesson,
  DashboardStats,
  supabaseService,
  getSupabaseConfig,
  saveCustomSupabaseConfig,
} from '../services/supabaseClient';
import {
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  FileText,
  Clock,
  Key,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  Video,
  Edit2,
  Radio,
} from 'lucide-react';

interface SupabaseAdminDashboardProps {
  onBackToMain?: () => void;
}

export const SupabaseAdminDashboard: React.FC<SupabaseAdminDashboardProps> = ({ onBackToMain }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'teachers' | 'students' | 'lessons' | 'setup'>('overview');

  // Supabase connection configuration state
  const [config, setConfig] = useState(getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(config.url);
  const [inputKey, setInputKey] = useState(config.anonKey);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalLessons: 0,
  });
  const [teachers, setTeachers] = useState<SupabaseTeacher[]>([]);
  const [students, setStudents] = useState<SupabaseStudent[]>([]);
  const [subscriptions, setSubscriptions] = useState<SupabaseSubscription[]>([]);
  const [lessons, setLessons] = useState<SupabaseLesson[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Form States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Meeting Link Quick Update State
  const [editingMeetingStudent, setEditingMeetingStudent] = useState<SupabaseStudent | null>(null);
  const [editingMeetingLesson, setEditingMeetingLesson] = useState<SupabaseLesson | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [copiedLinkText, setCopiedLinkText] = useState<string | null>(null);

  // Forms Input States
  // 1. Teacher Form
  const [teacherName, setTeacherName] = useState('');
  const [teacherSpecialty, setTeacherSpecialty] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');

  // 2. Student Form
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState(7);
  const [studentParentName, setStudentParentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentTeacherId, setStudentTeacherId] = useState('');
  const [studentStatus, setStudentStatus] = useState<'active' | 'trial' | 'inactive'>('active');
  const [studentMeetingLink, setStudentMeetingLink] = useState('');
  const [studentFormError, setStudentFormError] = useState<string | null>(null);

  // 3. Subscription Form
  const [subStudentId, setSubStudentId] = useState('');
  const [subPlanName, setSubPlanName] = useState('باقة التميز القرآني المكثفة');
  const [subAmount, setSubAmount] = useState(280);
  const [subCurrency, setSubCurrency] = useState('SAR');
  const [subStatus, setSubStatus] = useState<'active' | 'pending' | 'expired'>('active');
  const [subStartDate, setSubStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [subEndDate, setSubEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  // 4. Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonCategory, setLessonCategory] = useState('القرآن والتجويد');
  const [lessonFileUrl, setLessonFileUrl] = useState('');
  const [lessonMeetingLink, setLessonMeetingLink] = useState('');
  const [lessonTeacherId, setLessonTeacherId] = useState('');
  const [lessonDuration, setLessonDuration] = useState(45);

  // Load all data on mount or refresh
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    setErrorMsg('');
    try {
      const [fetchedStats, fetchedTeachers, fetchedStudents, fetchedSubs, fetchedLessons] =
        await Promise.all([
          supabaseService.getOverviewStats(),
          supabaseService.getTeachers(),
          supabaseService.getStudents(),
          supabaseService.getSubscriptions(),
          supabaseService.getLessons(),
        ]);

      setStats(fetchedStats);
      setTeachers(fetchedTeachers);
      setStudents(fetchedStudents);
      setSubscriptions(fetchedSubs);
      setLessons(fetchedLessons);

      // Set default selected IDs for forms if empty
      if (fetchedTeachers.length > 0 && !lessonTeacherId) {
        setLessonTeacherId(fetchedTeachers[0].id);
      }
      if (fetchedStudents.length > 0 && !subStudentId) {
        setSubStudentId(fetchedStudents[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load Supabase dashboard data:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء جلب البيانات من Supabase');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form Submissions
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherSpecialty || !teacherPhone) return;
    setSubmittingForm(true);
    try {
      await supabaseService.addTeacher({
        name: teacherName.trim(),
        specialty: teacherSpecialty.trim(),
        phone: teacherPhone.trim(),
        email: teacherEmail.trim() || null,
      });
      setIsTeacherModalOpen(false);
      setTeacherName('');
      setTeacherSpecialty('');
      setTeacherPhone('');
      setTeacherEmail('');
      await loadData(true);
    } catch (err: any) {
      alert(`خطأ أثناء إضافة المعلم: ${err.message}`);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError(null);

    if (!studentName.trim() || !studentParentName.trim() || !studentPhone.trim()) {
      setStudentFormError('يرجى ملء جميع الحقول الإلزامية: اسم الطالب، اسم ولي الأمر، ورقم الهاتف');
      return;
    }

    setSubmittingForm(true);

    try {
      // 1. Convert age to Number
      const parsedAge = Number(studentAge);
      const cleanAge = isNaN(parsedAge) ? 7 : parsedAge;

      // 2. Convert teacher_id to null if empty string ""
      const cleanTeacherId =
        studentTeacherId && studentTeacherId.trim() !== ''
          ? studentTeacherId.trim()
          : null;

      // 3. Send ONLY matching schema columns: (name, age, parent_name, phone, teacher_id, status, meeting_link)
      const studentPayload = {
        name: studentName.trim(),
        age: cleanAge,
        parent_name: studentParentName.trim(),
        phone: studentPhone.trim(),
        teacher_id: cleanTeacherId,
        status: studentStatus,
        meeting_link: studentMeetingLink.trim() || null,
      };

      console.log('Inserting student with payload:', studentPayload);

      await supabaseService.addStudent(studentPayload);

      // On success, reset form and close modal
      setIsStudentModalOpen(false);
      setStudentName('');
      setStudentParentName('');
      setStudentPhone('');
      setStudentMeetingLink('');
      setStudentTeacherId('');
      setStudentFormError(null);

      await loadData(true);
    } catch (err: any) {
      // 3. Output exact Supabase error to Console and in UI
      console.error('Supabase student insertion failed:', err);
      const errorMessage =
        err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setStudentFormError(errorMessage);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subStudentId || !subPlanName || subAmount === undefined) return;
    setSubmittingForm(true);
    try {
      await supabaseService.addSubscription({
        student_id: subStudentId,
        plan_name: subPlanName.trim(),
        amount: Number(subAmount) || 0,
        currency: subCurrency,
        status: subStatus,
        start_date: subStartDate,
        end_date: subEndDate,
      });
      setIsSubModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      alert(`خطأ أثناء تسجيل الاشتراك: ${err.message}`);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !lessonCategory || !lessonFileUrl) return;
    setSubmittingForm(true);
    try {
      await supabaseService.addLesson({
        title: lessonTitle.trim(),
        description: lessonDesc.trim(),
        category: lessonCategory.trim(),
        file_url: lessonFileUrl.trim(),
        meeting_link: lessonMeetingLink.trim() || null,
        teacher_id: lessonTeacherId || null,
        duration_minutes: Number(lessonDuration) || 45,
      });
      setIsLessonModalOpen(false);
      setLessonTitle('');
      setLessonDesc('');
      setLessonFileUrl('');
      setLessonMeetingLink('');
      await loadData(true);
    } catch (err: any) {
      alert(`خطأ أثناء إضافة الدرس: ${err.message}`);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleSaveStudentMeetingLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeetingStudent) return;
    setSubmittingForm(true);
    try {
      await supabaseService.updateStudentMeetingLink(editingMeetingStudent.id, meetingLinkInput);
      setEditingMeetingStudent(null);
      setMeetingLinkInput('');
      await loadData(true);
    } catch (err: any) {
      alert(`خطأ أثناء حفظ رابط المحاضرة: ${err.message}`);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleSaveLessonMeetingLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeetingLesson) return;
    setSubmittingForm(true);
    try {
      await supabaseService.updateLessonMeetingLink(editingMeetingLesson.id, meetingLinkInput);
      setEditingMeetingLesson(null);
      setMeetingLinkInput('');
      await loadData(true);
    } catch (err: any) {
      alert(`خطأ أثناء حفظ رابط المحاضرة للدرس: ${err.message}`);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(inputUrl, inputKey);
    const newConfig = getSupabaseConfig();
    setConfig(newConfig);
    setConfigSuccessMsg('تم حفظ مفاتيح الاتصال بـ Supabase بنجاح! يتم الآن إعادة فحص الجداول...');
    setTimeout(() => {
      setConfigSuccessMsg('');
      loadData();
    }, 1200);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseService.getSqlSchemaScript());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkText(id);
    setTimeout(() => setCopiedLinkText(null), 2000);
  };

  const getPlatformLabel = (link?: string | null) => {
    if (!link) return null;
    const l = link.toLowerCase();
    if (l.includes('meet.google.com')) return { name: 'Google Meet', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    if (l.includes('zoom.us')) return { name: 'Zoom', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    if (l.includes('teams.microsoft')) return { name: 'Teams', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
    return { name: 'رابط مباشر', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D17] text-[#0F172A] dark:text-slate-100 font-['Tajawal',sans-serif]" dir="rtl">
      {/* Top Header & Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0C1524]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="العودة للمنصة الرئيسية"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white">
                  لوحة تحكم Supabase
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  إدارة الأكاديمية
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                  <Video className="w-3 h-3 text-blue-500" />
                  <span>محاضرات أونلاين</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إدارة الطلاب، المعلمين، الاشتراكات، المحاضرات المباشرة والدروس عبر Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Live Status Indicator Badge */}
            <div
              onClick={() => setActiveTab('setup')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                config.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
              }`}
              title="اضغط لضبط مفاتيح الاتصال بـ Supabase ومخطط SQL"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {config.isConfigured ? 'متصل بـ Supabase (مشروع xxtgdvboq...)' : 'محاكاة تفاعلية (اضغط للربط بالسحابة)'}
              </span>
            </div>

            <button
              onClick={() => loadData()}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 space-x-reverse min-w-max py-2">
            {[
              { id: 'overview', label: 'نظرة عامة والإحصائيات', icon: DollarSign },
              { id: 'subscriptions', label: 'الاشتراكات والمالية', icon: CreditCard, count: subscriptions.length },
              { id: 'teachers', label: 'إدارة المعلمين', icon: Users, count: teachers.length },
              { id: 'students', label: 'إدارة الطلاب والمحاضرات', icon: GraduationCap, count: students.length },
              { id: 'lessons', label: 'الدروس والمحتوى', icon: BookOpen, count: lessons.length },
              { id: 'setup', label: 'إعدادات الربط وكود SQL', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? 'bg-emerald-700/80 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & STATS                                       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Total Students */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الطلاب المسجلين</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.totalStudents}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>موزعون على الحلقات التفاعلية</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Total Teachers */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">المعلمون والمحفظون المجازون</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.totalTeachers}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>جاهزون للحصص المباشرة</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Active Subscriptions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">الاشتراكات النشطة حالياً</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.activeSubscriptions}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    سارية ومجددة في جدول subscriptions
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Monthly Revenue */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الاشتراكات المالية</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.totalRevenue.toLocaleString()} <span className="text-sm font-semibold">ر.س</span>
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    محسوبة آلياً من الاشتراكات الفعالة
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold">إجراءات سريعة لمدير الأكاديمية</h4>
                  <p className="text-xs text-emerald-200/80">أضف طلاباً أو معلمين أو روابط محاضرات مباشرة فورياً في قاعدة البيانات</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>طالب جديد ورابط محاضرة</span>
                </button>
                <button
                  onClick={() => setIsSubModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل اشتراك</span>
                </button>
                <button
                  onClick={() => setIsTeacherModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>معلم جديد</span>
                </button>
                <button
                  onClick={() => setIsLessonModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>درس ومحاضرة لايف</span>
                </button>
              </div>
            </div>

            {/* Live Lectures Monitor Banner */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-blue-200/80 dark:border-blue-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span>المحاضرات والحصص المباشرة الجارية الآن (Live Classes)</span>
                  </h4>
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  إدارة روابط الفصول ({students.filter((s) => s.meeting_link).length} نشطة)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {students
                  .filter((s) => s.meeting_link)
                  .slice(0, 3)
                  .map((student) => {
                    const platform = getPlatformLabel(student.meeting_link);
                    return (
                      <div
                        key={student.id}
                        className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {student.name}
                            </span>
                            {platform && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${platform.color}`}>
                                {platform.name}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            المعلم: {student.teacher?.name || 'فصل مباشر'}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-2">
                          <a
                            href={student.meeting_link!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>دخول الحصة</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => {
                              setEditingMeetingStudent(student);
                              setMeetingLinkInput(student.meeting_link || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            title="تعديل الرابط"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Split View: Recent Subscriptions & Recent Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Subscriptions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">أحدث الاشتراكات المسجلة</h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    عرض الكل ({subscriptions.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {subscriptions.slice(0, 4).map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {sub.student?.name || 'طالب مسجل'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sub.plan_name}</p>
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {sub.amount} {sub.currency}
                        </span>
                        <div className="mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {sub.status === 'active' ? 'نشط' : sub.status === 'pending' ? 'قيد الانتظار' : 'منتهي'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Students & Assigned Teachers */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">الطلاب والمعلمون المسؤولون</h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    عرض الكل ({students.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {students.slice(0, 4).map((student) => (
                    <div
                      key={student.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">
                            {student.age} سنوات
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          المعلم: {student.teacher?.name || 'لم يُحدد'}
                        </p>
                      </div>
                      <div className="text-left flex items-center gap-2">
                        {student.meeting_link && (
                          <a
                            href={student.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                            title="رابط المحاضرة المباشرة"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {student.status === 'active' ? 'منتظم' : student.status === 'trial' ? 'حصة تجريبية' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SUBSCRIPTIONS MANAGEMENT                               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>إدارة الاشتراكات والمالية (subscriptions)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  عرض وتجديد اشتراكات الطلاب مع جلب أسماء الطلاب آلياً عبر علاقة المفتاح الأجنبي (Foreign Key)
                </p>
              </div>

              <button
                onClick={() => setIsSubModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة / تجديد اشتراك</span>
              </button>
            </div>

            {/* Subscriptions Table */}
            <div className="rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <tr>
                      <th className="px-4 py-3.5">اسم الطالب (students)</th>
                      <th className="px-4 py-3.5">الباقة التعليمية</th>
                      <th className="px-4 py-3.5">المبلغ</th>
                      <th className="px-4 py-3.5">تاريخ البدء</th>
                      <th className="px-4 py-3.5">تاريخ الانتهاء</th>
                      <th className="px-4 py-3.5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                              {(sub.student?.name || 'ط')[0]}
                            </div>
                            <span>{sub.student?.name || `طالب (#${sub.student_id.slice(-4)})`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">{sub.plan_name}</td>
                        <td className="px-4 py-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                          {sub.amount} {sub.currency}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{sub.start_date}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{sub.end_date}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              sub.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : sub.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'active'
                                  ? 'bg-emerald-500'
                                  : sub.status === 'pending'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span>{sub.status === 'active' ? 'نشط' : sub.status === 'pending' ? 'معلق' : 'منتهي'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-400">
                          لا توجد اشتراكات مسجلة حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: TEACHERS MANAGEMENT                                    */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'teachers' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>إدارة المعلمين والمحفظين (teachers)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  عرض وتعيين المعلمين، تخصصاتهم، بيانات التواصل، وحفظها مباشرة في جدول `teachers`
                </p>
              </div>

              <button
                onClick={() => setIsTeacherModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة معلم جديد</span>
              </button>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {teachers.map((teacher) => {
                const assignedStudents = students.filter((s) => s.teacher_id === teacher.id);
                return (
                  <div
                    key={teacher.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {teacher.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {teacher.name}
                          </h4>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-semibold">
                            معلم معتمد
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 font-medium mb-3">
                        <span className="font-bold text-slate-900 dark:text-white block mb-0.5">التخصص الأكاديمي:</span>
                        {teacher.specialty}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span dir="ltr">{teacher.phone}</span>
                        </div>
                        {teacher.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{teacher.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">الطلاب المرتبطون:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                        {assignedStudents.length} طلاب
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: STUDENTS MANAGEMENT (WITH LIVE MEETING LINK)           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'students' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>إدارة الطلاب والمحاضرات المباشرة (students)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  عرض سجل الطلاب، المعلم المسؤول، وإدارة رابط المحاضرة المباشرة (Zoom / Google Meet) لكل طالب
                </p>
              </div>

              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طالب ورابط محاضرة</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <tr>
                      <th className="px-4 py-3.5">اسم الطالب</th>
                      <th className="px-4 py-3.5">العمر</th>
                      <th className="px-4 py-3.5">المعلم المسؤول (FK)</th>
                      <th className="px-4 py-3.5">رابط المحاضرة المباشرة (Live Link)</th>
                      <th className="px-4 py-3.5">هاتف ولي الأمر</th>
                      <th className="px-4 py-3.5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {students.map((student) => {
                      const platform = getPlatformLabel(student.meeting_link);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                            <div>
                              <span>{student.name}</span>
                              {student.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 line-clamp-1">
                                  {student.notes}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                            {student.age} سنوات
                          </td>
                          <td className="px-4 py-3.5">
                            {student.teacher ? (
                              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>{student.teacher.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">غير محدد</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {student.meeting_link ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <a
                                  href={student.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-colors"
                                  title="فتح المحاضرة في نافذة جديدة"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>انضم للحصة</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>

                                {platform && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${platform.color}`}>
                                    {platform.name}
                                  </span>
                                )}

                                <button
                                  onClick={() => copyToClipboard(student.meeting_link!, student.id)}
                                  className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="نسخ الرابط"
                                >
                                  {copiedLinkText === student.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingMeetingStudent(student);
                                    setMeetingLinkInput(student.meeting_link || '');
                                  }}
                                  className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="تعديل الرابط"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingMeetingStudent(student);
                                  setMeetingLinkInput('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-700 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ إضافة رابط محاضرة</span>
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs" dir="ltr">
                            {student.phone}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                student.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : student.status === 'trial'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              <span>{student.status === 'active' ? 'منتظم' : student.status === 'trial' ? 'حصة تجريبية' : 'غير نشط'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-400">
                          لا يوجد طلاب مسجلون حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: LESSONS MANAGEMENT                                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'lessons' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  <span>إدارة الدروس والمحتوى التعليمي (lessons)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  إضافة دروس تفاعلية، تصنيف المواد، وربط ملفات الدروس والفيديوهات وغرف البث بجدول `lessons`
                </p>
              </div>

              <button
                onClick={() => setIsLessonModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة درس جديد</span>
              </button>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {lesson.category}
                      </span>
                      {lesson.duration_minutes && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lesson.duration_minutes} دقيقة</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {lesson.description}
                    </p>

                    {/* Live Meeting Link info if present */}
                    {lesson.meeting_link && (
                      <div className="mb-4 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            غرفة المحاضرة المباشرة جاهزة
                          </span>
                        </div>
                        <a
                          href={lesson.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>انضمام</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>المعلم: {lesson.teacher?.name || 'متاح للجميع'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingMeetingLesson(lesson);
                          setMeetingLinkInput(lesson.meeting_link || '');
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold transition-colors"
                        title="تعديل رابط المحاضرة المباشرة"
                      >
                        <Video className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={lesson.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 font-bold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>عرض الملف</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: SUPABASE CONNECTION & SQL SCHEMA SETUP                 */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            {/* Status card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      إعداد الاتصال بـ Supabase (Supabase Client Setup)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      مشروع Supabase الفعلي: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">https://xxtgdvboqjeezemwoimr.supabase.co</code>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    config.isConfigured
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {config.isConfigured ? 'مفاتيح السحابة مفعلة' : 'المحاكاة التفاعلية نشطة'}
                </span>
              </div>

              {configSuccessMsg && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{configSuccessMsg}</span>
                </div>
              )}

              {/* Keys Form */}
              <form onSubmit={handleSaveConnection} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رابط مشروع Supabase (SUPABASE_URL / VITE_SUPABASE_URL):
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://xxtgdvboqjeezemwoimr.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المفتاح العام (SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY):
                  </label>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="sb_publishable_SEI7HRK_XIZVhRNp5E9j-g_cv-ucCTI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <Key className="w-4 h-4" />
                    <span>حفظ وتفعيل الاتصال</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      saveCustomSupabaseConfig(
                        'https://xxtgdvboqjeezemwoimr.supabase.co',
                        'sb_publishable_SEI7HRK_XIZVhRNp5E9j-g_cv-ucCTI'
                      );
                      setInputUrl('https://xxtgdvboqjeezemwoimr.supabase.co');
                      setInputKey('sb_publishable_SEI7HRK_XIZVhRNp5E9j-g_cv-ucCTI');
                      setConfig(getSupabaseConfig());
                      loadData();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    استعادة المفاتيح الافتراضية
                  </button>
                </div>
              </form>
            </div>

            {/* SQL Schema Generator Script Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <span>مخطط قاعدة البيانات المحدث (SQL Schema + meeting_link)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    انسخ هذا الكود والصقه في نافذة <strong>SQL Editor</strong> داخل لوحة تحكم Supabase لتحديث الجداول وإضافة أعمدة روابط المحاضرات المباشرة
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>تم نسخ الكود!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ كود SQL بنقرة زر</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre
                  className="p-4 rounded-xl bg-[#08101C] text-emerald-400 text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 scrollbar-thin"
                  dir="ltr"
                >
                  {supabaseService.getSqlSchemaScript()}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD TEACHER                                          */}
      {/* ------------------------------------------------------------- */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>إضافة معلم جديد (teachers)</span>
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المعلم / المعلمة *
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="مثال: الشيخ عبد الله القرني"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التخصص والخبرة الأكاديمية *
                </label>
                <input
                  type="text"
                  required
                  value={teacherSpecialty}
                  onChange={(e) => setTeacherSpecialty(e.target.value)}
                  placeholder="مثال: حفظ وتجويد القرآن بالقراءات العشر"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف / الواتساب *
                </label>
                <input
                  type="tel"
                  required
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@noor-bayan.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ في قاعدة البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD STUDENT (WITH LIVE MEETING LINK)                  */}
      {/* ------------------------------------------------------------- */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>إضافة طالب جديد ورابط المحاضرة (students)</span>
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Display exact Supabase error in UI if insertion fails */}
            {studentFormError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">تعذر حفظ الطالب في Supabase:</span>
                  <p className="font-mono text-[11px] mt-1 break-all bg-white/70 dark:bg-black/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                    {studentFormError}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الطالب الثلاثي *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      if (studentFormError) setStudentFormError(null);
                    }}
                    placeholder="مثال: عمر فهد القحطاني"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عمر الطالب (سنوات) *
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={17}
                    required
                    value={studentAge}
                    onChange={(e) => setStudentAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم ولي الأمر *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentParentName}
                    onChange={(e) => {
                      setStudentParentName(e.target.value);
                      if (studentFormError) setStudentFormError(null);
                    }}
                    placeholder="فهد القحطاني"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    هاتف ولي الأمر (واتساب) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => {
                      setStudentPhone(e.target.value);
                      if (studentFormError) setStudentFormError(null);
                    }}
                    placeholder="+966 50 999 1122"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Dedicated Live Lecture Meeting Link Field */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>رابط المحاضرة المباشرة (Zoom / Google Meet / Teams) - اختياري</span>
                </label>
                <input
                  type="url"
                  value={studentMeetingLink}
                  onChange={(e) => setStudentMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/abc-xyz أو رابط زوم"
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
                  سيتم حفظ الرابط في حقل meeting_link بجدول students مباشرة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المعلم المسؤول (علاقة Foreign Key مع جدول teachers)
                </label>
                <select
                  value={studentTeacherId}
                  onChange={(e) => setStudentTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">بدون تعيين حالياً (null)</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  في حال عدم التعيين، سيتم إرسال القيمة كـ null تلقائياً لتفادي أخطاء قيود المفاتيح.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حالة قيد الطالب
                </label>
                <select
                  value={studentStatus}
                  onChange={(e) => setStudentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">منتظم (Active)</option>
                  <option value="trial">حصة تجريبية (Trial)</option>
                  <option value="inactive">غير نشط (Inactive)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ في جدول students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ADD SUBSCRIPTION                                     */}
      {/* ------------------------------------------------------------- */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>إضافة أو تجديد اشتراك (subscriptions)</span>
              </h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر الطالب (مرتبط بجدول students) *
                </label>
                <select
                  required
                  value={subStudentId}
                  onChange={(e) => setSubStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ولي الأمر: {s.parent_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الباقة / الخطة التعليمية *
                </label>
                <input
                  type="text"
                  required
                  value={subPlanName}
                  onChange={(e) => setSubPlanName(e.target.value)}
                  placeholder="باقة التميز القرآني المكثفة"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المبلغ *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={subAmount}
                    onChange={(e) => setSubAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    العملة
                  </label>
                  <select
                    value={subCurrency}
                    onChange={(e) => setSubCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ البدء *
                  </label>
                  <input
                    type="date"
                    required
                    value={subStartDate}
                    onChange={(e) => setSubStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الانتهاء *
                  </label>
                  <input
                    type="date"
                    required
                    value={subEndDate}
                    onChange={(e) => setSubEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حالة الاشتراك
                </label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">نشط وساري (Active)</option>
                  <option value="pending">قيد الدفع أو المعالجة (Pending)</option>
                  <option value="expired">منتهي الصلاحية (Expired)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ في جدول subscriptions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADD LESSON (WITH LIVE MEETING LINK)                  */}
      {/* ------------------------------------------------------------- */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <span>إضافة درس ومحتوى تعليمي ومحاضرة (lessons)</span>
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الدرس *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="مثال: أحكام النون الساكنة والتنوين (الإظهار والادغام)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تصنيف المادة *
                  </label>
                  <select
                    value={lessonCategory}
                    onChange={(e) => setLessonCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="القرآن والتجويد">القرآن والتجويد</option>
                    <option value="تأسيس اللغة العربية">تأسيس اللغة العربية</option>
                    <option value="المناهج الدولية والعلوم">المناهج الدولية والعلوم</option>
                    <option value="الحساب الذهني والذكاء">الحساب الذهني والذكاء</option>
                    <option value="التربية والآداب الإسلامية">التربية والآداب الإسلامية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مدة الحصة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الملف / العرض التفاعلي / PDF *
                </label>
                <input
                  type="url"
                  required
                  value={lessonFileUrl}
                  onChange={(e) => setLessonFileUrl(e.target.value)}
                  placeholder="https://example.com/slides/lesson1.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              {/* Dedicated Meeting Link for Lesson */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>رابط المحاضرة المباشرة (Zoom / Google Meet) - اختياري</span>
                </label>
                <input
                  type="url"
                  value={lessonMeetingLink}
                  onChange={(e) => setLessonMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-lesson أو رابط زوم"
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المعلم المسؤول عن الدرس
                </label>
                <select
                  value={lessonTeacherId}
                  onChange={(e) => setLessonTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">متاح لجميع المعلمين</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف المحتوى ومخرجات التعلم
                </label>
                <textarea
                  rows={2}
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="تفاصيل المادة العلمية، الأهداف المرجوة، والواجبات المرتبطة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ في جدول lessons'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUICK MODAL: EDIT STUDENT MEETING LINK                         */}
      {/* ------------------------------------------------------------- */}
      {editingMeetingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    تعديل رابط المحاضرة المباشرة
                  </h3>
                  <p className="text-xs text-slate-500">{editingMeetingStudent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMeetingStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentMeetingLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط المحاضرة (Zoom / Google Meet / Teams):
                </label>
                <input
                  type="url"
                  required
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  placeholder="https://meet.google.com/xyz-live أو رابط زوم"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  dir="ltr"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">روابط سريعة نموذجية:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMeetingLinkInput('https://meet.google.com/xyz-quran-live')}
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    Google Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetingLinkInput('https://zoom.us/j/9876543210?pwd=NoorBayan2026')}
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    Zoom Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetingLinkInput('')}
                    className="text-[10px] px-2 py-1 rounded bg-rose-50 dark:bg-rose-950 text-rose-600"
                  >
                    مسح الرابط
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMeetingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ وتفعيل فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUICK MODAL: EDIT LESSON MEETING LINK                          */}
      {/* ------------------------------------------------------------- */}
      {editingMeetingLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    تعديل رابط المحاضرة للدرس
                  </h3>
                  <p className="text-xs text-slate-500">{editingMeetingLesson.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMeetingLesson(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLessonMeetingLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط المحاضرة (Zoom / Google Meet):
                </label>
                <input
                  type="url"
                  required
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  placeholder="https://meet.google.com/xyz-lesson"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMeetingLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submittingForm ? 'جاري الحفظ...' : 'حفظ في قاعدة البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
