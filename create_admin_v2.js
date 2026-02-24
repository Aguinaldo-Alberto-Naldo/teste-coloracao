import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sabtjjwipavqszcrvixo.supabase.co';
const supabaseAnonKey = 'sb_publishable_LiJVz3q5WNHmbyoMmEk-yA_OEZLu252';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    const email = 'admin@chromatest.ai';
    const password = 'admin-chroma-2026';

    console.log(`Creating user: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'admin',
                full_name: 'Administrador'
            }
        }
    });

    if (error) {
        console.error('Error signing up:', error.message);
        return;
    }

    console.log('User created successfully:', data.user.id);
}

createAdmin();
