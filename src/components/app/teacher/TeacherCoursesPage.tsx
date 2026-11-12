import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Video,
  Clock,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  Copy,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { teacherService, TeacherCourse } from '../../../services/teacherService';

export const TeacherCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const teacherEmail = profile?.email || user?.email || 'teacher@noor-bayan.com';

  const [copiedLinkCourseId, setCopiedLinkCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const courses = teacherService.getMyCourses(teacherEmail);

  const filteredCourses = courses.filter(
    (c) =>
      c.title.includes(searchTerm) ||
      c.subtitle.includes(searchTerm) ||
      c.category.includes(searchTerm)
  );

  const handleCopyLink = (courseId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkCourseId(courseId);
    setTimeout(() => setCopiedLinkCourseId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              دوراتي وحلقاتي التعليمية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {courses.length} مسارات معتمدة
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            المناهج وحلقات التحفيظ المسندة إليك رسمياً، مع روابط الفصول الافتراضية المباشرة وجدول المواعيد.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في أسماء الدورات..."
            className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors pl-8"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="p-5 rounded-3xl bg-[#0D1815] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4 shadow-xl shadow-black/20"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {course.category === 'quran' ? 'قرآن وتجويد' : course.category === 'arabic' ? 'تأسيس لغوي' : 'قيم وتربية'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{course.enrolledStudentsCount} طلاب</span>
                </span>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-white leading-snug">
                  {course.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {course.subtitle}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{course.scheduleTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{course.weeklySessions} جلسات أسبوعياً • {course.sessionDurationMins} دقيقة</span>
                </div>
              </div>

              {/* Classroom Link Box */}
              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>الفصل المباشر (Zoom / Meet)</span>
                  </span>
                  <button
                    onClick={() => handleCopyLink(course.id, course.meetingLink)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                    title="نسخ الرابط"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLinkCourseId === course.id ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
                <a
                  href={course.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>دخول الغرفة الافتراضية للحلقة</span>
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/app/my-students?courseId=${course.id}`)}
                className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>طلاب المسار</span>
              </button>

              <button
                onClick={() => navigate(`/app/attendance?courseId=${course.id}`)}
                className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>رصد الحضور</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
