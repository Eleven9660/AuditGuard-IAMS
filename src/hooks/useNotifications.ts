import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

type Notification = Schema['Notification']['type'];
type CreateNotificationInput = Schema['Notification']['createType'];
type UpdateNotificationInput = Schema['Notification']['updateType'];

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (userId) {
        result = await client.models.Notification.list({
          filter: { userId: { eq: userId } }
        });
      } else {
        result = await client.models.Notification.list();
      }

      if (result.errors) {
        setError(result.errors.map(e => e.message).join(', '));
      } else {
        // Sort by date, newest first
        const sorted = result.data.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        setNotifications(sorted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const createNotification = async (input: Omit<CreateNotificationInput, 'id'>) => {
    try {
      const { data, errors } = await client.models.Notification.create({
        ...input,
        date: new Date().toISOString(),
        read: false,
      });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setNotifications(prev => [data, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
      throw err;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data, errors } = await client.models.Notification.update({
        id,
        read: true,
      });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      if (data) {
        setNotifications(prev => prev.map(n => n.id === id ? data : n));
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n =>
          client.models.Notification.update({ id: n.id, read: true })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
      throw err;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { errors } = await client.models.Notification.delete({ id });
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      throw err;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
