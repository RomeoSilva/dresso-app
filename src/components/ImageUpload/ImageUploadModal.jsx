
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import WardrobeUpload from './WardrobeUpload';
import CommunityUpload from './CommunityUpload';

const ImageUploadModal = ({ isOpen, onClose, onUpload, allowLinks, isWardrobe = false }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isWardrobe ? t('wardrobe.uploadTitle') : t('community.uploadTitle')}
              </DialogTitle>
            </DialogHeader>
            {isWardrobe ? (
              <WardrobeUpload
                onUpload={(file, analysisResults) => {
                  onUpload(file, analysisResults);
                  onClose();
                }}
              />
            ) : (
              <CommunityUpload
                onUpload={(file, links) => {
                  onUpload(file, links);
                  onClose();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ImageUploadModal;
