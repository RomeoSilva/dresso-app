
import React from 'react';
import { CLOTHING_TYPES } from './types';

const GOOGLE_SHOPPING_API_KEY = 'AIzaSyBabZdKyDyDtG6C9q2D0jvtYClTs1sM-EA'; 
const SHOPPING_API_BASE_URL = 'http://localhost:3001/api/shopping';
const COUNTRY = 'ES';
const MAX_RESULTS = 3; 

export const searchProducts = async (query) => {
  if (!query || query.trim() === '') {
    console.warn('Empty search query provided to searchProducts');
    throw new Error('La consulta de búsqueda está vacía.');
  }

  let url;
  const useLocalApi = SHOPPING_API_BASE_URL.includes('localhost');
  
  if (useLocalApi) {
    url = `${SHOPPING_API_BASE_URL}?q=${encodeURIComponent(query)}`;
  } else {
    url = `https://shoppingcontent.googleapis.com/content/v2.1/products?key=${GOOGLE_SHOPPING_API_KEY}&maxResults=${MAX_RESULTS}&country=${COUNTRY}&q=${encodeURIComponent(query)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorData = { message: `API request failed with status ${response.status} for URL: ${url}` };
      try {
        const parsedError = await response.json();
        errorData = { ...errorData, ...parsedError };
      } catch (e) {
         errorData.message = response.statusText || errorData.message;
      }
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.message || 'Error al buscar productos. Por favor, intenta de nuevo más tarde.');
    }

    const data = await response.json();
    
    let productList;
    if (useLocalApi) {
      productList = data.items || [];
       if (!Array.isArray(productList)) {
        console.warn('Invalid API response structure from local API (expected items array):', data);
        throw new Error('Respuesta inesperada del servidor local.');
      }
    } else { 
      productList = data.resources || data.items || []; 
       if (!Array.isArray(productList)) {
        console.warn('Invalid API response structure from Google API (expected resources or items array):', data);
        throw new Error('Respuesta inesperada de la API de Google Shopping.');
      }
    }

    return productList
      .filter(product => {
        const hasTitle = product && product.title;
        const imageField = useLocalApi ? product.image : product.imageLink;
        const hasImage = product && (imageField || (product.images && product.images[0] && product.images[0].link));
        const hasLink = product && product.link;

        if (!hasTitle || !hasImage || !hasLink) {
          console.warn('Invalid product data (missing title, image, or link):', product);
          return false;
        }
        return true;
      })
      .map(product => ({
        id: product.id || String(Date.now() + Math.random()), 
        title: product.title,
        price: {
          value: product.price?.value || product.prices?.[0]?.value || '0',
          currency: product.price?.currency || product.prices?.[0]?.currency || 'EUR'
        },
        image: useLocalApi ? product.image : (product.imageLink || (product.images && product.images[0] && product.images[0].link)),
        link: product.link,
        displayLink: product.displayLink 
      }));
  } catch (error) {
    console.error('Error in searchProducts:', error.message, 'URL:', url);
    throw error; 
  }
};

export const buildSearchQuery = (missingType, baseItems, isFallback = false) => {
  if (!Array.isArray(baseItems)) {
    console.warn('Invalid parameters for buildSearchQuery: baseItems is not an array. Generating general query.');
    return 'ropa moda mujer'; 
  }

  const styles = baseItems.flatMap(item => item.style || item.tags?.filter(tag => ['casual', 'sporty', 'formal', 'elegant', 'bohemio', 'moderno', 'vintage', 'minimalista', 'urbano', 'trabajo', 'fiesta'].includes(tag?.toLowerCase())) || []);
  const dominantStyle = styles.length > 0 
    ? styles.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b), styles[0])
    : 'moderno'; 

  const colors = baseItems.map(item => item.color).filter(Boolean);
  const suggestedColor = colors.length > 0 ? colors[0] : ''; 

  const typeMap = {
    [CLOTHING_TYPES.BOTTOM]: 'pantalón',
    [CLOTHING_TYPES.TOP]: 'prenda superior',
    [CLOTHING_TYPES.SHOES]: 'zapatos',
    [CLOTHING_TYPES.ACCESSORIES]: 'accesorio',
    [CLOTHING_TYPES.DRESS]: 'vestido',
    [CLOTHING_TYPES.OUTERWEAR]: 'abrigo'
  };
  
  let queryParts = [];

  if (isFallback) {
    queryParts.push(typeMap[CLOTHING_TYPES.ACCESSORIES] || 'accesorio de moda'); 
    queryParts.push(dominantStyle);
    if (suggestedColor && baseItems.length > 0) queryParts.push(suggestedColor);
  } else if (missingType && typeMap[missingType]) {
    queryParts.push(typeMap[missingType]);
    queryParts.push(dominantStyle);
    if (suggestedColor && baseItems.length > 0) queryParts.push(suggestedColor);
  } else if (missingType) { 
    queryParts.push(missingType); 
    queryParts.push(dominantStyle);
    if (suggestedColor && baseItems.length > 0) queryParts.push(suggestedColor);
  } else if (baseItems.length > 0) { 
    queryParts.push('ropa'); 
    queryParts.push(dominantStyle);
    if (suggestedColor) queryParts.push(suggestedColor);
  } else { 
    return 'ropa tendencia mujer'; 
  }
  
  let finalQuery = queryParts.filter(Boolean).join(' ').trim().replace(/\s+/g, ' ');
  if (!finalQuery) { 
    finalQuery = 'ropa moda mujer'; 
  }
  return finalQuery;
};
