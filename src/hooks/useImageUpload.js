
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { uploadImage } from '@/services/firebase/storage';

export const useImageUpload = (options = {}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: t('upload.error'),
        description: t('upload.imageOnly'),
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  }, [t, toast]);

  const uploadFile = useCallback(async (path) => {
    if (!file) return null;

    try {
      setIsUploading(true);
      setProgress(0);

      const result = await uploadImage(file, path);
      
      toast({
        title: t('upload.success'),
        description: t('upload.fileUploaded'),
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('upload.error'),
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  }, [file, t, toast]);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setIsUploading(false);
  }, []);

  return {
    file,
    preview,
    isUploading,
    progress,
    handleFileSelect,
    uploadFile,
    reset
  };
};
