'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatMessage } from './chat-types';
import { QUICK_TOPICS, findAutoResponse } from './chat-knowledge';

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

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-white mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-zinc-900 text-white rounded-br-xs'
                      : 'bg-card border border-border text-foreground rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block text-[10px] text-muted-foreground/80 text-right mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Quick Topic Suggestions */}
            {messages.length <= 2 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Hızlı Konular:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleQuickTopicClick(topic.id)}
                      className="text-[11px] rounded-lg border border-border bg-card px-2.5 py-1 text-left text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-border bg-card flex items-center gap-2"
          >
            <Input
              type="text"
              placeholder="Bir soru yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-9 text-xs"
              aria-label="Destek mesajı"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim()}
              className="h-9 px-3 cursor-pointer shrink-0"
              aria-label="Mesajı Gönder"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChatWidget;
