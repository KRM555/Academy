/**
 * Global Loading Manager for Noor & Bayan Academy
 * Coordinates visual loading state across client route transitions and API requests.
 */

type LoadingListener = (state: LoadingState) => void;

export interface LoadingState {
  isLoading: boolean;
  activeRequests: number;
  isRouteTransition: boolean;
  progress: number;
  visible: boolean;
}

class LoadingManager {
  private activeApiCalls = 0;
  private isRouteTransition = false;
  private progress = 0;
  private visible = false;
  private listeners: Set<LoadingListener> = new Set();
  private tickerInterval: number | null = null;
  private completeTimeout: number | null = null;
  private resetTimeout: number | null = null;
  private routeTransitionTimer: number | null = null;

  public getState(): LoadingState {
    return {
      isLoading: this.activeApiCalls > 0 || this.isRouteTransition,
      activeRequests: this.activeApiCalls,
      isRouteTransition: this.isRouteTransition,
      progress: this.progress,
      visible: this.visible,
    };
  }

  public subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Loading listener error:', err);
      }
    }
  }

  public startApiCall() {
    this.activeApiCalls += 1;
    this.beginProgress();
  }

  public endApiCall() {
    this.activeApiCalls = Math.max(0, this.activeApiCalls - 1);
    this.checkCompletion();
  }

  public startRouteTransition(minimumDurationMs = 280) {
    if (this.routeTransitionTimer) {
      window.clearTimeout(this.routeTransitionTimer);
      this.routeTransitionTimer = null;
    }

    this.isRouteTransition = true;
    this.beginProgress();

    this.routeTransitionTimer = window.setTimeout(() => {
      this.isRouteTransition = false;
      this.routeTransitionTimer = null;
      this.checkCompletion();
    }, minimumDurationMs);
  }

  public async withLoading<T>(promise: Promise<T>): Promise<T> {
    this.startApiCall();
    try {
      return await promise;
    } finally {
      this.endApiCall();
    }
  }

  private beginProgress() {
    // Clear any pending tear-down timeouts if new work starts
    if (this.completeTimeout) {
      window.clearTimeout(this.completeTimeout);
      this.completeTimeout = null;
    }
    if (this.resetTimeout) {
      window.clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }

    this.visible = true;
    if (this.progress === 0) {
      this.progress = 18;
    }

    if (!this.tickerInterval) {
      this.tickerInterval = window.setInterval(() => {
        if (this.progress < 35) {
          this.progress += 8;
        } else if (this.progress < 65) {
          this.progress += 4;
        } else if (this.progress < 85) {
          this.progress += 1.5;
        } else if (this.progress < 94) {
          this.progress += 0.5;
        }
        this.notify();
      }, 70);
    }

    this.notify();
  }

  private checkCompletion() {
    const stillBusy = this.activeApiCalls > 0 || this.isRouteTransition;
    if (!stillBusy) {
      this.complete();
    } else {
      this.notify();
    }
  }

  private complete() {
    if (this.tickerInterval) {
      window.clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }

    this.progress = 100;
    this.notify();

    // Give user time to see 100% completion before fading out
    this.completeTimeout = window.setTimeout(() => {
      this.visible = false;
      this.notify();

      // Reset progress after fade transition completes
      this.resetTimeout = window.setTimeout(() => {
        this.progress = 0;
        this.notify();
      }, 300);
    }, 200);
  }
}

export const loadingManager = new LoadingManager();
