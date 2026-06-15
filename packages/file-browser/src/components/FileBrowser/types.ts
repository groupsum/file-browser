export type FileType = 'file' | 'folder';

export interface FileVersion {
  id: string;
  updatedAt: string;
  size: number;
  userId?: string;
  author?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  parentId?: string | null;
  size?: number;
  updatedAt: string;
  versions?: FileVersion[];
  mimeType?: string;
  previewUrl?: string; // Optional URL for image/video preview
}

export interface FileBrowserProps {
  /** Array of file and folder nodes */
  data: FileNode[];
  /** Controlled selected item IDs */
  selectedIds?: string[];
  /** On selection change */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when an item is moved (drag and drop) */
  onMove?: (sourceId: string, targetId: string | null) => void;
  /** Callback when a folder is opened/toggled in tree view */
  onToggleFolder?: (folderId: string, isOpen: boolean) => void;
  /** Callback when an item is double-clicked or "preview" is triggered */
  onPreview?: (file: FileNode) => void;
  /** Callback when an item is explicitly opened (e.g. double clicked) */
  onOpen?: (item: FileNode) => void;
  /** Callback when a file download is explicitly requested */
  onDownload?: (item: FileNode) => void;
  /** Callback for context menu actions */
  onAction?: (action: 'delete' | 'rename' | 'download' | 'restore' | 'history', file: FileNode, extra?: any) => void;
  /** Callback to handle "Create New" from empty states */
  onCreateNew?: (parentId: string | null) => void;
  /** Real-time sync status indicator */
  syncStatus?: 'synced' | 'syncing' | 'error';
  /** External class names */
  className?: string;
  /** Enable dark mode manually, otherwise follows system preference if not set */
  theme?: 'light' | 'dark' | 'system';
  /** If true, disables drag-and-drop, creation, and modification actions */
  readOnly?: boolean;
  /** Optionally display an incremental index numbering (e.g. 1.1, 1.2) next to items */
  showIndex?: boolean;
}

export interface DragItem {
  id: string;
  type: FileType;
}

export interface SortConfig {
  column: 'name' | 'date' | 'size';
  direction: 'asc' | 'desc';
}
