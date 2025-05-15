<<<<<<< HEAD

const GOOGLE_SHOPPING_API_KEY = 'AIzaSyBabZdKyDyDtG6C9q2D0jvtYClTs1sM-EA';

// Utility functions for item categorization
=======
const API_URL = import.meta.env.VITE_API_BASE_URL;

/* --- CATEGORIZACIÓN DE ROPA --- */
>>>>>>> 8488f7c9e55c7a895c6443d75dbe7c0246267e76
const categorizeItems = (items) => {
  const categories = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    shoes: [],
<<<<<<< HEAD
    accessories: []
  };
  
=======
    accessories: [],
  };

>>>>>>> 8488f7c9e55c7a895c6443d75dbe7c0246267e76
  items.forEach(item => {
    const type = item.type.toLowerCase();
    if (isTop(type)) categories.tops.push(item);
    else if (isBottom(type)) categories.bottoms.push(item);
    else if (isDress(type)) categories.dresses.push(item);
    else if (isOuterwear(type)) categories.outerwear.push(item);
    else if (isShoes(type)) categories.shoes.push(item);
    else categories.accessories.push(item);
  });
<<<<<<< HEAD
  
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
=======

  return categories;
};

const isTop = (type) => ["camisa", "blusa", "camiseta", "top", "sweater", "shirt"].some(t => type.includes(t));
const isBottom = (type) => ["pantalón", "falda", "jeans", "pants", "skirt"].some(t => type.includes(t));
const isDress = (type) => ["vestido", "dress"].some(t => type.includes(t));
const isOuterwear = (type) => ["chaqueta", "abrigo", "jacket", "coat"].some(t => type.includes(t));
const isShoes = (type) => ["zapatos", "zapatillas", "shoes", "sneakers"].some(t => type.includes(t));

/* --- COMBINACIÓN DE COLORES --- */
const areColorsCompatible = (c1, c2) => {
  const combos = {
    azul: ["blanco", "negro", "gris", "beige"],
    negro: ["blanco", "gris", "rojo", "azul"],
    blanco: ["negro", "azul", "rojo", "verde"],
    rojo: ["negro", "blanco", "gris"],
    verde: ["blanco", "beige", "marrón"],
    amarillo: ["azul", "blanco", "gris"],
    morado: ["blanco", "gris", "negro"],
    gris: ["negro", "blanco", "azul", "rojo"]
  };
  return combos[c1]?.includes(c2) || combos[c2]?.includes(c1);
};

const getComplementaryColor = (color) => {
  const map = {
    azul: "blanco",
    negro: "blanco",
    blanco: "negro",
    rojo: "negro",
    verde: "blanco",
    amarillo: "azul",
    morado: "blanco",
    gris: "negro"
  };
  return map[color] || null;
};

/* --- GENERADOR DE OUTFITS --- */
export const generateOutfitSuggestions = (wardrobeItems) => {
  if (!wardrobeItems || wardrobeItems.length < 2) return [];

  const categories = categorizeItems(wardrobeItems);
  const missing = [];

  if (!categories.tops.length && !categories.dresses.length) missing.push("top");
  if (!categories.bottoms.length && !categories.dresses.length) missing.push("bottom");

  const suggestions = [];

  missing.forEach(category => {
    const baseItems = findBaseItems(categories, category);
    baseItems.forEach(base => {
      const matches = findMatchingItems(base, categories);
      const complementaryType = getComplementaryType(base.type, category);

      if (complementaryType) {
        suggestions.push({
          baseItem: base,
          searchQuery: buildSearchQuery(base, complementaryType, matches),
          type: complementaryType,
          matchReason: buildMatchReason(base, matches)
>>>>>>> 8488f7c9e55c7a895c6443d75dbe7c0246267e76
        });
      }
    });
  });

  return suggestions;
};

<<<<<<< HEAD
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
=======
const findBaseItems = (categories, missingCategory) => {
  switch (missingCategory) {
    case "bottom":
      return [...categories.tops, ...categories.outerwear];
    case "top":
      return [...categories.bottoms, ...categories.outerwear];
>>>>>>> 8488f7c9e55c7a895c6443d75dbe7c0246267e76
    default:
      return [];
  }
};

<<<<<<< HEAD
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
=======
const findMatchingItems = (base, categories) => {
  return Object.values(categories)
    .flat()
    .filter(item => item.id !== base.id && itemsMatch(base, item));
};

const itemsMatch = (i1, i2) => {
  return (i1.style && i2.style && i1.style === i2.style) ||
         (i1.color && i2.color && areColorsCompatible(i1.color, i2.color));
};

const buildSearchQuery = (base, type, matches) => {
  const query = [type];

  const compColor = getComplementaryColor(base.color);
  if (compColor) query.push(compColor);
  else if (base.color) query.push(base.color);

  if (base.style) query.push(base.style);

  if (base.tags?.length) {
    const season = base.tags.find(tag => ["verano", "invierno", "primavera", "otoño"].includes(tag));
    const occasion = base.tags.find(tag => ["casual", "formal", "fiesta", "trabajo"].includes(tag));
    if (season) query.push(season);
    if (occasion) query.push(occasion);
  }

  return query.filter(Boolean).join(" ");
};

const buildMatchReason = (base, matches) => {
  const all = [base, ...matches];
  const desc = all.map(item => `${item.type}${item.color ? ` ${item.color}` : ""}`);
  return `Combina bien con tu ${desc.join(" y ")}`;
};

const getComplementaryType = (type, category) => {
  const map = {
    top: ["pantalón", "falda"],
    bottom: ["camisa", "blusa", "camiseta"]
  };
  return map[category]?.[0] || null;
};

/* --- FUNCIÓN DE BÚSQUEDA DE PRODUCTOS --- */
export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_URL}/shopping?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener productos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en búsqueda de productos:", error);
>>>>>>> 8488f7c9e55c7a895c6443d75dbe7c0246267e76
    return [];
  }
};
