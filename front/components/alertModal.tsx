'use client';

import React from 'react';

interface AlertModalProps {
  message: string; // Mensagem que será exibida
  onClose: () => void; // Função chamada ao clicar em OK
  isOpen: boolean; // Controla se o modal está visível
}

const AlertModal: React.FC<AlertModalProps> = ({
  message,
  onClose,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-80 animate-fadeIn">
        <p className="text-gray-800 text-base mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
