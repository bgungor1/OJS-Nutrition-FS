import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useTheme } from "@/components/use-theme"
import logoBlack from "@/assets/LOGO_Siyah.png"
import logoWhite from "@/assets/LOGO_Beyaz.png"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"

import {
  SearchBar,
  UserMenu,
  CartSheet,
  CategoryNav,
  InfoBanner
} from '@/components/navbar'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { theme } = useTheme()
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity)
  const setStoreCartOpen = useCartStore((state) => state.setCartOpen)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    setStoreCartOpen(cartOpen)
  }, [cartOpen])


  const subtotal = getTotalPrice()
  const shippingCost = 15
  const taxRate = 0.18
  const tax = subtotal * taxRate
  const total = subtotal + shippingCost + tax
  const currentLogo = theme === "dark" ? logoWhite : logoBlack
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateItemQuantity(id, newQuantity)
  }

  return (
    <header className="w-full border-b overflow-x-hidden">
      <div className="flex flex-col lg:flex-row justify-around items-center px-4 py-2 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div
            className="p-3 flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={currentLogo} alt="OJS Nutrition Logo" className="h-8" />
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <SearchBar />

        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <ModeToggle />

          <UserMenu
            isAuthenticated={isAuthenticated}
            userName={user?.first_name}
            onLogout={logout}
          />

          <CartSheet
            isOpen={cartOpen}
            onOpenChange={setCartOpen}
            items={items}
            totalItems={getTotalItems()}
            subtotal={subtotal}
            shippingCost={shippingCost}
            tax={tax}
            total={total}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={removeItem}
          />
        </div>
      </div>

      <CategoryNav isOpen={isMobileMenuOpen} />

      <InfoBanner />
    </header>
  )
}