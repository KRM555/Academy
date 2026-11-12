import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Code,
} from 'lucide-react';
import { adminService, AdminAuditLog } from '../../../services/adminService';

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AdminAuditLog | null>(null);

  useEffect(() => {
    setLogs(adminService.getAuditLogs());
  }, []);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `سجل_التدقيق_الأمني_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.actorEmail.toLowerCase().includes(q) ||
      log.ip.includes(q);
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>نظام الأمان والرقابة الإدارية</span>
          </div>
          <h1 className="text-2xl font-black text-white">سجل التدقيق والعمليات الإدارية (Audit Log)</h1>
          <p className="text-slate-300 text-sm mt-1">
            سجل غير قابل للتعديل يوثق كافة الأنشطة الإدارية، الحذف الناعم، الاعتمادات، والمسيرات المالية بالأرقام وعناوين IP.
          </p>
        </div>
        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>تصدير السجل (JSON)</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في العمليات، المنفذ، أو عنوان IP..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">كافة الفئات</option>
            <option value="course">المسارات</option>
            <option value="lesson">الدروس</option>
            <option value="student">الطلاب</option>
            <option value="teacher">المعلمون</option>
            <option value="admission">القبول والتسجيل</option>
            <option value="announcement">التعميمات</option>
            <option value="certificate">الشهادات</option>
            <option value="payroll">الرواتب والمالية</option>
            <option value="security">الأمان وتسجيل الدخول</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">كافة مستويات الخطورة</option>
            <option value="info">عادي (Info)</option>
            <option value="warning">تنبيه / حذف ناعم (Warning)</option>
            <option value="critical">حرج (Critical)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">الوقت والتاريخ</th>
                <th className="py-3 px-4">العملية الموثقة</th>
                <th className="py-3 px-4">الفئة</th>
                <th className="py-3 px-4">المنفّذ (Actor)</th>
                <th className="py-3 px-4">عنوان IP</th>
                <th className="py-3 px-4">مستوى الخطورة</th>
                <th className="py-3 px-4 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    لا توجد أحداث مطابقة لشروط البحث.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      <div>{new Date(log.timestamp).toLocaleDateString('ar-SA')}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {log.actorEmail}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500" dir="ltr">
                      {log.ip}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          log.severity === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {log.severity === 'warning' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : log.severity === 'critical' ? (
                          <ShieldAlert className="w-3 h-3" />
                        ) : (
                          <Info className="w-3 h-3" />
                        )}
                        <span>{log.severity}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLogForDetails(log)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="عرض البيانات المصاحبة للعملية (JSON Payload)"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details JSON Modal */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                تفاصيل حدث التدقيق: {selectedLogForDetails.action}
              </h3>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 text-xs text-slate-500 space-y-1">
                <div>المنفّذ: <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLogForDetails.actorEmail}</span></div>
                <div>عنوان IP: <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLogForDetails.ip}</span></div>
                <div>الوقت: <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLogForDetails.timestamp}</span></div>
              </div>

              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">بيانات العملية:</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60" dir="ltr">
                {JSON.stringify(selectedLogForDetails.details, null, 2)}
              </pre>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedLogForDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
