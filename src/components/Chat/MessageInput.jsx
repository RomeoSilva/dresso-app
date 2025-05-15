
import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MessageInput = ({ message, setMessage, onSubmit }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit(message);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <div className="flex space-x-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={handleChange}
          placeholder="Escribe un mensaje..."
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" disabled={!message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
