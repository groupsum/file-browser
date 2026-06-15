import React, { useRef } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Image as ImageIcon, FileText, Music, Video, History, Code, Archive, Terminal, Download } from 'lucide-react';
import { FileNode } from './types';
import './FileExplorerItem.css';

interface FileExplorerItemProps {
  item: FileNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  searchQuery?: string;
  onToggleExpand: () => void;
  onSelect: (multi: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onStartDrag?: (e: React.DragEvent) => void;
  onDropItem?: (e: React.DragEvent) => void;
  onDragOverItem?: (e: React.DragEvent) => void;
  onDragLeaveItem?: (e: React.DragEvent) => void;
  onDoubleClick: () => void;
  onActionClick: (action: 'history' | 'download') => void;
  readOnly?: boolean;
  itemIndex?: string;
}

const getIcon = (item: FileNode) => {
  if (item.type === 'folder') {
    return <Folder size={18} className="text-blue-500 flex-shrink-0 fill-blue-500/20" />;
  }

  const mime = item.mimeType || '';
  if (mime.startsWith('image/')) return <ImageIcon size={18} className="text-green-500 flex-shrink-0" />;
  if (mime.startsWith('video/')) return <Video size={18} className="text-purple-500 flex-shrink-0" />;
  if (mime.startsWith('audio/')) return <Music size={18} className="text-yellow-500 flex-shrink-0" />;
  if (mime === 'application/pdf') return <FileText size={18} className="text-red-500 flex-shrink-0" />;
  if (mime === 'application/zip' || mime === 'application/x-tar') return <Archive size={18} className="text-orange-500 flex-shrink-0" />;
  if (mime === 'text/html' || mime === 'application/javascript' || mime === 'text/css' || mime === 'application/json') return <Code size={18} className="text-slate-500 flex-shrink-0" />;
  if (mime === 'application/x-sh' || mime === 'application/x-bash') return <Terminal size={18} className="text-slate-700 flex-shrink-0" />;

  if (item.name.endsWith('.md') || item.name.endsWith('.txt')) return <FileText size={18} className="text-gray-500 flex-shrink-0" />;
  if (item.name.endsWith('.pdf')) return <FileText size={18} className="text-red-500 flex-shrink-0" />;
  if (item.name.match(/\.(js|ts|jsx|tsx|css|html|json)$/)) return <Code size={18} className="text-slate-500 flex-shrink-0" />;
  if (item.name.match(/\.(zip|tar|gz|rar)$/)) return <Archive size={18} className="text-orange-500 flex-shrink-0" />;

  return <File size={18} className="text-gray-500 flex-shrink-0" />;
};

const formatSize = (bytes?: number) => {
  if (bytes === undefined) return '--';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const HighlightMatch = ({ text, query }: { text: string; query?: string }) => {
  if (!query) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-blue-900 dark:text-blue-100 rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </span>
  );
};

export function FileExplorerItem({
  item,
  level,
  isSelected,
  isExpanded,
  hasChildren,
  searchQuery,
  onToggleExpand,
  onSelect,
  onKeyDown,
  onStartDrag,
  onDropItem,
  onDragOverItem,
  onDragLeaveItem,
  onDoubleClick,
  onActionClick,
  readOnly,
  itemIndex,
}: FileExplorerItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e.ctrlKey || e.metaKey || e.shiftKey);
  };

  const handleExpanderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  const getMarginClass = (depth: number) => {
    switch (depth) {
      case 0: return 'ml-0';
      case 1: return 'ml-2 sm:ml-6';
      case 2: return 'ml-4 sm:ml-12';
      case 3: return 'ml-6 sm:ml-16';
      case 4: return 'ml-8 sm:ml-24';
      case 5: return 'ml-10 sm:ml-32';
      case 6: return 'ml-12 sm:ml-40';
      case 7: return 'ml-14 sm:ml-48';
      case 8: return 'ml-16 sm:ml-56';
      case 9: return 'ml-18 sm:ml-64';
      case 10: return 'ml-20 sm:ml-72';
      default: return 'ml-24 sm:ml-80';
    }
  };

  return (
    <div
      ref={itemRef}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={item.type === 'folder' ? isExpanded : undefined}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={onKeyDown}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      draggable={!readOnly}
      onDragStart={!readOnly ? onStartDrag : undefined}
      onDrop={!readOnly ? onDropItem : undefined}
      onDragOver={!readOnly ? onDragOverItem : undefined}
      onDragLeave={!readOnly ? onDragLeaveItem : undefined}
      className={`
        group flex items-center justify-between py-1.5 px-2 cursor-pointer select-none
        border-b border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
        transition-colors duration-150 ease-in-out pl-2
        ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'}
      `}
    >
      <div
        className={`flex items-center gap-2 flex-grow min-w-0 pr-4 ${getMarginClass(level)}`}
      >
        {/* Expander Icon or Placeholder */}
        <div
          className={`w-5 h-5 flex items-center justify-center -ml-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${item.type === 'folder' && !searchQuery ? '' : 'invisible'}`}
          onClick={item.type === 'folder' && !searchQuery ? handleExpanderClick : undefined}
        >
          {item.type === 'folder' && !searchQuery && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </div>

        {getIcon(item)}

        {itemIndex && (
          <span className="text-gray-400 dark:text-gray-500 text-xs font-mono select-none">
            {itemIndex}
          </span>
        )}
        <span className="truncate text-sm font-medium">
          <HighlightMatch text={item.name} query={searchQuery} />
        </span>
      </div>

      <div className="flex items-center flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
        <span className="w-28 text-right hidden sm:inline-block pr-4 truncate">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
        <span className="w-20 text-right hidden md:inline-block pr-4">
          {item.type === 'folder' ? '--' : formatSize(item.size)}
        </span>
        <div className="w-16 flex items-center justify-end gap-1">
          {item.type === 'file' && (
            <button
              onClick={(e) => { e.stopPropagation(); onActionClick('download'); }}
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-800 transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Download File"
              aria-label={`Download ${item.name}`}
            >
              <Download size={14} />
            </button>
          )}
          {item.versions && item.versions.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onActionClick('history'); }}
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-800 transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="View History"
              aria-label={`View history for ${item.name}`}
            >
              <History size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
