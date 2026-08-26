import React from 'react';
import { useProductVariants } from '@/hooks/useProductVariants';
import type { ProductVariant } from '@/hooks/useProductVariants';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange?: (variant: ProductVariant) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({ 
  variants, 
  onVariantChange 
}) => {
  const {
    selectedVariant,
    productAromas,
    productSizes,
    isSelectedAroma,
    isSelectedSize,
    isSizeAvailable,
    selectAroma,
    selectSize
  } = useProductVariants(variants);

  // Seçili variant değiştiğinde parent component'e bildir
  React.useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // Aroma görseli için mapping
  const getFlavorImage = (aroma: string) => {
    const imageMap: { [key: string]: string } = {
      'Bisküvi': '/src/assets/flavors/biscuit.webp',
      'Çikolata': '/src/assets/flavors/choc.webp',
      'Muz': '/src/assets/flavors/banana.webp',
      'Salted Caramel': '/src/assets/flavors/salted caramel.webp',
      'Choco Nut': '/src/assets/flavors/choco-nut.webp',
      'Hindistan Cevizi': '/src/assets/flavors/cookie-cream.webp',
      'Raspberry Cheesecake': '/src/assets/flavors/strawberry.webp',
      'Çilek': '/src/assets/flavors/strawberry.webp'
    };
    return imageMap[aroma] || '/src/assets/flavors/strawberry.webp';
  };

  return (
    <div className="space-y-6">
      {/* Aroma Seçimi */}
      {productAromas.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">AROMA:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {productAromas.map((aroma) => {
              const isAvailable = variants.some(v => v.aroma === aroma && v.isAvailable);
              
              return (
                <button
                  key={aroma}
                  onClick={() => selectAroma(aroma)}
                  disabled={!isAvailable}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelectedAroma(aroma)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <img 
                      src={getFlavorImage(aroma)} 
                      alt={aroma}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const emojiMap: { [key: string]: string } = {
                          'Bisküvi': '🍪',
                          'Çikolata': '🍫',
                          'Muz': '🍌',
                          'Salted Caramel': '🍯',
                          'Choco Nut': '🥜',
                          'Hindistan Cevizi': '🥥',
                          'Raspberry Cheesecake': '🫐',
                          'Çilek': '🍓'
                        };
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.textContent = emojiMap[aroma] || '🍯';
                      }}
                    />
                    <span className="text-2xl hidden"></span>
                  </div>
                  <div className="text-xs leading-tight text-center">
                    {aroma}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Boyut Seçimi */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">BOYUT:</label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {productSizes.map((size) => {
            const isAvailable = isSizeAvailable(size);
            const variant = variants.find(v => 
              v.aroma === selectedVariant.aroma && 
              v.size.gram === size.gram && 
              v.size.pieces === size.pieces
            );
            
            return (
              <button
                key={`${size.gram}g-${size.pieces}`}
                onClick={() => selectSize(size)}
                disabled={!isAvailable}
                className={`relative p-3 sm:p-4 border-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelectedSize(size)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {variant?.discountPercentage && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    %{variant.discountPercentage} İNDİRİM
                  </div>
                )}
                <div className="font-bold">{size.name}</div>
                <div className="text-xs text-gray-500">({size.totalServices} servis)</div>
                {variant && (
                  <div className="text-xs text-gray-600 mt-1">
                    {variant.price.toLocaleString()} TL
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seçili Variant Bilgileri */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Seçili Ürün:</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedVariant.aroma} - {selectedVariant.size.name}
            </p>
            <p className="text-xs text-gray-500">
              {selectedVariant.size.totalServices} servis
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedVariant.price.toLocaleString()} TL
            </p>
            {selectedVariant.originalPrice && (
              <p className="text-sm text-gray-400 line-through">
                {selectedVariant.originalPrice.toLocaleString()} TL
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantSelector;
