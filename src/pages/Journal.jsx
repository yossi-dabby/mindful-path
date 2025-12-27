import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen } from 'lucide-react';
import ThoughtRecordForm from '../components/journal/ThoughtRecordForm';
import ThoughtRecordCard from '../components/journal/ThoughtRecordCard';

export default function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date'),
    initialData: []
  });

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingEntry(null);
    queryClient.invalidateQueries(['thoughtJournals']);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Thought Journal</h1>
          <p className="text-gray-500">Challenge and reframe unhelpful thinking patterns</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Start Your First Entry</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thought records help you identify and challenge cognitive distortions, leading to more balanced thinking.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg rounded-xl"
            >
              Create Thought Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <ThoughtRecordCard key={entry.id} entry={entry} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ThoughtRecordForm
          entry={editingEntry}
          onClose={handleClose}
        />
      )}
    </div>
  );
}