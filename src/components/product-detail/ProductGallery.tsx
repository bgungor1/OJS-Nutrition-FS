
interface ProductGalleryProps {
    image: string
    name: string
}

export default function ProductGallery({ image, name }: ProductGalleryProps) {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-auto object-contain"
                />
            </div>
        </div>
    )
}