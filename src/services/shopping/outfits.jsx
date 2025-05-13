
import React from 'react';
import { detectMissingItem, CLOTHING_TYPES, isTop, isBottom, isShoes } from './types';
import { searchProducts, buildSearchQuery } from './api';

const getItemDescription = (item) => {
  if (!item || !item.type) return '';
  let description = item.type.toLowerCase();
  if (item.color) {
    description += ` ${item.color.toLowerCase()}`;
  }
  if(item.name) { 
    description = item.name.toLowerCase();
  }
  return description;
};

const generateMatchReason = (baseItems, recommendedItemTitle, recommendedType) => {
  if (!Array.isArray(baseItems) || baseItems.length === 0) {
    return `Este ${recommendedItemTitle || 'artículo'} podría complementar tu estilo actual.`;
  }

  const baseItemDescriptions = baseItems.map(getItemDescription).filter(Boolean);

  let reasonStart = `Este ${recommendedItemTitle || (recommendedType ? recommendedType.toLowerCase() : 'artículo')}`;
  
  const typeMap = {
    [CLOTHING_TYPES.BOTTOM]: 'pantalón',
    [CLOTHING_TYPES.TOP]: 'prenda superior',
    [CLOTHING_TYPES.SHOES]: 'calzado',
    [CLOTHING_TYPES.DRESS]: 'vestido',
    [CLOTHING_TYPES.OUTERWEAR]: 'abrigo',
    [CLOTHING_TYPES.ACCESSORIES]: 'accesorio'
  };

  if (!recommendedItemTitle && recommendedType && typeMap[recommendedType]) {
    reasonStart = `Este ${typeMap[recommendedType]}`;
  } else if (!recommendedItemTitle && recommendedType) {
     reasonStart = `Este ${recommendedType.toLowerCase()}`;
  }


  if (baseItemDescriptions.length === 0) {
    return `${reasonStart} es una gran adición a tu guardarropa.`;
  }
  
  let reasonCore = "complementa tu look con ";
  if (baseItemDescriptions.length === 1) {
    reasonCore += baseItemDescriptions[0];
  } else {
    const lastItem = baseItemDescriptions.pop();
    reasonCore += `${baseItemDescriptions.join(', ')} y ${lastItem}`;
  }
  
  return `${reasonStart} ${reasonCore}.`;
};

export const generateOutfitSuggestions = async (wardrobeItems) => {
  try {
    if (!Array.isArray(wardrobeItems)) {
      console.warn('generateOutfitSuggestions: Wardrobe items is not an array:', wardrobeItems);
      throw new Error('Datos del armario no válidos. Por favor, revisa tu armario.');
    }

    const validItems = wardrobeItems.filter(item => item && item.type && (item.id || item.imageUrl) ); 

    if (validItems.length === 0) {
      const generalQuery = buildSearchQuery(null, [], false); 
      const generalProducts = await searchProducts(generalQuery);
      if (!Array.isArray(generalProducts)) {
         throw new Error('No se pudieron obtener recomendaciones generales.');
      }
      return generalProducts.map(product => ({
        ...product,
        imageLink: product.image, 
        matchReason: `Descubre esta tendencia: ${product.title || 'un artículo de moda'}.`
      }));
    }

    const missingType = detectMissingItem(validItems);
    let baseItemsForSuggestion = validItems;
    let isFallbackSearch = false;

    if (missingType) {
      baseItemsForSuggestion = validItems.filter(item => {
        if (!item.type) return false;
        const itemCategory = isTop(item.type) ? CLOTHING_TYPES.TOP :
                             isBottom(item.type) ? CLOTHING_TYPES.BOTTOM :
                             isShoes(item.type) ? CLOTHING_TYPES.SHOES : null;
        return itemCategory !== missingType;
      });
      if (baseItemsForSuggestion.length === 0) {
        baseItemsForSuggestion = validItems;
      }
    } else { 
      isFallbackSearch = true;
      baseItemsForSuggestion = validItems; 
    }
    
    const actualMissingTypeForQuery = missingType || (isFallbackSearch ? CLOTHING_TYPES.ACCESSORIES : null);
    const searchQuery = buildSearchQuery(actualMissingTypeForQuery, baseItemsForSuggestion, isFallbackSearch);

    if (!searchQuery) {
      console.warn('generateOutfitSuggestions: Failed to build search query.', {actualMissingTypeForQuery, baseItemsForSuggestion, isFallbackSearch});
      throw new Error('No pudimos crear una búsqueda con tus prendas. Intenta añadir más variedad a tu armario.');
    }

    const products = await searchProducts(searchQuery);

    if (!Array.isArray(products)) {
      console.warn('generateOutfitSuggestions: Invalid products response from searchProducts:', products);
      throw new Error('No se pudieron obtener productos en este momento. Intenta más tarde.');
    }

    if (products.length === 0) {
      return []; 
    }

    return products.map(product => ({
      ...product,
      imageLink: product.image, 
      matchReason: generateMatchReason(baseItemsForSuggestion, product.title, actualMissingTypeForQuery)
    }));
  } catch (error) {
    console.error('Error in generateOutfitSuggestions:', error);
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Error de conexión. Verifica tu internet e intenta de nuevo.");
    }
    throw error; 
  }
};
