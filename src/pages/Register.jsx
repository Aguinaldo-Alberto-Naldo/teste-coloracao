import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import authVisual from "../assets/auth_visual.png";

const registerSchema = z.object({
    fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Password deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As passwords não coincidem",
    path: ["confirmPassword"],
});

export default function Register() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await registerUser(data);
            toast.success("Conta criada com sucesso!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Registration error:", err);
            toast.error(err.message || "Erro ao criar conta.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background">
            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 order-1">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-card p-10 rounded-2xl shadow-sm border border-border">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Criar Conta</h2>
                        <p className="text-muted-foreground text-sm">Junte-se ao ChromaTest AI para as suas análises.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Nome Completo</label>
                            <input
                                type="text"
                                {...register("fullName")}
                                className="w-full flex h-11 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                placeholder="Sofia Almeida"
                            />
                            {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message}</span>}
                        </div>

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
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <input
                                type="password"
                                {...register("password")}
                                className="w-full flex h-11 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirmar Password</label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                className="w-full flex h-11 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-11 px-8 mt-4"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registar"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Já tem conta?{" "}
                        <Link to="/login" className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors">
                            Iniciar sessão
                        </Link>
                    </p>
                </div>
            </div>

            {/* Visual Section */}
            <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden order-2 items-center justify-center border-l border-border">
                {/* Background image base */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 bg-no-repeat"
                    style={{ backgroundImage: `url(${authVisual})` }}
                ></div>

                {/* Dramatic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-transparent" />

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[80px] mix-blend-screen animate-pulse delay-700" />

                <div className="z-10 text-center px-12 relative max-w-2xl">
                    <h1 className="text-5xl lg:text-6xl font-black font-heading mb-8 text-white leading-tight tracking-[calc(var(--tracking-tight)*-2)]">
                        O Início da sua <br /> <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Jornada Cromática</span>
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-accent to-primary mx-auto mb-8 rounded-full" />
                    <p className="text-xl text-slate-300 font-medium leading-relaxed">
                        Aumente a sua faturação e proporcione uma experiência única aos seus clientes com análises precisas e automatizadas.
                    </p>
                </div>
            </div>
        </div>
    );
}
