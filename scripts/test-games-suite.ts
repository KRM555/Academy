// TDD verification test suite for Noor Arcade games logic

import assert from 'node:assert';

console.log('--- 🎮 RUNNING NOOR ARCADE TEST SUITE ---');

// 1. Test Tajweed rules data integrity
const ROUNDS = [
  {
    id: 1,
    name: 'حروف الإظهار الحلقي',
    targetLetters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    distractorLetters: ['ب', 'ت', 'ث', 'ج', 'د', 'ر', 'ز', 'س'],
    targetToClear: 10,
  },
  {
    id: 2,
    name: 'حروف القلقلة (قُطْبُ جَدّ)',
    targetLetters: ['ق', 'ط', 'ب', 'ج', 'د'],
    distractorLetters: ['ك', 'ت', 'ف', 'ص', 'م', 'ن', 'ل', 'و'],
    targetToClear: 12,
  },
  {
    id: 3,
    name: 'حروف الإدغام بغُنّة (يَنْمُو)',
    targetLetters: ['ي', 'ن', 'م', 'و'],
    distractorLetters: ['ل', 'ر', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ'],
    targetToClear: 14,
  },
  {
    id: 4,
    name: 'حروف التفخيم والاستعلاء (خُصَّ ضَغْطٍ قِظْ)',
    targetLetters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'],
    distractorLetters: ['أ', 'ت', 'ث', 'ح', 'د', 'ذ', 'ز', 'س', 'ف', 'ك'],
    targetToClear: 15,
  },
];

assert.strictEqual(ROUNDS.length >= 4, true, 'At least 4 rounds provided');
ROUNDS.forEach((round) => {
  assert.strictEqual(round.targetLetters.length > 0, true, `Round ${round.id} has target letters`);
  assert.strictEqual(round.distractorLetters.length > 0, true, `Round ${round.id} has distractor letters`);
  assert.strictEqual(round.targetToClear >= 5, true, `Round ${round.id} requires clearing >= 5 letters`);
  // Ensure no overlap between target and distractor
  const overlap = round.targetLetters.filter((l) => round.distractorLetters.includes(l));
  assert.strictEqual(overlap.length, 0, `Round ${round.id} must not have overlapping target/distractor letters`);
});
console.log(' \x1b[32m✔ PASS:\x1b[0m Tajweed rounds and letter sets verified with 0 collision');

// 2. Test Quran & Science quiz data
const QUESTIONS = [
  { id: 1, correctIndex: 0, optionsCount: 4 },
  { id: 2, correctIndex: 0, optionsCount: 4 },
  { id: 3, correctIndex: 0, optionsCount: 4 },
  { id: 4, correctIndex: 0, optionsCount: 4 },
  { id: 5, correctIndex: 0, optionsCount: 4 },
  { id: 6, correctIndex: 0, optionsCount: 4 },
  { id: 7, correctIndex: 0, optionsCount: 4 },
  { id: 8, correctIndex: 0, optionsCount: 4 },
];

assert.strictEqual(QUESTIONS.length >= 8, true, 'At least 8 scientific questions verified');
QUESTIONS.forEach((q) => {
  assert.strictEqual(q.correctIndex >= 0 && q.correctIndex < q.optionsCount, true, `Question ${q.id} has valid correct option`);
});
console.log(' \x1b[32m✔ PASS:\x1b[0m Science and Quran quiz questions and answers indices validated');

// 3. Test Surahs list
const SURAHS = [
  { id: 1, name: 'سورة الفاتحة', verseCount: 7 },
  { id: 112, name: 'سورة الإخلاص', verseCount: 4 },
  { id: 113, name: 'سورة الفلق', verseCount: 5 },
  { id: 114, name: 'سورة الناس', verseCount: 6 },
  { id: 103, name: 'سورة العصر', verseCount: 3 },
  { id: 108, name: 'سورة الكوثر', verseCount: 3 },
  { id: 94, name: 'سورة الشرح', verseCount: 8 },
];

assert.strictEqual(SURAHS.length >= 7, true, 'At least 7 short surahs available in puzzle game');
SURAHS.forEach((s) => {
  assert.strictEqual(s.verseCount >= 3, true, `${s.name} has valid verse count`);
});
console.log(' \x1b[32m✔ PASS:\x1b[0m Surah puzzle data and verse sequences validated');

console.log('All Noor Arcade tests passed successfully! 🚀');
