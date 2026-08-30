import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as api from '../api/supabaseApi';
import { useLanguage } from '../i18n/LanguageContext';
import { getProductImages } from '../utils/productImages';

const ProductModal = ({ product, onClose, onAddToCart, onToggleFavourite, isFavourite }) => {
    const { t, language } = useLanguage();
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('details');
    const [failedImageUrls, setFailedImageUrls] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        userName: '',
        userEmail: '',
        rating: 5,
        comment: ''
    });

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const loadReviews = useCallback(async () => {
        if (!product) return;

        try {
            setLoadingReviews(true);
            const reviewsData = await api.getProductReviews(product.id);
            setReviews(reviewsData);

            if (reviewsData.length > 0) {
                const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
                setAverageRating(total / reviewsData.length);
            } else {
                setAverageRating(0);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    }, [product]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    if (!product) return null;

    const productName = product[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.name;
    const productDescription = product[`description${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.description;
    const images = getProductImages(product).filter((image) => !failedImageUrls.includes(image.url));
    const safeImageIndex = images.length > 0 ? activeImage % images.length : 0;
    const currentImage = images[safeImageIndex];

    const handleImageError = (url) => {
        setFailedImageUrls((prev) => prev.includes(url) ? prev : [...prev, url]);
    };

    const handleSubmitReview = async (event) => {
        event.preventDefault();

        if (!reviewForm.userName.trim() || !reviewForm.comment.trim()) {
            toast.error(t.common.error);
            return;
        }

        try {
            setSubmitting(true);
            await api.addReview({
                productId: product.id,
                userName: reviewForm.userName,
                userEmail: reviewForm.userEmail,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });

            setReviewForm({
                userName: '',
                userEmail: '',
                rating: 5,
                comment: ''
            });
            setShowReviewForm(false);
            await loadReviews();
            toast.success(t.contact.messageSent);
        } catch (error) {
            console.error('Error adding review:', error);
            toast.error(`${t.common.error}: ${error.message || 'Tizim xatosi'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, interactive = false, onRatingChange = null) => (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                    <button
                        key={value}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onRatingChange?.(value)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} rounded transition`}
                        aria-label={`${value} ${t.productModal.rating}`}
                    >
                        <svg
                            className={`h-4 w-4 ${value <= rating ? 'fill-current text-amber-400' : 'fill-current text-gray-300'}`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/75 p-2 sm:p-4 md:p-6 backdrop-blur-md transition-opacity duration-300"
            onClick={onClose}
        >
            <article
                className="relative flex flex-col w-[96vw] sm:w-[92vw] md:w-[90vw] max-w-6xl max-h-[92dvh] md:max-h-[88dvh] overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(15,23,42,0.4)] ring-1 ring-gray-900/10 transition-all duration-300"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <header className="flex-shrink-0 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3.5 sm:px-6 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-black text-white shadow-md shadow-red-900/20">
                            999
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-primary">999 Premium Tools</p>
                            <h2 className="truncate text-sm sm:text-base font-black text-gray-900">{productName}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition hover:bg-primary hover:text-white"
                        aria-label={t.productModal.close}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto scrollbar-soft bg-gradient-to-b from-gray-50/70 via-white to-gray-50/40 p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                        {/* Left Column: Image Gallery */}
                        <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-3">
                            <div className="relative flex h-60 sm:h-72 md:h-[340px] lg:h-[380px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[radial-gradient(circle_at_25%_0%,rgba(220,38,38,0.08),transparent_40%),linear-gradient(135deg,#ffffff,#f1f5f9)] shadow-sm">
                                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

                                {/* Badges */}
                                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                                    {product.featured && (
                                        <span className="rounded-md bg-amber-400 px-2.5 py-1 text-xs font-black text-gray-950 shadow-sm">
                                            {t.catalog.recommended}
                                        </span>
                                    )}
                                    {product.bestSeller && (
                                        <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-black text-white shadow-sm">
                                            {t.home.bestSellers}
                                        </span>
                                    )}
                                </div>

                                {currentImage ? (
                                    <img
                                        src={currentImage.url}
                                        alt={productName}
                                        className="h-full w-full object-contain p-3 sm:p-5 drop-shadow-[0_12px_24px_rgba(15,23,42,0.15)] transition-transform duration-300 hover:scale-105"
                                        onError={() => handleImageError(currentImage.url)}
                                    />
                                ) : (
                                    <div className="px-8 text-center text-gray-400">
                                        <svg className="mx-auto mb-3 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-black">{t.admin.image} {t.common.no}</p>
                                    </div>
                                )}

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage((current) => current === 0 ? images.length - 1 : current - 1)}
                                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md ring-1 ring-gray-200 backdrop-blur transition hover:bg-primary hover:text-white"
                                            aria-label="Previous image"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveImage((current) => current === images.length - 1 ? 0 : current + 1)}
                                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md ring-1 ring-gray-200 backdrop-blur transition hover:bg-primary hover:text-white"
                                            aria-label="Next image"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-soft">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.url}
                                            onClick={() => setActiveImage(index)}
                                            className={`h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-white shadow-sm transition ${index === safeImageIndex
                                                ? 'border-primary ring-2 ring-red-400'
                                                : 'border-gray-200 opacity-70 hover:opacity-100'
                                                }`}
                                            aria-label={`Image ${index + 1}`}
                                        >
                                            <img
                                                src={image.url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                onError={() => handleImageError(image.url)}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Title, Quick Stats, Tabs (Description/Reviews), Actions */}
                        <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between space-y-4 min-w-0">
                            <div>
                                {/* Title */}
                                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black leading-snug text-gray-950 break-words">
                                    {productName}
                                </h1>

                                {/* Rating */}
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {renderStars(Math.round(averageRating))}
                                    <span className="text-sm font-black text-gray-900">
                                        {averageRating > 0 ? averageRating.toFixed(1) : t.common.noResults}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-500">
                                        ({reviews.length} {t.productModal.reviews.toLowerCase()})
                                    </span>
                                </div>

                                {/* Quick Info Grid */}
                                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.admin.stock}</p>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className={`h-2 w-2 rounded-full ${product.inStock !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <p className={`text-xs font-black ${product.inStock !== false ? 'text-emerald-700' : 'text-primary'}`}>
                                                {product.inStock !== false ? t.product.inStock : t.product.outOfStock}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Brend</p>
                                        <p className="mt-1 text-xs font-black text-gray-900 truncate">{product.brand || '999 Premium Tools'}</p>
                                    </div>

                                    {product.unit && (
                                        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm col-span-2 sm:col-span-1">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Birlik</p>
                                            <p className="mt-1 text-xs font-black text-gray-900">{product.unit}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tab Controls */}
                                <div className="mt-4 rounded-xl bg-gray-100/80 p-1">
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('details')}
                                            className={`rounded-lg py-2 px-3 text-xs sm:text-sm font-black transition ${activeTab === 'details' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-950'}`}
                                        >
                                            {t.productModal.description}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('reviews')}
                                            className={`rounded-lg py-2 px-3 text-xs sm:text-sm font-black transition ${activeTab === 'reviews' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-950'}`}
                                        >
                                            {t.productModal.reviews} ({reviews.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content Panel */}
                                <div className="mt-3">
                                    {activeTab === 'details' ? (
                                        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm min-h-[120px] max-h-[220px] overflow-y-auto scrollbar-soft">
                                            <h3 className="mb-1.5 text-xs font-black uppercase tracking-wider text-gray-400">{t.productModal.description}</h3>
                                            {productDescription ? (
                                                <p className="text-xs sm:text-sm leading-relaxed text-gray-700 whitespace-pre-line break-words">
                                                    {productDescription}
                                                </p>
                                            ) : (
                                                <p className="text-xs font-semibold text-gray-400">{t.common.noResults}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm min-h-[120px]">
                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                    {t.productModal.reviews} ({reviews.length})
                                                </h3>
                                                <button
                                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white shadow-md shadow-red-900/20 transition hover:bg-red-700"
                                                >
                                                    {showReviewForm ? t.productModal.cancel : t.productModal.writeReview}
                                                </button>
                                            </div>

                                            {showReviewForm && (
                                                <form onSubmit={handleSubmitReview} className="mb-4 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        <input
                                                            type="text"
                                                            value={reviewForm.userName}
                                                            onChange={(event) => setReviewForm({ ...reviewForm, userName: event.target.value })}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                                                            placeholder={t.productModal.yourName}
                                                            required
                                                        />
                                                        <input
                                                            type="email"
                                                            value={reviewForm.userEmail}
                                                            onChange={(event) => setReviewForm({ ...reviewForm, userEmail: event.target.value })}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                                                            placeholder={t.productModal.yourEmail}
                                                        />
                                                    </div>
                                                    <div className="mt-2">
                                                        {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
                                                    </div>
                                                    <textarea
                                                        value={reviewForm.comment}
                                                        onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                                                        rows="2"
                                                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                                                        placeholder={t.productModal.yourReview}
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="mt-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        {submitting ? t.common.loading : t.productModal.submit}
                                                    </button>
                                                </form>
                                            )}

                                            {loadingReviews ? (
                                                <div className="py-6 text-center">
                                                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-red-100 border-b-primary" />
                                                </div>
                                            ) : reviews.length === 0 ? (
                                                <div className="rounded-lg bg-gray-50 p-4 text-center">
                                                    <p className="text-xs font-black text-gray-700">{t.productModal.noReviews}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500">{t.productModal.beFirst}</p>
                                                </div>
                                            ) : (
                                                <div className="max-h-[160px] space-y-2.5 overflow-y-auto pr-1 scrollbar-soft">
                                                    {reviews.map((review) => (
                                                        <div key={review.id} className="rounded-lg bg-gray-50 p-2.5 ring-1 ring-gray-100">
                                                            <div className="mb-1 flex items-start justify-between gap-2">
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-900">{review.user_name}</p>
                                                                    <p className="text-[10px] font-semibold text-gray-400">{formatDate(review.created_at)}</p>
                                                                </div>
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            <p className="text-xs text-gray-700 leading-relaxed break-words">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2.5">
                                <button
                                    onClick={() => onAddToCart?.(product.id)}
                                    disabled={product.inStock === false}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                                >
                                    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h9.5l3-7H5.4M7 13L5.4 5M7 13l-1.2 1.2C5.2 14.8 5.6 16 6.5 16H17m-9 4a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                    <span>Savatchaga qo'shish</span>
                                </button>

                                <button
                                    onClick={() => onToggleFavourite(product.id)}
                                    className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition active:scale-[0.98] ${isFavourite
                                        ? 'border-primary bg-primary text-white shadow-md shadow-red-900/20'
                                        : 'border-gray-200 bg-white text-gray-800 hover:border-primary hover:bg-red-50 hover:text-primary'
                                        }`}
                                >
                                    <svg className="h-5 w-5 flex-shrink-0" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="hidden sm:inline">{isFavourite ? t.product.inFavorites : t.product.addToFavorites}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ProductModal;
