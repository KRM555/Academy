import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import { Award, Star, Volume2, Download, Sparkles } from 'lucide-react';
import { CertificateCanvasStudio } from './CertificateCanvasStudio';

interface StudentProgressDemoProps {
  currentLanguage?: Language;
}

export const StudentProgressDemo: React.FC<StudentProgressDemoProps> = ({ currentLanguage = 'ar' }) => {
  const t = translations[currentLanguage];
  const isAr = currentLanguage === 'ar';

  const [selectedStudent] = useState({
    name: isAr ? 'طالب تجريبي (نموذج توضيحي)' : 'Sample Student (Demo)',
    age: 7,
    program: isAr ? 'حلقات تحفيظ وتجويد القرآن (أونلاين)' : 'Quran & Tajweed Circles (Online)',
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
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleSimulatedAudio = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  return (
    <section className="py-12 bg-white dark:bg-[#0B1522] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sample Demonstration Notice Banner */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong className="font-bold">{isAr ? 'نموذج توضيحي (Sample):' : 'Illustrative Preview:'}</strong>{' '}
            {isAr
              ? 'هذه الصفحة تمثل نموذجاً تفاعلياً استرشادياً يوضح كيفية متابعة تقدم وحفظ طفلك عبر البوابة الخاصة.'
              : 'This page is a sample demonstration showing how parents monitor their child’s progress in the portal.'}
          </span>
        </div>

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

