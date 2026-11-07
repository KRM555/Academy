import React, { useState, useEffect } from 'react';
import { Language, translations } from '../data/translations';
import {
  Award,
  Star,
  Volume2,
  Download,
  Sparkles,
  Video,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  Radio,
  Calendar,
} from 'lucide-react';
import { CertificateCanvasStudio } from './CertificateCanvasStudio';
import { supabaseService, SupabaseStudent } from '../services/supabaseClient';

interface StudentProgressDemoProps {
  currentLanguage?: Language;
}

export const StudentProgressDemo: React.FC<StudentProgressDemoProps> = ({ currentLanguage = 'ar' }) => {
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';

  const [studentsList, setStudentsList] = useState<SupabaseStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load students from Supabase to show real live student meeting links
  useEffect(() => {
    supabaseService.getStudents().then((data) => {
      if (data && data.length > 0) {
        setStudentsList(data);
        setSelectedStudentId(data[0].id);
      }
    });
  }, []);

  const activeStudent = studentsList.find((s) => s.id === selectedStudentId);

  const selectedStudent = {
    name: activeStudent ? activeStudent.name : isAr ? 'عمر فهد القحطاني' : 'Omar Fahad Al-Qahtani',
    age: activeStudent ? activeStudent.age : 7,
    program: isAr ? 'حلقات تحفيظ وتجويد القرآن (أونلاين)' : 'Quran & Tajweed Circles (Online)',
    teacherName: activeStudent?.teacher?.name || (isAr ? 'الشيخ عبد الله القرني' : 'Sheikh Abdullah Al-Qarni'),
    meetingLink: activeStudent?.meeting_link || 'https://meet.google.com/xyz-quran-live',
    memorizedCount: 21,
    attendanceRate: 98,
    activeSurah: isAr ? 'سورة النبأ (عم يتساءلون)' : 'Surah An-Naba',
    teacherVoiceNote: isAr
      ? 'أداء مبهج وتلاوة خاشعة خالية من الأخطاء في سورة الضحى، نبارك هذا التقدم الملحوظ ونوصي بالاستمرار على المراجعة اليومية.'
      : 'Joyful tone and reverent recitation in Surah Ad-Duha. Commendable progress, recommended to maintain daily revision.',
    badges: [
      { id: 'b1', name: isAr ? 'وسام قارئ الأسبوع المتميز' : 'Reader of the Week', date: '2026-10-24', icon: 'star' },
      { id: 'b2', name: isAr ? 'وسام المواظبة والالتزام' : 'Attendance Badge', date: '2026-10-18', icon: 'award' },
      { id: 'b3', name: isAr ? 'وسام فصاحة مخارج الحروف' : 'Articulation & Fluency Badge', date: '2026-10-10', icon: 'check' },
    ],
  };

  const [showCertModal, setShowCertModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleSimulatedAudio = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  const copyMeetingLink = () => {
    if (selectedStudent.meetingLink) {
      navigator.clipboard.writeText(selectedStudent.meetingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getPlatformInfo = (url?: string | null) => {
    if (!url) return null;
    const l = url.toLowerCase();
    if (l.includes('meet.google.com')) return { name: 'Google Meet', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (l.includes('zoom.us')) return { name: 'Zoom Meeting', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    if (l.includes('teams.microsoft')) return { name: 'Microsoft Teams', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    return { name: isAr ? 'فصل افتراضي مباشر' : 'Live Virtual Room', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
  };

  const platform = getPlatformInfo(selectedStudent.meetingLink);

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-[#0B1522] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sample Demonstration Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="font-bold">{isAr ? 'بوابة الطالب وأولياء الأمور:' : 'Student & Parent Portal:'}</strong>{' '}
              {isAr
                ? 'متابعة تقدم الطالب ودخول المحاضرات المباشرة أونلاين المرتبطة بقاعدة بيانات Supabase.'
                : 'Track student progress and join live virtual lectures connected to Supabase.'}
            </span>
          </div>

          {/* Student Switcher Dropdown */}
          {studentsList.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold">{isAr ? 'اختر الطالب:' : 'Select Student:'}</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-800 dark:text-white font-bold text-xs outline-none"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.age} سنوات)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] dark:text-emerald-400 mb-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.progressBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] dark:text-white font-display">
            {t.progressTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            {t.progressDesc}
          </p>
        </div>

        <div className="bg-[#FAF9F6] dark:bg-[#111E2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-5xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold text-2xl shadow-xs font-display">
                {selectedStudent.name[0]}
              </div>
              <div>
                <div className="text-lg font-bold text-[#0F2942] dark:text-white font-display flex items-center gap-2">
                  <span>{selectedStudent.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    {isAr ? 'طالب منتظم' : 'Active Student'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{selectedStudent.program}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isAr ? `عمر ${selectedStudent.age} سنوات` : `Age ${selectedStudent.age}`}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    المعلم: {selectedStudent.teacherName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCertModal(true)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#16253B] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.btnViewCert}</span>
              </button>
            </div>
          </div>

          {/* ============================================================= */}
          {/* PROMINENT LIVE LECTURE / MEETING BANNER (ONLINE CLASSROOM)     */}
          {/* ============================================================= */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#071E33] via-[#0B2A4A] to-[#081B2E] text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isAr ? '🔴 الحصة المباشرة أونلاين جاهزة الآن' : '🔴 Live Class Is In Session'}</span>
                  </span>

                  {platform && (
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${platform.badge}`}>
                      {platform.name}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {isAr ? 'حلقة القرآن والتأسيس التفاعلية المباشرة' : 'Live Interactive Quran & Phonics Circle'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {isAr
                    ? `معلم الحلقة: ${selectedStudent.teacherName}. اضغط على الزر أدناه للدخول إلى قاعة البث المباشر وبدء حصتك التفاعلية.`
                    : `Teacher: ${selectedStudent.teacherName}. Click the button below to join your live video classroom.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
                {selectedStudent.meetingLink ? (
                  <>
                    <a
                      href={selectedStudent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm sm:text-base transition-all transform hover:scale-105 shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Video className="w-5 h-5 animate-pulse" />
                      <span>{isAr ? 'انضم الآن إلى المحاضرة' : 'Join Live Classroom Now'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={copyMeetingLink}
                      className="w-full sm:w-auto px-3.5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={isAr ? 'نسخ رابط الحصة' : 'Copy Meeting Link'}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{isAr ? 'نسخ الرابط' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 px-4 py-3 rounded-xl text-center">
                    {isAr
                      ? 'سيقوم المعلم بإضافة رابط المحاضرة المباشرة قبل موعد الحصة بـ 15 دقيقة.'
                      : 'The teacher will publish the live class link 15 minutes before the session.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Three Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="bg-white dark:bg-[#16253B] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">{t.statMemorized}</div>
              <div className="text-2xl font-extrabold text-[#0D9488] dark:text-emerald-400 tabular-nums mt-1 font-mono">
                {selectedStudent.memorizedCount} {isAr ? 'سورة' : 'Surahs'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'تسميع بإجازة المعلم وتثبيت أسبوعي' : 'Verified recitation with weekly review'}
              </div>
            </div>

            <div className="bg-white dark:bg-[#16253B] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">{t.statAttendance}</div>
              <div className="text-2xl font-extrabold text-[#0F2942] dark:text-white tabular-nums mt-1 font-mono">
                {selectedStudent.attendanceRate}%
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                {isAr ? 'ممتاز (مواظب على جميع الحصص)' : 'Outstanding (consistent attendance)'}
              </div>
            </div>

            <div className="bg-white dark:bg-[#16253B] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">{t.statActiveSurah}</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1 font-display">
                {selectedStudent.activeSurah}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                {isAr ? 'المرحلة: الجزء الثلاثون (عم)' : 'Track: Juz Amma'}
              </div>
            </div>
          </div>

          {/* Teacher Audio/Voice Note Section */}
          <div className="bg-white dark:bg-[#16253B] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#0D9488] dark:text-emerald-400" />
                <span>{t.teacherVoiceTitle}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'اليوم · 5:30 مساءً' : 'Today · 5:30 PM'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{selectedStudent.teacherVoiceNote}"
              </p>
              <button
                onClick={toggleSimulatedAudio}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? t.btnStopVoice : t.btnPlayVoice}</span>
              </button>
            </div>
          </div>

          {/* Badges Earned */}
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">{t.badgesTitle}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedStudent.badges.map((b) => (
                <div key={b.id} className="bg-white dark:bg-[#16253B] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-display">{b.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{b.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate Canvas Studio Modal */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#0B1522] rounded-3xl max-w-6xl w-full p-4 sm:p-6 border border-amber-400/40 shadow-2xl relative max-h-[92vh] overflow-y-auto">
              <CertificateCanvasStudio
                initialStudentName={selectedStudent.name}
                initialProgram={selectedStudent.program}
                initialAchievement={isAr ? 'حفظ وإتقان قصار السور من جزء عمّ وتجويدها' : 'Memorization & Tajweed of short Surahs from Juz Amma'}
                currentLanguage={currentLanguage}
                isModal={true}
                onClose={() => setShowCertModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
