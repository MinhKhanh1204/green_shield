import React, { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import LanguageToggle from './components/LanguageToggle'
import logo from './assets/logo.png';
import logolg from './assets/logo-lg.png';
import LabLoading from './pages/shared/LabLoading'

const lazyNamed = (importer, exportName) =>
  lazy(() => importer().then((module) => ({ default: module[exportName] })))

const LoginPage = lazyNamed(() => import('./pages/admin'), 'LoginPage')
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const CustomBagLayout = lazy(() => import('./layouts/CustomBagLayout'))
const BagTemplateSelectPage = lazyNamed(() => import('./pages/custom-bag'), 'BagTemplateSelectPage')
const DesignPage = lazy(() => import('./pages/DesignPage'))
const PreviewPage = lazyNamed(() => import('./pages/custom-bag'), 'PreviewPage')
const CheckoutPage = lazyNamed(() => import('./pages/custom-bag'), 'CheckoutPage')
const OrderSuccessPage = lazyNamed(() => import('./pages/order'), 'OrderSuccessPage')
const OrderLookupPage = lazyNamed(() => import('./pages/order'), 'OrderLookupPage')
const AudioPage = lazyNamed(() => import('./pages/media'), 'AudioPage')
const AudioFilePage = lazyNamed(() => import('./pages/media'), 'AudioFilePage')
const TextureManagementPage = lazyNamed(() => import('./pages/admin'), 'TextureManagementPage')
const BagTemplateManagementPage = lazyNamed(() => import('./pages/admin'), 'BagTemplateManagementPage')
const OrderManagementPage = lazyNamed(() => import('./pages/admin'), 'OrderManagementPage')
const DashboardOverview = lazyNamed(() => import('./pages/admin'), 'DashboardOverview')
const DashboardSettings = lazyNamed(() => import('./pages/admin'), 'DashboardSettings')
const MapPage = lazyNamed(() => import('./pages/map'), 'MapPage')
const AdminMapPage = lazyNamed(() => import('./pages/admin'), 'AdminMapPage')
const MainLayout = lazy(() => import('./layouts/MainLayout'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const MaterialDataProvider = lazy(() =>
  import('./context/MaterialDataContext').then((module) => ({ default: module.MaterialDataProvider })),
)
const HomeSection = lazy(() => import('./sections/HomeSection'))
const AboutSection = lazy(() => import('./sections/AboutSection'))
const ProductsSection = lazy(() => import('./sections/ProductsSection'))
const AdvantagesSection = lazy(() => import('./sections/AdvantagesSection'))
const MissionSection = lazy(() => import('./sections/MissionSection'))
const ContactSection = lazy(() => import('./sections/ContactSection'))
const CommunitySection = lazy(() => import('./sections/CommunitySection'))
const BackToTop = lazy(() => import('./components/BackToTop'))
const ChatWidget = lazy(() => import('./components/ChatWidget'))

const DARK_ROUTE_PATTERNS = ['/design', '/audio', '/audio-file', '/custom', '/order', '/checkout', '/tts'];

function RouteFallback() {
  return (
    <LabLoading />
  )
}

function withMaterialDataProvider(element) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <MaterialDataProvider>{element}</MaterialDataProvider>
    </Suspense>
  )
}

function ThemeRouteScope() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.toLowerCase();
    const root = document.documentElement;
    const inDarkScope = DARK_ROUTE_PATTERNS.some((route) => pathname.includes(route));

    let nextTheme = 'light';
    if (inDarkScope) {
      const savedTheme = localStorage.getItem('greenshield-theme');
      nextTheme = savedTheme === 'light' ? 'light' : 'dark';
    }

    root.classList.add('theme-transition');
    root.setAttribute('data-theme', nextTheme);
    const timer = window.setTimeout(() => root.classList.remove('theme-transition'), 420);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return null;
}

function MainSite() {
  const location = useLocation()
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let cancelled = false
    const revealWidgets = () => {
      if (!cancelled) setShowDeferredWidgets(true)
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(revealWidgets, { timeout: 1500 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }

    const timer = window.setTimeout(revealWidgets, 800)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let cancelled = false

    const preloadLightResources = () => {
      if (cancelled) return

      const cloudinaryOrigin = 'https://res.cloudinary.com'
      const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${cloudinaryOrigin}"]`)
      if (!existingPreconnect) {
        const preconnect = document.createElement('link')
        preconnect.rel = 'preconnect'
        preconnect.href = cloudinaryOrigin
        preconnect.crossOrigin = ''
        document.head.appendChild(preconnect)
      }

      const heroProcessPreview = new Image()
      heroProcessPreview.decoding = 'async'
      heroProcessPreview.fetchPriority = 'low'
      heroProcessPreview.src = 'https://res.cloudinary.com/dnini39bp/image/upload/f_auto,q_auto,w_920,c_limit,dpr_auto/v1774525576/thu_gom_i88yio.jpg'
    }

    const preloadHeavySections = () => {
      if (cancelled) return
      import('./sections/MissionSection')
      import('./sections/ProductsSection')
      import('./sections/AdvantagesSection')
    }

    const timerLight = window.setTimeout(preloadLightResources, 1600)
    const timerHeavy = window.setTimeout(preloadHeavySections, 2000)

    return () => {
      cancelled = true
      window.clearTimeout(timerLight)
      window.clearTimeout(timerHeavy)
    }
  }, [])

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
        <Suspense fallback={<RouteFallback />}>
          <HomeSection />
        </Suspense>
        <Suspense fallback={null}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={null}>
          <MissionSection />
        </Suspense>
        <Suspense fallback={null}>
          <ProductsSection />
        </Suspense>
        <Suspense fallback={null}>
          <AdvantagesSection />
        </Suspense>
        <Suspense fallback={null}>
          <CommunitySection />
        </Suspense>
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>
      {showDeferredWidgets ? (
        <Suspense fallback={null}>
          <ChatWidget />
          <BackToTop />
        </Suspense>
      ) : null}
    </>
  )
}

function CustomBagRoute() {
  const location = useLocation()
  const [showIntro, setShowIntro] = useState(() => Boolean(location.state?.fromHome))

  useEffect(() => {
    setShowIntro(Boolean(location.state?.fromHome))
  }, [location.state])

  useEffect(() => {
    if (!showIntro) return
    const timer = window.setTimeout(() => setShowIntro(false), 3000)
    return () => window.clearTimeout(timer)
  }, [showIntro])

  if (showIntro) return <LabLoading />

  return (
    <CustomBagLayout>
      <BagTemplateSelectPage />
    </CustomBagLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeRouteScope />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/custom-bag" element={<CustomBagRoute />} />
          <Route path="/custom-bag/:templateId/design" element={<CustomBagLayout><DesignPage /></CustomBagLayout>} />
          <Route path="/custom-bag/:templateId/preview" element={<CustomBagLayout><PreviewPage /></CustomBagLayout>} />
          <Route path="/custom-bag/:templateId/checkout" element={<CustomBagLayout><CheckoutPage /></CustomBagLayout>} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/order-lookup" element={<OrderLookupPage />} />
          <Route path="/audio/:code" element={<AudioPage />} />
          <Route path="/tts/:code" element={<AudioPage />} />
          <Route path="/audio-file/:id" element={<AudioFilePage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route path="/map" element={withMaterialDataProvider(<MainLayout><MapPage /></MainLayout>)} />
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
            <Route path="map" element={withMaterialDataProvider(<AdminMapPage />)} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
          <Route path="/admin/textures" element={<Navigate to="/admin/dashboard/textures" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
