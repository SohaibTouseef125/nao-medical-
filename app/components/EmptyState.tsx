'use client';

import { motion } from 'framer-motion';
import { FileText, Users, Upload, AlertCircle } from 'lucide-react';

export interface EmptyStateProps {
  variant?: 'documents' | 'shared' | 'search' | 'upload' | 'error' | 'custom';
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  variant = 'documents',
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  const defaultIcons = {
    documents: FileText,
    shared: Users,
    upload: Upload,
    search: AlertCircle,
    error: AlertCircle,
    custom: undefined,
  };

  const DefaultIcon = variant !== 'custom' ? defaultIcons[variant] : undefined;

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon || (DefaultIcon && <DefaultIcon className="w-8 h-8 text-gray-400" />)}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="flex gap-2">{action}</div>}
    </motion.div>
  );
}
