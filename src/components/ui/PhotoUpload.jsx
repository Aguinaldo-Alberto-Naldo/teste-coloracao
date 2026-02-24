import { useState, useRef } from "react";
import { UploadCloud, X, Camera } from "lucide-react";
import CameraCapture from "./CameraCapture";

export default function PhotoUpload({ onChange }) {
    const [previews, setPreviews] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const addFiles = (files) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));

        if (validFiles.length !== files.length) {
            alert("Formato não suportado. Por favor, envie apenas JPG, PNG, WEBP ou GIF.");
            return;
        }

        if (previews.length + validFiles.length > 3) {
            alert("Apenas pode enviar até 3 fotografias.");
            return;
        }

        const newPreviews = [];
        let loaded = 0;

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                newPreviews.push({
                    file,
                    preview: event.target.result
                });
                loaded++;
                if (loaded === validFiles.length) {
                    const updated = [...previews, ...newPreviews];
                    setPreviews(updated);
                    onChange(updated);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleCapture = (file) => {
        addFiles([file]);
    };

    const removePhoto = (index) => {
        const updated = previews.filter((_, i) => i !== index);
        setPreviews(updated);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center ${previews.length >= 3
                        ? "border-white/5 bg-surface/50 opacity-50 cursor-not-allowed"
                        : "border-primary/50 hover:bg-primary/5 cursor-pointer bg-surface"
                        }`}
                    onClick={() => {
                        if (previews.length < 3) fileInputRef.current?.click();
                    }}
                >
                    <UploadCloud className="w-10 h-10 text-primary-light mb-4" />
                    <h4 className="font-bold text-foreground mb-1">Anexar Fotos</h4>
                    <p className="text-[10px] text-muted max-w-[150px] mx-auto">
                        JPG, PNG ou WEBP da sua galeria.
                    </p>
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center ${previews.length >= 3
                        ? "border-white/5 bg-surface/50 opacity-50 cursor-not-allowed"
                        : "border-accent/40 hover:bg-accent/5 cursor-pointer bg-surface"
                        }`}
                    onClick={() => {
                        if (previews.length < 3) setShowCamera(true);
                    }}
                >
                    <Camera className="w-10 h-10 text-accent mb-4" />
                    <h4 className="font-bold text-foreground mb-1 text-accent">Tirar Foto</h4>
                    <p className="text-[10px] text-muted max-w-[150px] mx-auto">
                        Usar a câmara em tempo real.
                    </p>
                </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-medium">
                {previews.length} de 3 fotografias adicionadas
            </p>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp, image/gif"
                multiple
                className="hidden"
                disabled={previews.length >= 3}
            />

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                    {previews.map((photoObj, index) => (
                        <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border shadow-sm group animate-in zoom-in-50">
                            <img src={photoObj.preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showCamera && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </div>
    );
}
