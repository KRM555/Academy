import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import { Award, Star, Volume2, Download, Sparkles } from 'lucide-react';

interface StudentProgressDemoProps {
  currentLanguage?: Language;
}

export const StudentProgressDemo: React.FC<StudentProgressDemoProps> = ({ currentLanguage = 'ar' }) => {
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';

  const [selectedStudent] = useState({
    name: isAr ? 'عمر بن سلطان القحطاني' : 'Omar Sultan Al-Qahtani',
    age: 7,
    program: isAr ? 'حلقات "نور يتلى" لتحفيظ وتجويد القرآن (أونلاين)' : 'Noor Recited: Quran & Tajweed Circles (Online)',
    memorizedCount: 21,
    attendanceRate: 98,
    activeSurah: isAr ? 'سورة النبأ (عم يتساءلون)' : 'Surah An-Naba',
    teacherVoiceNote: isAr
      ? 'أداء صوتي مبهج وتلاوة خاشعة خالية من الأخطاء في سورة الضحى، أحسنت يا عمر وبارك الله في والديك.'
      : 'Joyful tone and reverent error-free recitation of Surah Ad-Duha. Excellent progress Omar, blessings to your parents.',
    badges: [
      { id: 'b1', name: isAr ? 'وسام قارئ الأسبوع المتميز' : 'Reader of the Week', date: '2026-10-24', icon: '🌟' },
      { id: 'b2', name: isAr ? 'وسام المواظبة الذهبي (98%)' : 'Golden Attendance Badge', date: '2026-10-18', icon: '🏆' },
      { id: 'b3', name: isAr ? 'وسام فصاحة مخارج الحروف والطلاقة' : 'Articulation & Fluency Badge', date: '2026-10-10', icon: '🎖️' },
    ],
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleSimulatedAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <section className="py-12 bg-white dark:bg-[#0B1522] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
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

        <div className="bg-[#FAF9F6] dark:bg-[#111E2E] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-5xl mx-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold text-2xl shadow-xs font-display">
                {isAr ? 'ع' : 'O'}
              </div>
              <div>
                <div className="text-lg font-bold text-[#0F2942] dark:text-white font-display">{selectedStudent.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{selectedStudent.program}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isAr ? `عمر ${selectedStudent.age} سنوات` : `Age ${selectedStudent.age}`}</span>
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

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
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
            {isPlayingAudio && (
              <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isAr ? 'جاري تشغيل رسالة المعلم الصوتية المحفزة لولي الأمر...' : 'Playing motivating voice note from instructor...'}</span>
              </div>
            )}
          </div>

          {/* Badges Earned */}
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">{t.badgesTitle}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedStudent.badges.map((b) => (
                <div key={b.id} className="bg-white dark:bg-[#16253B] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="text-2xl">{b.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-display">{b.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{b.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111E2E] rounded-3xl max-w-xl w-full p-8 border-4 border-amber-400/40 shadow-2xl relative text-center">
              <div className="text-amber-500 text-4xl mb-2">🏆</div>
              <div className="text-xs font-bold text-[#0D9488] dark:text-emerald-400 font-display">
                {isAr ? 'أكاديمية نور وبيان لتعليم القرآن والتربية' : 'Noor & Bayan Academy for Education'}
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2942] dark:text-white mt-1 font-display">
                {isAr ? 'شهادة فخرية وإتقان تلاوة' : 'Honorary Certificate of Mastery'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? 'رقم الاعتماد الأكاديمي: NB-2026-9812' : 'Credential ID: NB-2026-9812'}
              </p>

              <div className="my-6 p-6 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {isAr ? 'تشهد إدارة الأكاديمية بأن الطالب النجيب:' : 'The Academy administration hereby certifies that student:'}
                </p>
                <div className="text-xl font-extrabold text-[#0D9488] dark:text-emerald-400 font-display">{selectedStudent.name}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'قد أتم بنجاح حفظ وتجويد قصار السور من جزء عم وإتقان التأسيس اللغوي السليم بتقدير ممتاز مع مرتبة الشرف الأولى عبر فصول الأكاديمية الأونلاين.'
                    : 'Has successfully mastered the recitation of Juz Amma and Arabic reading foundations with Highest Honors in live virtual classrooms.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{isAr ? 'المشرف العام:' : 'Supervisor:'}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">الشيخ عبد الرحمن الغامدي</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{isAr ? 'الختم الرقمي:' : 'Digital Seal:'}</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">معتمد رسمياً 2026</div>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setShowCertModal(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F2942] dark:bg-slate-700 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق الشهادة' : 'Close Certificate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

