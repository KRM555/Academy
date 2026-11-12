import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  Trash2,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { adminService, AdminAdmissionRequest } from '../../../services/adminService';
import { SoftDeleteConfirmModal } from './SoftDeleteConfirmModal';

export const AdminAdmissionsPage: React.FC = () => {
  const [admissions, setAdmissions] = useState<AdminAdmissionRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Rejection Modal
  const [rejectingItem, setRejectingItem] = useState<AdminAdmissionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Soft Delete Modal
  const [itemToDelete, setItemToDelete] = useState<AdminAdmissionRequest | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    setAdmissions(adminService.getAdmissions(showDeleted));
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleApprove = (req: AdminAdmissionRequest) => {
    const res = adminService.approveAdmission(req.id, 'admin@noor-bayan.com');
    if (res.success && res.student) {
      setFeedback({
        type: 'success',
        text: `تم اعتماد وقبول الطالب (${req.childName}) بنجاح، وتم إنشاء ملف الطالب وإدراجه بالمسار (${res.student.program}).`,
      });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'فشل اعتماد الطلب.' });
    }
  };

  const handleOpenRejectModal = (req: AdminAdmissionRequest) => {
    setRejectingItem(req);
    setRejectionReason('عذراً، الحلقة مكتملة العدد حالياً في هذا التوقيت وتم إدراجكم على قائمة الانتظار.');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingItem) {
      adminService.rejectAdmission(rejectingItem.id, rejectionReason, 'admin@noor-bayan.com');
      setFeedback({
        type: 'success',
        text: `تم رفض الطلب المقدم للطالب (${rejectingItem.childName}) وتوثيق السبب في السجل.`,
      });
      setRejectingItem(null);
      loadData();
    }
  };

  const handleConfirmSoftDelete = () => {
    if (itemToDelete) {
      adminService.softDeleteAdmission(itemToDelete.id);
      setFeedback({
        type: 'success',
        text: `تم حذف طلب القبول للطالب (${itemToDelete.childName}) حذفاً ناعماً.`,
      });
      setItemToDelete(null);
      loadData();
    }
  };

  const filteredAdmissions = admissions.filter((req) => {
    const matchesSearch =
      req.childName.includes(searchQuery) ||
      req.parentName.includes(searchQuery) ||
      req.parentPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>بوابة القبول والتسجيل</span>
          </div>
          <h1 className="text-2xl font-black text-white">طلبات القبول والتسجيل (اعتماد / رفض)</h1>
          <p className="text-emerald-100/80 text-sm mt-1">
            مراجعة طلبات أولياء الأمور، اعتماد التحاق الطلاب تلقائياً أو إبداء أسباب الرفض مع الأرشفة الناعمة.
          </p>
        </div>
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

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، ولي الأمر، أو الهاتف..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            الكل ({admissions.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            قيد المراجعة ({admissions.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'approved'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            المعتمدون ({admissions.filter((a) => a.status === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            المرفوضون ({admissions.filter((a) => a.status === 'rejected').length})
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span>إظهار الطلبات المحذوفة ناعماً</span>
        </label>
      </div>

      {/* Admissions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">الطالب المتقدم</th>
                <th className="py-3 px-4">ولي الأمر والتواصل</th>
                <th className="py-3 px-4">المسار المطلوب</th>
                <th className="py-3 px-4">الوقت والملاحظات</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    لا توجد طلبات قبول تطابق شروط التصفية الحالية.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                      req.isDeleted ? 'bg-rose-50/20 opacity-75' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {req.id}
                      <div className="text-[10px] text-slate-400">
                        {new Date(req.submittedAt).toLocaleDateString('ar-SA')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{req.childName}</span>
                        {req.isDeleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                            محذوف ناعماً
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        العمر: {req.age} سنوات • {req.country}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {req.parentName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5" dir="ltr">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{req.parentPhone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
                        {req.selectedProgram}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-[200px]">
                      <div className="font-semibold text-slate-500">{req.preferredTime}</div>
                      <div className="text-[11px] text-slate-400 truncate">{req.notes || '—'}</div>
                      {req.status === 'rejected' && req.rejectionReason && (
                        <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                          سبب الرفض: {req.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {req.status === 'approved'
                          ? 'معتمد ومقبول'
                          : req.status === 'rejected'
                          ? 'مرفوض'
                          : 'قيد المراجعة'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              title="اعتماد وقبول الطلب"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>قبول</span>
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              title="رفض الطلب مع ذكر السبب"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setItemToDelete(req)}
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

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="h-1.5 bg-rose-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  رفض طلب القبول للطالب: {rejectingItem.childName}
                </h3>
                <button
                  onClick={() => setRejectingItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سبب الرفض (سيتم توثيقه في السجل وإبلاغ ولي الأمر)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRejectingItem(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition"
                  >
                    تأكيد رفض الطلب
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      <SoftDeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSoftDelete}
        title="تأكيد الحذف الناعم لطلب القبول"
        itemTypeLabel="طلب قبول"
        itemName={itemToDelete?.childName || ''}
      />
    </div>
  );
};
