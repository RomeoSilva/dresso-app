
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const HotspotImage = ({ src, hotspots = [], onHotspotsChange, isEditing = false }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHotspot, setNewHotspot] = useState({ x: 0, y: 0, name: '', url: '' });
  const [previewData, setPreviewData] = useState({});
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight
      });
    }
  }, [src]);

  const handleImageClick = (e) => {
    if (!isEditing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewHotspot({ x, y, name: '', url: '' });
    setShowAddDialog(true);
  };

  const handleAddHotspot = async () => {
    if (!newHotspot.name || !newHotspot.url) return;

    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(newHotspot.url)}`, {
        headers: {
          'x-api-key': 'UVxepPIMvtaiES8LvlNhGWznmbX3GRp6gUVH6b73'
        }
      });
      const data = await response.json();
      
      const updatedHotspots = [...hotspots, {
        ...newHotspot,
        preview: {
          title: data.data.title,
          description: data.data.description,
          image: data.data.image?.url,
          domain: new URL(newHotspot.url).hostname
        }
      }];
      
      onHotspotsChange(updatedHotspots);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error fetching link preview:', error);
      const updatedHotspots = [...hotspots, newHotspot];
      onHotspotsChange(updatedHotspots);
      setShowAddDialog(false);
    }
  };

  const removeHotspot = (index) => {
    const updatedHotspots = hotspots.filter((_, i) => i !== index);
    onHotspotsChange(updatedHotspots);
  };

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={src}
        alt="Imagen del outfit"
        className="w-full rounded-lg"
        onClick={handleImageClick}
      />

      {hotspots.map((hotspot, index) => (
        <HoverCard key={index}>
          <HoverCardTrigger asChild>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                {isEditing ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 absolute -top-2 -right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHotspot(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </div>
            </motion.div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">{hotspot.name}</h4>
              {hotspot.preview?.image && (
                <img
                  src={hotspot.preview.image}
                  alt={hotspot.name}
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
              {hotspot.preview?.title && (
                <p className="text-sm text-gray-600">{hotspot.preview.title}</p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(hotspot.url, '_blank')}
              >
                Ver producto
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir enlace a prenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la prenda</Label>
              <Input
                value={newHotspot.name}
                onChange={(e) => setNewHotspot({ ...newHotspot, name: e.target.value })}
                placeholder="Ej: Camisa de rayas"
              />
            </div>
            <div>
              <Label>URL del producto</Label>
              <Input
                value={newHotspot.url}
                onChange={(e) => setNewHotspot({ ...newHotspot, url: e.target.value })}
                placeholder="https://"
              />
            </div>
            <Button onClick={handleAddHotspot} className="w-full">
              Añadir enlace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotspotImage;
