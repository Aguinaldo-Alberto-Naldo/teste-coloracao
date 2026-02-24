import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export const useSubjectsStore = create(
    (set, get) => ({
        subjects: [],
        loading: false,

        // Fetch subjects from Supabase
        loadSubjects: async (clientId) => {
            set({ loading: true });
            try {
                let query = supabase
                    .from('subjects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (clientId) {
                    query = query.eq('client_id', clientId);
                }

                const { data, error } = await query;
                if (error) throw error;
                set({ subjects: data || [] });
            } catch (error) {
                console.error("Error loading subjects:", error);
                toast.error("Erro ao carregar pessoas.");
            } finally {
                set({ loading: false });
            }
        },

        // Add a new subject to Supabase
        addSubject: async (data) => {
            set({ loading: true });
            try {
                const newSubj = {
                    client_id: data.clientId,
                    testable_client_id: data.testableClientId || null,
                    full_name: data.fullName,
                    phone: data.phone,
                    email: data.email,
                    photo_urls: data.photoUrls || [],
                    status: "processing",
                };

                const { data: insertedData, error } = await supabase
                    .from('subjects')
                    .insert([newSubj])
                    .select()
                    .single();

                if (error) throw error;

                set((state) => ({ subjects: [insertedData, ...state.subjects] }));
                return insertedData;
            } catch (error) {
                console.error("Error adding subject:", error);
                toast.error("Erro ao adicionar pessoa.");
                throw error;
            } finally {
                set({ loading: false });
            }
        },

        // Update subject status in Supabase
        updateSubjectStatus: async (id, status) => {
            try {
                const { data: updatedData, error } = await supabase
                    .from('subjects')
                    .update({ status, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                set((state) => ({
                    subjects: state.subjects.map(s => s.id === id ? updatedData : s)
                }));
                return updatedData;
            } catch (error) {
                console.error("Error updating subject status:", error);
                toast.error("Erro ao atualizar estado.");
            }
        },

        // Delete subject from Supabase
        deleteSubject: async (id) => {
            try {
                const { error } = await supabase
                    .from('subjects')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                set((state) => ({
                    subjects: state.subjects.filter(s => s.id !== id)
                }));

                toast.success("Teste eliminado com sucesso.");
                return true;
            } catch (error) {
                console.error("Error deleting subject:", error);
                toast.error("Erro ao eliminar teste.");
                return false;
            }
        },

        getByClient: (clientId) => {
            const { subjects } = get();
            return subjects.filter(s => s.client_id === clientId);
        }
    })
);
