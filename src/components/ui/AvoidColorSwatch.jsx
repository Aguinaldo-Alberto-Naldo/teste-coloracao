import { toast } from "sonner";
import { XCircle } from "lucide-react";

export default function AvoidColorSwatch({ color }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(color.hex);
        toast.success(`Cor ${color.name} copiada!`);
    };

    return (
        <div
            className="flex flex-col items-center group cursor-pointer relative"
            onClick={handleCopy}
        >
            <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-surface shadow-lg mb-2 transition-transform group-hover:scale-105 opacity-80 group-hover:opacity-100 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: color.hex }}
            >
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white/80" />
                </div>
            </div>
            <h5 className="text-sm font-semibold text-foreground text-center line-through decoration-destructive decoration-2">{color.name}</h5>
            <p className="text-xs text-muted mt-1 text-center line-clamp-2 max-w-[120px]">{color.reason}</p>
        </div>
    );
}
