
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { analyzeImage } from '@/services/imageAnalysis';

const ImageUpload = ({ onUpload, allowLinks = false, isWardrobe = false }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [preview, setPreview] = useState(null);
  const [links, setLinks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = useCallback(async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await handleFile(selectedFile);
    }
  }, []);

  const handleFile = async (selectedFile) => {
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

    if (isWardrobe) {
      setIsAnalyzing(true);
      try {
        const results = await analyzeImage(selectedFile);
        setAnalysisResults(results);
        
        toast({
          title: t('upload.analyzed'),
          description: results.description,
        });
      } catch (error) {
        toast({
          title: t('upload.analysisFailed'),
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await handleFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const addLink = () => {
    setLinks([...links, { type: '', url: '' }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!file) return;

    if (isWardrobe) {
      onUpload(file, analysisResults);
    } else {
      onUpload(file, links);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => {
                setPreview(null);
                setFile(null);
                setAnalysisResults(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {t('upload.dragDrop')}{' '}
              <label className="text-purple-600 hover:text-purple-700 cursor-pointer">
                {t('upload.browse')}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </p>
          </div>
        )}
      </div>

      {analysisResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-lg p-4 space-y-2"
        >
          <h3 className="font-semibold">{t('analysis.results')}</h3>
          <p>{analysisResults.description}</p>
          <div className="flex flex-wrap gap-2">
            {analysisResults.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {allowLinks && preview && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{t('upload.addLinks')}</h3>
            <Button onClick={addLink} size="sm">
              <LinkIcon className="w-4 h-4 mr-2" />
              {t('upload.addLink')}
            </Button>
          </div>

          {links.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-start"
            >
              <div className="flex-1">
                <Label>{t('upload.itemType')}</Label>
                <Input
                  value={link.type}
                  onChange={(e) => updateLink(index, 'type', e.target.value)}
                  placeholder={t('upload.itemTypePlaceholder')}
                />
              </div>
              <div className="flex-1">
                <Label>{t('upload.link')}</Label>
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder="https://"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="mt-6"
                onClick={() => removeLink(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {preview && (
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {t('upload.submit')}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
