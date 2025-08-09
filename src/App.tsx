import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import IPhonePage from './pages/iPhonePage';
import ProductsPage from './pages/ProductsPage';
import TopPromotionalSection from './components/TopPromotionalSection';
import TypographyGuide from './components/TypographyGuide';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import AdminNewProductsPage from './pages/AdminNewProductsPage';
import AdminSecondhandProductsPage from './pages/AdminSecondhandProductsPage';
import AdminNewProductEditorPage from './pages/AdminNewProductEditorPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Admin area with minimal layout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
                    <AdminPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/new-products"
              element={
                <ProtectedRoute requireAdmin>
                  <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
                    <AdminNewProductsPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/new-products/new"
              element={
                <ProtectedRoute requireAdmin>
                  <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
                    <AdminNewProductEditorPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/new-products/:id/edit"
              element={
                <ProtectedRoute requireAdmin>
                  <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
                    <AdminNewProductEditorPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/secondhand-products"
              element={
                <ProtectedRoute requireAdmin>
                  <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
                    <AdminSecondhandProductsPage />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Storefront layout for everything else */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300 overflow-x-hidden flex flex-col">
                  <TopPromotionalSection />
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      {/* Placeholder routes for other pages */}
                      <Route path="/store/:productId" element={<ProductPage />} />
                      <Route path="/products" element={<ProductsPage />} />
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

                      {/* Auth routes */}
                      <Route path="/login" element={<SignInPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;