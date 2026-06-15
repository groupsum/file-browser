import React, { useState, useCallback } from 'react';
import { Cloud, CloudOff, RefreshCw, ChevronRight, ChevronUp, ChevronDown, Search, PlusCircle, FolderOpen } from 'lucide-react';
import { FileExplorerProps } from './types';
import { useFileExplorer } from './useFileExplorer';
import { FileExplorerItem } from './FileExplorerItem';
import './FileExplorer.css';

export function FileExplorer({
  data,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onMove,
  onToggleFolder,
  onPreview,
  onOpen,
  onDownload,
  onAction,
  onCreateNew,
  syncStatus = 'synced',
  className = '',
  theme = 'system',
  readOnly = false,
  showIndex = false
}: FileExplorerProps) {
  const {
    selectedIds,
    toggleSelection,
    clearSelection,
    expandedFolders,
    toggleFolder,
    handleKeyDown,
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
    getFilteredAndSorted,
  } = useFileExplorer({ data, selectedIds: controlledSelectedIds, onSelectionChange });

  const [draggedIds, setDraggedIds] = useState<string[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    const idsToDrag = selectedIds.has(id) ? Array.from(selectedIds) : [id];
    setDraggedIds(idsToDrag);
    e.dataTransfer.setData('application/json', JSON.stringify({ ids: idsToDrag }));
    e.dataTransfer.effectAllowed = 'move';

    if (idsToDrag.length > 1) {
      const dragBadge = document.createElement('div');
      dragBadge.innerText = `${idsToDrag.length} items`;
      dragBadge.style.position = 'absolute';
      dragBadge.style.top = '-1000px';
      dragBadge.style.background = '#2563eb';
      dragBadge.style.color = '#fff';
      dragBadge.style.padding = '4px 8px';
      dragBadge.style.borderRadius = '4px';
      dragBadge.style.fontSize = '12px';
      dragBadge.style.fontWeight = 'bold';
      dragBadge.style.zIndex = '9999';
      document.body.appendChild(dragBadge);
      e.dataTransfer.setDragImage(dragBadge, -10, -10);
      setTimeout(() => document.body.removeChild(dragBadge), 0);
    }
  }, [selectedIds]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();

    setDragOverId(null);
    if (draggedIds.length === 0) return;

    const isSelfDrop = draggedIds.includes(targetId || '');
    if (isSelfDrop) return;

    draggedIds.forEach(id => {
      onMove?.(id, targetId);
    });

    setDraggedIds([]);
  }, [draggedIds, onMove]);

  const renderTree = (parentId: string | null = null, level: number = 0, indexPrefix: string = '') => {
    const children = getFilteredAndSorted(parentId);
    if (children.length === 0) return null;

    return children.map((item, index) => {
      const isExpanded = expandedFolders.has(item.id);
      const isSelected = selectedIds.has(item.id);
      const isDragOver = dragOverId === item.id;
      // Do not query grandchildren iteratively if we are using the filtered flat view from search
      const hasChildren = searchQuery ? false : getFilteredAndSorted(item.id).length > 0;
      const currentIndex = indexPrefix ? `${indexPrefix}.${index + 1}` : `${index + 1}`;

      return (
        <div key={item.id} role="group" className="relative transition-all duration-200">
          <div className={`${isDragOver ? 'bg-blue-50 dark:bg-blue-900/50 outline outline-2 outline-blue-500 rounded -outline-offset-2' : ''}`}>
             <FileExplorerItem
                item={item}
                level={searchQuery ? 0 : level}
                isSelected={isSelected}
                isExpanded={isExpanded}
                hasChildren={hasChildren}
                searchQuery={searchQuery}
                onToggleExpand={() => {
                  toggleFolder(item.id);
                  onToggleFolder?.(item.id, !isExpanded);
                }}
                onSelect={(multi) => toggleSelection(item.id, multi)}
                onKeyDown={(e) => handleKeyDown(e, item.id, item.type, item.parentId)}
                onStartDrag={(e) => handleDragStart(e, item.id)}
                onDropItem={(e) => {
                  if (item.type === 'folder') {
                    handleDrop(e, item.id);
                  }
                }}
                onDragOverItem={(e) => {
                  e.preventDefault();
                  if (item.type === 'folder' && !draggedIds.includes(item.id)) {
                    setDragOverId(item.id);
                  }
                }}
                onDragLeaveItem={(e) => {
                  e.preventDefault();
                  if (dragOverId === item.id) setDragOverId(null);
                }}
                onDoubleClick={() => {
                  if (item.type === 'folder') {
                    toggleFolder(item.id);
                  } else {
                    onPreview?.(item);
                  }
                  onOpen?.(item);
                }}
                onActionClick={(action) => {
                  if (action === 'download' && onDownload) {
                    onDownload(item);
                  } else {
                    onAction?.(action, item);
                  }
                }}
                readOnly={readOnly}
                itemIndex={showIndex ? currentIndex : undefined}
              />
          </div>
          {isExpanded && item.type === 'folder' && !searchQuery && (
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isExpanded ? 'max-h-[5000px] opacity-100 mt-0' : 'max-h-0 opacity-0'}
            `}>
              {renderTree(item.id, level + 1, currentIndex)}
            </div>
          )}
        </div>
      );
    });
  };

  const visibleItems = getFilteredAndSorted(null);

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 ${className} ${theme === 'dark' ? 'dark' : ''} ${theme === 'system' ? 'dark:dark' : ''}`}
      onClick={() => clearSelection()}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 rounded-t-lg">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-sans">Files</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${data.length} total items`}
            </span>
          </div>
          {/* On mobile devices, show a sleek miniature cloud status connected to title */}
          <div className="sm:hidden flex items-center justify-center p-1 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
            {syncStatus === 'synced' && <Cloud size={12} className="text-green-500" />}
            {syncStatus === 'syncing' && <RefreshCw size={12} className="text-blue-500 animate-spin" />}
            {syncStatus === 'error' && <CloudOff size={12} className="text-red-500" />}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
             <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               placeholder="Search files..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-8 pr-3 py-1.5 sm:py-1 text-xs bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 shadow-sm"
             />
          </div>
          {/* On desktop view, show full text cloud label */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
            {syncStatus === 'synced' && (
              <>
                 <Cloud size={14} className="text-green-500" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Synced</span>
              </>
            )}
            {syncStatus === 'syncing' && (
              <>
                 <RefreshCw size={14} className="text-blue-500 animate-spin" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Syncing</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                 <CloudOff size={14} className="text-red-500" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center py-2 px-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 select-none sticky top-0 z-10 transition-colors">
        <div className="flex-grow flex items-center cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 pl-[2.25rem] min-w-0 pr-4" onClick={() => toggleSort('name')}>
          <span className="mr-1">Name</span>
          {sortConfig.column === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <div className="w-3.5 h-3.5" />}
        </div>
        <div className="flex items-center flex-shrink-0">
           <div className="w-28 text-right hidden sm:flex items-center justify-end cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 pr-4" onClick={() => toggleSort('date')}>
             <span className="mr-1">Date Modified</span>
             {sortConfig.column === 'date' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <div className="w-3.5 h-3.5" />}
           </div>
           <div className="w-20 text-right hidden md:flex items-center justify-end cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 pr-4" onClick={() => toggleSort('size')}>
             <span className="mr-1">Size</span>
             {sortConfig.column === 'size' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <div className="w-3.5 h-3.5" />}
           </div>
           <div className="w-8"></div>
        </div>
      </div>

      {/* Explorer Tree Container */}
      <div
        className={`
          flex-1 overflow-y-auto outline-none custom-scrollbar p-1 pb-4
          ${!readOnly && dragOverId === null && draggedIds.length > 0 ? 'bg-blue-50/30' : ''}
        `}
        role="tree"
        aria-multiselectable="true"
        tabIndex={0}
        onDrop={!readOnly ? (e) => handleDrop(e, null) : undefined}
        onDragOver={!readOnly ? (e) => {
          e.preventDefault();
          if (!dragOverId) e.dataTransfer.dropEffect = 'move';
        } : undefined}
        onDragLeave={!readOnly ? (e) => {} : undefined}
      >
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center bg-transparent mt-4">
            <div className="w-20 h-20 mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">
              {searchQuery ? <Search size={32} /> : <FolderOpen size={32} className="ml-1" />}
            </div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">
              {searchQuery ? 'No results found' : 'This folder is empty'}
            </h3>
            <p className="text-xs mb-6 max-w-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `No files or folders matched "${searchQuery}". Try a different term or clear the search.`
                : (!readOnly ? "Get started by creating a new file or folder, or dragging existing ones here." : "No items to display.")}
            </p>
            {!searchQuery && !readOnly && (
              <button
                onClick={(e) => { e.stopPropagation(); onCreateNew?.(null); }}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium w-full sm:w-auto ring-1 ring-inset ring-blue-700"
              >
                <PlusCircle size={16} />
                <span>Create New</span>
              </button>
            )}
          </div>
        ) : (
          renderTree(null, 0)
        )}
      </div>
    </div>
  );
}
