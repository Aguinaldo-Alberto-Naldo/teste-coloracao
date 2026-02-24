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
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (!error) {
            set({ orders: data });
        }
        set({ loading: false });
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
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select();

        if (error) throw error;

        // If data is empty, it means no rows were updated or RLS prevented reading the result.
        // We handle this by updating the local state manually if we don't get the row back.
        let updatedOrder = data && data.length > 0 ? data[0] : null;

        if (!updatedOrder) {
            // Fallback: try to find the order in existing state and update its status
            const existingOrder = get().orders.find(o => o.id === orderId);
            if (existingOrder) {
                updatedOrder = { ...existingOrder, status: newStatus };
            }
        }

        if (!updatedOrder) {
            throw new Error("Não foi possível encontrar ou atualizar o pedido.");
        }

        // Send notification to the user about order status update
        try {
            const statusMap = {
                'approved': { title: 'Pagamento Aprovado! 🎉', message: 'Os seus créditos já foram adicionados à conta.', type: 'success' },
                'rejected': { title: 'Pagamento Rejeitado ❌', message: 'Houve um problema com o seu comprovativo. Verifique os detalhes.', type: 'warning' },
                'pending': { title: 'Pedido em Processamento ⏳', message: 'Estamos a validar o seu comprovativo de pagamento.', type: 'info' }
            };

            const config = statusMap[newStatus] || { title: 'Atualização de Pedido', message: `O estado do seu pedido mudou para: ${newStatus}`, type: 'info' };

            if (updatedOrder.user_id) {
                await supabase.from('notifications').insert([{
                    user_id: updatedOrder.user_id,
                    title: config.title,
                    message: config.message,
                    type: config.type,
                    link: '/dashboard'
                }]);
            }
        } catch (notifError) {
            console.error("DEBUG Error sending order notification:", notifError);
        }

        set(state => ({
            orders: state.orders.map(order =>
                order.id === orderId ? updatedOrder : order
            )
        }));

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
