
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot 
} from 'firebase/firestore';
import { convertPostData } from './utils';

export const getUserPostsQuery = (userId) => {
  const postsRef = collection(db, 'posts');
  return query(
    postsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
};

export const getAllPostsQuery = () => {
  const postsRef = collection(db, 'posts');
  return query(
    postsRef,
    orderBy('createdAt', 'desc'),
    limit(50)
  );
};

export const getUserPosts = async (userId) => {
  try {
    const q = getUserPostsQuery(userId);
    const querySnapshot = await getDocs(q);
    return await Promise.all(querySnapshot.docs.map(convertPostData));
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const subscribeToUserPosts = (userId, callback) => {
  const q = getAllPostsQuery();
  
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
      callback(posts);
    } catch (error) {
      console.error('Error processing posts:', error);
    }
  });
};
