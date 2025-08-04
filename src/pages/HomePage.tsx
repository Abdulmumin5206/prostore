import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-16 px-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-semibold text-black dark:text-white mb-4 tracking-tight transition-colors duration-300">
            iPhone
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-8 font-light transition-colors duration-300">
            Meet the iPhone 16 family.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105">
              Learn more
            </button>
            <button className="border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105">
              Shop iPhone
            </button>
          </div>

          <p className="text-lg text-blue-600 dark:text-blue-400 mb-16 transition-colors duration-300">
            Built for Apple Intelligence.
          </p>

          {/* iPhone Models Display */}
          <div className="relative flex items-end justify-center space-x-8 mt-16">
            {/* iPhone Pro Max */}
            <div className="transform rotate-12 hover:rotate-6 transition-transform duration-500">
              <div className="w-32 h-64 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-200 dark:to-amber-300 rounded-3xl border-4 border-gray-800 dark:border-gray-600 relative shadow-2xl transition-colors duration-300">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300">
                  <div className="w-12 h-12 bg-gray-700 dark:bg-gray-600 rounded-full relative transition-colors duration-300">
                    <div className="absolute top-2 left-2 w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full transition-colors duration-300"></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full transition-colors duration-300"></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full transition-colors duration-300"></div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full transition-colors duration-300"></div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-300 dark:from-gray-400 to-transparent opacity-20 rounded-b-3xl transition-colors duration-300"></div>
              </div>
            </div>

            {/* iPhone 16 */}
            <div className="transform hover:scale-105 transition-transform duration-500">
              <div className="w-36 h-72 bg-gradient-to-b from-blue-300 to-blue-400 dark:from-blue-400 dark:to-blue-500 rounded-3xl border-4 border-gray-800 dark:border-gray-600 relative shadow-2xl transition-colors duration-300">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300">
                  <div className="w-12 h-12 bg-gray-700 dark:bg-gray-600 rounded-full relative transition-colors duration-300">
                    <div className="absolute top-3 left-3 w-6 h-6 bg-gray-600 dark:bg-gray-500 rounded-full transition-colors duration-300"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-gray-500 dark:bg-gray-400 rounded-full transition-colors duration-300"></div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-500 dark:from-blue-600 to-transparent opacity-30 rounded-b-3xl transition-colors duration-300"></div>
              </div>
            </div>

            {/* iPhone 16 Plus */}
            <div className="transform -rotate-12 hover:-rotate-6 transition-transform duration-500">
              <div className="w-32 h-64 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-300 dark:to-gray-400 rounded-3xl border-4 border-gray-800 dark:border-gray-600 relative shadow-2xl transition-colors duration-300">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300">
                  <div className="w-12 h-12 bg-gray-700 dark:bg-gray-600 rounded-full relative transition-colors duration-300">
                    <div className="absolute top-3 left-3 w-6 h-6 bg-gray-600 dark:bg-gray-500 rounded-full transition-colors duration-300"></div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-400 dark:from-gray-500 to-transparent opacity-20 rounded-b-3xl transition-colors duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;