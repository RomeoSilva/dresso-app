
import React from 'react';

export const COLOR_COMBINATIONS = {
  azul: ['blanco', 'negro', 'gris', 'beige', 'marrón'],
  negro: ['blanco', 'gris', 'rojo', 'azul', 'beige'],
  blanco: ['negro', 'azul', 'rojo', 'verde', 'marrón'],
  rojo: ['negro', 'blanco', 'gris', 'azul'],
  verde: ['blanco', 'beige', 'marrón', 'gris'],
  amarillo: ['azul', 'blanco', 'gris', 'negro'],
  morado: ['blanco', 'gris', 'negro', 'beige'],
  gris: ['negro', 'blanco', 'azul', 'rojo'],
  beige: ['negro', 'azul', 'marrón', 'verde'],
  marrón: ['blanco', 'beige', 'azul', 'verde']
};

export const areColorsCompatible = (color1, color2) => {
  if (!color1 || !color2) return true;
  
  const normalizedColor1 = color1.toLowerCase();
  const normalizedColor2 = color2.toLowerCase();
  
  return COLOR_COMBINATIONS[normalizedColor1]?.includes(normalizedColor2) ||
         COLOR_COMBINATIONS[normalizedColor2]?.includes(normalizedColor1);
};

export const getComplementaryColor = (color) => {
  if (!color) return null;
  
  const normalizedColor = color.toLowerCase();
  return COLOR_COMBINATIONS[normalizedColor]?.[0] || null;
};
