
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Users, User, Settings, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { subscribeToUserChats } from '@/services/firebase/chat';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserChats(user.uid, (chats) => {
      let count = 0;
      chats.forEach((chat) => {
        count += chat.unreadCount?.[user.uid] || 0;
      });
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  const navItems = [
    { path: '/wardrobe', icon: Home, label: t('navigation.wardrobe') },
    { path: '/outfits', icon: ShoppingBag, label: t('navigation.outfits') },
    { path: '/chats', icon: MessageCircle, label: 'DressoChat', badge: unreadCount },
    { path: '/community', icon: Users, label: t('navigation.community') },
    { path: '/profile', icon: User, label: t('navigation.profile') },
    { path: '/settings', icon: Settings, label: t('navigation.settings') }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] md:top-0 md:bottom-auto z-navigation shadow-md">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors group"
              >
                <div className={`flex items-center ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  <Icon className="w-6 h-6" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-xs mt-1 font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white md:top-0 md:bottom-auto"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
