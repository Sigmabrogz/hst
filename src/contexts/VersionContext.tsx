import React, { createContext, useContext, useState, ReactNode } from 'react';

type Version = 'v1' | 'v2';

interface VersionContextType {
  version: Version;
  setVersion: (v: Version) => void;
  isV2: boolean;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<Version>('v1');

  return (
    <VersionContext.Provider value={{ 
      version, 
      setVersion,
      isV2: version === 'v2'
    }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
}

