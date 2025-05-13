
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  increment,
  onSnapshot 
} from 'firebase/firestore';

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
