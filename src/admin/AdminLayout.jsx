import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  House, 
  Euro, 
  Settings, 
  Users, 
  FileText, 
  BarChart3,
  Menu,
  X,
  Eye,
  Mail,
  Shield,
  Clock,
  Phone
} from 'lucide-react';
import { LogoutButton } from './AuthProvider';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = location.pathname.split('/').pop() || 'dashboard';

  // تحديث الوقت كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: <BarChart3 size={20} />, 
      path: '/admin/dashboard',
      description: 'Overzicht van alle statistieken'
    },
    { 
      id: 'pricing', 
      name: 'Prijzen beheren', 
      icon: <Euro size={20} />, 
      path: '/admin/pricing',
      description: 'Beheer prijzen en tarieven'
    },
    { 
      id: 'orders', 
      name: 'Bestellingen', 
      icon: <FileText size={20} />, 
      path: '/admin/orders',
      description: 'Bekijk en beheer bestellingen'
    },
    { 
      id: 'contact-messages', 
      name: 'Contact Berichten', 
      icon: <Mail size={20} />, 
      path: '/admin/contact-messages',
      description: 'Beheer contactformulier berichten'
    },
    { 
      id: 'visitor-stats', 
      name: 'Bezoekersstatistieken', 
      icon: <Eye size={20} />, 
      path: '/admin/visitor-stats',
      description: 'Analyseer bezoekersgedrag'
    },
    { 
      id: 'site-configuration', 
      name: 'Site Configuratie', 
      icon: <Phone size={20} />, 
      path: '/admin/site-configuration',
      description: 'Beheer contactgegevens en sociale media'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      {/* Header */}
      <header className="bg-admin-gradient shadow-admin-card backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 text-white group hover:scale-105 transition-transform duration-300 cursor-pointer">
              <img 
                src="/images/FurnitureTransport.png" 
                alt="Motaz Logo" 
                className="w-10 h-10 object-contain drop-shadow-lg filter transition-transform duration-300 group-hover:rotate-6" 
              />
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-white text-shadow leading-tight">Motaz Admin</span>
                <span className="text-xs text-white/80 font-normal text-shadow">Beheerpaneel</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-white text-sm font-medium bg-white/10 px-3 py-2 rounded-full backdrop-blur-md border border-white/20">
                <Clock size={16} />
                <span>{formatTime(currentTime)}</span>
              </div>

              <button 
                className="bg-white/15 border border-white/20 text-white p-2.5 rounded-xl transition-all duration-300 backdrop-blur-md hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-admin-sidebar-gradient transform transition-transform duration-300 ease-in-out shadow-admin-sidebar backdrop-blur-md ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="relative p-6 bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10 overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/FurnitureTransport.png" 
                  alt="Motaz Logo" 
                  className="w-9 h-9 object-contain drop-shadow-lg filter transition-transform duration-300 hover:rotate-6 hover:scale-110" 
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-bold text-white leading-tight">Beheer</span>
                  <span className="text-xs text-white/70 font-normal">Administratie Paneel</span>
                </div>
              </div>
              
              <button 
                className="lg:hidden bg-white/10 border border-white/20 text-white p-2 rounded-lg transition-all duration-300 backdrop-blur-md hover:bg-white/20 hover:rotate-90"
                onClick={() => setSidebarOpen(false)}
                aria-label="Sluit menu"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Sidebar Body */}
          <div className="flex flex-col h-[calc(100vh-120px)] bg-black/10">
            {/* Date display */}
            <div className="flex items-center gap-2 px-6 py-4 text-white/70 text-sm border-b border-white/10 bg-black/10">
              <Clock size={14} />
              <span>{formatDate(currentTime)}</span>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 py-4">
              {menuItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    title={item.description}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-400 border-r-4 border-transparent my-1 rounded-r-xl font-medium text-sm group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-admin-primary/20 to-admin-primary/10 text-white border-r-admin-primary shadow-lg transform -translate-x-1'
                        : 'text-white/85 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:text-white hover:border-r-admin-primary hover:transform hover:-translate-x-1 hover:shadow-lg'
                    }`}
                  >
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 backdrop-blur-md flex-shrink-0 ${
                      isActive 
                        ? 'bg-admin-primary/30 scale-115 shadow-lg shadow-admin-primary/40'
                        : 'bg-white/10 group-hover:bg-admin-primary/20 group-hover:scale-110 group-hover:rotate-6'
                    }`}>
                      <div className={`transition-all duration-300 ${
                        isActive 
                          ? 'drop-shadow-lg filter'
                          : 'group-hover:drop-shadow-lg group-hover:filter'
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className={`font-semibold letter-spacing-wide transition-all duration-300 leading-tight ${
                        isActive ? '' : 'group-hover:translate-x-1'
                      }`}>
                        {item.name}
                      </span>
                      <span className={`text-xs font-normal leading-tight transition-all duration-300 ${
                        isActive 
                          ? 'text-white/80'
                          : 'text-white/60 group-hover:text-white/80'
                      }`}>
                        {item.description}
                      </span>
                    </div>
                    
                    {/* Active indicator arrow */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-admin-primary border-t-6 border-b-6 border-t-transparent border-b-transparent" />
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-2 text-white/70 text-xs px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Shield size={16} />
                <span>Beveiligd Admin Paneel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-admin-bg backdrop-blur-md transition-colors duration-300">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
