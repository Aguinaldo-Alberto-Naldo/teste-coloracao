import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function testInsert() {
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

    const data = {
        fullName: "API Test",
        email: "apitest@example.com",
        phone: "+351900000000",
        clientId: authData.user.id,
        photoUrls: ["http://example.com/test.jpg"]
    };

    console.log("Simulating subjectsStore.js mapping...");
    const newSubj = {
        client_id: data.clientId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        photo_urls: data.photoUrls || [],
        status: "processing",
    };
    console.log("Payload to send to Supabase:");
    console.log(newSubj);

    const { data: insertedData, error } = await supabase
        .from('subjects')
        .insert([newSubj])
        .select()
        .single();

    if (error) {
        console.error("Supabase Error:", error);
    } else {
        console.log("Success! Inserted Subject ID:", insertedData.id);

        // Clean up
        await supabase.from('subjects').delete().eq('id', insertedData.id);
        console.log("Cleaned up dummy test record.");
    }
}

testInsert();
