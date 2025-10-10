import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Notification as NotificationType } from '../../src/store/useNotificationStore.js';
import * as Icons from '../Icons.js';

interface NotificationProps {
  notification: NotificationType;
  onRemove: (id: string) => void;
}

const notificationVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.5,
    transition: { duration: 0.1 },
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 },
  },
};

const Notification: React.FC<NotificationProps> = ({ notification, onRemove }) => {
  const { id, message, type } = notification;

  const Icon = type === 'success' ? Icons.PokeballIcon : Icons.WarningIcon;

  return (
    <motion.div
      variants={notificationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className="relative w-full max-w-sm p-4 pr-8 mb-4 overflow-hidden text-gray-800 bg-white border-4 border-gray-800 shadow-lg pointer-events-auto"
      style={{
        clipPath:
          'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="font-bold text-md">{message}</p>
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onRemove(id)}
            className="flex items-center justify-center w-6 h-6 text-gray-500 bg-transparent rounded-full hover:text-gray-700 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Notification;