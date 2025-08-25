import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopPromotionalSection from '../components/TopPromotionalSection'
import TopUtilityBar from '../components/TopUtilityBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MobileBottomBar from '../components/MobileBottomBar'

const MainLayout: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    // Ensure each navigation opens from top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  // Only show promotional banner on home page
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300 overflow-x-hidden flex flex-col">
      {isHomePage && <TopPromotionalSection />}
      <div className="hidden md:block">
        <TopUtilityBar />
        <Header />
      </div>
      <main className="flex-1 pb-14 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  )
}

export default MainLayout 