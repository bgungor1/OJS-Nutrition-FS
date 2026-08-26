import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
    onSearch?: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    return (
        <div className="relative flex items-center gap-2 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-4 mt-4 lg:mt-0">
            <Input
                placeholder="Aradığınız ürünü yazınız"
                className="rounded-none pr-12 h-10 sm:h-11 text-sm sm:text-base"
            />
            <Button
                variant="secondary"
                className="rounded-none absolute right-0 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
                onClick={() => onSearch?.('')}
            >
                ARA
            </Button>
        </div>
    )
}
