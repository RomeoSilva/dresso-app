
import React from 'react';
import { X, Bell, User, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ChatProfile = ({ user, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Perfil de {user.displayName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold">{user.displayName}</h3>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{user.stats?.totalPosts || 0}</p>
              <p className="text-sm text-gray-400">Publicaciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.stats?.totalLikes || 0}</p>
              <p className="text-sm text-gray-400">Me gusta</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-800"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <User className="w-4 h-4 mr-2" />
              Ver perfil completo
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-800"
            >
              <Bell className="w-4 h-4 mr-2" />
              Silenciar chat
            </Button>
            <Button
              variant="destructive"
              className="w-full"
            >
              <Ban className="w-4 h-4 mr-2" />
              Bloquear usuario
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatProfile;
