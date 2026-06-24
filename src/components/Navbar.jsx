import React, { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

const Navbar = ({ currentUser, onLogout, onNavigate, favouritesCount }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    const handleNavigation = (path) => {
        onNavigate(path);
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        className="text-xl md:text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition"
                        onClick={() => handleNavigation('')}
                    >
                        {t.navbar.logo}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button
                            onClick={() => handleNavigation('catalog')}
                            className="text-gray-700 hover:text-primary transition font-medium"
                        >
                            {t.navbar.catalog}
                        </button>

                        <button
                            onClick={() => handleNavigation('about')}
                            className="text-gray-700 hover:text-primary transition font-medium"
                        >
                            {t.navbar.about}
                        </button>

                        <button
                            onClick={() => handleNavigation('contact')}
                            className="text-gray-700 hover:text-primary transition font-medium"
                        >
                            {t.navbar.contacts}
                        </button>

                        <button
                            onClick={() => handleNavigation('favourites')}
                            className="text-gray-700 hover:text-primary transition font-medium relative"
                        >
                            {t.navbar.favorites}
                            {favouritesCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {favouritesCount}
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
                                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                    >
                                        {t.navbar.adminPanel}
                                    </button>
                                )}
                                <button
                                    onClick={onLogout}
                                    className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition font-medium"
                                >
                                    {t.navbar.logout}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleNavigation('login')}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                            >
                                {t.navbar.login}
                            </button>
                        )}
                    </div>

                    {/* Mobile Icons */}
                    <div className="flex lg:hidden items-center gap-3">
                        {/* Language Switcher for Mobile */}
                        <LanguageSwitcher />

                        {/* Burger Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 relative"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                            {favouritesCount > 0 && (
                                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {favouritesCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[500px] opacity-100 border-t py-4' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleNavigation('catalog')}
                            className="text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            {t.navbar.catalog}
                        </button>

                        <button
                            onClick={() => handleNavigation('about')}
                            className="text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            {t.navbar.about}
                        </button>

                        <button
                            onClick={() => handleNavigation('contact')}
                            className="text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            {t.navbar.contacts}
                        </button>

                        <button
                            onClick={() => handleNavigation('favourites')}
                            className="text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium flex items-center justify-between"
                        >
                            <span>{t.navbar.favorites}</span>
                            {favouritesCount > 0 && (
                                <span className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                    {favouritesCount}
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
                                        className="text-left px-4 py-3 bg-primary text-white rounded-lg hover:bg-red-700 font-medium"
                                    >
                                        {t.navbar.adminPanel}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-left px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white font-medium"
                                >
                                    {t.navbar.logout}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleNavigation('login')}
                                className="text-left px-4 py-3 bg-primary text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                {t.navbar.login}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
