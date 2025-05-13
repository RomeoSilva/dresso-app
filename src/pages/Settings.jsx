
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Bell, Shield, HelpCircle } from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const settingsSections = [
    {
      icon: Globe,
      title: t('profile.language'),
      content: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant={i18n.language === 'en' ? 'default' : 'outline'}
            onClick={() => handleLanguageChange('en')}
            className="w-full"
          >
            🇬🇧 English
          </Button>
          <Button
            variant={i18n.language === 'es' ? 'default' : 'outline'}
            onClick={() => handleLanguageChange('es')}
            className="w-full"
          >
            🇪🇸 Español
          </Button>
        </div>
      )
    },
    {
      icon: Bell,
      title: "Notifications",
      content: (
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            Manage Notifications
          </Button>
        </div>
      )
    },
    {
      icon: Shield,
      title: "Privacy",
      content: (
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            Privacy Settings
          </Button>
        </div>
      )
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      content: (
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            Get Help
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('navigation.settings')}</h1>
          <p className="text-gray-600 mt-2">Manage your app preferences</p>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <section.icon className="w-6 h-6 text-purple-600" />
                <Label className="text-lg font-semibold">{section.title}</Label>
              </div>
              {section.content}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
