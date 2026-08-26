import type { Review, ReviewStats, ReviewFilters } from "@/types/review";

// Görseldeki yorumlara benzer dummy data
export const reviewData: Review[] = [
  {
    id: 1,
    reviewerName: "Mustafa",
    reviewerInitial: "Ü.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "L carnitine",
    reviewText: "Gayet şeffaf ve güzel kargoyla geldi çok memnun kaldım",
    productName: "HAVERCA L-CARNITINE",
    productCategory: "Yağ Yakıcı"
  },
  {
    id: 2,
    reviewerName: "Erol",
    reviewerInitial: "Ş.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "Muhteşem tad",
    reviewText: "Tadı çok iyi. Faydasını da gördüm",
    productName: "HAVERCA CREATINE HCL EDITION",
    productCategory: "Creatine"
  },
  {
    id: 3,
    reviewerName: "Erol",
    reviewerInitial: "Ş.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "Muhteşem",
    reviewText: "Vitaminlerden çok memnunum tekrar sipariş vereceğim",
    productName: "HAVERCA CZNCH VITAMIN",
    productCategory: "Vitamin"
  },
  {
    id: 4,
    reviewerName: "BAHADIR",
    reviewerInitial: "Y.",
    rating: 4.5,
    isVerified: true,
    reviewDate: "08/05/24",
    reviewTitle: "İşe yarar",
    reviewText: "Antreman öncesi isteksizliği yorgunluğu ve gideriyor ve sağlam bi antreman yapmanız konusunda istek sağlıyor. Müthiş terleme, benim biraz kulaklarım yandı ve alnım kaşındı ama bu yan etkilerin normal olduğunu okudum. Bilmiyorum.",
    productName: "HAVERCA PRE-WORKOUT SUPREME",
    productCategory: "Pre-Workout"
  },
  {
    id: 5,
    reviewerName: "Yusuf",
    reviewerInitial: "A.",
    rating: 5,
    isVerified: true,
    reviewDate: "08/05/24",
    reviewTitle: "Süper",
    reviewText: "Harika",
    productName: "HAVERCA WHEY PROTEIN LEVHAN",
    productCategory: "Protein"
  },
  {
    id: 6,
    reviewerName: "Umut",
    reviewerInitial: "E.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "Harika",
    reviewText: "Harika",
    productName: "HAVERCA PRE-WORKOUT",
    productCategory: "Pre-Workout"
  },
  {
    id: 7,
    reviewerName: "Umut",
    reviewerInitial: "E.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "Harika",
    reviewText: "Öneririm",
    productName: "HAVERCA GENZYME HI",
    productCategory: "Enzim"
  },
  {
    id: 8,
    reviewerName: "Muhammet",
    reviewerInitial: "I.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Kalite",
    reviewText: "Süper",
    productName: "HAVERCA PRE-WORKOUT SUPREME",
    productCategory: "Pre-Workout"
  },
  {
    id: 9,
    reviewerName: "Serhat",
    reviewerInitial: "A.",
    rating: 5,
    isVerified: true,
    reviewDate: "08/05/24",
    reviewTitle: "süper",
    reviewText: "dehşet",
    productName: "HAVERCA PRE-WORKOUT SUPREME",
    productCategory: "Pre-Workout"
  },
  {
    id: 10,
    reviewerName: "Ertuğrul",
    reviewerInitial: "I.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "Pump olarak gerçekten başarılı",
    reviewText: "tadı limonlu şekere benziyor, baymaz etki olarak güzel pump veriyor suyun içine atınca çok bekletmeden tüketin yoksa içerisindeki tuz çözünmeye başlayınca tadı ekşimiş bir limona benziyor.",
    productName: "HAVERCA PRE-WORKOUT SUPREME",
    productCategory: "Pre-Workout"
  },
  // Ek yorumlar - çeşitlilik için
  {
    id: 11,
    reviewerName: "Ahmet",
    reviewerInitial: "K.",
    rating: 4,
    isVerified: true,
    reviewDate: "10/05/24",
    reviewTitle: "Fena değil",
    reviewText: "Beklediğim kadar etkili olmadı ama genel olarak memnunum. Fiyat performans açısından uygun.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 12,
    reviewerName: "Mehmet",
    reviewerInitial: "T.",
    rating: 5,
    isVerified: true,
    reviewDate: "09/05/24",
    reviewTitle: "Mükemmel",
    reviewText: "Çok hızlı teslimat, ürün kalitesi mükemmel. Kesinlikle tavsiye ederim.",
    productName: "HAVERCA MULTIVITAMIN",
    productCategory: "Vitamin"
  },
  {
    id: 13,
    reviewerName: "Fatma",
    reviewerInitial: "S.",
    rating: 5,
    isVerified: true,
    reviewDate: "07/05/24",
    reviewTitle: "Çok memnunum",
    reviewText: "Kullanmaya başladığımdan beri enerjim arttı. Özellikle sabah kullanımı çok etkili.",
    productName: "HAVERCA ENERGY BOOST",
    productCategory: "Enerji"
  },
  {
    id: 14,
    reviewerName: "Ali",
    reviewerInitial: "M.",
    rating: 3,
    isVerified: false,
    reviewDate: "11/05/24",
    reviewTitle: "Orta",
    reviewText: "Beklentilerimi tam karşılamadı ama kötü de değil. Belki farklı ürün deneyeceğim.",
    productName: "HAVERCA BCAA",
    productCategory: "Amino Asit"
  },
  {
    id: 15,
    reviewerName: "Zeynep",
    reviewerInitial: "A.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Harika ürün",
    reviewText: "Tadı çok güzel, karışımı kolay. Antrenman sonrası kullanıyorum ve çok faydasını görüyorum.",
    productName: "HAVERCA POST-WORKOUT",
    productCategory: "Post-Workout"
  },
  // Ek yorumlar - daha fazla çeşitlilik için
  {
    id: 16,
    reviewerName: "EREN",
    reviewerInitial: "U.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "Her zamanki kalite. Teşekkürler",
    reviewText: "Her zamanki kalite. Teşekkürler",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 17,
    reviewerName: "Bahadır",
    reviewerInitial: "K.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "En iyi aroma",
    reviewText: "En iyi aroma",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 18,
    reviewerName: "Burhan",
    reviewerInitial: "K.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Yıllardır en beğendiğim protein tozu",
    reviewText: "Yıllardır en beğendiğim protein tozu",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 19,
    reviewerName: "Berke",
    reviewerInitial: "Ç.",
    rating: 4,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Beğendim.",
    reviewText: "Beğendim.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 20,
    reviewerName: "Deniz",
    reviewerInitial: "C.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Çok iyi tat",
    reviewText: "Çok iyi tat",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 21,
    reviewerName: "Burak",
    reviewerInitial: "B.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Tadı harika, kesinlikle tavsiye ederim",
    reviewText: "Tadı harika, kesinlikle tavsiye ederim",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 22,
    reviewerName: "Fatih",
    reviewerInitial: "K.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Fatih kaya",
    reviewText: "Fatih kaya - Aroma önerileri için müşteri hizmetleri ile iletişime geçebilirsiniz.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 23,
    reviewerName: "Berk",
    reviewerInitial: "Y.",
    rating: 5,
    isVerified: true,
    reviewDate: "05/05/24",
    reviewTitle: "Gayet beğendim ve sürekli olarak",
    reviewText: "Gayet beğendim ve sürekli olarak",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 24,
    reviewerName: "Esat",
    reviewerInitial: "S.",
    rating: 5,
    isVerified: true,
    reviewDate: "06/05/24",
    reviewTitle: "çok iyi urunden memnun oldum",
    reviewText: "çok iyi urunden memnun oldum",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 25,
    reviewerName: "Egemen",
    reviewerInitial: "B.",
    rating: 5,
    isVerified: true,
    reviewDate: "04/05/24",
    reviewTitle: "Mükemmel ürün",
    reviewText: "Kalite ve fiyat performansı açısından çok memnunum. Kesinlikle tavsiye ederim.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 26,
    reviewerName: "Can",
    reviewerInitial: "Ö.",
    rating: 5,
    isVerified: true,
    reviewDate: "03/05/24",
    reviewTitle: "Hızlı teslimat",
    reviewText: "Ürün çok hızlı geldi, paketleme de çok güzel. Teşekkürler.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 27,
    reviewerName: "Emre",
    reviewerInitial: "D.",
    rating: 4,
    isVerified: true,
    reviewDate: "02/05/24",
    reviewTitle: "İyi ürün",
    reviewText: "Genel olarak memnunum, fiyat biraz yüksek ama kalite karşılıyor.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 28,
    reviewerName: "Selin",
    reviewerInitial: "M.",
    rating: 5,
    isVerified: true,
    reviewDate: "01/05/24",
    reviewTitle: "Harika",
    reviewText: "Tadı çok güzel, karışımı kolay. Antrenman sonrası kullanıyorum.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 29,
    reviewerName: "Oğuz",
    reviewerInitial: "T.",
    rating: 5,
    isVerified: true,
    reviewDate: "30/04/24",
    reviewTitle: "Süper",
    reviewText: "Çok memnun kaldım, tekrar sipariş vereceğim.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  },
  {
    id: 30,
    reviewerName: "Ayşe",
    reviewerInitial: "K.",
    rating: 5,
    isVerified: true,
    reviewDate: "29/04/24",
    reviewTitle: "Mükemmel",
    reviewText: "Kalite ve hizmet açısından çok memnunum. Teşekkürler.",
    productName: "HAVERCA WHEY PROTEIN",
    productCategory: "Protein"
  }
];

// Yorum istatistiklerini hesaplayan fonksiyon
export const getReviewStats = (reviews: Review[]): ReviewStats => {
  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter(review => review.isVerified).length;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
  
  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };
  
  reviews.forEach(review => {
    const roundedRating = Math.round(review.rating) as keyof typeof ratingDistribution;
    if (roundedRating >= 1 && roundedRating <= 5) {
      ratingDistribution[roundedRating]++;
    }
  });
  
  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
    ratingDistribution,
    verifiedReviews
  };
};

// Yorumları filtreleyen fonksiyon
export const filterReviews = (reviews: Review[], filters: ReviewFilters): Review[] => {
  return reviews.filter(review => {
    if (filters.rating && review.rating < filters.rating) return false;
    if (filters.productName && !review.productName.toLowerCase().includes(filters.productName.toLowerCase())) return false;
    if (filters.verifiedOnly && !review.isVerified) return false;
    if (filters.dateRange) {
      const reviewDate = new Date(`20${review.reviewDate.split('/')[2]}-${review.reviewDate.split('/')[1]}-${review.reviewDate.split('/')[0]}`);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (reviewDate < startDate || reviewDate > endDate) return false;
    }
    return true;
  });
};

// Yorumları sıralayan fonksiyon
export const sortReviews = (reviews: Review[], sortBy: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating'): Review[] => {
  const sortedReviews = [...reviews];
  
  switch (sortBy) {
    case 'newest':
      return sortedReviews.sort((a, b) => {
        const dateA = new Date(`20${a.reviewDate.split('/')[2]}-${a.reviewDate.split('/')[1]}-${a.reviewDate.split('/')[0]}`);
        const dateB = new Date(`20${b.reviewDate.split('/')[2]}-${b.reviewDate.split('/')[1]}-${b.reviewDate.split('/')[0]}`);
        return dateB.getTime() - dateA.getTime();
      });
    case 'oldest':
      return sortedReviews.sort((a, b) => {
        const dateA = new Date(`20${a.reviewDate.split('/')[2]}-${a.reviewDate.split('/')[1]}-${a.reviewDate.split('/')[0]}`);
        const dateB = new Date(`20${b.reviewDate.split('/')[2]}-${b.reviewDate.split('/')[1]}-${b.reviewDate.split('/')[0]}`);
        return dateA.getTime() - dateB.getTime();
      });
    case 'highest_rating':
      return sortedReviews.sort((a, b) => b.rating - a.rating);
    case 'lowest_rating':
      return sortedReviews.sort((a, b) => a.rating - b.rating);
    default:
      return sortedReviews;
  }
};

// Belirli ürüne ait yorumları getiren fonksiyon
export const getReviewsByProduct = (productName: string): Review[] => {
  return reviewData.filter(review => 
    review.productName.toLowerCase().includes(productName.toLowerCase())
  );
};

// En yüksek puanlı yorumları getiren fonksiyon
export const getTopRatedReviews = (limit: number = 5): Review[] => {
  return sortReviews(reviewData, 'highest_rating').slice(0, limit);
};

// Doğrulanmış yorumları getiren fonksiyon
export const getVerifiedReviews = (): Review[] => {
  return reviewData.filter(review => review.isVerified);
};

// Tüm yorum verilerini döndüren fonksiyon
export const getAllReviews = (): Review[] => {
  return reviewData;
};
