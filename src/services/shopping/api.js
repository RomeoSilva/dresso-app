const GOOGLE_SHOPPING_API_KEY = import.meta.env.VITE_GOOGLE_SHOPPING_API_KEY;
const SHOPPING_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COUNTRY = import.meta.env.VITE_GOOGLE_SHOPPING_COUNTRY || 'ES';
const MAX_RESULTS = parseInt(import.meta.env.VITE_GOOGLE_SHOPPING_MAX_RESULTS, 10) || 3;

export const searchProducts = async (query) => {
  if (!query || query.trim() === '') {
    throw new Error('La consulta de búsqueda está vacía.');
  }

  let url;
  const useLocalApi = SHOPPING_API_BASE_URL && !SHOPPING_API_BASE_URL.includes('googleapis.com');

  if (useLocalApi) {
    url = `${SHOPPING_API_BASE_URL}?q=${encodeURIComponent(query)}`;
  } else {
    if (!GOOGLE_SHOPPING_API_KEY) {
      throw new Error("Falta la clave de API de Google Shopping.");
    }
    url = `https://shoppingcontent.googleapis.com/content/v2.1/products?key=${GOOGLE_SHOPPING_API_KEY}&maxResults=${MAX_RESULTS}&country=${COUNTRY}&q=${encodeURIComponent(query)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error en la API (${response.status})`);
    }

    const data = await response.json();
    const productList = useLocalApi
      ? data.items || []
      : data.resources || data.items || [];

    if (!Array.isArray(productList)) {
      throw new Error('Respuesta de la API no válida.');
    }

    return productList
      .filter(product => {
        const hasTitle = product?.title;
        const hasImage = product?.image || product?.imageLink || product?.images?.[0]?.link;
        const hasLink = product?.link;
        return hasTitle && hasImage && hasLink;
      })
      .map(product => ({
        id: product.id || String(Date.now() + Math.random()),
        title: product.title,
        price: {
          value: product.price?.value || product.prices?.[0]?.value || '0',
          currency: product.price?.currency || product.prices?.[0]?.currency || 'EUR'
        },
        image: useLocalApi
          ? product.image
          : product.imageLink || product.images?.[0]?.link,
        link: product.link,
        displayLink: product.displayLink || new URL(product.link).hostname
      }));
  } catch (error) {
    if (error.message.includes('fetch') || error.message.includes('conectar')) {
      throw new Error('No se pudo conectar con el servidor. Intenta más tarde.');
    }
    throw error;
  }
};

export const buildSearchQuery = (missingType, baseItems, isFallback = false) => {
  const queryParts = [];

  if (isFallback) {
    queryParts.push('accesorio');
  } else if (missingType) {
    queryParts.push(missingType);
  }

  const styleTags = ['casual', 'sporty', 'formal', 'elegant', 'bohemio', 'moderno', 'vintage', 'minimalista', 'urbano', 'trabajo', 'fiesta'];
  const styles = baseItems.flatMap(item =>
    item.style || item.tags?.filter(tag => styleTags.includes(tag?.toLowerCase())) || []
  );

  const dominantStyle = styles.length > 0
    ? styles.reduce((a, b, _, arr) =>
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
    : 'casual';

  queryParts.push(dominantStyle);

  const colors = baseItems.map(item => item.color).filter(Boolean);
  if (colors.length > 0) {
    queryParts.push(colors[0]);
  }

  const finalQuery = queryParts.filter(Boolean).join(' ').trim().replace(/\s+/g, ' ');
  return finalQuery || 'ropa tendencia mujer';
};
