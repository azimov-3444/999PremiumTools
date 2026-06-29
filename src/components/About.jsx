import React from 'react';
import SEO from './SEO';
import { useLanguage } from '../i18n/LanguageContext';

const About = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_50%,#ffffff_100%)] py-12">
            <SEO
                title={t.about.title}
                description={t.about.subtitle}
            />
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="animate-fade-up mb-12 text-center">
                        <p className="text-xs font-black uppercase tracking-wide text-primary">999 Premium Tools</p>
                        <h1 className="mb-4 mt-2 text-4xl font-black tracking-tight text-gray-950">
                            {t.about.title}
                        </h1>
                        <p className="text-xl leading-8 text-gray-600">
                            {t.about.subtitle}
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="premium-surface animate-fade-up space-y-8 rounded-lg p-6 md:p-8" style={{ animationDelay: '90ms' }}>
                        {/* Company Story */}
                        <section>
                            <h2 className="mb-4 text-2xl font-black text-primary">
                                {t.about.story.title}
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                {t.about.story.text}
                            </p>
                        </section>

                        {/* Our Advantages */}
                        <section>
                            <h2 className="mb-4 text-2xl font-black text-primary">
                                {t.about.why.title}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="premium-card flex gap-3 rounded-lg bg-white/75 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                                            ✓
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {t.about.why.quality}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {t.about.why.qualityText}
                                        </p>
                                    </div>
                                </div>

                                <div className="premium-card flex gap-3 rounded-lg bg-white/75 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                                            ✓
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {t.about.why.experience}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {t.about.why.experienceText}
                                        </p>
                                    </div>
                                </div>

                                <div className="premium-card flex gap-3 rounded-lg bg-white/75 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                                            ✓
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {t.about.why.delivery}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {t.about.why.deliveryText}
                                        </p>
                                    </div>
                                </div>

                                <div className="premium-card flex gap-3 rounded-lg bg-white/75 p-4 ring-1 ring-gray-100">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                                            ✓
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {t.about.why.support}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {t.about.why.supportText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Values */}
                        <section>
                            <h2 className="mb-4 text-2xl font-black text-primary">
                                {t.about.values.title}
                            </h2>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">▶</span>
                                    <span>{t.about.values.quality}: {t.about.values.qualityText}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">▶</span>
                                    <span>{t.about.values.service}: {t.about.values.serviceText}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">▶</span>
                                    <span>{t.about.values.innovation}: {t.about.values.innovationText}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">▶</span>
                                    <span>{t.about.values.trust}: {t.about.values.trustText}</span>
                                </li>
                            </ul>
                        </section>

                        {/* Mission */}
                        <section className="rounded-lg bg-red-50/90 p-6 ring-1 ring-red-100">
                            <h2 className="mb-4 text-2xl font-black text-primary">
                                {t.about.mission.title}
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {t.about.mission.text}
                            </p>
                        </section>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default About;
