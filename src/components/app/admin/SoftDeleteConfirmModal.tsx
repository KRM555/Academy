import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface SoftDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemTypeLabel: string;
  itemName: string;
  isLoading?: boolean;
}

export const SoftDeleteConfirmModal: React.FC<SoftDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الحذف الناعم (Soft Delete)',
  itemTypeLabel,
  itemName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 mb-4 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              العنصر المستهدف ({itemTypeLabel}):
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
              {itemName}
            </p>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            سيتم تنفيذ <span className="font-bold text-rose-600 dark:text-rose-400">حذف ناعم (Soft Delete)</span> ونقل هذا العنصر إلى الأرشيف الإداري. لن يُحذف السجل نهائياً من قاعدة البيانات، ولن يظهر للطلاب والمعلمين، مع إمكانية استعادته لاحقاً من سجل الإدارة.
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition"
            >
              إلغاء التراجع
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isLoading ? 'جارٍ الحذف...' : 'تأكيد الحذف الناعم'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
