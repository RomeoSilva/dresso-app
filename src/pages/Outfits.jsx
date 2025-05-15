
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Share2, Loader2, AlertTriangle, Info } from 'lucide-react';
import { generateOutfitSuggestions } from '@/services/shopping/outfits';
import { useToast } from '@/components/ui/use-toast';

const Outfits = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoResults(false);

        const savedItems = localStorage.getItem('wardrobeItems');
        let wardrobeItems = [];
        if (savedItems) {
          try {
            wardrobeItems = JSON.parse(savedItems);
            if (!Array.isArray(wardrobeItems)) {
              wardrobeItems = [];
              console.warn('Wardrobe items in localStorage was not an array.');
            }
          } catch (e) {
            console.error('Error parsing wardrobe items from localStorage:', e);
            wardrobeItems = [];
          }
        }
        
        if (wardrobeItems.length < 1) {
          setNoResults(true);
          setError(t('outfits.errors.notEnoughItems'));
          setRecommendations([]);
          setLoading(false);
          return;
        }

        const suggestions = await generateOutfitSuggestions(wardrobeItems);
        
        if (!Array.isArray(suggestions)) {
          console.error("La respuesta de generateOutfitSuggestions no es una lista válida:", suggestions);
          setError(t('outfits.errors.apiConnection')); 
          setRecommendations([]);
          setLoading(false);
          return;
        }
        
        if (suggestions.length === 0) {
          setNoResults(true);
          setError(t('outfits.errors.noProductsStyle'));
          setRecommendations([]);
          setLoading(false);
          return;
        }

        setRecommendations(suggestions);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
          setError(t('outfits.errors.apiConnection'));
        } else if (err.message && err.message.includes('No pudimos crear una búsqueda') ) {
           setError(err.message);
           setNoResults(true);
        }
         else {
          setError(err.message || t('outfits.errors.unknownError'));
        }
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
        <Loader2 className="w-16 h-16 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600 mb-3">
            {t('outfits.title')}
          </h1>
          <p className="text-xl text-gray-700">{t('outfits.subtitle')}</p>
        </div>

        {error && !recommendations.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-gray-200"
          >
            {noResults ? <Info className="w-16 h-16 text-blue-500 mx-auto mb-5" /> : <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-5" />}
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              {noResults ? t('outfits.errors.noResultsTitle') : t('outfits.errors.oops')}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {error}
            </p>
            <Button 
              variant="default" 
              className="bg-[#1a1a1a] text-white hover:bg-[#333333] active:bg-[#000000] py-3 px-8 text-lg"
              onClick={() => window.location.reload()}
            >
              {t('outfits.tryAgain')}
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10">
            {recommendations.map((outfit, index) => (
              <motion.div
                key={outfit.id || index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6, type: 'spring', stiffness: 90 }}
                className="bg-white/95 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col group hover:shadow-purple-200/50 transition-all duration-300 border border-gray-200"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    alt={outfit.title || 'Producto recomendado'}
                   src="https://images.unsplash.com/photo-1619853650725-25296cc83ddb" />
                  <div className="absolute top-4 right-4 flex flex-col space-y-3">
                    <Button size="icon" variant="outline" className="bg-white/80 hover:bg-white backdrop-blur-sm rounded-full w-11 h-11 shadow-md">
                      <Heart className="w-5 h-5 text-pink-500" />
                    </Button>
                    <Button size="icon" variant="outline" className="bg-white/80 hover:bg-white backdrop-blur-sm rounded-full w-11 h-11 shadow-md">
                      <Share2 className="w-5 h-5 text-purple-600" />
                    </Button>
                  </div>
                </div>
                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <h3 className="font-semibold text-xl text-gray-800 mb-1.5 truncate" title={outfit.title}>{outfit.title || t('outfits.productNameDefault')}</h3>
                  <p className="text-purple-700 font-medium text-lg mb-2.5">
                    {outfit.price?.value && parseFloat(outfit.price.value) > 0 ? `${parseFloat(outfit.price.value).toFixed(2)} ${outfit.price.currency || 'EUR'}` : t('outfits.consultPrice')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 mb-4 flex-grow min-h-[40px]">
                    {outfit.matchReason || t('outfits.defaultMatchReason')}
                  </p>
                  <Button 
                    className="w-full mt-auto bg-[#1a1a1a] hover:bg-[#333333] active:bg-[#000000] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                    onClick={() => { if (outfit.link) window.open(outfit.link, '_blank', 'noopener,noreferrer') }}
                    disabled={!outfit.link}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2.5" />
                    {t('outfits.buyNow')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Outfits;
