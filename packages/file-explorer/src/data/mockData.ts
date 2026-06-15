import { FileNode } from '../components/FileExplorer';

export const mockData: FileNode[] = [
  {
    id: 'root-1',
    name: 'Documents',
    type: 'folder',
    updatedAt: '2026-06-05T10:00:00Z',
  },
  {
    id: 'root-2',
    name: 'Images',
    type: 'folder',
    updatedAt: '2026-06-06T12:30:00Z',
  },
  {
    id: 'doc-1',
    name: 'Project Proposal.pdf',
    type: 'file',
    parentId: 'root-1',
    size: 2500000,
    updatedAt: '2026-06-06T14:15:00Z',
    mimeType: 'application/pdf',
    versions: [
      { id: 'v1', updatedAt: '2026-06-01T09:00:00Z', size: 2400000 },
      { id: 'v2', updatedAt: '2026-06-06T14:15:00Z', size: 2500000 }
    ]
  },
  {
    id: 'doc-2',
    name: 'Q2 Financials.xlsx',
    type: 'file',
    parentId: 'root-1',
    size: 1500000,
    updatedAt: '2026-06-04T16:20:00Z',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  {
    id: 'img-1',
    name: 'Hero Banner.png',
    type: 'file',
    parentId: 'root-2',
    size: 4500000,
    updatedAt: '2026-06-06T09:00:00Z',
    mimeType: 'image/png'
  },
  {
    id: 'img-2',
    name: 'Logo White.svg',
    type: 'file',
    parentId: 'root-2',
    size: 45000,
    updatedAt: '2026-06-05T11:45:00Z',
    mimeType: 'image/svg+xml',
    versions: [
      { id: 'v1', updatedAt: '2026-06-05T11:45:00Z', size: 45000 }
    ]
  },
  {
    id: 'subfolder-1',
    name: 'Drafts',
    type: 'folder',
    parentId: 'root-1',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'draft-1',
    name: 'Notes.txt',
    type: 'file',
    parentId: 'subfolder-1',
    size: 1024,
    updatedAt: '2026-06-02T10:00:00Z',
    mimeType: 'text/plain'
  },
  {
    id: 'root-3',
    name: 'Getting Started.md',
    type: 'file',
    size: 3400,
    updatedAt: '2026-06-07T00:00:00Z',
    mimeType: 'text/markdown'
  }
];
