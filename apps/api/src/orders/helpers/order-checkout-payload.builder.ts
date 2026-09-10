import { OrderStatus, Prisma, User } from '@prisma/client';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
} from '../../payments/interfaces/payment-process.interface';
import { CompleteShoppingDto } from '../dto/complete-shopping.dto';
import { AddressSnapshot } from '../interfaces/order-response.interface';
import { DEFAULT_CURRENCY } from '../order.constants';
import { AddressWithHierarchy, OrderCartItem } from './order-checkout.types';

export class OrderCheckoutPayloadBuilder {
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

  static buildOrderCreateData(params: {
    orderNo: string;
    userId: string;
    totalPrice: number;
    shippingFee: number;
    addressSnapshot: AddressSnapshot;
    cartItems: OrderCartItem[];
    chargeResult: PaymentChargeResult;
  }): Prisma.OrderCreateArgs['data'] {
    const {
      orderNo,
      userId,
      totalPrice,
      shippingFee,
      addressSnapshot,
      cartItems,
      chargeResult,
    } = params;

    return {
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
    };
  }
}
