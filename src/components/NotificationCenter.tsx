import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  recipient: string;
  sender?: { _id: string; firstName: string; lastName: string; email: string; };
  message: string;
  type: 'mission_assigned' | 'status_update' | 'new_message' | 'system' | 'quote_response' | 'report_created' | 'report_sent';
  isRead: boolean;
  relatedEntity?: {
    id: string;
    type: 'Mission' | 'Quote' | 'Request' | 'Report';
  };
  createdAt: string;
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await apiService.notifications.getMy();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors du chargement des notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket && user) {
      const handleNewNotification = (notification: Notification) => {
        if (notification.recipient === user._id) {
          setNotifications(prev => [notification, ...prev]);
          toast.info(notification.message, {
            icon: '🔔',
            duration: 5000,
          });
        }
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [socket, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await apiService.notifications.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.notifications.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await apiService.notifications.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mission_assigned': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'status_update': return <Info className="w-5 h-5 text-blue-500" />;
      case 'new_message': return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'system': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Tout marquer lu
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => markAsRead(notification._id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-gray-600 mt-1 ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(notification.createdAt).toLocaleString('fr-FR')}
                            </div>
                            {notification.relatedEntity && (
                              <span className="text-xs text-blue-600">
                                {notification.relatedEntity.type} {notification.relatedEntity.id}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification._id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
