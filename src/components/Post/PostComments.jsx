
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PostComments = ({ comments = [], onAddComment }) => {
  const { t } = useTranslation();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <img
              src={comment.user.avatar}
              alt={comment.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="font-semibold text-sm">{comment.user.name}</span>
              <p className="text-gray-600 text-sm">{comment.text}</p>
              <span className="text-xs text-gray-400">{comment.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('post.commentPlaceholder')}
          className="flex-1"
        />
        <Button type="submit" disabled={!newComment.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default PostComments;
