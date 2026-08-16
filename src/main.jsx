import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ZoneDetailPage from './pages/ZoneDetailPage.jsx'
import RoutePage from './pages/RoutePage.jsx'
import ManualOriginPage from './pages/ManualOriginPage.jsx'
import OfflineMapPage from './pages/OfflineMapPage.jsx'
import ServiceUnavailablePage from './pages/ServiceUnavailablePage.jsx'
import EventEndedPage from './pages/EventEndedPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminRoute from './pages/admin/AdminRoute.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminZonesPage from './pages/admin/AdminZonesPage.jsx'
import AdminZoneCapacityPage from './pages/admin/AdminZoneCapacityPage.jsx'
import AdminFacilitiesPage from './pages/admin/AdminFacilitiesPage.jsx'
import AdminCongestionPage from './pages/admin/AdminCongestionPage.jsx'
import AdminPrivacyPage from './pages/admin/AdminPrivacyPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/zone/:zoneId" element={<ZoneDetailPage />} />
        <Route path="/route/:zoneId" element={<RoutePage />} />
        <Route path="/route/:zoneId/origin" element={<ManualOriginPage />} />
        <Route path="/offline" element={<OfflineMapPage />} />
        <Route path="/unavailable" element={<ServiceUnavailablePage />} />
        <Route path="/ended" element={<EventEndedPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/zones" element={<AdminRoute><AdminZonesPage /></AdminRoute>} />
        <Route path="/admin/zones/:zoneId/capacity" element={<AdminRoute><AdminZoneCapacityPage /></AdminRoute>} />
        <Route path="/admin/facilities" element={<AdminRoute><AdminFacilitiesPage /></AdminRoute>} />
        <Route path="/admin/congestion" element={<AdminRoute><AdminCongestionPage /></AdminRoute>} />
        <Route path="/admin/privacy" element={<AdminRoute><AdminPrivacyPage /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
