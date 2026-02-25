import { useState, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { User, Mail, Lock, Camera, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
    const { currentUser, updateProfile, updateEmail, updatePassword, uploadAvatar } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [fullName, setFullName] = useState(currentUser?.fullName || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("A imagem deve ser menor que 2MB");
            return;
        }

        try {
            setUploading(true);
            const publicUrl = await uploadAvatar(file);
            setAvatarUrl(publicUrl);
            toast.success("Foto carregada com sucesso!");
        } catch {
            toast.error("Erro ao carregar foto");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateProfile({ fullName, avatarUrl });
            toast.success("Perfil atualizado com sucesso!");
        } catch {
            toast.error("Erro ao atualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateEmail(email);
            toast.success("Email atualizado! Verifique a sua caixa de entrada.");
        } catch {
            toast.error("Erro ao atualizar email");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }
        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        try {
            setLoading(true);
            await updatePassword(password);
            setPassword("");
            setConfirmPassword("");
            toast.success("Senha atualizada com sucesso!");
        } catch {
            toast.error("Erro ao atualizar senha");
        } finally {
            setLoading(false);
        }
    };

    const initial = (fullName || currentUser?.email || "?").charAt(0).toUpperCase();

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">A Minha Conta</h1>
                    <p className="text-slate-500 font-medium">Gira as tuas informações pessoais e definições de segurança.</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <User className="w-5 h-5 text-primary" />
                            Perfil Público
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div
                                        onClick={handleAvatarClick}
                                        className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer group-hover:ring-4 group-hover:ring-primary/20 transition-all shadow-inner"
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-primary">{initial}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white mb-1" />
                                            <span className="text-[10px] text-white font-bold uppercase">Mudar Foto</span>
                                        </div>
                                    </div>
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>

                                <div className="flex-1 w-full space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-1.5">Nome Completo</label>
                                        <div className="relative">
                                            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                placeholder="O teu nome"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? "A Guardar..." : "Guardar Perfil"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Account & Security */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Email Update */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border bg-muted/20">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <Mail className="w-5 h-5 text-primary" />
                                Alterar Email
                            </h2>
                        </div>
                        <div className="p-6 flex-1">
                            <form onSubmit={handleUpdateEmail} className="space-y-4 h-full flex flex-col justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 mb-4 font-medium italic">
                                        Nota: Irá receber um email de confirmação no novo endereço para validar a alteração.
                                    </p>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                            placeholder="novo@email.com"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50 mt-6"
                                >
                                    Atualizar Email
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Password Update */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border bg-muted/20">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <Lock className="w-5 h-5 text-primary" />
                                Alterar Senha
                            </h2>
                        </div>
                        <div className="p-6 flex-1 text-foreground">
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Nova senha"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Confirmar nova senha"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50 mt-2"
                                >
                                    Atualizar Senha
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
