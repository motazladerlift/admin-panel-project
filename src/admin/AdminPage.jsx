import React from 'react';
import { AuthProvider } from './AuthProvider';
import AdminLayout from './AdminLayout';
import AdminRoutes from './AdminRoutes';

const AdminPage = () => {
  return (
    <AuthProvider>
      <AdminLayout>
        <AdminRoutes />
      </AdminLayout>
    </AuthProvider>
  );
};

export default AdminPage;
