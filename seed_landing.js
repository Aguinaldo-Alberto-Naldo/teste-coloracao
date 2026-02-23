import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sabtjjwipavqszcrvixo.supabase.co';
const supabaseAnonKey = 'sb_publishable_LiJVz3q5WNHmbyoMmEk-yA_OEZLu252';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_LANDING_CONTENT = {
    hero: {
        title: "Descubra o Poder das Suas Cores",
        subtitle: "A primeira ferramenta de análise de coloração pessoal baseada em IA em Angola. Sofisticação e precisão no seu atendimento.",
        ctaText: "Começar Agora",
        stats: [
            { value: "500", label: "Profissionais", suffix: "+" },
            { value: "10000", label: "Análises", suffix: "+" },
            { value: "99", label: "Precisão", suffix: "%" }
        ],
        showcases: ["Consultoras", "Stylists", "Lojas", "Maquilhadoras"]
    },
    howItWorks: {
        title: "Simples e Elegante",
        headline: "Três passos para a transformação",
        steps: [
            { num: "1", title: "Carregamento", desc: "Capture ou carregue uma fotografia com iluminação natural." },
            { num: "2", title: "Processamento", desc: "A nossa IA analisa tons de pele, olhos e contraste." },
            { num: "3", title: "Relatório", desc: "Receba um dossier completo de 20+ páginas em segundos." }
        ]
    },
    services: {
        headline: "A Ciência das Cores ao seu Serviço",
        features: [
            { title: "Precisão IA", desc: "Algoritmos treinados em mais de 10.000 perfis de coloração." },
            { title: "Exportação PDF", desc: "Gere relatórios profissionais prontos para entregar ao cliente." },
            { title: "Gestão CRM", desc: "Guarde o histórico de todos os seus clientes num só lugar." },
            { title: "Paletas Digitais", desc: "Acesso imediato às paletas das 12 estações sazonais." }
        ],
        extraText: "A ferramenta mais avançada para consultoras de imagem que procuram escalar o seu negócio sem perder a qualidade do diagnóstico."
    },
    pricing: {
        headline: "Investimento no seu Sucesso",
        subheadline: "Escolha o pack que melhor se adapta ao volume do seu negócio.",
        activationInfo: "Os créditos são ativados imediatamente após a confirmação do pagamento. Cada análise gasta 1 crédito."
    },
    faq: {
        headline: "Perguntas Frequentes",
        items: [
            { q: "A análise substitui o teste presencial?", a: "A IA serve como um suporte de alta precisão, podendo ser usada de forma autónoma ou para validar diagnósticos presenciais." },
            { q: "Quanto tempo demora a análise?", a: "O processamento demora entre 5 a 15 segundos, dependendo da ligação à internet." },
            { q: "Posso personalizar o relatório?", a: "Sim, como administrador pode ajustar os textos base dos relatórios nas definições." }
        ]
    },
    cta: {
        headline: "Pronta para elevar o seu atendimento?",
        subheadline: "Junte-se a centenas de profissionais que já modernizaram a sua consultoria.",
        btnText: "Criar Conta Grátis"
    },
    footer: {
        description: "ChromaTest AI - Liderando a inovação em coloração pessoal em Angola.",
        contactEmail: "suporte@chromatest.ai",
        socialLinks: { instagram: "https://instagram.com/chromatest" },
        copyright: "© 2026 ChromaTest AI. Todos os direitos reservados."
    }
};

async function seed() {
    console.log("Seeding landing page content...");
    const { error } = await supabase
        .from('site_config')
        .upsert({
            key: 'landing_page',
            content: DEFAULT_LANDING_CONTENT,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error("Error seeding:", error.message);
    } else {
        console.log("Landing page content seeded successfully!");
    }
}

seed();
