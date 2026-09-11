import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check } from 'lucide-react';
import type { NutritionalContent } from '@/types';

interface ProductAccordionProps {
  features?: string;
  usage?: string;
  nutritionalContent?: NutritionalContent;
}

export const ProductAccordion: React.FC<ProductAccordionProps> = ({
  features,
  usage,
  nutritionalContent,
}) => {
  const featureList = features
    ? features.split('\n').map((f) => f.trim()).filter(Boolean)
    : [];

  const nutritionFacts = nutritionalContent?.nutrition_facts;
  const aminoAcidFacts = nutritionalContent?.amino_acid_facts;

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
      <Accordion type="multiple" defaultValue={['features', 'nutrition']}>
        {featureList.length > 0 && (
          <AccordionItem value="features">
            <AccordionTrigger className="text-base font-bold text-foreground">
              Özellikler
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pt-1 text-xs sm:text-sm text-foreground">
                {featureList.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {nutritionFacts && nutritionFacts.ingredients && nutritionFacts.ingredients.length > 0 && (
          <AccordionItem value="nutrition">
            <AccordionTrigger className="text-base font-bold text-foreground">
              Besin Değerleri
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-2 font-semibold">Bileşen</th>
                      {nutritionFacts.portion_sizes?.map((size, i) => (
                        <th key={i} className="pb-2 font-semibold text-right">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {nutritionFacts.ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="py-2 font-medium text-foreground">{ing.name}</td>
                        {ing.amounts.map((amt, j) => (
                          <td key={j} className="py-2 text-right text-muted-foreground font-mono">
                            {amt}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {aminoAcidFacts && aminoAcidFacts.ingredients && aminoAcidFacts.ingredients.length > 0 && (
          <AccordionItem value="amino-acids">
            <AccordionTrigger className="text-base font-bold text-foreground">
              Amino Asit Profili
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-2 font-semibold">Amino Asit</th>
                      {aminoAcidFacts.portion_sizes?.map((size, i) => (
                        <th key={i} className="pb-2 font-semibold text-right">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {aminoAcidFacts.ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="py-2 font-medium text-foreground">{ing.name}</td>
                        {ing.amounts.map((amt, j) => (
                          <td key={j} className="py-2 text-right text-muted-foreground font-mono">
                            {amt}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {usage && (
          <AccordionItem value="usage">
            <AccordionTrigger className="text-base font-bold text-foreground">
              Kullanım Şekli
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                {usage}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default ProductAccordion;
