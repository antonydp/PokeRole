import React from 'react';
import { AnimatePresence } from 'framer-motion';
import useNotificationStore from '../../src/store/useNotificationStore.js';
import Notification from './Notification.js';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6">
      <div className="w-full max-w-sm">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationContainer;