
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ImageUploadBase from './ImageUploadBase';
import { analyzeImage } from '@/services/imageAnalysis';
import { useToast } from '@/components/ui/use-toast';

const WardrobeUpload = ({ onUpload }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setAnalysisResults(null);
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);

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
  }, [t, toast]);

  const handleSubmit = () => {
    if (!file || !analysisResults) return;
    onUpload(file, analysisResults);
  };

  return (
    <div className="space-y-4">
      <ImageUploadBase
        onFileSelect={handleFileSelect}
        isAnalyzing={isAnalyzing}
        preview={preview}
      />

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

      {preview && (
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isAnalyzing}
        >
          <Upload className="w-4 h-4 mr-2" />
          {t('upload.submit')}
        </Button>
      )}
    </div>
  );
};

export default WardrobeUpload;
