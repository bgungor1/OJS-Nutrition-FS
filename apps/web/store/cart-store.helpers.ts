import type { CartItemResponse } from '@/types';

export function mergeServerAndLocalCart(
  serverItems: CartItemResponse[],
  localItems: CartItemResponse[],
): CartItemResponse[] {
  if (serverItems.length === 0) {
    return localItems;
  }
  const serverMap = new Map(
    serverItems.map((item) => [item.product_variant_id, item]),
  );
  const preservedLocal = localItems.filter(
    (item) => !serverMap.has(item.product_variant_id),
  );
  return [...preservedLocal, ...serverItems];
}

export function calculateOptimisticAdd(
  items: CartItemResponse[],
  variantId: string,
  pieces: number,
): CartItemResponse[] {
  return items.map((item) =>
    item.product_variant_id === variantId
      ? { ...item, pieces: item.pieces + pieces }
      : item,
  );
}

export function mergeAddCartResponse(
  currentItems: CartItemResponse[],
  apiItems: CartItemResponse[],
  variantId: string,
): CartItemResponse[] {
  const apiItemMap = new Map(
    apiItems.map((item) => [item.product_variant_id, item]),
  );
  const preservedItems = currentItems.filter(
    (item) =>
      item.product_variant_id !== variantId &&
      !apiItemMap.has(item.product_variant_id),
  );
  return [...preservedItems, ...apiItems];
}

export function calculateOptimisticRemove(
  items: CartItemResponse[],
  variantId: string,
  pieces: number,
): CartItemResponse[] {
  const targetItem = items.find((i) => i.product_variant_id === variantId);
  if (!targetItem) return items;

  return targetItem.pieces <= pieces
    ? items.filter((i) => i.product_variant_id !== variantId)
    : items.map((i) =>
        i.product_variant_id === variantId
          ? { ...i, pieces: i.pieces - pieces }
          : i,
      );
}

export function mergeRemoveCartResponse(
  currentItems: CartItemResponse[],
  apiItems: CartItemResponse[],
  variantId: string,
  targetPieces?: number,
  removedPieces = 1,
): CartItemResponse[] {
  const apiItemMap = new Map(
    apiItems.map((item) => [item.product_variant_id, item]),
  );

  const isCompletelyRemoved =
    !apiItemMap.has(variantId) ||
    (targetPieces !== undefined && targetPieces <= removedPieces);

  const preservedItems = currentItems.filter((item) => {
    if (item.product_variant_id === variantId) {
      return !isCompletelyRemoved;
    }
    return !apiItemMap.has(item.product_variant_id);
  });

  const merged = [...preservedItems, ...apiItems];
  const deduplicatedMap = new Map<string, CartItemResponse>();
  for (const item of merged) {
    deduplicatedMap.set(item.product_variant_id, item);
  }
  return Array.from(deduplicatedMap.values());
}
