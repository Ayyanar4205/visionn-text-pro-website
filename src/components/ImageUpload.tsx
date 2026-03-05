import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, X } from 'lucide-react';

interface ImageUploadProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onCapture, isProcessing }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onCapture]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: isProcessing
  } as any);

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
        ${isDragActive ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
        <Upload size={32} />
      </div>
      <div className="text-center">
        <p className="font-medium text-zinc-900">
          {isDragActive ? 'Drop the image here' : 'Click or drag image to upload'}
        </p>
        <p className="text-sm text-zinc-500 mt-1">Supports PNG, JPG, WEBP</p>
      </div>
      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 text-zinc-600 font-medium">
          <div className="w-4 h-4 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
          Processing...
        </div>
      )}
    </div>
  );
};
