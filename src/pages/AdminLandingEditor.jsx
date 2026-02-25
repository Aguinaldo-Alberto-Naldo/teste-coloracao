import { useState, useEffect } from "react";

import { useLandingStore } from "../stores/landingStore";
import { useConfigStore } from "../stores/configStore";
import { toast } from "sonner";
import { Save, RefreshCw, ChevronDown, ChevronUp, Plus, Trash2, Upload, Trash, Image as ImageIcon } from "lucide-react";

const SectionHeader = ({ id, number, title, expandedSection, setExpandedSection }) => (
    <div
        className="flex justify-between items-center cursor-pointer p-4 hover:bg-white/5 transition-colors rounded-t-xl"
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
    >
        <h3 className="text-lg font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{number}</span>
            {title}
        </h3>
        {expandedSection === id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
    </div>
);

export default function AdminLandingEditor() {
    const { content, loadContent, loading: landingLoading, updateContent, resetContent } = useLandingStore();
    const { appName, appLogo, loadConfig, loading: configLoading, setAppName, setAppLogo, uploadLogo } = useConfigStore();
    const [formData, setFormData] = useState(null);
    const [expandedSection, setExpandedSection] = useState('general');
    const [localAppName, setLocalAppName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!content) {
            loadContent();
        } else if (!formData) {
            setFormData(content);
        }

        loadConfig();
    }, [content, loadContent, loadConfig, formData]);

    useEffect(() => {
        if (appName) {
            setLocalAppName(appName);
        }
    }, [appName]);

    const loading = landingLoading || configLoading;


    if (loading || !formData) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNestedChange = (section, collection, index, field, value) => {
        const newCollection = [...formData[section][collection]];
        newCollection[index] = { ...newCollection[index], [field]: value };
        handleChange(section, collection, newCollection);
    };

    const handleArrayChange = (section, field, index, value) => {
        const newArray = [...formData[section][field]];
        newArray[index] = value;
        handleChange(section, field, newArray);
    };

    const addFaqItem = () => {
        const newItems = [...formData.faq.items, { q: "Nova pergunta?", a: "Nova resposta..." }];
        handleChange('faq', 'items', newItems);
    };

    const removeFaqItem = (index) => {
        const newItems = formData.faq.items.filter((_, i) => i !== index);
        handleChange('faq', 'items', newItems);
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadLogo(file);
            await setAppLogo(url);
            toast.success("Logotipo atualizado com sucesso!");
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Erro ao carregar o logotipo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveLogo = async () => {
        if (window.confirm("Tem a certeza que deseja remover o logotipo?")) {
            await setAppLogo(null);
            toast.info("Logotipo removido.");
        }
    };

    const handleSaveGeneral = async () => {
        await setAppName(localAppName);
        toast.success("Configurações gerais atualizadas!");
    };

    const handleSave = () => {
        updateContent(formData);
        handleSaveGeneral();
        toast.success("Landing Page e Configurações atualizadas!");
    };

    const handleReset = () => {
        if (window.confirm("Deseja repor o conteúdo de fábrica da Landing Page?")) {
            resetContent();
            toast.info("Conteúdo reposto.");
        }
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-border">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground mb-1">Editor da Landing Page</h1>
                    <p className="text-sm text-slate-500 font-medium">Ajuste os textos de todas as secções da página pública.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors border border-border text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> Repor Originais
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors shadow-sm font-medium">
                        <Save className="w-4 h-4" /> Gravar Alterações
                    </button>
                </div>
            </div>

            <div className="space-y-4">

                {/* 0. CONFIGURAÇÕES GERAIS */}
                <div className="glass-card rounded-xl border border-primary/20 overflow-hidden transition-all duration-300 shadow-sm mb-6">
                    <SectionHeader id="general" number="0" title="Configurações Gerais (Logo & Nome)" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'general' && (
                        <div className="p-6 pt-2 space-y-6 border-t border-border bg-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Nome da Aplicação</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={localAppName}
                                                onChange={(e) => setLocalAppName(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:ring-primary outline-none font-medium"
                                                placeholder="Ex: ChromaTest AI"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic">Este nome aparece no título da página e em vários locais da plataforma.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Logotipo da Plataforma</label>
                                    <div className="flex items-center gap-6 p-4 bg-background/50 rounded-xl border border-dashed border-border">
                                        <div className="w-20 h-20 rounded-lg bg-surface flex items-center justify-center overflow-hidden border border-border shrink-0">
                                            {appLogo ? (
                                                <img src={appLogo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-muted opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition-all ${isUploading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}>
                                                    <Upload className="w-4 h-4" />
                                                    {isUploading ? "A carregar..." : "Carregar Logo"}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                                                </label>
                                                {appLogo && (
                                                    <button onClick={handleRemoveLogo} className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-border">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Recomendado: PNG ou SVG com fundo transparente. Máx 1MB.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 1. HERO */}
                <div className="glass-card rounded-xl border border-border overflow-hidden transition-all duration-300">
                    <SectionHeader id="hero" number="1" title="Banner (Hero)" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'hero' && (
                        <div className="p-6 pt-2 space-y-4 border-t border-border bg-white/5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Título Principal</label>
                                <textarea rows={2} value={formData.hero.title} onChange={(e) => handleChange('hero', 'title', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-primary outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Subtítulo</label>
                                <textarea rows={3} value={formData.hero.subtitle} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-primary outline-none resize-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Botão (Call to Action)</label>
                                <input type="text" value={formData.hero.ctaText} onChange={(e) => handleChange('hero', 'ctaText', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-primary outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">Estatísticas</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {formData.hero.stats.map((stat, idx) => (
                                        <div key={idx} className="space-y-2 bg-background p-3 rounded border border-border">
                                            <input value={stat.value} onChange={(e) => handleNestedChange('hero', 'stats', idx, 'value', e.target.value)} placeholder="Valor" className="w-full px-2 py-1 text-sm bg-surface border border-input rounded" />
                                            <input value={stat.label} onChange={(e) => handleNestedChange('hero', 'stats', idx, 'label', e.target.value)} placeholder="Rótulo" className="w-full px-2 py-1 text-sm bg-surface border border-input rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Profissões Alvo (Provas Sociais)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {formData.hero.showcases.map((prof, idx) => (
                                        <input key={idx} type="text" value={prof} onChange={(e) => handleArrayChange('hero', 'showcases', idx, e.target.value)} className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-lg focus:ring-primary outline-none" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. COMO FUNCIONA */}
                <div className="glass-card rounded-xl border border-border overflow-hidden transition-all duration-300">
                    <SectionHeader id="howItWorks" number="2" title="Como Funciona" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'howItWorks' && (
                        <div className="p-6 pt-2 space-y-4 border-t border-border bg-white/5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Pequeno Título</label>
                                    <input type="text" value={formData.howItWorks.title} onChange={(e) => handleChange('howItWorks', 'title', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Frase Principal</label>
                                    <input type="text" value={formData.howItWorks.headline} onChange={(e) => handleChange('howItWorks', 'headline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                <label className="block text-sm font-bold text-foreground">Passos</label>
                                {formData.howItWorks.steps.map((step, idx) => (
                                    <div key={idx} className="bg-background p-4 rounded-lg border border-border flex gap-4">
                                        <div className="text-2xl font-serif text-primary opacity-50">{step.num}</div>
                                        <div className="flex-1 space-y-2">
                                            <input type="text" value={step.title} onChange={(e) => handleNestedChange('howItWorks', 'steps', idx, 'title', e.target.value)} className="w-full px-3 py-1 bg-surface border border-input rounded text-sm font-bold" />
                                            <textarea rows={2} value={step.desc} onChange={(e) => handleNestedChange('howItWorks', 'steps', idx, 'desc', e.target.value)} className="w-full px-3 py-1 bg-surface border border-input rounded text-sm resize-none" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. SERVIÇOS & RELATÓRIO */}
                <div className="glass-card rounded-xl border border-border overflow-hidden transition-all duration-300">
                    <SectionHeader id="services" number="3" title="Serviços & Relatório" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'services' && (
                        <div className="p-6 pt-2 space-y-4 border-t border-border bg-white/5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Frase Principal</label>
                                <textarea rows={2} value={formData.services.headline} onChange={(e) => handleChange('services', 'headline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {formData.services.features.map((feat, idx) => (
                                    <div key={idx} className="bg-background p-3 rounded border border-border space-y-2">
                                        <input type="text" value={feat.title} onChange={(e) => handleNestedChange('services', 'features', idx, 'title', e.target.value)} className="w-full px-2 py-1 bg-surface border border-input rounded text-sm font-bold" />
                                        <textarea rows={2} value={feat.desc} onChange={(e) => handleNestedChange('services', 'features', idx, 'desc', e.target.value)} className="w-full px-2 py-1 bg-surface border border-input rounded text-xs resize-none" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Rodapé Extra (Features curtas)</label>
                                <input type="text" value={formData.services.extraText} onChange={(e) => handleChange('services', 'extraText', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none text-sm font-medium" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. PREÇOS */}
                <div className="glass-card rounded-xl border border-border overflow-hidden transition-all duration-300">
                    <SectionHeader id="pricing" number="4" title="Preços" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'pricing' && (
                        <div className="p-6 pt-2 space-y-4 border-t border-border bg-white/5">
                            <p className="text-xs text-primary mb-4">Nota: Os pacotes em si são geridos no menu "Preços & Pacotes". Aqui ajusta apenas os textos da secção.</p>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Frase Principal</label>
                                <textarea rows={2} value={formData.pricing.headline} onChange={(e) => handleChange('pricing', 'headline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Subtítulo</label>
                                <textarea rows={2} value={formData.pricing.subheadline} onChange={(e) => handleChange('pricing', 'subheadline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Caixa de Info de Activação</label>
                                <textarea rows={3} value={formData.pricing.activationInfo} onChange={(e) => handleChange('pricing', 'activationInfo', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none text-sm font-medium" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. FAQ */}
                <div className="glass-card rounded-xl border border-border overflow-hidden transition-all duration-300">
                    <SectionHeader id="faq" number="5" title="Perguntas Frequentes (FAQ)" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'faq' && (
                        <div className="p-6 pt-2 space-y-4 border-t border-border bg-white/5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Frase Principal</label>
                                <input type="text" value={formData.faq.headline} onChange={(e) => handleChange('faq', 'headline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none mb-4 font-medium" />
                            </div>

                            <div className="space-y-3">
                                {formData.faq.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-background p-3 rounded-lg border border-border">
                                        <div className="flex-1 space-y-2">
                                            <input type="text" value={item.q} onChange={(e) => handleNestedChange('faq', 'items', idx, 'q', e.target.value)} className="w-full px-3 py-1.5 bg-surface border border-input rounded text-sm font-bold placeholder-muted" placeholder="Pergunta" />
                                            <textarea rows={2} value={item.a} onChange={(e) => handleNestedChange('faq', 'items', idx, 'a', e.target.value)} className="w-full px-3 py-1.5 bg-surface border border-input rounded text-sm resize-none placeholder-muted" placeholder="Resposta" />
                                        </div>
                                        <button onClick={() => removeFaqItem(idx)} className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded transition-colors" title="Remover Faq">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={addFaqItem} className="w-full py-3 border-2 border-dashed border-border text-muted hover:text-foreground hover:border-primary/50 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors mt-2">
                                <Plus className="w-4 h-4" /> Adicionar Pergunta
                            </button>
                        </div>
                    )}
                </div>

                {/* 6. FINAL CTA & FOOTER */}
                <div className="glass-card rounded-xl border border-border overflow-hidden transition-all duration-300">
                    <SectionHeader id="ctaFooter" number="6" title="Call to Action & Rodapé" expandedSection={expandedSection} setExpandedSection={setExpandedSection} />
                    {expandedSection === 'ctaFooter' && (
                        <div className="p-6 pt-2 space-y-6 border-t border-border bg-white/5">
                            <div className="space-y-4">
                                <h4 className="font-bold text-foreground text-sm uppercase tracking-widest border-b border-border pb-2">Bloco de Fecho (CTA)</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Título Grande</label>
                                    <textarea rows={2} value={formData.cta.headline} onChange={(e) => handleChange('cta', 'headline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Subtítulo</label>
                                    <textarea rows={2} value={formData.cta.subheadline} onChange={(e) => handleChange('cta', 'subheadline', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Botão</label>
                                    <input type="text" value={formData.cta.btnText} onChange={(e) => handleChange('cta', 'btnText', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                            </div>

                            <div className="space-y-4 mt-8 pt-4">
                                <h4 className="font-bold text-foreground text-sm uppercase tracking-widest border-b border-border pb-2">Rodapé</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Descrição Curta</label>
                                    <input type="text" value={formData.footer.description} onChange={(e) => handleChange('footer', 'description', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Email Visível</label>
                                        <input type="email" value={formData.footer.contactEmail} onChange={(e) => handleChange('footer', 'contactEmail', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Instagram Link</label>
                                        <input type="url" value={formData.footer.socialLinks.instagram} onChange={(e) => {
                                            const newSocials = { ...formData.footer.socialLinks, instagram: e.target.value };
                                            handleChange('footer', 'socialLinks', newSocials);
                                        }} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Copyright</label>
                                    <input type="text" value={formData.footer.copyright} onChange={(e) => handleChange('footer', 'copyright', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none font-medium" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
