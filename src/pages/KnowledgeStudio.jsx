import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import ChunkList from '../components/knowledge/ChunkList';
import ChunkForm from '../components/knowledge/ChunkForm';
import RetrievalPreview from '../components/knowledge/RetrievalPreview';
import BulkImport from '../components/knowledge/BulkImport';

export default function KnowledgeStudio() {
  const [editingChunk, setEditingChunk] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('library');

  // Admin gate
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
        <Shield className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">This page is restricted to administrators only.</p>
      </div>
    );
  }

  const handleEdit = (chunk) => {
    setEditingChunk(chunk);
    setShowForm(true);
    setActiveTab('editor');
  };

  const handleNew = () => {
    setEditingChunk(null);
    setShowForm(true);
    setActiveTab('editor');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingChunk(null);
    setActiveTab('library');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-32 md:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 rounded-xl p-2.5">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Knowledge Studio</h1>
          <p className="text-sm text-muted-foreground">Admin · TrustedCBTChunk management</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="editor">{editingChunk ? 'Edit Chunk' : 'New Chunk'}</TabsTrigger>
          <TabsTrigger value="preview">Retrieval Preview</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <ChunkList onEdit={handleEdit} onNew={handleNew} />
        </TabsContent>

        <TabsContent value="editor">
          <ChunkForm
            chunk={editingChunk}
            onSave={handleFormClose}
            onCancel={handleFormClose}
          />
        </TabsContent>

        <TabsContent value="preview">
          <RetrievalPreview />
        </TabsContent>

        <TabsContent value="import">
          <BulkImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}