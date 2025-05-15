
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { updateUserStats } from '../userStats';

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
