import axios from 'axios';
import { supabase } from '../supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Helper: Upload image to Supabase Storage (Keeping this as is because MongoDB is not for file storage)
export const uploadImage = async (file, bucket = 'products') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) {
        if (error.message === 'Bucket not found') {
            throw new Error(`Supabase-da '${bucket}' nomli bucket topilmadi. Iltimos, Supabase Dashboard → Storage bo'limida '${bucket}' nomli public bucket yarating.`);
        }
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
};

// Converters (same as before but some might not be needed if DB returns them correctly)
// We will still keep them to ensure camelCase mapping works seamlessly.
const convertProductToCamelCase = (product) => {
    if (!product) return null;
    return {
        ...product,
        id: product.id,
        categoryId: product.category_id || product.categoryId,
        stock: product.stock,
        inStock: (product.stock !== undefined && product.stock !== null) ? (product.stock > 0) : true,
        price: product.price,
        images: product.images || (product.image ? [{ url: product.image, is_primary: true }] : []),
        discount: product.discount || 0,
        bestSeller: product.best_seller || product.bestSeller || false,
        unit: product.unit || 'piece',
        nameUz: product.name_uz || product.nameUz || product.name || '',
        nameRu: product.name_ru || product.nameRu || product.name || '',
        nameEn: product.name_en || product.nameEn || product.name || '',
        descriptionUz: product.description_uz || product.descriptionUz || product.description || '',
        descriptionRu: product.description_ru || product.descriptionRu || product.description || '',
        descriptionEn: product.description_en || product.descriptionEn || product.description || ''
    };
};

const convertCategoryToCamelCase = (category) => ({
    ...category,
    nameUz: category.name_uz || category.name,
    nameRu: category.name_ru || category.name,
    nameEn: category.name_en || category.name
});

const convertCarouselItemToCamelCase = (item) => ({
    ...item,
    buttonText: item.button_text,
    titleUz: item.title_uz || item.title,
    titleRu: item.title_ru || item.title,
    titleEn: item.title_en || item.title,
    descriptionUz: item.description_uz || item.description,
    descriptionRu: item.description_ru || item.description,
    descriptionEn: item.description_en || item.description,
    buttonTextUz: item.button_text_uz || item.button_text,
    buttonTextRu: item.button_text_ru || item.button_text,
    buttonTextEn: item.button_text_en || item.button_text
});

const convertUserToCamelCase = (user) => ({
    ...user,
    firstName: user.first_name,
    lastName: user.last_name,
    registeredAt: user.created_at
});


// ==================== USER API ====================

export const registerUser = async (userData) => {
    const res = await api.post('/users/register', userData);
    return convertUserToCamelCase(res.data[0]);
};

export const loginUser = async (email, password) => {
    try {
        const res = await api.post('/users/login', { email, password });
        return convertUserToCamelCase(res.data);
    } catch (error) {
        throw new Error('Invalid credentials');
    }
};

export const getAllUsers = async () => {
    const res = await api.get('/users');
    return res.data.map(convertUserToCamelCase);
};

export const updateUserRole = async (email, role) => {
    const res = await api.put('/users/role', { email, role });
    return convertUserToCamelCase(res.data[0]);
};

export const updateUserPassword = async (email, newPassword) => {
    const res = await api.put('/users/password', { email, password: newPassword });
    return convertUserToCamelCase(res.data[0]);
};

// ==================== CATEGORY API ====================

export const getAllCategories = async () => {
    const res = await api.get('/categories');
    return res.data;
};

export const addCategory = async (categoryData) => {
    let insertData = {};

    if (typeof categoryData === 'string') {
        insertData = { name: categoryData, name_uz: categoryData };
    } else {
        const nameFallback = categoryData.nameUz || categoryData.nameRu || categoryData.nameEn || 'No Name';
        insertData = {
            name: nameFallback,
            name_uz: categoryData.nameUz || null,
            name_ru: categoryData.nameRu || null,
            name_en: categoryData.nameEn || null
        };
    }
    const res = await api.post('/categories', insertData);
    return convertCategoryToCamelCase(res.data);
};

export const updateCategory = async (categoryId, categoryData) => {
    const nameFallback = categoryData.nameUz || categoryData.nameRu || categoryData.nameEn || 'No Name';
    const updateData = {
        name: nameFallback,
        name_uz: categoryData.nameUz || null,
        name_ru: categoryData.nameRu || null,
        name_en: categoryData.nameEn || null
    };

    const res = await api.put(`/categories/${categoryId}`, updateData);
    return convertCategoryToCamelCase(res.data);
};

export const deleteCategory = async (categoryId) => {
    await api.delete(`/categories/${categoryId}`);
};

// ==================== PRODUCT API ====================

export const getAllProducts = async () => {
    const res = await api.get('/products');
    return res.data.map(convertProductToCamelCase);
};

export const addProduct = async (productData) => {
    const insertFields = {
        name: productData.nameUz || productData.name,
        name_uz: productData.nameUz,
        name_ru: productData.nameRu,
        name_en: productData.nameEn,
        price: Number(productData.price),
        category_id: Number(productData.categoryId),
        images: productData.images || [],
        stock: Number(productData.stock),
        description: productData.descriptionUz || productData.description,
        description_uz: productData.descriptionUz,
        description_ru: productData.descriptionRu,
        description_en: productData.descriptionEn,
        discount: Number(productData.discount || 0),
        unit: productData.unit || 'piece'
    };

    const res = await api.post('/products', insertFields);
    return convertProductToCamelCase(res.data);
};

export const updateProductStock = async (productId, stock) => {
    const res = await api.put(`/products/${productId}`, { stock });
    return convertProductToCamelCase(res.data);
};

export const updateProductCategory = async (productId, categoryId) => {
    const res = await api.put(`/products/${productId}`, { category_id: categoryId });
    return convertProductToCamelCase(res.data);
};

export const deleteProduct = async (productId) => {
    await api.delete(`/products/${productId}`);
};

export const updateProduct = async (productId, productData) => {
    const updateFields = {};
    if (productData.nameUz !== undefined) { updateFields.name_uz = productData.nameUz; updateFields.name = productData.nameUz; }
    if (productData.nameRu !== undefined) updateFields.name_ru = productData.nameRu;
    if (productData.nameEn !== undefined) updateFields.name_en = productData.nameEn;
    if (productData.descriptionUz !== undefined) { updateFields.description_uz = productData.descriptionUz; updateFields.description = productData.descriptionUz; }
    if (productData.descriptionRu !== undefined) updateFields.description_ru = productData.descriptionRu;
    if (productData.descriptionEn !== undefined) updateFields.description_en = productData.descriptionEn;
    if (productData.price !== undefined) updateFields.price = Number(productData.price);
    if (productData.categoryId !== undefined) updateFields.category_id = Number(productData.categoryId);
    if (productData.images !== undefined) updateFields.images = productData.images;
    if (productData.stock !== undefined) updateFields.stock = Number(productData.stock);
    if (productData.discount !== undefined) updateFields.discount = Number(productData.discount);
    if (productData.unit !== undefined) updateFields.unit = productData.unit;
    if (productData.bestSeller !== undefined) updateFields.best_seller = Boolean(productData.bestSeller);

    const res = await api.put(`/products/${productId}`, updateFields);
    return convertProductToCamelCase(res.data);
};


// ==================== CAROUSEL API ====================

export const getAllCarouselItems = async () => {
    const res = await api.get('/carousel');
    return res.data.map(convertCarouselItemToCamelCase);
};

export const addCarouselItem = async (itemData) => {
    const data = {
        title: itemData.titleUz || itemData.titleRu || itemData.titleEn || 'No Title',
        description: itemData.descriptionUz || itemData.descriptionRu || itemData.descriptionEn || '',
        image: itemData.image,
        button_text: itemData.buttonTextUz || itemData.buttonTextRu || itemData.buttonTextEn || 'Click',
        link: itemData.link,
        title_uz: itemData.titleUz || null,
        title_ru: itemData.titleRu || null,
        title_en: itemData.titleEn || null,
        description_uz: itemData.descriptionUz || null,
        description_ru: itemData.descriptionRu || null,
        description_en: itemData.descriptionEn || null,
        button_text_uz: itemData.buttonTextUz || null,
        button_text_ru: itemData.buttonTextRu || null,
        button_text_en: itemData.buttonTextEn || null
    };
    const res = await api.post('/carousel', data);
    return convertCarouselItemToCamelCase(res.data);
};

export const deleteCarouselItem = async (itemId) => {
    await api.delete(`/carousel/${itemId}`);
};

export const updateCarouselItem = async (itemId, itemData) => {
    const updateData = {
        title: itemData.titleUz || itemData.titleRu || itemData.titleEn || 'No Title',
        description: itemData.descriptionUz || itemData.descriptionRu || itemData.descriptionEn || '',
        image: itemData.image,
        button_text: itemData.buttonTextUz || itemData.buttonTextRu || itemData.buttonTextEn || 'Click',
        link: itemData.link,
        title_uz: itemData.titleUz || null,
        title_ru: itemData.titleRu || null,
        title_en: itemData.titleEn || null,
        description_uz: itemData.descriptionUz || null,
        description_ru: itemData.descriptionRu || null,
        description_en: itemData.descriptionEn || null,
        button_text_uz: itemData.buttonTextUz || null,
        button_text_ru: itemData.buttonTextRu || null,
        button_text_en: itemData.buttonTextEn || null
    };
    const res = await api.put(`/carousel/${itemId}`, updateData);
    return convertCarouselItemToCamelCase(res.data);
};

// ==================== VISIT STATS API ====================

export const trackVisit = async (sessionId, path) => {
    try {
        await api.post('/visit_stats', { session_id: sessionId, path });
    } catch (error) {
        console.error('Visit tracking error:', error);
    }
};

export const getVisitStats = async () => {
    const res = await api.get('/visit_stats');
    const data = res.data;

    const uniqueSessions = {};
    data.forEach(visit => {
        if (!uniqueSessions[visit.session_id]) {
            uniqueSessions[visit.session_id] = {
                sessionId: visit.session_id,
                firstVisit: visit.timestamp
            };
        } else {
            if (new Date(visit.timestamp) < new Date(uniqueSessions[visit.session_id].firstVisit)) {
                uniqueSessions[visit.session_id].firstVisit = visit.timestamp;
            }
        }
    });

    const uniqueVisitorsArray = Object.values(uniqueSessions);

    return {
        totalVisits: data.length,
        uniqueVisitors: uniqueVisitorsArray,
        pageViews: data
    };
};

// ==================== REVIEWS API ====================

export const getProductReviews = async (productId) => {
    const res = await api.get(`/reviews/product/${productId}`);
    return res.data;
};

export const getAllReviews = async () => {
    const res = await api.get('/reviews');
    return res.data;
};

export const getReviewSummaries = async () => {
    try {
        const res = await api.get('/reviews/summary');
        return res.data;
    } catch (error) {
        console.warn('Falling back to full reviews for summaries:', error);
        const reviews = await getAllReviews();
        const summaryMap = new Map();

        reviews.forEach((review) => {
            const productId = Number(review.product_id);
            const current = summaryMap.get(productId) || { product_id: productId, reviewCount: 0, ratingTotal: 0 };
            current.reviewCount += 1;
            current.ratingTotal += Number(review.rating) || 0;
            summaryMap.set(productId, current);
        });

        return Array.from(summaryMap.values()).map((summary) => ({
            product_id: summary.product_id,
            reviewCount: summary.reviewCount,
            rating: summary.reviewCount > 0 ? summary.ratingTotal / summary.reviewCount : 0
        }));
    }
};

export const addReview = async (reviewData) => {
    const res = await api.post('/reviews', {
        product_id: reviewData.productId,
        user_name: reviewData.userName,
        user_email: reviewData.userEmail || null,
        rating: reviewData.rating,
        comment: reviewData.comment
    });
    return res.data;
};

export const deleteReview = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
};

export const getAverageRating = async (productId) => {
    const reviews = await getProductReviews(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
};

// ==================== BEST SELLER API ====================

export const updateProductBestSeller = async (productId, isBestSeller) => {
    const res = await api.put(`/products/${productId}`, { best_seller: isBestSeller });
    return convertProductToCamelCase(res.data);
};

export const getBestSellers = async () => {
    const products = await getAllProducts();
    return products.filter(p => p.bestSeller);
};

//  ==================== DISCOUNT API ====================

export const getDiscountedProducts = async () => {
    const products = await getAllProducts();
    return products.filter(p => p.discount > 0).sort((a, b) => b.discount - a.discount);
};

export const updateProductDiscount = async (productId, discount) => {
    const res = await api.put(`/products/${productId}`, { discount });
    return convertProductToCamelCase(res.data);
};
