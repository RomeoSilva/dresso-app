
import React from 'react';
import { motion } from 'framer-motion';
import WardrobeItem from './WardrobeItem';

const WardrobeGrid = ({ items, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <WardrobeItem
            item={item}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default WardrobeGrid;
