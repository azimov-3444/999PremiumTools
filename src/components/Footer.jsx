import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const Footer = ({ categories = [] }) => {
    const { t, language } = useLanguage();
    const currentYear = new Date().getFullYear();

    // Helper to get localized category name
    const getCategoryName = (category) => {
        if (!category) return '';
        const langSuffix = language.charAt(0).toUpperCase() + language.slice(1);
        const propName = `name${langSuffix}`;
        return category[propName] || category.name || category.nameUz;
    };

    // Get latest 5 categories (assuming higher IDs are newer)
    // Create a copy to avoid mutating the prop if it's frozen
    const footerCategories = [...categories].reverse().slice(0, 5);

    return (
        <footer className="mt-20 border-t border-white/10 bg-slate-950 text-gray-300">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Company Info */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-black text-white shadow-lg shadow-red-900/20">999</span>
                            <h3 className="text-xl font-black text-white">999 Premium Tools</h3>
                        </div>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                            Professional zargarlik uskunalari va asboblari.
                            Eng sifatli mahsulotlar va ishonchli servis.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Media Icons */}
                            <a href="https://t.me/Magazin999premium" target="_blank" rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition hover:-translate-y-0.5 hover:bg-primary">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/999premium_tools" target="_blank" rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition hover:-translate-y-0.5 hover:bg-primary">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-black text-white">{t.footer.quickLinks}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="transition hover:text-primary">
                                    {t.home.title}
                                </Link>
                            </li>
                            <li>
                                <Link to="/catalog" className="hover:text-primary transition">
                                    {t.catalog.title}
                                </Link>
                            </li>
                            <li>
                                <Link to="/favourites" className="hover:text-primary transition">
                                    {t.navbar.favorites}
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary transition">
                                    {t.about.title}
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary transition">
                                    {t.contact.title}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="mb-4 text-lg font-black text-white">{t.footer.categories}</h3>
                        <ul className="space-y-2">
                            {footerCategories.length > 0 ? (
                                footerCategories.map(category => (
                                    <li key={category.id}>
                                        <Link to="/catalog" className="hover:text-primary transition">
                                            {getCategoryName(category)}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <span className="text-gray-500">{t.common.noResults}</span>
                                </li>
                            )}

                            {/* Link to all categories if needed, or just let catalog link handle it */}
                            <li>
                                <Link to="/catalog" className="text-primary hover:text-white transition text-sm flex items-center gap-1 mt-2">
                                    {t.catalog.allCategories} &rarr;
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="mb-4 text-lg font-black text-white">{t.footer.contact}</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm">
                                    {t.footer.address}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div className="text-sm">
                                    <a href="tel:+998935959090" className="hover:text-primary transition">
                                        +998 93 595 90 90
                                    </a>
                                    <br />
                                    <a href="tel:+998335959090" className="hover:text-primary transition">
                                        +998 33 595 90 90
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">
                                    {t.footer.workTime}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © {currentYear} 999 Premium Tools. {t.footer.rights}.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link to="/privacy" className="text-gray-500 hover:text-primary transition">
                                Maxfiylik Siyosati
                            </Link>
                            <Link to="/terms" className="text-gray-500 hover:text-primary transition">
                                Foydalanish Shartlari
                            </Link>
                            <a href="https://999premiumtools.surge.sh" className="text-gray-500 hover:text-primary transition">
                                999premiumtools.surge.sh
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


