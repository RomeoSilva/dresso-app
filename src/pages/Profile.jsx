
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Edit2, Heart, MessageCircle, Share2, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileImage from '@/components/Profile/ProfileImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getUserPosts, deleteCommunityPost } from '@/services/firebase/posts';
import { subscribeToUserStats } from '@/services/firebase/userStats';
import Post from '@/components/Post/Post';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, updateUsername } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.photoURL);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToUserStats(user.uid, (newStats) => {
        setStats(newStats);
      });

      const fetchPosts = async () => {
        try {
          const posts = await getUserPosts(user.uid);
          setUserPosts(posts.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
          console.error('Error fetching posts:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las publicaciones",
            variant: "destructive"
          });
        }
      };

      fetchPosts();
      return () => unsubscribe();
    }
  }, [user?.uid, toast]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUsername(editForm.displayName);
      setIsEditModalOpen(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      });
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      await deleteCommunityPost(postId, user.uid);
      setUserPosts(posts => posts.filter(post => post.id !== postId));
      toast({
        title: "Publicación eliminada",
        description: "La publicación se ha eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación",
        variant: "destructive"
      });
    }
  };

  const handleImageUpdate = (newImageUrl) => {
    setProfileImage(newImageUrl);
  };

  return (
    <div className="min-h-screen bg-[#E8EBEF] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-64">
            {/* Background image with reduced overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${profileImage})`,
                filter: 'brightness(0.7)'
              }}
            />
            {/* Lighter gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            
            <div className="absolute -bottom-12 left-6">
              <ProfileImage
                currentImage={profileImage}
                userId={user?.uid}
                onImageUpdate={handleImageUpdate}
              />
            </div>
          </div>
          
          <div className="pt-16 px-6 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.displayName || t('profile.anonymous')}</h1>
                <p className="text-gray-400 font-semibold">{user?.email}</p>
              </div>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar perfil
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#2a2a2a] p-4 rounded-lg text-center"
              >
                <Image className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="block font-semibold text-white">{stats.totalPosts}</span>
                <span className="text-sm text-gray-400">Publicaciones</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#2a2a2a] p-4 rounded-lg text-center"
              >
                <Heart className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="block font-semibold text-white">{stats.totalLikes}</span>
                <span className="text-sm text-gray-400">Me gusta</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#2a2a2a] p-4 rounded-lg text-center"
              >
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="block font-semibold text-white">{stats.totalComments}</span>
                <span className="text-sm text-gray-400">Comentarios</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#2a2a2a] p-4 rounded-lg text-center"
              >
                <Share2 className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="block font-semibold text-white">{stats.totalShares}</span>
                <span className="text-sm text-gray-400">Compartidos</span>
              </motion.div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Mis publicaciones</h2>
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={{
                      ...post,
                      user: {
                        ...post.user,
                        avatar: profileImage
                      }
                    }}
                    onDelete={handlePostDelete}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                  />
                ))}
                {userPosts.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    No tienes publicaciones todavía
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre</Label>
              <Input
                id="displayName"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                value={editForm.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">El correo electrónico no se puede modificar</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a]"
              >
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
