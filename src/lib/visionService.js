/**
 * visionService.js
 * Handles image analysis using OpenAI GPT-4 Vision API.
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Analyzes one or more images using GPT-4 Vision.
 * @param {string[]} imageUrls - Array of public URLs for the images to analyze.
 * @param {string} [customPrompt] - Optional custom system prompt.
 * @returns {Promise<Object>} - The structured analysis result.
 */
export async function analyzeImagesWithVision(imageUrls, customPrompt) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API Key is missing');
    }

    const defaultPrompt = `Você é um especialista em coloração pessoal (método sazonal expandido). 
Sua tarefa é analisar as fotos enviadas e determinar a estação e subestação do cliente.
Você deve responder APENAS com um objeto JSON válido, seguindo exatamente esta estrutura:

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
}

Seja preciso e profissional.`;

    const finalPrompt = (customPrompt && customPrompt.trim().length > 10) ? customPrompt : defaultPrompt;

    // Correct payload for gpt-4o vision with JSON response
    const messages = [
        {
            role: "system",
            content: finalPrompt
        },
        {
            role: "user",
            content: [
                { type: "text", text: "Analise estas fotos para coloração pessoal seguindo estritamente a estrutura JSON solicitada." },
                ...imageUrls.map(url => ({
                    type: "image_url",
                    image_url: { url }
                }))
            ]
        }
    ];

    try {
        console.log("Iniciando análise visionária com OpenAI...");

        // Add a timeout using AbortController (60 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                max_tokens: 1500,
                response_format: { type: "json_object" }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenAI API Erro Detalhado:", errorData);
            throw new Error(`Erro na API da OpenAI: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error("A OpenAI retornou uma resposta vazia ou mal formatada.");
        }

        const content = data.choices[0].message.content;
        console.log("Resposta bruta da OpenAI recebida com sucesso.");

        try {
            const result = JSON.parse(content);
            return result;
        } catch (parseError) {
            console.error("Falha ao analisar o JSON retornado pela OpenAI:", content);
            throw new Error("A IA não retornou um formato JSON válido.");
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("Timeout: A análise demorou demasiado tempo.");
            throw new Error("A análise excedeu o tempo limite (60 segundos). Tente imagens mais leves.");
        }
        console.error("Erro Fatal no processamento de imagens:", error);
        throw error;
    }
}
