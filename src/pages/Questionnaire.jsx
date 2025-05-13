
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Questionnaire = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    language: '',
    gender: '',
    skinTone: '',
    hairColor: '',
    height: '',
    weight: '',
    styles: [],
    occasions: [],
    favoriteColors: [],
    dislikedColors: []
  });

  const styleOptions = [
    { id: 'casual', label: t('questionnaire.styles.casual') },
    { id: 'elegant', label: t('questionnaire.styles.elegant') },
    { id: 'urban', label: t('questionnaire.styles.urban') },
    { id: 'formal', label: t('questionnaire.styles.formal') },
    { id: 'sporty', label: t('questionnaire.styles.sporty') },
    { id: 'bohemian', label: t('questionnaire.styles.bohemian') },
    { id: 'vintage', label: t('questionnaire.styles.vintage') },
    { id: 'minimalist', label: t('questionnaire.styles.minimalist') }
  ];

  const occasions = [
    { id: 'work', label: t('questionnaire.occasionTypes.work') },
    { id: 'casual', label: t('questionnaire.occasionTypes.casual') },
    { id: 'party', label: t('questionnaire.occasionTypes.party') },
    { id: 'formal', label: t('questionnaire.occasionTypes.formal') },
    { id: 'date', label: t('questionnaire.occasionTypes.date') },
    { id: 'sport', label: t('questionnaire.occasionTypes.sport') }
  ];

  const skinTones = [
    { value: 'very-light', color: '#f6ede4' },
    { value: 'light', color: '#f3e0d2' },
    { value: 'medium-light', color: '#e8c5a8' },
    { value: 'medium', color: '#d3a98c' },
    { value: 'medium-dark', color: '#b07b59' },
    { value: 'dark', color: '#8b593e' },
    { value: 'very-dark', color: '#613d30' }
  ];

  const hairColors = [
    { value: 'black', color: '#000000' },
    { value: 'dark-brown', color: '#3b2417' },
    { value: 'brown', color: '#6a4e42' },
    { value: 'light-brown', color: '#977961' },
    { value: 'blonde', color: '#deb887' },
    { value: 'red', color: '#a52a2a' }
  ];

  const handleLanguageChange = (lang) => {
    setFormData({ ...formData, language: lang });
    i18n.changeLanguage(lang);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      try {
        // Save to localStorage
        localStorage.setItem('userStyle', JSON.stringify(formData));
        
        // Update user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          style: formData,
          hasCompletedQuestionnaire: true,
          updatedAt: new Date().toISOString()
        });

        // Force reload user data in AuthContext
        window.location.href = '/wardrobe';
      } catch (error) {
        console.error('Error saving questionnaire data:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('questionnaire.title')}
          </h2>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label>{t('questionnaire.language.title')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={formData.language === 'en' ? 'default' : 'outline'}
                  onClick={() => handleLanguageChange('en')}
                  className="w-full"
                >
                  🇬🇧 {t('questionnaire.language.en')}
                </Button>
                <Button
                  variant={formData.language === 'es' ? 'default' : 'outline'}
                  onClick={() => handleLanguageChange('es')}
                  className="w-full"
                >
                  🇪🇸 {t('questionnaire.language.es')}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label>{t('questionnaire.gender.title')}</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="whitespace-nowrap">{t('questionnaire.gender.male')}</Label>
                </div>
                <div>
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="whitespace-nowrap">{t('questionnaire.gender.female')}</Label>
                </div>
                <div>
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="whitespace-nowrap">{t('questionnaire.gender.other')}</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {t('questionnaire.next')}
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label>{t('questionnaire.skinTone')}</Label>
              <div className="grid grid-cols-4 gap-4">
                {skinTones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => handleInputChange('skinTone', tone.value)}
                    className={`w-12 h-12 rounded-full border-4 ${
                      formData.skinTone === tone.value
                        ? 'border-purple-600'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: tone.color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>{t('questionnaire.hairColor')}</Label>
              <div className="grid grid-cols-4 gap-4">
                {hairColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleInputChange('hairColor', color.value)}
                    className={`w-12 h-12 rounded-full border-4 ${
                      formData.hairColor === color.value
                        ? 'border-purple-600'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                {t('questionnaire.back')}
              </Button>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {t('questionnaire.next')}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Label>{t('questionnaire.height')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="170"
                />
                <span className="text-sm text-gray-500">{t('questionnaire.cm')}</span>
              </div>
            </div>
            
            <div>
              <Label>{t('questionnaire.weight')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="70"
                />
                <span className="text-sm text-gray-500">{t('questionnaire.kg')}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full"
              >
                {t('questionnaire.back')}
              </Button>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {t('questionnaire.next')}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Label>{t('questionnaire.stylePreference')}</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {styleOptions.map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={style.id}
                      checked={formData.styles.includes(style.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange('styles', [...formData.styles, style.id]);
                        } else {
                          handleInputChange(
                            'styles',
                            formData.styles.filter((s) => s !== style.id)
                          );
                        }
                      }}
                    />
                    <label htmlFor={style.id} className="text-sm font-medium">
                      {style.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('questionnaire.occasions')}</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {occasions.map((occasion) => (
                  <div key={occasion.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={occasion.id}
                      checked={formData.occasions.includes(occasion.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange('occasions', [...formData.occasions, occasion.id]);
                        } else {
                          handleInputChange(
                            'occasions',
                            formData.occasions.filter((o) => o !== occasion.id)
                          );
                        }
                      }}
                    />
                    <label htmlFor={occasion.id} className="text-sm font-medium">
                      {occasion.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="w-full"
              >
                {t('questionnaire.back')}
              </Button>
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {t('questionnaire.complete')}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Questionnaire;
