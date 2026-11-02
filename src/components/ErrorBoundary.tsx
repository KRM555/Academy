import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  currentLanguage?: 'ar' | 'en';
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unexpected runtime error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error || new Error('Unknown error'), this.handleReset);
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine language from prop or document element
      const isAr =
        this.props.currentLanguage === 'ar' ||
        (typeof document !== 'undefined' && document.documentElement.lang === 'ar') ||
        true;

      return (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="min-h-[500px] flex items-center justify-center p-6 bg-[#FAF9F6] dark:bg-[#070E18] text-[#0F2942] dark:text-slate-100 transition-colors"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#0B1522] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#0F2942] dark:text-white">
                {isAr ? 'عذراً، حدث خطأ غير متوقع' : 'Oops! An unexpected error occurred'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'نعتذر عن هذا العطل المؤقت. لم يتمكن النظام من تحميل هذه الصفحة بشكل سليم، يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.'
                  : 'We apologize for this temporary interruption. The page failed to render properly. You can try refreshing or return to the home page.'}
              </p>
            </div>

            {/* Error snippet if available (safe, non-leaking) */}
            {this.state.error && (
              <div className="text-left bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 overflow-x-auto max-h-24">
                <span className="font-semibold text-rose-500">Error:</span> {this.state.error.message || 'Unknown error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isAr ? 'إعادة المحاولة' : 'Try Again'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F2942] dark:text-white font-medium text-sm transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Home className="w-4 h-4" />
                <span>{isAr ? 'الصفحة الرئيسية' : 'Home'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isAr
                  ? 'أكاديمية نور وبيان التعليمية • منصة تعليمية آمنة'
                  : 'Noor & Bayan Academy • Secure Learning Platform'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
