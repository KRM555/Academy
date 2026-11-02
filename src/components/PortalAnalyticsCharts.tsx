import React, { useMemo, useState } from 'react';
import type { Student, RegisteredLead, ProgramCourse, UserAuth } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Flame,
  GraduationCap,
} from 'lucide-react';

interface PortalAnalyticsChartsProps {
  currentUser: UserAuth;
  students: Student[];
  leads: RegisteredLead[];
  courses: ProgramCourse[];
}

// Visual color palette matching Noor & Bayan brand
const COLORS = {
  primary: '#0F2942',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  rose: '#F43F5E',
  slate: '#64748B',
};

const PIE_COLORS = ['#0D9488', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899'];

// Arabic Month Names helper
const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

interface MonthlyDataPoint {
  monthKey: string; // e.g. "2026-01"
  monthLabel: string; // e.g. "يناير 2026"
  leadsCount: number;
  enrolledCount: number;
  totalNewInteractions: number;
}

interface MilestoneCategory {
  tierName: string;
  tierDescription: string;
  rangeLabel: string;
  count: number;
  percentage: number;
  studentsList: string[];
}

export const PortalAnalyticsCharts: React.FC<PortalAnalyticsChartsProps> = ({
  currentUser,
  students,
  leads,
  courses,
}) => {
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [timeRangeMonths, setTimeRangeMonths] = useState<number>(6);
  const [activeChartSection, setActiveChartSection] = useState<'overview' | 'enrollments' | 'milestones'>('overview');

  const isAdmin = currentUser.role === 'admin';

  // Filter students based on role and active program filter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Role scope: teachers only see their assigned students
      if (!isAdmin && s.assignedTeacherEmail?.toLowerCase() !== currentUser.email.toLowerCase()) {
        return false;
      }
      if (selectedProgramFilter !== 'all' && s.program !== selectedProgramFilter) {
        return false;
      }
      return true;
    });
  }, [students, isAdmin, currentUser.email, selectedProgramFilter]);

  // Filter leads based on program
  const filteredLeads = useMemo(() => {
    if (!isAdmin) return [];
    return leads.filter((l) => {
      if (selectedProgramFilter !== 'all' && l.programTitle !== selectedProgramFilter) {
        return false;
      }
      return true;
    });
  }, [leads, isAdmin, selectedProgramFilter]);

  // ---------------------------------------------------------------------------
  // 1. Monthly Enrollment & Leads Data Aggregation
  // ---------------------------------------------------------------------------
  const monthlyEnrollmentData = useMemo<MonthlyDataPoint[]>(() => {
    const monthsMap: { [key: string]: { leadsCount: number; enrolledCount: number } } = {};

    // Generate recent N months keys in chronological order
    const now = new Date();
    for (let i = timeRangeMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      monthsMap[key] = { leadsCount: 0, enrolledCount: 0 };
    }

    // Populate from leads
    filteredLeads.forEach((lead) => {
      if (!lead.createdAt) return;
      const date = new Date(lead.createdAt);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        monthsMap[key].leadsCount += 1;
      }
    });

    // Populate from enrolled students
    filteredStudents.forEach((st) => {
      if (!st.enrolledAt) return;
      const date = new Date(st.enrolledAt);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        monthsMap[key].enrolledCount += 1;
      }
    });

    // Format array for Recharts
    return Object.entries(monthsMap).map(([key, val]) => {
      const [yearStr, monthStr] = key.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const arabicName = ARABIC_MONTHS[monthIdx] || monthStr;
      return {
        monthKey: key,
        monthLabel: `${arabicName} ${yearStr}`,
        leadsCount: val.leadsCount,
        enrolledCount: val.enrolledCount,
        totalNewInteractions: val.leadsCount + val.enrolledCount,
      };
    });
  }, [filteredLeads, filteredStudents, timeRangeMonths]);

  // ---------------------------------------------------------------------------
  // 2. Student Progress Milestones Aggregation (Quran & Memorization Levels)
  // ---------------------------------------------------------------------------
  const milestoneData = useMemo(() => {
    const tiers: { [key: string]: MilestoneCategory } = {
      tier1: {
        tierName: 'مرحلة التأسيس والتمهيد',
        tierDescription: 'إتقان السور الأولى ومخارج الحروف',
        rangeLabel: '1 - 5 سُوَر',
        count: 0,
        percentage: 0,
        studentsList: [],
      },
      tier2: {
        tierName: 'مرحلة الانطلاق والترسيخ',
        tierDescription: 'حفظ متوسط وتثبيت التلاوة',
        rangeLabel: '6 - 15 سورة',
        count: 0,
        percentage: 0,
        studentsList: [],
      },
      tier3: {
        tierName: 'مرحلة التميز (إتمام جزء عمّ)',
        tierDescription: 'حفظ وتثبيت جزء عم كاملاً',
        rangeLabel: '16 - 30 سورة',
        count: 0,
        percentage: 0,
        studentsList: [],
      },
      tier4: {
        tierName: 'مرحلة الحفظ المتقدم',
        tierDescription: 'إتقان أكثر من 30 سورة مع التجويد',
        rangeLabel: '+30 سورة',
        count: 0,
        percentage: 0,
        studentsList: [],
      },
    };

    filteredStudents.forEach((st) => {
      const surahsCount = st.memorizedSurahs?.length || 0;
      if (surahsCount <= 5) {
        tiers.tier1.count += 1;
        tiers.tier1.studentsList.push(st.childName);
      } else if (surahsCount <= 15) {
        tiers.tier2.count += 1;
        tiers.tier2.studentsList.push(st.childName);
      } else if (surahsCount <= 30) {
        tiers.tier3.count += 1;
        tiers.tier3.studentsList.push(st.childName);
      } else {
        tiers.tier4.count += 1;
        tiers.tier4.studentsList.push(st.childName);
      }
    });

    const total = filteredStudents.length || 1;
    Object.values(tiers).forEach((t) => {
      t.percentage = Math.round((t.count / total) * 100);
    });

    return [
      {
        name: tiers.tier1.rangeLabel,
        category: tiers.tier1.tierName,
        studentsCount: tiers.tier1.count,
        percentage: tiers.tier1.percentage,
        fill: COLORS.teal,
      },
      {
        name: tiers.tier2.rangeLabel,
        category: tiers.tier2.tierName,
        studentsCount: tiers.tier2.count,
        percentage: tiers.tier2.percentage,
        fill: COLORS.blue,
      },
      {
        name: tiers.tier3.rangeLabel,
        category: tiers.tier3.tierName,
        studentsCount: tiers.tier3.count,
        percentage: tiers.tier3.percentage,
        fill: COLORS.amber,
      },
      {
        name: tiers.tier4.rangeLabel,
        category: tiers.tier4.tierName,
        studentsCount: tiers.tier4.count,
        percentage: tiers.tier4.percentage,
        fill: COLORS.purple,
      },
    ];
  }, [filteredStudents]);

  // ---------------------------------------------------------------------------
  // 3. Program Enrollment Distribution (Pie Chart Data)
  // ---------------------------------------------------------------------------
  const programDistribution = useMemo(() => {
    const counts: { [program: string]: number } = {};
    filteredStudents.forEach((s) => {
      const p = s.program || 'مسار عام';
      counts[p] = (counts[p] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredStudents]);

  // ---------------------------------------------------------------------------
  // 4. Top KPIs for Instant Administrative Decision-Making
  // ---------------------------------------------------------------------------
  const totalStudentsCount = filteredStudents.length;
  const totalSurahsMemorized = filteredStudents.reduce(
    (acc, st) => acc + (st.memorizedSurahs?.length || 0),
    0
  );
  const avgSurahsPerStudent = totalStudentsCount > 0 ? (totalSurahsMemorized / totalStudentsCount).toFixed(1) : '0';
  const avgAttendance =
    totalStudentsCount > 0
      ? Math.round(filteredStudents.reduce((acc, st) => acc + (st.attendanceRate || 0), 0) / totalStudentsCount)
      : 100;
  const totalLeadsCount = filteredLeads.length;

  // Custom Recharts Tooltip for RTL
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0B1522] p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-right text-xs">
          <p className="font-bold text-[#0F2942] dark:text-white mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                {entry.value.toLocaleString('ar-SA')}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span>{entry.name}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111E2E] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0D9488]" />
            <h3 className="text-sm md:text-base font-extrabold text-[#0F2942] dark:text-white">
              {isAdmin ? 'لوحة المؤشرات والتحليلات الأكاديمية' : 'مؤشرات إنجاز الطلاب ومتابعة المعلم'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? 'متابعة بصرية فورية لاتجاهات التسجيل الشهري ومراحل إنجاز حفظ القرآن لدعم القرارات الإدارية.'
              : 'رسم بياني يوضح تقدم طلابك في حفظ القرآن ومستوى الحضور ومعدلات التميز.'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Program Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="text-xs bg-transparent text-slate-700 dark:text-slate-200 outline-none font-bold cursor-pointer"
            >
              <option value="all">جميع المسارات الأكاديمية</option>
              {courses.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector (Admin Only) */}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setTimeRangeMonths(6)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  timeRangeMonths === 6
                    ? 'bg-[#0F2942] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                6 أشهر
              </button>
              <button
                onClick={() => setTimeRangeMonths(12)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  timeRangeMonths === 12
                    ? 'bg-[#0F2942] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                12 شهراً
              </button>
            </div>
          )}

          {/* Section Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveChartSection('overview')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeChartSection === 'overview'
                  ? 'bg-white dark:bg-[#0F2942] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              نظرة شاملة
            </button>
            <button
              onClick={() => setActiveChartSection('milestones')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeChartSection === 'milestones'
                  ? 'bg-white dark:bg-[#0F2942] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              مراحل الحفظ
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveChartSection('enrollments')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartSection === 'enrollments'
                    ? 'bg-white dark:bg-[#0F2942] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                التسجيل الشهري
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الطلاب المقيدون</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
              {totalStudentsCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>متابعة نشطة</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">طالب مسجل في الحلقات المباشرة</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط السور المنجزة</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#F59E0B]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
              {avgSurahsPerStudent}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">سورة / طالب</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            إجمالي السور المحفوظة: {totalSurahsMemorized} سورة
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط الحضور والالتزام</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#3B82F6]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
              %{avgAttendance}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">ممتاز</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">معدل الحضور في الجلسات التفاعلية</p>
        </div>

        {isAdmin ? (
          <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">طلبات التسجيل الواردة</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#8B5CF6]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
                {totalLeadsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">طلب حجز</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">قيد المتابعة وتأكيد الحصة التجريبية</p>
          </div>
        ) : (
          <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معالم جزء عمّ</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#8B5CF6]">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
                {milestoneData[2]?.studentsCount || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">طالب متميز</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">أتموا أكثر من 15 سورة بنجاح</p>
          </div>
        )}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Monthly Enrollment & Leads Trend (AreaChart) */}
        {(activeChartSection === 'overview' || activeChartSection === 'enrollments') && (
          <div className="p-5 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0D9488]" />
                  <span>بيانات ومعدلات التسجيل الشهرية (Monthly Enrollments)</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  حجم طلبات الحجز التجريبية والطلاب الملتحقين خلال آخر {timeRangeMonths} أشهر
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0D9488] dark:bg-teal-950/50">
                مؤشر نمو
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEnrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                    formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-bold">{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrolledCount"
                    name="الطلاب المقيدون"
                    stroke={COLORS.teal}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorEnrolled)"
                  />
                  {isAdmin && (
                    <Area
                      type="monotone"
                      dataKey="leadsCount"
                      name="طلبات التسجيل الجديدة"
                      stroke={COLORS.blue}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Student Progress Milestones (BarChart) */}
        {(activeChartSection === 'overview' || activeChartSection === 'milestones') && (
          <div className="p-5 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  <span>مراحل إنجاز وتقدم الطلاب في الحفظ (Progress Milestones)</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  توزيع الطلاب حسب شرائح السور المتقنة في منهاج تحفيظ القرآن الكريم
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                معالم القرآن
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={milestoneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                    formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-bold">{value}</span>}
                  />
                  <Bar
                    dataKey="studentsCount"
                    name="عدد الطلاب في هذه المرحلة"
                    radius={[8, 8, 0, 0]}
                  >
                    {milestoneData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: Academic Program Distribution (PieChart) */}
        {activeChartSection === 'overview' && programDistribution.length > 0 && (
          <div className="p-5 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#8B5CF6]" />
                  <span>توزيع الطلاب حسب المسارات التعليمية (Programs Distribution)</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  نسبة إقبال الطلاب والالتحاق بين المسارات المختلفة
                </p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingRight: 10 }}
                    formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-bold">{value}</span>}
                  />
                  <Pie
                    data={programDistribution}
                    cx="40%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {programDistribution.map((_, index) => (
                      <Cell key={`slice-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SUMMARY CARD 4: Milestone Tiers Breakdown & Guidance */}
        {activeChartSection === 'overview' && (
          <div className="p-5 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>تفاصيل محطات الإنجاز التراكمية (Milestone Breakdown)</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  ملخص الشرائح التعليمية ونسبتها من إجمالي الحلقات النشطة
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {milestoneData.map((tier, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.fill }} />
                      <span>{tier.category}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({tier.name})</span>
                    </span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {tier.studentsCount} طلاب ({tier.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${tier.percentage}%`,
                        backgroundColor: tier.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                {isAdmin
                  ? 'يُنصح بجدولة جلسات تكريم وإصدار شهادات الإتقان للطلاب المتواجدين في شريحة "إتمام جزء عمّ" لتحفيز الاستمرارية ورفع معدلات التجديد.'
                  : 'يمكنك مراجعة تقارير الطلاب وإضافة سور جديدة من تبويب "متابعة إنجاز الطلاب" لترقية شريحة الإنجاز تلقائياً.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
