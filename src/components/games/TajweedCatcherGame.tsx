import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gameAudio } from '../../utils/gameAudio';
import { Volume2, VolumeX, Pause, Play, RotateCcw, X, Shield, Zap, Sparkles, Award } from 'lucide-react';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

interface RoundRule {
  id: number;
  name: string;
  category: string;
  description: string;
  targetLetters: string[];
  distractorLetters: string[];
  targetToClear: number;
}

const ROUNDS: RoundRule[] = [
  {
    id: 1,
    name: 'حروف الإظهار الحلقي',
    category: 'أحكام النون الساكنة والتنوين',
    description: 'التقط حروف الحلق الستة: الهمزة، الهاء، العين، الحاء، الغين، الخاء',
    targetLetters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    distractorLetters: ['ب', 'ت', 'ث', 'ج', 'د', 'ر', 'ز', 'س'],
    targetToClear: 10,
  },
  {
    id: 2,
    name: 'حروف القلقلة (قُطْبُ جَدّ)',
    category: 'صفات الحروف والتجويد',
    description: 'التقط حروف القلقلة الخمسة عند السكون: القاف، الطاء، الباء، الجيم، الدال',
    targetLetters: ['ق', 'ط', 'ب', 'ج', 'د'],
    distractorLetters: ['ك', 'ت', 'ف', 'ص', 'م', 'ن', 'ل', 'و'],
    targetToClear: 12,
  },
  {
    id: 3,
    name: 'حروف الإدغام بغُنّة (يَنْمُو)',
    category: 'أحكام النون الساكنة والتنوين',
    description: 'التقط حروف الإدغام بغنة: الياء، النون، الميم، الواو',
    targetLetters: ['ي', 'ن', 'م', 'و'],
    distractorLetters: ['ل', 'ر', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ'],
    targetToClear: 14,
  },
  {
    id: 4,
    name: 'حروف التفخيم والاستعلاء (خُصَّ ضَغْطٍ قِظْ)',
    category: 'مراتب التفخيم',
    description: 'التقط الحروف المفخمة دائماً: الخاء، الصاد، الضاد، الغين، الطاء، القاف، الظاء',
    targetLetters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'],
    distractorLetters: ['أ', 'ت', 'ث', 'ح', 'د', 'ذ', 'ز', 'س', 'ف', 'ك'],
    targetToClear: 15,
  },
];

interface FallingItem {
  id: number;
  letter: string;
  isTarget: boolean;
  isPowerup?: 'shield' | 'slowmo' | 'magnet';
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  hue: number;
  glow: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

interface TajweedCatcherGameProps {
  onExit: () => void;
}

export const TajweedCatcherGame: React.FC<TajweedCatcherGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-level UI state (only changes on state-machine transitions)
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(gameAudio.getMuted());
  const [highScore, setHighScore] = useState(0);

  // Active power-up indicators
  const [hasShield, setHasShield] = useState(false);
  const [slowMoActive, setSlowMoActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);

  // Ref mirror for low-latency canvas game loop (keeps 60fps loop independent of React render cycle)
  const loopStateRef = useRef({
    gameState: 'TITLE_MENU' as GameState,
    currentRoundIdx: 0,
    score: 0,
    lives: 3,
    combo: 0,
    collectedCount: 0,
    hasShield: false,
    slowMoActive: false,
    slowMoTimer: 0,
    magnetActive: false,
    magnetTimer: 0,
    cameraShake: { x: 0, y: 0, intensity: 0 },
    hitstop: 0,
    player: {
      x: 400,
      y: 650,
      width: 84,
      height: 38,
      vx: 0,
      targetX: 400,
      squash: 1,
      stretch: 1,
    },
    items: [] as FallingItem[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    keysHeld: { left: false, right: false, boost: false },
    lastTimestamp: 0,
    spawnTimer: 0,
    canvasWidth: 800,
    canvasHeight: 700,
  });

  // Load High Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tajweed_catcher_highscore');
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      }
    } catch {}
  }, []);

  const saveHighScore = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('tajweed_catcher_highscore', String(finalScore));
      } catch {}
    }
  };

  // Sync state machine updates with ref mirror
  const transitionToState = useCallback((nextState: GameState) => {
    loopStateRef.current.gameState = nextState;
    setGameState(nextState);
    if (nextState === 'PLAYING') {
      gameAudio.playClick();
    } else if (nextState === 'GAME_OVER') {
      gameAudio.playGameOver();
      saveHighScore(loopStateRef.current.score);
    } else if (nextState === 'VICTORY') {
      gameAudio.playVictory();
      saveHighScore(loopStateRef.current.score);
    }
  }, [highScore]);

  // Handle Audio toggle
  const toggleAudio = () => {
    const muted = gameAudio.toggleMute();
    setIsMuted(muted);
  };

  // Reset or Start New Game
  const startNewGame = (roundIdx = 0) => {
    const s = loopStateRef.current;
    s.currentRoundIdx = roundIdx;
    s.score = 0;
    s.lives = 3;
    s.combo = 0;
    s.collectedCount = 0;
    s.hasShield = false;
    s.slowMoActive = false;
    s.slowMoTimer = 0;
    s.magnetActive = false;
    s.magnetTimer = 0;
    s.items = [];
    s.particles = [];
    s.floatingTexts = [];
    s.player.x = s.canvasWidth / 2;
    s.player.vx = 0;
    s.player.targetX = s.canvasWidth / 2;

    setCurrentRoundIdx(roundIdx);
    setScore(0);
    setLives(3);
    setCombo(0);
    setCollectedCount(0);
    setHasShield(false);
    setSlowMoActive(false);
    setMagnetActive(false);

    transitionToState('PLAYING');
  };

  // Advance to Next Round
  const startNextRound = () => {
    const nextIdx = loopStateRef.current.currentRoundIdx + 1;
    if (nextIdx >= ROUNDS.length) {
      transitionToState('VICTORY');
      return;
    }
    const s = loopStateRef.current;
    s.currentRoundIdx = nextIdx;
    s.collectedCount = 0;
    s.items = [];
    s.particles = [];
    s.floatingTexts = [];

    setCurrentRoundIdx(nextIdx);
    setCollectedCount(0);
    transitionToState('PLAYING');
  };

  // Keyboard Event Handlers (Held inputs vs edge triggers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = loopStateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.keysHeld.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.keysHeld.right = true;
      }
      if (e.key === ' ') {
        s.keysHeld.boost = true;
        if (s.gameState === 'TITLE_MENU') {
          startNewGame(0);
        }
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (s.gameState === 'PLAYING') {
          transitionToState('PAUSED');
        } else if (s.gameState === 'PAUSED') {
          transitionToState('PLAYING');
        }
      }
      if (e.key === 'Enter') {
        if (s.gameState === 'TITLE_MENU' || s.gameState === 'GAME_OVER') {
          startNewGame(0);
        } else if (s.gameState === 'VICTORY') {
          startNewGame(0);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = loopStateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.keysHeld.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.keysHeld.right = false;
      }
      if (e.key === ' ') {
        s.keysHeld.boost = false;
      }
    };

    const handleBlur = () => {
      const s = loopStateRef.current;
      s.keysHeld.left = false;
      s.keysHeld.right = false;
      s.keysHeld.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [transitionToState]);

  // Pointer/Touch drag movement
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    loopStateRef.current.player.targetX = x;
  };

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      loopStateRef.current.canvasWidth = width;
      loopStateRef.current.canvasHeight = height;
      loopStateRef.current.player.y = height - 60;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Burst Spawner
    const spawnParticles = (x: number, y: number, color: string, count = 16) => {
      const s = loopStateRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 5.0;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          maxLife: 1.0,
          color,
          size: 2.5 + Math.random() * 3.5,
        });
      }
    };

    // Floating text feedback (+100, COMBO x3)
    const addFloatingText = (text: string, x: number, y: number, color: string) => {
      loopStateRef.current.floatingTexts.push({
        id: Math.random(),
        text,
        x,
        y,
        life: 1.0,
        color,
      });
    };

    // Item Spawner
    let nextItemId = 1;
    const spawnItem = (width: number) => {
      const s = loopStateRef.current;
      const currentRound = ROUNDS[s.currentRoundIdx] || ROUNDS[0];

      // 10% chance of celestial powerup
      const isPowerupChance = Math.random() < 0.09;
      if (isPowerupChance) {
        const types: ('shield' | 'slowmo' | 'magnet')[] = ['shield', 'slowmo', 'magnet'];
        const selectedType = types[Math.floor(Math.random() * types.length)];
        const labels = { shield: 'درع', slowmo: 'نور', magnet: 'جذب' };
        s.items.push({
          id: nextItemId++,
          letter: labels[selectedType],
          isTarget: true,
          isPowerup: selectedType,
          x: 40 + Math.random() * (width - 80),
          y: -25,
          radius: 20,
          vy: 2.2 + Math.random() * 1.0,
          vx: (Math.random() - 0.5) * 0.8,
          hue: selectedType === 'shield' ? 45 : selectedType === 'slowmo' ? 190 : 280,
          glow: 15,
        });
        return;
      }

      // 60% Target Rule Letter, 40% Distractor Letter
      const isTarget = Math.random() < 0.62;
      const letters = isTarget ? currentRound.targetLetters : currentRound.distractorLetters;
      const chosenLetter = letters[Math.floor(Math.random() * letters.length)];

      s.items.push({
        id: nextItemId++,
        letter: chosenLetter,
        isTarget,
        x: 40 + Math.random() * (width - 80),
        y: -25,
        radius: 22,
        vy: (2.4 + s.currentRoundIdx * 0.35 + Math.random() * 1.2) * (s.slowMoActive ? 0.45 : 1.0),
        vx: (Math.random() - 0.5) * 0.6,
        hue: isTarget ? 150 : 340,
        glow: isTarget ? 18 : 6,
      });
    };

    // 60FPS Frame Render
    const renderLoop = (timestamp: number) => {
      const s = loopStateRef.current;

      // Delta Time Clamping (avoid large jumps when tab switches or pauses)
      if (!s.lastTimestamp) s.lastTimestamp = timestamp;
      const rawDt = (timestamp - s.lastTimestamp) / 1000;
      const dt = Math.min(rawDt, 0.05);
      s.lastTimestamp = timestamp;

      // Hitstop logic (freeze frame for punchy impact)
      if (s.hitstop > 0) {
        s.hitstop -= dt;
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      const w = s.canvasWidth;
      const h = s.canvasHeight;

      // 1. Update Game Physics if Playing
      if (s.gameState === 'PLAYING') {
        // Power-up timers
        if (s.slowMoTimer > 0) {
          s.slowMoTimer -= dt;
          if (s.slowMoTimer <= 0) {
            s.slowMoActive = false;
            setSlowMoActive(false);
          }
        }
        if (s.magnetTimer > 0) {
          s.magnetTimer -= dt;
          if (s.magnetTimer <= 0) {
            s.magnetActive = false;
            setMagnetActive(false);
          }
        }

        // Camera shake decay
        if (s.cameraShake.intensity > 0) {
          s.cameraShake.intensity = Math.max(0, s.cameraShake.intensity - dt * 25);
          s.cameraShake.x = (Math.random() - 0.5) * s.cameraShake.intensity;
          s.cameraShake.y = (Math.random() - 0.5) * s.cameraShake.intensity;
        } else {
          s.cameraShake.x = 0;
          s.cameraShake.y = 0;
        }

        // Player movement
        const moveSpeed = s.keysHeld.boost ? 850 : 540;
        if (s.keysHeld.left) {
          s.player.vx = -moveSpeed;
        } else if (s.keysHeld.right) {
          s.player.vx = moveSpeed;
        } else {
          // Smooth follow towards pointer target
          const dx = s.player.targetX - s.player.x;
          s.player.vx = dx * 8.5;
        }

        s.player.x += s.player.vx * dt;
        // Clamp to screen bounds
        const halfWidth = s.player.width / 2;
        if (s.player.x < halfWidth) s.player.x = halfWidth;
        if (s.player.x > w - halfWidth) s.player.x = w - halfWidth;

        // Squash and stretch decay back to 1.0
        s.player.squash += (1.0 - s.player.squash) * 0.15;
        s.player.stretch += (1.0 - s.player.stretch) * 0.15;

        // Spawn items
        s.spawnTimer += dt;
        const spawnInterval = Math.max(0.65, 1.25 - s.currentRoundIdx * 0.15);
        if (s.spawnTimer > spawnInterval) {
          s.spawnTimer = 0;
          spawnItem(w);
        }

        // Update items & collisions
        const currentRound = ROUNDS[s.currentRoundIdx] || ROUNDS[0];
        const survivingItems: FallingItem[] = [];

        for (let i = 0; i < s.items.length; i++) {
          const item = s.items[i];
          const speedMultiplier = s.slowMoActive ? 0.45 : 1.0;

          // Magnet pull effect
          if (s.magnetActive && item.isTarget) {
            const dx = s.player.x - item.x;
            item.vx += dx * 0.05;
          }

          item.y += item.vy * speedMultiplier;
          item.x += item.vx;

          // Check collision with player vessel
          const py = s.player.y;
          const px = s.player.x;
          const pw = s.player.width;
          const ph = s.player.height;

          const collides =
            item.x >= px - pw / 2 - item.radius &&
            item.x <= px + pw / 2 + item.radius &&
            item.y >= py - ph / 2 - item.radius &&
            item.y <= py + ph / 2 + item.radius;

          if (collides) {
            // Collision handling!
            if (item.isPowerup) {
              gameAudio.playPowerup();
              if (item.isPowerup === 'shield') {
                s.hasShield = true;
                setHasShield(true);
                addFloatingText('درع الحفظ!', item.x, item.y, '#FBBF24');
              } else if (item.isPowerup === 'slowmo') {
                s.slowMoActive = true;
                s.slowMoTimer = 6.0;
                setSlowMoActive(true);
                addFloatingText('نور البصيرة!', item.x, item.y, '#38BDF8');
              } else if (item.isPowerup === 'magnet') {
                s.magnetActive = true;
                s.magnetTimer = 5.0;
                setMagnetActive(true);
                addFloatingText('مغناطيس التجويد!', item.x, item.y, '#C084FC');
              }
              spawnParticles(item.x, item.y, '#FCD34D', 20);
            } else if (item.isTarget) {
              // Correct Tajweed rule letter caught!
              s.combo += 1;
              const points = 100 * Math.min(s.combo, 5);
              s.score += points;
              s.collectedCount += 1;

              // Audio & feel
              gameAudio.playCatch(Math.min(s.combo, 4));
              spawnParticles(item.x, item.y, '#34D399', 18);
              addFloatingText(`+${points} (${s.combo}x)`, item.x, item.y - 10, '#34D399');

              // Vessel squash-stretch reaction
              s.player.squash = 1.25;
              s.player.stretch = 0.8;

              // Round victory condition
              if (s.collectedCount >= currentRound.targetToClear) {
                gameAudio.playVictory();
                s.hitstop = 0.08;
                if (s.currentRoundIdx + 1 < ROUNDS.length) {
                  // Next round
                  s.currentRoundIdx += 1;
                  s.collectedCount = 0;
                  setCurrentRoundIdx(s.currentRoundIdx);
                  setCollectedCount(0);
                  addFloatingText('جولة مكتملة! أحسنت!', w / 2, h / 2, '#F59E0B');
                } else {
                  transitionToState('VICTORY');
                }
              }

              // Update React UI states
              setScore(s.score);
              setCombo(s.combo);
              setCollectedCount(s.collectedCount);
            } else {
              // Wrong letter caught!
              if (s.hasShield) {
                // Shield saves
                s.hasShield = false;
                setHasShield(false);
                gameAudio.playWrong();
                s.cameraShake.intensity = 8;
                spawnParticles(item.x, item.y, '#FBBF24', 16);
                addFloatingText('انكسر الدرع!', item.x, item.y, '#FBBF24');
              } else {
                s.combo = 0;
                s.lives -= 1;
                s.cameraShake.intensity = 15;
                s.hitstop = 0.05;
                gameAudio.playWrong();
                spawnParticles(item.x, item.y, '#F87171', 20);
                addFloatingText('خطأ! -قلب', item.x, item.y, '#F87171');

                setCombo(0);
                setLives(s.lives);

                if (s.lives <= 0) {
                  transitionToState('GAME_OVER');
                }
              }
            }
          } else if (item.y > h + item.radius) {
            // Item fell off screen
            // If target letter was missed, softly break combo without taking life
            if (item.isTarget && !item.isPowerup && s.combo > 3) {
              s.combo = Math.max(1, s.combo - 1);
              setCombo(s.combo);
            }
          } else {
            survivingItems.push(item);
          }
        }
        s.items = survivingItems;

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // subtle gravity
          p.life -= dt * 2.2;
          if (p.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // Update floating texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= 35 * dt;
          ft.life -= dt * 1.5;
          if (ft.life <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }
      }

      // 2. Clear Screen & Draw Background with Camera Shake
      ctx.save();
      ctx.translate(s.cameraShake.x, s.cameraShake.y);

      // Deep celestial midnight gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#040914');
      bgGrad.addColorStop(0.65, '#081726');
      bgGrad.addColorStop(1, '#0C2238');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      // Distant stars / sacred geometry background dots
      ctx.fillStyle = 'rgba(240, 246, 255, 0.4)';
      const starSeed = Math.floor(w / 40);
      for (let i = 0; i < starSeed; i++) {
        const sx = ((i * 137.5) % (w - 20)) + 10;
        const sy = ((i * 89.3 + (timestamp * 0.015)) % h);
        const sSize = (i % 3 === 0) ? 1.8 : 1.0;
        ctx.beginPath();
        ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Decorative soft cosmic crescent moon in background
      ctx.save();
      ctx.translate(w - 90, 80);
      ctx.shadowColor = 'rgba(217, 119, 6, 0.35)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = 'rgba(253, 230, 138, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060E1A';
      ctx.beginPath();
      ctx.arc(14, -8, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Draw Falling Items
      for (let i = 0; i < s.items.length; i++) {
        const item = s.items[i];
        ctx.save();
        ctx.translate(item.x, item.y);

        // Glow ring
        ctx.shadowColor = item.isPowerup
          ? `hsl(${item.hue}, 90%, 65%)`
          : item.isTarget
          ? 'rgba(52, 211, 153, 0.7)'
          : 'rgba(248, 113, 113, 0.5)';
        ctx.shadowBlur = item.glow;

        // Orb body
        const orbGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, item.radius);
        if (item.isPowerup) {
          orbGrad.addColorStop(0, '#FFFFFF');
          orbGrad.addColorStop(0.7, `hsl(${item.hue}, 85%, 60%)`);
          orbGrad.addColorStop(1, `hsl(${item.hue}, 90%, 40%)`);
        } else if (item.isTarget) {
          orbGrad.addColorStop(0, '#ECFDF5');
          orbGrad.addColorStop(0.6, '#10B981');
          orbGrad.addColorStop(1, '#065F46');
        } else {
          orbGrad.addColorStop(0, '#FEF2F2');
          orbGrad.addColorStop(0.6, '#EF4444');
          orbGrad.addColorStop(1, '#7F1D1D');
        }

        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();

        // Orb border
        ctx.strokeStyle = item.isTarget ? '#6EE7B7' : '#FCA5A5';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Arabic Letter / Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = item.isPowerup ? 'bold 12px Tajawal, sans-serif' : 'bold 22px "Amiri", "Traditional Arabic", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.letter, 0, 1);

        ctx.restore();
      }

      // 4. Draw Particles
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw Player Vessel ("سفينة النور")
      const p = s.player;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.squash, p.stretch);

      // Shield Aura
      if (s.hasShield) {
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.width * 0.72, p.height * 1.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Magnet Aura
      if (s.magnetActive) {
        ctx.save();
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.width * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Ship thruster glow
      ctx.fillStyle = 'rgba(13, 148, 136, 0.8)';
      ctx.shadowColor = '#0D9488';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(-16, p.height / 2);
      ctx.lineTo(0, p.height / 2 + 18 + Math.random() * 8);
      ctx.lineTo(16, p.height / 2);
      ctx.closePath();
      ctx.fill();

      // Vessel Hull - Aerodynamic celestial wing
      const shipGrad = ctx.createLinearGradient(-p.width / 2, 0, p.width / 2, 0);
      shipGrad.addColorStop(0, '#0F766E');
      shipGrad.addColorStop(0.5, '#2DD4BF');
      shipGrad.addColorStop(1, '#0F766E');

      ctx.fillStyle = shipGrad;
      ctx.beginPath();
      ctx.moveTo(0, -p.height / 2 - 4);
      ctx.quadraticCurveTo(p.width / 2, -4, p.width / 2, p.height / 2);
      ctx.lineTo(-p.width / 2, p.height / 2);
      ctx.quadraticCurveTo(-p.width / 2, -4, 0, -p.height / 2 - 4);
      ctx.closePath();
      ctx.fill();

      // Golden Trim & Cockpit Gem
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 6. Draw Floating Texts
      for (let i = 0; i < s.floatingTexts.length; i++) {
        const ft = s.floatingTexts[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 16px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // Restore camera shake

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const activeRound = ROUNDS[currentRoundIdx] || ROUNDS[0];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#040914] text-white select-none overflow-hidden font-['Tajawal',sans-serif]"
      dir="rtl"
    >
      {/* 60FPS Canvas Layer */}
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* World-Matched, Low-Occlusion HUD Overlay (≥85% of playfield unobstructed) */}
      {gameState === 'PLAYING' && (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          {/* Top Status Perimeter */}
          <div className="flex items-center justify-between gap-4">
            {/* Target Rule Objective Cluster */}
            <div className="pointer-events-auto bg-[#0A1626]/85 border border-emerald-500/30 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {activeRound.id}
              </div>
              <div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {activeRound.category}
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeRound.name}</span>
                  <span className="text-xs text-amber-300 font-normal">
                    [{activeRound.targetLetters.join(' · ')}]
                  </span>
                </div>
              </div>
            </div>

            {/* Score & Progress Cluster */}
            <div className="flex items-center gap-3">
              {/* Progress bar to clear round */}
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="text-[11px] text-slate-300">
                  التقدم: <span className="tabular-nums font-bold text-emerald-400">{collectedCount}</span> / {activeRound.targetToClear}
                </div>
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                    style={{ width: `${Math.min(100, (collectedCount / activeRound.targetToClear) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Integer Score cluster */}
              <div className="bg-[#0A1626]/85 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <span className="text-[11px] text-slate-400">النقاط:</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">{score}</span>
              </div>

              {/* Combo multiplier */}
              {combo > 1 && (
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-300 animate-pulse tabular-nums">
                  {combo}x كومبو!
                </div>
              )}

              {/* Lives Heart cluster */}
              <div className="bg-[#0A1626]/85 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                {[1, 2, 3].map((heart) => (
                  <span
                    key={heart}
                    className={`text-base transition-opacity ${
                      heart <= lives ? 'text-rose-500 opacity-100 scale-100' : 'text-slate-600 opacity-40'
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>

              {/* Controls: Audio mute, Pause, Exit */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  onClick={toggleAudio}
                  aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => transitionToState('PAUSED')}
                  aria-label="إيقاف مؤقت"
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={onExit}
                  aria-label="خروج"
                  className="p-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Powerups Indicator */}
          <div className="flex items-center gap-2">
            {hasShield && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs font-medium text-amber-300">
                <Shield className="w-3.5 h-3.5" />
                <span>درع الحفظ نَشِط</span>
              </div>
            )}
            {slowMoActive && (
              <div className="flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/50 rounded-lg px-2.5 py-1 text-xs font-medium text-sky-300">
                <Zap className="w-3.5 h-3.5" />
                <span>نور البصيرة (تبطيء)</span>
              </div>
            )}
            {magnetActive && (
              <div className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/50 rounded-lg px-2.5 py-1 text-xs font-medium text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مغناطيس التجويد</span>
              </div>
            )}
          </div>

          {/* Bottom subtle flat control-hint line */}
          <div className="text-center text-[11px] text-slate-400/80 select-none">
            ← → أو A / D للتحرك · حرك الفأرة أو اللمس للتوجيه · مسافة لتعزيز السرعة · Esc للإيقاف
          </div>
        </div>
      )}

      {/* TITLE SCREEN MODAL (Full Viewport, bespoke SVG lockup, negative space, Start CTA) */}
      {gameState === 'TITLE_MENU' && (
        <div className="absolute inset-0 bg-[#040914]/90 backdrop-blur-md flex items-center justify-center p-6 z-20">
          <div className="max-w-md w-full bg-[#081525] border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl relative">
            <button
              onClick={onExit}
              className="absolute top-4 left-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bespoke inline SVG Title Lockup */}
            <div className="flex justify-center mb-4">
              <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" stroke="#0D9488" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M50 15 L58 40 L85 45 L62 60 L70 85 L50 70 L30 85 L38 60 L15 45 L42 40 Z" fill="url(#starGrad)" />
                <circle cx="50" cy="50" r="16" fill="#040914" stroke="#F59E0B" strokeWidth="2" />
                <text x="50" y="55" fill="#F59E0B" fontSize="16" fontFamily="Amiri" fontWeight="bold" textAnchor="middle">ت</text>
                <defs>
                  <linearGradient id="starGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2DD4BF" />
                    <stop offset="1" stopColor="#0F766E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              صائد التجويد ونور الحروف
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              لعبة أركيد تفاعلية بزمن حقيقي (60 إطاراً في الثانية). تحكّم في سفينة النور والتقط الحروف المطابقة لحكم التجويد المطلوب وتجنب الحروف الخاطئة!
            </p>

            {/* Rules Overview */}
            <div className="bg-[#050D17] border border-slate-800 rounded-xl p-4 mb-6 text-right space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>كيف تلعب:</span>
              </div>
              <p className="text-slate-300">
                1. اقرأ حكم التجويد في أعلى الشاشة (مثلاً: حروف الإظهار، حروف القلقلة).
              </p>
              <p className="text-slate-300">
                2. التقط الكرات الخضراء المضيئة التي تحمل الحروف المطلوبة لزيادة رصيدك ومضاعف الكومبو.
              </p>
              <p className="text-slate-300">
                3. تجنب الكرات الحمراء الخاطئة لتحافظ على القلوب ودرعك.
              </p>
            </div>

            {/* High Score readout */}
            {highScore > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400 mb-6 font-medium">
                <Award className="w-4 h-4" />
                <span>أعلى رقم قياسي محقق: <span className="tabular-nums font-bold">{highScore}</span> نقطة</span>
              </div>
            )}

            {/* Primary Start CTA */}
            <button
              onClick={() => startNewGame(0)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ابدأ التحدي الآن (Enter / Space)</span>
            </button>

            {/* Flat control hint line */}
            <div className="mt-4 text-[11px] text-slate-400">
              ← → أو A / D للتحرك · مسافة للشحن · Esc للإيقاف
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 bg-[#040914]/85 backdrop-blur-sm flex items-center justify-center p-6 z-20">
          <div className="max-w-sm w-full bg-[#081525] border border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">اللعبة متوقفة مؤقتاً</h2>
            <div className="space-y-3">
              <button
                onClick={() => transitionToState('PLAYING')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>متابعة اللعب</span>
              </button>
              <button
                onClick={() => startNewGame(currentRoundIdx)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الجولة الحالية</span>
              </button>
              <button
                onClick={toggleAudio}
                className="w-full py-2 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}</span>
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 font-medium text-sm transition-colors"
              >
                الخروج لواحة الألعاب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-[#040914]/90 backdrop-blur-md flex items-center justify-center p-6 z-20">
          <div className="max-w-md w-full bg-[#081525] border border-rose-900/50 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 text-3xl">
              💔
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">انتهت المحاولة!</h2>
            <p className="text-xs text-slate-300 mb-6">
              جهد رائع! التكرار هو مفتاح إتقان أحكام التجويد وتلاوة القرآن الكريم.
            </p>

            <div className="grid grid-cols-2 gap-3 bg-[#050D17] border border-slate-800 rounded-xl p-4 mb-6">
              <div>
                <div className="text-[11px] text-slate-400 mb-1">النقاط المحققة</div>
                <div className="text-xl font-bold text-amber-400 tabular-nums">{score}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 mb-1">الجولة التي وصلت إليها</div>
                <div className="text-xl font-bold text-emerald-400">الجولة {activeRound.id}</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => startNewGame(0)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                <span>حاول مرة أخرى (Enter)</span>
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
              >
                العودة إلى واحة الألعاب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 bg-[#040914]/90 backdrop-blur-md flex items-center justify-center p-6 z-20">
          <div className="max-w-md w-full bg-[#081525] border border-amber-500/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-3xl">
              🏆
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">مبارك! أتممت جميع الجولات!</h2>
            <p className="text-xs text-slate-300 mb-6">
              ما شاء الله! أتقنت صيد حروف الإظهار والقلقلة والإدغام والتفخيم بدقة متناهية.
            </p>

            <div className="bg-[#050D17] border border-slate-800 rounded-xl p-4 mb-6">
              <div className="text-xs text-slate-400 mb-1">الرصيد النهائي</div>
              <div className="text-3xl font-extrabold text-amber-400 tabular-nums mb-2">{score}</div>
              <div className="text-xs text-emerald-400">أنت الآن فارس من فرسان التجويد المتقنين!</div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => startNewGame(0)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>العب جولة جديدة (Enter)</span>
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
              >
                العودة إلى واحة الألعاب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
