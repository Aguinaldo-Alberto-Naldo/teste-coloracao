import { createClient } from '@supabase/supabase-js';
/* global process */
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or ANON KEY is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates an admin user in Supabase.
 * Uses try/catch for robust error handling and exits with appropriate status codes.
 */
async function createAdmin() {
    const email = 'admin@chromatest.ai';
    const password = 'admin-chroma-2026';

    console.log(`Creating admin user: ${email}...`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'admin',
                    full_name: 'Administrador',
                },
            },
        });

        if (error) {
            console.error('Error signing up admin:', error.message);
            process.exit(1);
        }

        console.log('Admin user created successfully. User ID:', data.user.id);
        console.log('Please check your email and promote this user via SQL if needed.');
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error during admin creation:', err);
        process.exit(1);
    }
}

createAdmin();
