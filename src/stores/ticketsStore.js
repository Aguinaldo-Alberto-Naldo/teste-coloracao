import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useTicketsStore = create((set, get) => ({
    tickets: [],
    loading: false,

    loadTickets: async (userId) => {
        set({ loading: true });
        let query = supabase
            .from('tickets')
            .select('*, ticket_replies(*)')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (!error) {
            // Sort replies by creation date for each ticket
            const ticketsWithSortedReplies = data.map(ticket => ({
                ...ticket,
                ticket_replies: (ticket.ticket_replies || []).sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                )
            }));
            set({ tickets: ticketsWithSortedReplies });
        }
        set({ loading: false });
    },

    createTicket: async (userId, userEmail, subject, message) => {
        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                user_id: userId,
                user_email: userEmail,
                subject,
                message,
                status: 'open'
            }])
            .select()
            .single();

        if (error) throw error;
        set(state => ({ tickets: [{ ...data, ticket_replies: [] }, ...state.tickets] }));
        return data;
    },

    addReply: async (ticketId, senderId, text, isFromAdmin = false) => {
        const { data, error } = await supabase
            .from('ticket_replies')
            .insert([{
                ticket_id: ticketId,
                sender_id: senderId,
                text,
                is_from_admin: isFromAdmin
            }])
            .select()
            .single();

        if (error) throw error;

        // Send notification to the user if the reply is from an admin
        if (isFromAdmin) {
            const ticket = get().tickets.find(t => t.id === ticketId);
            if (ticket) {
                const { supabase } = await import("../lib/supabase");
                await supabase.from('notifications').insert([{
                    user_id: ticket.user_id,
                    title: "Nova resposta ao seu ticket",
                    message: `O suporte respondeu ao ticket: ${ticket.subject}`,
                    type: 'ticket',
                    link: '/support'
                }]);
            }
        }

        set(state => ({
            tickets: state.tickets.map(t => {
                if (t.id === ticketId) {
                    return {
                        ...t,
                        ticket_replies: [...(t.ticket_replies || []), data]
                    };
                }
                return t;
            })
        }));
    },

    updateStatus: async (ticketId, newStatus) => {
        const { error } = await supabase
            .from('tickets')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticketId);

        if (error) throw error;

        set(state => ({
            tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
        }));
    },

    deleteTicket: async (ticketId) => {
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', ticketId);

        if (!error) {
            set(state => ({
                tickets: state.tickets.filter(t => t.id !== ticketId)
            }));
        }
    }
}));
