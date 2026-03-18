import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import Tooltip from './Tooltip';

interface ChartInfoPopoverProps {
  /** Chart/section title shown in popover header */
  title: string;
  /** Description of what the chart displays (in English) */
  description: string;
}

export default function ChartInfoPopover({ title, description }: ChartInfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <Tooltip content="What does this chart show?">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center text-surface-400 hover:text-primary-500 transition-colors p-0.5"
          aria-label={`Info about ${title}`}
        >
          <Info className="w-4 h-4" />
        </button>
      </Tooltip>
      {open && (
        <div className="absolute z-50 top-full right-0 mt-1.5 w-72">
          <div className="bg-white border border-surface-200 rounded-lg shadow-lg p-3">
            <div className="text-sm font-semibold text-surface-800 mb-1.5">{title}</div>
            <p className="text-xs text-surface-600 leading-relaxed">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
