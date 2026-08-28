/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: 1,
    title: "Your order is on the way",
    message: "Driver has started the route to your address.",
    read: false,
  },
  {
    id: 2,
    title: "Flash deal unlocked",
    message: "Use code RUCHIGO50 for extra savings today.",
    read: true,
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const addNotification = (notification) => {
    setNotifications((current) => [
      {
        id: Date.now(),
        ...notification,
        read: false,
      },
      ...current,
    ]);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markAllAsRead,
      addNotification,
    }),
    [notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
