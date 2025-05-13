
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

export const uploadWardrobeImage = async (file, analysisResults) => {
  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `wardrobe/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // Save data to Firestore
    const wardrobeRef = collection(db, 'wardrobe');
    const docRef = await addDoc(wardrobeRef, {
      imageUrl,
      storagePath: snapshot.ref.fullPath,
      type: analysisResults?.type || 'Unknown item',
      description: analysisResults?.description || '',
      tags: analysisResults?.tags || [],
      color: analysisResults?.color || '',
      style: analysisResults?.style || '',
      createdAt: serverTimestamp(),
      isPrivate: true
    });

    return {
      id: docRef.id,
      imageUrl,
      ...analysisResults
    };
  } catch (error) {
    console.error('Error uploading wardrobe image:', error);
    throw error;
  }
};

export const deleteWardrobeItem = async (itemId, storagePath) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'wardrobe', itemId));

    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    throw error;
  }
};
