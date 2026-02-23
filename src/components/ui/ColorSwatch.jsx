import { toast } from "sonner";
import { Copy } from "lucide-react";

export default function ColorSwatch({ color }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(color.hex);
        toast.success(`Cor ${color.name} copiada!`);
    };

    return (
        <div
            className="flex flex-col items-center group cursor-pointer"
            onClick={handleCopy}
        >
            <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-surface shadow-lg mb-3 transition-transform group-hover:scale-110 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: color.hex }}
            >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
            <h5 className="text-sm font-semibold text-foreground text-center">{color.name}</h5>
            <p className="text-xs text-muted uppercase tracking-wider">{color.hex}</p>
        </div>
    );
}
