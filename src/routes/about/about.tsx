import { reviewData, getReviewStats } from '@/data/review-data'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from 'react-router-dom'


function About() {
  const stats = getReviewStats(reviewData)
  const displayReviews = reviewData.slice(0, 6)

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
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Ana Sayfa</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Hakkımızda</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className='text-2xl sm:text-3xl font-bold mb-4'>Sağlıklı ve Fit Yaşamayı Zevkli ve Kolay Hale Getirmek İçin Varız</h1>
      <div className='text-base  mb-4'>
      <p className='mb-4'>2016 yılından beri sporcu gıdaları, takviye edici gıdalar ve fonksiyonel gıdaları üreten bir firma olarak; müşterilerimize en kaliteli, en lezzetli, tüketilmesi kolay ürünler sunuyoruz.</p>
      <p className='mb-4'>Müşteri memnuniyeti ve sağlığı her zaman önceliğimiz olmuştur. Ürünlerimizde, yüksek kalite standartlarına bağlı olarak, sporcuların ve sağlıklı yaşam tutkunlarının ihtiyaçlarına yönelik <span className='block'>besleyici çözümler sunuyoruz. Ürün yelpazemizdeki protein tozları, aminoasitler, vitamin ve mineral takviyeleri ile spor performansınızı desteklemek içinideal besin değerlerini sunuyoruz.</span> 
      
      </p>
      <p className='mb-4'>Sizin için sadece en iyisinin yeterli olduğunu biliyoruz. Bu nedenle, inovasyo, kalite, sağlık ve güvenlik ilkelerimizi korurken, sürekli olarak ürünlerimizi geliştirmeye ve yenilikçi beslenme 
        <span className='block'>çözümleri sunmaya devam ediyoruz.</span>
      </p>
      <p className='mb-4'>Sporcu gıdaları konusunda lider bir marka olarak, sizin sağlığınıza ve perfomansınza değer veriyoruz. Siz de performansınızı en üst seviyeye çıkarmak ve sağlıklı yaşam tarzınızı desteklemek
        <span className='block'>istiyorsanız, bize katılın ve en besleyici çözümlerle tanışın. Sağlıklı ve aktif bir yaşam için her zaman yanınızdayız.</span>
      </p>

      <p className='text-2xl sm:text-3xl font-bold mb-4'>1.000.000+ den Fazla Mutlu Müşteri </p>
      <p>Sanatçılardan profesyonel sporculara, doktordan öğrencilere hayatın her alanında sağlıklı yaşamı ve beslenmeyi hedefleyen 1.000.000'den fazla kişiye ulaştık.</p>
      </div>
      <div>
        <h2 className='text-2xl sm:text-3xl font-bold mt-6'>Sertifikalarımız</h2>
        <div className='flex flex-wrap gap-2 mb-10 mt-2'>
        <img 
            src="/src/assets/about/iso.png" 
            alt="ISO Sertifikası" 
            className='h-20 w-auto object-contain hover:scale-105 transition-transform duration-300'
          />
  
          <img 
            src="/src/assets/about/helal.png" 
            alt="Helal Sertifikası" 
            className='h-20 w-auto object-contain hover:scale-105 transition-transform duration-300'
          />
          <img 
            src="/src/assets/about/gıda-guvenligi.png" 
            alt="Gıda Güvenliği Sertifikası" 
            className='h-20 w-auto object-contain hover:scale-105 transition-transform duration-300'
          />
          <img 
            src="/src/assets/about/gmp.png" 
            alt="GMP Sertifikası" 
            className='h-20 w-auto object-contain hover:scale-105 transition-transform duration-300'
          />
                <img 
            src="/src/assets/about/certified-company.png" 
            alt="Sertifikalı Şirket" 
            className='h-20 w-auto object-contain hover:scale-105 transition-transform duration-300'
          />
          <img 
            src="/src/assets/about/ghp.png" 
            alt="GHP Sertifikası" 
            className='h-20 w-auto object-contain hover:scale-105 transition-transform duration-300'
          />
        </div>
      </div>
{/* Yorumlar Bölümü */}
<div className='mb-12 '>
        {/* Üst çizgi */}
        <div className='h-px bg-gray-300 dark:bg-gray-600 mb-4'></div>
        
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex gap-1'>
            {renderStars(5)}
          </div>
          <span className='text-lg font-medium text-gray-900 dark:text-white'>{stats.totalReviews.toLocaleString()} Yorum</span>
        </div>
        
        {/* Alt çizgi */}
        <div className='h-px bg-gray-300 dark:bg-gray-600 mb-8'></div>
        
        <button className='bg-gradient-to-r from-[#387EC7] to-[#1F23AA] text-white px-6 py-3 rounded-full font-semibold hover:from-[#2d6bb3] hover:to-[#1a1d8f] transition-all duration-300 mb-8'>
          ÜRÜN İNCELEMELERİ
        </button>

        {/* Yorum Kartları */}
        <div className='space-y-4'>
          {displayReviews.map((review) => (
            <div key={review.id} className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-left'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2'>
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                  <div className='flex gap-1'>
                    {renderStars(review.rating)}
                  </div>
                  <span className='font-medium text-gray-900 dark:text-white'>{review.reviewerName} {review.reviewerInitial}</span>
                  {review.isVerified && (
                    <span className='bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full w-fit'>
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
    </div>
    
    
  )
}

export default About