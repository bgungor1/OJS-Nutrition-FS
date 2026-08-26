import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { faqCategories, getFAQByCategory } from "@/data/faq-data";
import ContactForm from "@/components/contact/contact-form";

interface FAQProps {
  title?: string;
  subtitle?: string;
}

export function FAQ({ title = "Sıkça Sorulan Sorular", subtitle }: FAQProps) {
  const [activeCategory, setActiveCategory] = useState<'genel' | 'urunler' | 'kargo'>('genel');

  // Aktif kategoriye göre soruları filtrele
  const filteredItems = getFAQByCategory(activeCategory);

  // Kategori butonunun aktif olup olmadığını kontrol et
  const isActive = (category: 'genel' | 'urunler' | 'kargo') => activeCategory === category;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Başlık */}
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}

      {/* Kategori Sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        
        {faqCategories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive(category.key)
                ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Soru sayısı bilgisi */}
      <div className="mb-6">
        <Badge variant="secondary" className="text-xs">
          {activeCategory.toUpperCase()}
        </Badge>
      </div>

      {/* FAQ Listesi */}
      <Accordion type="single" collapsible className="space-y-2">
        {filteredItems.map((item) => (
          <AccordionItem
            key={item.id}
            value={`item-${item.id}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-800">
              <span className="font-medium text-gray-900 dark:text-white">
                {item.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Soru bulunamadı mesajı */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Bu kategoride henüz soru bulunmamaktadır.</p>
        </div>
      )}

      {/* İletişim Formu */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sorunuz burada yok mu?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Size özel yardım için bizimle iletişime geçin.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

export default FAQ;