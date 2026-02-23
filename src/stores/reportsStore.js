import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export const useReportsStore = create(
    (set, get) => ({
        reports: [],
        loading: false,

        loadReports: async (clientId) => {
            set({ loading: true });
            try {
                let query = supabase
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (clientId) {
                    query = query.eq('client_id', clientId);
                }

                const { data, error } = await query;
                if (error) throw error;
                set({ reports: data || [] });
            } catch (error) {
                console.error("Error loading reports:", error);
                toast.error("Erro ao carregar análises.");
            } finally {
                set({ loading: false });
            }
        },

        addReport: async (data) => {
            set({ loading: true });
            try {
                const { data: insertedData, error } = await supabase
                    .from('reports')
                    .insert([{
                        subject_id: data.subjectId,
                        client_id: data.clientId,
                        season: data.season,
                        sub_season: data.subSeason,
                        palette: data.palette,
                        colors_to_avoid: data.colorsToAvoid,
                        clothing: data.clothing,
                        makeup: data.makeup,
                        accessories: data.accessories,
                        full_analysis: data.fullAnalysis
                    }])
                    .select()
                    .single();

                if (error) throw error;

                set((state) => ({ reports: [insertedData, ...state.reports] }));
                return insertedData;
            } catch (error) {
                console.error("Error adding report:", error);
                toast.error("Erro ao salvar análise.");
                throw error;
            } finally {
                set({ loading: false });
            }
        },

        getBySubject: async (subjectId) => {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('subject_id', subjectId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) throw error;
                return data;
            } catch (error) {
                console.error("Error fetching report by subject:", error);
                return null;
            }
        },

        getByClient: (clientId) => {
            const { reports } = get();
            return reports.filter(r => r.client_id === clientId);
        }
    })
);
