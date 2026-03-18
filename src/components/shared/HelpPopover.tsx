import { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HelpPopoverProps {
  text: string;
  linkTo?: string;
  linkLabel?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export default function HelpPopover({
  text,
  linkTo = '/help',
  linkLabel = 'Learn more',
  position = 'bottom-left',
}: HelpPopoverProps) {
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

  const positionClasses: Record<string, string> = {
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2',
    'top-left': 'bottom-full right-0 mb-2',
    'top-right': 'bottom-full left-0 mb-2',
  };

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4 text-surface-400 hover:text-primary-500 cursor-pointer transition-colors" />
      </button>
      {open && (
        <div className={`absolute z-50 ${positionClasses[position]} w-64`}>
          <div className="bg-white border border-surface-200 rounded-lg shadow-lg p-3">
            <p className="text-xs text-surface-600 leading-relaxed">{text}</p>
            <Link
              to={linkTo}
              className="inline-block mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {linkLabel} &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
