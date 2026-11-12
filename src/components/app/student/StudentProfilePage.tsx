import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Sparkles,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // 1. Update allowed non-role profile fields under RLS (users_update_own_profile)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. If password provided, update via Supabase Auth
      if (newPassword.trim()) {
        if (newPassword !== confirmPassword) {
          throw new Error('كلمتا المرور غير متطابقتين.');
        }
        if (newPassword.length < 6) {
          throw new Error('يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
        }

        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (authError) throw authError;
        setNewPassword('');
        setConfirmPassword('');
      }

      await refreshProfile();
      setSuccessMsg('تم حفظ وتحديث بيانات الملف الشخصي بنجاح.');
    } catch (err: any) {
      console.error('[StudentProfile] Error updating profile:', err);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              الملف الشخصي وإعدادات الحساب
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              RLS Enforced
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            إدارة بيانات الطالب الشخصية، رقم التواصل، وكلمة مرور الحساب.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="rounded-3xl bg-[#0D1815] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">البيانات الأساسية</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم الطالب الكامل
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني (غير قابل للتعديل)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 text-xs sm:text-sm font-mono cursor-not-allowed pl-9"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم هاتف ولي الأمر / الطالب للتواصل
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm font-mono pl-9"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الصلاحية المسجلة (Enforced Role)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-bold text-cyan-400">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>طالب (Student) — محمي بموجب سياسات RLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Password */}
        <div className="rounded-3xl bg-[#0D1815] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">تغيير كلمة المرور (اختياري)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="اتركها فارغة إذا لم ترغب في التغيير"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm font-sans"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تأكيد كلمة المرور"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-emerald-500 focus:outline-none text-white text-xs sm:text-sm font-sans"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات في Supabase'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
