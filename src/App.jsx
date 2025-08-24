import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Admin Components
import { AuthProvider } from './admin/AuthProvider'
import AdminLayout from './admin/AdminLayout'
import AdminRoutes from './admin/AdminRoutes'

function App() {

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-admin-bg">
        <AuthProvider>
          <Routes>
            {/* Redirect root to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/*" element={
              <AdminLayout>
                <AdminRoutes />
              </AdminLayout>
            } />
            {/* Catch all other routes and redirect to admin */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </div>
    </BrowserRouter>
  )
}

export default App