import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Check } from 'lucide-react';

interface DrawingCanvasProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCapture, isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onCapture(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative border-2 border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-auto cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-300 font-medium">
            Draw or write here...
          </div>
        )}
      </div>
      
      <div className="flex gap-2 justify-end">
        <button
          onClick={clearCanvas}
          className="p-3 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
          title="Clear"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={handleCapture}
          disabled={!hasContent || isProcessing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check size={20} />
          )}
          <span>Recognize</span>
        </button>
      </div>
    </div>
  );
};
