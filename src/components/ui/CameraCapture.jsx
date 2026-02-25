import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CameraCapture({ onCapture, onClose }) {
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            toast.error("Não foi possível aceder à câmara. Verifique as permissões.");
            onClose();
        }
    }, [onClose]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);



    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirm = () => {
        if (capturedImage) {
            // Convert dataUrl to File
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
                    onCapture(file);
                    onClose();
                });
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-video bg-slate-900 overflow-hidden sm:rounded-3xl shadow-2xl border border-white/10">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />
                        <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none rounded-[inherit]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-white/50 border-dashed rounded-[40%] pointer-events-none" />

                        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                            <button
                                onClick={takePhoto}
                                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform p-1 borer-4 border-slate-300"
                            >
                                <div className="w-full h-full rounded-full border-4 border-slate-900 flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-slate-900" />
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                            <button
                                onClick={retake}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
                            >
                                <RefreshCw className="w-5 h-5" /> Repetir
                            </button>
                            <button
                                onClick={confirm}
                                className="bg-gradient-to-r from-[#db2777] to-[#4f46e5] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/40 transition-all active:scale-95"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Confirmar
                            </button>
                        </div>
                    </>
                )}
            </div>

            <p className="mt-8 text-white/60 font-medium text-sm text-center px-10">
                {capturedImage ? "A foto parece-lhe bem? Garanta que o rosto está bem iluminado." : "Posicione o seu rosto no guia central e tire a fotografia."}
            </p>

            <canvas ref={canvasRef} className="hidden" />

            <style dangerouslySetInnerHTML={{ __html: `.mirror { transform: scaleX(-1); }` }} />
        </div>
    );
}
