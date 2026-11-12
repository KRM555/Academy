import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Clock,
  ArrowDownToLine,
  Lock,
  Edit3,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService, PayrollRecord, PayoutDetails } from '../../../services/teacherService';

const SAUDI_BANKS = [
  'مصرف الراجحي (Al Rajhi Bank)',
  'البنك الأهلي السعودي (SNB)',
  'بنك الرياض (Riyad Bank)',
  'مصرف الإنماء (Alinma Bank)',
  'البنك السعودي الأول (SAB)',
  'البنك العربي الوطني (ANB)',
  'بنك البلاد (Bank Albilad)',
  'البنك السعودي الفرنسي (BSF)',
  'بنك الجزيرة (Bank AlJazira)',
  'بنك الخليج الدولي (GIB)',
  'بنك آخر / بنك دولي',
];

export const TeacherPayoutsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({
    accountHolderName: '',
    bankName: SAUDI_BANKS[0],
    ibanMasked: '',
    isConfigured: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState(SAUDI_BANKS[0]);
  const [customBank, setCustomBank] = useState('');
  const [plainIban, setPlainIban] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const history = teacherService.getPayrollHistory(teacherEmail);
    const details = teacherService.getPayoutDetails(teacherEmail);

    setPayrollHistory(history);
    setPayoutDetails(details);

    if (details.isConfigured) {
      setHolderName(details.accountHolderName);
      setBankName(details.bankName);
      setIsEditing(false);
    } else {
      setHolderName(profile?.full_name || 'الشيخ عبد الله القرني');
      setIsEditing(true);
    }
  }, [teacherEmail, profile]);

  const validateIban = (iban: string): boolean => {
    const clean = iban.replace(/\s+/g, '').toUpperCase();
    if (!clean.startsWith('SA')) {
      return clean.length >= 15;
    }
    return clean.length === 24;
  };

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalBank = bankName === 'بنك آخر / بنك دولي' ? customBank.trim() : bankName;

    if (!holderName.trim()) {
      setErrorMessage('يرجى إدخال اسم صاحب الحساب كما هو مسجل بالبنك.');
      return;
    }
    if (!finalBank) {
      setErrorMessage('يرجى تحديد أو إدخال اسم البنك.');
      return;
    }
    if (!plainIban.trim() || !validateIban(plainIban)) {
      setErrorMessage('صيغة الآيبان غير صحيحة. الآيبان السعودي يبدأ بـ SA ويتكون من 24 حرفاً ورقماً.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await teacherService.savePayoutDetails(teacherEmail, {
        accountHolderName: holderName.trim(),
        bankName: finalBank,
        iban: plainIban,
      });

      setPayoutDetails({
        accountHolderName: holderName.trim(),
        bankName: finalBank,
        ibanMasked: res.maskedIban,
        isConfigured: true,
        updatedAt: new Date().toISOString(),
      });

      // Clear sensitive raw plain text IBAN from memory
      setPlainIban('');
      setIsEditing(false);
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل حفظ البيانات البنكية');
    } finally {
      setIsSaving(false);
    }
  };

  // Financial summary
  const totalPaid = payrollHistory
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  const pendingPayout = payrollHistory
    .filter((p) => p.status === 'pending')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  const totalHours = payrollHistory.reduce((acc, curr) => acc + curr.hoursCompleted, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              مستحقاتي ومسيرات الرواتب
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              خاص بالمعلم
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            كشف المسيرات الشهرية المعتمدة، وساعات التدريس، وإدارة بيانات الحساب البنكي المشفرة.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>إجمالي المحوّل لحسابك</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalPaid} ر.س</div>
          <div className="text-[10px] text-emerald-400 font-mono">حوالات مكتملة معتمدة</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>المستحقات المعلقة</span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{pendingPayout} ر.س</div>
          <div className="text-[10px] text-amber-400/80 font-mono">تُصرف في نهاية الشهر</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>إجمالي ساعات التدريس</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalHours} ساعة</div>
          <div className="text-[10px] text-slate-400">ساعات الحلقات المباشرة</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1513] border border-white/[0.08] space-y-1">
          <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>أجر الساعة المعتمد</span>
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">65 ر.س / س</div>
          <div className="text-[10px] text-slate-400">حسب عقد الكادر التعليمي</div>
        </div>
      </div>

      {/* SECTION 1: PAYOUT DETAILS FORM & MASKED IBAN CARD */}
      <div className="rounded-3xl bg-[#0D1815] border border-white/[0.08] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                بيانات الحساب والتحويل البنكي (Payout Details)
              </h2>
              <p className="text-xs text-slate-400">
                الحساب المعتمد لتحويل المستحقات الشهرية. يتم إخفاء وتشفير الآيبان بعد الحفظ.
              </p>
            </div>
          </div>

          {payoutDetails.isConfigured && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-white/[0.08] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل الحساب البنكي</span>
            </button>
          )}
        </div>

        {/* View Mode: Masked IBAN Card */}
        {payoutDetails.isConfigured && !isEditing && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0A1613] to-teal-950/30 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>حساب بنكي معتمد ومشفر (AES-256)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">صاحب الحساب:</span>
                <span className="font-extrabold text-white">{payoutDetails.accountHolderName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">البنك:</span>
                <span className="font-extrabold text-white">{payoutDetails.bankName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">رقم الآيبان (المشفر):</span>
                <span className="font-mono font-black text-emerald-300 text-sm tracking-wider" dir="ltr">
                  {payoutDetails.ibanMasked}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                لأسباب أمنية، لا يتم عرض رقم الآيبان الكامل على الشاشة بعد اعتماده وتشفيره في قاعدة البيانات.
              </span>
            </div>
          </div>
        )}

        {/* Edit / Entry Form Mode */}
        {isEditing && (
          <form onSubmit={handleSavePayoutDetails} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Holder Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اسم صاحب الحساب (بالكامل):</span>
                </label>
                <input
                  type="text"
                  required
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="الاسم الرباعي كما في البنك"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-400" />
                  <span>اسم البنك:</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {SAUDI_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Bank if selected */}
              {bankName === 'بنك آخر / بنك دولي' && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">اسم البنك المخصص:</label>
                  <input
                    type="text"
                    required
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                    placeholder="اكتب اسم البنك بالكامل"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Plain IBAN Input */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>رقم الآيبان الدولي (IBAN):</span>
                </label>
                <input
                  type="text"
                  required
                  value={plainIban}
                  onChange={(e) => setPlainIban(e.target.value)}
                  placeholder="SA03 8000 0000 6080 1016 7890"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs uppercase"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  يبدأ بـ SA للأيبان السعودي (24 خانة)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {payoutDetails.isConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setPlainIban('');
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء التعديل
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSaving ? 'جاري الحفظ والتشفير...' : 'حفظ وتشفير بيانات الآيبان'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 2: MY PAYROLL HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>سجل المسيرات الشهرية والمستحقات (Payroll History)</span>
          </h2>
          <span className="text-xs text-slate-400">
            {payrollHistory.length} مسيرات مسجلة
          </span>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#0D1815]">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-bold">
                <th className="py-3.5 px-4">شهر الاستحقاق</th>
                <th className="py-3.5 px-4">ساعات التدريس</th>
                <th className="py-3.5 px-4">سعر الساعة</th>
                <th className="py-3.5 px-4">المستحق الأساسي</th>
                <th className="py-3.5 px-4">مكافأة التميز</th>
                <th className="py-3.5 px-4">صافي التحويل</th>
                <th className="py-3.5 px-4">حالة التحويل</th>
                <th className="py-3.5 px-4">المرجع البنكي / التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {payrollHistory.map((p) => {
                const isPaid = p.status === 'paid';
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {p.month}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.hoursCompleted} س
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {p.hourlyRateSar} ر.س
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.baseAmount} ر.س
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      +{p.bonus} ر.س
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-300 whitespace-nowrap">
                      {p.netAmount} ر.س
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isPaid ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تم الصرف</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>معلق نهاية الشهر</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {p.transactionRef || 'في انتظار دورة الصرف'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
