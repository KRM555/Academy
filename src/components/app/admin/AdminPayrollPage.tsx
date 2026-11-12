import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  adminService,
  AdminPayroll,
  AdminTeacher,
} from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminPayrollPage: React.FC = () => {
  const [payrollRuns, setPayrollRuns] = useState<AdminPayroll[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingTeacherPayout, setViewingTeacherPayout] = useState<AdminTeacher | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminPayroll | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    teacherEmail: '',
    month: 'نوفمبر 2026',
    hoursCompleted: 35,
    hourlyRateSar: 65,
    bonus: 150,
    deductions: 0,
  });

  const loadData = () => {
    setPayrollRuns(adminService.getPayroll(showDeleted));
    const allTeachers = adminService.getTeachers(false);
    setTeachers(allTeachers);
    if (allTeachers.length > 0 && !formData.teacherEmail) {
      setFormData((prev) => ({
        ...prev,
        teacherEmail: allTeachers[0].email,
        hourlyRateSar: allTeachers[0].hourlyRateSar || 65,
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleOpenAddModal = () => {
    const defaultTeacher = teachers[0];
    setFormData({
      teacherEmail: defaultTeacher?.email || 'teacher@noor-bayan.com',
      month: 'ديسمبر 2026',
      hoursCompleted: 35,
      hourlyRateSar: defaultTeacher?.hourlyRateSar || 65,
      bonus: 100,
      deductions: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleTeacherSelectChange = (email: string) => {
    const teacher = teachers.find((t) => t.email === email);
    setFormData({
      ...formData,
      teacherEmail: email,
      hourlyRateSar: teacher?.hourlyRateSar || 65,
    });
  };

  const handleCreatePayrollRun = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.email === formData.teacherEmail);
    if (!teacher) {
      setFeedback({ type: 'error', text: 'يرجى اختيار المعلم.' });
      return;
    }

    try {
      // DUPLICATE MONTH GUARD handled by adminService.createPayrollRun
      const created = adminService.createPayrollRun({
        teacherEmail: teacher.email,
        teacherName: teacher.name,
        month: formData.month,
        hoursCompleted: formData.hoursCompleted,
        hourlyRateSar: formData.hourlyRateSar,
        bonus: formData.bonus,
        deductions: formData.deductions,
        bankName: teacher.bankName,
        accountHolderName: teacher.accountHolderName,
        ibanMasked: teacher.ibanMasked,
      });

      setFeedback({
        type: 'success',
        text: `تم إنشاء مسير الرواتب بنجاح للمعلم (${created.teacherName}) عن شهر (${created.month}) بصافي ${created.netAmount} ر.س.`,
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'حدث خطأ أثناء إنشاء مسير الرواتب.',
      });
    }
  };

  const handleMarkPaid = (pay: AdminPayroll) => {
    adminService.markPayrollPaid(pay.id);
    setFeedback({
      type: 'success',
      text: `تم تأكيد صرف وتحويل مستحقات المعلم (${pay.teacherName}) عن شهر ${pay.month}.`,
    });
    loadData();
  };

  const handleConfirmSoftDelete = () => {
    if (itemToDelete) {
      adminService.softDeletePayroll(itemToDelete.id);
      setFeedback({
        type: 'success',
        text: `تم حذف مسير الرواتب للمعلم (${itemToDelete.teacherName}) عن شهر ${itemToDelete.month} حذفاً ناعماً.`,
      });
      setItemToDelete(null);
      loadData();
    }
  };

  const filteredRuns = payrollRuns.filter((p) => {
    const matchesSearch =
      p.teacherName.includes(searchQuery) ||
      p.teacherEmail.includes(searchQuery) ||
      p.month.includes(searchQuery);
    const matchesMonth = monthFilter === 'all' || p.month.includes(monthFilter);
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>الإدارة المالية والمستحقات البنكية</span>
          </div>
          <h1 className="text-2xl font-black text-white">الرواتب والمسيرات الشهرية وتفاصيل الحسابات البنكية</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            إصدار مسيرات الرواتب مع الحماية التامة من التكرار الشهري، وعرض بيانات الآيبان المشفرة، والصرف المعتمد.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-lg shadow-amber-400/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إصدار مسير راتب جديد</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Teachers Payout Details Quick Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>بيانات الحسابات البنكية والآيبان المشفرة للمعلمين ({teachers.length})</span>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => setViewingTeacherPayout(teacher)}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:border-emerald-500 transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{teacher.name}</div>
                <div className="text-[11px] text-slate-500">{teacher.bankName}</div>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{teacher.ibanMasked}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المعلم، الشهر، أو البريد..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span>إظهار المسيرات المحذوفة ناعماً</span>
        </label>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">المعلم</th>
                <th className="py-3 px-4">الشهر المستحق</th>
                <th className="py-3 px-4">الساعات المنجزة</th>
                <th className="py-3 px-4">أجر الساعة</th>
                <th className="py-3 px-4">المستحق الأساسي</th>
                <th className="py-3 px-4">المكافآت</th>
                <th className="py-3 px-4">الصافي المحول</th>
                <th className="py-3 px-4">الحساب والآيبان</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    لا توجد مسيرات رواتب تطابق شروط التصفية الحالية.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                      p.isDeleted ? 'bg-rose-50/20 opacity-75' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{p.teacherName}</span>
                        {p.isDeleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                            محذوف ناعماً
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.teacherEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {p.month}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {p.hoursCompleted} ساعة
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {p.hourlyRateSar} ر.س
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {p.baseAmount} ر.س
                    </td>

                    <td className="py-3.5 px-4 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      +{p.bonus} ر.س
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
                        {p.netAmount} ر.س
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {p.ibanMasked}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.bankName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.status === 'paid'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {p.status === 'paid' ? 'تم التحويل' : 'قيد الصرف'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleMarkPaid(p)}
                            title="تأكيد التحويل والصرف"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>صرف</span>
                          </button>
                        )}
                        <button
                          onClick={() => setItemToDelete(p)}
                          title="حذف ناعم"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payroll Run Modal with Duplicate Month Protection */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="h-1.5 bg-emerald-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>إصدار مسير راتب جديد للمعلم</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePayrollRun} className="space-y-4 text-right">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المعلم المستحق</label>
                    <select
                      value={formData.teacherEmail}
                      onChange={(e) => handleTeacherSelectChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.email}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الشهر المستحق (حماية التكرار مفعّلة)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      placeholder="مثال: ديسمبر 2026"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الساعات المنجزة</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={200}
                      value={formData.hoursCompleted}
                      onChange={(e) => setFormData({ ...formData, hoursCompleted: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">أجر الساعة (ر.س)</label>
                    <input
                      type="number"
                      required
                      min={30}
                      max={300}
                      value={formData.hourlyRateSar}
                      onChange={(e) => setFormData({ ...formData, hourlyRateSar: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المكافأة (ر.س)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    إجمالي الراتب المحتسب:
                  </span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-200">
                    {formData.hoursCompleted * formData.hourlyRateSar + formData.bonus - formData.deductions} ر.س
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                  >
                    اعتماد مسير الراتب
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Payout Details Modal */}
      {viewingTeacherPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="h-1.5 bg-emerald-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>تفاصيل الحساب البنكي للمعلم</span>
                </h3>
                <button
                  onClick={() => setViewingTeacherPayout(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-right">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">اسم المعلم</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{viewingTeacherPayout.name}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">اسم صاحب الحساب المعتمد</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{viewingTeacherPayout.accountHolderName}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">البنك المحلي</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{viewingTeacherPayout.bankName}</div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    رقم الآيبان (IBAN) المشفر بقناع الحماية
                  </span>
                  <div className="font-mono font-bold text-base text-emerald-900 dark:text-emerald-200" dir="ltr">
                    {viewingTeacherPayout.ibanMasked}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setViewingTeacherPayout(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم لمسير الراتب"
        itemTypeLabel="مسير راتب"
        itemName={`${itemToDelete?.teacherName} - شهر ${itemToDelete?.month}`}
      />
    </div>
  );
};
