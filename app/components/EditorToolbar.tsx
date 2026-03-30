'use client';

import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
} from 'lucide-react';

export interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive = false, tooltip, children }: ToolbarButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      title={tooltip}
      className={`
        p-2 rounded-lg transition-all duration-150
        flex items-center justify-center cursor-pointer
        ${isActive
          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

export interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onShare: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function EditorToolbar({
  onFormat,
  onShare,
  onSave,
  isSaving = false,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-xl">
      {/* Text Formatting */}
      <ToolbarButton onClick={() => onFormat('bold')} tooltip="Bold (Ctrl+B)">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => onFormat('italic')} tooltip="Italic (Ctrl+I)">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => onFormat('underline')} tooltip="Underline (Ctrl+U)">
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <ToolbarButton onClick={() => onFormat('formatBlock', 'H1')} tooltip="Heading 1">
        <Type className="w-4 h-4" />
        <span className="ml-1 text-xs font-bold">H1</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => onFormat('formatBlock', 'H2')} tooltip="Heading 2">
        <span className="text-xs font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => onFormat('formatBlock', 'H3')} tooltip="Heading 3">
        <span className="text-xs font-bold">H3</span>
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <ToolbarButton onClick={() => onFormat('insertUnorderedList')} tooltip="Bullet List">
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => onFormat('insertOrderedList')} tooltip="Numbered List">
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        {isSaving && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 flex items-center gap-1"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Saving...
          </motion.span>
        )}
        <motion.button
          onClick={onShare}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Share
        </motion.button>
        <motion.button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </motion.button>
      </div>
    </div>
  );
}
