import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"

interface UserMenuProps {
    isAuthenticated: boolean
    userName?: string
    onLogout: () => void
}

export default function UserMenu({
    isAuthenticated,
    userName,
    onLogout
}: UserMenuProps) {
    const navigate = useNavigate()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-none">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                        {isAuthenticated && userName ? `Merhaba, ${userName}` : 'HESAP'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {isAuthenticated ? (
                    <>
                        <DropdownMenuItem onClick={() => navigate('/account')}>
                            Hesap Bilgilerim
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/account/order')}>
                            Siparişlerim
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onLogout()
                                navigate('/')
                            }}
                            className="text-red-600 dark:text-red-400"
                        >
                            Çıkış Yap
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem onClick={() => navigate('/login')}>
                            Giriş Yap
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/login')}>
                            Üye Ol
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}