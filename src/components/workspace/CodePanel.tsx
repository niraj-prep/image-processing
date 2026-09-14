import { useState, useRef } from 'react';

interface CodePanelProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodePanel({ code, language = 'Python 3.11', title }: CodePanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simple syntax highlighting
  const highlightCode = (rawCode: string) => {
    return rawCode
      .replace(/(#.*$)/gm, '<span class="text-neutral-500 italic">$1</span>')
      .replace(
        /\b(import|from|as|def|return|if|else|elif|for|while|in|not|and|or|True|False|None|print|with|class|try|except|finally|raise|lambda|yield|pass|break|continue)\b/g,
        '<span class="text-red-500 font-medium">$1</span>'
      )
      .replace(
        /\b(cv2|np|plt|numpy|matplotlib|math)\b/g,
        '<span class="text-orange-500">$1</span>'
      )
      .replace(
        /(&#39;[^&#39;]*&#39;|'[^']*'|"[^"]*")/g,
        '<span class="text-emerald-600">$1</span>'
      )
      .replace(
        /\b(\d+\.?\d*)\b/g,
        '<span class="text-blue-500">$1</span>'
      );
  };

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-neutral-50:bg-dark-surface-raised transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">terminal</span>
          <span className="font-geist text-headline-sm font-semibold text-text-primary">
            {title || `Python / OpenCV Implementation`}
          </span>
          <span className="font-mono text-badge-label bg-neutral-100 px-1.5 py-0.5 rounded text-text-muted border border-border-subtle">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-100 border border-border-subtle text-body-sm text-text-secondary hover:text-text-primary:text-neutral-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span className="font-mono text-control-label">
                {copied ? 'Copied!' : 'Copy Script'}
              </span>
            </button>
          )}
          <span
            className={`material-symbols-outlined text-[20px] text-text-muted transition-transform motion-fast ${
              open ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Code Block */}
      {open && (
        <div className="bg-neutral-50 border-t border-border-subtle animate-fade-in">
          <pre
            ref={codeRef}
            className="p-4 overflow-x-auto font-mono text-code-block text-text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          />
        </div>
      )}
    </div>
  );
}
