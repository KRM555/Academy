import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadingManager, LoadingState } from '../services/loadingManager';

interface LoadingContextValue extends LoadingState {
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LoadingState>(loadingManager.getState());

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const value: LoadingContextValue = {
    ...state,
    startLoading: () => loadingManager.startApiCall(),
    stopLoading: () => loadingManager.endApiCall(),
    withLoading: (promise) => loadingManager.withLoading(promise),
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
