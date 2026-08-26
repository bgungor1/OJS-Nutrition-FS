import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, ServerOff, Sparkles, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PortfolioNotice: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false)


  useEffect(() => {
    const savedState = sessionStorage.getItem('ojs_portfolio_notice_closed')
    if (savedState === 'true') {
      setIsMinimized(true)
    }
  }, [])

  const handleClose = () => {
    setIsMinimized(true)
    sessionStorage.setItem('ojs_portfolio_notice_closed', 'true')
  }

  const handleReopen = () => {
    setIsMinimized(false)
    sessionStorage.removeItem('ojs_portfolio_notice_closed')
  }

  if (isMinimized) {
    return (
      <aside
        aria-label="Portföy Demo Modu Rozeti"
        className="fixed bottom-6 left-6 z-40 animate-fade-in"
      >
        <button
          onClick={handleReopen}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-white shadow-lg backdrop-blur-md text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-105 border border-amber-400/40"
          title="Portföy & API Bilgilendirmesini Görüntüle"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo / Mock Modu</span>
          <ChevronUp className="w-3.5 h-3.5 opacity-80" />
        </button>
      </aside>
    )
  }

  return (
    <aside
      aria-label="Portföy ve Demo Modu Bildirimi"
      className="relative z-30 w-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-b border-amber-200/60 dark:border-amber-700/40 backdrop-blur-md transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
              <ServerOff className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-amber-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Portföy & Canlı Önizleme Modu
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Mock Data Aktif
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  Canlı API Bakımda
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl">
                Bu proje portföy sunumu amacıyla yayındadır. Orijinal backend REST API sunucusunun servis dışı olması sebebiyle; ürün listeleme, sayfalama, aroma/boyut varyantları, besin değerleri, sepet yönetimi ve detay sayfalarının kesintisiz incelenebilmesi için sistem otomatik olarak <strong>yüksek kaliteli Mock Veri (Yedek Veri Seti)</strong> ile çalıştırılmaktadır.
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  16+ Ürün & Tüm Varyantlar
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sayfalama & Filtreleme Aktif
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sepet & Yerel State Senkronu
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  AI Destekli Mağaza Asistanı
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center pl-10 md:pl-0">
            <Button
              size="sm"
              variant="default"
              onClick={handleClose}
              className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 text-xs font-semibold px-3.5 py-1.5 h-8 rounded-lg shadow-sm transition-all"
            >
              Anladım / Gizle
            </Button>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-amber-500/10 transition-colors"
              title="Bildirimi Kapat"
              aria-label="Bildirimi Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </aside>
  )
}

export default PortfolioNotice
