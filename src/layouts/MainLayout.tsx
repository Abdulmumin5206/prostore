import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopPromotionalSection from '../components/TopPromotionalSection'
import TopUtilityBar from '../components/TopUtilityBar'
import Header from '../components/Header'
import Footer from '../components/Footer'

const MainLayout: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    // Ensure each navigation opens from top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300 overflow-x-hidden flex flex-col">
      <TopPromotionalSection />
      <TopUtilityBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout 