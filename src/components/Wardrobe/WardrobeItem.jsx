
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const WardrobeItem = ({ item, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg"
    >
      <div className="relative">
        <img
          src={item.image}
          alt={item.description}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="outline"
            className="bg-white/80"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{item.type}</h3>
        <p className="text-sm text-gray-600">{item.description}</p>
        {item.tags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WardrobeItem;
