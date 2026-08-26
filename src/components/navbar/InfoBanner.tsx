interface InfoItem {
    icon: string
    title: string
    description: string
}

interface InfoBannerProps {
    items?: InfoItem[]
}

const defaultItems: InfoItem[] = [
    { icon: '📦', title: 'AYNI GÜN KARGO', description: "16:00'dan önceki siparişlerde" },
    { icon: '😀', title: 'ÜCRETSİZ KARGO', description: '100 TL üzeri siparişlerde' },
    { icon: '🛡️', title: 'GÜVENLİ ALIŞVERİŞ', description: '1.000.000+ mutlu müşteri' }
]

export default function InfoBanner({ items = defaultItems }: InfoBannerProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-10 text-xs py-2 text-center px-4">
            {items.map((item) => (
                <div key={item.title} className="flex items-center gap-1">
                    {item.icon} <strong>{item.title}</strong> - {item.description}
                </div>
            ))}
        </div>
    )
}