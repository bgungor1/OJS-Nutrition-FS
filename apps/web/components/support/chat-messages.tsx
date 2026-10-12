'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import type { ChatMessage } from './chat-types';
import { QUICK_TOPICS } from './chat-knowledge';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onQuickTopicClick: (topicId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  onQuickTopicClick,
  messagesEndRef,
}) => {
  return (
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
                onClick={() => onQuickTopicClick(topic.id)}
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
  );
};
