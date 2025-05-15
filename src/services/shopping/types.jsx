
import React from 'react';

export const CLOTHING_TYPES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  DRESS: 'dress',
  OUTERWEAR: 'outerwear',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories'
};

export const isTop = (type) => {
  if (!type) return false;
  const topTypes = [
    'camisa', 'blusa', 'camiseta', 'top', 'jersey', 'sudadera', 'polo',
    'shirt', 'blouse', 't-shirt', 'sweater', 'hoodie', 'tank top'
  ];
  return topTypes.some(t => type.toLowerCase().includes(t));
};

export const isBottom = (type) => {
  if (!type) return false;
  const bottomTypes = [
    'pantalón', 'falda', 'jeans', 'shorts', 'bermuda', 'leggings', 'vaqueros',
    'pants', 'skirt', 'trousers'
  ];
  return bottomTypes.some(t => type.toLowerCase().includes(t));
};

export const isShoes = (type) => {
  if (!type) return false;
  const shoeTypes = [
    'zapatos', 'zapatillas', 'botas', 'sandalias', 'tacones', 'deportivas',
    'shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats', 'trainers'
  ];
  return shoeTypes.some(t => type.toLowerCase().includes(t));
};

export const detectMissingItem = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  
  // Prioritize suggesting for at least two items
  if (items.length < 1) return null; // Changed from 2 to 1 to allow suggestions for single items

  const typesPresent = {
    top: false,
    bottom: false,
    shoes: false,
  };

  items.forEach(item => {
    if (isTop(item.type)) typesPresent.top = true;
    else if (isBottom(item.type)) typesPresent.bottom = true;
    else if (isShoes(item.type)) typesPresent.shoes = true;
  });

  if (items.length >= 2) { // Original logic for 2+ items
    if (typesPresent.top && typesPresent.shoes && !typesPresent.bottom) {
      return CLOTHING_TYPES.BOTTOM;
    }
    if (typesPresent.bottom && typesPresent.shoes && !typesPresent.top) {
      return CLOTHING_TYPES.TOP;
    }
    if (typesPresent.top && typesPresent.bottom && !typesPresent.shoes) {
      return CLOTHING_TYPES.SHOES;
    }
  }
  
  // Fallback for 1 item or if no clear missing basic category from 2 items
  // Try to suggest a complementary item
  if (typesPresent.top && !typesPresent.bottom && !typesPresent.shoes) return CLOTHING_TYPES.BOTTOM; // Has top, suggest bottom
  if (typesPresent.bottom && !typesPresent.top && !typesPresent.shoes) return CLOTHING_TYPES.TOP; // Has bottom, suggest top
  if (typesPresent.shoes && !typesPresent.top && !typesPresent.bottom) return CLOTHING_TYPES.TOP; // Has shoes, suggest top (or bottom)

  // If it's a dress, suggest shoes or accessory
  const hasDress = items.some(item => item.type && item.type.toLowerCase().includes('vestido') || item.type.toLowerCase().includes('dress'));
  if (hasDress && !typesPresent.shoes) return CLOTHING_TYPES.SHOES;
  if (hasDress) return CLOTHING_TYPES.ACCESSORIES; // Or an accessory

  // If basic outfit seems complete or items are varied, suggest an accessory
  if (typesPresent.top && typesPresent.bottom && typesPresent.shoes) {
    return CLOTHING_TYPES.ACCESSORIES;
  }
  
  // Default fallback if no specific rule matches, or for very few items
  if (items.length === 1) {
    if (typesPresent.top) return CLOTHING_TYPES.BOTTOM;
    if (typesPresent.bottom) return CLOTHING_TYPES.TOP;
    if (typesPresent.shoes) return CLOTHING_TYPES.TOP; // Or bottom
  }

  return null; // No specific recommendation if logic doesn't find a clear missing piece
};
