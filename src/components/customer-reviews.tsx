import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomerReviews() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-20 mt-6 sm:mt-10 mb-10 sm:mb-20">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">GERÇEK MÜŞTERİ YORUMLARI</h2>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {/* Yıldızlar */}
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="sm:w-4 sm:h-4" fill="currentColor" stroke="none" />
            ))}
          </div>
          <span className="text-xs font-semibold">198453 Yorum</span>
          {/* Oklar */}
          <ChevronLeft size={14} className="sm:w-4 sm:h-4 cursor-pointer" />
          <ChevronRight size={14} className="sm:w-4 sm:h-4 cursor-pointer" />
        </div>
      </div>

      {/* Yorum Kartları */}
      <div className="mb-10 sm:mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">03/05/24</p>
            <h3 className="font-semibold text-sm sm:text-base mt-1 text-gray-900 dark:text-white">Beğendim gayet güzeldi</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 mb-6 sm:mb-10 leading-snug">
              Ürün gayet güzel ama ekşiliği <br />bi süreden sonra bayabiliyor insanı <br />teşekkürler.
            </p >
          </div>
        ))}
      </div>
    </div>
  );
}
