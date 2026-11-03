/**
 * TDD Suite for Certificate & Poster Engine
 */
import {
  generateVerificationCode,
  CERTIFICATE_THEMES,
} from '../src/utils/certificateEngine';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passCount++;
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${testName}`);
  } else {
    failCount++;
    console.error(`\x1b[31m✖ FAIL:\x1b[0m ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

console.log('\n--- 🧪 RUNNING CERTIFICATE ENGINE TDD SUITE ---');

// Test 1: Verification code format
const code1 = generateVerificationCode('عمر بن الخطاب', '2026-11-03', 'حفظ جزء عم');
assert(
  code1.startsWith('NB-QRN-2026-'),
  'Code format follows academy standard NB-QRN-YYYY-XXXX',
  `Received: ${code1}`
);

// Test 2: Deterministic verification code (same inputs = same hash)
const code2 = generateVerificationCode('عمر بن الخطاب', '2026-11-03', 'حفظ جزء عم');
assert(
  code1 === code2,
  'Verification code is deterministic for identical inputs',
  `${code1} !== ${code2}`
);

// Test 3: Sensitivity to inputs (different student name = different code)
const code3 = generateVerificationCode('فاطمة الزهراء', '2026-11-03', 'حفظ جزء عم');
assert(
  code1 !== code3,
  'Different student names generate distinct verification hashes',
  `${code1} === ${code3}`
);

// Test 4: Graceful handling of empty or blank inputs
const codeBlank = generateVerificationCode('', '', '');
assert(
  codeBlank.startsWith('NB-QRN-'),
  'Blank inputs handle gracefully without crashing or invalid format'
);

// Test 5: Themes existence & valid hex colors
const themeKeys = Object.keys(CERTIFICATE_THEMES);
assert(themeKeys.length >= 3, 'At least 3 distinct certificate themes provided');

for (const key of themeKeys) {
  const theme = CERTIFICATE_THEMES[key];
  const isValidHex = (c: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c);
  assert(
    isValidHex(theme.primaryGold) && isValidHex(theme.accentColor) && isValidHex(theme.textColor),
    `Theme "${theme.nameAr}" has valid hex color codes`
  );
}

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32mAll TDD tests passed successfully!\x1b[0m\n');
}
