'use client';

import React, { createContext, useContext, useState } from 'react';
import AlertModal from '@/components/alertModal';

interface AlertContextType {
  showAlert: (message: string) => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showAlert = (msg: string) => {
    setMessage(msg);
    setIsOpen(true);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal
        isOpen={isOpen}
        message={message}
        onClose={() => setIsOpen(false)}
      />
    </AlertContext.Provider>
  );
};

// Hook para usar facilmente em qualquer componente ou contexto
export const useAlert = () => useContext(AlertContext);
