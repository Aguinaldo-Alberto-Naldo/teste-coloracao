/**
 * visionService.js
 * Handles image analysis using Google Gemini 1.5 API.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Helper to convert a public URL to base64
 * Note: This works in the browser if the URL has CORS enabled (like Supabase Storage)
 */
async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Analyzes one or more images using Gemini 2.5 Pro.
 * @param {string[]} imageUrls - Array of public URLs for the images to analyze.
 * @param {string} [customPrompt] - Optional custom system prompt.
 * @returns {Promise<Object>} - The structured analysis result.
 */
export async function analyzeImagesWithVision(imageUrls, customPrompt) {
    if (!GEMINI_API_KEY) {
        throw new Error('Chave de API do Gemini não encontrada.');
    }

    const defaultPrompt = `Você é um especialista em coloração pessoal (método sazonal expandido) de elite. 
Sua tarefa é analisar as fotos enviadas e determinar a estação e subestação do cliente com máxima precisão.

INSTRUÇÕES CRÍTICAS:
1. Responda ESTRITAMENTE com um objeto JSON válido.
2. Não inclua Markdown, blocos de código (\`\`\`json) ou qualquer texto fora do JSON.
3. Se a foto não for clara, faça o melhor diagnóstico possível com base nos tons de pele, olhos e contraste visíveis.

ESTRUTURA DO JSON:
{
  "season": "Primavera|Verão|Outono|Inverno",
  "subSeason": "Nome da Subestação",
  "palette": [
    {"name": "Nome da Cor", "hex": "#HEX", "description": "Por que esta cor funciona"}
  ],
  "colorsToAvoid": [
    {"name": "Nome da Cor", "hex": "#HEX", "reason": "Por que evitar"}
  ],
  "clothing": {
    "suggestions": "Sugestões gerais de estilo",
    "fabrics": "Tecidos recomendados",
    "patterns": "Estampas ideais"
  },
  "makeup": {
    "foundation": "Dicas de base",
    "blush": "Dicas de blush",
    "lips": "Dicas de batom",
    "eyes": "Dicas de sombra"
  },
  "accessories": {
    "metals": "Metais recomendados (Ouro, Prata, etc)",
    "stones": "Pedras recomendadas",
    "general": "Dicas gerais de acessórios"
  },
  "fullAnalysis": "Um parágrafo detalhado explicando a harmonia do rosto, temperatura, intensidade e profundidade."
}`;

    const finalPrompt = (customPrompt && customPrompt.trim().length > 10) ? customPrompt : defaultPrompt;

    try {
        console.log("Iniciando análise com Google Gemini 1.5...");

        // 1. Prepare images as base64
        const imageParts = await Promise.all(
            imageUrls.map(async (url) => {
                const base64Data = await urlToBase64(url);
                return {
                    inline_data: {
                        mime_type: "image/jpeg", // Assuming JPEG for simplicity
                        data: base64Data
                    }
                };
            })
        );

        // 2. Prepare Payload
        const payload = {
            contents: [
                {
                    parts: [
                        { text: finalPrompt },
                        { text: "Analise estas fotos para coloração pessoal seguindo estritamente a estrutura JSON solicitada acima." },
                        ...imageParts
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topP: 1,
                topK: 32,
                maxOutputTokens: 8192,
                response_mime_type: "application/json"
            }
        };

        // 3. API Call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Gemini API Erro Detalhado:", errorData);
            throw new Error(`Erro na API do Gemini: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Gemini Response (No candidates):", JSON.stringify(data, null, 2));
            throw new Error("O Gemini não gerou resultados. Verifique se as imagens são claras.");
        }

        const candidate = data.candidates[0];

        // Check for safety filters block
        if (candidate.finishReason === "SAFETY") {
            throw new Error("A análise foi bloqueada pelos filtros de segurança da Google. Tente uma foto diferente (ex: rosto bem iluminado, sem sombras fortes).");
        }

        // Find the 'text' part (skip thinking/audio/etc if present)
        const textPart = candidate.content?.parts?.find(p => p.text);

        if (!textPart || !textPart.text) {
            console.error("Gemini full candidate structure:", JSON.stringify(candidate, null, 2));
            throw new Error(`A IA retornou um formato inesperado (Motivo: ${candidate.finishReason || 'Desconhecido'}).`);
        }

        let content = textPart.text;
        console.log("Resposta bruta da IA recebida. Processando...");

        // Robust JSON extraction: look for the first '{' and last '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            content = content.substring(firstBrace, lastBrace + 1);
        } else {
            // Fallback: cleaning possible artifacts
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        try {
            const result = JSON.parse(content);
            console.log("Análise concluída com sucesso.");
            return result;
        } catch (parseError) {
            console.error("Falha no parse. Conteúdo bruto:", textPart.text);
            throw new Error("Não foi possível processar a resposta da IA. Tente novamente em instantes.");
        }

    } catch (error) {
        console.error("Erro Fatal no processamento com Gemini:", error);
        throw error;
    }
}
