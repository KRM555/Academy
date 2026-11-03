import React, { useState, useEffect } from 'react';
import { TajweedCatcherGame } from './TajweedCatcherGame';
import { ScienceQuranQuizGame } from './ScienceQuranQuizGame';
import { SurahPuzzleGame } from './SurahPuzzleGame';
import { gameAudio } from '../../utils/gameAudio';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  BookOpen,
  Atom,
  Clock,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export type GameId = 'tajweed_catcher' | 'science_quiz' | 'surah_puzzle';

interface GamesHubProps {
  currentLanguage: 'ar' | 'en';
  onNavigateHome: () => void;
  onGameActiveChange?: (isActive: boolean) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({
  currentLanguage,
  onNavigateHome,
  onGameActiveChange,
}) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());

  // High Scores from local storage
  const [catcherHighScore, setCatcherHighScore] = useState(0);
  const [scienceHighScore, setScienceHighScore] = useState(0);

  useEffect(() => {
    try {
      const c = localStorage.getItem('tajweed_catcher_highscore');
      if (c) setCatcherHighScore(parseInt(c, 10) || 0);

      const s = localStorage.getItem('science_quran_highscore');
      if (s) setScienceHighScore(parseInt(s, 10) || 0);
    } catch {}
  }, [activeGame]);

  const launchGame = (gameId: GameId) => {
    gameAudio.playClick();
    setActiveGame(gameId);
    if (onGameActiveChange) {
      onGameActiveChange(true);
    }
  };

  const closeGame = () => {
    gameAudio.playClick();
    setActiveGame(null);
    if (onGameActiveChange) {
      onGameActiveChange(false);
    }
  };

  const toggleSound = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  const isAr = currentLanguage === 'ar';

  // Render Full-Viewport Game Shell when a game is launched
  if (activeGame === 'tajweed_catcher') {
    return <TajweedCatcherGame onExit={closeGame} />;
  }

  if (activeGame === 'science_quiz') {
    return <ScienceQuranQuizGame onExit={closeGame} />;
  }

  if (activeGame === 'surah_puzzle') {
    return <SurahPuzzleGame onExit={closeGame} />;
  }

  return (
    <div className="min-h-screen bg-[#070E18] text-slate-100 font-['Tajawal',sans-serif] pb-16" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Subtle Starry Atmospheric Background */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-[#0A1626] to-[#070E18] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'واحة الألعاب والمسابقات الذكية' : 'Smart Educational Arcade'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {isAr ? 'ألعاب علمية وقرآنية للمتعة والفائدة' : 'Scientific & Quranic Learning Games'}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            {isAr
              ? 'صممت هذه الألعاب خصيصاً لطلاب ورواد أكاديمية نور وبيان للجمع بين التسلية المشوقة بزمن حقيقي والفوائد العلمية والقرآنية في أحكام التجويد، والإعجاز العلمي، وتثبيت الحفظ.'
              : 'Interactive real-time games designed for Noor & Bayan Academy students combining thrilling arcade action with Islamic sciences, Tajweed, and Quran memorization.'}
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleSound}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? (isAr ? 'الصوت: مكتوم' : 'Sound: Muted') : (isAr ? 'الصوت: يعمل' : 'Sound: On')}</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid of Games */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GAME 1: TAJWEED SKY CATCHER */}
          <div className="bg-[#0A1727] border border-emerald-500/30 rounded-2xl p-6 shadow-xl hover:border-emerald-500/70 transition-all flex flex-col justify-between group">
            <div>
              {/* Badge & High Score */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {isAr ? 'حركي 60fps أركيد' : '60fps Action Arcade'}
                </span>
                {catcherHighScore > 0 && (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{catcherHighScore}</span>
                  </span>
                )}
              </div>

              {/* Graphic Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                {isAr ? 'صائد التجويد ونور الحروف' : 'Tajweed Sky Catcher'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {isAr
                  ? 'حرك سفينة النور والتقط بلورات الحروف الموافقة لأحكام النون الساكنة والتجويد (الإظهار، القلقلة، الإدغام، التفخيم) وتفادَ الحروف الخاطئة.'
                  : 'Fast-paced 60fps canvas action catching Arabic Tajweed letters matching current rules while dodging distractors.'}
              </p>

              {/* Features bullet list */}
              <div className="space-y-1.5 text-xs text-slate-400 mb-6 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'مؤثرات صوتية تخليقية واهتزاز الشاشة' : 'Procedural synth audio & camera shake'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'مضاعفات الكومبو ودروع الطاقة' : 'Combo multipliers & powerup shields'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'متوافق مع لوحة المفاتيح واللمس' : 'Keyboard & touch support'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => launchGame('tajweed_catcher')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAr ? 'العب الآن (أركيد التجويد)' : 'Play Tajweed Catcher'}</span>
            </button>
          </div>

          {/* GAME 2: SCIENCE & QURAN QUEST */}
          <div className="bg-[#0A1727] border border-teal-500/30 rounded-2xl p-6 shadow-xl hover:border-teal-500/70 transition-all flex flex-col justify-between group">
            <div>
              {/* Badge & High Score */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                  {isAr ? 'إعجاز علمي وتاريخ' : 'Quranic Science Quest'}
                </span>
                {scienceHighScore > 0 && (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{scienceHighScore}</span>
                  </span>
                )}
              </div>

              {/* Graphic Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-950/40 group-hover:scale-105 transition-transform">
                <Atom className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                {isAr ? 'تحدي فرسان القرآن والعلوم' : 'Wonders of Science & Quran'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {isAr
                  ? 'رحلة استكشافية مشوقة بين آيات القرآن الكريم وحقائق الفلك، الجيولوجيا، الأجنة، وعلماء الحضارة الإسلامية العظام كابن الهيثم والخوارزمي.'
                  : 'Fast-paced science trivia connecting modern astrophysics, geology, and embryology with Quranic verses.'}
              </p>

              {/* Features bullet list */}
              <div className="space-y-1.5 text-xs text-slate-400 mb-6 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{isAr ? '3 وسائل مساعدة: 50:50 وتجميد الوقت' : '3 Lifelines: 50:50, freeze time, hints'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{isAr ? 'شرح علمي محكم ومراجع أكاديمية' : 'Peer-reviewed scientific explanations'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{isAr ? 'مضاعفات السرعة وسلاسل الإجابة' : 'Streak score multipliers'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => launchGame('science_quiz')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAr ? 'ابدأ التحدي العلمي' : 'Start Science Quest'}</span>
            </button>
          </div>

          {/* GAME 3: SURAH PUZZLE SPEED RUN */}
          <div className="bg-[#0A1727] border border-amber-500/30 rounded-2xl p-6 shadow-xl hover:border-amber-500/70 transition-all flex flex-col justify-between group">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  {isAr ? 'تثبيت الحفظ وسرعة البديهة' : 'Memorization & Speed'}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحدي زمني' : 'Timed'}</span>
                </span>
              </div>

              {/* Graphic Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-950/40 group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                {isAr ? 'سباق ترتيب الآيات والسور' : 'Ayah Flow Speed Puzzle'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {isAr
                  ? 'رتب آيات قصار السور المبعثرة بالترتيب الصحيح في أسرع وقت ممكن لاختبار حفظك وسرعة استحضار الآيات القرآنية.'
                  : 'Speed puzzle arranging scrambled Quranic verses in proper sequence against the ticking clock.'}
              </p>

              {/* Features bullet list */}
              <div className="space-y-1.5 text-xs text-slate-400 mb-6 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isAr ? 'تشكيلة من قصار السور المباركة' : 'Curated selection of short Surahs'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isAr ? 'صوت نقر فوري عند التقاط الآية' : 'Instant audio snap on matching verse'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isAr ? 'نظام تلميحات للكلمة الأولى' : 'First-word hint support'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => launchGame('surah_puzzle')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAr ? 'ابدأ سباق الترتيب' : 'Start Ayah Puzzle'}</span>
            </button>
          </div>
        </div>

        {/* Educational pedagogical note */}
        <div className="mt-12 bg-[#091524] border border-slate-800 rounded-2xl p-6 text-center max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {isAr ? 'نهج التعليم الترفيهي الهادف في نور وبيان' : 'Edutainment Philosophy at Noor & Bayan'}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr
              ? 'نهدف من خلال الألعاب التفاعلية إلى ربط التعلم بالمتعة والشغف، وترسيخ أحكام التجويد وتدبر آيات الإعجاز في الكون والنفس، وتحفيز الطلاب على المداومة وتكرار الحفظ بأسلوب شيق وجذاب.'
              : 'Our interactive games merge joyful gameplay with deep Quranic and scientific understanding, motivating learners through active participation and immediate feedback.'}
          </p>
        </div>
      </div>
    </div>
  );
};
