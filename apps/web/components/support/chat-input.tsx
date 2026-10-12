'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="p-3 border-t border-border bg-card flex items-center gap-2"
    >
      <Input
        type="text"
        placeholder="Bir soru yazın..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs"
        aria-label="Destek mesajı"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!value.trim()}
        className="h-9 px-3 cursor-pointer shrink-0"
        aria-label="Mesajı Gönder"
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
};
