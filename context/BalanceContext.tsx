// context/BalanceContext.tsx
import React, { createContext, useContext, useState } from 'react';

type BalanceContextType = {
  balance: number;
  setBalance: (val: number) => void;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(100); // Default balance

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>{children}</BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) throw new Error('useBalance must be used within BalanceProvider');
  return context;
};
