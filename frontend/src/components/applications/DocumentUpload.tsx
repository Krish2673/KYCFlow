import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadDocument } from '../../api/documents';
import { DOCUMENT_TYPE_LABELS } from '../../lib/constants';
import type { DocumentType } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

const documentTypes = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface DocumentUploadProps {
  applicationId: string;
  onSuccess?: () => void;
}

export function DocumentUpload({ applicationId, onSuccess }: DocumentUploadProps) {
  const [type, setType] = useState<DocumentType>('PAN');
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => uploadDocument(applicationId, file!, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onSuccess?.();
    },
  });

  return (
    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            label="Document Type"
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType)}
            options={documentTypes}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">File</label>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
          />
        </div>
        <Button
          loading={mutation.isPending}
          disabled={!file}
          onClick={() => mutation.mutate()}
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>
      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          {(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
