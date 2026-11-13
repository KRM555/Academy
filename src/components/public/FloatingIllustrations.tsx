import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FloatingProps {
  className?: string;
  variant?: 'book' | 'pencil' | 'star' | 'crescent' | 'all';
}

/**
 * High-performance, lightweight floating educational illustrations
 * Respects prefers-reduced-motion automatically.
 */
export const FloatingIllustrations: React.FC<FloatingProps> = ({
  className = '',
  variant = 'all',
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Floating animation definition
  const floatAnim1 = shouldReduceMotion
    ? {}
    : {
        y: [0, -8, 0],
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  const floatAnim2 = shouldReduceMotion
    ? {}
    : {
        y: [0, 9, 0],
        rotate: [0, -3, 3, 0],
        transition: {
          duration: 6.2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 0.8,
        },
      };

  const floatAnim3 = shouldReduceMotion
    ? {}
    : {
        y: [0, -6, 0],
        scale: [1, 1.05, 1],
        transition: {
          duration: 4.4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 1.5,
        },
      };

  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Floating Open Quran / Book */}
      {(variant === 'all' || variant === 'book') && (
        <motion.div
          animate={floatAnim1}
          className="absolute top-12 left-6 sm:left-14 opacity-25 dark:opacity-20 text-emerald-600 dark:text-emerald-400"
        >
          <svg className="w-8 h-8 sm:w-11 sm:h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
            <path d="M6 14h6" />
          </svg>
        </motion.div>
      )}

      {/* 2. Floating Pencil / Traditional Reed Pen (Qalam) */}
      {(variant === 'all' || variant === 'pencil') && (
        <motion.div
          animate={floatAnim2}
          className="absolute bottom-16 right-8 sm:right-20 opacity-20 dark:opacity-15 text-amber-500 dark:text-amber-400"
        >
          <svg className="w-7 h-7 sm:w-10 sm:h-10 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </motion.div>
      )}

      {/* 3. Islamic 8-Pointed Star / Star of Excellence */}
      {(variant === 'all' || variant === 'star') && (
        <motion.div
          animate={floatAnim3}
          className="absolute top-28 right-10 sm:right-28 opacity-25 dark:opacity-20 text-amber-500 dark:text-amber-300"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" />
          </svg>
        </motion.div>
      )}

      {/* 4. Little Crescent / Noor Accent */}
      {(variant === 'all' || variant === 'crescent') && (
        <motion.div
          animate={floatAnim1}
          className="absolute bottom-24 left-10 sm:left-24 opacity-20 dark:opacity-15 text-teal-600 dark:text-teal-400"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
