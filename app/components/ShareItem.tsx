'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface ShareItemProps {
  email: string;
  name: string;
  onRemove: () => void;
}

export function ShareItem({ email, name, onRemove }: ShareItemProps) {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColorForEmail(email);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center text-white font-medium text-sm`}
        >
          {initial}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
      </div>
      <motion.button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function getColorForEmail(email: string): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
  ];
  const index = email.length % colors.length;
  return colors[index];
}
