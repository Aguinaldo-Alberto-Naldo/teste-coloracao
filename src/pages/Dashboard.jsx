import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import StatusBadge from "../components/ui/StatusBadge";
import { Plus, ArrowRight, UserCircle2 } from "lucide-react";

export default function Dashboard() {
    const { currentUser } = useAuthStore();
    const { loadSubjects, getByClient } = useSubjectsStore();
    const navigate = useNavigate();

    // Load latest subjects
    useEffect(() => {
        if (currentUser?.id) {
            loadSubjects(currentUser.id);
        }
    }, [currentUser?.id, loadSubjects]);

    if (!currentUser) return null;

    const total = currentUser.creditsTotal ?? 0;
    const used = currentUser.creditsUsed ?? 0;
    const available = total - used;
    const percentage = total === 0 ? 0 : Math.round((used / total) * 100);

    const mySubjects = getByClient(currentUser.id).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const recentSubjects = mySubjects.slice(0, 4);

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Visão Geral</h1>
                <p className="text-slate-500 font-medium">Acompanhe os seus créditos e as análises mais recentes.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Credits Card */}
                <div className="bg-card shadow-sm border border-border rounded-xl p-6 md:col-span-2 relative overflow-hidden flex flex-col justify-center group/card">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover/card:bg-accent/10 transition-colors duration-700" />
                    <div className="absolute left-0 bottom-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2" />

                    <div className="flex justify-between items-start mb-6 z-10 w-full">
                        <h3 className="font-semibold text-lg text-foreground">Estado dos Créditos</h3>
                        {currentUser.currentPlan && (
                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                                {currentUser.currentPlan}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 relative z-10 w-full">
                        <div className="bg-background/80 p-4 rounded-lg border border-border/50 text-center shadow-sm">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-1">Total</p>
                            <p className="text-2xl font-bold text-foreground">{total}</p>
                        </div>
                        <div className="bg-background/80 p-4 rounded-lg border border-border/50 text-center shadow-sm">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-1">Usados</p>
                            <p className="text-2xl font-bold text-foreground">{used}</p>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 text-center shadow-[inset_0_2px_10px_rgba(124,58,237,0.05)]">
                            <p className="text-sm font-bold text-primary uppercase tracking-tight mb-1">Disponíveis</p>
                            <p className="text-2xl font-bold text-primary drop-shadow-sm">{available}</p>
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10 w-full max-w-md">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-slate-600 uppercase tracking-tight">Consumo</span>
                            <span className="font-bold text-primary">{percentage}%</span>
                        </div>
                        <div className="h-3 w-full bg-secondary border border-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* CTA Card */}
                <div className="bg-card shadow-sm border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">Nova Análise</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Submeta fotos para gerar um novo relatório.</p>
                    <button
                        onClick={() => navigate('/subjects/new')}
                        className="w-full bg-gradient-to-r from-[#db2777] to-[#4f46e5] hover:scale-[1.02] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        Adicionar Pessoa
                    </button>
                </div>
            </div>

            {/* Recent Subjects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-foreground">Análises Recentes</h2>
                    <Link to="/crm" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                        Ver todas <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentSubjects.length === 0 ? (
                    <div className="bg-card shadow-sm rounded-xl p-12 text-center border-dashed border-2 border-border">
                        <UserCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-foreground mb-2">Ainda não realizou testes</h3>
                        <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto mb-6">
                            Comece agora a usar a inteligência artificial para descobrir a paleta ideal dos seus clientes.
                        </p>
                        <button
                            onClick={() => navigate('/subjects/new')}
                            className="bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-6 rounded-lg transition-colors border border-border"
                        >
                            Iniciar Primeiro Teste
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentSubjects.map(subject => (
                            <div
                                key={subject.id}
                                className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(124,58,237,0.15)] transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => navigate(`/subjects/${subject.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 transition-transform duration-500 group-hover:scale-110 ${subject.status === "error" ? "bg-destructive/10 border-destructive/20" :
                                        subject.status === "concluído" ? "bg-success/10 border-success/20" : "bg-primary/10 border-primary/20"
                                        }`}>
                                        {subject.photoUrls?.[0] ? (
                                            <img src={subject.photoUrls[0]} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold">{subject.full_name?.charAt(0) || "?"}</span>
                                        )}
                                    </div>
                                    <StatusBadge status={subject.status} />
                                </div>

                                <h4 className="font-bold text-foreground truncate">{subject.full_name || "Sem Nome"}</h4>
                                <p className="text-xs font-bold text-slate-400 mb-4 truncate italic">{subject.email}</p>

                                <div className={`h-1 w-full absolute bottom-0 left-0 transition-all ${subject.status === "error" ? "bg-destructive/50" :
                                    subject.status === "concluído" ? "bg-success/50" : "bg-primary/50"
                                    } opacity-0 group-hover:opacity-100`} />

                                <div className="text-sm font-bold text-primary group-hover:text-primary/80 transition-colors flex items-center gap-1">
                                    {subject.status === "error" || subject.status === "processing" ? (
                                        <span className="text-destructive flex items-center gap-1">Ver Problema <ArrowRight className="w-4 h-4" /></span>
                                    ) : (
                                        <>Ver detalhes <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
