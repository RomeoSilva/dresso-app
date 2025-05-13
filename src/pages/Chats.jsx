
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRecommendations } from '@/services/firebase/recommendations';
import { 
  sendMessage, 
  subscribeToMessages, 
  getChatId, 
  toggleMessageReaction,
  searchUsers,
  checkExistingChat
} from '@/services/firebase/chat';
import {
  addFriend,
  removeFriend,
  getFriends,
  checkFriendship
} from '@/services/firebase/friends';
import { useToast } from '@/components/ui/use-toast';
import ChatView from '@/components/Chat/ChatView';

const DressoChat = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState({});
  const messagesEndRef = useRef(null);
  const [unsubscribe, setUnsubscribe] = useState(null);
  const searchTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const userFriends = await getFriends(user.uid);
        setFriends(userFriends.map(f => f.friend));
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    };

    loadFriends();
  }, [user.uid]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const userRecs = await getUserRecommendations(user.uid);
        setRecommendations(userRecs);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user.uid]);

  useEffect(() => {
    if (selectedUser) {
      const chatId = getChatId(user.uid, selectedUser.id);
      const unsub = subscribeToMessages(chatId, (newMessages) => {
        setMessages(newMessages);
      });
      setUnsubscribe(() => unsub);

      // Check friendship status
      checkFriendship(user.uid, selectedUser.id)
        .then(isFriend => {
          setFriendshipStatus(prev => ({
            ...prev,
            [selectedUser.id]: isFriend
          }));
        });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedUser, user.uid]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchUsers(searchTerm.trim());
          const filteredResults = results.filter(u => u.id !== user.uid);
          
          // Check friendship status for each result
          const friendshipChecks = await Promise.all(
            filteredResults.map(u => checkFriendship(user.uid, u.id))
          );
          
          const statusMap = {};
          filteredResults.forEach((u, i) => {
            statusMap[u.id] = friendshipChecks[i];
          });
          
          setFriendshipStatus(statusMap);
          setSearchResults(filteredResults);
        } catch (error) {
          console.error('Error searching users:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los resultados de búsqueda",
            variant: "destructive"
          });
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, user.uid, toast]);

  const handleAddFriend = async (friendUser) => {
    try {
      await addFriend(user.uid, friendUser.id);
      setFriendshipStatus(prev => ({
        ...prev,
        [friendUser.id]: true
      }));
      setFriends(prev => [...prev, friendUser]);
      toast({
        title: "¡Nuevo contacto!",
        description: `${friendUser.displayName} ha sido añadido a tus contactos`,
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir el contacto",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(user.uid, friendId);
      setFriendshipStatus(prev => ({
        ...prev,
        [friendId]: false
      }));
      setFriends(prev => prev.filter(f => f.id !== friendId));
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado de tu lista",
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive"
      });
    }
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      const chatExists = await checkExistingChat(user.uid, selectedUser.id);
      setSelectedUser(selectedUser);
      if (isMobileView) {
        setShowChat(true);
      }
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error selecting user:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el chat",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedUser) return;

    try {
      await sendMessage(user.uid, selectedUser.id, messageText.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  const handleReaction = async (messageId, emoji) => {
    if (!selectedUser) return;
    
    try {
      const chatId = getChatId(user.uid, selectedUser.id);
      await toggleMessageReaction(chatId, messageId, user.uid, user.displayName, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir la reacción",
        variant: "destructive"
      });
    }
  };

  const ContactsList = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Contactos</h2>
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios por nombre o estilo..."
              className="pl-10"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[calc(100vh-280px)] overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">
            Buscando usuarios...
          </div>
        ) : searchTerm ? (
          searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div 
                  className="flex items-center space-x-4"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">{user.displayName}</h3>
                    {user.favoriteStyle && (
                      <p className="text-sm text-gray-500">Estilo: {user.favoriteStyle}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-500 hover:text-[#1a1a1a] ${
                    friendshipStatus[user.id] ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => 
                    friendshipStatus[user.id] 
                      ? handleRemoveFriend(user.id)
                      : handleAddFriend(user)
                  }
                >
                  {friendshipStatus[user.id] ? (
                    <UserCheck className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron usuarios
            </div>
          )
        ) : (
          <>
            {friends.length > 0 && (
              <div className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-600 mb-2">Mis Contactos</h3>
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => handleUserSelect(friend)}
                      className={`p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                        selectedUser?.id === friend.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {friend.photoURL ? (
                            <img
                              src={friend.photoURL}
                              alt={friend.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
                              {friend.displayName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1a1a1a]">{friend.displayName}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-600 mb-2">Sugerencias</h3>
              {recommendations.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div 
                    className="flex items-center justify-between"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
                            {user.displayName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1a1a1a]">{user.displayName}</h3>
                        <p className="text-sm text-gray-500">{user.matchReason}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`text-gray-500 hover:text-[#1a1a1a] ${
                        friendshipStatus[user.id] ? 'bg-gray-100' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        friendshipStatus[user.id] 
                          ? handleRemoveFriend(user.id)
                          : handleAddFriend(user);
                      }}
                    >
                      {friendshipStatus[user.id] ? (
                        <UserCheck className="w-5 h-5" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && !searchTerm && recommendations.length === 0 && friends.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No hay contactos disponibles
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E8EBEF] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-playfair font-bold text-[#1a1a1a] tracking-wide mb-2">
            DressoChat
          </h1>
          <p className="text-gray-600">
            Conecta con personas que comparten tu estilo
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Contacts List */}
          {(!isMobileView || !showChat) && (
            <div className="md:col-span-4">
              <ContactsList />
            </div>
          )}

          {/* Chat Area */}
          {(!isMobileView || showChat) && (
            <div className="md:col-span-8 h-full">
              {selectedUser ? (
                <ChatView
                  selectedUser={selectedUser}
                  messages={messages}
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  handleBack={handleBack}
                  handleReaction={handleReaction}
                  showProfile={showProfile}
                  setShowProfile={setShowProfile}
                  isMobileView={isMobileView}
                  currentUserId={user.uid}
                  messagesEndRef={messagesEndRef}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-md h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Selecciona un contacto para comenzar a chatear</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DressoChat;
