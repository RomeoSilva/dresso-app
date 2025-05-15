
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImage = async (file, path) => {
  try {
    console.log('Starting image upload...', { file, path });
    
    // Create storage reference with sanitized filename
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}_${sanitizedFileName}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Upload file
    console.log('Uploading file to storage...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully');
    
    // Get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};
