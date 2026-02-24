import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSubjectsStore } from "../stores/subjectsStore";
import StatusBadge from "../components/ui/StatusBadge";
import { Plus, ArrowRight, UserCircle2 } from "lucide-react";

export default function Dashboard() {
    const { currentUser, refreshCurrentUser } = useAuthStore();
    const { loadSubjects, getByClient } = useSubjectsStore();
    const navigate = useNavigate();

    // Load latest subjects and refresh profile credits
    useEffect(() => {
        loadSubjects();
        refreshCurrentUser();
    }, [loadSubjects, refreshCurrentUser]);

    if (!currentUser) return null;

    const total = currentUser.creditsTotal ?? 0;
    const used = currentUser.creditsUsed ?? 0;
    const available = total - used;
    const percentage = total === 0 ? 0 : Math.round((used / total) * 100);

    const mySubjects = getByClient(currentUser.id).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
                <div className="bg-card shadow-sm border border-border rounded-xl p-6 md:col-span-2 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

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
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-1">Usados</p>
                            <p className="text-2xl font-bold text-foreground">{used}</p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-center shadow-inner">
                            <p className="text-sm font-bold text-primary uppercase tracking-tight mb-1">Disponíveis</p>
                            <p className="text-2xl font-bold text-primary">{available}</p>
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
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
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
                                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => navigate(`/subjects/${subject.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                        {subject.photoUrls?.[0] ? (
                                            <img src={subject.photoUrls[0]} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold">{subject.full_name?.charAt(0) || "?"}</span>
                                        )}
                                    </div>
                                    <StatusBadge status={subject.status} />
                                </div>

                                <h4 className="font-bold text-foreground truncate">{subject.full_name || "Sem Nome"}</h4>
                                <p className="text-xs font-bold text-slate-500 mb-4 truncate italic">{subject.email}</p>

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
