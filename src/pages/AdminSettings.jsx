import { useState } from "react";
import { useConfigStore } from "../stores/configStore";
import { Settings, Image as ImageIcon, Globe, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
    const { appName, appLogo, aiPrompt, setAppName, setAppLogo, setAiPrompt, resetConfig } = useConfigStore();

    const [localName, setLocalName] = useState(appName);
    const [localLogo, setLocalLogo] = useState(appLogo || "");
    const [localPrompt, setLocalPrompt] = useState(aiPrompt || "");

    const handleSave = (e) => {
        e.preventDefault();
        setAppName(localName);
        setAppLogo(localLogo || null);
        setAiPrompt(localPrompt);
        toast.success("Configurações atualizadas com sucesso!");
    };

    const handleReset = () => {
        if (window.confirm("Tem a certeza que deseja restaurar as configurações originais?")) {
            resetConfig();
            setLocalName("ChromaTest AI");
            setLocalLogo("");
            setLocalPrompt("");
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Configurações da Plataforma</h1>
                    <p className="text-slate-500 font-medium">Personalize a identidade visual e o comportamento da IA.</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Branding Form */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <Globe className="w-5 h-5 text-primary" />
                            Identidade Básica
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1.5">Nome da Plataforma</label>
                                    <input
                                        type="text"
                                        value={localName}
                                        onChange={(e) => setLocalName(e.target.value)}
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        placeholder="Ex: ChromaTest AI"
                                    />
                                    <p className="text-[11px] text-slate-500 font-medium mt-1">Este nome será exibido nos títulos, rodapés e comunicações.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1.5">URL do Logotipo</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={localLogo}
                                                onChange={(e) => setLocalLogo(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                placeholder="https://exemplo.com/logo.png"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium mt-1">Insira a URL de uma imagem (PNG/SVG preferencialmente).</p>
                                </div>
                            </div>

                            {/* Preview Area */}
                            <div className="bg-muted/30 rounded-xl p-6 border border-dashed border-border flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-4">Pré-visualização do Topo</span>
                                <div className="bg-background shadow-sm border border-border rounded-lg p-3 flex items-center gap-3 w-full max-w-[240px]">
                                    {localLogo ? (
                                        <img src={localLogo} alt="Logo" className="h-8 w-auto object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                                            <span className="text-primary font-bold text-xs">{localName[0]}</span>
                                        </div>
                                    )}
                                    <span className="font-serif font-bold text-foreground truncate">{localName}</span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium mt-4">Assim é como a sua marca aparecerá na barra lateral.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Prompt Editor */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <span className="w-5 h-5 flex items-center justify-center bg-primary text-white rounded text-[10px]">AI</span>
                            Refinamento do Prompt de Análise
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="text-blue-900 font-bold text-sm mb-1">Nota Importante</h4>
                            <p className="text-blue-800 text-xs leading-relaxed">
                                Este prompt é enviado para o GPT-4 Vision. Certifique-se de manter as instruções sobre o formato JSON, caso contrário a aplicação não conseguirá processar os resultados. Se deixar em branco, o sistema usará o prompt padrão.
                            </p>
                        </div>

                        <textarea
                            value={localPrompt}
                            onChange={(e) => setLocalPrompt(e.target.value)}
                            className="w-full h-80 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono text-sm leading-relaxed"
                            placeholder="Deixe em branco para usar o prompt padrão ou insira aqui as suas instruções personalizadas..."
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between p-6 bg-card border border-border rounded-xl shadow-sm">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-foreground transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar Padrões
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                        Salvar Todas as Configurações
                    </button>
                </div>

                {/* Info Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg shrink-0 h-fit">
                        <Settings className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-bold mb-1">Dica de Design</h3>
                        <p className="text-amber-800 text-sm leading-relaxed">
                            Para melhores resultados, utilize um logotipo com fundo transparente (PNG ou SVG) e com uma proporção preferencialmente horizontal. O nome da plataforma deve ser curto e memorável.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
