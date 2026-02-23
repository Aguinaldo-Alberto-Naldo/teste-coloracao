import { useState, useRef } from "react";
import { UploadCloud, X } from "lucide-react";

export default function PhotoUpload({ onChange }) {
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));

        if (validFiles.length !== files.length) {
            alert("Formato não suportado. Por favor, envie apenas JPG, PNG, WEBP ou GIF.");
            return;
        }

        // Max 3 photos
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
                    file, // Pass the actual File object to ensure we have the correct type and name upstream
                    preview: event.target.result
                });
                loaded++;
                if (loaded === validFiles.length) {
                    const updated = [...previews, ...newPreviews];
                    setPreviews(updated);
                    onChange(updated); // Pass back array of { file, preview }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        const updated = previews.filter((_, i) => i !== index);
        setPreviews(updated);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${previews.length >= 3
                    ? "border-white/5 bg-surface/50 opacity-50 cursor-not-allowed"
                    : "border-primary/50 hover:bg-primary/5 cursor-pointer bg-surface"
                    }`}
                onClick={() => {
                    if (previews.length < 3) fileInputRef.current?.click();
                }}
            >
                <UploadCloud className="w-10 h-10 text-primary-light mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-1">Upload de Fotografias</h4>
                <p className="text-xs text-muted">
                    Fotografias sem maquilhagem e com boa luz natural de frente para a câmara. Limitadas a JPG, PNG e WEBP.
                </p>
                <p className="text-xs font-semibold mt-4 text-accent">
                    {previews.length} / 3 adicionadas
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
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {previews.map((photoObj, index) => (
                        <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group">
                            <img src={photoObj.preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-black/50 hover:bg-destructive text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
