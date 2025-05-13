
import React from 'react';

const GOOGLE_SHOPPING_API_KEY = 'AIzaSyBabZdKyDyDtG6C9q2D0jvtYClTs1sM-EA';
const COUNTRY = 'ES';
const MAX_RESULTS = 3;

export const searchProducts = async (query) => {
  if (!query || query.trim() === '') {
    console.warn('Empty search query provided');
    return [];
  }

  try {
    const url = `https://shoppingcontent.googleapis.com/content/v2.1/products?key=${GOOGLE_SHOPPING_API_KEY}&maxResults=${MAX_RESULTS}&country=${COUNTRY}&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return [];
    }

    const data = await response.json();
    
    if (!data || !data.resources || !Array.isArray(data.resources)) {
      console.warn('Invalid API response structure:', data);
      return [];
    }

    return data.resources
      .filter(product => {
        if (!product || !product.title || !product.imageLink || !product.link) {
          console.warn('Invalid product data:', product);
          return false;
        }
        return true;
      })
      .map(product => ({
        id: product.id || String(Math.random()),
        title: product.title,
        price: {
          value: product.price?.value || product.prices?.[0]?.value || '0',
          currency: product.price?.currency || product.prices?.[0]?.currency || 'EUR'
        },
        imageLink: product.imageLink || product.images?.[0]?.link,
        link: product.link
      }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const buildSearchQuery = (missingType, baseItems) => {
  if (!missingType || !Array.isArray(baseItems) || baseItems.length === 0) {
    console.warn('Invalid parameters for search query:', { missingType, baseItems });
    return '';
  }

  const style = baseItems.some(item => item.tags?.includes('sporty')) ? 'deportivo' : 'casual';
  const colors = baseItems.map(item => item.color).filter(Boolean);
  const suggestedColor = colors.length > 0 ? colors[0] : '';

  const typeMap = {
    'bottom': 'pantalón',
    'top': 'camisa',
    'shoes': 'zapatos'
  };

  return `${typeMap[missingType]} ${style} ${suggestedColor}`.trim();
};
