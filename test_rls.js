import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function testRls() {
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

    console.log("Fetching a client profile (not admin)...");
    const { data: profiles, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', authData.user.id)
        .limit(1);

    if (fetchErr || profiles.length === 0) {
        console.log("Could not fetch another profile");
        return;
    }

    const targetUser = profiles[0];
    console.log("Target user:", targetUser.email, targetUser.id);

    console.log("Attempting to add 1 credit to target user...");
    const { data: updatedData, error: updateErr } = await supabase
        .from('profiles')
        .update({ credits_total: (targetUser.credits_total || 0) + 1 })
        .eq('id', targetUser.id)
        .select();

    if (updateErr) {
        console.error("Update threw an error:", updateErr);
    } else {
        console.log("Update completed successfully (no error thrown)!");
        console.log("Returned rows from update:", updatedData);
        if (updatedData && updatedData.length > 0) {
            console.log("SUCCESS! RLS allowed the update!");
        } else {
            console.log("FAILURE! RLS blocked the update (0 rows updated).");
            console.log("This proves the Admin needs an RLS policy in Supabase!");
        }
    }
}

testRls();
