import { useState } from "react";

// ProductVariant tipini tanımlayalım
export interface ProductVariant {
  id: string;
  aroma: string;
  size: ProductVariantSize;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isAvailable: boolean;
  image?: string;
}

// ProductVariantSize tipini tanımlayalım
export interface ProductVariantSize {
  id: string;
  name: string;
  gram: number;
  pieces: number;
  totalServices: number;
}

// İki boyutun aynı olup olmadığını kontrol eden fonksiyon
function isSameSize(size1: ProductVariantSize, size2: ProductVariantSize): boolean {
  return size1.gram === size2.gram && size1.pieces === size2.pieces;
}

export function useProductVariants(productVariants: ProductVariant[]) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    () => productVariants[0]
  );

  // Ürün varyantlarını aroma bazında grupla
  const productVariantsByAroma = productVariants.reduce(
    (previousValue, currentValue) => {
      if (previousValue[currentValue.aroma]) {
        previousValue[currentValue.aroma].push(currentValue);
      } else {
        previousValue[currentValue.aroma] = [currentValue];
      }
      return previousValue;
    },
    {} as Record<string, ProductVariant[]>
  );

  // Tüm boyutları çıkar (tekrarları kaldır)
  const productSizes = productVariants.reduce(
    (previousValue, currentValue) => {
      if (
        !previousValue.find((size) =>
          isSameSize(size, currentValue.size)
        )
      ) {
        previousValue.push(currentValue.size);
      }
      return previousValue;
    },
    [] as ProductVariantSize[]
  );

  // Tüm aromaları çıkar
  const productAromas = Object.keys(productVariantsByAroma);

  // Belirli bir aroma için mevcut boyutları getir
  function getAromaSizes(aroma: string) {
    return productVariantsByAroma[aroma].map((variant) => variant.size);
  }

  // Seçili aroma için belirli bir boyutun mevcut olup olmadığını kontrol et
  function isSizeAvailable(size: ProductVariantSize) {
    return getAromaSizes(selectedVariant.aroma).find((aromaSize) =>
      isSameSize(aromaSize, size)
    ) !== undefined;
  }

  // Belirli bir aromanın seçili olup olmadığını kontrol et
  function isSelectedAroma(aroma: string) {
    return selectedVariant.aroma === aroma;
  }

  // Belirli bir boyutun seçili olup olmadığını kontrol et
  function isSelectedSize(size: ProductVariantSize) {
    return isSameSize(selectedVariant.size, size);
  }

  // Aroma değiştir
  function selectAroma(aroma: string) {
    const variantsForAroma = productVariantsByAroma[aroma];
    if (variantsForAroma && variantsForAroma.length > 0) {
      // Aynı boyutta variant varsa onu seç, yoksa ilkini seç
      const sameSizeVariant = variantsForAroma.find(variant =>
        isSameSize(variant.size, selectedVariant.size)
      );
      setSelectedVariant(sameSizeVariant || variantsForAroma[0]);
    }
  }

  // Boyut değiştir
  function selectSize(size: ProductVariantSize) {
    const variantsForSize = productVariants.filter(variant =>
      isSameSize(variant.size, size) && variant.aroma === selectedVariant.aroma
    );
    if (variantsForSize.length > 0) {
      setSelectedVariant(variantsForSize[0]);
    }
  }

  // Belirli bir aroma ve boyut kombinasyonu için variant bul
  function getVariantByAromaAndSize(aroma: string, size: ProductVariantSize): ProductVariant | undefined {
    return productVariants.find(variant =>
      variant.aroma === aroma && isSameSize(variant.size, size)
    );
  }

  return {
    selectedVariant,
    setSelectedVariant,
    productVariantsByAroma,
    productSizes,
    productAromas,
    getAromaSizes,
    isSizeAvailable,
    isSelectedAroma,
    isSelectedSize,
    selectAroma,
    selectSize,
    getVariantByAromaAndSize
  };
}


