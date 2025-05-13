
import React from 'react';
import { detectMissingItem } from './types';
import { searchProducts, buildSearchQuery } from './api';

const generateMatchReason = (baseItems, recommendedType) => {
  if (!Array.isArray(baseItems) || baseItems.length === 0 || !recommendedType) {
    return 'Producto recomendado basado en tu estilo';
  }

  const itemDescriptions = baseItems
    .filter(item => item && item.type)
    .map(item => `${item.type.toLowerCase()}${item.color ? ` ${item.color}` : ''}`)
    .join(' y ');

  const typeMap = {
    'bottom': 'pantalón',
    'top': 'camisa',
    'shoes': 'zapatos'
  };

  return itemDescriptions 
    ? `Este ${typeMap[recommendedType]} combina con tu ${itemDescriptions}`
    : 'Producto recomendado basado en tu estilo';
};

export const generateOutfitSuggestions = async (wardrobeItems) => {
  try {
    if (!Array.isArray(wardrobeItems)) {
      console.warn('Wardrobe items is not an array:', wardrobeItems);
      return [];
    }

    const validItems = wardrobeItems.filter(item => item && item.type);
    if (validItems.length < 2) {
      console.warn('Not enough valid items in wardrobe');
      return [];
    }

    const missingType = detectMissingItem(validItems);
    if (!missingType) {
      console.warn('No missing item type detected');
      return [];
    }

    const baseItems = validItems.filter(item => 
      item.type && item.type.toLowerCase() !== missingType
    );

    if (baseItems.length === 0) {
      console.warn('No valid base items found');
      return [];
    }

    const searchQuery = buildSearchQuery(missingType, baseItems);
    if (!searchQuery) {
      console.warn('Failed to build search query');
      return [];
    }

    const products = await searchProducts(searchQuery);
    if (!Array.isArray(products)) {
      console.warn('Invalid products response:', products);
      return [];
    }

    return products.map(product => ({
      ...product,
      matchReason: generateMatchReason(baseItems, missingType)
    }));
  } catch (error) {
    console.error('Error generating outfit suggestions:', error);
    return [];
  }
};
