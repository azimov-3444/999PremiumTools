import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getProductImages } from '../utils/productImages';

const weightUnits = ['kg', 'gr'];

const Cart = ({
    cart,
    onUpdateQuantity,
    onUpdateAmountGrams,
    onRemoveFromCart,
    onSubmitOrder,
    products
}) => {
    const { language } = useLanguage();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        customerName: '',
        customerPhone: '',
        customerTelegram: '',
        message: ''
    });

    const getProduct = (productId) => products.find((product) => Number(product.id) === Number(productId));
    const getProductName = (product) => product?.[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product?.name || '';
    const getUnitLabel = (unit) => {
        if (unit === 'kg') return 'kg';
        if (unit === 'gr') return 'gr';
        return 'ta';
    };

    const orderItems = cart
        .map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;

            const unit = product.unit || 'piece';
            return {
                product,
                productName: getProductName(product),
                unit,
                isWeight: weightUnits.includes(unit),
                quantity: item.quantity || 1,
                amountGrams: item.amountGrams || 100,
                image: getProductImages(product)[0]?.url
            };
        })
        .filter(Boolean);

    const totalItems = orderItems.reduce((sum, item) => sum + (item.isWeight ? 1 : item.quantity), 0);

    const handleFormChange = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.customerName.trim() || !form.customerPhone.trim()) {
            setError('Ism va telefon raqam majburiy.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await onSubmitOrder({
                ...form,
                customerName: form.customerName.trim(),
                customerPhone: form.customerPhone.trim(),
                customerTelegram: form.customerTelegram.trim(),
                message: form.message.trim(),
                items: orderItems.map((item) => ({
                    productId: item.product.id,
                    productName: item.productName,
                    unit: item.unit,
                    quantity: item.isWeight ? 1 : item.quantity,
                    amountGrams: item.isWeight ? item.amountGrams : undefined
                }))
            });
            setCheckoutOpen(false);
            setForm({
                customerName: '',
                customerPhone: '',
                customerTelegram: '',
                message: ''
            });
        } catch (submitError) {
            console.error('Order submit error:', submitError);
            setError(submitError.message || 'Buyurtmani yuborishda xatolik yuz berdi. Qayta urinib ko\'ring.');
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <h2 className="mb-6 text-2xl font-black text-gray-950 md:mb-8 md:text-3xl">Savatcha</h2>
                    <div className="premium-surface rounded-lg p-8 text-center md:p-12">
                        <svg className="mx-auto mb-4 h-20 w-20 text-gray-300 md:h-24 md:w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-bold text-gray-500 md:text-xl">Savatchangiz bo'sh</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4">
                <h2 className="mb-6 text-2xl font-black text-gray-950 md:mb-8 md:text-3xl">Savatcha</h2>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {orderItems.map((item) => (
                            <div key={item.product.id} className="premium-surface rounded-lg p-3 md:p-5">
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                                        {item.image ? (
                                            <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                                        ) : (
                                            <svg className="h-8 w-8 text-gray-400 sm:h-12 sm:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="mb-2 line-clamp-2 text-base font-black text-gray-900 md:text-lg">{item.productName}</h3>
                                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            O'lchov: {getUnitLabel(item.unit)}
                                        </p>

                                        <div className="flex items-center justify-between gap-3">
                                            {item.isWeight ? (
                                                <label className="flex flex-1 items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-600">Gram:</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.amountGrams}
                                                        onChange={(event) => onUpdateAmountGrams(item.product.id, event.target.value)}
                                                        className="h-10 w-full max-w-40 rounded-lg border border-gray-200 bg-white px-3 text-sm font-black text-gray-900 outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                                    />
                                                </label>
                                            ) : (
                                                <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white sm:h-10">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                                        className="flex h-full items-center justify-center px-3 text-sm font-bold transition hover:bg-gray-100 sm:text-base"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="flex h-full min-w-9 items-center justify-center border-x border-gray-200 px-3 text-sm font-semibold sm:text-base">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                                        className="flex h-full items-center justify-center px-3 text-sm font-bold transition hover:bg-gray-100 sm:text-base"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => onRemoveFromCart(item.product.id)}
                                                className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:text-red-700"
                                                aria-label="Savatchadan olib tashlash"
                                            >
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="premium-surface rounded-lg p-6 lg:sticky lg:top-24">
                            <h3 className="mb-4 text-lg font-black text-gray-950 md:text-xl">Buyurtma</h3>
                            <div className="mb-6 space-y-3">
                                <div className="flex justify-between text-base text-gray-600">
                                    <span>Mahsulotlar:</span>
                                    <span>{totalItems} ta</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setCheckoutOpen(true)}
                                className="w-full rounded-lg bg-primary py-4 text-lg font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
                            >
                                Buyurtma berish
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {checkoutOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm">
                    <form
                        onSubmit={handleSubmit}
                        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-[0_30px_90px_rgba(15,23,42,0.34)]"
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-xl">
                            <div>
                                <p className="text-xs font-black uppercase tracking-wide text-primary">999 Premium Tools</p>
                                <h3 className="text-lg font-black text-gray-950">Buyurtmani tasdiqlash</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCheckoutOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-900 transition hover:bg-primary hover:text-white"
                                aria-label="Yopish"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 p-4">
                            <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-100">
                                <h4 className="mb-3 text-sm font-black text-gray-950">Zakaz qilinayotgan mahsulotlar</h4>
                                <div className="space-y-2">
                                    {orderItems.map((item, index) => (
                                        <div key={item.product.id} className="flex justify-between gap-3 rounded-lg bg-white p-3 text-sm ring-1 ring-gray-100">
                                            <span className="font-bold text-gray-900">{index + 1}. {item.productName}</span>
                                            <span className="flex-shrink-0 font-black text-primary">
                                                {item.isWeight ? `${item.amountGrams} gr` : `${item.quantity} ta`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-black text-gray-700">Ismingiz *</span>
                                    <input
                                        type="text"
                                        value={form.customerName}
                                        onChange={(event) => handleFormChange('customerName', event.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                        placeholder="Ism"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-black text-gray-700">Telefon raqam *</span>
                                    <input
                                        type="tel"
                                        value={form.customerPhone}
                                        onChange={(event) => handleFormChange('customerPhone', event.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                        placeholder="+998"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-1 block text-sm font-black text-gray-700">Telegram username</span>
                                <input
                                    type="text"
                                    value={form.customerTelegram}
                                    onChange={(event) => handleFormChange('customerTelegram', event.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                    placeholder="@username"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-black text-gray-700">Nima haqida ma'lumot olmoqchisiz?</span>
                                <textarea
                                    value={form.message}
                                    onChange={(event) => handleFormChange('message', event.target.value)}
                                    rows="4"
                                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-red-100"
                                    placeholder="Masalan: sifati, qayerda ishlab chiqarilgani, narxi yoki yetkazib berish haqida..."
                                />
                            </label>

                            {error && (
                                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded-lg bg-primary py-4 text-base font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                {submitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Cart;
