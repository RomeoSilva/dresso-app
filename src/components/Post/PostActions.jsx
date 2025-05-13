
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PostActions = ({ likes, comments, onLike, onComment, onShare, isLiked }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-4">
      <Button 
        variant="ghost" 
        className={`text-gray-600 ${isLiked ? 'text-red-500' : ''}`}
        onClick={onLike}
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
        >
          <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
        </motion.div>
        {likes}
      </Button>
      <Button variant="ghost" className="text-gray-600" onClick={onComment}>
        <MessageCircle className="w-5 h-5 mr-2" />
        {comments}
      </Button>
      <Button variant="ghost" className="text-gray-600 ml-auto" onClick={onShare}>
        <Share2 className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default PostActions;
