import { useEffect, useState, useRef } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  accentColor?: 'red' | 'orange' | 'emerald' | 'default';
}

export default function StatCard({ label, value, unit, icon, accentColor = 'default' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);
  const prevValueRef = useRef(value);

  // Count-up animation for numeric values
  useEffect(() => {
    if (typeof value === 'number' && typeof prevValueRef.current === 'number') {
      const start = prevValueRef.current as number;
      const end = value;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = start + (end - start) * eased;
        setDisplayValue(Number.isInteger(end) ? Math.round(current) : Number(current.toFixed(2)));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
    prevValueRef.current = value;
  }, [value]);

  const accentStyles = {
    red: 'border-l-primary',
    orange: 'border-l-secondary',
    emerald: 'border-l-emerald-500',
    default: 'border-l-border-prominent',
  };

  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-lg bg-white border border-border-subtle border-l-[3px] ${accentStyles[accentColor]} shadow-xs motion-fast hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="material-symbols-outlined text-[14px] text-text-muted">
            {icon}
          </span>
        )}
        <span className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-stat-value text-text-primary tabular-nums">
          {displayValue}
        </span>
        {unit && (
          <span className="font-mono text-control-label text-text-muted">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
