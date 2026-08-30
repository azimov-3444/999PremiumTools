import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
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

    // Prevent body scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

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
        <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                    <button
                        key={value}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onRatingChange?.(value)}
                        className={`${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} rounded transition-transform`}
                        aria-label={`${value} ${t.productModal.rating}`}
                    >
                        <svg
                            className={`h-5 w-5 ${value <= rating ? 'fill-current text-amber-400' : 'fill-current text-gray-300'}`}
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

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-950/85 p-2 sm:p-4 backdrop-blur-md transition-all duration-300"
            onClick={onClose}
        >
            <article
                className="relative flex flex-col w-full h-full sm:w-[96vw] sm:h-[94vh] md:w-[94vw] md:h-[92vh] max-w-[1500px] overflow-hidden rounded-none sm:rounded-3xl bg-white shadow-[0_35px_100px_rgba(15,23,42,0.5)] ring-1 ring-gray-900/10"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <header className="flex-shrink-0 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-4 sm:px-8 backdrop-blur-xl z-20 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-lg shadow-red-900/25">
                            999
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-wider text-primary">999 Premium Tools</p>
                            <h2 className="truncate text-base font-black text-gray-950 sm:text-xl">{productName}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 transition hover:bg-primary hover:text-white hover:scale-105 active:scale-95"
                        aria-label={t.productModal.close}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Main Body - Full Height 2 Column Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-soft bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 lg:gap-12 items-stretch min-h-full">
                        
                        {/* Left Column: Big Product Image Stage */}
                        <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-between space-y-4">
                            <div className="relative flex-1 flex min-h-[300px] sm:min-h-[400px] md:min-h-[460px] lg:min-h-[520px] w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-[radial-gradient(circle_at_30%_10%,rgba(220,38,38,0.08),transparent_50%),linear-gradient(135deg,#ffffff,#f1f5f9)] shadow-inner">
                                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />

                                {/* Badges */}
                                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                                    {product.featured && (
                                        <span className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs sm:text-sm font-black text-gray-950 shadow-md">
                                            {t.catalog.recommended}
                                        </span>
                                    )}
                                    {product.bestSeller && (
                                        <span className="rounded-xl bg-primary px-3 py-1.5 text-xs sm:text-sm font-black text-white shadow-md">
                                            {t.home.bestSellers}
                                        </span>
                                    )}
                                </div>

                                {currentImage ? (
                                    <img
                                        src={currentImage.url}
                                        alt={productName}
                                        className="h-full w-full max-h-[500px] lg:max-h-[560px] object-contain p-4 sm:p-8 md:p-10 drop-shadow-[0_20px_35px_rgba(15,23,42,0.18)] transition-transform duration-500 hover:scale-105"
                                        onError={() => handleImageError(currentImage.url)}
                                    />
                                ) : (
                                    <div className="px-8 text-center text-gray-400">
                                        <svg className="mx-auto mb-4 h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-base font-black">{t.admin.image} {t.common.no}</p>
                                    </div>
                                )}

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage((current) => current === 0 ? images.length - 1 : current - 1)}
                                            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-xl ring-1 ring-gray-200 backdrop-blur transition hover:bg-primary hover:text-white hover:scale-110 active:scale-95"
                                            aria-label="Previous image"
                                        >
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveImage((current) => current === images.length - 1 ? 0 : current + 1)}
                                            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-xl ring-1 ring-gray-200 backdrop-blur transition hover:bg-primary hover:text-white hover:scale-110 active:scale-95"
                                            aria-label="Next image"
                                        >
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Mini Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-soft">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.url}
                                            onClick={() => setActiveImage(index)}
                                            className={`h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition ${index === safeImageIndex
                                                ? 'border-primary ring-4 ring-red-100 scale-105'
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

                        {/* Right Column: Title, Information Cards, Tabs, Big Action Buttons */}
                        <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-between space-y-6 min-w-0">
                            <div className="space-y-5">
                                {/* Title */}
                                <div>
                                    <span className="inline-block rounded-lg bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
                                        999 Premium Tools
                                    </span>
                                    <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-gray-950 break-words">
                                        {productName}
                                    </h1>
                                </div>

                                {/* Rating */}
                                <div className="flex flex-wrap items-center gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                                    {renderStars(Math.round(averageRating))}
                                    <span className="text-base font-black text-gray-950">
                                        {averageRating > 0 ? averageRating.toFixed(1) : t.common.noResults}
                                    </span>
                                    <span className="text-xs font-bold text-gray-500">
                                        ({reviews.length} {t.productModal.reviews.toLowerCase()})
                                    </span>
                                </div>

                                {/* Quick Info Cards Grid */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                        <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t.admin.stock}</p>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${product.inStock !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            <p className={`text-sm font-black ${product.inStock !== false ? 'text-emerald-700' : 'text-primary'}`}>
                                                {product.inStock !== false ? t.product.inStock : t.product.outOfStock}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                        <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Brend</p>
                                        <p className="mt-1.5 text-sm font-black text-gray-950 truncate">{product.brand || '999 Premium Tools'}</p>
                                    </div>

                                    {product.unit && (
                                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
                                            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Birlik</p>
                                            <p className="mt-1.5 text-sm font-black text-gray-950">{product.unit}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tab Controls */}
                                <div className="rounded-2xl bg-gray-100/90 p-1.5">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('details')}
                                            className={`rounded-xl py-3 px-4 text-xs sm:text-sm font-black transition-all ${activeTab === 'details' ? 'bg-white text-gray-950 shadow-md' : 'text-gray-600 hover:text-gray-950'}`}
                                        >
                                            {t.productModal.description}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('reviews')}
                                            className={`rounded-xl py-3 px-4 text-xs sm:text-sm font-black transition-all ${activeTab === 'reviews' ? 'bg-white text-gray-950 shadow-md' : 'text-gray-600 hover:text-gray-950'}`}
                                        >
                                            {t.productModal.reviews} ({reviews.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content Panel */}
                                <div>
                                    {activeTab === 'details' ? (
                                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm min-h-[160px] max-h-[260px] overflow-y-auto scrollbar-soft">
                                            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">{t.productModal.description}</h3>
                                            {productDescription ? (
                                                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line break-words sm:text-base">
                                                    {productDescription}
                                                </p>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-400">{t.common.noResults}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm min-h-[160px]">
                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                    {t.productModal.reviews} ({reviews.length})
                                                </h3>
                                                <button
                                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                                    className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-white shadow-md shadow-red-900/20 transition hover:bg-red-700"
                                                >
                                                    {showReviewForm ? t.productModal.cancel : t.productModal.writeReview}
                                                </button>
                                            </div>

                                            {showReviewForm && (
                                                <form onSubmit={handleSubmitReview} className="mb-4 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <input
                                                            type="text"
                                                            value={reviewForm.userName}
                                                            onChange={(event) => setReviewForm({ ...reviewForm, userName: event.target.value })}
                                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                                                            placeholder={t.productModal.yourName}
                                                            required
                                                        />
                                                        <input
                                                            type="email"
                                                            value={reviewForm.userEmail}
                                                            onChange={(event) => setReviewForm({ ...reviewForm, userEmail: event.target.value })}
                                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                                                            placeholder={t.productModal.yourEmail}
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
                                                    </div>
                                                    <textarea
                                                        value={reviewForm.comment}
                                                        onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                                                        rows="3"
                                                        className="mt-3 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                                                        placeholder={t.productModal.yourReview}
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        {submitting ? t.common.loading : t.productModal.submit}
                                                    </button>
                                                </form>
                                            )}

                                            {loadingReviews ? (
                                                <div className="py-8 text-center">
                                                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-red-100 border-b-primary" />
                                                </div>
                                            ) : reviews.length === 0 ? (
                                                <div className="rounded-xl bg-gray-50 p-5 text-center">
                                                    <p className="text-sm font-black text-gray-700">{t.productModal.noReviews}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{t.productModal.beFirst}</p>
                                                </div>
                                            ) : (
                                                <div className="max-h-[180px] space-y-3 overflow-y-auto pr-1 scrollbar-soft">
                                                    {reviews.map((review) => (
                                                        <div key={review.id} className="rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
                                                            <div className="mb-1.5 flex items-start justify-between gap-2">
                                                                <div>
                                                                    <p className="text-xs font-black text-gray-950">{review.user_name}</p>
                                                                    <p className="text-[10px] font-semibold text-gray-400">{formatDate(review.created_at)}</p>
                                                                </div>
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Big Action Buttons */}
                            <div className="pt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                                <button
                                    onClick={() => onAddToCart?.(product.id)}
                                    disabled={product.inStock === false}
                                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 text-base font-black text-white shadow-xl shadow-red-900/25 transition-all hover:bg-red-700 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                                >
                                    <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h9.5l3-7H5.4M7 13L5.4 5M7 13l-1.2 1.2C5.2 14.8 5.6 16 6.5 16H17m-9 4a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                    <span>Savatchaga qo'shish</span>
                                </button>

                                <button
                                    onClick={() => onToggleFavourite(product.id)}
                                    className={`flex h-14 items-center justify-center gap-2.5 rounded-2xl border-2 px-6 text-base font-black transition-all active:scale-[0.98] ${isFavourite
                                        ? 'border-primary bg-primary text-white shadow-lg shadow-red-900/20'
                                        : 'border-gray-200 bg-white text-gray-800 hover:border-primary hover:bg-red-50 hover:text-primary'
                                        }`}
                                >
                                    <svg className="h-6 w-6 flex-shrink-0" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="hidden sm:inline">{isFavourite ? t.product.inFavorites : t.product.addToFavorites}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>,
        document.body
    );
};

export default ProductModal;
