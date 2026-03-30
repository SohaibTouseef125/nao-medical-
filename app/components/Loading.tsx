'use client';

import { motion } from 'framer-motion';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.svg
      className={`${sizes[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        className="text-gray-200"
        strokeWidth="3"
        stroke="currentColor"
        fill="transparent"
        r="10"
        cx="12"
        cy="12"
      />
      <path
        className="text-blue-600"
        strokeWidth="3"
        stroke="currentColor"
        fill="transparent"
        strokeLinecap="round"
        d="M12 2a10 10 0 0 1 10 10"
      />
    </motion.svg>
  );
}

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  return (
    <motion.div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
        animate-shimmer
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
      initial={{ backgroundPosition: '-200% 0' }}
      animate={{ backgroundPosition: '200% 0' }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function DocumentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-2/3 h-4" />
      <div className="space-y-2 pt-4">
        <Skeleton variant="rectangular" className="w-full h-32" />
        <Skeleton variant="rectangular" className="w-full h-32" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <Skeleton variant="rounded" className="flex-1 h-10" />
        <Skeleton variant="rounded" className="w-20 h-10" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" className="w-24 h-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-8 h-8" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="w-3/4 h-4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
