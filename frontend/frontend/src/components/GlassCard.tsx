import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: Props) {
  return (
    <div className={`glass rounded-3xl p-6 ${hover ? 'glass-hover transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}