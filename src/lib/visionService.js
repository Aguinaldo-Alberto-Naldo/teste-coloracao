const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Ensures the report data has all mandatory fields for the database.
 */
function normalizeReportData(data, rawMarkdown) {
    return {
        season: data.season || "Desconhecida",
        subSeason: data.subSeason || data.sub_season || "Análise Personalizada",
        palette: Array.isArray(data.palette) ? data.palette : [],
        colorsToAvoid: Array.isArray(data.colorsToAvoid) || Array.isArray(data.colors_to_avoid) ? (data.colorsToAvoid || data.colors_to_avoid) : [],
        fullAnalysis: data.fullAnalysis || data.full_analysis || rawMarkdown || "Análise não disponível.",
        skinToneData: data.skinToneData || data.skin_tone_data || {},
        skinColorHex: data.skinColorHex || data.skin_color_hex || null,
        clothing: data.clothing || { suggestions: "", fabrics: "", patterns: "" },
        makeup: data.makeup || { foundation: "", blush: "", lips: "", eyes: "" },
        accessories: data.accessories || { metals: "", stones: "", general: "" }
    };
}

/**
 * Generates a rich markdown report and structured suggestions via Gemini 
 * using the technical JSON data provided by n8n.
 */
async function generateRichAnalysisFromData(n8nData) {
    if (!GEMINI_API_KEY) throw new Error("API Key do Gemini não configurada.");

    const prompt = `Você é um consultor de imagem de luxo especializado no método sazonal expandido.
Sua tarefa é transformar dados técnicos brutos em um relatório de coloração pessoal excepcional, extenso, técnico e encantador.

DADOS TÉCNICOS (Grounding Obrigatório):
- Estação Confirmada: ${n8nData.season}
- Subtom: ${n8nData.subtone} | Profundidade: ${n8nData.depth} | Saturação: ${n8nData.saturation} | Contraste: ${n8nData.contrast}
- Perfil Biológico (Extraído):
  * Pele: ${n8nData.extracted_colors?.skin?.hex}
  * Olhos: ${n8nData.extracted_colors?.eyes?.hex}
  * Cabelo: ${n8nData.extracted_colors?.hair?.hex}
- Paleta Recomendada: ${n8nData.recommended_palette?.join(', ')}
- Cores a Evitar: ${n8nData.avoid_colors?.join(', ')}

INSTRUÇÕES DO RELATÓRIO:
1. IDIOMA: Português de Portugal (PT-PT).
2. EXTENSÃO OBRIGATÓRIA: O campo 'full_analysis' deve ter NO MÍNIMO 10 LINHAS de texto denso e informativo. Não seja superficial.
3. CONTEÚDO ESTRUTURADO:
   - Introdução: Explique a essência da estação ${n8nData.season}.
   - Harmonia Biológica: Analise detalhadamente como o tom da pele (${n8nData.extracted_colors?.skin?.hex}), a cor dos olhos (${n8nData.extracted_colors?.eyes?.hex}) e o cabelo (${n8nData.extracted_colors?.hair?.hex}) interagem entre si para criar o seu contraste único.
   - Aplicação Prática: Discorra sobre como as cores da paleta recomendada enfatizam a sua beleza natural e quais subtons deve priorizar.
   - Alerta de Contraste: Explique por que as "Cores a Evitar" prejudicam a sua fisionomia.
4. TOM DE VOZ: Autoritativo, luxuoso e técnico.
5. JSON DE RESPOSTA (ESTRITO):
   - full_analysis: (O relatório extenso em Markdown - Mínimo 10 linhas)
   - clothing: { suggestions: "análise detalhada de roupas", fabrics: "tecidos ideais", patterns: "estampas e texturas" }
   - makeup: { foundation: "tom exato de base", blush: "tons de blush/contorno", lips: "tons de batom", eyes: "tons de sombra/lápis" }
   - accessories: { metals: "metais (ouro/prata/rose)", stones: "pedras preciosas", general: "estilo de joias" }

Responda APENAS com o JSON.`;

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Falha ao gerar relatório rico via Gemini.");

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        return JSON.parse(content);
    } catch (error) {
        console.error("Erro na geração de relatório rico:", error);
        // Fallback básico se o Gemini falhar na formatação
        return {
            full_analysis: `Análise confirmada como ${n8nData.season}. Use a sua paleta personalizada para melhores resultados.`,
            clothing: { suggestions: "Cores vibrantes e quentes", fabrics: "Seda, Algodão", patterns: "Florais delicados" },
            makeup: { foundation: "Quente", blush: "Pêssego", lips: "Coral", eyes: "Dourados" },
            accessories: { metals: "Dourado", stones: "Âmbar", general: "Peças luminosas" }
        };
    }
}

/**
 * Analyzes an image using the n8n automation (JSON output) + Gemini (Report generation).
 */
export async function analyzeWithN8N(imageUrls, customPrompt, skinToneData) {
    if (!N8N_WEBHOOK_URL) {
        return analyzeImagesWithVision(imageUrls, customPrompt, skinToneData);
    }

    try {
        console.log("Passo 1: Solicitando análise técnica ao n8n...");
        const responseImage = await fetch(imageUrls[0]);
        const blob = await responseImage.blob();

        const formData = new FormData();
        formData.append('data', blob, 'analysis_subject.jpg');

        const res = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error(`Erro no Webhook n8n: ${res.statusText}`);

        const n8nJson = await res.json();
        console.log("Dados técnicos n8n recebidos:", n8nJson);

        // Comprehensive Translation Mapping (English -> PT-PT)
        const translations = {
            // Seasons
            "Spring Bright": "Primavera Brilhante",
            "Spring Light": "Primavera Clara",
            "Spring Warm": "Primavera Quente",
            "Summer Light": "Verão Claro",
            "Summer Cool": "Verão Frio",
            "Summer Soft": "Verão Suave",
            "Autumn Warm": "Outono Quente",
            "Autumn Deep": "Outono Profundo",
            "Autumn Soft": "Outono Suave",
            "Winter Deep": "Inverno Profundo",
            "Winter Cool": "Inverno Frio",
            "Winter Bright": "Inverno Brilhante",
            // Subtones/Attributes
            "warm": "Quente",
            "cool": "Frio",
            "neutral": "Neutro",
            "light": "Claro",
            "deep": "Profundo",
            "medium": "Médio",
            "bright": "Brilhante",
            "soft": "Suave",
            "high": "Alto",
            "low": "Baixo"
        };

        const translate = (val) => {
            if (!val) return val;
            const lowerVal = val.toString().toLowerCase();
            // Try exact match or title case match
            return translations[val] || translations[lowerVal] || val;
        };

        const translatedSubSeason = translate(n8nJson.season);
        const translatedSeason = translatedSubSeason.split(' ')[0];

        // Prepare fully translated data for Gemini prompt
        const n8nDataForPrompt = {
            ...n8nJson,
            season: translatedSubSeason,
            subtone: translate(n8nJson.subtone),
            depth: translate(n8nJson.depth),
            saturation: translate(n8nJson.saturation),
            contrast: translate(n8nJson.contrast)
        };

        console.log("Passo 2: Gerando relatório rico via Gemini...");
        const richReport = await generateRichAnalysisFromData(n8nDataForPrompt);

        // Map n8n JSON to our internal structure
        const result = {
            season: translatedSeason,
            subSeason: translatedSubSeason,
            palette: (n8nJson.recommended_palette || []).map(hex => ({
                name: "Cor Ideal",
                hex,
                description: "Harmonia confirmada"
            })),
            colorsToAvoid: (n8nJson.avoid_colors || []).map(hex => ({
                name: "Cor Crítica",
                hex,
                reason: "Contraste desfavorável"
            })),
            fullAnalysis: richReport.full_analysis,
            skinToneData: {
                skin_color: n8nJson.extracted_colors?.skin?.hex,
                eye_color: n8nJson.extracted_colors?.eyes?.hex,
                hair_color: n8nJson.extracted_colors?.hair?.hex
            },
            skinColorHex: n8nJson.extracted_colors?.skin?.hex,
            clothing: richReport.clothing,
            makeup: richReport.makeup,
            accessories: richReport.accessories
        };

        return normalizeReportData(result, "Relatório Híbrido n8n+Gemini");

    } catch (error) {
        console.error("Erro no Fluxo Híbrido:", error);
        return analyzeImagesWithVision(imageUrls, customPrompt, skinToneData);
    }
}

/**
 * Fallback direct Gemini analysis (Legacy/Emergency)
 */
export async function analyzeImagesWithVision(imageUrls, customPrompt, skinToneData) {
    if (!GEMINI_API_KEY) throw new Error('Chave de API do Gemini não encontrada.');

    const payload = {
        contents: [{
            parts: [
                { text: `Analise as fotos e retorne um JSON com: season, subSeason, palette (array de {name, hex, description}), colorsToAvoid, fullAnalysis, clothing, makeup, accessories.` },
                ...await Promise.all(imageUrls.map(async url => ({
                    inline_data: { mime_type: "image/jpeg", data: await urlToBase64(url) }
                })))
            ]
        }],
        generationConfig: { temperature: 0.4, response_mime_type: "application/json" }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    return normalizeReportData(JSON.parse(content), "Análise Direta Gemini");
}

async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    });
}
