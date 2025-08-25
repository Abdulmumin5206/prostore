import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import IPhonePage from './pages/iPhonePage';
import ProductsPage from './pages/ProductsPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import CategoriesPage from './pages/CategoriesPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import TypographyGuide from './components/TypographyGuide';
import MainLayout from './layouts/MainLayout';
import CartPage from './pages/CartPage';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Admin route without layout (no header/footer) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
  
              {/* All other routes use the main layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/account" element={<AccountPage />} />
                {/* Auth routes */}
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                {/* Placeholder routes for other pages */}
                <Route path="/store/:productId" element={<ProductPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/mac" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Mac Page Coming Soon</div>} />
                <Route path="/ipad" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">iPad Page Coming Soon</div>} />
                <Route path="/iphone" element={<IPhonePage />} />
                <Route path="/watch" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Watch Page Coming Soon</div>} />
                <Route path="/vision" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Vision Page Coming Soon</div>} />
                <Route path="/airpods" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">AirPods Page Coming Soon</div>} />
                <Route path="/tv-home" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">TV & Home Page Coming Soon</div>} />
                <Route path="/entertainment" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Entertainment Page Coming Soon</div>} />
                <Route path="/accessories" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Accessories Page Coming Soon</div>} />
                <Route path="/support" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Support Page Coming Soon</div>} />
                <Route path="/contact" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Contact Us Page Coming Soon</div>} />
                <Route path="/gift-card" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Gift Card Page Coming Soon</div>} />
                <Route path="/airtag" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">AirTag Page Coming Soon</div>} />
                {/* Typography Guide Route */}
                <Route path="/typography" element={<TypographyGuide />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;