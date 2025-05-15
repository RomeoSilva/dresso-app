
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import ImageUploadBase from './ImageUploadBase';

const CommunityUpload = ({ onUpload }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [links, setLinks] = useState([]);

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
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

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file, links);
  };

  return (
    <div className="space-y-4">
      <ImageUploadBase
        onFileSelect={handleFileSelect}
        preview={preview}
      />

      {preview && (
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

          <Button
            className="w-full"
            onClick={handleSubmit}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('upload.submit')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunityUpload;
