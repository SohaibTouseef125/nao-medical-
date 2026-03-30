'use client';

import { motion } from 'framer-motion';
import { FileText, Trash2, User } from 'lucide-react';

export interface DocumentItemProps {
  id: string;
  title: string;
  updatedAt: string;
  ownerName?: string;
  isShared?: boolean;
  isActive?: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function DocumentItem({
  id,
  title,
  updatedAt,
  ownerName,
  isShared = false,
  isActive = false,
  onClick,
  onDelete,
}: DocumentItemProps) {
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02, x: 4 }}
      onClick={onClick}
      className={`
        group p-3 rounded-xl cursor-pointer transition-all duration-200
        border flex items-start gap-3
        ${isActive
          ? isShared
            ? 'bg-green-50 border-green-300 shadow-sm'
            : 'bg-blue-50 border-blue-300 shadow-sm'
          : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
        }
      `}
    >
      <div
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center shrink-0
          ${isShared
            ? 'bg-gradient-to-br from-green-400 to-green-500'
            : 'bg-gradient-to-br from-blue-400 to-blue-500'
          }
        `}
      >
        <FileText className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={`
            font-medium truncate text-sm
            ${isActive ? 'text-gray-900' : 'text-gray-700'}
          `}
        >
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{formattedDate}</span>
          {isShared && ownerName && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{ownerName}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {onDelete && !isShared && (
        <motion.button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
