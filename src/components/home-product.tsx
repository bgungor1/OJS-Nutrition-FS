import protein from '@/assets/protein.png'
import vitaminler from '@/assets/vitaminler.png'
import saglık from '@/assets/saglık.png'
import sGıdaları from '@/assets/spor-gıdaları.png'
import gıda from '@/assets/gıda.png'
import tumu from '@/assets/tum-urunler.png'
import ojsBanner from '@/assets/ojs-nutrition-banner.png'
import BestSellers from './best-sellers'
import type { ApiBestSellerProduct } from '@/types/api'



interface HomeProductProps {
  bestSellers?: ApiBestSellerProduct[]
}

export default function HomeProduct({bestSellers}: HomeProductProps) {
  return (
    <>
    {/* Ürün Kategorileri Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 max-w-6xl mx-auto mt-4 sm:mt-8 px-2 sm:px-4">
      <div className="p-1 sm:p-2">
        <img 
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[157px] object-cover object-center rounded-lg" 
          src={protein} 
          alt="protein görseli" 
        />
      </div>
      <div className="p-1 sm:p-2">
        <img 
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[157px] object-cover object-center rounded-lg" 
          src={vitaminler} 
          alt="vitaminler görseli" 
        />
      </div>
      <div className="p-1 sm:p-2">
        <img 
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[157px] object-cover object-center rounded-lg" 
          src={saglık} 
          alt="sağlık ürünleri görseli" 
        />
      </div>
      <div className="p-1 sm:p-2">
        <img 
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[157px] object-cover object-center rounded-lg" 
          src={sGıdaları} 
          alt="Spor gıdaları ürünlerinin görseli" 
        />
      </div>
      <div className="p-1 sm:p-2">
        <img 
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[157px] object-cover object-center rounded-lg" 
          src={gıda} 
          alt="Gıda görseli" 
        />
      </div>
      <div className="p-1 sm:p-2">
        <img 
          className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[157px] object-cover object-center rounded-lg" 
          src={tumu} 
          alt="tüm ürünler görseli" 
        />
      </div>
    </div>
    
    {/* Çok Satanlar Bölümü */}
    <BestSellers products={bestSellers}/>

    {/* OJS Nutrition Banner - En altta */}
    <div className="mt-8 sm:mt-16 mb-4 sm:mb-8 -mx-2 sm:-mx-4">
      <div className="w-full">
        <img 
          src={ojsBanner} 
          alt="OJS Nutrition Banner" 
          className="w-full h-full object-cover shadow-lg"
          style={{ display: 'block', margin: 0, padding: 0 }}
        />
      </div>
    </div>

      
    </>
  )
}
