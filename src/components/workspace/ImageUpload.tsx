import { useState, useCallback, useRef } from 'react';

interface ImageUploadProps {
  onImageLoad: (imageData: string, file: File) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImageLoad,
  label = 'Drop test image matrix here',
  accept = '.png,.jpg,.jpeg,.bmp,.webp',
  maxSizeMB = 15,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndLoad = useCallback(
    (file: File) => {
      setError(null);
      const validTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.type}. Accepted: PNG, JPG, BMP, WebP`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${maxSizeMB} MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageLoad(result, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndLoad(file);
    },
    [validateAndLoad]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndLoad(file);
  };

  // Demo images
  const loadDemoImage = async (name: string) => {
    // Create a simple demo image using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (name === 'cells') {
      // Microscopy cells pattern
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 15 + Math.random() * 30;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 105}, ${200}, ${0.5 + Math.random() * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = '#88ccff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } else if (name === 'gradient') {
      // Test gradient
      for (let x = 0; x < 512; x++) {
        for (let y = 0; y < 512; y++) {
          const r = Math.floor((x / 512) * 255);
          const g = Math.floor((y / 512) * 255);
          const b = Math.floor(((512 - x) / 512) * 255);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    } else {
      // Checkerboard
      const size = 32;
      for (let x = 0; x < 512; x += size) {
        for (let y = 0; y < 512; y += size) {
          ctx.fillStyle = ((x + y) / size) % 2 === 0 ? '#f0f0f0' : '#404040';
          ctx.fillRect(x, y, size, size);
        }
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${name}.png`, { type: 'image/png' });
        const reader = new FileReader();
        reader.onload = (e) => {
          onImageLoad(e.target?.result as string, file);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/png');
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all motion-base ${
          isDragOver
            ? 'border-primary bg-red-50 scale-[0.99]'
            : 'border-border-subtle bg-neutral-100/50 hover:bg-neutral-100:bg-dark-surface-raised hover:border-border-prominent:border-neutral-500'
        }`}
      >
        <span className="material-symbols-outlined text-[32px] text-text-muted">
          upload_file
        </span>
        <div className="text-center">
          <p className="text-body-sm text-text-secondary font-medium">
            {label}
          </p>
          <p className="text-body-sm text-text-muted mt-0.5">
            or <span className="text-primary underline">Browse Local Filesystem</span> PNG, JPG, BMP, WebP
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-body-sm text-red-600">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {/* Quick Test Images */}
      <div className="flex items-center gap-2 text-body-sm">
        <span className="text-text-muted font-mono text-stat-label uppercase tracking-wider">Quick Test:</span>
        {[
          { key: 'cells', label: 'Microscopy Cells' },
          { key: 'gradient', label: 'Test Gradient' },
          { key: 'checker', label: 'Checkerboard' },
        ].map((demo) => (
          <button
            key={demo.key}
            onClick={(e) => {
              e.stopPropagation();
              loadDemoImage(demo.key);
            }}
            className="px-2 py-0.5 rounded bg-neutral-100 text-text-secondary hover:bg-border-subtle:bg-dark-border hover:text-text-primary:text-neutral-200 transition-colors border border-border-subtle text-body-sm"
          >
            {demo.label}
          </button>
        ))}
      </div>
    </div>
  );
}
