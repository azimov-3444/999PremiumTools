import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from './SEO';
import ProductCard from './ProductCard';
import { useLanguage } from '../i18n/LanguageContext';

const Catalog = ({
    products,
    categories,
    onAddToCart,
    onToggleFavourite,
    favourites
}) => {
    const { t, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFeatured, setShowFeatured] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);
    const [randomizedProducts, setRandomizedProducts] = useState([]);

    // Reset visible count when category or search changes
    useEffect(() => {
        setVisibleCount(12);
    }, [selectedCategory, searchQuery]);

    // Initialize randomized products on mount or when products change
    useEffect(() => {
        if (products && products.length > 0) {
            const shuffled = [...products].sort(() => Math.random() - 0.5);
            setRandomizedProducts(shuffled);
        }
    }, [products]);

    // Initialize from URL params
    useEffect(() => {
        const categoryId = searchParams.get('category');
        if (categoryId) {
            setSelectedCategory(parseInt(categoryId));
        }
    }, [searchParams]);

    // Filter products
    const filteredProducts = (randomizedProducts.length > 0 ? randomizedProducts : products).filter(product => {
        if (selectedCategory && product.categoryId !== selectedCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchName = product[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`]?.toLowerCase().includes(query) || product.name.toLowerCase().includes(query);
            const matchDescription = product[`description${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`]?.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query);
            const matchMaterial = product.material?.toLowerCase().includes(query);
            if (!matchName && !matchDescription && !matchMaterial) return false;
        }
        // Filter by specific product ID if present in URL
        const productIdParam = searchParams.get('productId');
        if (productIdParam && product.id !== parseInt(productIdParam)) return false;

        return true;
    });

    // Sort by reviews and rating if showFeatured is true
    const sortedProducts = showFeatured
        ? [...filteredProducts].sort((a, b) => {
            // Try different possible field names for reviews
            const aReviews = a.reviewCount || a.reviews?.length || 0;
            const bReviews = b.reviewCount || b.reviews?.length || 0;

            // Try different possible field names for rating
            const aRating = a.rating || a.averageRating || 0;
            const bRating = b.rating || b.averageRating || 0;

            // Calculate score: reviews presence (1000) + rating (x100) + review count
            const aScore = (aReviews > 0 ? 1000 : 0) + (aRating * 100) + aReviews;
            const bScore = (bReviews > 0 ? 1000 : 0) + (bRating * 100) + bReviews;

            return bScore - aScore;
        })
        : filteredProducts;

    // Get current category name
    const currentCategory = selectedCategory
        ? categories.find(c => c.id === selectedCategory)?.[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || categories.find(c => c.id === selectedCategory)?.name
        : null;

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_42%,#ffffff_100%)] py-4 md:py-10">
            <SEO
                title={currentCategory ? `${currentCategory} - ${t.catalog.title}` : t.catalog.title}
                description="999 Premium Tools mahsulotlar katalogi. Barcha turdagi zargarlik uskunalari va asboblari."
            />
            <div className="container mx-auto px-3 sm:px-4">
                <div className="mb-4 flex flex-row items-end justify-between gap-3 md:mb-8">
                    <div className="animate-fade-up">
                        <p className="text-xs font-black uppercase tracking-wide text-primary">{currentCategory || t.catalog.allCategories}</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950 md:mt-2 md:text-4xl">{t.catalog.title}</h2>
                    </div>
                    <div className="premium-surface animate-fade-up whitespace-nowrap rounded-lg px-3 py-2 text-xs font-black text-gray-700 md:px-4 md:py-3 md:text-base" style={{ animationDelay: '90ms' }}>
                        {sortedProducts.length} / {products.length}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="animate-fade-up sticky top-16 z-30 -mx-3 mb-3 bg-white/82 px-3 py-2 backdrop-blur-xl md:static md:mx-0 md:mb-6 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none" style={{ animationDelay: '120ms' }}>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.common.search}
                            className="w-full rounded-lg border border-gray-200 bg-white/95 px-4 py-3 pl-12 text-base font-semibold text-gray-900 shadow-[0_18px_45px_rgba(15,23,42,0.08)] outline-none backdrop-blur transition placeholder:font-medium placeholder:text-gray-400 focus:border-primary/40 focus:ring-4 focus:ring-red-100 md:py-4"
                        />
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-white px-6 py-3 font-black text-primary shadow-lg shadow-red-900/10 transition hover:bg-primary hover:text-white lg:hidden"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    {t.catalog.filters}
                </button>

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Filters Sidebar - Desktop always visible, Mobile toggle */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0 mb-6 lg:mb-0`}>
                        <div className="premium-surface scrollbar-soft sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-auto rounded-lg p-4">
                            {/* Categories */}
                            <div>
                                <h3 className="mb-4 text-lg font-black text-gray-900">
                                    {t.catalog.categories}
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`w-full rounded-lg px-4 py-3 text-left text-base font-bold transition ${selectedCategory === null
                                            ? 'bg-primary text-white shadow-lg shadow-red-900/20'
                                            : 'bg-white/60 text-gray-700 hover:bg-red-50 hover:text-primary'
                                            }`}
                                    >
                                        {t.catalog.allCategories}
                                    </button>
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full rounded-lg px-4 py-3 text-left text-base font-bold transition ${selectedCategory === category.id
                                                ? 'bg-primary text-white shadow-lg shadow-red-900/20'
                                                : 'bg-white/60 text-gray-700 hover:bg-red-50 hover:text-primary'
                                                }`}
                                        >
                                            {category[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Toggle */}
                            <div>
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/65 p-3 transition hover:bg-red-50">
                                    <input
                                        type="checkbox"
                                        checked={showFeatured}
                                        onChange={(e) => setShowFeatured(e.target.checked)}
                                        className="h-5 w-5 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-base font-bold text-gray-700">
                                        {t.catalog.recommended}
                                    </span>
                                </label>
                            </div>

                            {/* Mobile: Close Filters Button */}
                            <button
                                onClick={() => setShowFilters(false)}
                                className="w-full rounded-lg bg-primary py-3 font-black text-white transition hover:bg-red-700 lg:hidden"
                            >
                                {t.catalog.saveFilters}
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="mb-4"></div>

                        {sortedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                    {sortedProducts.slice(0, visibleCount).map((product, index) => (
                                        <div className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }} key={product.id}>
                                            <ProductCard
                                                product={product}
                                                onAddToCart={onAddToCart}
                                                onToggleFavourite={onToggleFavourite}
                                                isFavourite={favourites.includes(product.id)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {visibleCount < sortedProducts.length && (
                                    <div className="mt-12 text-center">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 16)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-8 py-3 font-black text-primary shadow-lg shadow-red-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-xl group"
                                        >
                                            {t.catalog.showMore}
                                            <svg
                                                className="w-5 h-5 transform group-hover:translate-y-1 transition-transform"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="premium-surface rounded-lg py-12 text-center">
                                <svg className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 text-lg mb-4">{t.catalog.noProducts}</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory(null);
                                        setShowFeatured(false);
                                    }}
                                    className="text-base font-bold text-primary hover:underline"
                                >
                                    {t.catalog.tryAdjusting}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
