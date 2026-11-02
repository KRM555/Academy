import React, { useEffect, useState } from 'react';
import { loadingManager, LoadingState } from '../services/loadingManager';
import { Language } from '../data/translations';
import { Loader2 } from 'lucide-react';

interface GlobalLoadingIndicatorProps {
  currentLanguage?: Language;
}

export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  currentLanguage = 'ar',
}) => {
  const [state, setState] = useState<LoadingState>(loadingManager.getState());
  const [isLongOperation, setIsLongOperation] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Show a quiet indicator if an API operation takes longer than 600ms
  useEffect(() => {
    let timer: number | null = null;
    if (state.activeRequests > 0) {
      timer = window.setTimeout(() => {
        setIsLongOperation(true);
      }, 600);
    } else {
      setIsLongOperation(false);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [state.activeRequests]);

  const isRtl = currentLanguage === 'ar';
  const { progress, visible, activeRequests } = state;

  return (
    <>
      {/* Primary Top Bar Indicator (Zero layout shift, fixed top) */}
      <div
        className={`fixed top-0 inset-x-0 z-[9999] pointer-events-none transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={isRtl ? 'جارٍ تحميل الصفحة والبيانات' : 'Loading page and data'}
      >
        <div
          className={`relative h-[3.5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-400 dark:to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.6),0_0_20px_rgba(245,158,11,0.35)] transition-all ease-out ${
            progress === 100 ? 'duration-150' : 'duration-300'
          }`}
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            marginRight: isRtl ? '0' : 'auto',
            marginLeft: isRtl ? 'auto' : '0',
          }}
        >
          {/* Subtle luminous runner spark at leading edge */}
          <div
            className={`absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/50 to-white/90 dark:via-white/70 dark:to-white blur-[1px] pointer-events-none ${
              isRtl ? 'left-0 rotate-180' : 'right-0'
            }`}
          />
        </div>
      </div>

      {/* Floating Micro-Feedback for Long Network Operations (>600ms) */}
      <div
        aria-hidden={!isLongOperation}
        className={`fixed bottom-5 ${
          isRtl ? 'left-5' : 'right-5'
        } z-[9990] pointer-events-none transition-all duration-300 transform ${
          isLongOperation && visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#0F1B2B]/95 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-lg border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
          <Loader2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <span>
            {isRtl ? 'جارٍ تحديث البيانات...' : 'Synchronizing data...'}
          </span>
          {activeRequests > 1 && (
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 tabular-nums">
              ({activeRequests})
            </span>
          )}
        </div>
      </div>
    </>
  );
};
