import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useOrderStore } from '@/store/orderStore'
import { useAddressStore } from '@/store/addressStore'

import {
  CheckoutStepper,
  AddressStep,
  ShippingStep,
  PaymentStep,
  OrderSummary
} from '@/components/payment'

function Payment() {
  const navigate = useNavigate()

  const { items, getTotalPrice, clearCart } = useCartStore()
  const { completeShopping, fetchShipmentFee, shipmentFee, isLoading } = useOrderStore()
  const { addresses, fetchAddresses } = useAddressStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardType, setCardType] = useState<'VISA' | 'MASTERCARD'>('VISA')

  useEffect(() => {
    fetchAddresses()
    fetchShipmentFee()
  }, [fetchAddresses, fetchShipmentFee])

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0].id)
    }
  }, [addresses, selectedAddress])

  const subtotal = getTotalPrice()
  const shippingCost = shipmentFee?.fee || 15
  const taxRate = 0.18
  const tax = subtotal * taxRate
  const total = subtotal + shippingCost + tax

  const handleCompleteShopping = async () => {
    if (!selectedAddress || !cardNumber || !cardExpiry || !cardCvv) {
      alert('Lütfen tüm alanları doldurun')
      return
    }


    const success = await completeShopping({
      address_id: selectedAddress,
      payment_type: 'credit_cart',
      card_digits: cardNumber.replace(/\s/g, ''),
      card_expiration_date: cardExpiry,
      card_security_code: cardCvv,
      card_type: cardType
    })

    if (success) {
      clearCart()
      alert('Siparişiniz başarıyla oluşturuldu!')
      navigate('/account/order')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-1 xl:grid-cols-2 min-h-screen">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
              Ödeme
            </h1>

            <CheckoutStepper currentStep={currentStep} />

            {currentStep === 1 && (
              <AddressStep
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <ShippingStep
                shippingCost={shippingCost}
                onBack={() => setCurrentStep(1)}
                onNext={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 3 && (
              <PaymentStep
                cardNumber={cardNumber}
                cardExpiry={cardExpiry}
                cardCvv={cardCvv}
                cardType={cardType}
                isLoading={isLoading}
                onCardNumberChange={setCardNumber}
                onCardExpiryChange={setCardExpiry}
                onCardCvvChange={setCardCvv}
                onCardTypeChange={setCardType}
                onBack={() => setCurrentStep(2)}
                onSubmit={handleCompleteShopping}
              />
            )}
          </div>
        </div>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shippingCost={shippingCost}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  )
}
export default Payment