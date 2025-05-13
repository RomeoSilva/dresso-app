
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Upload, Shirt as Tshirt } from 'lucide-react';
import ImageUploadModal from '@/components/ImageUpload/ImageUploadModal';
import WardrobeGrid from '@/components/Wardrobe/WardrobeGrid';
import { useToast } from '@/components/ui/use-toast';
import { analyzeImage } from '@/services/imageAnalysis';

const Wardrobe = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('wardrobeItems');
    if (savedItems) {
      setWardrobeItems(JSON.parse(savedItems));
    }
  }, []);

  const handleUpload = (file, analysisResults) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newItem = {
        id: Date.now(),
        image: reader.result,
        type: analysisResults?.type || 'Unknown item',
        description: analysisResults?.description || '',
        tags: analysisResults?.tags || [],
        color: analysisResults?.color || '',
        style: analysisResults?.style || '',
        isPrivate: true
      };

      const updatedItems = [...wardrobeItems, newItem];
      setWardrobeItems(updatedItems);
      localStorage.setItem('wardrobeItems', JSON.stringify(updatedItems));

      toast({
        title: t('wardrobe.itemAdded'),
        description: t('wardrobe.itemAnalyzed'),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (itemId) => {
    const updatedItems = wardrobeItems.filter(item => item.id !== itemId);
    setWardrobeItems(updatedItems);
    localStorage.setItem('wardrobeItems', JSON.stringify(updatedItems));

    toast({
      title: t('wardrobe.itemDeleted'),
      description: t('wardrobe.itemRemovedFromWardrobe'),
    });
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('wardrobe.title')}</h1>
            <p className="text-gray-600 mt-2">{t('wardrobe.privateDescription')}</p>
          </div>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('wardrobe.uploadNew')}
          </Button>
        </div>

        {wardrobeItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center"
          >
            <div className="text-center">
              <Tshirt className="w-12 h-12 mx-auto text-[#6366f1] mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('wardrobe.empty')}</h3>
              <p className="text-gray-600 mb-4">{t('wardrobe.addFirstItem')}</p>
              <Button 
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('wardrobe.startUploading')}
              </Button>
            </div>
          </motion.div>
        ) : (
          <WardrobeGrid
            items={wardrobeItems}
            onDelete={handleDelete}
          />
        )}
      </motion.div>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        allowLinks={false}
        isWardrobe={true}
      />
    </div>
  );
};

export default Wardrobe;
