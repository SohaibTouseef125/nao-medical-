'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children?: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-xl transition-all duration-200';

  const variants = {
    default: 'shadow-sm border border-gray-200',
    elevated: 'shadow-lg border border-gray-200',
    outlined: 'border-2 border-gray-200 shadow-none',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 cursor-pointer'
    : '';

  // Extract conflicting props that motion doesn't need
  const { onDrag, onDragStart, onDragEnd, ...restProps } = props as any;

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      whileHover={hoverable ? { scale: 1.01 } : undefined}
      whileTap={hoverable ? { scale: 0.99 } : undefined}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center justify-between mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center gap-2 pt-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
