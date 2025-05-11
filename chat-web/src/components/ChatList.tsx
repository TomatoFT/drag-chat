import React, { useState, useEffect } from 'react';
import { getChats, createChat, deleteChat } from '../services/api';
import { Chat } from '../types';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const chatList = await getChats();
      setChats(chatList);
    } catch (err) {
      setError('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      if (selectedChatId === chatId) {
        onSelectChat('');
      }
    } catch (err) {
      setError('Failed to delete chat');
    }
  };

  return (
    <div className="w-64 border-r p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-2">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-2 rounded cursor-pointer ${
                selectedChatId === chat.id
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  onClick={() => onSelectChat(chat.id)}
                  className="flex-1"
                >
                  {chat.name}
                </span>
                <button
                  onClick={() => handleDeleteChat(chat.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList; 