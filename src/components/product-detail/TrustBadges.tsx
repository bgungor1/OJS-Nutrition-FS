/**
 * TrustBadges Component
 * 
 * Güvenlik rozetlerini gösterir: Kargo, Müşteri Sayısı, Garanti.
 * 
 * Neden ayrı component?
 * - Tamamen statik içerik, props gerektirmez
 * - Birden fazla sayfada kullanılabilir (product-detail, checkout, home)
 * - Güven oluşturan unsurlar tek yerde yönetilir
 */

import { Truck, Users, CheckCircle } from 'lucide-react'

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Aynı Gün Ücretsiz Kargo</span>
            </div>
            <div className="flex flex-col items-center text-center">
                <Users className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">750.000+ Mutlu Müşteri</span>
            </div>
            <div className="flex flex-col items-center text-center">
                <CheckCircle className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">100% Memnuniyet Garantisi</span>
            </div>
        </div>
    )
}
