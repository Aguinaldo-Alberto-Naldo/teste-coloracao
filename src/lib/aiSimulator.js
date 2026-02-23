// aiSimulator.js

// Predefined seasons data
const SEASONS_DATA = {
    Primavera: {
        season: "Primavera",
        subSeason: "Primavera Quente",
        palette: [
            { name: "Coral", hex: "#FF6B6B", description: "Vibrante e cálido." },
            { name: "Pêssego", hex: "#FFAD8F", description: "Suave e luminoso." },
            { name: "Amarelo Mel", hex: "#FFD93D", description: "Radiante." },
            { name: "Verde Lima", hex: "#95D44A", description: "Fresco e enérgico." },
            { name: "Turquesa", hex: "#4ECDC4", description: "Alegre e brilhante." },
            { name: "Dourado", hex: "#F7B731", description: "Rico e elegante." },
            { name: "Laranja Suave", hex: "#FF8C42", description: "Dinâmico." },
            { name: "Nude Caramelo", hex: "#C68642", description: "Neutro aquecido." }
        ],
        colorsToAvoid: [
            { name: "Preto Puro", hex: "#000000", reason: "Demasiado pesado e escuro, apaga a sua luminosidade." },
            { name: "Cinzento Frio", hex: "#8A8D91", reason: "Conflito direto com o seu subtom quente." },
            { name: "Bordô Escuro", hex: "#4A0404", reason: "Não tem a vibração necessária." },
            { name: "Azul Marinho", hex: "#000080", reason: "Frio e opaco." }
        ],
        clothing: {
            suggestions: "Opte por tecidos leves e fluidos que acompanhem o brilho das suas cores. Evite looks totais em preto.",
            fabrics: "Seda, linho, algodão egípcio, crepe georgette.",
            patterns: "Padrões florais delicados, aguarelas, pintas contrastantes com fundo claro."
        },
        makeup: {
            foundation: "Base com subtom neutro-quente ou dourado. Acabamento glow ou acetinado.",
            blush: "Tons pêssego, coral claro, ou damasco. Evite rosas muito frios ou magnéticos.",
            lips: "Coral vibrante, vermelho tomate ou gloss dourado/pêssego.",
            eyes: "Sombras champagne, bronze claro, verde musgo ou turquesa suave."
        },
        accessories: {
            metals: "Ouro amarelo claro, ouro rosa ou cobre.",
            stones: "Coral, turquesa, pérolas creme, citrino.",
            general: "Óculos com armação dourada ou casco de tartaruga claro."
        },
        fullAnalysis: "A combinação perfeita de calor e luminosidade. A sua pele ganha vida e brilho instantâneo quando rodeada por cores claras e quentes. A sua paleta, Primavera Quente, destaca-se pela vibração e alegria. Diferente do Outono, as suas cores são limpas e não têm adição de preto, possuindo um aspeto ensolarado. Ao vestir estas cores com subtom amarelado, vai notar uma minimização das olheiras e uma pele visualmente mais uniforme e saudável."
    },
    Verão: {
        season: "Verão",
        subSeason: "Verão Frio",
        palette: [
            { name: "Lavanda", hex: "#B8A9D9", description: "Sereno e pacífico." },
            { name: "Rosa Empoeirado", hex: "#D4A5A5", description: "Romântico e nostálgico." },
            { name: "Azul Acinzentado", hex: "#7EB8C9", description: "Frio e suave." },
            { name: "Verde Menta", hex: "#98D8C8", description: "Refrescante." },
            { name: "Malva", hex: "#C9A4BC", description: "Sofisticado." },
            { name: "Pérola", hex: "#F0EAF5", description: "O seu substituto ao branco puro." },
            { name: "Rosa Bebé", hex: "#FFB6C1", description: "Doce e delicado." },
            { name: "Lilás", hex: "#C3B1E1", description: "Reflexivo." }
        ],
        colorsToAvoid: [
            { name: "Laranja", hex: "#FFA500", reason: "Demasiado quente e chocante contra a pele fria." },
            { name: "Amarelo Mostarda", hex: "#FFDB58", reason: "Dá-lhe um aspeto baço e cansado." },
            { name: "Verde Caqui", hex: "#C3B091", reason: "Opaca a luminosidade natural." },
            { name: "Castanho Quente", hex: "#8B4513", reason: "Conflito severo de subtom." }
        ],
        clothing: {
            suggestions: "As suas cores são fumadas e elegantes. Combinações monocromáticas ou tonais assentam-lhe muito bem.",
            fabrics: "Chiffon, musselina, lãs finas, tule, cetim mate.",
            patterns: "Padrões pequenos e aguarelados. Riscas finas tom-sobre-tom."
        },
        makeup: {
            foundation: "Bases com fundo frio a rosado. Evite bronzeadores pesados.",
            blush: "Rosas malva, rosas frios esfumados.",
            lips: "Cor-de-rosa velho, malva suave, cor de bagas leve.",
            eyes: "Sombras taupe, azul-claro, ameixa acinzentado, lavanda."
        },
        accessories: {
            metals: "Prata mate, ouro branco não muito reflexivo, platina escovada.",
            stones: "Quartzo rosa, ametista suave, madrepérola, ágata.",
            general: "Óculos de metal prateado fino ou massa acinzentada."
        },
        fullAnalysis: "A suavidade comanda a beleza do Verão Frio. A pele, muito clara ou ligeiramente rosada, reage melhor a cores que tenham pó ou névoa invisível — como se olhasse a cor através de vidro fumado. O preto é frequentemente muito envelhecedor nesta coloração, pois é demasiado duro em oposição aos traços delicados. Roupas nas nuances frias e acinzentadas que complementam os elementos pastéis, por outro lado, irão fornecer um brilho imediato, eliminando qualquer vermelhidão não desejada e unificando o tom de pele de forma elegante."
    },
    Outono: {
        season: "Outono",
        subSeason: "Outono Quente",
        palette: [
            { name: "Terracota", hex: "#C0583A", description: "Aconchegante e rico." },
            { name: "Cobre", hex: "#B87333", description: "Metálico e profundo." },
            { name: "Verde Musgo", hex: "#6B7B3A", description: "Terroso e orgânico." },
            { name: "Castanho Chocolate", hex: "#6B3F2A", description: "O seu neutro escuro." },
            { name: "Dourado Escuro", hex: "#B8860B", description: "Oxidado e elegante." },
            { name: "Laranja Queimado", hex: "#CC5500", description: "Vigoroso." },
            { name: "Verde Oliva", hex: "#708238", description: "Versátil." },
            { name: "Bordô", hex: "#800020", description: "Profundo e misterioso." }
        ],
        colorsToAvoid: [
            { name: "Rosa Bebé", hex: "#F4C2C2", reason: "Demasiado frágil e frio, retira a sua força." },
            { name: "Lilás", hex: "#C8A2C8", reason: "Contrasta negativamente com os pigmentos terrosos." },
            { name: "Azul Elétrico", hex: "#7DF9FF", reason: "Vibrante demais e muito frio." },
            { name: "Branco Puro", hex: "#FFFFFF", reason: "Duro e estéril na sua pele quente." }
        ],
        clothing: {
            suggestions: "Privilegie cores ricas e texturas pesadas. O branco off-white ou creme deve substituir o branco puro.",
            fabrics: "Veludo, camurça, linho pesado, bombazina, pele.",
            patterns: "Padrões animais (leopardo quente), caxemira, folhas de outono."
        },
        makeup: {
            foundation: "Bases com tons quentes e terrosos. Acabamento mate ou semi-mate.",
            blush: "Terracota, tijolo ou bronze.",
            lips: "Castanhos, vermelhos queimados, tijolo ou pêssego profundo.",
            eyes: "Sombras castanho chocolate, cobre, oliva ou verde tropa."
        },
        accessories: {
            metals: "Ouro envelhecido, bronze, latão ou cobre.",
            stones: "Âmbar, olho de tigre, jade escuro, jaspe.",
            general: "Evite metais muito brilhantes ou prateados."
        },
        fullAnalysis: "As feições apresentam uma harmonia rica e temperada. A sua coloração pede profundidade e calor. O Outono Quente partilha do subtom quente da Primavera, mas com uma intensidade mais escura e suave. Cores com adição de amarelo e preto são as que mais lhe favorecem, remetendo-nos aos dias curtos e folhas caídas do outono. Utilizar as suas cores vai conferir-lhe um ar incrivelmente elegante, saudável e exótico. Evite a todo o custo os pastéis frios, pois estes podem causar um aspeto pálido e doente."
    },
    Inverno: {
        season: "Inverno",
        subSeason: "Inverno Frio",
        palette: [
            { name: "Preto", hex: "#1A1A1A", description: "O seu neutro principal." },
            { name: "Branco Puro", hex: "#FFFFFF", description: "Limpo e cortante." },
            { name: "Azul Real", hex: "#4169E1", description: "Magnético." },
            { name: "Vermelho Cereja", hex: "#DC143C", description: "Frio e vibrante." },
            { name: "Verde Esmeralda", hex: "#50C878", description: "Cativante e luxuoso." },
            { name: "Roxo", hex: "#800080", description: "Profundo." },
            { name: "Prata", hex: "#C0C0C0", description: "Brilhante e frio." },
            { name: "Fúcsia", hex: "#FF00FF", description: "Alegre e dominante." }
        ],
        colorsToAvoid: [
            { name: "Laranja", hex: "#FFA500", reason: "Lhe confere um aspeto amarelado indesejável." },
            { name: "Bege", hex: "#F5F5DC", reason: "Demasiado quente e sem definição." },
            { name: "Castanho Terroso", hex: "#7B3F00", reason: "Apaga os seus traços fortes." },
            { name: "Verde Caqui", hex: "#F0E68C", reason: "Suaviza demasiado o seu contraste alto." }
        ],
        clothing: {
            suggestions: "O seu forte é o alto contraste e as cores vivas. Use o preto e branco a seu favor, com peças geométricas.",
            fabrics: "Seda crua, pele preta lisa, lã fria, cetim pesado.",
            patterns: "Listras contrastantes, xadrez sharp (houndstooth Preto/Branco), blocos de cores fortes."
        },
        makeup: {
            foundation: "Base com subtom frio (rosado/azulado). Acabamento porcelana.",
            blush: "Rosas frios, magenta ou fúcsia esfumado.",
            lips: "Vermelho cereja, bordô frio, roxo escuro, ou fúcsia.",
            eyes: "Delineador preto marcante, sombras prateadas, gelo ou grafite."
        },
        accessories: {
            metals: "Prata brillante, ouro branco, platina.",
            stones: "Diamantes, safiras, rubis, esmeraldas, ónix preto.",
            general: "Materiais polidos e reflexivos."
        },
        fullAnalysis: "Reflete um Inverno Frio — a rainha do contraste alto. Para a pele incrivelmente lúcida, as cores devem ser completamente frias, sem um traço de amarelo. O encanto vem da pureza inquestionável das cores intensas. Tons intermédios ou sujos tenderão a roubar o foco ou a deixar a sua pele acinzentada, ao passo que as cores intensas com muito azul na base garantem realçar os seus cabelos e a cor dos olhos, criando uma definição espetacular e uma aparência imponente e muito chique."
    }
};

/**
 * Super simple hash function to deterministically assign a season based on the subject's name.
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

const SEASONS_LIST = ["Primavera", "Verão", "Outono", "Inverno"];

export function simulateAIAnalysis(subject) {
    // Use subject name to pick a deterministic season
    const index = hashString(subject.fullName) % SEASONS_LIST.length;
    const pickedSeason = SEASONS_LIST[index];

    const seasonObj = SEASONS_DATA[pickedSeason];

    return {
        id: crypto.randomUUID(),
        subjectId: subject.id,
        clientId: subject.clientId,
        subjectName: subject.fullName,
        subjectEmail: subject.email,
        season: seasonObj.season,
        subSeason: seasonObj.subSeason,
        palette: seasonObj.palette,
        colorsToAvoid: seasonObj.colorsToAvoid,
        clothing: seasonObj.clothing,
        makeup: seasonObj.makeup,
        accessories: seasonObj.accessories,
        // Add their first name into the generic analysis for a personalized touch
        fullAnalysis: subject.fullName.split(" ")[0] + ", esta é a sua análise: " + seasonObj.fullAnalysis,
        createdAt: new Date().toISOString()
    };
}
