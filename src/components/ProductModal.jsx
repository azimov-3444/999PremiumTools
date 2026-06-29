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
            className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/60 p-0 backdrop-blur-sm sm:p-4"
            onClick={onClose}
        >
            <article
                className="relative h-[100dvh] w-full overflow-hidden bg-white shadow-[0_30px_90px_rgba(15,23,42,0.34)] sm:h-[94dvh] sm:max-w-5xl sm:rounded-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="absolute left-0 right-0 top-0 z-30 border-b border-gray-100 bg-white/96 px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-white shadow-lg shadow-red-900/20">
                            999
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-black uppercase tracking-wide text-primary">999 Premium Tools</p>
                            <p className="truncate text-sm font-black text-gray-950 sm:text-base">{productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition hover:bg-primary hover:text-white"
                            aria-label={t.productModal.close}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="h-full overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_46%,#f8fafc_100%)] px-3 pb-6 pt-20 sm:px-5">
                    <section className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-[radial-gradient(circle_at_25%_0%,rgba(220,38,38,0.12),transparent_34%),linear-gradient(135deg,#ffffff,#eef2f7)] shadow-[0_20px_55px_rgba(15,23,42,0.10)]">
                            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:34px_34px]" />

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

                            <div className="relative flex h-[52dvh] min-h-[360px] items-center justify-center sm:h-[62dvh] sm:min-h-[520px]">
                                {currentImage ? (
                                    <img
                                        src={currentImage.url}
                                        alt={productName}
                                        className="h-full w-full object-contain p-5 drop-shadow-[0_18px_28px_rgba(15,23,42,0.18)] sm:p-9"
                                        onError={() => handleImageError(currentImage.url)}
                                    />
                                ) : (
                                    <div className="px-8 text-center text-gray-400">
                                        <svg className="mx-auto mb-3 h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-black">{t.admin.image} {t.common.no}</p>
                                    </div>
                                )}

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage((current) => current === 0 ? images.length - 1 : current - 1)}
                                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-950 shadow-xl ring-1 ring-gray-200 transition hover:bg-primary hover:text-white"
                                            aria-label="Previous image"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveImage((current) => current === images.length - 1 ? 0 : current + 1)}
                                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-950 shadow-xl ring-1 ring-gray-200 transition hover:bg-primary hover:text-white"
                                            aria-label="Next image"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                {images.map((image, index) => (
                                    <button
                                        key={image.url}
                                        onClick={() => setActiveImage(index)}
                                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm transition sm:h-20 sm:w-20 ${index === safeImageIndex
                                            ? 'border-primary ring-4 ring-red-100'
                                            : 'border-gray-200 opacity-80 hover:opacity-100'
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

                        <div className="mt-4 space-y-3">
                            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                <h1 className="text-2xl font-black leading-tight text-gray-950 sm:text-3xl">
                                    {productName}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {renderStars(Math.round(averageRating))}
                                    <span className="text-sm font-black text-gray-800">
                                        {averageRating > 0 ? averageRating.toFixed(1) : t.common.noResults}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-500">
                                        ({reviews.length} {t.productModal.reviews.toLowerCase()})
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">{t.admin.stock}</p>
                                    <p className={`mt-1 text-sm font-black ${product.inStock ? 'text-emerald-600' : 'text-primary'}`}>
                                        {product.inStock ? t.product.inStock : t.product.outOfStock}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">Brend</p>
                                    <p className="mt-1 text-sm font-black text-gray-950">{product.brand || '999 Premium Tools'}</p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-100">
                                <div className="grid grid-cols-2 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                        className={`rounded-lg px-3 py-2 text-sm font-black transition ${activeTab === 'details' ? 'bg-primary text-white shadow-md shadow-red-900/20' : 'text-gray-600 hover:bg-red-50 hover:text-primary'}`}
                                    >
                                        {t.productModal.description}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('reviews')}
                                        className={`rounded-lg px-3 py-2 text-sm font-black transition ${activeTab === 'reviews' ? 'bg-primary text-white shadow-md shadow-red-900/20' : 'text-gray-600 hover:bg-red-50 hover:text-primary'}`}
                                    >
                                        {t.productModal.reviews}
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'details' ? (
                                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                    <h3 className="mb-2 text-base font-black text-gray-950">{t.productModal.description}</h3>
                                    {productDescription ? (
                                        <p className="text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
                                            {productDescription}
                                        </p>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-500">{t.common.noResults}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="text-base font-black text-gray-950">
                                            {t.productModal.reviews} ({reviews.length})
                                        </h3>
                                        <button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="rounded-lg bg-primary px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
                                        >
                                            {showReviewForm ? t.productModal.cancel : t.productModal.writeReview}
                                        </button>
                                    </div>

                                    {showReviewForm && (
                                        <form onSubmit={handleSubmitReview} className="mb-4 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-100">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <input
                                                    type="text"
                                                    value={reviewForm.userName}
                                                    onChange={(event) => setReviewForm({ ...reviewForm, userName: event.target.value })}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                                    placeholder={t.productModal.yourName}
                                                    required
                                                />
                                                <input
                                                    type="email"
                                                    value={reviewForm.userEmail}
                                                    onChange={(event) => setReviewForm({ ...reviewForm, userEmail: event.target.value })}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
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
                                                className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                                placeholder={t.productModal.yourReview}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="mt-3 rounded-lg bg-primary px-5 py-2 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {submitting ? t.common.loading : t.productModal.submit}
                                            </button>
                                        </form>
                                    )}

                                    {loadingReviews ? (
                                        <div className="py-8 text-center">
                                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-red-100 border-b-primary" />
                                        </div>
                                    ) : reviews.length === 0 ? (
                                        <div className="rounded-lg bg-gray-50 p-5 text-center">
                                            <p className="font-black text-gray-700">{t.productModal.noReviews}</p>
                                            <p className="mt-1 text-sm text-gray-500">{t.productModal.beFirst}</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-100">
                                                    <div className="mb-2 flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-black text-gray-950">{review.user_name}</p>
                                                            <p className="text-xs font-semibold text-gray-500">{formatDate(review.created_at)}</p>
                                                        </div>
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <p className="text-sm leading-6 text-gray-700">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <button
                                    onClick={() => onAddToCart?.(product.id)}
                                    disabled={product.inStock === false}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-xl shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h9.5l3-7H5.4M7 13L5.4 5M7 13l-1.2 1.2C5.2 14.8 5.6 16 6.5 16H17m-9 4a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                    Savatchaga qo'shish
                                </button>

                                <button
                                    onClick={() => onToggleFavourite(product.id)}
                                    className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-black transition ${isFavourite
                                        ? 'border-primary bg-primary text-white shadow-xl shadow-red-900/20'
                                        : 'border-gray-200 bg-white text-gray-800 hover:border-primary hover:bg-red-50 hover:text-primary'
                                        }`}
                                >
                                    <svg className="h-5 w-5" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {isFavourite ? t.product.inFavorites : t.product.addToFavorites}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </article>
        </div>
    );
};

export default ProductModal;
