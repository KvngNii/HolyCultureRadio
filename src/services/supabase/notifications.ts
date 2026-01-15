/**
 * Holy Culture Radio - Notifications Service
 * Handle user notifications using Supabase
 */

import { supabase } from '../../lib/supabase';
import type { Notification } from '../../lib/database.types';

class NotificationsService {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get notifications error:', error);
      throw error;
    }

    return {
      data: data as Notification[],
      page,
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      hasNext: offset + limit < (count || 0),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Get unread count error:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Delete all notifications error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
