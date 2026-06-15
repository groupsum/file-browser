import React, { useState, useCallback, useMemo } from 'react';
import { FileNode, FileBrowserProps, SortConfig } from './types';

export function useFileBrowser({
  data,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
}: Pick<FileBrowserProps, 'data' | 'selectedIds' | 'onSelectionChange'>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });

  const selectedIds = useMemo(() => {
    if (controlledSelectedIds) return new Set(controlledSelectedIds);
    return internalSelectedIds;
  }, [controlledSelectedIds, internalSelectedIds]);

  const toggleSelection = useCallback((id: string, multi: boolean) => {
    let newSelection = new Set(selectedIds);
    if (!multi) {
      if (newSelection.has(id) && newSelection.size === 1) {
        newSelection.clear();
      } else {
        newSelection.clear();
        newSelection.add(id);
      }
    } else {
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
    }

    if (!controlledSelectedIds) {
      setInternalSelectedIds(newSelection);
    }
    onSelectionChange?.(Array.from(newSelection) as string[]);
  }, [selectedIds, controlledSelectedIds, onSelectionChange]);

  const clearSelection = useCallback(() => {
    if (!controlledSelectedIds) {
      setInternalSelectedIds(new Set());
    }
    onSelectionChange?.([]);
  }, [controlledSelectedIds, onSelectionChange]);

  const selectAll = useCallback((ids: string[]) => {
    const newSelection = new Set(ids);
    if (!controlledSelectedIds) {
      setInternalSelectedIds(newSelection);
    }
    onSelectionChange?.(Array.from(newSelection) as string[]);
  }, [controlledSelectedIds, onSelectionChange]);

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSort = useCallback((column: 'name' | 'date' | 'size') => {
    setSortConfig(prev => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  }, []);

  const getFilteredAndSorted = useCallback((parentId: string | null) => {
    let result = data;

    // When searching, flatten the view entirely and filter by name
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = data.filter(item => item.name.toLowerCase().includes(q));
    } else {
      // Standard folder view filtering
      result = data.filter(item => (item.parentId || null) === parentId);
    }

    result = [...result].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      // Folders always sorted first when sorting by name (asc)
      if (sortConfig.column === 'name') {
        if (a.type !== b.type) {
          if (sortConfig.direction === 'asc') return a.type === 'folder' ? -1 : 1;
          return a.type === 'folder' ? 1 : -1;
        }
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortConfig.column === 'date') {
        valA = new Date(a.updatedAt).getTime();
        valB = new Date(b.updatedAt).getTime();
      } else if (sortConfig.column === 'size') {
        valA = a.type === 'folder' ? 0 : (a.size || 0);
        valB = b.type === 'folder' ? 0 : (b.size || 0);
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchQuery, sortConfig]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string, type: 'file' | 'folder', parentId?: string | null) => {
    if (e.key === 'Enter') {
      if (type === 'folder') {
        toggleFolder(id);
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleSelection(id, e.ctrlKey || e.metaKey || e.shiftKey);
    } else if (e.key === 'ArrowRight' && type === 'folder') {
      if (!expandedFolders.has(id)) toggleFolder(id);
    } else if (e.key === 'ArrowLeft') {
      if (type === 'folder' && expandedFolders.has(id)) {
        toggleFolder(id);
      }
    }
  }, [toggleFolder, toggleSelection, expandedFolders, data]);

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectAll,
    expandedFolders,
    toggleFolder,
    focusedId,
    setFocusedId,
    handleKeyDown,
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
    getFilteredAndSorted,
  };
}
