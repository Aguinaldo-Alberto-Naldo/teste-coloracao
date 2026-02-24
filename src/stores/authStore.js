import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            currentUser: null, // Profile data
            session: null,
            loading: true,

            initialize: async () => {
                set({ loading: true });
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    set({ session });
                    await get().fetchProfile(session.user.id);
                } else {
                    set({ session: null, currentUser: null });
                }

                set({ loading: false });

                // Subscribe to auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    // Only update and fetch if the user actually changed to avoid redundant refreshes
                    const currentUserId = get().session?.user?.id;
                    const nextUserId = session?.user?.id;

                    if (currentUserId !== nextUserId) {
                        set({ session });
                        if (session) {
                            await get().fetchProfile(session.user.id);
                        } else {
                            set({ currentUser: null });
                        }
                    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        // Occasional refreshes are okay for specific events if session stayed same
                        set({ session });
                    }
                });

                return () => subscription.unsubscribe();
            },

            mapProfile: (profile) => {
                if (!profile) return null;
                return {
                    id: profile.id,
                    fullName: profile.full_name || profile.email?.split('@')[0] || "Utilizador",
                    email: profile.email,
                    role: profile.role,
                    creditsTotal: profile.credits_total,
                    creditsUsed: profile.credits_used,
                    creditsExpiration: profile.credits_expiration,
                    currentPlan: profile.current_plan,
                    avatarUrl: profile.avatar_url,
                    createdAt: profile.created_at,
                    updatedAt: profile.updated_at
                };
            },

            fetchProfile: async (userId) => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (error) throw error;

                    // Check for credit expiration
                    if (data && data.credits_expiration && new Date(data.credits_expiration) < new Date()) {
                        const { data: updatedData, error: updateError } = await supabase
                            .from('profiles')
                            .update({ credits_total: 0, credits_used: 0, credits_expiration: null })
                            .eq('id', userId)
                            .select();

                        if (!updateError && updatedData && updatedData.length > 0) {
                            set({ currentUser: get().mapProfile(updatedData[0]) });
                            return;
                        }
                    }

                    set({ currentUser: get().mapProfile(data) });
                } catch (error) {
                    console.error("DEBUG Error fetching profile for user:", userId, error);
                }
            },

            login: async (email, password) => {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                return data;
            },

            logout: async () => {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                set({ currentUser: null, session: null });
            },

            register: async (data) => {
                const { data: authData, error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            full_name: data.fullName,
                        }
                    }
                });
                if (error) throw error;
                return authData;
            },

            addCredits: async (userId, amount, planName = "Pacote de Créditos") => {
                // Fetch the TARGET user profile first to get their ACTUAL current credits
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError) throw profileError;

                const now = new Date();
                let currentAvailable = (profile.credits_total || 0) - (profile.credits_used || 0);

                // Check for expiration
                if (profile.credits_expiration && new Date(profile.credits_expiration) < now) {
                    currentAvailable = 0;
                }

                const expirationDate = new Date();
                expirationDate.setMonth(expirationDate.getMonth() + 1);

                const { data: updatedData, error } = await supabase
                    .from('profiles')
                    .update({
                        credits_total: currentAvailable + amount,
                        credits_used: 0,
                        credits_expiration: expirationDate.toISOString(),
                        current_plan: planName
                    })
                    .eq('id', userId)
                    .select();

                if (error) throw error;
                const updated = updatedData[0];

                // Log transaction
                await supabase.from('credit_transactions').insert([{
                    user_id: userId,
                    amount: amount,
                    type: 'purchase',
                    description: `Atribuição de créditos (${planName})`
                }]);

                const mapped = get().mapProfile(updated);

                // ONLY update local store if the updated profile is the currently logged in user
                if (get().currentUser?.id === userId) {
                    set({ currentUser: mapped });
                }

                return mapped;
            },

            updateCredits: async (userId, amountToUse) => {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError || !profile) return;

                if (profile.credits_expiration && new Date(profile.credits_expiration) < new Date()) {
                    await get().fetchProfile(userId); // Will trigger the expiration cleanup
                    return;
                }

                const newCreditsUsed = (profile.credits_used || 0) + amountToUse;
                const { data: updatedData, error } = await supabase
                    .from('profiles')
                    .update({ credits_used: newCreditsUsed })
                    .eq('id', userId)
                    .select();

                if (!error && updatedData && updatedData.length > 0) {
                    const updated = updatedData[0];
                    // Log transaction
                    await supabase.from('credit_transactions').insert([{
                        user_id: userId,
                        amount: amountToUse,
                        type: 'consumption',
                        description: 'Uso de créditos para análise'
                    }]);

                    const mapped = get().mapProfile(updated);
                    if (get().currentUser?.id === userId) {
                        set({ currentUser: mapped });
                    }
                }
            },

            refreshCurrentUser: async () => {
                const { session } = get();
                if (session) {
                    await get().fetchProfile(session.user.id);
                }
            },

            fetchAllProfiles: async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data;
            },

            fetchTransactions: async (userId) => {
                let query = supabase.from('credit_transactions').select('*').order('created_at', { ascending: false });
                if (userId) query = query.eq('user_id', userId);
                const { data, error } = await query;
                if (error) throw error;
                return data;
            },

            updateProfile: async (updates) => {
                const { session } = get();
                if (!session) throw new Error("Não autenticado");

                const { data: updatedData, error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: updates.fullName,
                        avatar_url: updates.avatarUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', session.user.id)
                    .select();

                if (error) throw error;
                const mapped = get().mapProfile(updatedData[0]);
                set({ currentUser: mapped });
                return mapped;
            },

            updateEmail: async (newEmail) => {
                const { error } = await supabase.auth.updateUser({ email: newEmail });
                if (error) throw error;
            },

            updatePassword: async (newPassword) => {
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) throw error;
            },

            uploadAvatar: async (file) => {
                const { session } = get();
                if (!session) throw new Error("Não autenticado");

                const fileExt = file.name.split('.').pop();
                const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                return publicUrl;
            }
        }),
        {
            name: "chroma_current_user_v3",
            partialize: (state) => ({ session: state.session }),
        }
    )
);
