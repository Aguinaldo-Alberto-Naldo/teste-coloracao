/**
 * perfectCorpService.js
 * Handles objective color analysis using Perfect Corp YCE API (Skin Tone + Face Attributes).
 */

const PERFECT_CORP_API_KEY = import.meta.env.VITE_PERFECT_CORP_API_KEY;
const API_BASE_URL = "https://yce-api-01.makeupar.com";

/**
 * Common helper to create and poll a task on Perfect Corp API v2.0
 */
async function runPerfectCorpTask(endpoint, payload) {
    try {
        // 1. Create Task
        const createResponse = await fetch(`${API_BASE_URL}/s2s/v2.0/task/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${PERFECT_CORP_API_KEY}`,
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            console.error(`Perfect Corp Task (${endpoint}) Creation Failed:`, errorData);
            return null;
        }

        const createData = await createResponse.json();
        const taskId = createData.data?.task_id;
        if (!taskId) return null;

        // 2. Poll for results
        const maxAttempts = 15;
        const pollingInterval = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, pollingInterval));
            const pollResponse = await fetch(`${API_BASE_URL}/s2s/v2.0/task/${endpoint}/${taskId}`, {
                headers: {
                    "Authorization": `Bearer ${PERFECT_CORP_API_KEY}`,
                    "Accept": "application/json"
                }
            });

            if (!pollResponse.ok) continue;

            const pollData = await pollResponse.json();
            const status = pollData.data?.task_status;

            if (status === "success" || status === "completed") {
                return pollData.data?.results;
            } else if (status === "error" || status === "failed") {
                console.error(`Perfect Corp Task (${endpoint}) Error:`, pollData.data?.error_message);
                return null;
            }
        }
        return null;
    } catch (e) {
        console.error(`Fatal error in Perfect Corp Task (${endpoint}):`, e);
        return null;
    }
}

/**
 * Gets objective color data (Skin, Eyes, Hair, Lips) from an image URL.
 * @param {string} imageUrl - Publicly accessible URL of the image.
 * @returns {Promise<Object|null>} - The detected colors or null.
 */
export async function getSkinTone(imageUrl) {
    if (!PERFECT_CORP_API_KEY) {
        console.warn("Perfect Corp API Key not found. Skipping objective analysis.");
        return null;
    }

    console.log("Starting Full Perfect Corp Objective Analysis...");

    // Run both analyses
    // Note: We run them sequentially to avoid potential rate limits on trial keys
    // and to ensure better reliability for the user.

    // 1. Skin Tone Analysis
    const skinResults = await runPerfectCorpTask("skin-tone-analysis", {
        src_file_url: imageUrl,
        face_angle_strictness_level: "high"
    });

    // 2. Face Attributes Analysis (for Eyes, Hair, Lips)
    const faceAttrResults = await runPerfectCorpTask("face-attr-analysis", {
        src_file_url: imageUrl,
        face_angle_strictness_level: "high",
        features: ["eyeColor", "lipColor", "hairColor"]
    });

    // Merge results
    const finalResult = {
        skin_color: skinResults?.color?.skin_color || null,
        eye_color: faceAttrResults?.color?.eye_color || null,
        hair_color: faceAttrResults?.color?.hair_color || null,
        lip_color: faceAttrResults?.color?.lip_color || null
    };

    console.log("Merged Objective Colors:", finalResult);
    return finalResult;
}
