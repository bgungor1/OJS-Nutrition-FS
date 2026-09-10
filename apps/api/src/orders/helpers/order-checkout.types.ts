import {
  Address,
  Country,
  Order,
  OrderItem,
  PaymentTransaction,
  Product,
  ProductVariant,
  Region,
  Subregion,
  User,
} from '@prisma/client';
import { AddressSnapshot } from '../interfaces/order-response.interface';

export type AddressWithHierarchy = Address & {
  country: Country;
  region: Region;
  subregion: Subregion;
};

export type OrderCartItem = {
  productId: string;
  productVariantId: string;
  pieces: number;
  product: Pick<Product, 'id' | 'name'>;
  productVariant: Pick<
    ProductVariant,
    'id' | 'aroma' | 'totalPrice' | 'discountedPrice' | 'photoSrc'
  >;
};

export type CreatedOrderWithRelations = Order & {
  items: OrderItem[];
  payment: PaymentTransaction | null;
};

export interface CheckoutContext {
  user: User;
  address: AddressWithHierarchy;
  cartItems: OrderCartItem[];
  addressSnapshot: AddressSnapshot;
  orderNo: string;
  shippingFee: number;
  totalPrice: number;
}
