import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function GlobalError() {
    const error = useRouteError();
    console.error("Global Route Error Caught:", error);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-center border border-red-100">
                <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Oops! Algo correu mal.</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Pedimos desculpa pelo inconveniente. Ocorreu um erro inesperado ao carregar esta página. A nossa equipa já foi notificada.
                </p>

                {error?.message && (
                    <div className="bg-slate-100 rounded-lg p-4 mb-8 text-left overflow-auto text-xs font-mono text-slate-600 border border-slate-200">
                        {error.message}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Tentar Novamente
                    </button>
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                    >
                        <Home className="w-4 h-4" /> Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
