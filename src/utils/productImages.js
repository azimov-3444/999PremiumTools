const INVALID_IMAGE_VALUES = new Set(['', 'null', 'undefined', 'none']);

const isValidImageUrl = (url) => {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (INVALID_IMAGE_VALUES.has(trimmed.toLowerCase())) return false;

    return (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:image/') ||
        trimmed.startsWith('/')
    );
};

const normalizeImage = (image, isPrimary = false) => {
    const url = typeof image === 'string' ? image : image?.url;
    if (!isValidImageUrl(url)) return null;

    return {
        url: url.trim(),
        is_primary: Boolean(image?.is_primary ?? image?.isPrimary ?? isPrimary)
    };
};

export const getProductImages = (product) => {
    if (!product) return [];

    const images = [];

    if (Array.isArray(product.images)) {
        for (const image of product.images) {
            const normalized = normalizeImage(image);
            if (normalized) images.push(normalized);
        }
    }

    const fallbackImage = normalizeImage(product.image, images.length === 0);
    if (fallbackImage && !images.some((image) => image.url === fallbackImage.url)) {
        images.push(fallbackImage);
    }

    return images.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
};
