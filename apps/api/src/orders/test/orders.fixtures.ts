import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CompleteShoppingDto } from '../dto/complete-shopping.dto';

export const MOCK_USER_ID = 'user-uuid-1';
export const MOCK_ADDRESS_ID = 'address-uuid-1';
export const MOCK_ORDER_ID = 'ord-123';
export const MOCK_ORDER_NO = 'ORD-20260910-A1B2C3';

export const mockAddress = {
  id: MOCK_ADDRESS_ID,
  userId: MOCK_USER_ID,
  title: 'Ev',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  phoneNumber: '05551112233',
  fullAddress: 'Bağdat Cad. No: 10/2',
  country: { name: 'Türkiye' },
  region: { name: 'İstanbul' },
  subregion: { name: 'Kadıköy' },
};

export const mockUser = {
  id: MOCK_USER_ID,
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  email: 'ahmet@example.com',
  phoneNumber: '05551112233',
};

export const mockCartItem = {
  id: 'cart-item-1',
  userId: MOCK_USER_ID,
  productId: 'prod-1',
  productVariantId: 'var-1',
  pieces: 2,
  product: {
    id: 'prod-1',
    name: 'Whey Protein',
  },
  productVariant: {
    id: 'var-1',
    aroma: 'Çikolata',
    totalPrice: new Decimal(300),
    discountedPrice: null,
    photoSrc: 'media/products/whey.jpg',
    stockQuantity: 10,
    isAvailable: true,
  },
};

export const mockCompleteShoppingDto: CompleteShoppingDto = {
  address_id: MOCK_ADDRESS_ID,
  payment_type: 'credit_card',
  payment_token: 'tok_sandbox_test_token',
};

export const mockPaymentChargeSuccess = {
  success: true,
  rawStatus: 'succeeded',
  provider: 'mock',
  providerRef: 'mock_pay_123',
  cardType: 'VISA',
  last4: '4242',
};

export const mockCreatedOrder = {
  id: MOCK_ORDER_ID,
  orderNo: MOCK_ORDER_NO,
  userId: MOCK_USER_ID,
  status: OrderStatus.pending,
  totalPrice: new Decimal(600),
  shippingFee: new Decimal(0),
  addressSnapshot: {
    title: 'Ev',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phoneNumber: '05551112233',
    country: 'Türkiye',
    region: 'İstanbul',
    subregion: 'Kadıköy',
    fullAddress: 'Bağdat Cad. No: 10/2',
  },
  createdAt: new Date('2026-09-10T15:00:00.000Z'),
  updatedAt: new Date('2026-09-10T15:00:00.000Z'),
  items: [
    {
      id: 'item-1',
      orderId: MOCK_ORDER_ID,
      productId: 'prod-1',
      productVariantId: 'var-1',
      productName: 'Whey Protein',
      variantName: 'Çikolata',
      pieces: 2,
      unitPrice: new Decimal(300),
      totalPrice: new Decimal(600),
      photo: 'media/products/whey.jpg',
    },
  ],
  payment: {
    id: 'pay-1',
    orderId: MOCK_ORDER_ID,
    provider: 'mock',
    providerRef: 'mock_pay_123',
    cardType: 'VISA',
    last4: '4242',
    status: 'succeeded',
    createdAt: new Date('2026-09-10T15:00:00.000Z'),
  },
};

export const mockOrdersList = [
  {
    id: 'ord-1',
    orderNo: MOCK_ORDER_NO,
    userId: MOCK_USER_ID,
    status: OrderStatus.pending,
    totalPrice: new Decimal(500),
    shippingFee: new Decimal(0),
    createdAt: new Date('2026-09-10T12:00:00.000Z'),
    updatedAt: new Date('2026-09-10T12:00:00.000Z'),
    items: [{ pieces: 2 }],
    payment: null,
  },
];

export const mockOrderDetail = {
  id: MOCK_ORDER_ID,
  orderNo: MOCK_ORDER_NO,
  userId: MOCK_USER_ID,
  status: OrderStatus.pending,
  totalPrice: new Decimal(600),
  shippingFee: new Decimal(0),
  addressSnapshot: {
    title: 'Ev',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phoneNumber: '05551112233',
    country: 'Türkiye',
    region: 'İstanbul',
    subregion: 'Kadıköy',
    fullAddress: 'Bağdat Cad. No: 10/2',
  },
  createdAt: new Date('2026-09-10T12:00:00.000Z'),
  updatedAt: new Date('2026-09-10T12:00:00.000Z'),
  items: [],
  payment: null,
};

export const mockOrderDetailWithItems = {
  ...mockOrderDetail,
  items: [
    {
      id: 'item-1',
      orderId: MOCK_ORDER_ID,
      productId: 'prod-1',
      productVariantId: 'var-1',
      productName: 'Whey Protein',
      variantName: 'Çikolata',
      pieces: 2,
      unitPrice: new Decimal(300),
      totalPrice: new Decimal(600),
      photo: 'media/products/whey.jpg',
    },
  ],
};
