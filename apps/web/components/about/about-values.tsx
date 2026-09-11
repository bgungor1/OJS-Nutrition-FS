import React from 'react';
import { ShieldCheck, Award, Sparkles } from 'lucide-react';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Üstün Kalite Standartları',
    desc: 'Yalnızca küresel akreditasyona sahip güvenilir hammadde tedarikçileriyle çalışıyor, her partiyi titizlikle test ediyoruz.',
  },
  {
    icon: Award,
    title: 'Sertifikalı Üretim Tesisleri',
    desc: 'Üretimlerimizi ISO 22000, GMP ve Helal standartlarına uygun modern tesislerde hijyenik koşullarda gerçekleştiriyoruz.',
  },
  {
    icon: Sparkles,
    title: 'Mükemmel Lezzet & Çözünürlük',
    desc: 'Takviye tüketimini bir zorunluluktan çıkarıp keyifli bir alışkanlığa dönüştüren zengin aroma profilleri geliştiriyoruz.',
  },
];

export function AboutValues() {
  return (
    <div className="mb-16">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Değerlerimiz ve Taahhütlerimiz
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Her adımda sağlığınızı ve spor hedeflerinizi destekleyen temel prensiplerimiz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VALUES.map((val) => {
          const Icon = val.icon;
          return (
            <div
              key={val.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">{val.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {val.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
