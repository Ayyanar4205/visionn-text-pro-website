import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, 
  Camera, 
  Upload, 
  FileText, 
  Download, 
  Copy, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DrawingCanvas } from './components/DrawingCanvas';
import { CameraCapture } from './components/CameraCapture';
import { ImageUpload } from './components/ImageUpload';
import { recognizeImage } from './services/geminiService';

type Mode = 'draw' | 'camera' | 'upload';

export default function App() {
  const [mode, setMode] = useState<Mode>('draw');
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<{ text: string; date: string }[]>([]);

  const handleRecognition = useCallback(async (base64: string) => {
    setIsProcessing(true);
    const text = await recognizeImage(base64);
    setResult(text);
    if (text && text !== 'Error recognizing text.' && text !== 'No text recognized.') {
      setHistory(prev => [{ text, date: new Date().toLocaleString() }, ...prev]);
    }
    setIsProcessing(false);
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("VisionText Pro Export", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
    doc.line(20, 35, 190, 35);
    
    const splitText = doc.splitTextToSize(result, 170);
    doc.text(splitText, 20, 45);
    
    doc.save(`visiontext-export-${Date.now()}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const clearResult = () => {
    setResult('');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">VisionText Pro</h1>
          </div>
          <nav className="flex bg-zinc-100 p-1 rounded-xl">
            {(['draw', 'camera', 'upload'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${mode === m ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}
                `}
              >
                {m === 'draw' && <PenTool size={16} />}
                {m === 'camera' && <Camera size={16} />}
                {m === 'upload' && <Upload size={16} />}
                <span className="capitalize">{m}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Section */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {mode === 'draw' && "Draw to Text"}
              {mode === 'camera' && "Camera OCR"}
              {mode === 'upload' && "Image to Text"}
            </h2>
            <p className="text-zinc-500">
              {mode === 'draw' && "Write or draw on the canvas below to recognize handwriting."}
              {mode === 'camera' && "Point your camera at text to extract it in real-time."}
              {mode === 'upload' && "Upload a photo or document to extract its text content."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mode === 'draw' && <DrawingCanvas onCapture={handleRecognition} isProcessing={isProcessing} />}
                {mode === 'camera' && <CameraCapture onCapture={handleRecognition} isProcessing={isProcessing} />}
                {mode === 'upload' && <ImageUpload onCapture={handleRecognition} isProcessing={isProcessing} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Output Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText size={20} />
              Recognition Result
            </h2>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={clearResult}
                  className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                  title="Clear result"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="min-h-[400px] bg-white rounded-3xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="flex-1 p-8 overflow-auto">
              {result ? (
                <div className="prose prose-zinc max-w-none">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-800">
                    {result}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                    <FileText size={32} className="opacity-20" />
                  </div>
                  <p>Results will appear here...</p>
                </div>
              )}
            </div>
            
            {result && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-3xl">
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                >
                  <Download size={20} />
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          {/* History Snippet */}
          {history.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Recent History</h3>
              <div className="space-y-2">
                {history.slice(0, 3).map((item, i) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-zinc-100 flex justify-between items-center">
                    <p className="text-sm text-zinc-600 truncate max-w-[200px]">{item.text}</p>
                    <span className="text-[10px] text-zinc-400">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-200 text-center text-zinc-400 text-sm">
        <p>© 2026 VisionText Pro • Powered by Gemini AI</p>
      </footer>
    </div>
  );
}
