import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (result: { successful: Array<{ imageUrl: string }> }) => void;
  onFileSelected?: (file: File | null) => void;
  buttonClassName?: string;
  children: ReactNode;
  showDropZone?: boolean;
}

export interface ObjectUploaderRef {
  uploadSelectedFile: () => Promise<{ successful: Array<{ imageUrl: string }> } | null>;
  getSelectedFile: () => File | null;
  clearSelectedFile: () => void;
}

export const ObjectUploader = forwardRef<ObjectUploaderRef, ObjectUploaderProps>(({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onComplete,
  onFileSelected,
  buttonClassName,
  children,
  showDropZone = false,
}, ref) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > maxFileSize) {
      alert(`파일 크기가 너무 큽니다. 최대 ${Math.round(maxFileSize / 1024 / 1024)}MB까지 가능합니다.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);
    onFileSelected?.(file);
  }, [maxFileSize, onFileSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadSelectedFile = useCallback(async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드에 실패했습니다.');
      }

      const data = await response.json();
      const result = {
        successful: [{ imageUrl: data.imageUrl }]
      };

      onComplete?.(result);
      return result;
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드에 실패했습니다.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onComplete]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    onFileSelected?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelected]);

  useImperativeHandle(ref, () => ({
    uploadSelectedFile,
    getSelectedFile: () => selectedFile,
    clearSelectedFile: removeFile,
  }), [uploadSelectedFile, selectedFile, removeFile]);

  if (showDropZone) {
    return (
      <div className="space-y-4">
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${selectedFile ? 'bg-muted/30' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Image className="w-4 h-4" />
                <span className="font-medium">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                파일이 선택되었습니다. 저장 버튼을 눌러 업로드하세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`
                p-4 rounded-full transition-all duration-200
                ${isDragOver ? 'bg-primary/10 scale-110' : 'bg-muted/50'}
              `}>
                <Upload className={`w-8 h-8 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  이곳에 이미지 파일을 드래그 앤 드롭하세요
                </p>
                <p className="text-xs text-muted-foreground">
                  또는{" "}
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="text-primary hover:underline"
                  >
                    파일 선택
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <Button 
        type="button"
        onClick={handleButtonClick} 
        className={buttonClassName}
        disabled={isUploading}
      >
        {children}
      </Button>
      {selectedFile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate max-w-32">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
});

ObjectUploader.displayName = "ObjectUploader";