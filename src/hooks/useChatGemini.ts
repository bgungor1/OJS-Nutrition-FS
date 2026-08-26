import { type ApiProduct, type ChatMessage } from "../types";
import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

export const useGeminiChat = (products: ApiProduct[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: "Merhaba! 👋 Mağazamızdaki ürünler hakkında size nasıl yardımcı olabilirim?" }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<ChatSession | null>(null);

  useEffect(() => {
    if (!API_KEY || !products || products.length === 0) return;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const productContext = products
      .filter(p => p && p.name && p.id)
      .map(p => {
        const cleanExplanation = (p.short_explanation || '').replace(/<[^>]*>?/gm, '').trim();
        return `ID: ${p.id}
Ürün: ${p.name}
Fiyat: ${p.price_info?.total_price || 'Bilinmiyor'}
Link: ${p.slug || ''}
Detay: ${cleanExplanation || 'Açıklama yok'}`;
      })
      .join('\n---\n');

    const systemInstruction = `Sen yardımsever, nazik ve satış odaklı bir e-ticaret asistanısın.

ELİNDEKİ ÜRÜN LİSTESİ:
${productContext}

KURALLAR:
1. Sadece yukarıdaki listedeki ürünler hakkında konuş.
2. Müşteri bir ürün önerisi isterse, mutlaka FİYATINI söyle ve LİNKİNİ ver.
3. Listede olmayan bir ürün sorulursa "Maalesef şu an stoklarımızda yok" de.
4. Cevapların kısa (max 3 cümle), net ve Türkçe olsun.
5. HTML veya Markdown kullanma, sadece düz yazı yaz.`.trim();

    // **** SADECE İSTEDİĞİN STARTCHAT BLOĞU EKLENDİ ****
    try {
      chatSessionRef.current = model.startChat({
        systemInstruction: {
          role: "system",
          parts: [
            { text: systemInstruction }
          ]
        }
      });
    } catch (error) {
      console.error("Chat başlatma hatası:", error);
    }
    // **** EKLENEN KISIM BİTTİ ****

  }, [products]);

  const sendMessage = async (userText: string) => {
    if (!chatSessionRef.current) return;

    setIsLoading(true);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        text: userText
      }
    ]);

    try {
      const result = await chatSessionRef.current.sendMessage(userText);
      const response = result.response.text();

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response
        }
      ]);

    } catch (error) {
      console.error("Gemini Hatası:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "Bağlantıda bir sorun oluştu."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};