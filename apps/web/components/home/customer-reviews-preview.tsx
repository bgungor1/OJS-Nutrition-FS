import React from 'react';
import { Star } from 'lucide-react';

interface ReviewSnippet {
  date: string;
  title: string;
  comment: string;
  rating: number;
}

const SAMPLE_REVIEWS: ReviewSnippet[] = [
  {
    date: '14/08/2026',
    title: 'Harika Çözünürlük ve Tat',
    comment: 'Çikolatalı whey proteinin tadı ve suyla karışması gerçekten kusursuz. Şişkinlik yapmıyor.',
    rating: 5,
  },
  {
    date: '28/07/2026',
    title: 'Hızlı Kargo ve Orijinal Ürün',
    comment: 'Siparişimi verdikten sonraki gün elime ulaştı. Paketleme çok özenliydi, teşekkürler.',
    rating: 5,
  },
  {
    date: '10/07/2026',
    title: 'Fiyat Performans Canavarı',
    comment: 'Piyasadaki en temiz içerikli kreatinlerden biri. Etkisini ilk haftadan hissettiriyor.',
    rating: 5,
  },
  {
    date: '02/06/2026',
    title: 'Sürekli Tercihim',
    comment: 'Aroma kalitesi ve servis başına düşen protein oranı çok başarılı, güvenle alabilirsiniz.',
    rating: 5,
  },
];

export const CustomerReviewsPreview: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-border gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase">
            Gerçek Müşteri Yorumları
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ürünlerimizi deneyimleyen sporcuların değerlendirmeleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            198.000+ Doğrulanmış Yorum
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SAMPLE_REVIEWS.map((review, index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span>{review.date}</span>
                <div className="flex text-amber-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                  ))}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {review.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviewsPreview;
