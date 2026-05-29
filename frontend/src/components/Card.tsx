import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className, children }: CardProps) {
  return (
    <div className={cn('card p-5', className)}>
      {children}
    </div>
  );
}
