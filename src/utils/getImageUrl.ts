
import defaultFallbackImg from '@/assets/whey-protein.jpg'

const IMAGE_BASE_URL = 'https://fe1111.projects.academy.onlyjs.com'

export const getImageUrl = (
    photoSrc: string | undefined | null,
    fallback: string = defaultFallbackImg
): string => {
    if (!photoSrc) return fallback

    if (
        photoSrc.startsWith('http://') ||
        photoSrc.startsWith('https://') ||
        photoSrc.startsWith('data:') ||
        photoSrc.startsWith('blob:') ||
        photoSrc.startsWith('/') ||
        photoSrc.startsWith('@/')
    ) {
        return photoSrc
    }
    return `${IMAGE_BASE_URL}${photoSrc.startsWith('/') ? '' : '/'}${photoSrc}`
}

