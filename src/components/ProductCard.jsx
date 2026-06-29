import React, { useState } from 'react';
import ProductModal from './ProductModal';
import { useLanguage } from '../i18n/LanguageContext';
import { getProductImages } from '../utils/productImages';

const ProductCard = ({ product, onAddToCart, onToggleFavourite, isFavourite }) => {
    const [showModal, setShowModal] = useState(false);
    const { t, language } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [failedImageUrls, setFailedImageUrls] = useState([]);

    const images = getProductImages(product);
    const visibleImages = images.filter((image) => !failedImageUrls.includes(image.url));
    const safeImageIndex = visibleImages.length > 0 ? currentImageIndex % visibleImages.length : 0;
    const currentImage = visibleImages[safeImageIndex];

    const handleImageError = (url) => {
        setFailedImageUrls((prev) => prev.includes(url) ? prev : [...prev, url]);
    };

    // Rating yulduzchalarini ko'rsatish
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id={`half-${product.id}`}>
                                <stop offset="50%" stopColor="currentColor" />
                                <stop offset="50%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        <path fill={`url(#half-${product.id})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                        <path fill="currentColor" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                );
            }
        }
        return stars;
    };

    return (
        <>
            <div className="premium-card group flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
                {/* Badges */}
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
                    {product.featured && (
                        <div className="rounded-md bg-amber-400 px-2.5 py-1 text-xs font-black text-gray-900 shadow-lg shadow-amber-900/15">
                            {t.catalog.recommended}
                        </div>
                    )}
                    {product.bestSeller && (
                        <div className="rounded-md bg-primary px-2.5 py-1 text-xs font-black text-white shadow-lg shadow-red-900/20">
                            {t.home.bestSellers.replace('🔥 ', '')}
                        </div>
                    )}
                </div>

                {/* Product Image Slider */}
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 via-white to-gray-200 sm:h-52">
                    {visibleImages.length > 0 ? (
                        <>
                            <img
                                src={currentImage?.url}
                                alt={product.name}
                                className="h-full w-full cursor-pointer object-cover transition duration-500 group-hover:scale-[1.08]"
                                onClick={() => setShowModal(true)}
                                onError={() => handleImageError(currentImage?.url)}
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/28 via-transparent to-white/10 opacity-70 transition group-hover:opacity-45" />

                            {/* Image Navigation */}
                            {visibleImages.length > 1 && (
                                <>
                                    {/* Previous Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex((prev) =>
                                                prev === 0 ? visibleImages.length - 1 : prev - 1
                                            );
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-900 opacity-0 shadow-lg backdrop-blur transition hover:bg-primary hover:text-white group-hover:opacity-100"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex((prev) =>
                                                prev === visibleImages.length - 1 ? 0 : prev + 1
                                            );
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-900 opacity-0 shadow-lg backdrop-blur transition hover:bg-primary hover:text-white group-hover:opacity-100"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                                        {visibleImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(index);
                                                }}
                                                className={`h-1.5 rounded-full transition-all ${index === safeImageIndex
                                                    ? 'w-4 bg-white'
                                                    : 'w-1.5 bg-white/60'
                                                    }`}
                                                aria-label={`Image ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="cursor-pointer text-center text-gray-400 transition hover:text-primary" onClick={() => setShowModal(true)}>
                            <svg className="w-20 h-20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">{t.admin.image} {t.common.no}</p>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="relative z-10 flex flex-1 flex-col p-2.5 sm:p-4">
                    {/* Title - Clickable */}
                    <h3
                        className="mb-2 line-clamp-2 min-h-[40px] cursor-pointer text-[13px] font-black leading-snug text-gray-900 transition hover:text-primary sm:min-h-[56px] sm:text-lg"
                        onClick={() => setShowModal(true)}
                    >
                        {product[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.name}
                    </h3>

                    {/* Rating - Only show if has reviews */}
                    {product.reviewCount > 0 && (
                        <div className="mb-2 flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                                {renderStars(product.rating)}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                                {product.rating.toFixed(1)}
                            </span>
                        </div>
                    )}

                    {/* Brand */}
                    {product.brand && (
                        <p className="mb-2 text-xs text-gray-500 sm:text-sm">
                            <span className="font-medium">Brend:</span> {product.brand}
                        </p>
                    )}

                    {/* Stock Status */}
                    {!product.inStock && (
                        <p className="mb-2 text-xs font-semibold text-red-500 sm:text-sm">
                            ❌ {t.product.outOfStock}
                        </p>
                    )}

                    {/* Description - if available */}
                    {product.description && (
                        <p className="mb-3 line-clamp-2 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                            {product[`description${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.description}
                        </p>
                    )}

                    <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
                        <button
                            onClick={() => onAddToCart?.(product.id)}
                            disabled={product.inStock === false}
                            className="flex min-h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-2 py-2 text-xs font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm"
                        >
                            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h9.5l3-7H5.4M7 13L5.4 5M7 13l-1.2 1.2C5.2 14.8 5.6 16 6.5 16H17m-9 4a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                            </svg>
                            <span className="truncate">Savatchaga</span>
                        </button>

                        <button
                            onClick={() => onToggleFavourite(product.id)}
                            className={`flex min-h-9 w-10 items-center justify-center rounded-lg border transition sm:min-h-10 sm:w-11 ${isFavourite
                                ? 'border-primary bg-primary text-white shadow-lg shadow-red-900/20'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-red-50 hover:text-primary'
                                }`}
                            aria-label={isFavourite ? t.product.inFavorites : t.product.addToFavorites}
                        >
                            <svg className="h-5 w-5 flex-shrink-0" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {showModal && (
                <ProductModal
                    product={product}
                    onClose={() => setShowModal(false)}
                    onAddToCart={onAddToCart}
                    onToggleFavourite={onToggleFavourite}
                    isFavourite={isFavourite}
                />
            )}
        </>
    );
};

export default ProductCard;
