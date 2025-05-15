
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Wardrobe Functions
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

// Community Functions
export const uploadCommunityPost = async (file, postData) => {
  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `community/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // Save post data to Firestore
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      imageUrl,
      storagePath: snapshot.ref.fullPath,
      userId: postData.user.id,
      user: postData.user,
      description: postData.description || '',
      hotspots: postData.hotspots || [],
      likes: 0,
      comments: [],
      shares: 0,
      createdAt: serverTimestamp()
    });

    // Update user stats
    await updateUserStats(postData.user.id, {
      totalPosts: increment(1)
    });

    return {
      id: docRef.id,
      imageUrl,
      ...postData
    };
  } catch (error) {
    console.error('Error uploading community post:', error);
    throw error;
  }
};

export const deleteCommunityPost = async (postId, userId) => {
  try {
    // Get post data first
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    const postData = postDoc.data();

    // Delete from Firestore
    await deleteDoc(postRef);

    // Delete from Storage if storagePath exists
    if (postData.storagePath) {
      const storageRef = ref(storage, postData.storagePath);
      await deleteObject(storageRef);
    }

    // Update user stats
    await updateUserStats(userId, {
      totalPosts: increment(-1)
    });

  } catch (error) {
    console.error('Error deleting community post:', error);
    throw error;
  }
};

export const updatePostHotspots = async (postId, hotspots) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { hotspots });
  } catch (error) {
    console.error('Error updating hotspots:', error);
    throw error;
  }
};

export const likePost = async (postId, userId, authorId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const likesRef = collection(db, 'likes');
    
    // Check if user already liked
    const q = query(likesRef, 
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Add like
      await addDoc(likesRef, {
        postId,
        userId,
        authorId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likes: increment(1)
      });
      // Update author's total likes
      await updateUserStats(authorId, {
        totalLikes: increment(1)
      });
      return true;
    } else {
      // Remove like
      await deleteDoc(querySnapshot.docs[0].ref);
      await updateDoc(postRef, {
        likes: increment(-1)
      });
      // Update author's total likes
      await updateUserStats(authorId, {
        totalLikes: increment(-1)
      });
      return false;
    }
  } catch (error) {
    console.error('Error updating like:', error);
    throw error;
  }
};

export const addComment = async (postId, comment, authorId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const commentsRef = collection(db, 'comments');
    
    // Add comment
    const commentDoc = await addDoc(commentsRef, {
      postId,
      userId: comment.user.id,
      authorId,
      text: comment.text,
      createdAt: serverTimestamp()
    });

    // Update author's total comments
    await updateUserStats(authorId, {
      totalComments: increment(1)
    });

    return {
      id: commentDoc.id,
      ...comment
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const sharePost = async (postId, authorId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    // Update post shares count
    await updateDoc(postRef, {
      shares: increment(1)
    });

    // Update author's total shares
    await updateUserStats(authorId, {
      totalShares: increment(1)
    });

  } catch (error) {
    console.error('Error updating shares:', error);
    throw error;
  }
};

// User Stats Functions
export const updateUserStats = async (userId, stats) => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);

    if (userStatsDoc.exists()) {
      await updateDoc(userStatsRef, stats);
    } else {
      await addDoc(collection(db, 'userStats'), {
        userId,
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        ...stats
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const subscribeToUserStats = (userId, callback) => {
  const userStatsRef = doc(db, 'userStats', userId);
  
  return onSnapshot(userStatsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0
      });
    }
  });
};
