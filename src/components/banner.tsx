import banner from '@/assets/banner_slider.jpg'

export default function Banner() {
  return (
    <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[640px] relative overflow-hidden w-full">
     <img 
       src={banner} 
       alt="Banner Slider" 
       className='w-full h-full object-cover' 
     />
    </div>
  )
}
