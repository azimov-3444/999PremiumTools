import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

const Navbar = ({ currentUser, onLogout, onNavigate, favouritesCount, cartCount = 0 }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useLanguage();
    const location = useLocation();
    const isActive = (path) => {
        if (path === '') return location.pathname === '/';
        return location.pathname === `/${path}`;
    };
    const bottomItemClass = (path) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-black transition ${isActive(path)
        ? 'bg-primary text-white shadow-lg shadow-red-900/20'
        : 'text-gray-700 hover:bg-red-50 hover:text-primary'
        }`;

    const handleNavigation = (path) => {
        onNavigate(path);
        setMobileMenuOpen(false);
    };

    return (
        <>
        <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="container mx-auto px-3 sm:px-4">
                <div className="flex h-16 items-center justify-between gap-2">
                    {/* Logo */}
                    <div
                        className="group flex min-w-0 cursor-pointer items-center gap-2 text-[15px] font-black tracking-tight text-gray-950 transition hover:text-primary sm:text-base md:text-2xl"
                        onClick={() => handleNavigation('')}
                    >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-white shadow-lg shadow-red-900/20 transition group-hover:rotate-3 group-hover:scale-105 sm:h-9 sm:w-9 sm:text-sm">
                            999
                        </span>
                        <span className="whitespace-nowrap">999 Premium Tools</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button
                            onClick={() => handleNavigation('catalog')}
                            className="rounded-lg px-3 py-2 font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.catalog}
                        </button>

                        <button
                            onClick={() => handleNavigation('about')}
                            className="rounded-lg px-3 py-2 font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.about}
                        </button>

                        <button
                            onClick={() => handleNavigation('contact')}
                            className="rounded-lg px-3 py-2 font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.contacts}
                        </button>

                        <button
                            onClick={() => handleNavigation('favourites')}
                            className="relative rounded-lg px-3 py-2 font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.favorites}
                            {favouritesCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white shadow-md shadow-red-900/25">
                                    {favouritesCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => handleNavigation('cart')}
                            className="relative rounded-lg px-3 py-2 font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            Savatcha
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white shadow-md shadow-red-900/25">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <span className="text-gray-700">
                                    {currentUser.firstName} {currentUser.lastName}
                                </span>
                                {['moderator', 'admin', 'super_admin'].includes(currentUser.role) && (
                                    <button
                                        onClick={() => handleNavigation('admin')}
                                        className="rounded-lg bg-gray-950 px-4 py-2 font-semibold text-white shadow-lg shadow-gray-950/15 transition hover:-translate-y-0.5 hover:bg-primary"
                                    >
                                        {t.navbar.adminPanel}
                                    </button>
                                )}
                                <button
                                    onClick={onLogout}
                                    className="rounded-lg border border-primary px-4 py-2 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white"
                                >
                                    {t.navbar.logout}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleNavigation('login')}
                                className="premium-button rounded-lg bg-primary px-5 py-2.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700"
                            >
                                {t.navbar.login}
                            </button>
                        )}
                    </div>

                    {/* Mobile Icons */}
                    <div className="flex flex-shrink-0 items-center gap-2 lg:hidden">
                        {/* Language Switcher for Mobile */}
                        <LanguageSwitcher />

                        {/* Burger Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="relative rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition hover:border-primary/40 hover:text-primary"
                            aria-label="Menu"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                            {favouritesCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] text-white">
                                    {favouritesCount}
                                </span>
                            )}
                            {cartCount > 0 && favouritesCount === 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] text-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[560px] opacity-100 border-t border-gray-100 py-4' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleNavigation('catalog')}
                            className="rounded-lg px-4 py-3 text-left font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.catalog}
                        </button>

                        <button
                            onClick={() => handleNavigation('about')}
                            className="rounded-lg px-4 py-3 text-left font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.about}
                        </button>

                        <button
                            onClick={() => handleNavigation('contact')}
                            className="rounded-lg px-4 py-3 text-left font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            {t.navbar.contacts}
                        </button>

                        <button
                            onClick={() => handleNavigation('favourites')}
                            className="flex items-center justify-between rounded-lg px-4 py-3 text-left font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            <span>{t.navbar.favorites}</span>
                            {favouritesCount > 0 && (
                                <span className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                    {favouritesCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => handleNavigation('cart')}
                            className="flex items-center justify-between rounded-lg px-4 py-3 text-left font-semibold text-gray-700 transition hover:bg-red-50 hover:text-primary"
                        >
                            <span>Savatcha</span>
                            {cartCount > 0 && (
                                <span className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {currentUser ? (
                            <>
                                <div className="px-4 py-2 text-gray-600 border-t mt-2 pt-4">
                                    {currentUser.firstName} {currentUser.lastName}
                                </div>
                                {['moderator', 'admin', 'super_admin'].includes(currentUser.role) && (
                                    <button
                                        onClick={() => handleNavigation('admin')}
                                    className="rounded-lg bg-gray-950 px-4 py-3 text-left font-semibold text-white transition hover:bg-primary"
                                    >
                                        {t.navbar.adminPanel}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="rounded-lg border border-primary px-4 py-3 text-left font-semibold text-primary transition hover:bg-primary hover:text-white"
                                >
                                    {t.navbar.logout}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleNavigation('login')}
                                className="rounded-lg bg-primary px-4 py-3 text-left font-semibold text-white transition hover:bg-red-700"
                            >
                                {t.navbar.login}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/70 bg-white/92 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:hidden">
            <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
                <button
                    onClick={() => handleNavigation('')}
                    className={bottomItemClass('')}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l9-8 9 8M5 10v10h14V10" />
                    </svg>
                    <span>{t.home.title}</span>
                </button>
                <button
                    onClick={() => handleNavigation('catalog')}
                    className={bottomItemClass('catalog')}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>{t.navbar.catalog}</span>
                </button>
                <button
                    onClick={() => handleNavigation('favourites')}
                    className={`relative ${bottomItemClass('favourites')}`}
                >
                    <svg className="h-5 w-5" fill={favouritesCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{t.navbar.favorites}</span>
                    {favouritesCount > 0 && (
                        <span className="absolute right-4 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white shadow-md">
                            {favouritesCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => handleNavigation('cart')}
                    className={`relative ${bottomItemClass('cart')}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h9.5l3-7H5.4M7 13L5.4 5M7 13l-1.2 1.2C5.2 14.8 5.6 16 6.5 16H17m-9 4a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <span>Savat</span>
                    {cartCount > 0 && (
                        <span className="absolute right-4 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white shadow-md">
                            {cartCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => handleNavigation('contact')}
                    className={bottomItemClass('contact')}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                    </svg>
                    <span>{t.navbar.contacts}</span>
                </button>
            </div>
        </div>
        </>
    );
};

export default Navbar;
