'use client';

import { Download, Loader2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';

import { getBulkImportConfig, parseBulkImportCSV } from '../services/bulk-import-service';

interface BulkImportDialogProps {
  tenantSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkImportDialog({ tenantSlug, isOpen, onClose, onSuccess }: BulkImportDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDownloadTemplate = useCallback(async () => {
    const result = await getBulkImportConfig(tenantSlug, 'members');
    if (!result.success || !result.data) return;
    const { csvHeaders, sampleRow } = result.data;
    const csvContent = [csvHeaders.join(','), Object.values(sampleRow).join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [tenantSlug]);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const csvText = await file.text();
      const result = await parseBulkImportCSV(tenantSlug, 'members', csvText);
      if (result.success) {
        toast.success(`Parsed ${result.data?.rows?.length ?? 0} members successfully`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error ?? 'Import failed');
      }
    } catch {
      toast.error('Failed to process CSV file');
    } finally {
      setIsUploading(false);
    }
  }, [file, tenantSlug, onSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Members</DialogTitle>
          <DialogDescription>Upload a CSV file to import multiple members at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>

          <div className="rounded-lg border-2 border-dashed p-6 text-center">
            <input
              type="file"
              accept=".csv"
              id="csv-upload"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{file ? file.name : 'Click to upload CSV file'}</p>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Members
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
