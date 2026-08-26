
import { Badge } from '@/components/ui/badge'
import { Truck, CheckCircle, Clock, XCircle } from 'lucide-react'




interface OrderStatusBadgeProps {
    status: string
    showIcon?: boolean
}
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'delivered':
            return <CheckCircle className="w-4 h-4 text-green-600" />
        case 'shipped':
            return <Truck className="w-4 h-4 text-blue-600" />
        case 'processing':
            return <Clock className="w-4 h-4 text-yellow-600" />
        case 'cancelled':
            return <XCircle className="w-4 h-4 text-red-600" />
        default:
            return <Clock className="w-4 h-4 text-gray-600" />
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case 'delivered':
            return 'Teslim Edildi'
        case 'shipped':
            return 'Kargoya Verildi'
        case 'processing':
            return 'Hazırlanıyor'
        case 'cancelled':
            return 'İptal Edildi'
        case 'returned':
            return 'İade Edildi'
        default:
            return 'Beklemede'
    }
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
        case 'delivered':
            return 'default'
        case 'shipped':
            return 'secondary'
        case 'processing':
            return 'outline'
        case 'cancelled':
            return 'destructive'
        default:
            return 'outline'
    }
}

export default function OrderStatusBadge({ status, showIcon = true }: OrderStatusBadgeProps) {
    return (
        <div className="flex items-center gap-2">
            {showIcon && getStatusIcon(status)}

            <Badge variant={getStatusVariant(status)}>
                {getStatusText(status)}
            </Badge>
        </div>
    )
}

export { getStatusIcon, getStatusText, getStatusVariant }