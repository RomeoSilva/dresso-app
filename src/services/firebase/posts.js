
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
  getDoc,
  orderBy,
  onSnapshot,
  limit,
  startAfter
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { updateUserStats } from './userStats';

// Helper function to handle post data conversion
const convertPostData = async (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    image: data.imageUrl,
    createdAt: data.createdAt?.toDate()
  };
};

export const uploadCommunityPost = async (file, postData) => {
  try {
    console.log('Starting community post upload...', { file, postData });

    // Upload image to Firebase Storage
    const storageRef = ref(storage, `community/${Date.now()}_${file.name}`);
    console.log('Uploading image to storage...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Image uploaded, getting download URL...');
    const imageUrl = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', imageUrl);

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

    console.log('Post data saved to Firestore');

    // Update user stats
    await updateUserStats(postData.user.id, {
      totalPosts: increment(1)
    });

    return {
      id: docRef.id,
      image: imageUrl,
      ...postData
    };
  } catch (error) {
    console.error('Error uploading community post:', error);
    throw error;
  }
};

export const deleteCommunityPost = async (postId, userId) => {
  try {
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
      totalPosts: increment(-1),
      totalLikes: increment(-(postData.likes || 0)),
      totalComments: increment(-(postData.comments?.length || 0)),
      totalShares: increment(-(postData.shares || 0))
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
    const q = query(likesRef, where('postId', '==', postId), where('userId', '==', userId));
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

    // Update post's comments count
    await updateDoc(postRef, {
      commentsCount: increment(1)
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

export const getUserPosts = async (userId) => {
  try {
    const postsRef = collection(db, 'posts');
    // Simplified query to avoid index requirement
    const q = query(
      postsRef,
      where('userId', '==', userId),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    const posts = await Promise.all(querySnapshot.docs.map(convertPostData));
    // Sort posts client-side
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const subscribeToUserPosts = (userId, callback) => {
  const postsRef = collection(db, 'posts');
  // Simplified query to avoid index requirement
  const q = query(
    postsRef,
    limit(50)
  );
  
  return onSnapshot(q, async (snapshot) => {
    try {
      const posts = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = await convertPostData(doc);
          return {
            ...data,
            canDelete: data.userId === userId
          };
        })
      );
      // Sort posts client-side
      callback(posts.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error processing posts:', error);
    }
  });
};

export const calculateUserStats = async (userId) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalLikes += data.likes || 0;
      totalComments += data.commentsCount || 0;
      totalShares += data.shares || 0;
    });
    
    const stats = {
      totalPosts: querySnapshot.size,
      totalLikes,
      totalComments,
      totalShares
    };
    
    await updateUserStats(userId, stats);
    return stats;
  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
};
