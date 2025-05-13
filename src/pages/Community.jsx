
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import Post from '@/components/Post/Post';
import ImageUploadModal from '@/components/ImageUpload/ImageUploadModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  uploadCommunityPost, 
  deleteCommunityPost,
  likePost,
  addComment,
  sharePost,
  calculateUserStats,
  subscribeToUserPosts
} from '@/services/firebase/posts';

const Community = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUserPosts(user.uid, (updatedPosts) => {
      setPosts(updatedPosts);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleUpload = async (file, links) => {
    setIsLoading(true);
    try {
      const postData = {
        user: {
          id: user.uid,
          name: user.displayName || 'Usuario',
          avatar: user.photoURL
        },
        description: "",
        hotspots: []
      };

      await uploadCommunityPost(file, postData);
      await calculateUserStats(user.uid);

      toast({
        title: t('community.postAdded'),
        description: t('community.postVisible'),
      });
    } catch (error) {
      console.error('Error uploading post:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la publicación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsUploadModalOpen(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await likePost(postId, user.uid, post.userId);
      await calculateUserStats(post.userId);
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el me gusta",
        variant: "destructive"
      });
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const comment = {
        user: {
          id: user.uid,
          name: user.displayName || 'Usuario',
          avatar: user.photoURL
        },
        text
      };

      await addComment(postId, comment, post.userId);
      await calculateUserStats(post.userId);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el comentario",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await sharePost(postId, post.userId);
      await calculateUserStats(post.userId);
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "No se pudo compartir la publicación",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deleteCommunityPost(postId, user.uid);
      await calculateUserStats(user.uid);

      toast({
        title: t('community.postDeleted'),
        description: t('community.postDeletedDesc'),
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EBEF] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-playfair font-bold text-[#1a1a1a] tracking-wide mb-2">
            Dresso
          </h1>
          <div className="w-16 h-0.5 bg-[#1a1a1a] mb-4"></div>
          <div className="flex items-center justify-end w-full">
            <Button 
              className="bg-[#1a1a1a] hover:bg-[#333333] text-white"
              onClick={() => setIsUploadModalOpen(true)}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? "Subiendo..." : t('community.upload')}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onDelete={handleDelete}
            />
          ))}
          {posts.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No hay publicaciones todavía
            </p>
          )}
        </div>
      </motion.div>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        allowLinks={true}
      />
    </div>
  );
};

export default Community;
