
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageUploadBase from '@/components/ImageUpload/ImageUploadBase';
import { uploadImage } from '@/services/firebase/storage';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const ProfileImage = ({ currentImage, userId, onImageUpdate }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { updateProfileImage } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const validateFile = (file) => {
    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Por favor, selecciona una imagen en formato JPG o PNG",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar los 5MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    if (!validateFile(file)) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !validateFile(selectedFile)) return;

    setIsUploading(true);
    console.log('Starting upload process...');

    try {
      // Upload image to Firebase Storage
      const { url } = await uploadImage(selectedFile, `profiles/${userId}`);
      console.log('Image uploaded successfully, URL:', url);

      // Update profile with new image URL
      await updateProfileImage(url);
      console.log('Profile updated with new image');

      // Notify parent component about the new image
      if (onImageUpdate) {
        onImageUpdate(url);
      }

      // Show success message
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente"
      });

      // Reset state and close dialog
      setIsDialogOpen(false);
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Error during upload:', error);
      toast({
        title: "Error al subir la imagen",
        description: "Ha ocurrido un error durante la subida. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a] border-4 border-white shadow-lg">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-medium">
              <span className="text-center">Foto de perfil</span>
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100"
          onClick={() => setIsDialogOpen(true)}
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar foto de perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUploadBase
              onFileSelect={handleFileSelect}
              preview={preview}
            />
            {preview && (
              <Button
                className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  "Subir nueva imagen"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileImage;
