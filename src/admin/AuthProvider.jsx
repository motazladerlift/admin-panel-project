import React, { createContext, useContext, useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Login from './pages/Login';
import AdminLayout from './AdminLayout';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      const authToken = localStorage.getItem('adminAuth');
      const userData = localStorage.getItem('adminUser');
      
      if (authToken === 'true' && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-admin-gradient text-white" dir="rtl">
        <div className="spinner mb-4"></div>
        <p className="text-lg">جاري التحقق من تسجيل الدخول...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={value}>
      <div className="min-h-screen">
        {children}
      </div>
    </AuthContext.Provider>
  );
};

// Logout Button Component
export const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  return (
    <button 
      className="flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-all duration-300 hover:bg-white/10 text-sm font-medium"
      onClick={handleLogout}
      title="تسجيل الخروج"
    >
      <LogOut size={20} />
      <span className="hidden sm:block">تسجيل الخروج</span>
    </button>
  );
};


