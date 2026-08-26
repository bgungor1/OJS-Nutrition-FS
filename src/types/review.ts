// Müşteri yorumları ile ilgili TypeScript tip tanımları

export interface Review {
  id: number;
  reviewerName: string;
  reviewerInitial: string;
  rating: number; // 1-5 arası puan
  isVerified: boolean; // Doğrulanmış müşteri durumu
  reviewDate: string; // DD/MM/YY formatında
  reviewTitle: string;
  reviewText: string;
  productName: string; // Hangi ürün için yorum yapılmış
  productCategory?: string; // Ürün kategorisi (opsiyonel)
}

export interface ReviewProps {
  reviews: Review[];
  title?: string;
  subtitle?: string;
  showProductFilter?: boolean; // Ürün bazlı filtreleme gösterilsin mi
  maxReviews?: number; // Maksimum gösterilecek yorum sayısı
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1-5 arası her puan için yorum sayısı
  };
  verifiedReviews: number;
}

export interface ReviewFilters {
  rating?: number; // Belirli puana göre filtreleme
  productName?: string; // Belirli ürüne göre filtreleme
  verifiedOnly?: boolean; // Sadece doğrulanmış yorumlar
  dateRange?: {
    start: string;
    end: string;
  };
}

// Yıldız puanlama için yardımcı tip
export type StarRating = 1 | 2 | 3 | 4 | 5;

// Yorum sıralama seçenekleri
export type ReviewSortOption = 
  | 'newest' // En yeni
  | 'oldest' // En eski
  | 'highest_rating' // En yüksek puan
  | 'lowest_rating' // En düşük puan
  | 'most_helpful'; // En faydalı
