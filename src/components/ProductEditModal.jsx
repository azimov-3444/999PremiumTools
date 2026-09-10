import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { toast } from 'react-toastify';

const ProductEditModal = ({ product, categories, onSave, onClose }) => {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        nameUz: '', nameRu: '', nameEn: '',
        price: '',
        categoryId: '',
        images: [],
        stock: '',
        descriptionUz: '', descriptionRu: '', descriptionEn: '',
        discount: 0,
        bestSeller: false,
        unit: 'piece'
    });

    useEffect(() => {
        if (product) {
            setFormData({
                nameUz: product.name_uz || product.nameUz || product.name || '',
                nameRu: product.name_ru || product.nameRu || product.name || '',
                nameEn: product.name_en || product.nameEn || product.name || '',
                price: product.price !== undefined && product.price !== null ? product.price : '',
                categoryId: product.category_id || product.categoryId || '',
                images: product.images || (product.image ? [{ url: product.image, is_primary: true }] : []),
                stock: product.stock !== undefined && product.stock !== null ? product.stock : 0,
                descriptionUz: product.description_uz || product.descriptionUz || product.description || '',
                descriptionRu: product.description_ru || product.descriptionRu || product.description || '',
                descriptionEn: product.description_en || product.descriptionEn || product.description || '',
                discount: product.discount !== undefined && product.discount !== null ? product.discount : 0,
                bestSeller: product.best_seller !== undefined ? product.best_seller : (product.bestSeller || false),
                unit: product.unit || 'piece'
            });
        }
    }, [product]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + (formData.images?.length || 0) > 4) {
            toast.warning('Maksimal 4 ta rasm qo\'shish mumkin!');
            return;
        }

        Promise.all(
            files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            file: file, // Store file for upload
                            url: reader.result, // Preview URL
                            is_primary: formData.images.length === 0
                        });
                    };
                    reader.readAsDataURL(file);
                });
            })
        ).then(newImages => {
            setFormData({ ...formData, images: [...(formData.images || []), ...newImages] });
        });
    };

    const handleRemoveImage = (index) => {
        const updatedImages = formData.images.filter((_, i) => i !== index);
        if (formData.images[index]?.is_primary && updatedImages.length > 0) {
            updatedImages[0].is_primary = true;
        }
        setFormData({ ...formData, images: updatedImages });
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validatsiya
        if ((!formData.nameUz && !formData.nameRu) || formData.price === '' || !formData.categoryId) {
            toast.error(t.common?.error || 'Nom, narx va kategoriyani to\'ldiring!');
            return;
        }

        try {
            setIsSaving(true);
            await onSave(product.id, {
                nameUz: formData.nameUz,
                nameRu: formData.nameRu,
                nameEn: formData.nameEn,
                price: parseFloat(formData.price) || 0,
                categoryId: parseInt(formData.categoryId) || 0,
                images: formData.images,
                stock: parseInt(formData.stock) || 0,
                descriptionUz: formData.descriptionUz,
                descriptionRu: formData.descriptionRu,
                descriptionEn: formData.descriptionEn,
                discount: parseInt(formData.discount) || 0,
                bestSeller: formData.bestSeller,
                unit: formData.unit || 'piece'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t?.admin?.editProduct || "Mahsulotni Tahrirlash"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nomi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t?.admin?.productName || "Nomi"} *
                        </label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={formData.nameUz}
                                onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                                placeholder="O'zbekcha"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <input
                                type="text"
                                value={formData.nameRu}
                                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                                placeholder="Ruscha"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <input
                                type="text"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                placeholder="Inglizcha"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Narx va Stock - 2 ustun */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {(t?.admin?.price || "Narx")} ({(t?.product?.som || "so'm")}) *
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t?.admin?.stock || "Soni"} *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    required
                                    min="0"
                                />
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="piece">{t?.admin?.units?.piece || "dona"}</option>
                                    <option value="kg">{t?.admin?.units?.kg || "kg"}</option>
                                    <option value="gr">{t?.admin?.units?.gr || "gr"}</option>
                                    <option value="ml">{t?.admin?.units?.ml || "ml"}</option>
                                    <option value="litr">{t?.admin?.units?.litr || "litr"}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Kategoriya va Chegirma - 2 ustun */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t?.admin?.category || "Katagoriya"} *
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                            >
                                <option value="">{t.common.select || "Tanlang..."}</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t?.admin?.discount || "Chegirma"} (%)
                            </label>
                            <input
                                type="number"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Tavsif */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t?.admin?.description || "Tavsif"}
                        </label>
                        <div className="space-y-2">
                            <textarea
                                value={formData.descriptionUz}
                                onChange={(e) => setFormData({ ...formData, descriptionUz: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                rows="2"
                                placeholder="Tavsif (UZ)..."
                            />
                            <textarea
                                value={formData.descriptionRu}
                                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                rows="2"
                                placeholder="Tavsif (RU)..."
                            />
                            <textarea
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                rows="2"
                                placeholder="Tavsif (EN)..."
                            />
                        </div>
                    </div>

                    {/* Rasmlar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t?.admin?.image || "Rasm"} (max 4)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={formData.images.length >= 4}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className={`block px-4 py-2 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${formData.images.length >= 4
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-gray-600">
                                {formData.images.length >= 4 ? '4/4 rasm yuklangan' : `Rasm yuklash (${formData.images.length}/4)`}
                            </span>
                        </label>

                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img.url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        {img.is_primary && (
                                            <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                                                Asosiy
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Best Seller Checkbox */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="bestSeller"
                            checked={formData.bestSeller}
                            onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <label htmlFor="bestSeller" className="text-sm font-medium text-gray-700 cursor-pointer">
                            🔥 {t?.home?.bestSellers?.replace('🔥 ', '') || "Ko'p sotiladi"}
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            {t.common.cancel || "Bekor qilish"}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{t?.admin?.saving || "Saqlanmoqda..."}</span>
                                </>
                            ) : (
                                t.admin.save || "Saqlash"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditModal;
