import { ConflictException } from '@nestjs/common';
import {
  Address,
  Country,
  Order,
  OrderItem,
  OrderStatus,
  PaymentTransaction,
  Prisma,
  Product,
  ProductVariant,
  Region,
  Subregion,
  User,
} from '@prisma/client';
import { AddressSnapshot } from '../interfaces/order-response.interface';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
} from '../../payments/interfaces/payment-process.interface';
import { CompleteShoppingDto } from '../dto/complete-shopping.dto';
import { DEFAULT_CURRENCY } from '../order.constants';

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

export class OrderCheckoutHelper {
  static buildAddressSnapshot(address: AddressWithHierarchy): AddressSnapshot {
    return {
      title: address.title,
      firstName: address.firstName,
      lastName: address.lastName,
      phoneNumber: address.phoneNumber,
      country: address.country.name,
      region: address.region.name,
      subregion: address.subregion.name,
      fullAddress: address.fullAddress,
    };
  }

  static async decrementStockAtomic(
    tx: Prisma.TransactionClient,
    items: OrderCartItem[],
  ): Promise<void> {
    for (const item of items) {
      const res = await tx.productVariant.updateMany({
        where: {
          id: item.productVariantId,
          stockQuantity: { gte: item.pieces },
          isAvailable: true,
        },
        data: { stockQuantity: { decrement: item.pieces } },
      });

      if (res.count === 0) {
        throw new ConflictException(
          `Yetersiz stok: ${item.product.name} (${item.productVariant.aroma}) için talep edilen adet mevcut değil.`,
        );
      }
    }
  }

  static buildChargeRequest(params: {
    dto: CompleteShoppingDto;
    user: User;
    address: AddressWithHierarchy;
    cartItems: OrderCartItem[];
    totalPrice: number;
    orderNo: string;
    ipAddress?: string;
  }): PaymentChargeRequest {
    const { dto, user, address, cartItems, totalPrice, orderNo, ipAddress } =
      params;

    return {
      paymentToken: dto.payment_token,
      amount: totalPrice,
      currency: DEFAULT_CURRENCY,
      orderNo,
      buyer: {
        id: user.id,
        name: user.firstName,
        surname: user.lastName,
        email: user.email,
        gsmNumber: user.phoneNumber ?? address.phoneNumber,
        registrationAddress: address.fullAddress,
        city: address.region.name,
        country: address.country.name,
        ip: ipAddress ?? '127.0.0.1',
      },
      shippingAddress: {
        contactName: `${address.firstName} ${address.lastName}`,
        city: address.region.name,
        country: address.country.name,
        address: address.fullAddress,
      },
      billingAddress: {
        contactName: `${address.firstName} ${address.lastName}`,
        city: address.region.name,
        country: address.country.name,
        address: address.fullAddress,
      },
      items: cartItems.map((ci) => {
        const unitPrice =
          ci.productVariant.discountedPrice !== null &&
          ci.productVariant.discountedPrice !== undefined
            ? Number(ci.productVariant.discountedPrice)
            : Number(ci.productVariant.totalPrice);
        return {
          id: ci.productVariantId,
          name: `${ci.product.name} - ${ci.productVariant.aroma}`,
          category: ci.product.name,
          price: Number(unitPrice.toFixed(2)),
        };
      }),
      paymentType: dto.payment_type,
    };
  }

  static async createOrderWithRelations(
    tx: Prisma.TransactionClient,
    params: {
      orderNo: string;
      userId: string;
      totalPrice: number;
      shippingFee: number;
      addressSnapshot: AddressSnapshot;
      cartItems: OrderCartItem[];
      chargeResult: PaymentChargeResult;
    },
  ): Promise<CreatedOrderWithRelations> {
    const {
      orderNo,
      userId,
      totalPrice,
      shippingFee,
      addressSnapshot,
      cartItems,
      chargeResult,
    } = params;

    return tx.order.create({
      data: {
        orderNo,
        userId,
        status: OrderStatus.pending,
        totalPrice,
        shippingFee,
        addressSnapshot: addressSnapshot as unknown as Prisma.InputJsonValue,
        items: {
          create: cartItems.map((ci) => {
            const unitPrice =
              ci.productVariant.discountedPrice !== null &&
              ci.productVariant.discountedPrice !== undefined
                ? Number(ci.productVariant.discountedPrice)
                : Number(ci.productVariant.totalPrice);
            return {
              productId: ci.productId,
              productVariantId: ci.productVariantId,
              productName: ci.product.name,
              variantName: ci.productVariant.aroma,
              pieces: ci.pieces,
              unitPrice,
              totalPrice: Number((unitPrice * ci.pieces).toFixed(2)),
              photo: ci.productVariant.photoSrc,
            };
          }),
        },
        payment: {
          create: {
            provider: chargeResult.provider,
            providerRef: chargeResult.providerRef,
            cardType: chargeResult.cardType,
            last4: chargeResult.last4,
            status: chargeResult.rawStatus,
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });
  }
}
