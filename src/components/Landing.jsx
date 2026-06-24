import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import SEO from './SEO';

const Landing = ({
    categories = [],
    carouselItems = [],
    onNavigate,
}) => {
    const { t, language } = useLanguage();
    const [activeBanner, setActiveBanner] = useState(0);

    const localizedName = (item) => (
        item?.[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || item?.name || ''
    );

    const bannerItems = carouselItems.filter((item) => item.image);

    useEffect(() => {
        if (bannerItems.length <= 1) return undefined;

        const timer = setInterval(() => {
            setActiveBanner((current) => (current + 1) % bannerItems.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [bannerItems.length]);

    useEffect(() => {
        if (activeBanner >= bannerItems.length) {
            setActiveBanner(0);
        }
    }, [activeBanner, bannerItems.length]);

    const heroStats = [
        {
            value: t.landing.experienceYears,
            title: t.landing.experienceTitle,
            text: t.landing.experienceText
        },
        {
            value: t.landing.happyCustomers,
            title: t.landing.customersTitle,
            text: t.landing.customersText
        },
        {
            value: t.landing.productsCount,
            title: t.landing.productsTitle,
            text: t.landing.productsText
        }
    ];

    const features = [
        {
            title: t.landing.features.quality,
            text: t.landing.features.qualityText,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M12 3l7 3v5c0 4.418-2.925 8.168-7 9.4C7.925 19.168 5 15.418 5 11V6l7-3z" />
            )
        },
        {
            title: t.landing.features.shipping,
            text: t.landing.features.shippingText,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4.586a1 1 0 00.707-.293l2.414-2.414A1 1 0 0021 12.586V10a1 1 0 00-.293-.707L18 6.586A1 1 0 0017.293 6H13m-7 13a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z" />
            )
        },
        {
            title: t.landing.features.support,
            text: t.landing.features.supportText,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728m9.192-9.192a4 4 0 010 5.656m-5.656-5.656a4 4 0 000 5.656M12 12h.01" />
            )
        },
        {
            title: t.landing.features.warranty,
            text: t.landing.features.warrantyText,
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M12 3l7 3v5c0 4.418-2.925 8.168-7 9.4C7.925 19.168 5 15.418 5 11V6l7-3z" />
            )
        }
    ];

    const getCategoryIconPath = (categoryName = '') => {
        const name = categoryName.toLowerCase();
        if (name.includes('polir') || name.includes('silliq') || name.includes('shlif')) {
            return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655M14.924 11.374L12.58 9.03m2.344 2.344l1.757-1.757a1 1 0 011.414 0l.879.879a1 1 0 010 1.414l-1.757 1.757M12.58 9.03L9.29 5.74a1 1 0 010-1.414l.879-.879a1 1 0 011.414 0l3.29 3.29" />;
        }
        if (name.includes('tarozi') || name.includes("o'lch") || name.includes('ves') || name.includes('scale')) {
            return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18l-6 3m6-3l6 3M6 6l-3 7h6L6 6zm12 0l-3 7h6l-3-7zM8 21h8" />;
        }
        if (name.includes('mikroskop') || name.includes('optik') || name.includes('lupa') || name.includes('micro')) {
            return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2m1.7-5.3a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />;
        }
        if (name.includes('quyish') || name.includes('qolip') || name.includes('pech') || name.includes('cast')) {
            return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657zM9.879 16.121A3 3 0 1014.12 11.88" />;
        }
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />;
    };

    return (
        <main className="bg-gray-50 overflow-hidden">
            <SEO
                title={t.landing.heroTitle}
                description={t.landing.heroSubtitle}
            />

            <section className="relative bg-slate-950 text-white">
                <div className="relative min-h-[430px] overflow-hidden sm:min-h-[600px] lg:min-h-[calc(100vh-4rem)]">
                    {bannerItems.length > 0 ? (
                        bannerItems.map((banner, index) => (
                            <img
                                key={banner.id || `${banner.image}-${index}`}
                                src={banner.image}
                                alt=""
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeBanner ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.35),transparent_32%),linear-gradient(135deg,#111827,#030712)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-950/72 to-slate-950/58 md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/82 md:to-slate-950/35" />

                    <div className="container relative z-10 mx-auto flex min-h-[430px] items-center px-4 py-10 sm:min-h-[600px] sm:px-6 sm:py-14 md:py-20 lg:min-h-[calc(100vh-4rem)] lg:px-8 lg:py-24">
                        <div className="w-full max-w-3xl text-center md:text-left">
                            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur sm:px-4 sm:py-2 sm:text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary sm:h-2 sm:w-2" />
                                {t.landing.badge}
                            </div>

                            <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:mt-6 sm:text-5xl lg:text-6xl">
                                {t.landing.heroTitle}
                            </h1>

                            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:mt-6 sm:text-lg sm:leading-8 md:mx-0">
                                {t.landing.heroSubtitle}
                            </p>

                            <div className="mt-5 flex flex-col gap-2 sm:mx-auto sm:mt-7 sm:max-w-md sm:flex-row sm:gap-3 md:mx-0 md:max-w-none">
                                <button
                                    onClick={() => onNavigate('catalog')}
                                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-xl shadow-red-900/30 transition hover:-translate-y-0.5 hover:bg-red-700 sm:min-h-12 sm:flex-none sm:px-7 sm:py-4 sm:text-base"
                                >
                                    {t.landing.exploreCatalog}
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onNavigate('contact')}
                                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:min-h-12 sm:flex-none sm:px-7 sm:py-4 sm:text-base"
                                >
                                    {t.landing.consultation}
                                </button>
                            </div>
                        </div>
                    </div>

                    {bannerItems.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-5 sm:gap-2">
                            {bannerItems.map((banner, index) => (
                                <button
                                    key={banner.id || index}
                                    type="button"
                                    onClick={() => setActiveBanner(index)}
                                    className={`h-1.5 rounded-full transition-all sm:h-2 ${index === activeBanner ? 'w-6 bg-primary sm:w-8' : 'w-1.5 bg-white/70 hover:bg-white sm:w-2'}`}
                                    aria-label={`Banner ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="container relative z-20 mx-auto px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-100 bg-white p-3 shadow-xl sm:gap-4 sm:p-5 md:p-7">
                    {heroStats.map((stat) => (
                        <div key={stat.title} className="rounded-lg bg-gray-50 p-2.5 text-center sm:p-5">
                            <p className="text-xl font-black text-primary sm:text-4xl">{stat.value}</p>
                            <p className="mt-1 text-[11px] font-bold leading-tight text-gray-900 sm:mt-2 sm:text-lg">{stat.title}</p>
                            <p className="mt-1 hidden text-sm leading-6 text-gray-500 sm:block">{stat.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {categories.length > 0 && (
                <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
                    <div className="mx-auto mb-5 max-w-2xl text-center sm:mb-10">
                        <p className="text-xs font-bold uppercase tracking-wide text-primary sm:text-sm">{t.landing.quickNav}</p>
                        <h2 className="mt-2 text-xl font-black text-gray-900 sm:mt-3 sm:text-3xl md:text-4xl">{t.landing.categoriesTitle}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600 sm:mt-4 sm:text-lg sm:leading-8">{t.landing.categoriesSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                        {categories.slice(0, 8).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onNavigate(`catalog?category=${category.id}`)}
                                className="group rounded-lg border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:p-5"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-primary transition group-hover:bg-primary group-hover:text-white sm:h-12 sm:w-12">
                                    <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {getCategoryIconPath(localizedName(category))}
                                    </svg>
                                </span>
                                <span className="mt-3 block text-sm font-bold leading-snug text-gray-900 group-hover:text-primary sm:mt-5 sm:text-lg">
                                    {localizedName(category)}
                                </span>
                                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary sm:mt-3 sm:text-sm">
                                    {t.landing.openCategory}
                                    <svg className="h-3 w-3 transition group-hover:translate-x-1 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
                <div className="mx-auto mb-5 max-w-2xl text-center sm:mb-10">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary sm:text-sm">{t.landing.advantagesKicker}</p>
                    <h2 className="mt-2 text-xl font-black text-gray-900 sm:mt-3 sm:text-3xl md:text-4xl">{t.landing.whyTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600 sm:mt-4 sm:text-lg sm:leading-8">{t.landing.whySubtitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div key={feature.title} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-primary sm:h-12 sm:w-12">
                                <svg className="h-4 w-4 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {feature.icon}
                                </svg>
                            </div>
                            <h3 className="mt-3 text-sm font-bold leading-snug text-gray-900 sm:mt-5 sm:text-lg">{feature.title}</h3>
                            <p className="mt-1.5 text-xs leading-5 text-gray-600 sm:mt-3 sm:text-sm sm:leading-6">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="relative overflow-hidden bg-slate-950 py-9 text-white sm:py-16 md:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.10),transparent_22%)]" />
                <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mx-auto max-w-3xl text-xl font-black leading-tight sm:text-3xl md:text-5xl">{t.landing.bottomTitle}</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:mt-5 sm:text-lg sm:leading-8">{t.landing.bottomSubtitle}</p>
                    <button
                        onClick={() => onNavigate('catalog')}
                        className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-red-900/30 transition hover:bg-red-700 hover:-translate-y-0.5 sm:mt-8 sm:min-h-12 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                    >
                        {t.landing.enterStore}
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Landing;
