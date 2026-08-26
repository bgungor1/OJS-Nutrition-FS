import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function ThankYou() {
  // Örnek sipariş numarası. Gerçek uygulamada bu, ödeme sonrası API'den alınacaktır.
  const orderId = "OJS-20231211-12345";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Siparişiniz Başarıyla Alındı!
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
          Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.
        </p>
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Sipariş Numaranız: <span className="text-blue-600">{orderId}</span>
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Link to="/account/orders">
            <Button variant="outline" className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              Sipariş Detaylarını Görüntüle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ThankYou;




