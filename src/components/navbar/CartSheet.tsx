import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, MinusCircle, PlusCircle } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { AnimatePresence, motion } from "motion/react"

interface CartItem {
    id: string
    name: string
    image: string
    price: number
    quantity: number
}

interface CartSheetProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    items: CartItem[]
    totalItems: number
    subtotal: number
    shippingCost: number
    tax: number
    total: number
    onUpdateQuantity: (id: string, quantity: number) => void
    onRemoveItem: (id: string) => void
}

export default function CartSheet({
    isOpen,
    onOpenChange,
    items,
    totalItems,
    subtotal,
    shippingCost,
    tax,
    total,
    onUpdateQuantity,
    onRemoveItem
}: CartSheetProps) {
    const navigate = useNavigate()

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button variant="secondary" className="relative rounded-none">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="ml-1 hidden sm:inline">SEPET</span>
                    <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 text-xs px-1"
                    >
                        {totalItems}
                    </Badge>
                </Button>
            </SheetTrigger>

            <AnimatePresence>
                {isOpen && (
                    <SheetContent
                        side="right"
                        className="flex flex-col w-[400px] sm:w-[450px] justify-between"
                    >
                        <motion.div
                            key="cart-sheet"
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <SheetHeader>
                                <SheetTitle>Sipariş Özeti</SheetTitle>
                                <SheetDescription>
                                    Sepetinizdeki ürünler ve fiyat detayları
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto space-y-4 mt-4 px-2">
                                {items.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                        Sepetiniz boş.
                                    </p>
                                ) : (
                                    items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                                    ₺{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity === 1}
                                                    >
                                                        <MinusCircle className="h-4 w-4" />
                                                    </Button>
                                                    <span className="text-sm font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <PlusCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => onRemoveItem(item.id)}
                                                        className="ml-auto"
                                                    >
                                                        Kaldır
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        <div className="mt-auto">
                            <Separator className="my-4" />

                            <div className="space-y-3 mb-6 px-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Ara Toplam</span>
                                    <span className="text-gray-900 dark:text-white">₺{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">Kargo</span>
                                    <span className="text-gray-900 dark:text-white">₺{shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">KDV (%18)</span>
                                    <span className="text-gray-900 dark:text-white">₺{tax.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span className="text-gray-900 dark:text-white">Toplam</span>
                                    <span className="text-gray-900 dark:text-white">₺{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-3 px-2 pb-4">
                                <input
                                    type="text"
                                    placeholder="İndirim Kodu"
                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded-md text-sm"
                                />
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                                    onClick={() => navigate('/payment')}
                                >
                                    SEPETİ TAMAMLA
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                )}
            </AnimatePresence>
        </Sheet>
    )
}