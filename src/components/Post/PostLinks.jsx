
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PostLinks = ({ links = [] }) => {
  return (
    <div className="space-y-2">
      {links.map((link, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => window.open(link.url, '_blank')}
          >
            <span>{link.type}</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default PostLinks;
