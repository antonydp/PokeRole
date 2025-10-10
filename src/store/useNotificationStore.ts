import { create } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = crypto.randomUUID();
    const newNotification = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

export default useNotificationStore;