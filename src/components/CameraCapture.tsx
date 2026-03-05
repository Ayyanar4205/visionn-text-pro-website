import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/png');
    setCapturedImage(base64);
    stopCamera();
  };

  const handleRecognize = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-800">
        {!stream && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-400">
            <Camera size={48} className="opacity-20" />
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors"
            >
              Start Camera
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}

        {stream && !capturedImage && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-all active:scale-90"
              >
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>
            </div>
          </>
        )}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {capturedImage && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={reset}
            className="p-3 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
            title="Retake"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleRecognize}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg shadow-black/10"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={20} />
            )}
            <span>Recognize Text</span>
          </button>
        </div>
      )}
    </div>
  );
};
