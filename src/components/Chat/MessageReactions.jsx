
import React from 'react';
import { motion } from 'framer-motion';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

const REACTIONS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

const MessageReactions = ({ message, onReact, currentUserId }) => {
  const hasReacted = (emoji) => {
    return message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId);
  };

  const getReactionCount = (emoji) => {
    return message.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  const getReactionUsers = (emoji) => {
    return message.reactions
      ?.filter(r => r.emoji === emoji)
      .map(r => r.userName)
      .join(', ');
  };

  return (
    <div className="relative group">
      {/* Reaction picker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white rounded-full shadow-lg p-1 space-x-1"
      >
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className="hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <span className="text-xl">{emoji}</span>
          </button>
        ))}
      </motion.div>

      {/* Existing reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex space-x-1 mt-1">
          {REACTIONS.map((emoji) => {
            const count = getReactionCount(emoji);
            if (count === 0) return null;

            return (
              <HoverCard key={emoji}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => onReact(emoji)}
                    className={`flex items-center space-x-1 text-sm rounded-full px-2 py-1 ${
                      hasReacted(emoji) ? 'bg-gray-200' : 'bg-gray-100'
                    } hover:bg-gray-200 transition-colors`}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2">
                  <p className="text-sm">{getReactionUsers(emoji)}</p>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
