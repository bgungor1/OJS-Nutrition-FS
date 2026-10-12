'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Headphones } from 'lucide-react';
import type { ChatMessage } from './chat-types';
import { QUICK_TOPICS, findAutoResponse } from './chat-knowledge';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

export const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: 'Merhaba! OJS Nutrition Canlı Destek hattına hoş geldiniz. Size nasıl yardımcı olabiliriz?',
      timestamp: 'Şimdi',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Otomatik yanıt simülasyonu
    setTimeout(() => {
      const responseText = findAutoResponse(text);
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, agentMessage]);
    }, 400);
  };

  const handleQuickTopicClick = (topicId: string) => {
    const topic = QUICK_TOPICS.find((t) => t.id === topicId);
    if (!topic) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: topic.label,
      timestamp: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      text: topic.response,
      timestamp: new Date().toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-zinc-900 text-white px-4 py-3 shadow-xl hover:bg-zinc-800 transition-all cursor-pointer border border-zinc-700/80 active:scale-95"
          aria-label="Canlı Destek Başlat"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Canlı Destek
          </span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Canlı Destek Penceresi"
          className="flex flex-col w-[340px] sm:w-[380px] h-[480px] sm:h-[520px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 text-white border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-white">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold">OJS Canlı Destek</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-zinc-400">Çevrimiçi</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Sohbeti Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ChatMessages
            messages={messages}
            onQuickTopicClick={handleQuickTopicClick}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSubmit={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
};

export default SupportChatWidget;
