import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useConfigStore = create((set, get) => ({
    appName: "ChromaTest AI",
    appLogo: null,
    aiPrompt: "",
    loading: false,

    loadConfig: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('site_config')
            .select('content')
            .eq('key', 'app_config')
            .single();

        if (!error && data && data.content) {
            set({
                appName: data.content.appName || "ChromaTest AI",
                appLogo: data.content.appLogo || null,
                aiPrompt: data.content.aiPrompt || ""
            });
        }
        set({ loading: false });
    },

    setAppName: async (name) => {
        const { error } = await supabase
            .from('site_config')
            .upsert({
                key: 'app_config',
                content: {
                    appName: name,
                    appLogo: get().appLogo,
                    aiPrompt: get().aiPrompt
                },
                updated_at: new Date().toISOString()
            });

        if (!error) {
            set({ appName: name });
        }
    },

    setAppLogo: async (logoUrl) => {
        // logoUrl is expected to be a string URL from uploadLogo or manual input
        const { error } = await supabase
            .from('site_config')
            .upsert({
                key: 'app_config',
                content: {
                    appName: get().appName,
                    appLogo: logoUrl,
                    aiPrompt: get().aiPrompt
                },
                updated_at: new Date().toISOString()
            });

        if (!error) {
            set({ appLogo: logoUrl });
        }
        return !error;
    },

    uploadLogo: async (file) => {
        set({ loading: true });
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars') // Using avatars bucket as it's likely already configured with public read
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;
        } finally {
            set({ loading: false });
        }
    },

    setAiPrompt: async (prompt) => {
        const { error } = await supabase
            .from('site_config')
            .upsert({
                key: 'app_config',
                content: {
                    appName: get().appName,
                    appLogo: get().appLogo,
                    aiPrompt: prompt
                },
                updated_at: new Date().toISOString()
            });

        if (!error) {
            set({ aiPrompt: prompt });
        }
    },

    resetConfig: async () => {
        const defaultConfig = { appName: "ChromaTest AI", appLogo: null, aiPrompt: "" };
        const { error } = await supabase
            .from('site_config')
            .upsert({
                key: 'app_config',
                content: defaultConfig,
                updated_at: new Date().toISOString()
            });

        if (!error) {
            set(defaultConfig);
        }
    }
}));
