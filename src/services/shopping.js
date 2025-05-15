const API_URL = import.meta.env.VITE_API_BASE_URL;

/* --- CATEGORIZACIÓN DE ROPA --- */
const categorizeItems = (items) => {
  const categories = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    shoes: [],
    accessories: [],
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
        });
      }
    });
  });

  return suggestions;
};

const findBaseItems = (categories, missingCategory) => {
  switch (missingCategory) {
    case "bottom":
      return [...categories.tops, ...categories.outerwear];
    case "top":
      return [...categories.bottoms, ...categories.outerwear];
    default:
      return [];
  }
};

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
    return [];
  }
};
