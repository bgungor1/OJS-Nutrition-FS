import { Link } from 'react-router-dom'
import ContactForm from '@/components/contact/contact-form'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function Contact() {
  return (
    <div className="container text-center items-center mx-auto px-4 py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Ana Sayfa</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>İletişim</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='text-center mb-8'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4'>Bize Ulaşın</h1>
        <p className='text-base sm:text-lg text-muted-foreground'>
          Bize aşağıdaki iletişim formu ile ulaşabilirsiniz.
        </p>
      </div>
      
      <div className='max-w-2xl mx-auto'>
        <ContactForm />
      </div>

      <div className='text-center mt-8 space-y-2'>
      <p className='text-sm sm:text-base'>*Aynı gün kargo hafta içi 16:00, Cumartesi ise 11.00'a kadar verilen siparişler için geçerlidir.</p>
      <p className='text-sm sm:text-base'>Siparişler Kargoya verilince e-posta ve sms ile bilgilendirme yapılır.</p>

      <p className='text-sm sm:text-base mt-4'> Telefon ile <strong>0850 305 29 89</strong> numarasını arayarak bizlere sesli mesaj bırakabilirsiniz. <span className='block'>Sesli mesajlarınıza hafta içi saat <strong>09:00-17.00</strong> arasında dönüş sağlanmaktadır.</span></p>
      </div>
    </div>
  )
}

export default Contact