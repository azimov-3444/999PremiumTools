import React from 'react';
import SEO from './SEO';
import { useLanguage } from '../i18n/LanguageContext';

const Contact = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_50%,#ffffff_100%)] py-8 md:py-12">
            <SEO
                title={t.contact.title}
                description={t.contact.subtitle}
            />
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="animate-fade-up mb-8 text-center md:mb-12">
                        <p className="text-xs font-black uppercase tracking-wide text-primary">999 Premium Tools</p>
                        <h1 className="mb-3 mt-2 text-3xl font-black tracking-tight text-gray-950 md:mb-4 md:text-4xl">
                            {t.contact.title}
                        </h1>
                        <p className="text-base leading-7 text-gray-600 md:text-xl">
                            {t.contact.subtitle}
                        </p>
                    </div>

                    <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
                        {/* Contact Information */}
                        <div className="premium-surface animate-fade-up rounded-lg p-6 md:p-8" style={{ animationDelay: '90ms' }}>
                            <h2 className="mb-6 text-xl font-black text-primary md:text-2xl">
                                {t.contact.getInTouch}
                            </h2>

                            <div className="space-y-6">
                                {/* Address */}
                                <div className="premium-card flex gap-4 rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{t.contact.address}</h3>
                                        <p className="text-sm md:text-base text-gray-600">
                                            {t.contact.addressFull}
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="premium-card flex gap-4 rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{t.contact.phone}</h3>
                                        <p className="text-sm md:text-base text-gray-600">
                                            <a href="tel:+998935959090" className="transition hover:text-primary">+998 93 595 90 90</a><br />
                                            <a href="tel:+998335959090" className="transition hover:text-primary">+998 33 595 90 90</a>
                                        </p>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div className="premium-card flex gap-4 rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{t.contact.workTime}</h3>
                                        <p className="text-sm md:text-base text-gray-600">
                                            {t.contact.weekdays}: {t.contact.weekdaysTime}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="mt-8 border-t pt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">{t.delivery.social}</h3>
                                <div className="flex gap-3">
                                    <a href="https://www.instagram.com/999premium_tools" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white transition hover:-translate-y-0.5 hover:opacity-90 md:h-10 md:w-10" aria-label="Instagram">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12 2.16c3.2 0 3.58.02 4.85.07 3.25.15 4.77 1.69 4.92 4.92.05 1.27.07 1.65.07 4.85s-.02 3.58-.07 4.85c-.15 3.22-1.67 4.77-4.92 4.92-1.27.05-1.65.07-4.85.07s-3.58-.02-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.05-1.27-.07-1.65-.07-4.85s.02-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.69.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.3.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8Zm6.41-10.4a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
                                        </svg>
                                    </a>
                                    <a href="https://t.me/Magazin999premium" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:-translate-y-0.5 hover:bg-blue-600 md:h-10 md:w-10" aria-label="Telegram">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.9 8.22-1.97 9.28c-.15.66-.54.82-1.09.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.21-.05-.33-.37-.12l-6.87 4.33-2.96-.93c-.64-.2-.65-.64.14-.95l11.56-4.46c.54-.2 1 .13.84.93Z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="premium-surface animate-fade-up rounded-lg p-6 md:p-8" style={{ animationDelay: '150ms' }}>
                            <h2 className="mb-6 text-xl font-black text-primary md:text-2xl">
                                {t.delivery.location.title}
                            </h2>

                            {/* Google Maps */}
                            <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-200 shadow-inner ring-1 ring-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d577.9831935817151!2d69.19093659559249!3d41.28262105713107!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae892f2b3a19d7%3A0xa3c3b21670766683!2s999%20PREMIUM%20Tools!5e0!3m2!1sru!2s!4v1782640764986!5m2!1sru!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    title="999 Premium Tools Address"
                                ></iframe>
                            </div>

                            <div className="rounded-lg bg-red-50/90 p-4 ring-1 ring-red-100">
                                <h3 className="font-semibold text-gray-800 mb-2">
                                    {t.delivery.location.howToGet}
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• {t.delivery.location.metro}</li>
                                    <li>• {t.delivery.location.bus}</li>
                                    <li>• {t.delivery.location.taxi}</li>
                                    <li>• {t.delivery.location.car}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="premium-surface animate-fade-up mt-6 rounded-lg p-6 md:mt-8 md:p-8" style={{ animationDelay: '210ms' }}>
                        <h2 className="mb-6 text-xl font-black text-primary md:text-2xl">
                            {t.delivery.title}
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                            <div className="premium-card rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-primary text-xl">🚚</span>
                                    {t.delivery.shipping.title}
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• {t.delivery.shipping.tashkent}</li>
                                    <li>• {t.delivery.shipping.regions}</li>
                                    <li>• {t.delivery.shipping.free}</li>
                                    <li>• {t.delivery.shipping.courier}</li>
                                </ul>
                            </div>

                            <div className="premium-card rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-primary text-xl">💳</span>
                                    {t.delivery.payment.title}
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• {t.delivery.payment.cash}</li>
                                    <li>• {t.delivery.payment.card}</li>
                                    <li>• {t.delivery.payment.apps}</li>
                                    <li>• {t.delivery.payment.transfer}</li>
                                </ul>
                            </div>

                            <div className="premium-card rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-primary text-xl">🛡️</span>
                                    {t.delivery.warranty.title}
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• {t.delivery.warranty.official}</li>
                                    <li>• {t.delivery.warranty.return}</li>
                                    <li>• {t.delivery.warranty.service}</li>
                                    <li>• {t.delivery.warranty.exchange}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
