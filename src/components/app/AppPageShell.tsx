import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, FolderLock } from 'lucide-react';

interface AppPageShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export const AppPageShell: React.FC<AppPageShellProps> = ({ title, subtitle, badge }) => {
  const { profile, role } = useAuth();

  const getRoleLabel = (r?: string | null) => {
    switch (r) {
      case 'admin':
        return 'مدير النظام (Admin)';
      case 'teacher':
        return 'معلم معتمد (Teacher)';
      case 'student':
        return 'طالب (Student)';
      case 'parent':
        return 'ولي أمر (Parent)';
      default:
        return 'مستخدم';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Alexandria',sans-serif]">
              {title}
            </h1>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            الصلاحية المعتمدة:
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{getRoleLabel(role)}</span>
          </span>
        </div>
      </div>

      {/* Empty Page Container per Task 4 specification */}
      <div className="rounded-3xl bg-[#0D1815]/90 border border-white/[0.08] p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-white">
            شاشة {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            تم التحقق من الصلاحيات وتفعيل المسار بنجاح. محتوى هذه الصفحة مخصص لحساب ({getRoleLabel(role)}) وسيتم إكماله في المهام البرمجية القادمة.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-slate-400 font-mono">
            <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
            <span>RLS Enforced • Role: {role} • User: {profile?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
