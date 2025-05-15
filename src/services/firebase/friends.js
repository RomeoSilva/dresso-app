
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  getDoc,
  writeBatch
} from 'firebase/firestore';

export const addFriend = async (userId, friendId) => {
  try {
    const friendshipId = `${userId}_${friendId}`;
    const friendshipRef = doc(db, 'friendships', friendshipId);
    
    // Check if friendship already exists
    const friendshipDoc = await getDoc(friendshipRef);
    if (friendshipDoc.exists()) {
      return { success: true, message: 'Ya es tu contacto' };
    }

    // Get friend's user data
    const friendDoc = await getDoc(doc(db, 'users', friendId));
    if (!friendDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    const friendData = friendDoc.data();

    // Get current user's data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Error de autenticación');
    }
    const userData = userDoc.data();

    const batch = writeBatch(db);

    // Create friendship document
    batch.set(friendshipRef, {
      users: [userId, friendId],
      createdAt: serverTimestamp(),
      status: 'active',
      friend: {
        id: friendId,
        displayName: friendData.username || 'Usuario',
        photoURL: friendData.photoURL,
        style: friendData.style
      }
    });

    // Create reverse friendship for the other user
    const reverseFriendshipId = `${friendId}_${userId}`;
    const reverseFriendshipRef = doc(db, 'friendships', reverseFriendshipId);
    
    batch.set(reverseFriendshipRef, {
      users: [friendId, userId],
      createdAt: serverTimestamp(),
      status: 'active',
      friend: {
        id: userId,
        displayName: userData.username || 'Usuario',
        photoURL: userData.photoURL,
        style: userData.style
      }
    });

    // Commit both friendship documents
    await batch.commit();
    return { success: true, message: 'Contacto añadido correctamente' };
  } catch (error) {
    console.error('Error adding friend:', error);
    throw new Error('No se pudo añadir el contacto. Por favor, inténtalo de nuevo.');
  }
};

export const removeFriend = async (userId, friendId) => {
  const batch = writeBatch(db);
  
  try {
    const friendshipId = `${userId}_${friendId}`;
    const reverseFriendshipId = `${friendId}_${userId}`;
    
    batch.delete(doc(db, 'friendships', friendshipId));
    batch.delete(doc(db, 'friendships', reverseFriendshipId));
    
    await batch.commit();
    return { success: true, message: 'Contacto eliminado correctamente' };
  } catch (error) {
    console.error('Error removing friend:', error);
    throw new Error('No se pudo eliminar el contacto');
  }
};

export const getFriends = async (userId) => {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const q = query(
      friendshipsRef, 
      where('users', 'array-contains', userId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting friends:', error);
    throw new Error('No se pudieron cargar los contactos');
  }
};

export const checkFriendship = async (userId, friendId) => {
  try {
    const friendshipId = `${userId}_${friendId}`;
    const friendshipDoc = await getDoc(doc(db, 'friendships', friendshipId));
    return friendshipDoc.exists() && friendshipDoc.data().status === 'active';
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};
