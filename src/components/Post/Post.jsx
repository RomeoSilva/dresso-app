
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import PostActions from './PostActions';
import PostComments from './PostComments';
import PostLinks from './PostLinks';
import ShareModal from './ShareModal';
import HotspotImage from './HotspotImage';

const Post = ({ post, onLike, onComment, onShare, onDelete, onHotspotsChange }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(post.image || post.imageUrl);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // If we have a direct URL, use it
        if (post.imageUrl) {
          setImageUrl(post.imageUrl);
          return;
        }

        // If we have a storage path, get the download URL
        if (post.storagePath) {
          const storageRef = ref(storage, post.storagePath);
          const url = await getDownloadURL(storageRef);
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage();
  }, [post.imageUrl, post.storagePath]);

  // Always use the latest user photo from the post.user object
  const userPhoto = post.user?.photoURL || post.user?.avatar || '/default-avatar.png';

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Ensure comments array exists
  const comments = post.comments || [];
  const commentsCount = post.commentsCount || comments.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={userPhoto}
            alt={post.user?.name || post.user?.username || "Usuario"}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <span className="font-semibold text-gray-900">
            {post.user?.name || post.user?.username || "Usuario"}
          </span>
        </div>
        {post.canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative">
        {imageUrl && (
          <HotspotImage
            src={imageUrl}
            hotspots={post.hotspots || []}
            onHotspotsChange={(newHotspots) => onHotspotsChange(post.id, newHotspots)}
            isEditing={post.canDelete}
          />
        )}
      </div>

      <div className="p-4">
        <PostActions
          likes={post.likes || 0}
          comments={commentsCount}
          isLiked={post.isLiked || false}
          onLike={() => onLike(post.id)}
          onComment={() => setShowComments(!showComments)}
          onShare={handleShare}
        />

        <p className="text-gray-800 mt-4">{post.description}</p>

        {showComments && (
          <div className="mt-4">
            <PostComments
              comments={comments}
              onAddComment={(text) => onComment(post.id, text)}
            />
          </div>
        )}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />
    </motion.div>
  );
};

export default Post;
