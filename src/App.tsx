import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { InquiryModal } from './components/InquiryModal';
import { CursorSpotlight } from './components/CursorSpotlight';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ResumePage } from './pages/ResumePage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminInquiries } from './pages/admin/AdminInquiries';
import { AdminSettings } from './pages/admin/AdminSettings';
import { DeploymentGuide } from './pages/admin/DeploymentGuide';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Global Hire Me modal state
  const [hireMeOpen, setHireMeOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();

  const openHireMe = (service?: string) => {
    setSelectedService(service);
    setHireMeOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 dark:bg-[#0a0a0c] dark:text-stone-100 transition-colors">
      <CursorSpotlight />
      {!isAdminRoute && <Navbar onOpenHireMe={() => openHireMe()} />}

      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage onOpenHireMe={openHireMe} />} />
          <Route path="/projects" element={<ProjectsPage onOpenHireMe={openHireMe} />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage onOpenHireMe={openHireMe} />} />
          <Route path="/services" element={<ServicesPage onOpenHireMe={openHireMe} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="deployment" element={<DeploymentGuide />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsApp defaultService={selectedService} />}

      <InquiryModal
        isOpen={hireMeOpen}
        onClose={() => setHireMeOpen(false)}
        initialService={selectedService}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
