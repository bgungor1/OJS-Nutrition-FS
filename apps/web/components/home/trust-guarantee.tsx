import React from 'react';
import { Star, Award, ShieldCheck, Zap } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: Award,
    title: 'LABORATUVAR TESTLİ ÜRÜNLER',
  },
  {
    icon: Zap,
    title: 'AYNI GÜN & ÜCRETSİZ KARGO',
  },
  {
    icon: ShieldCheck,
    title: 'MEMNUNİYET GARANTİSİ',
  },
];

export const TrustGuarantee: React.FC = () => {
  return (
    <section className="bg-zinc-950 text-white py-12 sm:py-16 lg:py-20 border-t border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-amber-400">
                (140.000+ Değerlendirme)
              </span>
            </div>

            <div className="space-y-4">
              {TRUST_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                      {point.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              200.000&apos;den fazla gerçek müşteri deneyimine dayanarak, ürünlerimizin kalitesine ve saflığına güveniyoruz.
              Herhangi bir sebeple memnun kalmazsanız, uzman destek ekibimizle anında yanınızdayız.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-zinc-800">
              <div className="rounded-xl bg-zinc-900/60 p-4 text-center border border-zinc-800/80">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">200K+</div>
                <div className="text-xs text-zinc-400 mt-1">Müşteri Yorumu</div>
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-4 text-center border border-zinc-800/80">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">%99</div>
                <div className="text-xs text-zinc-400 mt-1">Memnuniyet Oranı</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustGuarantee;
