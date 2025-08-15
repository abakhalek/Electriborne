import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001', {
        query: { userId: user.id },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket.IO connected', newSocket.id);
        toast.success('Connecté aux notifications en temps réel.');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        toast.error('Déconnecté des notifications en temps réel.');
      });

      newSocket.on('newNotification', (notification) => {
        console.log('New notification received:', notification);
        toast.info(notification.message, {
          icon: '🔔',
          duration: 5000,
        });
        // Optionally, trigger a re-fetch of notifications in Profile.tsx or update a global state
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (!isAuthenticated && socket) {
      // Disconnect if user logs out
      socket.disconnect();
      setSocket(null);
    }
  }, [isAuthenticated, user]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};