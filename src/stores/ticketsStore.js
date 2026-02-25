import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useTicketsStore = create((set, get) => ({
    tickets: [],
    loading: false,

    loadTickets: async (userId) => {
        set({ loading: true });
        console.log("[ticketsStore] loadTickets called", { userId });

        // 1. Fetch tickets and replies
        let query = supabase
            .from('tickets')
            .select('*, ticket_replies(*)')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: ticketsData, error: ticketsError } = await query;
        if (ticketsError) {
            console.error("[ticketsStore] Error fetching tickets:", ticketsError);
            set({ loading: false });
            return;
        }

        // 2. Identify all unique user IDs (ticket owners + reply senders)
        const allUserIds = new Set();
        (ticketsData || []).forEach(ticket => {
            if (ticket.user_id) allUserIds.add(ticket.user_id);
            (ticket.ticket_replies || []).forEach(reply => {
                if (reply.sender_id) allUserIds.add(reply.sender_id);
            });
        });

        const userIdsArray = Array.from(allUserIds);
        console.log(`[ticketsStore] Unique users in tickets/replies: ${userIdsArray.length}`);

        // 3. Fetch all relevant profiles
        let profilesMap = {};
        if (userIdsArray.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role')
                .in('id', userIdsArray);

            if (profilesError) {
                console.error("[ticketsStore] Error fetching profiles for tickets:", profilesError);
            } else {
                profilesMap = (profilesData || []).reduce((acc, p) => {
                    acc[p.id] = p;
                    return acc;
                }, {});
            }
        }

        // 4. Merge profile data and sort replies
        const enrichedTickets = (ticketsData || []).map(ticket => ({
            ...ticket,
            user_profile: profilesMap[ticket.user_id] || null,
            ticket_replies: (ticket.ticket_replies || [])
                .map(reply => ({
                    ...reply,
                    sender_profile: profilesMap[reply.sender_id] || null
                }))
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        }));

        console.log(`[ticketsStore] enrichedTickets success. Count: ${enrichedTickets.length}`);
        set({ tickets: enrichedTickets, loading: false });
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

        // Fetch sender profile for the new reply to keep UI consistent
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('id', senderId)
            .single();

        set(state => ({
            tickets: state.tickets.map(t => {
                if (t.id === ticketId) {
                    const enrichedReply = {
                        ...data,
                        sender_profile: profile || null
                    };
                    return {
                        ...t,
                        ticket_replies: [...(t.ticket_replies || []), enrichedReply]
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
