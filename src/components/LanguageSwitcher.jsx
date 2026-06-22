import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'uz', name: 'O\'zbekcha' },
        { code: 'ru', name: 'Русский' },
        { code: 'en', name: 'English' }
    ];

    const currentLang = languages.find(lang => lang.code === language);

    return (
        <div className="relative">
            <button
                disabled
                title="Vaqtinchalik o'chirilgan"
                className="flex items-center gap-1 px-3 py-2 rounded-lg opacity-50 cursor-not-allowed transition bg-gray-50"
            >
                <span className="text-sm font-bold text-gray-500">
                    {currentLang.code.toUpperCase()}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    changeLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition ${language === lang.code ? 'bg-red-50 text-primary' : 'text-gray-700'
                                    }`}
                            >
                                <span className="text-sm font-medium">{lang.name}</span>
                                {language === lang.code && (
                                    <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
