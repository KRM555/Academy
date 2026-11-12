import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role } = useAuth();
  const state = location.state as { attemptedPath?: string; requiredRoles?: string[]; currentRole?: string } | null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-full max-w-md bg-[#0D1815] border border-rose-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-white">
            غير مصرح بالدخول (Access Denied)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ليس لديك الصلاحيات الكافية لفتح هذا المسار. تم فحص الصلاحية من جدول <code className="text-emerald-400">profiles</code> في قاعدة البيانات وتم رفض الوصول المباشر.
          </p>
        </div>

        {state?.attemptedPath && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-400 font-mono text-right space-y-1">
            <div>المسار المطلوب: <span className="text-rose-400">{state.attemptedPath}</span></div>
            <div>صلاحيتك الحالية: <span className="text-emerald-400">{role || 'غير محدد'}</span></div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/app/overview')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للوحة الرئيسية</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الموقع العام</span>
          </button>
        </div>
      </div>
    </div>
  );
};
