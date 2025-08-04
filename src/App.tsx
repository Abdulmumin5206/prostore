import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MacPage from './pages/MacPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mac" element={<MacPage />} />
            {/* Placeholder routes for other pages */}
            <Route path="/store" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Store Page Coming Soon</div>} />
            <Route path="/ipad" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">iPad Page Coming Soon</div>} />
            <Route path="/watch" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Watch Page Coming Soon</div>} />
            <Route path="/vision" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Vision Page Coming Soon</div>} />
            <Route path="/airpods" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">AirPods Page Coming Soon</div>} />
            <Route path="/tv-home" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">TV & Home Page Coming Soon</div>} />
            <Route path="/entertainment" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Entertainment Page Coming Soon</div>} />
            <Route path="/accessories" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Accessories Page Coming Soon</div>} />
            <Route path="/support" element={<div className="p-8 text-center text-black dark:text-white transition-colors duration-300">Support Page Coming Soon</div>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;