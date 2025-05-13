
import { toast } from '@/components/ui/use-toast';

const GOOGLE_VISION_API_KEY = 'AIzaSyDMWs4cZPX9xHBwJvQcScmPQlFa-tat2BQ';
const API_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export const analyzeImage = async (imageFile) => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1] // Remove data URL prefix
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10
            },
            {
              type: 'IMAGE_PROPERTIES'
            },
            {
              type: 'OBJECT_LOCALIZATION'
            }
          ]
        }
      ]
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    return processAnalysisResults(data);
  } catch (error) {
    console.error('Image analysis error:', error);
    toast({
      title: "Error analyzing image",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const processAnalysisResults = (data) => {
  const results = data.responses[0];
  
  // Extract labels
  const labels = results.labelAnnotations || [];
  
  // Extract dominant colors
  const colors = results.imagePropertiesAnnotation?.dominantColors?.colors || [];
  
  // Extract objects
  const objects = results.localizedObjectAnnotations || [];
  
  // Determine clothing type from objects and labels
  const clothingTypes = [
    ...objects
      .filter(obj => isClothingObject(obj.name))
      .map(obj => obj.name),
    ...labels
      .filter(label => isClothingLabel(label.description))
      .map(label => label.description)
  ];

  // Determine style
  const style = determineStyle(labels);

  // Get dominant color
  const dominantColor = colors.length > 0 ? 
    colorToReadableName(colors[0].color) : 
    'unknown color';

  // Generate detailed description
  const description = generateDetailedDescription(
    clothingTypes[0],
    dominantColor,
    style,
    objects,
    labels
  );

  return {
    type: clothingTypes[0] || 'clothing item',
    color: dominantColor,
    style: style,
    confidence: labels[0]?.score || 0,
    description: description,
    tags: [...new Set([...clothingTypes, style, dominantColor])],
    details: {
      objects: objects.map(obj => ({
        name: obj.name,
        confidence: obj.score
      })),
      colors: colors.slice(0, 3).map(color => ({
        name: colorToReadableName(color.color),
        percentage: color.score * 100
      }))
    }
  };
};

const isClothingObject = (name) => {
  const clothingObjects = [
    'Shirt', 'Pants', 'Dress', 'Jacket', 'Coat', 'Sweater',
    'Skirt', 'Blouse', 'T-shirt', 'Jeans', 'Shorts', 'Suit',
    'Blazer', 'Hoodie', 'Shoes', 'Boots', 'Sneakers'
  ];
  return clothingObjects.includes(name);
};

const isClothingLabel = (label) => {
  const clothingKeywords = [
    'shirt', 'pants', 'dress', 'jacket', 'coat', 'sweater',
    'skirt', 'blouse', 't-shirt', 'jeans', 'shorts', 'suit',
    'blazer', 'hoodie', 'shoes', 'boots', 'sneakers'
  ];
  return clothingKeywords.some(keyword => 
    label.toLowerCase().includes(keyword)
  );
};

const determineStyle = (labels) => {
  const styleKeywords = {
    formal: ['formal', 'business', 'suit', 'elegant', 'professional'],
    casual: ['casual', 'everyday', 'relaxed', 't-shirt', 'jeans', 'comfortable'],
    sporty: ['athletic', 'sport', 'active', 'workout', 'running'],
    bohemian: ['boho', 'ethnic', 'pattern', 'artistic', 'floral'],
    streetwear: ['urban', 'street', 'hip hop', 'trendy', 'modern']
  };

  const styleScores = {};
  
  labels.forEach(label => {
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )) {
        styleScores[style] = (styleScores[style] || 0) + label.score;
      }
    }
  });

  if (Object.keys(styleScores).length === 0) return 'casual';
  
  return Object.entries(styleScores).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];
};

const colorToReadableName = (color) => {
  const { red, green, blue } = color;
  
  const colors = [
    { name: 'black', rgb: [0, 0, 0] },
    { name: 'white', rgb: [255, 255, 255] },
    { name: 'red', rgb: [255, 0, 0] },
    { name: 'navy', rgb: [0, 0, 128] },
    { name: 'blue', rgb: [0, 0, 255] },
    { name: 'yellow', rgb: [255, 255, 0] },
    { name: 'purple', rgb: [128, 0, 128] },
    { name: 'orange', rgb: [255, 165, 0] },
    { name: 'brown', rgb: [165, 42, 42] },
    { name: 'pink', rgb: [255, 192, 203] },
    { name: 'gray', rgb: [128, 128, 128] },
    { name: 'beige', rgb: [245, 245, 220] },
    { name: 'burgundy', rgb: [128, 0, 32] },
    { name: 'olive', rgb: [128, 128, 0] },
    { name: 'teal', rgb: [0, 128, 128] }
  ];

  let minDistance = Infinity;
  let closestColor = 'unknown';

  colors.forEach(({ name, rgb }) => {
    const distance = Math.sqrt(
      Math.pow(red - rgb[0], 2) +
      Math.pow(green - rgb[1], 2) +
      Math.pow(blue - rgb[2], 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  });

  return closestColor;
};

const generateDetailedDescription = (type, color, style, objects, labels) => {
  const patterns = labels
    .filter(label => label.description.includes('pattern') || 
                     label.description.includes('print'))
    .map(label => label.description);

  const materials = labels
    .filter(label => 
      ['cotton', 'leather', 'denim', 'silk', 'wool', 'linen']
        .some(material => label.description.toLowerCase().includes(material))
    )
    .map(label => label.description);

  const details = [];
  if (patterns.length > 0) details.push(patterns[0]);
  if (materials.length > 0) details.push(materials[0]);

  const baseDescription = `${capitalize(color)} ${type || 'item'}`;
  const styleDescription = style ? `, ${style} style` : '';
  const detailsDescription = details.length > 0 ? `, ${details.join(', ')}` : '';

  return `${baseDescription}${styleDescription}${detailsDescription}`;
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
