import Banner from '@/components/banner'
import HomeProduct from '@/components/home-product'
import CustomerReviews from '@/components/customer-reviews'
import TrustGuarantee from '@/components/trust-guarantee'
import { useLoaderData } from 'react-router-dom'
import type { ApiBestSellerProduct } from '@/types/api'
export default function Home() {
  const {bestSellers} = useLoaderData() as {bestSellers: ApiBestSellerProduct[]}
  return (
    <div>
      <Banner/>
      <HomeProduct bestSellers={bestSellers}/>
      <CustomerReviews/>
      <TrustGuarantee/>
    </div>
  )
}
