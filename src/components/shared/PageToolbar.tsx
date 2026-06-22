import type { ReactNode } from 'react';
import { CustomizeButton } from './PageCustomizer';

interface PageToolbarProps {
  children?: ReactNode;
  onCustomize: () => void;
  trailing?: ReactNode;
  className?: string;
}

export default function PageToolbar({
  children,
  onCustomize,
  trailing,
  className = '',
}: PageToolbarProps) {
  return (
    <div className={`flex items-center justify-between bg-white border-b border-surface-200 ${className}`}>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex items-center gap-2 pr-4 flex-shrink-0">
        {trailing}
        <CustomizeButton onClick={onCustomize} />
      </div>
    </div>
  );
}
