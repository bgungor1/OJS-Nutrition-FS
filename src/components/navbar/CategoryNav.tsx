interface Category {
    name: string
    href: string
}

interface CategoryNavProps {
    isOpen: boolean
    categories?: Category[]
}

const defaultCategories: Category[] = [
    { name: 'PROTEİN', href: '#' },
    { name: 'SPOR GIDALARI', href: '#' },
    { name: 'SAĞLIK', href: '#' },
    { name: 'GIDA', href: '#' },
    { name: 'VİTAMİN', href: '#' },
    { name: 'TÜM ÜRÜNLER', href: '#' }
]

export default function CategoryNav({
    isOpen,
    categories = defaultCategories
}: CategoryNavProps) {
    return (
        <nav className={`bg-black text-white text-sm font-medium transition-all duration-300 ${isOpen ? 'block' : 'hidden lg:block'
            }`}>
            <div className="flex flex-col lg:flex-row justify-center gap-4 lg:gap-8 px-4 py-2">
                {categories.map((category) => (
                    <a
                        key={category.name}
                        href={category.href}
                        className="py-2 lg:py-0 lg:mx-10 hover:underline text-center lg:text-left"
                    >
                        {category.name}
                    </a>
                ))}
            </div>
        </nav>
    )
}