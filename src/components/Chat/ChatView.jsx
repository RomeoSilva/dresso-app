
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import MessageInput from './MessageInput';
import MessageReactions from './MessageReactions';
import ChatProfile from './ChatProfile';

const ChatView = ({
  selectedUser,
  messages,
  message,
  setMessage,
  handleSendMessage,
  handleBack,
  handleReaction,
  showProfile,
  setShowProfile,
  isMobileView,
  currentUserId,
  messagesEndRef
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isMobileView && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {selectedUser && (
            <>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white">
                    {selectedUser.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a]">{selectedUser.displayName}</h3>
                <p className="text-sm text-gray-500">En línea</p>
              </div>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowProfile(true)}
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-[#1a1a1a] text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {msg.timestamp && (
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-gray-300' : 'text-gray-500'}`}>
                        {format(msg.timestamp, 'HH:mm', { locale: es })}
                      </p>
                    )}
                    <MessageReactions
                      message={msg}
                      onReact={(emoji) => handleReaction(msg.id, emoji)}
                      currentUserId={currentUserId}
                    />
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Inicia una conversación con {selectedUser?.displayName}
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        onSubmit={handleSendMessage}
      />

      {/* Chat Profile Dialog */}
      <ChatProfile
        user={selectedUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default ChatView;
