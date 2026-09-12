'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, ArrowRight } from 'lucide-react';
import {
  Input,
  Button,
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui';
import type { ApiFaqItem } from '@/types';

interface FaqListProps {
  items: ApiFaqItem[];
}

const CATEGORIES = [
  { key: 'all', label: 'Tüm Sorular' },
  { key: 'genel', label: 'Genel Bilgiler' },
  { key: 'urunler', label: 'Ürünler & Kalite' },
  { key: 'kargo', label: 'Kargo & Teslimat' },
];

export function FaqList({ items }: FaqListProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeCategory === cat.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Sorularda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-xs bg-card"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
          <Accordion type="single" collapsible className="space-y-2">
            {filteredItems.map((item, idx) => (
              <AccordionItem key={item.id || idx} value={`faq-${item.id || idx}`}>
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-3 px-2">
                  <span className="text-left">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2 pt-1 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <HelpCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Aramanıza uygun soru bulunamadı.</p>
          <p className="text-xs text-muted-foreground mt-1">Farklı bir arama terimi deneyebilir veya destek ekibimize yazabilirsiniz.</p>
        </div>
      )}

      <div className="rounded-2xl bg-muted/40 border border-border p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="secondary" className="text-[10px] font-bold uppercase">
          Müşteri Desteği
        </Badge>
        <h3 className="text-lg sm:text-xl font-bold text-foreground">
          Aradığınız cevabı bulamadınız mı?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Müşteri temsilcilerimiz sipariş, ürün kullanımı ve iade süreçleriniz için yardıma hazır.
        </p>
        <div className="pt-2">
          <Button asChild size="sm">
            <Link href="/contact" className="inline-flex items-center gap-1.5">
              <span>Bize Ulaşın</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FaqList;
