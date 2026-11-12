import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  Bell,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const StudentAnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        // Read-only query against Supabase under RLS
        // (RLS policy students_read_targeted_announcements automatically filters to student targets)
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, content, target_type, course_id, created_at, courses(title)')
          .order('created_at', { ascending: false });

        if (error) console.error('[Announcements] Error:', error);
        if (isMounted && data) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('[StudentAnnouncements] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">جاري استرجاع التعميمات والإعلانات الموجهة إليك...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              التعميمات والتنبيهات الأكاديمية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              قراءة فقط (RLS Enforced)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            الإعلانات الرسمية الصادرة من إدارة الأكاديمية ومعلمي الحلقات الموجهة إليك شخصياً أو لحلقتك.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>({announcements.length} إعلانات)</span>
        </div>
      </div>

      {announcements.length === 0 ? (
        /* Clear Empty State for Announcements */
        <div className="rounded-3xl bg-[#0D1815]/90 border border-dashed border-white/[0.1] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] text-slate-500 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white">
              لا توجد تعميمات جديدة حالياً
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              عندما تصدر إدارة الأكاديمية أو معلم حلقتك تعميماً حول مواعيد الحلقات أو المسابقات أو الإجازات الرسمية، سيظهر هنا مباشرة.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-amber-500/40 p-6 space-y-3 shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {ann.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                    {ann.courses?.title || 'تعميم عام لجميع الطلاب'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                    {new Date(ann.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.04] text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {ann.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
