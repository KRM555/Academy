import React, { useState, useMemo } from 'react';
import type { Student, RegisteredLead, ProgramCourse } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';

export interface DashboardChartsProps {
  students: Student[];
  leads?: RegisteredLead[];
  courses?: ProgramCourse[];
  className?: string;
}

const BRAND_PALETTE = {
  primary: '#0F2942',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  indigo: '#6366F1',
  slate: '#64748B',
};

const PIE_COLORS = ['#0D9488', '#3B82F6', '#F59E0B', '#6366F1', '#10B981', '#EC4899'];

const MONTH_LABELS_AR = [
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

interface MonthlyTrendPoint {
  monthKey: string;
  monthName: string;
  enrolledStudents: number;
  newLeads: number;
  totalInquiries: number;
  conversionRate: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  students = [],
  leads = [],
  courses = [],
  className = '',
}) => {
  const [timeframeMonths, setTimeframeMonths] = useState<number>(6);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');

  // Filter students based on course selection
  const filteredStudents = useMemo(() => {
    if (selectedCourseFilter === 'all') return students;
    return students.filter((s) => s.program === selectedCourseFilter);
  }, [students, selectedCourseFilter]);

  // Filter leads based on course selection
  const filteredLeads = useMemo(() => {
    if (selectedCourseFilter === 'all') return leads;
    return leads.filter((l) => l.programTitle === selectedCourseFilter);
  }, [leads, selectedCourseFilter]);

  // Generate monthly enrollment trend data points
  const monthlyTrends = useMemo<MonthlyTrendPoint[]>(() => {
    const buckets: { [key: string]: { enrolled: number; leadsCount: number } } = {};

    const now = new Date();
    // Build chronological keys for the last N months
    for (let i = timeframeMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = { enrolled: 0, leadsCount: 0 };
    }

    // Tally enrolled students by enrolledAt
    filteredStudents.forEach((student) => {
      if (!student.enrolledAt) return;
      const date = new Date(student.enrolledAt);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) {
        buckets[key].enrolled += 1;
      }
    });

    // Tally leads by createdAt
    filteredLeads.forEach((lead) => {
      if (!lead.createdAt) return;
      const date = new Date(lead.createdAt);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) {
        buckets[key].leadsCount += 1;
      }
    });

    return Object.entries(buckets).map(([key, data]) => {
      const [year, monthStr] = key.split('-');
      const monthIndex = parseInt(monthStr, 10) - 1;
      const arabicMonth = MONTH_LABELS_AR[monthIndex] || monthStr;
      const total = data.enrolled + data.leadsCount;
      const conversion = total > 0 ? Math.round((data.enrolled / total) * 100) : 0;

      return {
        monthKey: key,
        monthName: `${arabicMonth} ${year}`,
        enrolledStudents: data.enrolled,
        newLeads: data.leadsCount,
        totalInquiries: total,
        conversionRate: conversion,
      };
    });
  }, [filteredStudents, filteredLeads, timeframeMonths]);

  // Aggregate program distribution
  const programDistributionData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredStudents.forEach((st) => {
      const prog = st.program || 'مسار عام';
      counts[prog] = (counts[prog] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredStudents]);

  // Summary statistics for executive decision-making
  const totalEnrolled = filteredStudents.length;
  const totalLeads = filteredLeads.length;
  const totalPipeline = totalEnrolled + totalLeads;
  const overallConversion = totalPipeline > 0 ? Math.round((totalEnrolled / totalPipeline) * 100) : 0;

  // Custom Tooltip with Arabic RTL support
  const ArabicChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0B1522] p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-right text-xs">
          <p className="font-bold text-[#0F2942] dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {entry.value.toLocaleString('ar-SA')}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span>{entry.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111E2E] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-[#0F2942] dark:text-white">
                  اتجاهات تسجيل الطلاب الشهرية (Monthly Enrollment Trends)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Firestore Collections: students & leads
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة بصرية فورية لبيانات التسجيل وتدفق الطلاب المسترجعة من مجموعات Firestore لدعم القرارات الإدارية
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Program filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="all">جميع البرامج الأكاديمية</option>
              {courses.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe buttons */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setTimeframeMonths(6)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframeMonths === 6
                  ? 'bg-[#0F2942] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              6 أشهر
            </button>
            <button
              onClick={() => setTimeframeMonths(12)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframeMonths === 12
                  ? 'bg-[#0F2942] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              12 شهراً
            </button>
          </div>

          {/* Chart Display Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setChartMode('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'area'
                  ? 'bg-white dark:bg-[#0F2942] text-teal-600 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="مخطط مساحي (Area Chart)"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'bar'
                  ? 'bg-white dark:bg-[#0F2942] text-teal-600 dark:text-teal-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="مخطط أعمدة (Bar Chart)"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المقيدين</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0D9488]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
              {totalEnrolled}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>نشط في الحلقات</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">الطلاب المقيدون فعلياً في المنهاج</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">طلبات التسجيل (Leads)</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#3B82F6]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
              {totalLeads}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">طلب حجز</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">حجوزات الحصص التجريبية الواردة</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل التحويل (Conversion)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#F59E0B]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F2942] dark:text-white font-mono tabular-nums">
              %{overallConversion}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>معدل ممتاز</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">نسبة التسجيل الفعلي من إجمالي الحجوزات</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المسار الأكثر طلباً</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#6366F1]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-extrabold text-[#0F2942] dark:text-white line-clamp-1">
              {programDistributionData[0]?.name || 'حلقات تحفيظ القرآن'}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              يستحوذ على أعلى نسبة من طلبات الالتحاق
            </p>
          </div>
        </div>
      </div>

      {/* Main Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trend (Area or Bar) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0D9488]" />
                <span>منحنى نمو الطلاب والطلبات خلال آخر {timeframeMonths} أشهر</span>
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                مقارنة بين الطلاب المقيدين رسمياً وطلبات التسجيل الجديدة شهراً بشهر
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0D9488] dark:bg-teal-950/50">
              بيانات موثوقة
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_PALETTE.teal} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={BRAND_PALETTE.teal} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_PALETTE.blue} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={BRAND_PALETTE.blue} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<ArabicChartTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                    formatter={(val) => <span className="text-slate-700 dark:text-slate-300 font-bold">{val}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="enrolledStudents"
                    name="الطلاب المقيدون (Enrolled)"
                    stroke={BRAND_PALETTE.teal}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#enrollmentGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="newLeads"
                    name="طلبات التسجيل (Leads)"
                    stroke={BRAND_PALETTE.blue}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#leadsGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<ArabicChartTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                    formatter={(val) => <span className="text-slate-700 dark:text-slate-300 font-bold">{val}</span>}
                  />
                  <Bar
                    dataKey="enrolledStudents"
                    name="الطلاب المقيدون (Enrolled)"
                    fill={BRAND_PALETTE.teal}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="newLeads"
                    name="طلبات التسجيل (Leads)"
                    fill={BRAND_PALETTE.blue}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Program Share Pie Chart */}
        <div className="p-5 bg-white dark:bg-[#111E2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F2942] dark:text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#8B5CF6]" />
                  <span>توزيع الطلاب حسب المسار</span>
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  نسبة الإقبال على المسارات الأكاديمية
                </p>
              </div>
            </div>

            <div className="h-56 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ArabicChartTooltip />} />
                  <Pie
                    data={programDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {programDistributionData.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Program Distribution Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {programDistributionData.map((prog, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2 truncate max-w-[180px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{prog.name}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {prog.value} طلاب
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
