import React, { useState, useRef, useEffect } from 'react';
import { useGeminiChat } from '../hooks/useChatGemini';
import { type ApiProduct } from '../types/api';

interface Props {
  products: ApiProduct[]; // Bu veri yukarıdan (Layout.tsx) gelecek
}

const Chatbot: React.FC<Props> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  // Hook'umuzu kullanıyoruz
  const { messages, sendMessage, isLoading } = useGeminiChat(products);
  
  // Otomatik aşağı kaydırma için
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* CHAT PENCERESİ */}
      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-4">
          
          {/* Başlık */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">🤖 Mağaza Asistanı</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 font-bold">✕</button>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-gray-400 text-xs ml-2">Yazıyor...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input 
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Bir soru sorun..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* AÇMA BUTONU */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-3xl transition-transform hover:scale-105"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default Chatbot;



