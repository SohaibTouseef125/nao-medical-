'use client';

import { User } from 'lucide-react';

export interface AvatarProps {
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showInitial?: boolean;
}

export function Avatar({ name, email, size = 'md', showInitial = true }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColorForName(name);

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center text-white font-semibold shrink-0`}
      title={name}
    >
      {showInitial ? (
        <span>{initial}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  );
}

function getColorForName(name: string): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
    'from-cyan-500 to-cyan-600',
  ];

  const index = name.length % colors.length;
  return colors[index];
}
