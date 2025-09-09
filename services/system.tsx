import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { SystemMode } from '../types';

interface SystemContextType {
  isSystemLocked: boolean;
  systemMode: SystemMode;
  toggleSystemLock: () => void;
  setSystemMode: (mode: SystemMode) => void;
}

export const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSystemLocked, setIsSystemLocked] = useState<boolean>(false);
  const [systemMode, setSystemMode] = useState<SystemMode>('live');

  const toggleSystemLock = useCallback(() => {
    setIsSystemLocked(prev => !prev);
  }, []);
  
  const handleSetSystemMode = useCallback((mode: SystemMode) => {
    setSystemMode(mode);
  }, []);

  const value = useMemo(() => ({
    isSystemLocked,
    systemMode,
    toggleSystemLock,
    setSystemMode: handleSetSystemMode
  }), [isSystemLocked, systemMode, toggleSystemLock, handleSetSystemMode]);

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = (): SystemContextType => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};