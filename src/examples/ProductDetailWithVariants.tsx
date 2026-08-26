import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '@/services/products';
import { transformApiProductToProductDetail, transformApiVariantsToProductVariants } from '@/utils/productTransform';
import { useProductVariants } from '@/hooks/useProductVariants';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

const ProductDetailWithVariants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Hook'u kullan
  const {
    selectedVariant,
    productAromas,
    productSizes
  } = useProductVariants(variants);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const slug = id || 'whey-protein';
        const response = await productsApi.getProductBySlug(slug);

        if (response.status === 'success') {
          const transformedProduct = transformApiProductToProductDetail(response.data);
          const transformedVariants = transformApiVariantsToProductVariants(response.data);

          setProduct(transformedProduct);
          setVariants(transformedVariants);
        }
      } catch (err) {
        console.error('Ürün yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = (variant: any) => {
    console.log('Variant değişti:', variant);
    // Burada seçili variant'a göre fiyat, görsel vb. güncelleyebilirsiniz
  };

  const handleAddToCart = () => {
    console.log('Sepete eklendi:', {
      product: product?.name,
      variant: selectedVariant,
      quantity
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sol Taraf - Ürün Görseli */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <img
                src={selectedVariant.image || product.image}
                alt={product.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Sağ Taraf - Ürün Bilgileri */}
          <div className="space-y-6">
            {/* Ürün Başlığı */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {product.description}
              </p>
            </div>

            {/* Variant Seçici */}
            <ProductVariantSelector
              variants={variants}
              onVariantChange={handleVariantChange}
            />

            {/* Fiyat ve Miktar */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedVariant.price.toLocaleString()} TL
                </span>
                {selectedVariant.originalPrice && (
                  <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                    {selectedVariant.originalPrice.toLocaleString()} TL
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {Math.round(selectedVariant.price / selectedVariant.size.totalServices * 100) / 100} TL/Servis
              </p>

              {/* Miktar Seçimi */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Miktar:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Sepete Ekle Butonu */}
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant.isAvailable}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-medium"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                SEPETE EKLE
              </Button>
            </div>

            {/* Debug Bilgileri (Geliştirme aşamasında) */}
            <div className="bg-gray-100 p-4 rounded-lg text-xs">
              <h4 className="font-bold mb-2">Debug Bilgileri:</h4>
              <p><strong>Seçili Aroma:</strong> {selectedVariant.aroma}</p>
              <p><strong>Seçili Boyut:</strong> {selectedVariant.size.name}</p>
              <p><strong>Mevcut Aromalar:</strong> {productAromas.join(', ')}</p>
              <p><strong>Mevcut Boyutlar:</strong> {productSizes.map(s => s.name).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailWithVariants;


