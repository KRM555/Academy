import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Video,
  UserCheck,
  CreditCard,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  DollarSign,
  Shield,
  Home,
  Sparkles,
  Bell,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../BrandLogo';
import type { UserRole } from '../../types';

interface MenuItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: string;
}

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = (r?: UserRole | null) => {
    switch (r) {
      case 'admin':
        return { label: 'مدير النظام', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'teacher':
        return { label: 'معلم معتمد', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'student':
        return { label: 'طالب', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'parent':
        return { label: 'ولي أمر', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'مستخدم', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  // Master menu items catalog with role filters
  const allMenuItems: MenuItem[] = [
    // Common / Role specific overview
    {
      to: '/app/overview',
      label: 'نظرة عامة',
      icon: LayoutDashboard,
      allowedRoles: ['admin', 'teacher', 'student', 'parent'],
    },
    // Admin Only
    {
      to: '/app/students',
      label: 'إدارة الطلاب',
      icon: Users,
      allowedRoles: ['admin'],
    },
    {
      to: '/app/teachers',
      label: 'إدارة المعلمين',
      icon: GraduationCap,
      allowedRoles: ['admin'],
    },
    {
      to: '/app/courses',
      label: 'المناهج والمسارات',
      icon: BookOpen,
      allowedRoles: ['admin', 'student'],
    },
    {
      to: '/app/admissions',
      label: 'طلبات القبول والتسجيل',
      icon: UserCheck,
      allowedRoles: ['admin'],
    },
    {
      to: '/app/payroll',
      label: 'الرواتب والمالية',
      icon: DollarSign,
      allowedRoles: ['admin'],
    },
    {
      to: '/app/audit-logs',
      label: 'سجل التدقيق والأمان',
      icon: ShieldAlert,
      allowedRoles: ['admin'],
    },

    // Teacher Specific & Academic Records
    {
      to: '/app/my-courses',
      label: 'دوراتي وحلقاتي',
      icon: BookOpen,
      allowedRoles: ['teacher'],
    },
    {
      to: '/app/my-students',
      label: 'طلابي وحلقاتي',
      icon: Users,
      allowedRoles: ['teacher'],
    },
    {
      to: '/app/evaluations',
      label: 'سجل التسميع والتقييمات',
      icon: FileText,
      allowedRoles: ['teacher', 'student'],
    },
    {
      to: '/app/exams',
      label: 'الاختبارات والنتائج',
      icon: FileSpreadsheet,
      allowedRoles: ['admin', 'teacher', 'student'],
    },
    {
      to: '/app/attendance',
      label: 'الحضور والغياب',
      icon: CheckCircle2,
      allowedRoles: ['teacher', 'student'],
    },
    {
      to: '/app/payouts',
      label: 'مستحقاتي وبيانات البنك',
      icon: CreditCard,
      allowedRoles: ['teacher'],
    },

    // Student Credentials
    {
      to: '/app/certificates',
      label: 'شهاداتي وأوسمتي',
      icon: Award,
      allowedRoles: ['student', 'admin'],
    },

    // Parent Only
    {
      to: '/app/children-reports',
      label: 'تقارير إنجاز الأبناء',
      icon: Users,
      allowedRoles: ['parent'],
    },
    {
      to: '/app/subscriptions',
      label: 'الاشتراكات والفواتير',
      icon: CreditCard,
      allowedRoles: ['parent', 'admin'],
    },

    // Shared: Lessons
    {
      to: '/app/lessons',
      label: 'الدروس والمحاضرات',
      icon: Video,
      allowedRoles: ['admin', 'teacher', 'student'],
    },

    // Shared: Announcements
    {
      to: '/app/announcements',
      label: 'التعميمات والتنبيهات',
      icon: Bell,
      allowedRoles: ['admin', 'teacher', 'student', 'parent'],
    },

    // Shared: Schedule
    {
      to: '/app/schedule',
      label: 'جدول الحصص المباشرة',
      icon: Calendar,
      allowedRoles: ['teacher', 'student', 'parent'],
    },

    // Settings / Profile
    {
      to: '/app/settings',
      label: 'الملف الشخصي والحساب',
      icon: Settings,
      allowedRoles: ['admin', 'teacher', 'student', 'parent'],
    },
  ];

  // Filter menu items strictly by current user's role
  const visibleMenuItems = allMenuItems.filter((item) => role && item.allowedRoles.includes(role));
  const roleBadge = getRoleBadge(role);

  return (
    <div className="min-h-screen bg-[#070D0B] text-slate-100 font-['Tajawal',sans-serif] flex flex-col md:flex-row" dir="rtl">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-[-150px] w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[130px]" />
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0C1412]/95 backdrop-blur-xl border-b border-emerald-950/70 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04]"
            aria-label="تبديل القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <BrandLogo size="sm" lightText={true} />
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop persistent + Mobile slide-over) */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen w-64 lg:w-72 bg-[#09110F]/95 backdrop-blur-xl border-l border-emerald-950/70 z-50 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <button onClick={() => navigate('/')} className="cursor-pointer text-right">
              <BrandLogo size="md" lightText={true} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="text-xs font-bold text-white truncate">
                {profile?.full_name || 'مستخدم المنصة'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {profile?.email || user?.email}
              </div>
              <div className="mt-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
              القائمة الرئيسية
            </div>
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>العودة للموقع العام</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex sticky top-0 z-30 bg-[#0C1412]/80 backdrop-blur-xl border-b border-emerald-950/70 px-6 lg:px-8 py-3.5 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">
              Supabase Auth & Database Enforced
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${roleBadge.color}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>{roleBadge.label}</span>
            </span>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
