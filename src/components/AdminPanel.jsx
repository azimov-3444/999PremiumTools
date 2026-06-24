import React, { useState, useEffect } from 'react';
import ProductEditModal from './ProductEditModal';
import { useLanguage } from '../i18n/LanguageContext';
import { uploadImage } from '../api/supabaseApi';
import { confirmDialog } from '../utils/toastUtils';
import { toast } from 'react-toastify';

const AdminPanel = ({
    categories,
    products,
    users,
    onAddCategory,
    onDeleteCategory,
    onUpdateCategory,
    onAddProduct,
    onUpdateUserRole,
    onDeleteProduct,
    onUpdateProductStock,
    onUpdateProduct,
    carouselItems,
    onAddCarouselItem,
    onDeleteCarouselItem,
    onUpdateCarouselItem,
    onUpdateProductCategory,
    onUpdateProductBestSeller,
    reviews,
    onDeleteReview,
    visitStats,
    currentUser,
    onUpdatePassword
}) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('users');
    const [passwordData, setPasswordData] = useState({ userId: null, newPassword: '' });
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);

    const handlePasswordChange = async (e, email = passwordData.userId, pwd = passwordData.newPassword) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!pwd || !email) return;

        setIsPasswordChanging(true);
        const success = await onUpdatePassword(email, pwd);
        setIsPasswordChanging(false);

        if (success) {
            toast.success(t.admin.passwordChanged);
            setPasswordData({ userId: null, newPassword: '' });
        } else {
            toast.error(t.admin.passwordError);
        }
    };
    const [newCategory, setNewCategory] = useState({
        nameUz: '', nameRu: '', nameEn: '', icon: ''
    });
    const [newBanner, setNewBanner] = useState({
        image: '',
        titleUz: '', titleRu: '', titleEn: '',
        descriptionUz: '', descriptionRu: '', descriptionEn: '',
        buttonTextUz: '', buttonTextRu: '', buttonTextEn: '',
        link: ''
    });
    const [newProduct, setNewProduct] = useState({
        nameUz: '', nameRu: '', nameEn: '',
        price: '',
        categoryId: '',
        images: [],
        stock: '',
        discount: 0,
        unit: 'piece',
        descriptionUz: '', descriptionRu: '', descriptionEn: ''
    });
    const [stockEditing, setStockEditing] = useState({}); // Local state for editing
    const [editingProduct, setEditingProduct] = useState(null); // For ProductEditModal
    const [editingCategory, setEditingCategory] = useState(null); // { id, nameUz, nameRu, nameEn }
    const [adminCategoryFilter, setAdminCategoryFilter] = useState(''); // For filtering products by category
    const [adminProductSearch, setAdminProductSearch] = useState('');
    const [editingBanner, setEditingBanner] = useState(null); // For banner editing

    // Banner specific state
    const [bannerLinkType, setBannerLinkType] = useState('category'); // 'category', 'product', 'custom'
    const [bannerSelectedCategory, setBannerSelectedCategory] = useState('');
    const [bannerSelectedProduct, setBannerSelectedProduct] = useState('');

    const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const loadImageFromDataUrl = (dataUrl) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
    });

    const compressBannerPreview = async (file) => {
        const originalDataUrl = await readFileAsDataUrl(file);

        try {
            const image = await loadImageFromDataUrl(originalDataUrl);
            const attempts = [
                { width: 1200, height: 520, quality: 0.68 },
                { width: 900, height: 390, quality: 0.55 },
                { width: 720, height: 310, quality: 0.45 },
                { width: 600, height: 260, quality: 0.35 }
            ];
            const maxSafeLength = 75000;
            let compressedDataUrl = originalDataUrl;

            for (const attempt of attempts) {
                const scale = Math.min(attempt.width / image.width, attempt.height / image.height, 1);
                const width = Math.max(1, Math.round(image.width * scale));
                const height = Math.max(1, Math.round(image.height * scale));
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(image, 0, 0, width, height);
                compressedDataUrl = canvas.toDataURL('image/webp', attempt.quality);

                if (compressedDataUrl.length <= maxSafeLength) {
                    break;
                }
            }

            return compressedDataUrl;
        } catch (error) {
            console.warn("Banner preview siqilmadi, asl preview ishlatilmoqda:", error);
            return originalDataUrl;
        }
    };

    const handleBannerImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file size is > 3MB
        if (file.size > 3 * 1024 * 1024) {
            toast.warning("Rasm hajmi juda katta! 3MB dan kichik rasm yuklang.");
            return;
        }

        try {
            const previewImage = await compressBannerPreview(file);
            if (editingBanner) {
                setEditingBanner(prev => prev ? ({ ...prev, image: previewImage, file: file }) : null);
            } else {
                setNewBanner(prev => ({ ...prev, image: previewImage, file: file }));
            }
        } catch (error) {
            console.error("Banner rasmini o'qishda xatolik:", error);
            toast.error(t.common.error + ": " + (error.message || t.admin.saveError));
        }
    };

    // Update link based on selection
    useEffect(() => {
        if (bannerLinkType === 'category' && bannerSelectedCategory) {
            const newLink = `/catalog?category=${bannerSelectedCategory}`;
            if (editingBanner) {
                setEditingBanner(prev => prev ? ({ ...prev, link: newLink }) : null);
            } else {
                setNewBanner(prev => ({ ...prev, link: newLink }));
            }
        } else if (bannerLinkType === 'product' && bannerSelectedProduct) {
            const newLink = `/catalog?productId=${bannerSelectedProduct}`;
            if (editingBanner) {
                setEditingBanner(prev => prev ? ({ ...prev, link: newLink }) : null);
            } else {
                setNewBanner(prev => ({ ...prev, link: newLink }));
            }
        }
    }, [bannerLinkType, bannerSelectedCategory, bannerSelectedProduct]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            if (newCategory.nameUz || newCategory.nameRu || newCategory.nameEn) {
                await onAddCategory({
                    nameUz: newCategory.nameUz,
                    nameRu: newCategory.nameRu,
                    nameEn: newCategory.nameEn
                });
                setNewCategory({ nameUz: '', nameRu: '', nameEn: '', icon: '' });
                toast.success(t.admin.categoryAdded || "Kategoriya muvaffaqiyatli qo'shildi!");
            }
        } catch (error) {
            console.error("Kategoriya qo'shishda xatolik:", error);
            toast.error(t.common.error + ": " + (error.message || t.admin.saveError));
        }
    };

    const handleUpdateCategory = async (id) => {
        try {
            await onUpdateCategory(id, {
                nameUz: editingCategory.nameUz,
                nameRu: editingCategory.nameRu,
                nameEn: editingCategory.nameEn
            });
            setEditingCategory(null);
            toast.success(t.admin.categoryUpdated || "Kategoriya muvaffaqiyatli yangilandi!");
        } catch (error) {
            toast.error(t.common.error + ": " + error.message);
        }
    };

    const uploadBannerImage = async (file, fallbackImage) => {
        try {
            return await uploadImage(file, 'banners');
        } catch (error) {
            console.warn("Banner rasmi Supabase'ga yuklanmadi, vaqtincha preview rasm saqlanmoqda:", error);
            if (typeof fallbackImage === 'string' && fallbackImage.startsWith('data:image/')) {
                return fallbackImage;
            }
            throw error;
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        try {
            if (newBanner.image) {
                let imageUrl = newBanner.image;

                if (newBanner.file) {
                    imageUrl = await uploadBannerImage(newBanner.file, newBanner.image);
                }

                await onAddCarouselItem({
                    image: imageUrl,
                    link: newBanner.link,
                    titleUz: newBanner.titleUz,
                    titleRu: newBanner.titleRu,
                    titleEn: newBanner.titleEn,
                    descriptionUz: newBanner.descriptionUz,
                    descriptionRu: newBanner.descriptionRu,
                    descriptionEn: newBanner.descriptionEn,
                    buttonTextUz: newBanner.buttonTextUz,
                    buttonTextRu: newBanner.buttonTextRu,
                    buttonTextEn: newBanner.buttonTextEn
                });

                // Clear state ONLY on success
                setNewBanner({
                    image: '', file: null, link: '',
                    titleUz: '', titleRu: '', titleEn: '',
                    descriptionUz: '', descriptionRu: '', descriptionEn: '',
                    buttonTextUz: '', buttonTextRu: '', buttonTextEn: ''
                });
                setBannerSelectedCategory('');
                setBannerSelectedProduct('');
                setBannerLinkType('category');

                toast.success(t.admin.bannerAdded || "Banner muvaffaqiyatli qo'shildi!");
            }
        } catch (error) {
            console.error("Banner qo'shishda xatolik:", error);
            toast.error(t.common.error + ": " + (error.message || t.admin.saveError));
        }
    };

    const handleUpdateBanner = async (e) => {
        e.preventDefault();
        if (!editingBanner) return;

        try {
            let imageUrl = editingBanner.image;

            if (editingBanner.file) {
                imageUrl = await uploadBannerImage(editingBanner.file, editingBanner.image);
            }

            await onUpdateCarouselItem(editingBanner.id, {
                ...editingBanner,
                image: imageUrl,
                file: undefined
            });

            setEditingBanner(null);
            toast.success(t.admin.bannerUpdated || "Banner muvaffaqiyatli yangilandi!");
        } catch (error) {
            console.error("Banner tahrirlashda xatolik:", error);
            toast.error(t.common.error + ": " + (error.message || t.admin.saveError));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!((newProduct.nameUz || newProduct.nameRu) && newProduct.price && newProduct.categoryId && newProduct.stock)) {
            toast.warning(t.admin.fillRequired || "Iltimos, majburiy maydonlarni to'ldiring!");
            return;
        }

        try {
            // Upload images first
            const uploadedImages = await Promise.all(newProduct.images.map(async (img) => {
                if (img.file) {
                    const publicUrl = await uploadImage(img.file);
                    return { url: publicUrl, is_primary: img.is_primary };
                }
                // Return only necessary data, strip the File object
                return { url: img.url, is_primary: img.is_primary };
            }));

            await onAddProduct({
                nameUz: newProduct.nameUz,
                nameRu: newProduct.nameRu,
                nameEn: newProduct.nameEn,
                price: parseInt(newProduct.price),
                categoryId: parseInt(newProduct.categoryId),
                images: uploadedImages,
                stock: parseInt(newProduct.stock),
                inStock: parseInt(newProduct.stock) > 0,
                descriptionUz: newProduct.descriptionUz || '',
                descriptionRu: newProduct.descriptionRu || '',
                descriptionEn: newProduct.descriptionEn || '',
                discount: parseInt(newProduct.discount) || 0,
                unit: newProduct.unit || 'piece'
            });

            setNewProduct({
                nameUz: '', nameRu: '', nameEn: '',
                price: '', categoryId: '', images: [], stock: '',
                descriptionUz: '', descriptionRu: '', descriptionEn: '',
                discount: 0,
                unit: 'piece'
            });
            toast.success(t.admin.productAdded || "Mahsulot muvaffaqiyatli qo'shildi!");
        } catch (error) {
            console.error("Xatolik:", error);
            toast.error(t.common.error + ": " + error.message);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + newProduct.images.length > 4) {
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
                        });
                    };
                    reader.readAsDataURL(file);
                });
            })
        ).then(newImagesData => {
            const currentImages = [...newProduct.images];
            newImagesData.forEach(imgData => {
                currentImages.push({
                    ...imgData,
                    is_primary: currentImages.length === 0
                });
            });
            setNewProduct({ ...newProduct, images: currentImages });
        });
    };

    const handleRemoveImage = (index) => {
        const updatedImages = newProduct.images.filter((_, i) => i !== index);
        // If removed image was primary and there are other images, make first one primary
        if (newProduct.images[index].is_primary && updatedImages.length > 0) {
            updatedImages[0].is_primary = true;
        }
        setNewProduct({ ...newProduct, images: updatedImages });
    };

    const handleStockChange = (productId, newStock) => {
        if (newStock === '') {
            onUpdateProductStock(productId, 0);
            return;
        }
        const stock = parseInt(newStock);
        if (!isNaN(stock) && stock >= 0) {
            onUpdateProductStock(productId, stock);
        }
    };

    // Local input change (for typing)
    const handleStockInputChange = (productId, value) => {
        setStockEditing({ ...stockEditing, [productId]: value });
    };

    // Save on blur or Enter
    const handleStockInputBlur = (productId) => {
        const value = stockEditing[productId];
        if (value !== undefined) {
            handleStockChange(productId, value);
            setStockEditing({ ...stockEditing, [productId]: undefined });
        }
    };

    const handleStockInputKeyPress = (e, productId) => {
        if (e.key === 'Enter') {
            handleStockInputBlur(productId);
            e.target.blur();
        }
    };



    const handleDuplicateProduct = async (product) => {
        if (!(await confirmDialog(t.admin.duplicateConfirm || "Bu mahsulotni nusxalamoqchimisiz?"))) return;

        try {
            await onAddProduct({
                nameUz: product.nameUz,
                nameRu: product.nameRu,
                nameEn: product.nameEn,
                price: product.price,
                categoryId: product.categoryId,
                images: product.images,
                stock: product.stock,
                inStock: product.stock > 0,
                descriptionUz: product.descriptionUz,
                descriptionRu: product.descriptionRu,
                descriptionEn: product.descriptionEn,
                discount: product.discount,
                unit: product.unit || 'piece'
            });
            toast.success(t.admin.productDuplicated || "Mahsulot muvaffaqiyatli nusxalandi!");
        } catch (error) {
            console.error("Nusxalashda xatolik:", error);
            toast.error(t.common.error);
        }
    };

    // Rol asosida ruxsatlarni aniqlash
    const userRole = currentUser?.role || 'user';

    // Har bir rol uchun ruxsat berilgan tablar
    const allowedTabs = {
        'moderator': ['products', 'categories', 'banners', 'reviews', 'settings'],
        'admin': ['users', 'products', 'categories', 'banners', 'reviews', 'statistics', 'settings'],
        'super_admin': ['users', 'products', 'categories', 'banners', 'reviews', 'statistics', 'settings']
    };

    const allTabs = [
        { id: 'users', name: t.admin.users, icon: '👥' },
        { id: 'products', name: t.admin.products, icon: '📦' },
        { id: 'categories', name: t.admin.categories, icon: '📁' },
        { id: 'banners', name: t.admin.banners, icon: '🎨' },
        { id: 'reviews', name: t.admin.reviews, icon: '💬' },
        { id: 'statistics', name: t.admin.statistics, icon: '📊' },
        { id: 'settings', name: t.admin.settings, icon: '⚙️' },
    ];

    // Foydalanuvchi roli uchun ruxsat berilgan tablarni filtrlash
    const tabs = allTabs.filter(tab => allowedTabs[userRole]?.includes(tab.id));

    // Agar hozirgi tab ruxsat berilmagan bo'lsa, birinchi ruxsat berilgan tabga o'tish
    React.useEffect(() => {
        if (!allowedTabs[userRole]?.includes(activeTab)) {
            const firstAllowedTab = allTabs.find(tab => allowedTabs[userRole]?.includes(tab.id));
            if (firstAllowedTab && activeTab !== firstAllowedTab.id) {
                setActiveTab(firstAllowedTab.id);
            }
        }
    }, [userRole]);

    const bannerFormData = editingBanner || newBanner;
    const setBannerFormData = (data) => {
        if (editingBanner) setEditingBanner(data);
        else setNewBanner(data);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">{t.navbar.adminPanel}</h2>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-lg mb-6 overflow-x-auto">
                    <div className="flex border-b">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary bg-red-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {t.admin.registeredUsers} ({users.length})
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.name}</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.email}</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.date}</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.status}</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.actions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.email} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{user.firstName} {user.lastName}</td>
                                            <td className="py-3 px-4">{user.email}</td>
                                            <td className="py-3 px-4">
                                                {new Date(user.registeredAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => onUpdateUserRole(user.email, e.target.value)}
                                                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                                    disabled={
                                                        // O'z rolini o'zgartira olmaydi
                                                        user.email === currentUser?.email ||
                                                        // Admin super_admin rolini o'zgartira olmaydi
                                                        (userRole === 'admin' && user.role === 'super_admin')
                                                    }
                                                >
                                                    <option value="user">User</option>
                                                    {/* Admin faqat moderator qila oladi */}
                                                    {(userRole === 'admin' || userRole === 'super_admin') && (
                                                        <option value="moderator">Moderator</option>
                                                    )}
                                                    {/* Faqat super_admin admin qila oladi */}
                                                    {userRole === 'super_admin' && (
                                                        <>
                                                            <option value="admin">Admin</option>
                                                            <option value="super_admin">Super Admin</option>
                                                        </>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => setPasswordData({ userId: user.email, newPassword: '' })}
                                                    className="p-2 text-primary hover:bg-red-50 rounded-lg transition"
                                                    title={t.admin.changePassword}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Password Change Modal Overlay */}
                        {passwordData.userId && (
                            <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">{t.admin.changePassword}</h3>
                                        <button
                                            onClick={() => setPasswordData({ userId: null, newPassword: '' })}
                                            className="text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">{passwordData.userId}</p>
                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.newPassword}</label>
                                            <input
                                                type="text"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:outline-none transition-all"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPasswordData({ userId: null, newPassword: '' })}
                                                className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                            >
                                                {t.admin.cancel}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isPasswordChanging}
                                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 disabled:opacity-50"
                                            >
                                                {isPasswordChanging ? '...' : t.admin.save}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        {/* Add Product Form */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {t.admin.addProduct}
                            </h3>
                            <form onSubmit={handleAddProduct} className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        value={newProduct.nameUz}
                                        onChange={(e) => setNewProduct({ ...newProduct, nameUz: e.target.value })}
                                        placeholder={t.admin.productName + " (UZ)"}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="text"
                                        value={newProduct.nameRu}
                                        onChange={(e) => setNewProduct({ ...newProduct, nameRu: e.target.value })}
                                        placeholder={t.admin.productName + " (RU)"}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="text"
                                        value={newProduct.nameEn}
                                        onChange={(e) => setNewProduct({ ...newProduct, nameEn: e.target.value })}
                                        placeholder={t.admin.productName + " (EN)"}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <input
                                    type="number"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    placeholder={t.admin.price + " (" + t.product.som + ")"}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <select
                                    value={newProduct.categoryId}
                                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">{t.catalog.allCategories}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.admin.stock} *
                                        </label>
                                        <input
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            placeholder={t.admin.stock}
                                            min="0"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.admin.unit}
                                        </label>
                                        <select
                                            value={newProduct.unit}
                                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="piece">{t.admin.units.piece}</option>
                                            <option value="kg">{t.admin.units.kg}</option>
                                            <option value="gr">{t.admin.units.gr}</option>
                                            <option value="ml">{t.admin.units.ml}</option>
                                            <option value="litr">{t.admin.units.litr}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t.admin.image} (max 4)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={newProduct.images.length >= 4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {newProduct.images.length}/4 {t.admin.image.toLowerCase()}
                                    </p>

                                    {newProduct.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {newProduct.images.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={img.url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    {img.is_primary && (
                                                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                                                            {t.admin.primary || "Asosiy"}
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.admin.description} ({t.common.optional})
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <textarea
                                            value={newProduct.descriptionUz || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, descriptionUz: e.target.value })}
                                            placeholder={t.admin.description + " (UZ)..."}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                                        />
                                        <textarea
                                            value={newProduct.descriptionRu || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, descriptionRu: e.target.value })}
                                            placeholder={t.admin.description + " (RU)..."}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                                        />
                                        <textarea
                                            value={newProduct.descriptionEn || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, descriptionEn: e.target.value })}
                                            placeholder={t.admin.description + " (EN)..."}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.admin.discount} (%) - {t.common.optional}
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.discount || 0}
                                        onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                                        placeholder={t.admin.discount}
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {language === 'uz' ? 'Misol: 20 = 20% chegirma' : language === 'ru' ? 'Пример: 20 = 20% скидка' : 'Example: 20 = 20% discount'}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                >
                                    {t.admin.add}
                                </button>
                            </form>
                        </div>

                        {/* Products List */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {t.admin.allProducts} ({products.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="text"
                                        placeholder={t.common.search}
                                        value={adminProductSearch}
                                        onChange={(e) => setAdminProductSearch(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <select
                                        value={adminCategoryFilter}
                                        onChange={(e) => setAdminCategoryFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="">{t.catalog.allCategories}</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b text-gray-600">
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.image}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.productName}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.price}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.category}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.stock}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.bestSeller}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.discount}</th>
                                            <th className="text-left py-3 px-4 font-semibold">{t.admin.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products
                                            .filter(p => {
                                                const matchesCategory = adminCategoryFilter === '' || Number(p.categoryId) === Number(adminCategoryFilter);
                                                const searchLower = adminProductSearch.toLowerCase();
                                                const matchesSearch = p.nameUz?.toLowerCase().includes(searchLower) ||
                                                    p.nameRu?.toLowerCase().includes(searchLower) ||
                                                    p.nameEn?.toLowerCase().includes(searchLower);
                                                return matchesCategory && (adminProductSearch === '' || matchesSearch);
                                            })
                                            .map((product) => {
                                                const category = categories.find(c => c.id === product.categoryId);
                                                return (
                                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0].url}
                                                                    alt={product.name}
                                                                    className="w-16 h-16 object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-gray-900">
                                                            {product[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || product.name}
                                                        </td>
                                                        <td className="py-3 px-4 text-primary font-bold">{product.price.toLocaleString()} {t.product.som}</td>
                                                        <td className="py-3 px-4">
                                                            <select
                                                                value={product.categoryId || ''}
                                                                onChange={async (e) => {
                                                                    const newCatId = e.target.value;
                                                                    if (await confirmDialog(t.admin.changeCategoryConfirm || "Mahsulot kategoriyasini o'zgartirmoqchimisiz?")) {
                                                                        onUpdateProductCategory(product.id, newCatId);
                                                                    }
                                                                }}
                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary outline-none bg-gray-50 hover:bg-white transition"
                                                            >
                                                                <option value="">{t.admin.uncategorized}</option>
                                                                {categories.map(cat => (
                                                                    <option key={cat.id} value={cat.id}>
                                                                        {cat[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || cat.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-sm font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                                                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {product.stock} {t?.admin?.units?.[product.unit || 'piece'] || product.unit || 'dona'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {product.bestSeller ? (
                                                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">{t.common.yes}</span>
                                                            ) : (
                                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">{t.common.no}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {product.discount > 0 ? (
                                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                                                    {product.discount}%
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setEditingProduct(product)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                                                    title={t.admin.edit}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDuplicateProduct(product)}
                                                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                                                                    title={t.admin.duplicate || "Nusxalash"}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (await confirmDialog(t.common.deleteConfirm)) {
                                                                            onDeleteProduct(product.id);
                                                                        }
                                                                    }}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                                                    title={t.admin.delete}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.admin.addCategory}</h3>
                            <form onSubmit={handleAddCategory} className="flex gap-4">
                                <div className="flex-1">
                                    <div className="grid grid-cols-1 gap-2">
                                        <input
                                            type="text"
                                            value={newCategory.nameUz}
                                            onChange={(e) => setNewCategory({ ...newCategory, nameUz: e.target.value })}
                                            placeholder={t.admin.categoryName + " (UZ)"}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            value={newCategory.nameRu}
                                            onChange={(e) => setNewCategory({ ...newCategory, nameRu: e.target.value })}
                                            placeholder={t.admin.categoryName + " (RU)"}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <input
                                            type="text"
                                            value={newCategory.nameEn}
                                            onChange={(e) => setNewCategory({ ...newCategory, nameEn: e.target.value })}
                                            placeholder={t.admin.categoryName + " (EN)"}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                >
                                    {t.admin.add}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.admin.categories}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map(category => (
                                    <div key={category.id} className="flex flex-col p-4 border border-gray-200 rounded-lg hover:shadow-md transition bg-gray-50/50">
                                        {editingCategory && editingCategory.id === category.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    className="w-full px-3 py-1 text-sm border rounded"
                                                    value={editingCategory.nameUz}
                                                    onChange={e => setEditingCategory({ ...editingCategory, nameUz: e.target.value })}
                                                    placeholder="UZ"
                                                />
                                                <input
                                                    className="w-full px-3 py-1 text-sm border rounded"
                                                    value={editingCategory.nameRu}
                                                    onChange={e => setEditingCategory({ ...editingCategory, nameRu: e.target.value })}
                                                    placeholder="RU"
                                                />
                                                <input
                                                    className="w-full px-3 py-1 text-sm border rounded"
                                                    value={editingCategory.nameEn}
                                                    onChange={e => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                                                    placeholder="EN"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateCategory(category.id)}
                                                        className="flex-1 bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600"
                                                    >
                                                        OK
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCategory(null)}
                                                        className="flex-1 bg-gray-400 text-white text-xs py-1 rounded hover:bg-gray-500"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between mb-3 cursor-pointer group" onClick={() => {
                                                    setAdminCategoryFilter(category.id);
                                                    setActiveTab('products');
                                                }}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-gray-100">
                                                            <i className={`fas ${category.icon || 'fa-folder'}`}></i>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-800 block group-hover:text-primary transition">
                                                                {category[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || category.name}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                                {products.filter(p => Number(p.categoryId) === Number(category.id)).length} {t.admin.productsCount || "ta mahsulot"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-1 border-t pt-3 mt-auto">
                                                    <button
                                                        onClick={() => setEditingCategory({
                                                            id: category.id,
                                                            nameUz: category.nameUz || '',
                                                            nameRu: category.nameRu || '',
                                                            nameEn: category.nameEn || ''
                                                        })}
                                                        className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition"
                                                        title={t.admin.edit}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (await confirmDialog(t.common.deleteConfirm)) {
                                                                onDeleteCategory(category.id);
                                                            }
                                                        }}
                                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                                                        title={t.admin.delete}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Banners Tab */}
                {activeTab === 'banners' && (
                    <>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {editingBanner ? (t.admin.editBanner || "Bannerni tahrirlash") : t.admin.addBanner}
                                    </h3>
                                    <form onSubmit={editingBanner ? handleUpdateBanner : handleAddBanner} className="space-y-4">
                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.image}</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleBannerImageUpload}
                                                    className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-primary file:text-white
                                                        hover:file:bg-red-700
                                                    "
                                                    required={!bannerFormData.image}
                                                />
                                                {bannerFormData.image && (
                                                    <img
                                                        src={bannerFormData.image}
                                                        alt="Preview"
                                                        className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Titles */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.title}</label>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={bannerFormData.titleUz || ''}
                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, titleUz: e.target.value })}
                                                    placeholder={t.admin.title + " (UZ)"}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <input
                                                    type="text"
                                                    value={bannerFormData.titleRu || ''}
                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, titleRu: e.target.value })}
                                                    placeholder={t.admin.title + " (RU)"}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                                <input
                                                    type="text"
                                                    value={bannerFormData.titleEn || ''}
                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, titleEn: e.target.value })}
                                                    placeholder={t.admin.title + " (EN)"}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>

                                        {/* Descriptions */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.description}</label>
                                            <div className="space-y-2">
                                                <textarea
                                                    value={bannerFormData.descriptionUz || ''}
                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, descriptionUz: e.target.value })}
                                                    placeholder={t.admin.description + " (UZ)"}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                                                />
                                                <textarea
                                                    value={bannerFormData.descriptionRu || ''}
                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, descriptionRu: e.target.value })}
                                                    placeholder={t.admin.description + " (RU)"}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                                                />
                                                <textarea
                                                    value={bannerFormData.descriptionEn || ''}
                                                    onChange={(e) => setBannerFormData({ ...bannerFormData, descriptionEn: e.target.value })}
                                                    placeholder={t.admin.description + " (EN)"}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Button Text and Link type */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.buttonText}</label>
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={bannerFormData.buttonTextUz || ''}
                                                        onChange={(e) => setBannerFormData({ ...bannerFormData, buttonTextUz: e.target.value })}
                                                        placeholder={t.admin.buttonText + " (UZ)"}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={bannerFormData.buttonTextRu || ''}
                                                        onChange={(e) => setBannerFormData({ ...bannerFormData, buttonTextRu: e.target.value })}
                                                        placeholder={t.admin.buttonText + " (RU)"}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={bannerFormData.buttonTextEn || ''}
                                                        onChange={(e) => setBannerFormData({ ...bannerFormData, buttonTextEn: e.target.value })}
                                                        placeholder={t.admin.buttonText + " (EN)"}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.linkType}</label>
                                                <div className="flex flex-wrap gap-4 mb-3">
                                                    {['category', 'product', 'custom'].map(type => (
                                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="linkType"
                                                                value={type}
                                                                checked={bannerLinkType === type}
                                                                onChange={() => setBannerLinkType(type)}
                                                                className="text-primary focus:ring-primary"
                                                            />
                                                            <span className="text-gray-700">
                                                                {t.admin.bannerLinkTypes?.[type] || (type === 'category' ? "Kategoriya" : type === 'product' ? "Mahsulot" : "Boshqa")}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {bannerLinkType === 'category' && (
                                                    <select
                                                        value={bannerSelectedCategory}
                                                        onChange={(e) => setBannerSelectedCategory(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    >
                                                        <option value="">{t.admin.selectCategory || "Kategoriyani tanlang..."}</option>
                                                        {categories.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                {c[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {bannerLinkType === 'product' && (
                                                    <div className="space-y-3">
                                                        <select
                                                            value={bannerSelectedCategory}
                                                            onChange={(e) => setBannerSelectedCategory(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="">{t.admin.selectCategoryToFilter || "Kategoriyani tanlang (filtrlash uchun)..."}</option>
                                                            {categories.map(c => (
                                                                <option key={c.id} value={c.id}>
                                                                    {c[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            value={bannerSelectedProduct}
                                                            onChange={(e) => setBannerSelectedProduct(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="">{t.admin.selectProduct || "Mahsulotni tanlang..."}</option>
                                                            {products
                                                                .filter(p => !bannerSelectedCategory || p.categoryId === parseInt(bannerSelectedCategory))
                                                                .map(p => (
                                                                    <option key={p.id} value={p.id}>
                                                                        {p[`name${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || p.name}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                )}

                                                {bannerLinkType === 'custom' && (
                                                    <input
                                                        type="text"
                                                        value={bannerFormData.link || ''}
                                                        onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                                                        placeholder="URL (masalan: /catalog?discount=true)"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                            >
                                                {editingBanner ? t.admin.save : t.admin.add}
                                            </button>
                                            {editingBanner && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingBanner(null)}
                                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                                                >
                                                    {t.admin.cancel}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.admin.banners}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {carouselItems && carouselItems.map(banner => (
                                            <div key={banner.id} className="relative group rounded-xl overflow-hidden shadow-md">
                                                <img
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingBanner({ ...banner });
                                                            setBannerLinkType('custom');
                                                        }}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                                    >
                                                        {t.admin.edit}
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (await confirmDialog(t.common.deleteConfirm)) {
                                                                onDeleteCarouselItem(banner.id);
                                                            }
                                                        }}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                                    >
                                                        {t.admin.delete}
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                    <h4 className="font-bold text-lg">
                                                        {banner[`title${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || banner.title}
                                                    </h4>
                                                    <p className="text-sm opacity-90">
                                                        {banner[`description${language === 'uz' ? 'Uz' : language === 'ru' ? 'Ru' : 'En'}`] || banner.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.admin.reviews}</h3>
                        {!reviews || reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">{t.productModal.noReviews}</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => {
                                    const productName = Array.isArray(review.products)
                                        ? review.products[0]?.name
                                        : review.products?.name;

                                    return (
                                        <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-800">{review.user_name}</h4>
                                                        {review.user_email && (
                                                            <span className="text-sm text-gray-500">({review.user_email})</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium text-gray-700">{t.admin.product || "Mahsulot"}:</span>
                                                        <span className="text-sm text-gray-600">{productName || t.admin.unknown || 'Noma\'lum'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-700">{t.admin.rating || "Baho"}:</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <svg
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">({review.rating}/5)</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (await confirmDialog(`"${review.user_name}" ${t.common.deleteConfirm}`)) {
                                                            onDeleteReview(review.id);
                                                        }
                                                    }}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm font-medium flex-shrink-0"
                                                >
                                                    {t.admin.delete}
                                                </button>
                                            </div>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(review.created_at).toLocaleString('uz-UZ', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Statistics Tab */}
                {
                    activeTab === 'statistics' && (
                        <div className="space-y-6">
                            {/* Overview Cards */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">{t.admin.totalVisits}</p>
                                            <h3 className="text-3xl font-bold mt-2">{visitStats.totalVisits}</h3>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm font-medium">{t.admin.uniqueVisitors}</p>
                                            <h3 className="text-3xl font-bold mt-2">{visitStats.uniqueVisitors.length}</h3>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">{t.admin.pageViews}</p>
                                            <h3 className="text-3xl font-bold mt-2">{visitStats.pageViews.length}</h3>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-lg">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Page Views Chart */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    {t.admin.mostViewed}
                                </h3>
                                {visitStats.pageViews.length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(
                                            visitStats.pageViews.reduce((acc, view) => {
                                                acc[view.path] = (acc[view.path] || 0) + 1;
                                                return acc;
                                            }, {})
                                        )
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 10)
                                            .map(([path, count]) => {
                                                const maxCount = Math.max(...Object.values(
                                                    visitStats.pageViews.reduce((acc, view) => {
                                                        acc[view.path] = (acc[view.path] || 0) + 1;
                                                        return acc;
                                                    }, {})
                                                ));
                                                return (
                                                    <div key={path} className="flex items-center gap-4">
                                                        <span className="w-40 text-sm text-gray-600 truncate">{path || '/'}</span>
                                                        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                                                            <div
                                                                className="bg-primary h-8 flex items-center justify-end px-3 text-white font-semibold text-sm transition-all"
                                                                style={{ width: `${(count / maxCount) * 100}%`, minWidth: '40px' }}
                                                            >
                                                                {count}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">{t.admin.noData || "Hali ma'lumotlar yo'q"}</p>
                                )}
                            </div>

                            {/* Recent Visitors */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    {t.admin.recentVisitors}
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Session ID</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.firstVisit || "Birinchi Tashrif"}</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.admin.pageCount || "Sahifalar Soni"}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visitStats.uniqueVisitors.slice(-10).reverse().map((visitor) => {
                                                const visitorPageViews = visitStats.pageViews.filter(
                                                    pv => pv.sessionId === visitor.sessionId
                                                ).length;
                                                return (
                                                    <tr key={visitor.sessionId} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-mono text-sm">{visitor.sessionId.substring(0, 16)}...</td>
                                                        <td className="py-3 px-4">{new Date(visitor.firstVisit).toLocaleString()}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold">
                                                                {visitorPageViews}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Settings Tab */}
                {
                    activeTab === 'settings' && (
                        <div className="max-w-md mx-auto">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">{t.admin.settings}</h3>
                                    <p className="text-gray-500 mt-2">{currentUser?.email}</p>
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const newPassword = e.target.newPassword.value;
                                        if (newPassword) {
                                            handlePasswordChange(null, currentUser.email, newPassword);
                                            e.target.reset();
                                        }
                                    }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.admin.changePassword} ({t.admin.newPassword})
                                        </label>
                                        <input
                                            name="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:outline-none transition-all text-lg"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPasswordChanging}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                                    >
                                        {isPasswordChanging ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                </svg>
                                                {t.admin.save}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Product Edit Modal */}
            {
                editingProduct && (
                    <ProductEditModal
                        product={editingProduct}
                        categories={categories}
                        onSave={async (productId, data) => {
                            try {
                                const uploadedImages = await Promise.all(data.images.map(async (img) => {
                                    if (img.file) {
                                        const publicUrl = await uploadImage(img.file);
                                        return { url: publicUrl, is_primary: img.is_primary };
                                    }
                                    // Make sure we only save the data, not the file object
                                    return { url: img.url, is_primary: img.is_primary };
                                }));
                                await onUpdateProduct(productId, { ...data, images: uploadedImages });
                                setEditingProduct(null);
                                toast.success(t.admin.productUpdated || "Mahsulot muvaffaqiyatli tahrirlandi!");
                            } catch (error) {
                                console.error("Tahrirlashda xatolik tafsilotlari:", error);
                                let errorMsg = error.message || t.admin.unknown || "Noma'lum xato";
                                if (error.details) errorMsg += "\n" + (t.admin.details || "Details") + ": " + error.details;
                                if (error.hint) errorMsg += "\nHint: " + error.hint;
                                if (error.code) errorMsg += "\nCode: " + error.code;

                                // To'liq obyektni ko'rish uchun
                                const fullError = JSON.stringify(error, null, 2);
                                toast.error((t.admin.errorDetails || "Xatolik tafsilotlari") + ":\n" + errorMsg + "\n\n" + (t.admin.fullError || "To'liq xato") + ":\n" + fullError);
                            }
                        }}
                        onClose={() => setEditingProduct(null)}
                    />
                )
            }
        </div >
    );
};

export default AdminPanel;
