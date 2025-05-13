
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
  const topTypes = [
    'camisa', 'blusa', 'camiseta', 'top',
    'shirt', 'sweater', 't-shirt', 'polo'
  ];
  return topTypes.some(t => type.toLowerCase().includes(t));
};

export const isBottom = (type) => {
  const bottomTypes = [
    'pantalón', 'falda', 'jeans', 'pants',
    'skirt', 'shorts', 'bermuda', 'legging'
  ];
  return bottomTypes.some(t => type.toLowerCase().includes(t));
};

export const isShoes = (type) => {
  const shoeTypes = [
    'zapatos', 'zapatillas', 'shoes', 'sneakers',
    'boots', 'sandals', 'heels', 'flats'
  ];
  return shoeTypes.some(t => type.toLowerCase().includes(t));
};

export const detectMissingItem = (items) => {
  if (!items || items.length < 2) return null;

  const types = items.map(item => item.type.toLowerCase());
  
  const hasTop = types.some(type => isTop(type));
  const hasBottom = types.some(type => isBottom(type));
  const hasShoes = types.some(type => isShoes(type));
  
  if (!hasBottom && hasTop && hasShoes) {
    return 'bottom';
  }
  if (!hasTop && hasBottom && hasShoes) {
    return 'top';
  }
  if (!hasShoes && hasTop && hasBottom) {
    return 'shoes';
  }
  
  return null;
};
