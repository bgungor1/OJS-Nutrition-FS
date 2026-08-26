export interface Address {
    id: string
    title: string
    first_name: string
    last_name: string
    country: { id: number; name: string }
    region: { id: number; name: string }
    subregion: { id: number; name: string }
    full_address: string
    phone_number: string
}

export interface CreateAddressRequest {
    title: string
    first_name: string
    last_name: string
    country_id: number
    region_id: number
    subregion_id: number
    full_address: string
    phone_number: string
}

export interface UpdateAddressRequest {
    title: string
    first_name: string
    last_name: string
    country_id: number
    region_id: number
    subregion_id: number
    full_address: string
    phone_number: string
}

export interface AddressListResponse {
    count?: number
    results?: Address[]
}

export interface AddressApiResponse {
    status: string
    data: Address
}
