import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrdersMapper, OrderWithRelations } from './orders.mapper';

describe('OrdersMapper', () => {
  const mockDate = new Date('2026-09-10T12:00:00.000Z');

  const mockAddressSnapshot = {
    title: 'Ev',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phoneNumber: '05551112233',
    country: 'Türkiye',
    region: 'İstanbul',
    subregion: 'Kadıköy',
    fullAddress: 'Caferağa Mah. Moda Cad. No: 5/3',
  };

  const mockPayment = {
    id: 'pay-1',
    orderId: 'ord-1',
    provider: 'iyzico',
    providerRef: 'iyz_ref_123',
    cardType: 'VISA',
    last4: '4242',
    status: 'succeeded',
    createdAt: mockDate,
  };

  const mockOrderItem = {
    id: 'item-1',
    orderId: 'ord-1',
    productId: 'prod-1',
    productVariantId: 'var-1',
    productName: 'Whey Protein',
    variantName: 'Çikolata',
    pieces: 2,
    unitPrice: new Decimal(450.0),
    totalPrice: new Decimal(900.0),
    photo: 'media/products/whey.jpg',
  };

  const mockOrder: OrderWithRelations = {
    id: 'ord-1',
    orderNo: 'ORD-20260910-A1B2C3',
    userId: 'user-1',
    status: OrderStatus.pending,
    totalPrice: new Decimal(949.9),
    shippingFee: new Decimal(49.9),
    addressSnapshot: mockAddressSnapshot,
    createdAt: mockDate,
    updatedAt: mockDate,
    items: [mockOrderItem],
    payment: mockPayment,
  };

  describe('toAddressSnapshot', () => {
    it('geçerli adres snapshot objesini eksiksiz dönüştürmelidir', () => {
      const result = OrdersMapper.toAddressSnapshot(mockAddressSnapshot);
      expect(result).toEqual(mockAddressSnapshot);
    });

    it('boş veya geçersiz girdi verildiğinde güvenli varsayılan değerler dönmelidir', () => {
      const emptyResult = OrdersMapper.toAddressSnapshot(null);
      expect(emptyResult).toEqual({
        title: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        country: '',
        region: '',
        subregion: '',
        fullAddress: '',
      });

      const nonObjectResult = OrdersMapper.toAddressSnapshot('invalid string');
      expect(nonObjectResult.fullAddress).toBe('');
    });
  });

  describe('toPaymentSummary', () => {
    it('ödeme kaydını başarıyla dönüştürmelidir', () => {
      const result = OrdersMapper.toPaymentSummary(mockPayment);
      expect(result).toEqual({
        provider: 'iyzico',
        provider_ref: 'iyz_ref_123',
        card_type: 'VISA',
        last4: '4242',
        status: 'succeeded',
        created_at: mockDate.toISOString(),
      });
    });

    it('ödeme bulunmadığında null dönmelidir', () => {
      expect(OrdersMapper.toPaymentSummary(null)).toBeNull();
      expect(OrdersMapper.toPaymentSummary(undefined)).toBeNull();
    });
  });

  describe('toOrderItemResponse', () => {
    it('sipariş kalemini Decimal alanları number yaparak dönüştürmeli ve çift istemci photo alanlarını sağlamalıdır', () => {
      const result = OrdersMapper.toOrderItemResponse(mockOrderItem);
      expect(result).toEqual({
        id: 'item-1',
        product_id: 'prod-1',
        product_variant_id: 'var-1',
        product_name: 'Whey Protein',
        variant_name: 'Çikolata',
        pieces: 2,
        unit_price: 450.0,
        total_price: 900.0,
        photo: 'media/products/whey.jpg',
        photo_src: 'media/products/whey.jpg',
      });
    });
  });

  describe('toOrderDetailResponse', () => {
    it('detaylı sipariş yanıtını, subtotal ve cart_detail alias dahil oluşturmalıdır', () => {
      const result = OrdersMapper.toOrderDetailResponse(mockOrder);

      expect(result.id).toBe('ord-1');
      expect(result.order_no).toBe('ORD-20260910-A1B2C3');
      expect(result.status).toBe(OrderStatus.pending);
      expect(result.total_price).toBe(949.9);
      expect(result.shipping_fee).toBe(49.9);
      expect(result.subtotal).toBe(900.0);
      expect(result.items).toHaveLength(1);
      expect(result.cart_detail).toHaveLength(1);
      expect(result.address_snapshot).toEqual(mockAddressSnapshot);
      expect(result.payment?.provider_ref).toBe('iyz_ref_123');
      expect(result.created_at).toBe(mockDate.toISOString());
    });
  });

  describe('toOrderSummaryResponse & toOrderSummaryList', () => {
    it('sipariş özetini ve toplam ürün adedini (item_count) doğru hesaplamalıdır', () => {
      const result = OrdersMapper.toOrderSummaryResponse(mockOrder);

      expect(result.id).toBe('ord-1');
      expect(result.order_no).toBe('ORD-20260910-A1B2C3');
      expect(result.status).toBe(OrderStatus.pending);
      expect(result.total_price).toBe(949.9);
      expect(result.shipping_fee).toBe(49.9);
      expect(result.item_count).toBe(2); // pieces: 2
      expect(result.payment?.card_type).toBe('VISA');
    });

    it('sipariş listesini özet dizisine dönüştürmelidir', () => {
      const list = OrdersMapper.toOrderSummaryList([mockOrder]);
      expect(list).toHaveLength(1);
      expect(list[0].order_no).toBe('ORD-20260910-A1B2C3');
    });

    it('sayfalanmış yanıtı (PaginatedOrdersResponse) doğru paketlemelidir', () => {
      const paginated = OrdersMapper.toPaginatedOrdersResponse([mockOrder], 1);
      expect(paginated.count).toBe(1);
      expect(paginated.results).toHaveLength(1);
      expect(paginated.results[0].id).toBe('ord-1');
    });
  });
});
