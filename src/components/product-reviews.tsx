import { reviewData, getReviewStats } from '@/data/review-data'

interface ProductReviewsProps {
  productName?: string
  maxReviews?: number
}

export default function ProductReviews({ productName, maxReviews = 15 }: ProductReviewsProps) {
  // Ürüne göre yorumları filtrele
  const filteredReviews = productName 
    ? reviewData.filter(review => 
        review.productName.toLowerCase().includes(productName.toLowerCase())
      )
    : reviewData

  // Maksimum yorum sayısını sınırla
  const displayReviews = filteredReviews.slice(0, maxReviews)

  // İstatistikleri hesapla
  const stats = getReviewStats(filteredReviews)

  const renderStars = (rating: number) => {
    return(
      <div className='flex gap-1'>
      {[...Array(5)].map((_, index) => (
        <img 
          key={index}
          src="/src/assets/yıldız.png" 
          alt="Yıldız" 
          className={`w-4 h-4 object-contain ${index < Math.floor(rating) ? 'opacity-100' : 'opacity-30'}`}
        />
      ))}
    </div>
    )
  }

  return (
    <div className='mb-12'>
      {/* Üst çizgi */}
      <div className='h-px bg-gray-300 dark:bg-gray-600 mb-4'></div>
      
      <div className='flex items-start justify-between mb-4'>
        {/* Sol taraf - Başlık */}
        <div className='flex items-center gap-4 flex-shrink-0'>
          <div className='flex gap-1'>
            {renderStars(stats.averageRating)}
          </div>
          <span className='text-lg font-medium text-gray-900 dark:text-white'>{stats.totalReviews.toLocaleString()} Yorum</span>
        </div>
        
        {/* Sağ taraf - Yıldız Dağılım Grafiği */}
        <div className="flex-1 max-w-2xl ml-12">
          <div className="space-y-2">
            {/* 5 Yıldız */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[...Array(5)].map((_, index) => (
                  <img 
                    key={index} 
                    src="/src/assets/yıldız.png" 
                    alt="Yıldız" 
                    className="w-3 h-3 object-contain"
                  />
                ))}
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[5] / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium whitespace-nowrap text-right w-16">
                ({stats.ratingDistribution[5].toLocaleString()})
              </span>
            </div>
            
            {/* 4 Yıldız */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[...Array(4)].map((_, index) => (
                  <img 
                    key={index} 
                    src="/src/assets/yıldız.png" 
                    alt="Yıldız" 
                    className="w-3 h-3 object-contain"
                  />
                ))}
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[4] / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium whitespace-nowrap text-right w-16">
                ({stats.ratingDistribution[4].toLocaleString()})
              </span>
            </div>
            
            {/* 3 Yıldız */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[...Array(3)].map((_, index) => (
                  <img 
                    key={index} 
                    src="/src/assets/yıldız.png" 
                    alt="Yıldız" 
                    className="w-3 h-3 object-contain"
                  />
                ))}
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[3] / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium whitespace-nowrap text-right w-16">
                ({stats.ratingDistribution[3].toLocaleString()})
              </span>
            </div>
            
            {/* 2 Yıldız */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[...Array(2)].map((_, index) => (
                  <img 
                    key={index} 
                    src="/src/assets/yıldız.png" 
                    alt="Yıldız" 
                    className="w-3 h-3 object-contain"
                  />
                ))}
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[2] / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium whitespace-nowrap text-right w-16">
                ({stats.ratingDistribution[2].toLocaleString()})
              </span>
            </div>
            
            {/* 1 Yıldız */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <img 
                  src="/src/assets/yıldız.png" 
                  alt="Yıldız" 
                  className="w-3 h-3 object-contain"
                />
              </div>
              <div className="flex-1 flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[1] / stats.totalReviews) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-medium whitespace-nowrap text-right w-16">
                ({stats.ratingDistribution[1].toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alt çizgi */}
      <div className='h-px bg-gray-300 dark:bg-gray-600 mb-8'></div>
      
      <button className='bg-gradient-to-r from-[#387EC7] to-[#1F23AA] text-white px-6 py-3 rounded-full font-semibold hover:from-[#2d6bb3] hover:to-[#1a1d8f] transition-all duration-300 mb-8'>
        YORUM (17)
      </button>

      {/* Yorum Kartları */}
      <div className='space-y-4'>
        {displayReviews.map((review) => (
          <div key={review.id} className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='flex gap-1'>
                  {renderStars(review.rating)}
                </div>
                <span className='font-medium text-gray-900 dark:text-white'>{review.reviewerName} {review.reviewerInitial}</span>
                {review.isVerified && (
                  <span className='bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full'>
                    DOĞRULANMIŞ MÜŞTERİ
                  </span>
                )}
              </div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>{review.reviewDate}</span>
            </div>
            
            <h3 className='font-semibold text-lg mb-2 text-gray-900 dark:text-white'>{review.reviewTitle}</h3>
            <p className='text-gray-700 dark:text-gray-300 mb-3'>{review.reviewText}</p>
            
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              HAKKINDA {review.productName}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
