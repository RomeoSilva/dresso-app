
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  orderBy
} from 'firebase/firestore';

export const getUserRecommendations = async (userId) => {
  try {
    // Get current user's data
    const userRef = collection(db, 'users');
    const userDoc = await getDocs(query(userRef, where('uid', '==', userId)));
    const userData = userDoc.docs[0]?.data();

    if (!userData?.style) {
      return [];
    }

    // Get users with completed questionnaire
    const usersQuery = query(
      userRef,
      where('hasCompletedQuestionnaire', '==', true),
      where('uid', '!=', userId),
      limit(50)
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    const recommendedUsers = [];
    usersSnapshot.docs.forEach(doc => {
      const otherUser = doc.data();
      if (otherUser.uid !== userId && otherUser.style) {
        const matchScore = calculateStyleMatch(userData, otherUser);
        if (matchScore > 0) {
          recommendedUsers.push({
            id: otherUser.uid,
            displayName: otherUser.username || 'Usuario',
            photoURL: otherUser.photoURL,
            matchReason: getMatchReason(matchScore, userData, otherUser),
            matchScore,
            favoriteStyle: otherUser.style?.styles?.[0] || null,
            style: otherUser.style || {}
          });
        }
      }
    });

    // Sort by match score and limit to top 20
    return recommendedUsers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    return [];
  }
};

const calculateStyleMatch = (user1, user2) => {
  let score = 0;

  // Match styles (highest weight)
  const styles1 = new Set(user1.style?.styles || []);
  const styles2 = new Set(user2.style?.styles || []);
  const commonStyles = [...styles1].filter(style => styles2.has(style));
  score += commonStyles.length * 3;

  // Match occasions (medium weight)
  const occasions1 = new Set(user1.style?.occasions || []);
  const occasions2 = new Set(user2.style?.occasions || []);
  const commonOccasions = [...occasions1].filter(occasion => occasions2.has(occasion));
  score += commonOccasions.length * 2;

  // Match physical attributes (lower weight)
  if (user1.style?.skinTone === user2.style?.skinTone) score += 1;
  if (user1.style?.hairColor === user2.style?.hairColor) score += 1;
  if (Math.abs(user1.style?.height - user2.style?.height) <= 5) score += 1;

  return score;
};

const getMatchReason = (score, user1, user2) => {
  const reasons = [];

  // Check style matches
  const commonStyles = (user1.style?.styles || [])
    .filter(style => (user2.style?.styles || []).includes(style));
  if (commonStyles.length > 0) {
    reasons.push(`Comparte tu estilo ${commonStyles[0].toLowerCase()}`);
  }

  // Check occasion matches
  const commonOccasions = (user1.style?.occasions || [])
    .filter(occasion => (user2.style?.occasions || []).includes(occasion));
  if (commonOccasions.length > 0) {
    reasons.push(`Viste para ${commonOccasions[0].toLowerCase()}`);
  }

  // Check physical attributes
  if (user1.style?.skinTone === user2.style?.skinTone) {
    reasons.push('Tono de piel similar');
  }
  if (user1.style?.hairColor === user2.style?.hairColor) {
    reasons.push('Color de cabello similar');
  }

  return reasons[0] || 'Podría interesarte su estilo';
};
