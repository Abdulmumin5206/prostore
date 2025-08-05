import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MacPage from './pages/MacPage';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import TopPromotionalSection from './components/TopPromotionalSection';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300 overflow-x-hidden flex flex-col">
          <TopPromotionalSection />
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mac" element={<MacPage />} />
              {/* Placeholder routes for other pages */}
              <Route path="/store" element={<StorePage />} />
              <Route path="/store/:productId" element={<ProductPage />} />
              <Route path="/ipad" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">iPad Page Coming Soon</div>} />
              <Route path="/iphone" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">iPhone Page Coming Soon</div>} />
              <Route path="/watch" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Watch Page Coming Soon</div>} />
              <Route path="/vision" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Vision Page Coming Soon</div>} />
              <Route path="/airpods" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">AirPods Page Coming Soon</div>} />
              <Route path="/tv-home" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">TV & Home Page Coming Soon</div>} />
              <Route path="/entertainment" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Entertainment Page Coming Soon</div>} />
              <Route path="/accessories" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Accessories Page Coming Soon</div>} />
              <Route path="/support" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Support Page Coming Soon</div>} />
              <Route path="/gift-card" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Gift Card Page Coming Soon</div>} />
              <Route path="/airtag" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">AirTag Page Coming Soon</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;