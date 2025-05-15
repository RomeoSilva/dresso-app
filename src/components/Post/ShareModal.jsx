
import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share, Mail, Copy, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const ShareModal = ({ isOpen, onClose, post }) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Share,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent('Check out this outfit!')}&body=${encodeURIComponent(window.location.href)}`;
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: t('share.linkCopied'),
          description: t('share.linkCopiedDesc'),
        });
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {shareOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => {
                    option.action();
                    onClose();
                  }}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{option.name}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
