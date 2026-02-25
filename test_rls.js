/* global process */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Runs the RLS test suite.
 * Logs in as admin, attempts to update another user's profile,
 * and verifies if RLS policy correctly allows/blocks the operation.
 */
async function testRls() {
    console.log("--- Starting RLS Test ---");

    try {
        console.log("Logging in as admin...");
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: 'admin@chromatest.ai',
            password: 'admin-chroma-2026'
        });

        if (authErr) {
            console.error("Login failed:", authErr.message);
            return;
        }

        console.log("Logged in as Admin:", authData.user.id);

        console.log("Fetching a target client profile (not admin)...");
        const { data: profiles, error: fetchErr } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', authData.user.id)
            .limit(1);

        if (fetchErr || !profiles || profiles.length === 0) {
            console.log("Could not fetch another profile or no other profiles exist.");
            return;
        }

        const targetUser = profiles[0];
        console.log("Target user:", targetUser.email, targetUser.id);

        console.log(`Attempting to add 1 credit to target user (current total: ${targetUser.credits_total || 0})...`);
        const { data: updatedData, error: updateErr } = await supabase
            .from('profiles')
            .update({ credits_total: (targetUser.credits_total || 0) + 1 })
            .eq('id', targetUser.id)
            .select();

        if (updateErr) {
            console.error("Update threw an error:", updateErr.message);
        } else {
            console.log("Update call returned successfully.");
            if (updatedData && updatedData.length > 0) {
                console.log("SUCCESS! RLS allowed the update (Row was updated).");
            } else {
                console.log("FAILURE! RLS blocked the update (0 rows updated).");
                console.log("ACTION REQUIRED: Ensure Admin has an RLS policy for 'UPDATE' in the 'profiles' table.");
            }
        }

        console.log("Logging out...");
        await supabase.auth.signOut();
        console.log("Logged out successfully.");

    } catch (err) {
        console.error("Unexpected error during RLS test:", err);
    } finally {
        console.log("--- RLS Test Completed ---");
    }
}

testRls();
