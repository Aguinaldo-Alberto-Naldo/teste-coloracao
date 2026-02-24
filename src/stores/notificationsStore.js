import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export const useNotificationsStore = create((set, get) => ({
    notifications: [],
    loading: false,
    unreadCount: 0,

    loadNotifications: async (userId) => {
        if (!userId) return;
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const unread = data.filter(n => !n.is_read).length;
            set({ notifications: data || [], unreadCount: unread });
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;

            set(state => {
                const updated = state.notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                );
                return {
                    notifications: updated,
                    unreadCount: updated.filter(n => !n.is_read).length
                };
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    markAllAsRead: async (userId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;

            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    },

    sendNotification: async (data) => {
        try {
            const { data: insertedData, error } = await supabase
                .from('notifications')
                .insert([data])
                .select()
                .single();

            if (error) throw error;
            return insertedData;
        } catch (error) {
            console.error("Error sending notification:", error);
            throw error;
        }
    }
}));
