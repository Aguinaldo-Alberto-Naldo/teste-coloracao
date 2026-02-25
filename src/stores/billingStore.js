import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useBillingStore = create((set, get) => ({
    packages: [],
    orders: [],
    loading: false,

    loadPackages: async () => {
        const { data, error } = await supabase
            .from('credit_packages')
            .select('*')
            .order('price', { ascending: true });

        if (!error) {
            set({ packages: data });
        }
    },

    loadOrders: async (userId) => {
        set({ loading: true });
        console.log("[billingStore] loadOrders called", { userId });

        // 1. Fetch orders
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: ordersData, error: ordersError } = await query;
        if (ordersError) {
            console.error("[billingStore] Error fetching orders in loadOrders:", ordersError);
            set({ loading: false });
            return;
        }

        // 2. Fetch profiles
        const userIds = [...new Set((ordersData || []).map(o => o.user_id))].filter(Boolean);
        let profilesMap = {};
        if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            if (!profilesError && profilesData) {
                profilesMap = profilesData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
            }
        }

        // 3. Join
        const joined = (ordersData || []).map(order => ({
            ...order,
            profiles: profilesMap[order.user_id] || null
        }));

        set({ orders: joined, loading: false });
    },

    fetchAllOrders: async () => {
        set({ loading: true });
        console.log("[billingStore] fetchAllOrders starting...");

        // 1. Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error("[billingStore] Error in fetchAllOrders (orders):", ordersError);
            set({ loading: false });
            throw ordersError;
        }

        console.log(`[billingStore] Fetched ${ordersData?.length || 0} orders.`);

        // 2. Fetch profiles
        const userIds = [...new Set((ordersData || []).map(o => o.user_id))].filter(Boolean);
        console.log(`[billingStore] Unique users: ${userIds.length}`, userIds);

        let profilesMap = {};
        if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            if (profilesError) {
                console.error("[billingStore] Error fetching profiles in fetchAllOrders:", profilesError);
            } else {
                console.log(`[billingStore] Fetched ${profilesData?.length || 0} profiles.`);
                profilesMap = (profilesData || []).reduce((acc, p) => {
                    acc[p.id] = p;
                    return acc;
                }, {});
            }
        }

        // 3. Join
        const joined = (ordersData || []).map(order => {
            const profile = profilesMap[order.user_id];
            if (!profile && order.user_id) {
                console.warn(`[billingStore] No profile found for user ${order.user_id} in order ${order.id}`);
            }
            return {
                ...order,
                profiles: profile || null
            };
        });

        console.log(`[billingStore] Final joined orders: ${joined.length}`);
        set({ orders: joined, loading: false });
        return joined;
    },

    createOrder: async (userId, packageId, receiptProof) => {
        const selectedPack = get().packages.find(p => p.id === packageId);
        if (!selectedPack) return null;

        const { data, error } = await supabase
            .from('orders')
            .insert([{
                user_id: userId,
                package_id: packageId,
                package_name: selectedPack.name,
                credits: selectedPack.credits,
                price: selectedPack.price,
                receipt_proof: receiptProof || "Comprovativo Fictício",
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        set(state => ({ orders: [data, ...state.orders] }));
        return data;
    },

    updateOrderStatus: async (orderId, newStatus) => {
        console.log(`[billingStore] Attempting to update order ${orderId} to status: ${newStatus}`);
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select();

        if (error) {
            console.error("[billingStore] Error updating order status:", error);
            throw error;
        }

        console.log("[billingStore] Supabase update response data:", data);

        let updatedOrder = data && data.length > 0 ? data[0] : null;

        if (!updatedOrder) {
            console.warn("[billingStore] No data returned from update. RLS might be preventing reading the result. Manual fallback...");
            const existingOrder = get().orders.find(o => o.id === orderId);
            if (existingOrder) {
                updatedOrder = { ...existingOrder, status: newStatus };
                console.log("[billingStore] Fallback successful. Updated local order object:", updatedOrder);
            }
        }

        if (!updatedOrder) {
            console.error("[billingStore] Critical error: could not find or update order locally.");
            throw new Error("Não foi possível encontrar ou atualizar o pedido.");
        }

        set(state => ({
            orders: state.orders.map(order => {
                if (order.id === orderId) {
                    // Preserve profiles and other fields not returned in the update select
                    return {
                        ...order,
                        ...updatedOrder,
                        profiles: order.profiles // CRITICAL: Preserve the profile data
                    };
                }
                return order;
            })
        }));

        // Notify User
        try {
            console.log(`[billingStore] Sending notification to user ${updatedOrder.user_id}...`);
            const { error: notifError } = await supabase.from('notifications').insert([{
                user_id: updatedOrder.user_id,
                title: newStatus === 'approved' ? "Compra Aprovada!" : "Compra Rejeitada",
                message: newStatus === 'approved'
                    ? `O seu pedido de ${updatedOrder.credits} créditos foi aprovado. Já pode utilizá-los!`
                    : "O seu comprovativo de pagamento não foi validado. Por favor, contacte o suporte.",
                type: newStatus === 'approved' ? 'success' : 'warning',
                link: '/store'
            }]);

            if (notifError) {
                console.error("[billingStore] Error in notifications insert:", notifError);
            } else {
                console.log("[billingStore] Notification sent successfully.");
            }
        } catch (err) {
            console.error("[billingStore] Exception sending notification:", err);
            // Don't throw, we still updated the status
        }

        return updatedOrder;
    },

    addPackage: async (pkg) => {
        const { data, error } = await supabase
            .from('credit_packages')
            .insert([pkg])
            .select();

        if (!error && data && data.length > 0) {
            set(state => ({ packages: [...state.packages, data[0]] }));
        }
    },

    updatePackage: async (id, updates) => {
        const { data, error } = await supabase
            .from('credit_packages')
            .update(updates)
            .eq('id', id)
            .select();

        if (!error && data && data.length > 0) {
            set(state => ({
                packages: state.packages.map(p => p.id === id ? data[0] : p)
            }));
        }
    },

    deletePackage: async (id) => {
        const { error } = await supabase
            .from('credit_packages')
            .delete()
            .eq('id', id);

        if (!error) {
            set(state => ({
                packages: state.packages.filter(p => p.id !== id)
            }));
        }
    }
}));
