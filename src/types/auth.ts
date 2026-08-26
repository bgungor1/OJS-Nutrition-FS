
export interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    phone_number?: string | null
}


export interface LoginRequest {
    username: string
    password: string
    api_key: string
}


export interface RegisterRequest {
    email: string
    password: string
    password2: string
    api_key: string
    first_name: string
    last_name: string
}

export interface LoginSuccessResponse {
    status: "success"
    data: {
        access: string
        refresh: string
    }
}

export interface RegisterSuccessResponse {
    status: "success"
    data: {
        user: User
        message?: string
    }
}


export interface AuthErrorResponse {
    status: "error"
    reason: {
        [key: string]: string[]
    }
}


export type AuthResponse =
    | LoginSuccessResponse
    | RegisterSuccessResponse
    | AuthErrorResponse


export interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}
