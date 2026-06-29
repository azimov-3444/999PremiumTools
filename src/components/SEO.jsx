import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
    const siteTitle = '999 Premium Tools';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = "Toshkentda eng sifatli zargarlik uskunalari, polir mashinalar, tarozi va o'lchov asboblari. Kafolat va yetkazib berish xizmati.";
    const defaultKeywords = "zargarlik uskunalari, zargar asboblari, polir mashina, tarozi, mikroskop, toshkent zargar, 999 premium tools";
    const defaultImage = 'https://999premiumtools.uz/og-image.jpg';
    const defaultUrl = 'https://999premiumtools.uz/';

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description || defaultDescription} />
            <meta name='keywords' content={keywords || defaultKeywords} />

            {/* Open Graph tags */}
            <meta property='og:type' content='website' />
            <meta property='og:title' content={fullTitle} />
            <meta property='og:description' content={description || defaultDescription} />
            <meta property='og:image' content={image || defaultImage} />
            <meta property='og:url' content={url || defaultUrl} />

            {/* Twitter tags */}
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={fullTitle} />
            <meta name='twitter:description' content={description || defaultDescription} />
            <meta name='twitter:image' content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
