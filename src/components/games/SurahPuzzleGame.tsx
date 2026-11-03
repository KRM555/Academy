import React, { useState, useEffect } from 'react';
import { gameAudio } from '../../utils/gameAudio';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Play,
  Check,
} from 'lucide-react';

interface SurahData {
  id: number;
  name: string;
  revelation: 'مكية' | 'مدنية';
  verses: string[];
}

const SURAHS: SurahData[] = [
  {
    id: 1,
    name: 'سورة الفاتحة',
    revelation: 'مكية',
    verses: [
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      'الرَّحْمَٰنِ الرَّحِيمِ',
      'مَالِكِ يَوْمِ الدِّينِ',
      'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    ],
  },
  {
    id: 112,
    name: 'سورة الإخلاص',
    revelation: 'مكية',
    verses: [
      'قُلْ هُوَ اللَّهُ أَحَدٌ',
      'اللَّهُ الصَّمَدُ',
      'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    ],
  },
  {
    id: 113,
    name: 'سورة الفلق',
    revelation: 'مكية',
    verses: [
      'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      'مِن شَرِّ مَا خَلَقَ',
      'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    ],
  },
  {
    id: 114,
    name: 'سورة الناس',
    revelation: 'مكية',
    verses: [
      'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      'مَلِكِ النَّاسِ',
      'إِلَٰهِ النَّاسِ',
      'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
      'مِنَ الْجِنَّةِ وَالنَّاسِ',
    ],
  },
  {
    id: 103,
    name: 'سورة العصر',
    revelation: 'مكية',
    verses: [
      'وَالْعَصْرِ',
      'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
      'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
    ],
  },
  {
    id: 108,
    name: 'سورة الكوثر',
    revelation: 'مكية',
    verses: [
      'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
      'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
    ],
  },
  {
    id: 94,
    name: 'سورة الشرح',
    revelation: 'مكية',
    verses: [
      'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
      'وَوَضَعْنَا عَنكَ وِزْرَكَ',
      'الَّذِي أَنقَضَ ظَهْرَكَ',
      'وَرَفَعْنَا لَكَ ذِكْرَكَ',
      'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      'فَإِذَا فَرَغْتَ فَانصَبْ',
      'وَإِلَىٰ رَبِّكَ فَارْغَب',
    ],
  },
];

interface SurahPuzzleGameProps {
  onExit: () => void;
}

export const SurahPuzzleGame: React.FC<SurahPuzzleGameProps> = ({ onExit }) => {
  const [selectedSurahIdx, setSelectedSurahIdx] = useState(0);
  const [scrambledVerses, setScrambledVerses] = useState<{ text: string; originalIdx: number }[]>([]);
  const [solvedVerses, setSolvedVerses] = useState<string[]>([]);
  const [nextExpectedIdx, setNextExpectedIdx] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Initialize or change Surah
  const initSurahPuzzle = (surahIdx: number) => {
    setSelectedSurahIdx(surahIdx);
    const surah = SURAHS[surahIdx];
    const versesWithIndices = surah.verses.map((text, idx) => ({ text, originalIdx: idx }));
    // Shuffle
    const shuffled = [...versesWithIndices].sort(() => 0.5 - Math.random());
    setScrambledVerses(shuffled);
    setSolvedVerses([]);
    setNextExpectedIdx(0);
    setElapsedTime(0);
    setMistakes(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setShowHint(false);
    gameAudio.playClick();
  };

  // Stopwatch timer
  useEffect(() => {
    if (!isPlaying || isCompleted) return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isCompleted]);

  const handleSelectVerse = (item: { text: string; originalIdx: number }) => {
    if (isCompleted) return;

    if (item.originalIdx === nextExpectedIdx) {
      // Correct verse in sequence!
      gameAudio.playSnap();
      setSolvedVerses((prev) => [...prev, item.text]);
      setScrambledVerses((prev) => prev.filter((v) => v.originalIdx !== item.originalIdx));
      const nextIdx = nextExpectedIdx + 1;
      setNextExpectedIdx(nextIdx);
      setShowHint(false);

      // Check if Surah complete
      if (nextIdx >= SURAHS[selectedSurahIdx].verses.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        gameAudio.playVictory();
      }
    } else {
      // Wrong verse chosen!
      gameAudio.playWrong();
      setMistakes((prev) => prev + 1);
      setShakeId(item.originalIdx);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    gameAudio.playPowerup();
  };

  const activeSurah = SURAHS[selectedSurahIdx];
  const nextTargetVerse = activeSurah.verses[nextExpectedIdx];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#060D17] text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto font-['Tajawal',sans-serif] select-none"
      dir="rtl"
    >
      {/* Header Cluster */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm">
            📖
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activeSurah.name}</span>
              <span className="text-xs text-amber-400 font-normal">({activeSurah.revelation})</span>
            </div>
            <div className="text-[11px] text-slate-400">سباق ترتيب الآيات والسور الذهبي</div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#0A1626] border border-slate-800 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="tabular-nums font-bold text-emerald-400">{elapsedTime}</span>
            <span>ثانية</span>
          </div>

          <div className="text-xs text-slate-300 bg-[#0A1626] border border-slate-800 rounded-lg px-3 py-1.5">
            <span>المنجز: </span>
            <span className="tabular-nums font-bold text-teal-400">{solvedVerses.length}</span>
            <span> / {activeSurah.verses.length}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const muted = gameAudio.toggleMute();
                setIsMuted(muted);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onExit}
              className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300"
              aria-label="خروج"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      {!isPlaying && !isCompleted ? (
        /* SURAH SELECTOR SCREEN */
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              اختر سورة للبدء في سباق الترتيب
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              اختبر حفظك وسرعة استحضارك لآيات كتاب الله الكريم بترتيب الآيات المبعثرة قبل انتهاء الوقت!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {SURAHS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => initSurahPuzzle(idx)}
                className="p-4 rounded-xl bg-[#091522] border border-slate-800 hover:border-emerald-500/60 hover:bg-[#0D2033] transition-all text-right group flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold">{s.revelation}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">
                    {s.verses.length}
                  </span>
                </div>
                <div>
                  <div className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{s.verses.length} آيات</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : !isCompleted ? (
        /* ACTIVE PLAYING VIEW */
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between py-4">
          {/* Target Prompt / Clue */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span>ابحث عن الآية رقم:</span>
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold">
                {nextExpectedIdx + 1}
              </span>
            </div>

            <button
              onClick={handleShowHint}
              disabled={showHint}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/40 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'كُشف التلميح' : 'تلميح (أول كلمة)'}</span>
            </button>
          </div>

          {/* Hint banner */}
          {showHint && nextTargetVerse && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">
              💡 تبدأ الآية التالية بكلمة: «
              <span className="font-bold underline">{nextTargetVerse.split(' ')[0]}</span>»
            </div>
          )}

          {/* Solved Verses Container (Flowing scroll) */}
          <div className="bg-[#091522] border border-emerald-500/30 rounded-2xl p-5 mb-4 shadow-lg min-h-[140px] max-h-[220px] overflow-y-auto">
            <div className="text-xs text-emerald-400 font-semibold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>الآيات المرتبة بالترتيب الصحيح:</span>
            </div>
            {solvedVerses.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 italic">
                انقر على الآية الأولى من البطاقات المبعثرة بالأسفل لتبدأ الترتيب...
              </div>
            ) : (
              <div className="space-y-2 text-right">
                {solvedVerses.map((v, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3 text-emerald-100 font-['Amiri',serif] text-base leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-sans font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrambled Verses Cards */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-xs text-slate-400 mb-2 font-medium">
              اختر الآية التالية من البطاقات أدناه:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scrambledVerses.map((item) => {
                const isShaking = shakeId === item.originalIdx;
                return (
                  <button
                    key={item.originalIdx}
                    onClick={() => handleSelectVerse(item)}
                    className={`p-3.5 rounded-xl text-right transition-all border font-['Amiri',serif] text-base sm:text-lg leading-relaxed shadow-md ${
                      isShaking
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
                        : 'bg-[#0B1A2C] border-slate-700/80 hover:border-teal-500 hover:bg-[#0E223A] text-slate-200 cursor-pointer active:scale-95'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* COMPLETION CELEBRATION VIEW */
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl mb-4 border border-emerald-500/40">
            🌟
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">أحسنت! أتممت السورة بنجاح!</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            ما شاء الله لا قوة إلا بالله! قمت بترتيب آيات {activeSurah.name} بإتقان تام.
          </p>

          <div className="w-full bg-[#091522] border border-slate-800 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">الوقت المستغرق</div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">{elapsedTime} ثانية</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">الأخطاء أثناء الترتيب</div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">{mistakes}</div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => initSurahPuzzle(selectedSurahIdx)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة المحاولة لتحسين وقتك</span>
            </button>
            <button
              onClick={() => setIsPlaying(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              اختيار سورة أخرى
            </button>
            <button
              onClick={onExit}
              className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
            >
              العودة إلى واحة الألعاب
            </button>
          </div>
        </div>
      )}

      {/* Footer subtle attribution */}
      <div className="w-full max-w-4xl mx-auto text-center text-[11px] text-slate-400/80 pt-2 border-t border-slate-900">
        أكاديمية نور وبيان · حفظ وتدبر وتجويد القرآن الكريم
      </div>
    </div>
  );
};
