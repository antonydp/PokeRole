import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md flex flex-col font-sans" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-poke-yellow text-center font-primary">{title}</h3>
        </div>
        <div className="p-4 text-white">
          {children}
        </div>
        <div className="p-4 flex justify-end gap-4 bg-slate-900/50 rounded-b-lg">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-poke-red text-white rounded-lg hover:bg-red-700 transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;