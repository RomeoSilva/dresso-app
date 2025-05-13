
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        onClick={toggleLanguage}
        variant="outline"
        className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
      >
        {i18n.language === 'en' ? '🇪🇸 Español' : '🇬🇧 English'}
      </Button>
    </motion.div>
  );
};

export default LanguageSwitcher;
