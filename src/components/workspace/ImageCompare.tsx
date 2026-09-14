import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCompareProps {
  original: string | null;
  processed: string | null;
  originalLabel?: string;
  processedLabel?: string;
}

type ViewMode = 'side-by-side' | 'split-view';

export default function ImageCompare({
  original,
  processed,
  originalLabel = 'Original (Source Input)',
  processedLabel = 'Processed (Filtered Output)',
}: ImageCompareProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!original) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg bg-neutral-100 border border-border-subtle">
        <div className="text-center text-text-muted">
          <span className="material-symbols-outlined text-[40px] mb-2 block">image</span>
          <p className="text-body-sm">Upload an image to begin processing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-border-subtle w-fit">
        {[
          { mode: 'side-by-side' as ViewMode, label: 'Side-by-Side', icon: 'view_column' },
          { mode: 'split-view' as ViewMode, label: 'Split-View Slider', icon: 'compare' },
        ].map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded font-mono text-control-label transition-colors ${
              viewMode === mode
                ? 'bg-white shadow-xs border border-border-subtle text-text-primary font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Resolution Badge */}
      {original && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-text-muted">check_box</span>
          <span className="font-mono text-body-sm text-text-muted">
            Source loaded • 16-bit Grayscale or RGB
          </span>
        </div>
      )}

      {/* Image Display Area */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="chip-practical">{originalLabel}</span>
            </div>
            <div className="rounded-lg overflow-hidden bg-neutral-100 border border-border-subtle">
              <img src={original} alt="Original" className="w-full h-auto object-contain max-h-80" />
            </div>
          </div>
          {/* Processed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="chip-practical">{processedLabel}</span>
            </div>
            <div className="rounded-lg overflow-hidden bg-neutral-100 border border-border-subtle">
              {processed ? (
                <img src={processed} alt="Processed" className="w-full h-auto object-contain max-h-80 animate-fade-in" />
              ) : (
                <div className="flex items-center justify-center h-80">
                  <div className="text-center text-text-muted">
                    <span className="material-symbols-outlined text-[32px] mb-1 block">hourglass_empty</span>
                    <p className="text-body-sm">Apply an operation to see the result</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'split-view' && (
        <div
          ref={containerRef}
          className="relative rounded-lg overflow-hidden bg-neutral-100 border border-border-subtle h-80 select-none"
        >
          {/* Original (full width behind) */}
          <img src={original} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
          {/* Processed (clipped) */}
          {processed && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img src={processed} alt="Processed" className="absolute inset-0 w-full h-full object-contain" />
            </div>
          )}
          {/* Slider */}
          <div
            className="split-slider"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={handleMouseDown}
          />
          {/* Labels */}
          <div className="absolute bottom-2 left-3 chip-practical text-[9px] opacity-80">Original</div>
          <div className="absolute bottom-2 right-3 chip-practical text-[9px] opacity-80">Processed</div>
        </div>
      )}
    </div>
  );
}
