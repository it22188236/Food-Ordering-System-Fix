import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import DOMPurify from 'dompurify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5041/api/notifications');
      // Sanitize data before setting state
      const sanitized = res.data.map(n => ({
        ...n,
        title: DOMPurify.sanitize(n.title),
        message: DOMPurify.sanitize(n.message)
      }));
      setNotifications(sanitized);
      updateUnreadCount(sanitized);
    } catch (err) {
      console.error(err);
    }
  };

  // Update unread count
  const updateUnreadCount = (notifs) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(`http://localhost:5041/`, {
        withCredentials: true
      });
      
      newSocket.emit('joinUserRoom', user._id);
      
      newSocket.on('newNotification', (notification) => {
        // Sanitize new notification
        const safeNotification = {
          ...notification,
          title: DOMPurify.sanitize(notification.title),
          message: DOMPurify.sanitize(notification.message)
        };

        setNotifications(prev => [safeNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show native browser notification
        if (Notification.permission === 'granted') {
          new Notification(safeNotification.title, {
            body: safeNotification.message
          });
        }
      });

      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
