import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type CardType = 'VISA' | 'MASTERCARD'

interface PaymentStepProps {
    cardNumber: string
    cardExpiry: string
    cardCvv: string
    cardType: CardType
    isLoading: boolean
    onCardNumberChange: (value: string) => void
    onCardExpiryChange: (value: string) => void
    onCardCvvChange: (value: string) => void
    onCardTypeChange: (type: CardType) => void
    onBack: () => void
    onSubmit: () => void
}

export default function PaymentStep({
    cardNumber,
    cardExpiry,
    cardCvv,
    cardType,
    isLoading,
    onCardNumberChange,
    onCardExpiryChange,
    onCardCvvChange,
    onCardTypeChange,
    onBack,
    onSubmit
}: PaymentStepProps) {
    const isFormValid = cardNumber && cardExpiry && cardCvv

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Kart Bilgileri
            </h2>

            <div className="flex gap-4 mb-4">
                <Button
                    variant={cardType === 'VISA' ? 'default' : 'outline'}
                    onClick={() => onCardTypeChange('VISA')}
                    className="flex-1"
                >
                    VISA
                </Button>
                <Button
                    variant={cardType === 'MASTERCARD' ? 'default' : 'outline'}
                    onClick={() => onCardTypeChange('MASTERCARD')}
                    className="flex-1"
                >
                    MASTERCARD
                </Button>
            </div>

            <div className="space-y-2 mb-4">
                <Label htmlFor="cardNumber">Kart Numarası</Label>
                <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => onCardNumberChange(e.target.value)}
                    maxLength={19}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <Label htmlFor="expiry">Son Kullanma</Label>
                    <Input
                        id="expiry"
                        placeholder="MM-YY"
                        value={cardExpiry}
                        onChange={(e) => onCardExpiryChange(e.target.value)}
                        maxLength={5}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                        id="cvv"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => onCardCvvChange(e.target.value)}
                        maxLength={3}
                        type="password"
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                >
                    Geri
                </Button>
                <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={onSubmit}
                    disabled={isLoading || !isFormValid}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            İşleniyor...
                        </>
                    ) : (
                        'Siparişi Tamamla'
                    )}
                </Button>
            </div>
        </div>
    )
}