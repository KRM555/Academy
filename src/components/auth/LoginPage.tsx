import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../BrandLogo';

interface LoginPageProps {
  onBackToMain?: () => void;
  onOpenAdmission?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToMain, onOpenAdmission }) => {
  const navigate = useNavigate();
  const { signIn, user, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated with a valid role, redirect to /app
  React.useEffect(() => {
    if (user && role) {
      navigate('/app/overview', { replace: true });
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      const profile = await signIn(email.trim(), password);
      // Navigation occurs after profile and role are confirmed
      navigate('/app/overview', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'بيانات الدخول غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D0B] text-slate-100 flex flex-col justify-center items-center p-4 font-['Tajawal',sans-serif] selection:bg-emerald-500/30 relative overflow-hidden" dir="rtl">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-md bg-[#0D1815]/95 backdrop-blur-xl border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <BrandLogo size="md" lightText={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            تسجيل دخول المنصة التعليمية
          </h1>
          <p className="text-xs text-slate-400">
            الدخول الموحد للطلاب، أولياء الأمور، المعلمين، وإدارة الأكاديمية
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm pl-9 transition-colors font-sans"
                dir="ltr"
                autoComplete="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm pl-9 transition-colors font-sans"
                dir="ltr"
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التحقق من الحساب...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>دخول إلى المنصة</span>
              </>
            )}
          </button>
        </form>

        {/* Security Policy & Admission Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>سياسة القبول والتسجيل</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            حسابات الطلاب والمعلمين يتم إنشاؤها وتفعيلها حصرياً بواسطة إدارة الأكاديمية بعد دراسة طلب الالتحاق. لا يوجد تسجيل ذاتي مباشر.
          </p>
          {onOpenAdmission && (
            <button
              type="button"
              onClick={onOpenAdmission}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer inline-flex items-center gap-1 mt-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>تقديم طلب التحاق جديد للطفل / تجربة مجانية ←</span>
            </button>
          )}
        </div>

        {/* Back to Home */}
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
};
