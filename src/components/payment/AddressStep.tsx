import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Address {
    id: string
    first_name: string
    last_name: string
    full_address: string
    phone_number?: string
}

interface AddressStepProps {
    addresses: Address[]
    selectedAddress: string
    onAddressSelect: (addressId: string) => void
    onNext: () => void
}

export default function AddressStep({
    addresses,
    selectedAddress,
    onAddressSelect,
    onNext
}: AddressStepProps) {
    const navigate = useNavigate()

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Teslimat Adresi
            </h2>

            {addresses.length === 0 ? (
                <Card className="p-6 text-center">
                    <p className="text-gray-500 mb-4">Kayıtlı adresiniz yok</p>
                    <Button onClick={() => navigate('/account/addresses')}>
                        Adres Ekle
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <Card
                            key={address.id}
                            className={`p-4 cursor-pointer border-2 transition-colors ${selectedAddress === address.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                                }`}
                            onClick={() => onAddressSelect(address.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                        {address.first_name} {address.last_name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {address.full_address}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {address.phone_number}
                                    </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === address.id
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300'
                                    }`}>
                                    {selectedAddress === address.id && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={onNext}
                disabled={!selectedAddress}
            >
                Kargo ile Devam Et
            </Button>
        </div>
    )
}