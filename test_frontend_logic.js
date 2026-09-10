// Mocking getProductImages logic from src/utils/productImages.js

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

const getProductImages = (product) => {
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

// Test product mock
const product = {
  name: "VINSA TROS+SHLANKA 55.000",
  image: "https://hel1.your-objectstorage.com/ritm/tenant/premiumtools999/image/2025-07/97dd8cca-7df6-478a-a533-ab8e58930831.jpg.500x500_q85_crop-scale.jpg",
  images: [{"url":"https://hel1.your-objectstorage.com/ritm/tenant/premiumtools999/image/2025-07/97dd8cca-7df6-478a-a533-ab8e58930831.jpg.500x500_q85_crop-scale.jpg","is_primary":true}]
};

console.log("Normalized Images:", getProductImages(product));
