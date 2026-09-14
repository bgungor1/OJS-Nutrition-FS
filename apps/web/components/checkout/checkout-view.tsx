'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { calculateCartTotals } from '@/lib/utils';
import { AddressSelector } from './address-selector';
import { VirtualCard } from './virtual-card';
import { PaymentForm } from './payment-form';
import { OrderSummarySidebar } from './order-summary-sidebar';
import { CheckoutEmpty } from './checkout-empty';
import { CheckoutErrorBanner } from './checkout-error-banner';
import { AddressModal } from '@/components/account/address-modal';
import { completeCheckoutAction } from '@/lib/actions/checkout';
import {
  checkoutPaymentSchema,
  DEFAULT_CHECKOUT_FORM,
  type CheckoutFormData,
} from '@/lib/schemas/checkout';
import type { Address, Country } from '@/types';

interface CheckoutViewProps {
  initialAddresses: Address[];
  countries: Country[];
  onCompleteCheckout?: (data: CheckoutFormData) => Promise<void>;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  initialAddresses,
  countries,
  onCompleteCheckout,
}) => {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totals = calculateCartTotals(items);

  const [addresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddresses[0]?.id || '');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<CheckoutFormData>({
    ...DEFAULT_CHECKOUT_FORM,
    address_id: initialAddresses[0]?.id || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFieldChange = <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    handleFieldChange('address_id', id);
  };

  const handleSubmit = async () => {
    setErrors({});
    setGlobalError(null);
    const validation = checkoutPaymentSchema.safeParse(form);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onCompleteCheckout) {
        await onCompleteCheckout(form);
      } else {
        const result = await completeCheckoutAction(form);
        if (!result.success) {
          setGlobalError(result.error || 'Ödeme işlemi tamamlanamadı.');
          if (result.fieldErrors) setErrors(result.fieldErrors);
          return;
        }
        await clearCart();
        router.push(`/payment/thank-you?orderId=${result.orderId}`);
      }
    } catch {
      setGlobalError('Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return <CheckoutEmpty />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        <CheckoutErrorBanner error={globalError} />
        <AddressSelector
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddressId={handleSelectAddress}
          onOpenNewAddressModal={() => setIsAddressModalOpen(true)}
        />
        <div className="space-y-6">
          <VirtualCard
            cardNumber={form.card_number}
            cardHolder={form.card_holder}
            expireMonth={form.expire_month}
            expireYear={form.expire_year}
          />
          <PaymentForm values={form} onChange={handleFieldChange} errors={errors} disabled={isSubmitting} />
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <OrderSummarySidebar
          items={items}
          totals={totals}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          disabled={!selectedAddressId}
        />
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={null}
        countries={countries}
      />
    </div>
  );
};

export default CheckoutView;
