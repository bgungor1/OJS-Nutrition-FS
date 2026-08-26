import whey from '@/assets/whey-protein.jpg'
import fitness from '@/assets/fitness-paketi.png'
import gVitamin from '@/assets/gunluk-vitamin-paketi.png'
import preworkout from '@/assets/preworkout.png'
import cream from '@/assets/rice-of-cream.png'
import creatine from '@/assets/creatine.png'

export interface BestSellerProduct {
  id: number
  name: string
  image: string
  description: string
  reviewCount: number
  rating: number
  price: number
  originalPrice?: number
  discountPercentage?: number
}

export const bestSellersData: BestSellerProduct[] = [
  {
    id: 1,
    name: 'WHEY PROTEIN',
    image: whey,
    description: 'EN ÇOK TERCİH EDİLEN\nPROTEİN TAKVİYESİ',
    reviewCount: 10869,
    rating: 5,
    price: 549
  },
  {
    id: 2,
    name: 'FITNESS PAKETİ',
    image: fitness,
    description: 'EN POPÜLER ÜRÜNLER BİR\nARADA',
    reviewCount: 7650,
    rating: 5,
    price: 799,
    originalPrice: 1126,
    discountPercentage: 29
  },
  {
    id: 3,
    name: 'GÜNLÜK VİTAMİN PAKETİ',
    image: gVitamin,
    description: 'EN SIK TÜKETİLEN TAKVİYELER',
    reviewCount: 5013,
    rating: 5,
    price: 549,
    originalPrice: 747,
    discountPercentage: 15
  },
  {
    id: 4,
    name: 'PRE-WORKOUT SUPREME',
    image: preworkout,
    description: 'ANTRENMAN ÖNCESİ\nTAKVİYE',
    reviewCount: 6738,
    rating: 5,
    price: 399
  },
  {
    id: 5,
    name: 'CREAM OF RICE',
    image: cream,
    description: 'EN LEZZETLİ\nPİRİNÇ KREMASI',
    reviewCount: 5216,
    rating: 5,
    price: 239
  },
  {
    id: 6,
    name: 'CREATINE',
    image: creatine,
    description: 'EN POPÜLER SPORCU\nTAKVİYESİ',
    reviewCount: 8558,
    rating: 5,
    price: 239
  }
]
