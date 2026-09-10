import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as api from './api/supabaseApi';
import { hashPassword } from './utils/passwordUtils';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './components/Landing';
import Catalog from './components/Catalog';
import Favourites from './components/Favourites';
import Cart from './components/Cart';
import Login from './components/Login';
import About from './components/About';
import Contact from './components/Contact';
import { toast } from 'react-toastify';

const AdminPanel = lazy(() => import('./components/AdminPanel'));

const buildReviewSummaries = (reviewList) => {
  const summaryMap = new Map();

  reviewList.forEach((review) => {
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
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [cart, setCart] = useState([]);
  const [visitStats, setVisitStats] = useState({
    totalVisits: 0,
    uniqueVisitors: [],
    pageViews: []
  });
  const [reviews, setReviews] = useState([]);
  const [reviewSummaries, setReviewSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminDataLoaded, setAdminDataLoaded] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    // Load user from localStorage (session)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Saved user is invalid:', error);
        localStorage.removeItem('currentUser');
      }
    }

    // Load favourites from localStorage
    const savedFavourites = localStorage.getItem('favourites');
    if (savedFavourites) setFavourites(JSON.parse(savedFavourites));

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Saved cart is invalid:', error);
        localStorage.removeItem('cart');
      }
    }

    loadPublicData();
  }, []);

  useEffect(() => {
    const allowedRoles = ['moderator', 'admin', 'super_admin'];
    const shouldLoadAdminData =
      location.pathname === '/admin' &&
      currentUser &&
      allowedRoles.includes(currentUser.role) &&
      !adminDataLoaded;

    if (shouldLoadAdminData) {
      loadAdminData();
    }
  }, [adminDataLoaded, currentUser, location.pathname]);

  useEffect(() => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Handle Capacitor native back button & status bar
  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#1e293b' }).catch(() => {});
    } catch (e) {
      // Non-native fallback
    }

    let backListener;
    try {
      backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname === '/' || location.pathname === '' || !canGoBack) {
          CapApp.exitApp();
        } else {
          navigate(-1);
        }
      });
    } catch (e) {
      // Non-native fallback
    }

    return () => {
      if (backListener) {
        backListener.then((handler) => handler && handler.remove && handler.remove()).catch(() => {});
      }
    };
  }, [location.pathname, navigate]);

  // Load only storefront data on initial page load.
  const loadPublicData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, carouselData] = await Promise.all([
        api.getAllCategories(),
        api.getAllProducts(),
        api.getAllCarouselItems()
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setCarouselItems(carouselData);

      try {
        const reviewSummariesData = await api.getReviewSummaries();
        setReviewSummaries(reviewSummariesData);
      } catch (summaryError) {
        console.warn('Review summaries failed to load:', summaryError);
        setReviewSummaries([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load heavier/sensitive data only after an admin opens the admin panel.
  const loadAdminData = async () => {
    try {
      const [usersData, statsData, reviewsData] = await Promise.all([
        api.getAllUsers(),
        api.getVisitStats(),
        api.getAllReviews()
      ]);

      setUsers(usersData);
      setVisitStats(statsData);
      setReviews(reviewsData);
      setAdminDataLoaded(true);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Handle login/register
  const handleLogin = async (formData, isRegister) => {
    try {
      if (isRegister) {
        const newUser = await api.registerUser({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: hashPassword(formData.password)
        });

        setCurrentUser(newUser);
        setAdminDataLoaded(false);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        navigate('/');
        return true;
      } else {
        const user = await api.loginUser(formData.email, hashPassword(formData.password));
        setCurrentUser(user);
        setAdminDataLoaded(false);
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/');
        return true;
      }
    } catch (error) {
      console.error('Login/Register error:', error);
      return false;
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUsers([]);
    setVisitStats({
      totalVisits: 0,
      uniqueVisitors: [],
      pageViews: []
    });
    setAdminDataLoaded(false);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  // Navigate
  const handleNavigate = (page) => {
    navigate('/' + page);
  };
  // Toggle favourite
  const handleToggleFavourite = (productId) => {
    if (favourites.includes(productId)) {
      setFavourites(favourites.filter(id => id !== productId));
    } else {
      setFavourites([...favourites, productId]);
    }
  };

  const isWeightProduct = (product) => ['kg', 'gr'].includes(product?.unit);

  const handleAddToCart = (productId) => {
    const product = products.find((item) => Number(item.id) === Number(productId));
    if (!product || product.inStock === false) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => Number(item.productId) === Number(productId));

      if (existingItem) {
        return currentCart.map((item) =>
          Number(item.productId) === Number(productId)
            ? { ...item, quantity: isWeightProduct(product) ? item.quantity : item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, {
        productId: product.id,
        quantity: 1,
        amountGrams: isWeightProduct(product) ? 100 : undefined
      }];
    });

    toast.success("Mahsulot savatchaga qo'shildi!");
  };

  const handleUpdateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => Number(item.productId) !== Number(productId)));
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        Number(item.productId) === Number(productId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => Number(item.productId) !== Number(productId)));
  };

  const handleUpdateCartAmountGrams = (productId, amountGrams) => {
    const safeAmount = Math.max(1, Number(amountGrams) || 1);

    setCart((currentCart) =>
      currentCart.map((item) =>
        Number(item.productId) === Number(productId)
          ? { ...item, amountGrams: safeAmount, quantity: 1 }
          : item
      )
    );
  };

  const handleSubmitOrder = async (orderData) => {
    const result = await api.createOrder(orderData);
    setCart([]);
    toast.success("Buyurtma yuborildi! Tez orada siz bilan bog'lanamiz.");
    return result;
  };

  const handleAddCategory = async (name) => {
    const newCategory = await api.addCategory(name);
    setCategories([...categories, newCategory]);
  };

  const handleDeleteCategory = async (categoryId) => {
    await api.deleteCategory(categoryId);
    setCategories(categories.filter(c => c.id !== categoryId));
  };

  const handleAddProduct = async (productData) => {
    const newProduct = await api.addProduct(productData);
    setProducts([...products, newProduct]);
  };

  // Admin: Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Admin: Update product stock
  const handleUpdateProductStock = async (productId, newStock) => {
    try {
      const updatedProduct = await api.updateProductStock(productId, newStock);
      setProducts(products.map(product =>
        product.id === productId ? updatedProduct : product
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  // Admin: Update user role
  const handleUpdateUserRole = async (email, role) => {
    try {
      await api.updateUserRole(email, role);
      setUsers(users.map(user =>
        user.email === email ? { ...user, role } : user
      ));

      // Update current user if it's them
      if (currentUser && currentUser.email === email) {
        const updatedUser = { ...currentUser, role };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Admin: Update product category
  const handleUpdateProductCategory = async (productId, newCategoryId) => {
    try {
      const updatedProduct = await api.updateProductCategory(productId, newCategoryId);
      setProducts(products.map(product =>
        product.id === productId ? updatedProduct : product
      ));
    } catch (error) {
      console.error('Error updating product category:', error);
    }
  };

  // Admin: Add carousel item
  const handleAddCarouselItem = async (item) => {
    try {
      const newItem = await api.addCarouselItem(item);
      setCarouselItems([...carouselItems, newItem]);
    } catch (error) {
      console.error('Error adding carousel item:', error);
      throw error; // Rethrow to let UI handle it
    }
  };

  // Admin: Delete carousel item
  const handleDeleteCarouselItem = async (id) => {
    try {
      await api.deleteCarouselItem(id);
      setCarouselItems(carouselItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting carousel item:', error);
    }
  };

  // Admin: Update carousel item
  const handleUpdateCarouselItem = async (itemId, itemData) => {
    try {
      const updatedItem = await api.updateCarouselItem(itemId, itemData);
      setCarouselItems(carouselItems.map(item =>
        item.id === itemId ? updatedItem : item
      ));
    } catch (error) {
      console.error('Error updating carousel item:', error);
      throw error;
    }
  };

  // Admin: Update product best seller status
  const handleUpdateProductBestSeller = async (productId, isBestSeller) => {
    try {
      const updatedProduct = await api.updateProductBestSeller(productId, isBestSeller);
      setProducts(products.map(product =>
        product.id === productId ? updatedProduct : product
      ));
    } catch (error) {
      console.error('Error updating best seller:', error);
    }
  };

  const handleUpdateProduct = async (productId, productData) => {
    try {
      const updatedProduct = await api.updateProduct(productId, productData);
      if (updatedProduct) {
        console.log('App.jsx: Updated product:', updatedProduct);
        const numericId = Number(productId);
        setProducts(prevProducts => prevProducts.map(p =>
          Number(p.id) === numericId ? updatedProduct : p
        ));
        // Bazadan yangi ma'lumotlarni qaytadan yuklash
        await loadPublicData();
      }
    } catch (error) {
      console.error('App.jsx update error:', error);
      throw error;
    }
  };

  // Admin: Update category
  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      const updatedCategory = await api.updateCategory(categoryId, categoryData);
      setCategories(categories.map(c => c.id === categoryId ? updatedCategory : c));
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Admin: Delete review
  const handleDeleteReview = async (reviewId) => {
    try {
      await api.deleteReview(reviewId);
      const nextReviews = reviews.filter(r => r.id !== reviewId);
      setReviews(nextReviews);
      setReviewSummaries(buildReviewSummaries(nextReviews));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Admin: Update password
  const handleUpdatePassword = async (email, newPassword) => {
    try {
      const hashedPassword = hashPassword(newPassword);
      const updatedUser = await api.updateUserPassword(email, hashedPassword);

      // Update local state if it's the current user
      if (currentUser && currentUser.email === email) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      // Update users list
      setUsers(users.map(u => u.email === email ? updatedUser : u));
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(`Parolni o'zgartirishda xatolik: ${error.message}`);
      return false;
    }
  };



  // Protected admin route
  const ProtectedAdminRoute = ({ children }) => {
    const allowedRoles = ['moderator', 'admin', 'super_admin'];

    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      return (
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md mx-auto">
              <svg className="w-24 h-24 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ruxsat yo'q!</h2>
              <p className="text-gray-600 mb-6">Bu sahifaga faqat adminlar kirishi mumkin.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Bosh sahifaga qaytish
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  };

  // Enrich products with review data
  const productsWithReviews = useMemo(() => {
    const summaryByProductId = new Map(
      reviewSummaries.map((summary) => [Number(summary.product_id), summary])
    );

    return products.map(product => {
      const summary = summaryByProductId.get(Number(product.id));

      return {
        ...product,
        reviewCount: summary?.reviewCount || 0,
        rating: summary?.rating || 0
      };
    });
  }, [products, reviewSummaries]);

  if (loading) {
    return (
      <LoadingScreen />
    );
  }


  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_45%,#ffffff_100%)] pb-20 lg:pb-0">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        favouritesCount={favourites.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Landing
              products={productsWithReviews}
              categories={categories}
              onToggleFavourite={handleToggleFavourite}
              favourites={favourites}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
              carouselItems={carouselItems}
            />
          }
        />

        <Route
          path="/catalog"
          element={
            <Catalog
              products={productsWithReviews}
              categories={categories}
              onToggleFavourite={handleToggleFavourite}
              favourites={favourites}
              onAddToCart={handleAddToCart}
            />
          }
        />

        <Route
          path="/favourites"
          element={
            <Favourites
              favourites={favourites}
              products={productsWithReviews}
              onToggleFavourite={handleToggleFavourite}
              onAddToCart={handleAddToCart}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              products={productsWithReviews}
              onUpdateQuantity={handleUpdateCartQuantity}
              onUpdateAmountGrams={handleUpdateCartAmountGrams}
              onRemoveFromCart={handleRemoveFromCart}
              onSubmitOrder={handleSubmitOrder}
            />
          }
        />

        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
              onNavigate={handleNavigate}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Suspense fallback={<LoadingScreen />}>
                <AdminPanel
                  categories={categories}
                  products={products}
                  users={users}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onAddProduct={handleAddProduct}
                  onUpdateUserRole={handleUpdateUserRole}
                  onDeleteProduct={handleDeleteProduct}
                  onUpdateProductStock={handleUpdateProductStock}
                  onUpdateProductCategory={handleUpdateProductCategory}
                  onUpdateProductBestSeller={handleUpdateProductBestSeller}
                  onUpdateProduct={handleUpdateProduct}
                  carouselItems={carouselItems}
                  onAddCarouselItem={handleAddCarouselItem}
                  onDeleteCarouselItem={handleDeleteCarouselItem}
                  onUpdateCarouselItem={handleUpdateCarouselItem}
                  reviews={reviews}
                  onDeleteReview={handleDeleteReview}
                  visitStats={visitStats}
                  currentUser={currentUser}
                  onUpdatePassword={handleUpdatePassword}
                />
              </Suspense>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />
      </Routes>

      <Footer categories={categories} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-red-100 border-b-primary"></div>
          <p className="font-bold text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
