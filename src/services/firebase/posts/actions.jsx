
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
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { updateUserStats } from '../userStats';

export const uploadCommunityPost = async (file, postData) => {
  try {
    // Sanitize filename to prevent storage errors
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, `community/${uniqueFileName}`);

    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: postData.user.id,
        originalName: file.name
      }
    };

    console.log('Uploading file:', { uniqueFileName, metadata });
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('File uploaded successfully:', snapshot.ref.fullPath);

    // Get download URL
    const imageUrl = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', imageUrl);

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
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();

    // Delete the image from storage first
    if (postData.storagePath) {
      try {
        const storageRef = ref(storage, postData.storagePath);
        await deleteObject(storageRef);
        console.log('Storage file deleted successfully');
      } catch (storageError) {
        console.error('Error deleting storage file:', storageError);
        // Continue with post deletion even if storage deletion fails
      }
    }

    // Delete the post document
    await deleteDoc(postRef);

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
    
    const q = query(likesRef, where('postId', '==', postId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(likesRef, {
        postId,
        userId,
        authorId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likes: increment(1)
      });
      await updateUserStats(authorId, {
        totalLikes: increment(1)
      });
      return true;
    } else {
      await deleteDoc(querySnapshot.docs[0].ref);
      await updateDoc(postRef, {
        likes: increment(-1)
      });
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
    
    const commentDoc = await addDoc(commentsRef, {
      postId,
      userId: comment.user.id,
      authorId,
      text: comment.text,
      createdAt: serverTimestamp()
    });

    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

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
    
    await updateDoc(postRef, {
      shares: increment(1)
    });

    await updateUserStats(authorId, {
      totalShares: increment(1)
    });
  } catch (error) {
    console.error('Error updating shares:', error);
    throw error;
  }
};
