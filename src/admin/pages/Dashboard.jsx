import React, { useState, useEffect } from 'react';
import { 
  Euro, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  Package,
  Truck,
  BarChart3,
  Calendar,
  MessageSquare,
  Plus,
  House,
  Eye,
  Settings,
  DollarSign,
  ShoppingCart,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [visitorStats, setVisitorStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch visitor stats
      const visitorResponse = await fetch(`${apiBase}/visitor-stats`, {
        headers: {
          'X-Admin-Secret': adminSecret || ''
        }
      });

      // Fetch orders
      const ordersResponse = await fetch(`${apiBase}/orders`);

      // Fetch services
      const servicesResponse = await fetch(`${apiBase}/services`);

      // Fetch contact messages
      const messagesResponse = await fetch(`${apiBase}/contact-messages`, {
        headers: {
          'X-Admin-Secret': adminSecret || ''
        }
      });

      const [visitorData, ordersData, servicesData, messagesData] = await Promise.all([
        visitorResponse.ok ? visitorResponse.json() : null,
        ordersResponse.ok ? ordersResponse.json() : [],
        servicesResponse.ok ? servicesResponse.json() : [],
        messagesResponse.ok ? messagesResponse.json() : []
      ]);

      if (visitorData) {
        setVisitorStats(visitorData.stats);
      }

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setContactMessages(Array.isArray(messagesData) ? messagesData : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Er is een fout opgetreden bij het laden van de dashboard gegevens');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.status === 'new').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    const activeServices = services.filter(s => s.active).length;
    const totalServices = services.length;
    
    // Contact messages stats
    const totalMessages = contactMessages.length;
    const newMessages = contactMessages.filter(m => m.status === 'new').length;
    const readMessages = contactMessages.filter(m => m.status === 'read').length;
    const repliedMessages = contactMessages.filter(m => m.status === 'replied').length;
    
    // Calculate revenue (mock calculation based on service prices)
    const totalRevenue = orders.reduce((sum, order) => {
      const price = order.price ? parseFloat(order.price.replace('€', '')) : 0;
      return sum + price;
    }, 0);

    const monthlyRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.created_at || order.date);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, order) => {
        const price = order.price ? parseFloat(order.price.replace('€', '')) : 0;
        return sum + price;
      }, 0);

    return {
      totalOrders,
      newOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      activeServices,
      totalServices,
      totalRevenue,
      monthlyRevenue,
      totalMessages,
      newMessages,
      readMessages,
      repliedMessages
    };
  };

  const stats = calculateStats();

  // Get recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
    .slice(0, 5);

  // Service breakdown
  const serviceBreakdown = services.reduce((acc, service) => {
    const category = service.category || 'other';
    if (!acc[category]) {
      acc[category] = { count: 0, percentage: 0 };
    }
    acc[category].count++;
    return acc;
  }, {});

  // Calculate percentages
  Object.keys(serviceBreakdown).forEach(category => {
    serviceBreakdown[category].percentage = (serviceBreakdown[category].count / services.length) * 100;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'new': { label: 'Nieuw', className: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'Bevestigd', className: 'bg-green-100 text-green-800' },
      'in_progress': { label: 'In Uitvoering', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Voltooid', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Geannuleerd', className: 'bg-red-100 text-red-800' },
      'pending_payment': { label: 'Wacht op Betaling', className: 'bg-yellow-100 text-yellow-800' },
      'rescheduled': { label: 'Uitgesteld', className: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'main': 'Ladderlift',
      'package': 'Verhuispakket',
      'truck': 'Verhuistruck',
      'other': 'Overige'
    };
    return categoryMap[category] || category;
  };

  const quickActions = [
    { 
      title: 'Nieuwe Service Toevoegen', 
      description: 'Voeg een nieuwe service of pakket toe',
      icon: <Plus size={24} />,
      variant: 'primary',
      path: '/admin/pricing'
    },
    { 
      title: 'Bestellingen Bekijken', 
      description: 'Bekijk en beheer bestellingen',
      icon: <FileText size={24} />,
      variant: 'success',
      path: '/admin/orders'
    },
    { 
      title: 'Prijzen Beheren', 
      description: 'Bewerk en beheer prijzen',
      icon: <Euro size={24} />,
      variant: 'info',
      path: '/admin/pricing'
    },
    { 
      title: 'Bezoekers Statistieken', 
      description: 'Bekijk website statistieken',
      icon: <BarChart3 size={24} />,
      variant: 'warning',
      path: '/admin/visitor-stats'
    },
    { 
      title: 'Contact Berichten', 
      description: 'Bekijk en beheer contact berichten',
      icon: <MessageSquare size={24} />,
      variant: 'primary',
      path: '/admin/contact-messages'
    },
    { 
      title: 'Site Configuratie', 
      description: 'Beheer contactgegevens en sociale media',
      icon: <Settings size={24} />,
      variant: 'secondary',
      path: '/admin/site-configuration'
    },
    { 
      title: 'Terug naar Website', 
      description: 'Ga terug naar de hoofdpagina',
      icon: <House size={24} />,
      variant: 'secondary',
      path: '/'
    }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('nl-NL');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="ltr bg-admin-bg transition-colors duration-300">
        {/* Page Header */}
        <div className="text-center mb-8 bg-admin-gradient text-white py-8 rounded-b-3xl shadow-admin-card">
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow">Dashboard</h1>
          <p className="text-xl text-white/90 text-shadow">Welkom bij het Motaz Ladderlift beheerpaneel</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="spinner mb-4"></div>
          <p className="text-lg text-admin-text-secondary">Dashboard gegevens laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ltr bg-admin-bg transition-colors duration-300">
      {/* Page Header */}
      <div className="text-center mb-8 bg-admin-gradient text-white py-8 rounded-b-3xl shadow-admin-card">
        <h1 className="text-4xl font-bold text-white mb-2 text-shadow">Dashboard</h1>
        <p className="text-xl text-white/90 text-shadow">Welkom bij het Motaz Ladderlift beheerpaneel</p>
      </div>

      {error && (
        <div className="alert-error mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300 ml-4"
            onClick={fetchDashboardData}
          >
            Opnieuw Proberen
          </button>
        </div>
      )}

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Orders Card */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-15 h-15 rounded-xl bg-admin-gradient flex items-center justify-center text-white shadow-lg">
                <ShoppingCart size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-admin-text mb-1">{stats.totalOrders}</h3>
                <p className="text-admin-text-secondary text-sm">Totaal Bestellingen</p>
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              <span>{stats.newOrders} nieuwe bestellingen</span>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                <DollarSign size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-admin-text mb-1">€{stats.totalRevenue.toFixed(2)}</h3>
                <p className="text-admin-text-secondary text-sm">Totaal Omzet</p>
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              <span>€{stats.monthlyRevenue.toFixed(2)} deze maand</span>
            </div>
          </div>
        </div>

        {/* Active Services Card */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg">
                <Package size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-admin-text mb-1">{stats.activeServices}</h3>
                <p className="text-admin-text-secondary text-sm">Actieve Services</p>
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              <span>{stats.totalServices} totaal beschikbaar</span>
            </div>
          </div>
        </div>

        {/* Today Visitors Card */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Eye size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-admin-text mb-1">{visitorStats?.today || 0}</h3>
                <p className="text-admin-text-secondary text-sm">Vandaag Bezoekers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp size={16} />
              <span>{visitorStats?.total || 0} totaal bezoekers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {/* Week Visitors */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-admin-text">{visitorStats?.week || 0}</h3>
                <p className="text-admin-text-secondary text-sm">Deze Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Month Visitors */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white">
                <BarChart3 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-admin-text">{visitorStats?.month || 0}</h3>
                <p className="text-admin-text-secondary text-sm">Deze Maand</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-admin-text">{visitorStats?.unique_visitors || 0}</h3>
                <p className="text-admin-text-secondary text-sm">Unieke Bezoekers</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Messages */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-admin-gradient flex items-center justify-center text-white">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-admin-text">{stats.newMessages}</h3>
                <p className="text-admin-text-secondary text-sm">Nieuwe Berichten</p>
              </div>
            </div>
            <div className="text-xs text-admin-text-secondary">
              <span>{stats.totalMessages} totaal berichten</span>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-admin-gradient flex items-center justify-center text-white">
                <Activity size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-admin-text">{stats.completedOrders}</h3>
                <p className="text-admin-text-secondary text-sm">Voltooide Bestellingen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="admin-card h-full">
            <div className="bg-admin-gradient text-white p-6 rounded-t-xl">
              <h5 className="text-xl font-semibold mb-0">Snelle Acties</h5>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {quickActions.map((action, index) => {
                  const colorClasses = {
                    'primary': 'bg-admin-primary hover:bg-admin-primary-hover',
                    'success': 'bg-green-600 hover:bg-green-700',
                    'info': 'bg-blue-600 hover:bg-blue-700',
                    'warning': 'bg-yellow-600 hover:bg-yellow-700',
                    'secondary': 'bg-gray-600 hover:bg-gray-700'
                  };
                  
                  return (
                    <a
                      key={index}
                      href={action.path}
                      className="flex items-center gap-4 p-4 bg-admin-bg rounded-lg hover:bg-gray-50 transition-all duration-300 hover:-translate-x-1 hover:shadow-lg group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${colorClasses[action.variant]} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 text-right">
                        <h6 className="font-semibold text-admin-text mb-1 group-hover:text-admin-primary transition-colors duration-300">{action.title}</h6>
                        <p className="text-sm text-admin-text-secondary mb-0">{action.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="admin-card h-full">
            <div className="bg-admin-gradient text-white p-6 rounded-t-xl">
              <h5 className="text-xl font-semibold mb-0">Recente Bestellingen</h5>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-admin-text-secondary" />
                  <p className="text-admin-text-secondary">Nog geen bestellingen</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="border-b border-admin-border pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 rounded-lg p-4 transition-colors duration-300">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-admin-text mb-1">{order.name}</div>
                            <div className="text-sm text-admin-text-secondary mb-1">{order.serviceTitle || 'Service'}</div>
                            <div className="text-xs text-admin-text-secondary">{formatDate(order.date)}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-lg font-semibold text-admin-primary">{order.price || '€0'}</span>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <a 
                      href="/admin/orders"
                      className="admin-button-outline text-sm px-6 py-2"
                    >
                      Alle Bestellingen Bekijken
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Service Breakdown */}
        <div>
          <div className="admin-card h-full">
            <div className="bg-admin-gradient text-white p-6 rounded-t-xl">
              <h5 className="text-xl font-semibold mb-0">Service Verdeling</h5>
            </div>
            <div className="p-6">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto mb-4 text-admin-text-secondary" />
                  <p className="text-admin-text-secondary">Nog geen services geconfigureerd</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(serviceBreakdown).map(([category, data], index) => {
                    const colors = [
                      'bg-admin-primary',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-blue-500'
                    ];
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-admin-text">{getCategoryLabel(category)}</span>
                          <span className="text-sm text-admin-text-secondary">{data.count} services</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-admin-text-secondary">{data.percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div>
          <div className="admin-card h-full">
            <div className="bg-admin-gradient text-white p-6 rounded-t-xl">
              <h5 className="text-xl font-semibold mb-0">Bestelling Status Overzicht</h5>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-admin-bg rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <div className="flex items-center gap-3 text-admin-primary font-semibold min-w-16">
                    <Clock size={16} />
                    <span className="text-xl">{stats.newOrders}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-admin-text mb-1">Nieuwe Bestellingen</div>
                    <p className="text-sm text-admin-text-secondary mb-0">Wachten op bevestiging</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-admin-bg rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <div className="flex items-center gap-3 text-admin-primary font-semibold min-w-16">
                    <Truck size={16} />
                    <span className="text-xl">{stats.confirmedOrders}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-admin-text mb-1">Bevestigde Bestellingen</div>
                    <p className="text-sm text-admin-text-secondary mb-0">Klaar voor uitvoering</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-admin-bg rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <div className="flex items-center gap-3 text-admin-primary font-semibold min-w-16">
                    <Package size={16} />
                    <span className="text-xl">{stats.completedOrders}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-admin-text mb-1">Voltooide Bestellingen</div>
                    <p className="text-sm text-admin-text-secondary mb-0">Succesvol afgerond</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-admin-bg rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <div className="flex items-center gap-3 text-admin-primary font-semibold min-w-16">
                    <Clock size={16} />
                    <span className="text-xl">{stats.cancelledOrders}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-admin-text mb-1">Geannuleerde Bestellingen</div>
                    <p className="text-sm text-admin-text-secondary mb-0">Niet uitgevoerd</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-8">
        <div className="admin-card">
          <div className="bg-admin-gradient text-white p-6 rounded-t-xl">
            <h5 className="text-xl font-semibold mb-0">Systeem Status</h5>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-6 bg-white rounded-lg border border-admin-border hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3 animate-pulse-custom"></div>
                  <div className="font-semibold text-admin-text mb-1">API Status</div>
                  <p className="text-sm text-admin-text-secondary mb-0">Online</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-6 bg-white rounded-lg border border-admin-border hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3 animate-pulse-custom"></div>
                  <div className="font-semibold text-admin-text mb-1">Database</div>
                  <p className="text-sm text-admin-text-secondary mb-0">Verbonden</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-6 bg-white rounded-lg border border-admin-border hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3 animate-pulse-custom"></div>
                  <div className="font-semibold text-admin-text mb-1">Website</div>
                  <p className="text-sm text-admin-text-secondary mb-0">Actief</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-6 bg-white rounded-lg border border-admin-border hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3 animate-pulse-custom"></div>
                  <div className="font-semibold text-admin-text mb-1">Beveiliging</div>
                  <p className="text-sm text-admin-text-secondary mb-0">Actief</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
