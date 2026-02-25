import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useConfigStore } from "../stores/configStore";
import { toast } from "sonner";
import { Loader2, Globe } from "lucide-react";
import authVisual from "../assets/auth_visual.png";

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Password é obrigatória"),
});

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { appLogo, appName, loadConfig } = useConfigStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success("Bem-vindo de volta!");

            // Check role after login to redirect
            const { currentUser } = useAuthStore.getState();
            if (currentUser?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message || "Credenciais inválidas. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background">
            {/* Visual Section */}
            <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden order-2 md:order-1 items-center justify-center border-r border-border">
                {/* Background image base */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 bg-no-repeat"
                    style={{ backgroundImage: `url(${authVisual})` }}
                ></div>

                {/* Dramatic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[80px] mix-blend-screen animate-pulse delay-700" />

                <div className="z-10 text-center px-12 relative max-w-2xl">
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl mb-10 shadow-2xl animate-in zoom-in-50 duration-700 overflow-hidden p-4">
                        {appLogo ? (
                            <img src={appLogo} alt={appName || "Logo"} className="max-w-full max-h-full object-contain animate-in fade-in duration-500" />
                        ) : (
                            <Globe className="w-14 h-14 text-white drop-shadow-2xl" strokeWidth={1} />
                        )}
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-black font-heading mb-8 text-white leading-tight tracking-[calc(var(--tracking-tight)*-2)]">
                        {appName?.includes("Chroma") ? (
                            <>Transforme o seu <br /> <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Olhar pela Cor</span></>
                        ) : (
                            appName || "ChromaTest AI"
                        )}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-8 rounded-full" />
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        A ciência da corometria avançada com IA, <br className="hidden lg:block" /> desenhada para elevar o seu potencial estético.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 order-1 md:order-2 relative bg-surface">
                {/* Subtle form backdrop glow */}
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 glass-card p-10 rounded-3xl relative z-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-heading font-bold text-foreground mb-2 tracking-tight">Iniciar Sessão</h2>
                        <p className="text-muted-foreground text-sm">Aceda à sua área com a máxima segurança.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full flex h-11 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                placeholder="nome@exemplo.com"
                            />
                            {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">Password</label>
                            </div>
                            <input
                                type="password"
                                {...register("password")}
                                className="w-full flex h-11 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center w-full rounded-xl text-sm font-bold transition-all h-12 px-8 shadow-lg ${isLoading
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-moving-gradient text-white transform active:scale-[0.98] hover:shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4)]'
                                }`}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar na Plataforma"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Ainda não tem conta?{" "}
                        <Link to="/register" className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors">
                            Registe-se agora
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
