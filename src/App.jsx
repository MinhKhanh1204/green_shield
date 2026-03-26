import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import LanguageToggle from './components/LanguageToggle'
import HomeSection from './sections/HomeSection'
import AboutSection from './sections/AboutSection'
import ProductsSection from './sections/ProductsSection'
import AdvantagesSection from './sections/AdvantagesSection'
import MissionSection from './sections/MissionSection'
import ContactSection from './sections/ContactSection'
import CommunitySection from './sections/CommunitySection'
import logo from './assets/logo.png';
import logolg from './assets/logo-lg.png';
import BackToTop from './components/BackToTop'
import ChatWidget from './components/ChatWidget'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'
import CustomBagLayout from './layouts/CustomBagLayout'
import BagTemplateSelectPage from './pages/BagTemplateSelectPage'
import DesignPage from './pages/DesignPage'
import PreviewPage from './pages/PreviewPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderLookupPage from './pages/OrderLookupPage'
import AudioPage from './pages/AudioPage'
import AudioFilePage from './pages/AudioFilePage'
import TextureManagementPage from './pages/TextureManagementPage'
import BagTemplateManagementPage from './pages/BagTemplateManagementPage'
import OrderManagementPage from './pages/OrderManagementPage'
import DashboardOverview from './pages/DashboardOverview'
import DashboardSettings from './pages/DashboardSettings'
import MapPage from './pages/MapPage'
import AdminMapPage from './pages/AdminMapPage'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { MaterialDataProvider } from './context/MaterialDataContext'

function MainSite() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    const sectionId = location.hash.replace('#', '')
    if (!sectionId) return

    const scrollToSection = () => {
      const target = document.getElementById(sectionId)
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }

    const raf = requestAnimationFrame(scrollToSection)
    return () => cancelAnimationFrame(raf)
  }, [location.hash])

  return (
    <>
      <header className="header">
        <div className='header-logo'>
          <img src={logo} alt="greenshield logo" width="24" />
          <img className="logo-lg" src={logolg} alt="greenshield name" width="100" />
        </div>

        <div className='header-nav'>
          <Nav />
        </div>

        <div className='header-lang'>
          <LanguageToggle />
        </div>
      </header>

      <main className="app-scroll" aria-label="Main content">
        <HomeSection />
        <AboutSection />
        <ProductsSection />
        <AdvantagesSection />
        <MissionSection />
        <CommunitySection />
        <ContactSection />
      </main>
      <ChatWidget />
      <BackToTop />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
    <MaterialDataProvider>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/custom-bag" element={<CustomBagLayout><BagTemplateSelectPage /></CustomBagLayout>} />
        <Route path="/custom-bag/:templateId/design" element={<CustomBagLayout><DesignPage /></CustomBagLayout>} />
        <Route path="/custom-bag/:templateId/preview" element={<CustomBagLayout><PreviewPage /></CustomBagLayout>} />
        <Route path="/custom-bag/:templateId/checkout" element={<CustomBagLayout><CheckoutPage /></CustomBagLayout>} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-lookup" element={<OrderLookupPage />} />
        <Route path="/audio/:code" element={<AudioPage />} />
        <Route path="/tts/:code" element={<AudioPage />} />
        <Route path="/audio-file/:id" element={<AudioFilePage />} />
        <Route path="/admin" element={<LoginPage />} />
                  <Route path="/map" element={<MainLayout><MapPage /></MainLayout>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard/overview" replace />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="bag-templates" element={<BagTemplateManagementPage />} />
          <Route path="textures" element={<TextureManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
                      <Route path="map" element={<AdminMapPage />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
        <Route path="/admin/textures" element={<Navigate to="/admin/dashboard/textures" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </MaterialDataProvider>
    </BrowserRouter>
  )
}

export default App
