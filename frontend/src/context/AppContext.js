import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [appMode, setAppMode] = useState('client'); // 'client' or 'admin'

  const toggleMode = () => {
    setAppMode(prev => prev === 'client' ? 'admin' : 'client');
  };

  return (
    <AppContext.Provider value={{ appMode, toggleMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext); 