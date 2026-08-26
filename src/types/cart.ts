
export interface CartItem {
    id: string
    product_id: number
    product_variant_id: string
    pieces: number

    product?: {
        id: number
        name: string
        slug: string
        photo?: string
    }

    variant?: {
        id: string
        name: string
        price: number
        aroma?: string
        size?: string
    }
}

export interface AddToCartRequest {
    product_id: string
    product_variant_id: string
    pieces: number
}


export interface RemoveFromCartRequest {
    product_id: number
    product_variant_id: string
    pieces: number
}


export interface CartResponse {
    status: string
    data: CartItem[]
}
