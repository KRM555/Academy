import React, { useState, useEffect } from 'react';
import { gameAudio } from '../../utils/gameAudio';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Clock,
  Award,
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  category: 'الفلك والكون' | 'علم الأجنة والطب' | 'علوم الأرض والبحار' | 'النبات والحياة' | 'رواد الحضارة والعلوم';
  ayah: string;
  surahRef: string;
  question: string;
  options: string[];
  correctIndex: number;
  scientificInsight: string;
  hint: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'الفلك والكون',
    ayah: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ',
    surahRef: 'سورة الذاريات: 47',
    question: 'إلى أي حقيقة كونية حديثة اكتشفها إدوين هابل عام 1929 تشير هذه الآية الكريمة بدقة بالغة؟',
    options: [
      'تمدد الكون المستمر وتباعد المجرات',
      'ثبات حجم الكون الأزلي',
      'اقتراب النجوم من الأرض',
      'تغير لون الفضاء الخارجي',
    ],
    correctIndex: 0,
    scientificInsight:
      'أكد علم الفلك الحديث ونظرية النسبية أن الكون في حالة تمدد واتساع مستمر (Expanding Universe)، وهو ما صرح به القرآن بلفظ «وَإِنَّا لَمُوسِعُونَ» بصيغة اسم الفاعل الدال على الاستمرار منذ أكثر من 14 قرناً.',
    hint: 'فكر في حركة المجرات وتباعدها المستمر في الفضاء الفسيح.',
  },
  {
    id: 2,
    category: 'علوم الأرض والبحار',
    ayah: 'وَالْجِبَالَ أَوْتَادًا',
    surahRef: 'سورة النبأ: 7',
    question: 'ما هو التفسير الجيولوجي الحديث لوصف الجبال بـ "الأوتاد"؟',
    options: [
      'أن الجبال تحتوي على جذور غائرة في طبقات الأرض تفوق ارتفاعها الظاهر لتثبيت القشرة',
      'أن الجبال مصنوعة من الخشب كالأوتاد',
      'أن الجبال تتحرك مع الرياح',
      'أن الجبال مجوفة من الداخل',
    ],
    correctIndex: 0,
    scientificInsight:
      'أثبتت الجيولوجيا ونظرية توازن القشرة الأرضية (Isostasy) أن لكل جبل جذر يمتد في الوشاح الأرضي إلى عمق يصل لعدة أضعاف ارتفاعه الخارجي، تماماً كما يغوص الوتد في الأرض لتثبيت الخيمة.',
    hint: 'الوتد يغرس الجزء الأكبر منه تحت الأرض لتثبيت ما فوقه.',
  },
  {
    id: 3,
    category: 'علوم الأرض والبحار',
    ayah: 'مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ * بَيْنَهُمَا بَرْزَخٌ لَّا يَبْغِيَانِ',
    surahRef: 'سورة الرحمن: 19-20',
    question: 'ما هي الظاهرة البحرية الفيزيائية التي تمنع اختلاط مياه البحار المتجاورة؟',
    options: [
      'وجود حاجز مائي غير مرئي ناتج عن تباين الكثافة والملوحة والحرارة',
      'وجود جدار صخري صناعي في قاع البحر',
      'وجود مجاري هوائية تعزل الماء',
      'تجمد مياه البحار في نقطة الالتقاء',
    ],
    correctIndex: 0,
    scientificInsight:
      'اكتشف علماء المحيطات أن عند التقاء مياه بحرين (مثل البحر الأبيض والمتوسط مع المحيط الأطلسي)، ينشأ حاجز مائي مائل يسمى (Front / Pycnocline) ناتج عن اختلاف الكثافة والملوحة والحرارة، يحفظ خصائص كل بحر دون أن يطغى أحدهما على الآخر.',
    hint: 'اختلاف الكثافة ونسبة الملوحة يخلق حاجزاً طبيعياً بين المائين.',
  },
  {
    id: 4,
    category: 'علم الأجنة والطب',
    ayah: 'ثُمَّ خَلَقْنَا النُّطْفَةَ عَلَقَةً فَخَلَقْنَا الْعَلَقَةَ مُضْغَةً',
    surahRef: 'سورة المؤمنون: 14',
    question: 'لماذا سُميت مرحلة الجنين الأولى في الرحم بـ "العلقة" بحسب علماء الأجنة؟',
    options: [
      'لأن الجنين يتعلق بجدار الرحم ويشبه دودة العلق شكلاً وتغذية على الدم',
      'لأن الجنين يستطيع المشي داخل الرحم',
      'لأن الجنين يكون شفافاً كالهواء',
      'لأن الجنين ينام معلقاً في الهواء',
    ],
    correctIndex: 0,
    scientificInsight:
      'أكد البروفيسور كيث مور (عالم الأجنة الكندي الشهير) أن وصف "العلقة" معجزة علمية دقيقة، فالجنين في اليوم 24 يتعلق بجدار الرحم، ويشبه في منظره المجهري دودة العلق الطبي (Leech)، ويتغذى على دماء المشيمة.',
    hint: 'تذكر دودة العلق الطبية وكيفية تشبث الجنين بجدار رحم الأم.',
  },
  {
    id: 5,
    category: 'الفلك والكون',
    ayah: 'لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ سَابِقُ النَّهَارِ ۚ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ',
    surahRef: 'سورة يس: 40',
    question: 'ما الذي عبر عنه القرآن بكلمة "يَسْبَحُونَ" لوصف حركة الأجرام السماوية؟',
    options: [
      'الحركة الانسيابية المدارية الخاصة بكل كوكب ونجم في الفضاء',
      'أن الفضاء مملوء بماء سائل كالبحار',
      'أن الأجرام تتوقف عن الحركة في الليل',
      'أن القمر ثابت والشمس فقط من تدور',
    ],
    correctIndex: 0,
    scientificInsight:
      'التعبير القرآني بـ "يسبحون" يتطابق مع الميكانيكا المدارية؛ فالأجرام السماوية لا تسقط في فراغ مطلق بل تتحرك في مدارات منحنية بفعل قوى الجاذبية وحقول انحناء الزمكان، كأنها تسبح في سائل كوني.',
    hint: 'السباحة تدل على انسيابية الحركة داخل مسار محدد ومحكوم.',
  },
  {
    id: 6,
    category: 'النبات والحياة',
    ayah: 'وَأَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ فَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً',
    surahRef: 'سورة الحجر: 22',
    question: 'ما هما الوظيفتان التلقيحيتان للرياح اللتان أثبتهما العلم الحديث؟',
    options: [
      'تلقيح النباتات بنقل حبوب اللقاح، وتلقيح السحب بنوى التكاثف لتساقط المطر',
      'تغيير ألوان الأزهار وتدفئة الجو فقط',
      'تنظيف أوراق الأشجار من الغبار فقط',
      'طرد الحشرات الضارة بعيداً عن الأشجار فقط',
    ],
    correctIndex: 0,
    scientificInsight:
      'الرياح تلقح الأزهار بنقل حبوب اللقاح بين النباتات، وتلقح ذرات السحب بذرات الملح والهباء الجوي (نوى التكاثف Condensation Nuclei) التي تسمح لقطرات الماء بالتجمع والتساقط مطراً.',
    hint: 'الرياح تنقل أشياء دقيقة بين النباتات وتساعد على تجمع بخار الماء في السحب.',
  },
  {
    id: 7,
    category: 'رواد الحضارة والعلوم',
    ayah: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ',
    surahRef: 'سورة الزمر: 9',
    question: 'مَن هو العالم المسلم الملقب بـ "أمير البصريات" ومؤسس المنهج العلمي التجريبي وكتاب "المناظر"؟',
    options: [
      'الحسن بن الهيثم',
      'جابر بن حيان',
      'أبو بكر الرازي',
      'ابن النفيس',
    ],
    correctIndex: 0,
    scientificInsight:
      'الحسن بن الهيثم هو رائد علم البصريات الذي أبطل النظرية اليونانية القديمة وأثبت أن الضوء ينعكس من الأجسام إلى العين وليس العكس، واخترع القُمرة (Camera Obscura) وأسس قواعد المنهج التجريبي الصارم.',
    hint: 'عالم عاش في البصرة والقاهرة وفسر كيف نرى الأشياء عبر انعكاس الضوء.',
  },
  {
    id: 8,
    category: 'رواد الحضارة والعلوم',
    ayah: 'وَأَحْصَىٰ كُلَّ شَيْءٍ عَدَدًا',
    surahRef: 'سورة الجن: 28',
    question: 'أي عالم مسلم اخترع علم الجبر وابتكر نظام الخوارزميات (Algorithms) الذي تعمل به كل برمجيات اليوم؟',
    options: [
      'محمد بن موسى الخوارزمي',
      'البيروني',
      'عمر الخيام',
      'الكندي',
    ],
    correctIndex: 0,
    scientificInsight:
      'ألف الخوارزمي كتاب "المختصر في حساب الجبر والمقابلة" وقد اشتق اسم الجبر (Algebra) من كتابه، واسم الخوارزميات (Algorithms) من اسمه، وهو واضع أسس الحوسبة الرقمية الحديثة.',
    hint: 'اسمه مأخوذ مباشرة في المصطلح الإنجليزي Algorithms.',
  },
];

interface ScienceQuranQuizGameProps {
  onExit: () => void;
}

export const ScienceQuranQuizGame: React.FC<ScienceQuranQuizGameProps> = ({ onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerFrozen, setTimerFrozen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Lifelines
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [lifelineFreezeUsed, setLifelineFreezeUsed] = useState(false);
  const [lifelineHintUsed, setLifelineHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('science_quran_highscore');
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  const saveHighScore = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('science_quran_highscore', String(finalScore));
      } catch {}
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isAnswerRevealed || isGameOver || timerFrozen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time ran out!
          handleSelectAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswerRevealed, isGameOver, timerFrozen]);

  const handleSelectAnswer = (idx: number) => {
    if (isAnswerRevealed) return;

    setSelectedAnswer(idx);
    setIsAnswerRevealed(true);

    const question = QUESTIONS[currentIdx];
    const isCorrect = idx === question.correctIndex;

    if (isCorrect) {
      const multiplier = streak >= 3 ? 3 : streak >= 1 ? 2 : 1;
      const points = (100 + timeLeft * 5) * multiplier;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      gameAudio.playCatch(multiplier);
    } else {
      setStreak(0);
      gameAudio.playWrong();
    }
  };

  const handleNextQuestion = () => {
    gameAudio.playClick();
    if (currentIdx + 1 >= QUESTIONS.length) {
      setIsGameOver(true);
      gameAudio.playVictory();
      saveHighScore(score);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setTimeLeft(30);
      setTimerFrozen(false);
      setHiddenOptions([]);
      setShowHint(false);
    }
  };

  // Lifelines handlers
  const useLifeline5050 = () => {
    if (lifeline5050Used || isAnswerRevealed) return;
    setLifeline5050Used(true);
    gameAudio.playPowerup();

    const question = QUESTIONS[currentIdx];
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== question.correctIndex);
    // Shuffle and pick 2 to eliminate
    const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toEliminate);
  };

  const useLifelineFreeze = () => {
    if (lifelineFreezeUsed || isAnswerRevealed) return;
    setLifelineFreezeUsed(true);
    setTimerFrozen(true);
    gameAudio.playPowerup();
  };

  const useLifelineHint = () => {
    if (lifelineHintUsed || isAnswerRevealed) return;
    setLifelineHintUsed(true);
    setShowHint(true);
    gameAudio.playPowerup();
  };

  const restartQuiz = () => {
    gameAudio.playClick();
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setTimerFrozen(false);
    setIsGameOver(false);
    setLifeline5050Used(false);
    setLifelineFreezeUsed(false);
    setLifelineHintUsed(false);
    setHiddenOptions([]);
    setShowHint(false);
  };

  const currentQ = QUESTIONS[currentIdx];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#060D17] text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto font-['Tajawal',sans-serif] select-none"
      dir="rtl"
    >
      {/* Top Header Cluster */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-sm">
            {currentIdx + 1}/{QUESTIONS.length}
          </div>
          <div>
            <div className="text-[11px] text-teal-400 font-semibold">{currentQ.category}</div>
            <div className="text-xs text-slate-400">تحدي فرسان القرآن والعلوم</div>
          </div>
        </div>

        {/* Score & Streak cluster */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">النقاط:</div>
            <div className="text-lg font-bold text-amber-400 tabular-nums">{score}</div>
          </div>

          {streak > 1 && (
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 animate-pulse">
              {streak}x متتالية!
            </div>
          )}

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

      {/* Main Body Quest */}
      {!isGameOver ? (
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center py-4">
          {/* Lifelines Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">وسائل المساعدة:</span>
              <button
                onClick={useLifeline5050}
                disabled={lifeline5050Used || isAnswerRevealed}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  lifeline5050Used
                    ? 'bg-slate-800/40 border-slate-800 text-slate-600 line-through cursor-not-allowed'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 cursor-pointer'
                }`}
              >
                حذف إجابتين (50:50)
              </button>
              <button
                onClick={useLifelineFreeze}
                disabled={lifelineFreezeUsed || isAnswerRevealed}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                  lifelineFreezeUsed
                    ? 'bg-slate-800/40 border-slate-800 text-slate-600 line-through cursor-not-allowed'
                    : 'bg-sky-950/40 border-sky-500/40 text-sky-400 hover:bg-sky-900/40 cursor-pointer'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timerFrozen ? 'الوقت مجمد!' : 'تجميد الوقت'}</span>
              </button>
              <button
                onClick={useLifelineHint}
                disabled={lifelineHintUsed || isAnswerRevealed}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                  lifelineHintUsed
                    ? 'bg-slate-800/40 border-slate-800 text-slate-600 line-through cursor-not-allowed'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-400 hover:bg-amber-900/40 cursor-pointer'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>تلميح علمي</span>
              </button>
            </div>

            {/* Timer Readout */}
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${timeLeft <= 8 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
              <span
                className={`text-sm font-bold tabular-nums ${
                  timeLeft <= 8 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {timerFrozen ? 'مجمّد' : `${timeLeft} ثانية`}
              </span>
            </div>
          </div>

          {/* Hint Card if unlocked */}
          {showHint && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold">تلميح مساعد: </span>
                <span>{currentQ.hint}</span>
              </div>
            </div>
          )}

          {/* Quranic Ayah Card with golden calligraphic frame */}
          <div className="bg-[#091522] border border-amber-500/30 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="text-xs text-amber-400 font-semibold mb-2">
              ﴿ {currentQ.surahRef} ﴾
            </div>
            <blockquote className="text-lg sm:text-2xl font-bold text-amber-200 leading-relaxed font-['Amiri',serif]">
              "{currentQ.ayah}"
            </blockquote>
          </div>

          {/* The Question */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentQ.options.map((opt, idx) => {
              const isHidden = hiddenOptions.includes(idx);
              if (isHidden) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-dashed border-slate-800 text-slate-700 bg-transparent text-sm flex items-center justify-center opacity-40 select-none"
                  >
                    (إجابة مستبعدة 50:50)
                  </div>
                );
              }

              let stateStyle = 'bg-[#0A1626] border-slate-800 hover:border-teal-500/60 hover:bg-[#0D1E32] text-slate-200';

              if (isAnswerRevealed) {
                if (idx === currentQ.correctIndex) {
                  stateStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                } else if (idx === selectedAnswer) {
                  stateStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  stateStyle = 'bg-[#0A1626]/40 border-slate-900 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswerRevealed}
                  className={`p-4 rounded-xl border text-right transition-all text-sm leading-relaxed flex items-center justify-between gap-3 shadow-md ${stateStyle}`}
                >
                  <span className="flex-1">{opt}</span>
                  {isAnswerRevealed && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerRevealed && idx === selectedAnswer && idx !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scientific Insight Card upon answer reveal */}
          {isAnswerRevealed && (
            <div className="bg-[#08192A] border border-teal-500/40 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4" />
                <span>البيان العلمي الموثق:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                {currentQ.scientificInsight}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>السؤال التالي</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GAME OVER / RESULTS */
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-4xl mb-4 border border-amber-500/30">
            🏆
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">اكتمل التحدي بنجاح!</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            ما شاء الله! قمت برحلة استكشافية ماتعة بين آيات القرآن الكريم وفتوحات العلم التجريبي وعلماء الحضارة الإسلامية.
          </p>

          <div className="w-full bg-[#091522] border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="text-xs text-slate-400 mb-1">الرصيد الإجمالي</div>
            <div className="text-3xl font-extrabold text-amber-400 tabular-nums mb-2">{score}</div>
            <div className="text-xs text-emerald-400 font-medium">
              لقب الفارس: {score >= 1200 ? 'عالم وباحث موسوعي' : score >= 800 ? 'فارس الاستكشاف القرآني' : 'طالب علم نجيب'}
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={restartQuiz}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار بأسئلة أخرى</span>
            </button>
            <button
              onClick={onExit}
              className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
            >
              العودة إلى واحة الألعاب
            </button>
          </div>
        </div>
      )}

      {/* Footer subtle attribution */}
      <div className="w-full max-w-4xl mx-auto text-center text-[11px] text-slate-400/80 pt-2 border-t border-slate-900">
        أكاديمية نور وبيان للقرآن والعلوم · مادة علمية وتفسيرية موثقة
      </div>
    </div>
  );
};
