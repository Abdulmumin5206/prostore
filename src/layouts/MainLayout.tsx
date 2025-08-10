import React from 'react'
import { Outlet } from 'react-router-dom'
import TopPromotionalSection from '../components/TopPromotionalSection'
import Header from '../components/Header'
import Footer from '../components/Footer'

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300 overflow-x-hidden flex flex-col">
      <TopPromotionalSection />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout 