import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadService } from '@/lib/api/upload';

interface FileUploaderProps {
  onFileUploaded: (fileUrl: string) => Promise<void> | void;
  accept: Record<string, string[]>;
  maxSize?: number;
  children: (props: {
    getRootProps: any;
    getInputProps: any;
    isDragActive: boolean;
    isUploading: boolean;
    progress: number;
    error: string | null;
  }) => React.ReactNode;
}

export function FileUploader({
  onFileUploaded,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  children,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const result = await uploadService.uploadFile(file, (pct) => {
          setProgress(pct);
        });

        setProgress(100);
        await onFileUploaded(result.file_url);
      } catch (err) {
        console.error('Upload failed:', err);
        setError('Upload failed. Please try again.');
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection) {
        if (rejection.errors[0].code === 'file-too-large') {
          setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setError('Invalid file type');
        } else {
          setError('Error uploading file');
        }
      }
    },
  });

  return (
    <div>
      {children({
        getRootProps,
        getInputProps,
        isDragActive,
        isUploading,
        progress,
        error,
      })}
    </div>
  );
}

export default FileUploader;
