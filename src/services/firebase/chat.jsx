
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  startAt,
  endAt,
  or,
  limit,
  writeBatch
} from 'firebase/firestore';

export const searchUsers = async (searchTerm) => {
  try {
    const usersRef = collection(db, 'users');
    const searchTermLower = searchTerm.toLowerCase();
    
    const queries = [
      query(
        usersRef,
        where('username', '>=', searchTermLower),
        where('username', '<=', searchTermLower + '\uf8ff'),
        limit(5)
      ),
      query(
        usersRef,
        where('email', '>=', searchTermLower),
        where('email', '<=', searchTermLower + '\uf8ff'),
        limit(5)
      ),
      query(
        usersRef,
        where('style.styles', 'array-contains-any', [searchTermLower]),
        limit(5)
      )
    ];

    const results = await Promise.all(queries.map(q => getDocs(q)));
    
    const uniqueUsers = new Map();
    results.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (!uniqueUsers.has(userData.uid)) {
          uniqueUsers.set(userData.uid, {
            id: userData.uid,
            displayName: userData.username || 'Usuario',
            photoURL: userData.photoURL,
            email: userData.email,
            favoriteStyle: userData.style?.styles?.[0] || null,
            style: userData.style || {}
          });
        }
      });
    });

    return Array.from(uniqueUsers.values());
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getChatId = (uid1, uid2) => {
  const sortedIds = [uid1, uid2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

export const sendMessage = async (senderId, receiverId, text) => {
  try {
    const chatId = getChatId(senderId, receiverId);
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);

    // First, ensure the chat document exists
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        participants: [senderId, receiverId],
        createdAt: serverTimestamp(),
        lastMessage: text,
        lastUpdated: serverTimestamp(),
        unreadCount: {
          [receiverId]: 1,
          [senderId]: 0
        }
      });
    } else {
      await updateDoc(chatRef, {
        lastMessage: text,
        lastUpdated: serverTimestamp(),
        [`unreadCount.${receiverId}`]: (chatDoc.data().unreadCount?.[receiverId] || 0) + 1
      });
    }

    // Add the new message
    await addDoc(messagesRef, {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      reactions: [],
      status: 'sent'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.');
  }
};

export const subscribeToMessages = (chatId, callback) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      callback(messages);
    }, (error) => {
      console.error('Error in messages subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    callback([]);
    return () => {};
  }
};

export const subscribeToUserChats = (userId, callback) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      }))
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
      
      callback(chats);
    }, (error) => {
      console.error('Error in chats subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to user chats:', error);
    callback([]);
    return () => {};
  }
};

export const toggleMessageReaction = async (chatId, messageId, userId, userName, emoji) => {
  try {
    const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }

    const reaction = { userId, userName, emoji };
    const hasReacted = messageDoc.data().reactions?.some(
      r => r.userId === userId && r.emoji === emoji
    );

    await updateDoc(messageRef, {
      reactions: hasReacted
        ? arrayRemove(reaction)
        : arrayUnion(reaction)
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw error;
  }
};

export const markChatAsRead = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0
    });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
};

export const checkExistingChat = async (userId1, userId2) => {
  try {
    const chatId = getChatId(userId1, userId2);
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    return chatDoc.exists();
  } catch (error) {
    console.error('Error checking existing chat:', error);
    throw error;
  }
};
