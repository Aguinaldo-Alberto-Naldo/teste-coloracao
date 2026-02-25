/* global process */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Tests the insertion of a TestSubject.
 * Simulates the mapping used in the subjects store.
 */
async function testInsert() {
    console.log("--- Starting Subject Insertion Test ---");

    try {
        console.log("Logging in as Admin for test insertion...");
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: 'admin@chromatest.ai',
            password: 'admin-chroma-2026'
        });

        if (authErr) {
            console.error("Login failed:", authErr.message);
            return;
        }

        console.log("Logged in:", authData.user.id);

        const testData = {
            fullName: "API Test",
            email: "apitest@example.com",
            phone: "+351900000000",
            clientId: authData.user.id,
            photoUrls: ["http://example.com/test.jpg"]
        };

        console.log("Simulating payload mapping...");
        const newSubj = {
            client_id: testData.clientId,
            full_name: testData.fullName,
            phone: testData.phone,
            email: testData.email,
            photo_urls: testData.photoUrls || [],
            status: "processing",
        };

        console.log("Payload:", newSubj);

        const { data: insertedData, error } = await supabase
            .from('subjects')
            .insert([newSubj])
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error.message);
        } else {
            console.log("Success! Inserted Subject ID:", insertedData.id);

            // Clean up
            await supabase.from('subjects').delete().eq('id', insertedData.id);
            console.log("Cleaned up dummy test record.");
        }

        console.log("Logging out...");
        await supabase.auth.signOut();
        console.log("Logged out successfully.");

    } catch (err) {
        console.error("Unexpected error during insertion test:", err);
    } finally {
        console.log("--- Subject Insertion Test Completed ---");
    }
}

testInsert();
