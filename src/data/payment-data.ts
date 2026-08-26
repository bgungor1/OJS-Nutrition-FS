// Payment sayfası için dummy data

export interface CartItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  flavor?: string
  size?: string
  variant?: string
}

export interface SavedAddress {
  id: string
  fullName: string
  address: string
  city: string
  district: string
  postalCode: string
  phone: string
  isDefault: boolean
}

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  days: string
}

export interface PaymentMethod {
  id: string
  type: string
  name: string
  description: string
  icon: string
}

// Sepet ürünleri
export const cartItems: CartItem[] = [
  {
    id: "1",
    name: "WHEY PROTEIN - ÇİKOLATA",
    image: "/src/assets/whey-protein.jpg",
    price: 399.99,
    quantity: 2,
    variant: "2.5kg"
  },
  {
    id: "2",
    name: "CREATINE MONOHYDRATE",
    image: "/src/assets/creatine.png",
    price: 199.99,
    quantity: 1,
    variant: "500g"
  },
  {
    id: "3",
    name: "DEEP SLEEP",
    image: "/src/assets/order/1071d4920ccb378e947ad27c8fb333b1c39f9ba4.jpg",
    price: 299.99,
    quantity: 1,
    variant: "60 Kapsül"
  },
  {
    id: "4",
    name: "MELATONIN - GÜNLÜK VİTAMİN PAKETİ",
    image: "/src/assets/order/4e89226adabe52f9accd071d9601b34b1f6378c9.jpg",
    price: 189.99,
    quantity: 3,
    variant: "30 Günlük Paket"
  }
]

// Kayıtlı adresler
export const savedAddresses: SavedAddress[] = [
  {
    id: "1",
    fullName: "Ahmet Yılmaz",
    address: "Atatürk Mahallesi, Cumhuriyet Caddesi No: 45 Daire: 8",
    city: "İstanbul",
    district: "Kadıköy",
    postalCode: "34710",
    phone: "0555 123 45 67",
    isDefault: true
  },
  {
    id: "2",
    fullName: "Ahmet Yılmaz",
    address: "Merkez Mahallesi, İstiklal Caddesi No: 123 Daire: 4",
    city: "Ankara",
    district: "Çankaya",
    postalCode: "06100",
    phone: "0555 987 65 43",
    isDefault: false
  },
  {
    id: "3",
    fullName: "Mehmet Demir",
    address: "Güneş Mahallesi, Barış Caddesi No: 78 Daire: 12",
    city: "İzmir",
    district: "Konak",
    postalCode: "35250",
    phone: "0555 456 78 90",
    isDefault: false
  }
]

// Kargo seçenekleri
export const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standart Kargo",
    description: "3-5 iş günü",
    price: 15,
    days: "3-5 iş günü"
  },
  {
    id: "express",
    name: "Hızlı Kargo",
    description: "1-2 iş günü",
    price: 25,
    days: "1-2 iş günü"
  },
  {
    id: "overnight",
    name: "Ertesi Gün Teslimat",
    description: "Ertesi gün teslimat",
    price: 45,
    days: "Ertesi gün"
  }
]

// Ödeme yöntemleri
export const paymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    type: "credit_card",
    name: "Kredi Kartı",
    description: "**** **** **** 1234",
    icon: "CreditCard"
  },
  {
    id: "bank_transfer",
    type: "bank_transfer",
    name: "Banka Havalesi",
    description: "Hesap bilgileri e-posta ile gönderilecek",
    icon: "Bank"
  },
  {
    id: "cash_on_delivery",
    type: "cash_on_delivery",
    name: "Kapıda Ödeme",
    description: "Teslimat sırasında nakit ödeme",
    icon: "Cash"
  }
]

// Fiyat hesaplama fonksiyonları
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export const calculateTax = (subtotal: number, taxRate: number = 0.18): number => {
  return subtotal * taxRate
}

export const calculateTotal = (subtotal: number, shippingCost: number, tax: number): number => {
  return subtotal + shippingCost + tax
}
