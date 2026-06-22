import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api/supabaseApi';
import { useLanguage } from '../i18n/LanguageContext';
import { toast } from 'react-toastify';
import { getProductImages } from '../utils/productImages';

const ProductModal = ({ product, onClose, onToggleFavourite, isFavourite }) => {
    const { t, language } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [reviewForm, setReviewForm] = useState({
        userName: '',
        userEmail: '',
        rating: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [failedImageUrls, setFailedImageUrls] = useState([]);

    const loadReviews = useCallback(async () => {
        if (!product) return;
        try {
            setLoadingReviews(true);
            const reviewsData = await api.getProductReviews(product.id);
            setReviews(reviewsData);

            // Calculate average rating
            if (reviewsData.length > 0) {
                const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
                setAverageRating(sum / reviewsData.length);
            } else {
                setAverageRating(0);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    }, [product]);

    // Load reviews on mount
    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    if (!product) return null;

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.userName.trim() || !reviewForm.comment.trim()) {
            toast.error(t.common.error); // Simplified validation message
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

            // Reset form and reload reviews
            setReviewForm({
                userName: '',
                userEmail: '',
                rating: 5,
                comment: ''
            });
            setShowReviewForm(false);
            await loadReviews();
            toast.success(t.contact.messageSent); // Reusing message sent success
        } catch (error) {
            console.error('Error adding review:', error);
            toast.error(`${t.common.error}: ${error.message || 'Tizim xatosi'}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Rating yulduzchalarini ko'rsatish
    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => interactive && onRatingChange && onRatingChange(i)}
                    disabled={!interactive}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition`}
                >
                    <svg
                        className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                </button>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleImageError = (url) => {
        setFailedImageUrls((prev) => prev.includes(url) ? prev : [...prev, url]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="sticky top-4 float-right mr-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Product Image Gallery */}
                        <div className="relative">
                            {product.featured && (
                                <div className="absolute top-4 left-4 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-bold z-10">
                                    {t.catalog.recommended}
                                </div>
                            )}
                            {product.bestSeller && (
                                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                                    {t.home.bestSellers.replace('🔥 ', '')}
                                </div>
                            )}

                            {(() => {
                                const images = getProductImages(product).filter((image) => !failedImageUrls.includes(image.url));
                                const safeImageIndex = images.length > 0 ? currentImageIndex % images.length : 0;
                                const currentImage = images[safeImageIndex];

                                return (
                                    <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center relative group">
                                        {images.length > 0 ? (
                                            <>
                                                <img
                                                    src={currentImage?.url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded-xl"
                                                    onError={() => handleImageError(currentImage?.url)}
                                                />

                                                {/* Navigation if multiple images */}
                                                {images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCurrentImageIndex((prev) =>
                                                                prev === 0 ? images.length - 1 : prev - 1
                                                            )}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            onClick={() => setCurrentImageIndex((prev) =>
                                                                prev === images.length - 1 ? 0 : prev + 1
                                                            )}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>

                                                        {/* Thumbnails */}
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                            {images.map((img, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => setCurrentImageIndex(index)}
                                                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${index === safeImageIndex
                                                                        ? 'border-white scale-110'
                                                                        : 'border-white/50 opacity-70 hover:opacity-100'
                                                                        }`}
                                                                >
                                                                    <img
                                                                        src={img.url}
                                                                        alt={`Thumbnail ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={() => handleImageError(img.url)}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-400 text-center">
                                                <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p>{t.admin.image} {t.common.no}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                {product[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.name}
                            </h2>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-1">
                                    {renderStars(Math.round(averageRating))}
                                </div>
                                <span className="text-gray-600 font-semibold">
                                    {averageRating > 0 ? averageRating.toFixed(1) : t.common.noResults}
                                </span>
                                <span className="text-gray-400">({reviews.length} {t.productModal.reviews.toLowerCase()})</span>
                            </div>

                            {/* Price */}
                            <p className="text-3xl font-bold text-primary mb-6">
                                {product.price.toLocaleString()} {t.product.som}
                            </p>

                            {/* Description */}
                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{t.productModal.description}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {product[`description${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.description}
                                    </p>
                                </div>
                            )}

                            {/* Specifications */}
                            <div className="mb-6 bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-lg text-gray-800 mb-3">{t.admin.stock}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t.admin.stock}:</span>
                                        <span className={`font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.inStock
                                                ? `${product.stock} ${t.admin.units[product.unit || 'piece']}`
                                                : t.product.outOfStock}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-auto">
                                <button
                                    onClick={() => onToggleFavourite(product.id)}
                                    className={`p-4 rounded-lg border-2 transition ${isFavourite
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    <svg className="w-7 h-7" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t pt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {t.productModal.reviews} ({reviews.length})
                            </h3>
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                {showReviewForm ? t.productModal.cancel : t.productModal.writeReview}
                            </button>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.productModal.yourName} *
                                        </label>
                                        <input
                                            type="text"
                                            value={reviewForm.userName}
                                            onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.productModal.yourEmail}
                                        </label>
                                        <input
                                            type="email"
                                            value={reviewForm.userEmail}
                                            onChange={(e) => setReviewForm({ ...reviewForm, userEmail: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.productModal.rating} *
                                    </label>
                                    <div className="flex gap-1">
                                        {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.productModal.yourReview} *
                                    </label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder={t.productModal.yourReview + "..."}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                                >
                                    {submitting ? t.common.loading : t.productModal.submit}
                                </button>
                            </form>
                        )}

                        {/* Reviews List */}
                        {loadingReviews ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-lg">{t.productModal.noReviews}</p>
                                <p className="text-sm">{t.productModal.beFirst}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{review.user_name}</h4>
                                                <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
