import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export const useTestableClientsStore = create(
    (set, get) => ({
        clients: [],
        loading: false,

        // Fetch testable clients from Supabase
        loadClients: async (userId) => {
            set({ loading: true });
            try {
                const { data, error } = await supabase
                    .from('testable_clients')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                set({ clients: data || [] });
            } catch (error) {
                console.error("Error loading testable clients:", error);
                toast.error("Erro ao carregar clientes.");
            } finally {
                set({ loading: false });
            }
        },

        // Add a new testable client
        addClient: async (data) => {
            set({ loading: true });
            try {
                const newClient = {
                    user_id: data.userId,
                    name: data.name,
                    email: data.email || null,
                    phone: data.phone || null,
                };

                const { data: insertedData, error } = await supabase
                    .from('testable_clients')
                    .insert([newClient])
                    .select()
                    .single();

                if (error) {
                    if (error.code === '23505') { // Unique violation
                        throw new Error('Já existe um cliente registado com este email.');
                    }
                    throw error;
                }

                set((state) => ({ clients: [insertedData, ...state.clients] }));
                toast.success("Cliente adicionado com sucesso.");
                return insertedData;
            } catch (error) {
                console.error("Error adding client:", error);
                toast.error(error.message || "Erro ao adicionar cliente.");
                throw error;
            } finally {
                set({ loading: false });
            }
        },

        // Update a testable client
        updateClient: async (id, data) => {
            try {
                const { data: updatedData, error } = await supabase
                    .from('testable_clients')
                    .update({
                        name: data.name,
                        email: data.email || null,
                        phone: data.phone || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    if (error.code === '23505') {
                        throw new Error('Já existe um cliente registado com este email.');
                    }
                    throw error;
                }

                set((state) => ({
                    clients: state.clients.map(c => c.id === id ? updatedData : c)
                }));
                toast.success("Cliente atualizado com sucesso.");
                return updatedData;
            } catch (error) {
                console.error("Error updating client:", error);
                toast.error(error.message || "Erro ao atualizar cliente.");
                throw error;
            }
        },

        // Delete a testable client
        deleteClient: async (id) => {
            try {
                const { error } = await supabase
                    .from('testable_clients')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                set((state) => ({
                    clients: state.clients.filter(c => c.id !== id)
                }));

                toast.success("Cliente eliminado com sucesso.");
                return true;
            } catch (error) {
                console.error("Error deleting client:", error);
                toast.error("Erro ao eliminar cliente. Verifique se existem testes associados.");
                return false;
            }
        }
    })
);
