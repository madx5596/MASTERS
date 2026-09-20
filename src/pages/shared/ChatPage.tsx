import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, useDataStore } from '../../store';
import { Card, Avatar, Button, EmptyState } from '../../components/ui';
import { formatTime } from '../../utils/format';

export function ChatPage() {
  const { currentUser } = useAuthStore();
  const { conversations, messages, sendMessage, markMessagesRead } = useDataStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations for current user
  const userConversations = conversations.filter(c => 
    c.participantIds.includes(currentUser?.id || '')
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = messages
    .filter(m => m.conversationId === selectedConversation)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && currentUser) {
      markMessagesRead(selectedConversation, currentUser.id);
    }
  }, [selectedConversation, currentUser, markMessagesRead]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConv || !currentUser) return;

    const receiverId = selectedConv.participantIds.find(id => id !== currentUser.id);
    if (!receiverId) return;

    sendMessage(
      selectedConversation!,
      newMessage,
      currentUser.id,
      `${currentUser.firstName} ${currentUser.lastName}`,
      receiverId
    );
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipantName = (conv: typeof conversations[0]) => {
    const otherIndex = conv.participantIds.indexOf(currentUser?.id || '') === 0 ? 1 : 0;
    return conv.participantNames[otherIndex];
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Сообщения</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {userConversations.length === 0 ? (
            <EmptyState icon="💬" title="Нет диалогов" description="Сообщения появятся здесь" />
          ) : (
            userConversations.map(conv => {
              const otherName = getOtherParticipantName(conv);
              const isSelected = selectedConversation === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-violet-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={otherName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{otherName}</h3>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-400">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <Avatar name={getOtherParticipantName(selectedConv)} size="sm" />
              <div>
                <h3 className="font-medium text-gray-900">{getOtherParticipantName(selectedConv)}</h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {conversationMessages.map(msg => {
                const isOwn = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-violet-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-violet-200' : 'text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите сообщение..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="md"
                >
                  ➤
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon="💬"
              title="Выберите диалог"
              description="Выберите conversación из списка слева"
            />
          </div>
        )}
      </div>
    </div>
  );
}
