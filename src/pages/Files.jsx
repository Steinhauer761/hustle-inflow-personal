import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Receipt, Trash2, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PageHero from '@/components/shared/PageHero';
import EmptyState from '@/components/shared/EmptyState';

const categoryIcons = {
  receipt: Receipt, invoice: Receipt, document: FileText,
  image: Image, medical: FileText, pet: FileText, school: FileText, other: FileText,
};

const categoryColors = {
  receipt: 'bg-amber-100 text-amber-700',
  invoice: 'bg-orange-100 text-orange-700',
  document: 'bg-blue-100 text-blue-700',
  image: 'bg-pink-100 text-pink-700',
  medical: 'bg-red-100 text-red-700',
  pet: 'bg-green-100 text-green-700',
  school: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
};

export default function Files() {
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: files = [] } = useQuery({
    queryKey: ['uploads'],
    queryFn: () => base44.entities.Upload.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Upload.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['uploads'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Upload.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['uploads'] }),
  });

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    setUploading(true);
    for (const file of selectedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const ext = file.name.split('.').pop()?.toLowerCase();
      let category = 'other';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) category = 'image';
      else if (['pdf'].includes(ext)) category = 'document';
      await createMutation.mutateAsync({ name: file.name, file_url, category });
    }
    setUploading(false);

  };

  const filtered = filter === 'all' ? files : files.filter(f => f.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        imageUrl="https://images.unsplash.com/photo-1568667256531-64fe6f8a3e49?w=800&amp;q=80"
        title="Your Important Docs"
        subtitle="Files & Receipts"
        emoji="📁"
        overlayColor="from-indigo-900/60"
      >
        <div className="flex gap-2">
          <label className={`cursor-pointer inline-flex items-center gap-1 rounded-full text-sm font-medium px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 transition-colors ${uploading ? 'pointer-events-none opacity-70' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </PageHero>

      <div className="px-4 pb-8 max-w-2xl mx-auto space-y-4">
        {/* Filter */}
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 rounded-full bg-white border-amber-200 text-amber-700">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="receipt">Receipts</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="pet">Pet</SelectItem>
            <SelectItem value="school">School</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {filtered.length === 0 ? (
          <EmptyState emoji="📎" title="No files yet" description="Upload receipts, invoices, docs — we'll keep them organized." />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((file, i) => {
                const CatIcon = categoryIcons[file.category] || FileText;
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-card-foreground">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] border-0">{file.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(file.created_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(file.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}