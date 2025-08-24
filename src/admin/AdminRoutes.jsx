import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PricingManagement from './pages/PricingManagement';
import OrdersPage from './pages/OrdersPage';
import VisitorStats from './pages/VisitorStats';
import ContactMessagesPage from './pages/ContactMessagesPage';
import SiteConfigurationPage from './pages/SiteConfigurationPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="pricing" element={<PricingManagement />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="visitor-stats" element={<VisitorStats />} />
      <Route path="contact-messages" element={<ContactMessagesPage />} />
      <Route path="site-configuration" element={<SiteConfigurationPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
