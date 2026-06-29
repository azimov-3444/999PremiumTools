import React from 'react';
import SEO from './SEO';
import Banner from './Banner';
import Carousel from './Carousel';
import Catalog from './Catalog';
import ProductCard from './ProductCard';
import { useLanguage } from '../i18n/LanguageContext';

const Home = ({
    products,
    categories,
    onAddToCart,
    onToggleFavourite,
    favourites,
    onNavigate,
    carouselItems
}) => {
    const { t } = useLanguage();
    // Ko'p sotiladiganlar
    const bestSellers = products.filter(product => product.bestSeller);

    return (
        <div>
            <SEO
                title={t.home.title}
                description="999 Premium Tools - Zargarlik uskunalari va asboblari do'koni. Eng sifatli mahsulotlar va ishonchli servis."
            />
            <Banner onNavigate={onNavigate} />
            <Carousel items={carouselItems} />

            {/* Ko'p Sotiladiganlar Bo'limi */}
            {bestSellers.length > 0 && (
                <section className="container mx-auto px-4 py-6 md:py-12">
                    <div className="flex items-center justify-between mb-4 md:mb-8">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
                            <h2 className="text-xl md:text-3xl font-bold text-gray-800">
                                {t.home.bestSellers}
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {bestSellers.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                onToggleFavourite={onToggleFavourite}
                                isFavourite={favourites.includes(product.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Asosiy Katalog */}
            <Catalog
                products={products}
                categories={categories}
                onToggleFavourite={onToggleFavourite}
                favourites={favourites}
            />
        </div>
    );
};

export default Home;
