import React, { useState, useCallback, useEffect } from 'react';
import { FileExplorer, FileNode } from './components/FileExplorer';
import { mockData } from './data/mockData';
import { Moon, Sun, Monitor, Github, Download, Trash2, PlayCircle } from 'lucide-react';
import './App.css';

export default function App() {
  const [data, setData] = useState<FileNode[]>(mockData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [activeTab, setActiveTab] = useState<'demo' | 'api' | 'usage'>('demo');
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [showIndex, setShowIndex] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  useEffect(() => {
    if (syncStatus === 'syncing') {
      const timer = setTimeout(() => {
        setSyncStatus('synced');
        addLog('Cloud sync completed successfully.');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleMove = useCallback((sourceId: string, targetId: string | null) => {
    setData((prevData) => {
      const newData = [...prevData];
      const sourceIndex = newData.findIndex(item => item.id === sourceId);

      if (sourceIndex > -1) {
        newData[sourceIndex] = { ...newData[sourceIndex], parentId: targetId };
        setSyncStatus('syncing');

        const sourceName = newData[sourceIndex].name;
        const targetName = targetId ? newData.find(i => i.id === targetId)?.name : 'Root';
        addLog(`Moved "${sourceName}" to "${targetName}". Triggering sync...`);
      }

      return newData;
    });
  }, []);

  const handleAction = (action: string, file: FileNode) => {
    if (action === 'history') {
       addLog(`Viewed versions for "${file.name}". (${file.versions?.length || 0} versions found)`);
    } else {
       addLog(`Action triggered: ${action} on "${file.name}"`);
    }
  };

  const handleCreateNew = (parentId: string | null) => {
    const newNode: FileNode = {
      id: `new-${Date.now()}`,
      name: 'New Folder',
      type: 'folder',
      parentId,
      updatedAt: new Date().toISOString(),
    };
    setData(prev => [...prev, newNode]);
    addLog(`Created "New Folder" matching empty state action.`);
    setSyncStatus('syncing');
  };

  const handleActionSelected = (action: string) => {
    if (selectedIds.length === 0) return;
    addLog(`Bulk action triggered: ${action} on ${selectedIds.length} items.`);

    if (action === 'delete') {
      setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setSyncStatus('syncing');
    }
  };

  const handlePreview = (file: FileNode) => {
    setPreviewFile(file);
    addLog(`Opened preview for: ${file.name}`);
  };

  const handleOpen = (item: FileNode) => {
    addLog(`Fired onOpen for: ${item.name} (${item.type})`);
  };

  const handleDownload = (item: FileNode) => {
    addLog(`Fired explicit onDownload for: ${item.name}`);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Handle mock data specifically empty states demo
  const triggerEmptyState = () => {
    setData([]);
    addLog('Emptied all directories to test empty states.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-lg leading-tight">Groupsum File Explorer</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-mono">v0.1.0 - UNLICENSED</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-0.5 sm:p-1 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setTheme('light')}
              className={`p-1 sm:p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Light Mode"
            >
              <Sun size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 sm:p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Dark Mode"
            >
              <Moon size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1 sm:p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="System Preference"
            >
              <Monitor size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Github size={18} className="sm:w-5 sm:h-5" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-[calc(100vh-73px)] lg:h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 overflow-y-auto lg:overflow-hidden">

        <div className="lg:col-span-1 space-y-6 flex flex-col h-auto lg:h-full overflow-y-auto custom-scrollbar pr-0 lg:pr-2 pb-4 lg:pb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Portable & Reusable.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              A high-performance file explorer component built for React. Features complete drag-and-drop, real-time search filtering, deep breadcrumb navigation, sorting, and native accessible keyboard support.
            </p>
          </div>

          <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-800">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'demo' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('demo')}
            >
              Interactive Demo
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'api' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('api')}
            >
              API & Types
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'usage' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('usage')}
            >
              Usage Guide
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'demo' && (
               <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between items-start">
                    <div className="w-full">
                       <h3 className="font-semibold mb-2 text-sm">Action Dispatcher Log</h3>
                       <div className="h-40 overflow-y-auto bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded p-2 custom-scrollbar font-mono text-[11px] leading-tight text-slate-600 dark:text-slate-400">
                         {logs.length === 0 ? <span className="opacity-50 italic">Interact with the explorer to see events...</span> : logs.map((l, i) => (
                           <div key={i} className="mb-1 border-b border-gray-200 dark:border-slate-800 pb-1 last:border-0">{l}</div>
                         ))}
                       </div>
                    </div>
                    <button
                      onClick={triggerEmptyState}
                      className="mt-3 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Delete all data (Test Empty States)
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold mb-2 text-sm">Features Demonstrated</h3>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-4">
                      <li><strong>Accordion Expansion</strong>: Double click a folder to toggle its expanded state.</li>
                      <li><strong>Sortable Columns</strong>: Click "Name", "Date Modified", or "Size" headers to flip sorting order.</li>
                      <li><strong>Live Search Filtering</strong>: Use the top-right search box for instant flattened matching.</li>
                      <li><strong>Empty States</strong>: If a folder is empty, contextual graphics and actions are shown.</li>
                      <li><strong>MIME Map Mapping</strong>: Icons uniquely adapt to file type contexts (Images, Code, PDFs, Zips).</li>
                    </ul>
                  </div>
               </div>
            )}

            {activeTab === 'api' && (
              <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-sm space-y-4">
<pre className="text-blue-600 dark:text-blue-400">
{`interface FileExplorerProps {
  data: FileNode[];
  selectedIds?: string[];
  syncStatus?: 'synced' | 'syncing' | 'error';
  theme?: 'light' | 'dark' | 'system';
  readOnly?: boolean;
  showIndex?: boolean;

  onSelectionChange?: (ids: string[]) => void;
  onMove?: (srcId: string, targetId: string | null) => void;
  onPreview?: (file: FileNode) => void;
  onOpen?: (item: FileNode) => void;
  onDownload?: (item: FileNode) => void;
  onAction?: (action: string, file: FileNode) => void;
  onCreateNew?: (parentId: string | null) => void;
}`}
</pre>
<pre className="text-purple-600 dark:text-purple-500">
{`interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string | null;
  size?: number;
  updatedAt: string;
  versions?: FileVersion[];
  mimeType?: string;
  previewUrl?: string;
}`}
</pre>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-sm">
<pre className="text-green-600 dark:text-green-400">
{`npm install @groupsum/file-explorer lucide-react

import { FileExplorer } from '@groupsum/file-explorer';

function App() {
  return (
    <FileExplorer
      data={myData}
      syncStatus={status}
      onMove={handleUpload}
      onCreateNew={handleCreate}
    />
  );
}`}
</pre>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col h-[520px] lg:h-full bg-transparent overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10">

          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-3 sm:px-4 py-3 sm:py-2 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
             <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setReadOnly(!readOnly)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium border rounded-md shadow-sm transition ${readOnly ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  <span className="hidden sm:inline">{readOnly ? 'Read Only: ON' : 'Read Only: OFF'}</span>
                  <span className="sm:hidden">{readOnly ? 'Locked' : 'Editable'}</span>
                </button>
                <button
                  onClick={() => setShowIndex(!showIndex)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium border rounded-md shadow-sm transition ${showIndex ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  <span className="hidden sm:inline">{showIndex ? 'Index: ON' : 'Index: OFF'}</span>
                  <span className="sm:hidden">{showIndex ? 'Index' : 'No Index'}</span>
                </button>
                <div className="w-px h-5 bg-gray-300 dark:bg-slate-700 mx-0.5" />
                <button
                  disabled={selectedIds.length === 0}
                  onClick={() => handleActionSelected('download')}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  title="Download Selected"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  disabled={selectedIds.length === 0 || readOnly}
                  onClick={() => handleActionSelected('delete')}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Delete Selected"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
             </div>

             <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium sm:px-2 self-start sm:self-auto">
               Workspace View
             </div>
          </div>

          <div className="flex-1 bg-gray-50/50 dark:bg-slate-950/50 p-2 sm:p-4 lg:p-6 overflow-hidden">
             <FileExplorer
                data={data}
                selectedIds={selectedIds}
                onSelectionChange={(ids) => {
                  setSelectedIds(ids);
                  if (ids.length > 0) addLog(`Selection changed: ${ids.length} items`);
                }}
                onMove={handleMove}
                onPreview={handlePreview}
                onOpen={handleOpen}
                onDownload={handleDownload}
                onAction={handleAction}
                onCreateNew={handleCreateNew}
                syncStatus={syncStatus}
                theme={theme}
                readOnly={readOnly}
                showIndex={showIndex}
                className="h-full border shadow-sm"
             />
          </div>
        </div>

      </main>

      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700 scale-100 transition-transform" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
              <h3 className="font-semibold flex items-center gap-2">
                <PlayCircle size={18} className="text-blue-500"/>
                {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-200/50 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close Preview"
              >
                &times;
              </button>
            </div>
            <div className="h-96 flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-950 overflow-hidden text-center p-8 text-gray-500">
               {previewFile.mimeType?.startsWith('image/') ? (
                   <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/40 rounded flex items-center justify-center mb-4">
                     <span className="text-4xl text-blue-500">IMG</span>
                   </div>
               ) : (
                  <div className="w-32 h-40 bg-gray-200 dark:bg-slate-800 rounded border border-gray-300 dark:border-slate-700 shadow-md flex items-center justify-center mb-4">
                    <span className="text-xl text-gray-400 font-mono">FILE</span>
                  </div>
               )}
               <p className="font-medium text-lg text-gray-700 dark:text-gray-300 mb-2">{previewFile.name}</p>
               <p className="text-sm">MIME Type: {previewFile.mimeType || 'unknown'}</p>
               <p className="text-sm">Last Modified: {new Date(previewFile.updatedAt).toLocaleString()}</p>
               <p className="text-sm mt-4 italic max-w-md">This is a simulated preview viewport for the reusable component integration.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
