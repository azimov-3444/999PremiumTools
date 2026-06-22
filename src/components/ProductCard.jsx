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
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative flex flex-col h-full">
                {/* Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.discount > 0 && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            -{product.discount}%
                        </div>
                    )}
                    {product.featured && (
                        <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                            {t.catalog.recommended}
                        </div>
                    )}
                    {product.bestSeller && (
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {t.home.bestSellers.replace('🔥 ', '')}
                        </div>
                    )}
                </div>

                {/* Product Image Slider */}
                <div className="bg-gray-100 h-48 flex items-center justify-center relative overflow-hidden group">
                    {visibleImages.length > 0 ? (
                        <>
                            <img
                                src={currentImage?.url}
                                alt={product.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setShowModal(true)}
                                onError={() => handleImageError(currentImage?.url)}
                            />

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
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                        {visibleImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(index);
                                                }}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === safeImageIndex
                                                    ? 'bg-white w-3'
                                                    : 'bg-white/50'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-400 text-center cursor-pointer" onClick={() => setShowModal(true)}>
                            <svg className="w-20 h-20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">{t.admin.image} {t.common.no}</p>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Title - Clickable */}
                    <h3
                        className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 min-h-[56px] cursor-pointer hover:text-primary transition"
                        onClick={() => setShowModal(true)}
                    >
                        {product[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.name}
                    </h3>

                    {/* Rating - Only show if has reviews */}
                    {product.reviewCount > 0 && (
                        <div className="flex items-center gap-2 mb-2">
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
                        <p className="text-sm text-gray-500 mb-2">
                            <span className="font-medium">Brend:</span> {product.brand}
                        </p>
                    )}

                    {/* Stock Status */}
                    {!product.inStock && (
                        <p className="text-sm text-red-500 font-semibold mb-2">
                            ❌ {t.product.outOfStock}
                        </p>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                        {product.discount > 0 ? (
                            <div>
                                <p className="text-2xl font-bold text-green-600 mb-0.5">
                                    {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} {t.product.som}
                                </p>
                                <p className="text-sm text-gray-500 line-through">
                                    {product.price.toLocaleString()} {t.product.som}
                                </p>
                            </div>
                        ) : (
                            <p className="text-2xl font-bold text-primary">
                                {product.price.toLocaleString()} {t.product.som}
                            </p>
                        )}
                    </div>

                    {/* Description - if available */}
                    {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product[`description${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.description}
                        </p>
                    )}

                    {/* Favorite Button - Always at bottom */}
                    <button
                        onClick={() => onToggleFavourite(product.id)}
                        className={`w-full py-2 px-4 rounded-lg border-2 transition flex items-center justify-center gap-2 font-medium whitespace-nowrap mt-auto ${isFavourite
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="truncate">{isFavourite ? t.product.inFavorites : t.product.addToFavorites}</span>
                    </button>
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
