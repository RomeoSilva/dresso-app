
const GOOGLE_SHOPPING_API_KEY = 'AIzaSyBabZdKyDyDtG6C9q2D0jvtYClTs1sM-EA';

// Utility functions for item categorization
const categorizeItems = (items) => {
  const categories = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    shoes: [],
    accessories: []
  };
  
  items.forEach(item => {
    const type = item.type.toLowerCase();
    if (isTop(type)) categories.tops.push(item);
    else if (isBottom(type)) categories.bottoms.push(item);
    else if (isDress(type)) categories.dresses.push(item);
    else if (isOuterwear(type)) categories.outerwear.push(item);
    else if (isShoes(type)) categories.shoes.push(item);
    else categories.accessories.push(item);
  });
  
  return categories;
};

const isTop = (type) => {
  return type.includes('camisa') || type.includes('blusa') || 
         type.includes('camiseta') || type.includes('top') ||
         type.includes('shirt') || type.includes('sweater');
};

const isBottom = (type) => {
  return type.includes('pantalón') || type.includes('falda') || 
         type.includes('jeans') || type.includes('pants') ||
         type.includes('skirt');
};

const isDress = (type) => {
  return type.includes('vestido') || type.includes('dress');
};

const isOuterwear = (type) => {
  return type.includes('chaqueta') || type.includes('abrigo') ||
         type.includes('jacket') || type.includes('coat');
};

const isShoes = (type) => {
  return type.includes('zapatos') || type.includes('zapatillas') ||
         type.includes('shoes') || type.includes('sneakers');
};

// Color matching utilities
const areColorsCompatible = (color1, color2) => {
  const colorPairs = {
    'azul': ['blanco', 'negro', 'gris', 'beige'],
    'negro': ['blanco', 'gris', 'rojo', 'azul'],
    'blanco': ['negro', 'azul', 'rojo', 'verde'],
    'rojo': ['negro', 'blanco', 'gris'],
    'verde': ['blanco', 'beige', 'marrón'],
    'amarillo': ['azul', 'blanco', 'gris'],
    'morado': ['blanco', 'gris', 'negro'],
    'gris': ['negro', 'blanco', 'azul', 'rojo']
  };
  
  return colorPairs[color1.toLowerCase()]?.includes(color2.toLowerCase()) ||
         colorPairs[color2.toLowerCase()]?.includes(color1.toLowerCase());
};

const getComplementaryColor = (color) => {
  const colorPairs = {
    'azul': 'blanco',
    'negro': 'blanco',
    'blanco': 'negro',
    'rojo': 'negro',
    'verde': 'blanco',
    'amarillo': 'azul',
    'morado': 'blanco',
    'gris': 'negro'
  };
  
  return colorPairs[color.toLowerCase()] || null;
};

// Outfit generation logic
export const generateOutfitSuggestions = (wardrobeItems) => {
  if (!wardrobeItems || wardrobeItems.length < 2) {
    return [];
  }

  const itemsByCategory = categorizeItems(wardrobeItems);
  const missingCategories = findMissingCategories(itemsByCategory);
  const suggestions = [];

  missingCategories.forEach(missingCategory => {
    const baseItems = findBaseItemsForCategory(itemsByCategory, missingCategory);
    
    baseItems.forEach(baseItem => {
      const matchingItems = findMatchingItems(baseItem, itemsByCategory);
      const complementaryType = getComplementaryType(baseItem.type, missingCategory);
      
      if (complementaryType) {
        suggestions.push({
          baseItem,
          searchQuery: generateSearchQuery(baseItem, complementaryType, matchingItems),
          type: complementaryType,
          matchReason: generateMatchReason(baseItem, matchingItems)
        });
      }
    });
  });

  return suggestions;
};

const findMissingCategories = (categorizedItems) => {
  const missing = [];
  
  if (categorizedItems.tops.length === 0 && categorizedItems.dresses.length === 0) {
    missing.push('top');
  }
  if (categorizedItems.bottoms.length === 0 && categorizedItems.dresses.length === 0) {
    missing.push('bottom');
  }
  
  return missing;
};

const findBaseItemsForCategory = (itemsByCategory, missingCategory) => {
  switch (missingCategory) {
    case 'bottom':
      return [...itemsByCategory.tops, ...itemsByCategory.outerwear];
    case 'top':
      return [...itemsByCategory.bottoms, ...itemsByCategory.outerwear];
    default:
      return [];
  }
};

const findMatchingItems = (baseItem, itemsByCategory) => {
  const matching = [];
  
  Object.values(itemsByCategory).forEach(categoryItems => {
    categoryItems.forEach(item => {
      if (item.id !== baseItem.id && itemsMatch(baseItem, item)) {
        matching.push(item);
      }
    });
  });
  
  return matching;
};

const itemsMatch = (item1, item2) => {
  return (
    (item1.style && item2.style && item1.style === item2.style) ||
    (item1.color && item2.color && areColorsCompatible(item1.color, item2.color))
  );
};

const generateSearchQuery = (baseItem, targetType, matchingItems) => {
  const queries = [];
  queries.push(targetType);
  
  if (baseItem.color) {
    const complementaryColor = getComplementaryColor(baseItem.color);
    queries.push(complementaryColor || baseItem.color);
  }
  
  if (baseItem.style) {
    queries.push(baseItem.style);
  }
  
  if (baseItem.tags) {
    const seasonTag = baseItem.tags.find(tag => 
      ['verano', 'invierno', 'primavera', 'otoño'].includes(tag.toLowerCase())
    );
    if (seasonTag) queries.push(seasonTag);
    
    const occasionTag = baseItem.tags.find(tag => 
      ['casual', 'formal', 'fiesta', 'trabajo'].includes(tag.toLowerCase())
    );
    if (occasionTag) queries.push(occasionTag);
  }
  
  return queries.filter(Boolean).join(' ');
};

const generateMatchReason = (baseItem, matchingItems) => {
  const items = [baseItem, ...matchingItems].filter(Boolean);
  const itemDescriptions = items.map(item => 
    `${item.type.toLowerCase()}${item.color ? ` ${item.color.toLowerCase()}` : ''}`
  );
  
  return `Complementa perfectamente con tu ${itemDescriptions.join(' y ')}`;
};

const getComplementaryType = (type, missingCategory) => {
  const typeMap = {
    'top': ['pantalón', 'falda'],
    'bottom': ['camisa', 'blusa', 'camiseta']
  };
  
  return typeMap[missingCategory]?.[0] || null;
};

// Product search implementation
export const searchProducts = async (query) => {
  try {
    const response = await fetch(
      `https://shoppingcontent.googleapis.com/content/v2.1/products/search?key=${GOOGLE_SHOPPING_API_KEY}&q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};
