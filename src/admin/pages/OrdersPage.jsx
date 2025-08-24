import React, { useEffect, useState, startTransition } from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import CustomSpinner from '../../components/ui/CustomSpinner';

// حالات الطلبات باللغة الهولندية
const ORDER_STATUSES = {
  new: { label: 'Nieuw', className: 'bg-yellow-100 text-yellow-800', description: 'Nieuw ontvangen verzoek' },
  confirmed: { label: 'Bevestigd', className: 'bg-green-100 text-green-800', description: 'Verzoek bevestigd' },
  in_progress: { label: 'In Uitvoering', className: 'bg-blue-100 text-blue-800', description: 'Service wordt uitgevoerd' },
  completed: { label: 'Voltooid', className: 'bg-green-100 text-green-800', description: 'Service succesvol afgerond' },
  cancelled: { label: 'Geannuleerd', className: 'bg-red-100 text-red-800', description: 'Verzoek geannuleerd' },
  pending_payment: { label: 'Wacht op Betaling', className: 'bg-yellow-100 text-yellow-800', description: 'Wacht op betaling' },
  rescheduled: { label: 'Uitgesteld', className: 'bg-gray-100 text-gray-800', description: 'Afspraak uitgesteld' }
};

// أنواع الخدمات باللغة الهولندية
const SERVICE_CATEGORIES = {
  main: { label: 'Ladderlift', className: 'bg-blue-100 text-blue-800' },
  package: { label: 'Verhuispakket', className: 'bg-green-100 text-green-800' },
  truck: { label: 'Verhuistruck', className: 'bg-purple-100 text-purple-800' }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET;

  const load = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${apiBase}/orders`);
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      const data = await resp.json();
      const ordersData = Array.isArray(data) ? data : [];
      
      // حساب الإحصائيات
      const newStats = {
        total: ordersData.length,
        new: ordersData.filter(o => o.status === 'new').length,
        confirmed: ordersData.filter(o => o.status === 'confirmed').length,
        in_progress: ordersData.filter(o => o.status === 'in_progress').length,
        completed: ordersData.filter(o => o.status === 'completed').length,
        cancelled: ordersData.filter(o => o.status === 'cancelled').length
      };
      
      startTransition(() => {
        setOrders(ordersData);
        setStats(newStats);
      });
    } catch (error) {
      console.error('Error loading orders:', error);
      startTransition(() => {
        setOrders([]);
        setStats({ total: 0, new: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0 });
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // تصفية الطلبات
  const filtered = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || order.category === categoryFilter;
    const dateMatch = !dateFilter || order.date === dateFilter;
    return statusMatch && categoryMatch && dateMatch;
  });

  const openDetails = (o) => startTransition(() => setSelected(o));
  const closeDetails = () => startTransition(() => setSelected(null));

  const updateStatus = async (order, status) => {
    try {
      setSaving(true);
      const resp = await fetch(`${apiBase}/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': adminSecret || '' },
        body: JSON.stringify({ status })
      });
      if (!resp.ok) throw new Error('Failed');
      await load();
      startTransition(() => {
        closeDetails();
      });
    } catch(e) {
      alert('Status update mislukt');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('nl-NL');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = ORDER_STATUSES[status] || ORDER_STATUSES.new;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const getCategoryBadge = (category) => {
    const categoryInfo = SERVICE_CATEGORIES[category] || SERVICE_CATEGORIES.main;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryInfo.className}`}>{categoryInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CustomSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="ltr bg-admin-bg min-h-screen p-6">
        {/* Page Header */}
        <div className="text-center mb-8 bg-admin-gradient text-white py-8 rounded-b-3xl shadow-admin-card">
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow">Bestellingen Beheren</h1>
          <p className="text-xl text-white/90 text-shadow">Volg en beheer verhuis- en meubeltransport verzoeken</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-admin-primary">{stats.total}</h4>
              <p className="text-admin-text-secondary text-sm">Totaal Bestellingen</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-yellow-600">{stats.new}</h4>
              <p className="text-admin-text-secondary text-sm">Nieuwe Bestellingen</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-green-600">{stats.confirmed}</h4>
              <p className="text-admin-text-secondary text-sm">Bevestigd</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-blue-600">{stats.in_progress}</h4>
              <p className="text-admin-text-secondary text-sm">In Uitvoering</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-green-600">{stats.completed}</h4>
              <p className="text-admin-text-secondary text-sm">Voltooid</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-red-600">{stats.cancelled}</h4>
              <p className="text-admin-text-secondary text-sm">Geannuleerd</p>
            </div>
          </div>
        </div>

        {/* فلاتر البحث */}
        <div className="admin-card mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-admin-text">Filters</h3>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="admin-button-outline flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Alle Statussen</option>
                    {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Categorie</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Alle Categorieën</option>
                    {Object.entries(SERVICE_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Datum</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* جدول الطلبات */}
        <div className="admin-card">
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-admin-text mb-2">Geen bestellingen gevonden</h3>
                <p className="text-admin-text-secondary">Er zijn geen bestellingen die voldoen aan de geselecteerde filters.</p>
              </div>
            ) : (
              <>
                {/* عرض الجدول للشاشات الكبيرة */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-admin-border">
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Klant</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Service</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Datum</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Prioriteit</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((order) => (
                        <tr key={order.id} className="border-b border-admin-border hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-admin-text">{order.name}</div>
                              <div className="text-sm text-admin-text-secondary flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {order.phone}
                              </div>
                              <div className="text-sm text-admin-text-secondary flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {order.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="text-admin-text">{order.service}</div>
                              <div className="mt-1">{getCategoryBadge(order.category)}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-admin-text">{formatDate(order.date)}</div>
                            {order.time && (
                              <div className="text-sm text-admin-text-secondary">{order.time}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                          <td className="py-3 px-4">
                            <div className={`w-3 h-3 rounded-full ${
                              order.date === new Date().toISOString().split('T')[0] 
                                ? 'bg-red-500' 
                                : order.status === 'new' 
                                  ? 'bg-yellow-500' 
                                  : 'bg-gray-400'
                            }`}></div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openDetails(order)}
                                title="Bekijk details"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(order, 'confirmed')}
                                disabled={saving || order.status === 'confirmed'}
                                title="Bevestig bestelling"
                                className={`p-2 rounded-md transition-colors ${
                                  order.status === 'confirmed' 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* عرض البطاقات للموبايل */}
                <div className="md:hidden space-y-4">
                  {filtered.map((order) => (
                    <div key={order.id} className="admin-card">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-admin-text mb-1">{order.name}</h4>
                            <div className="text-sm text-admin-text-secondary flex items-center gap-1 mb-1">
                              <Phone className="w-3 h-3" />
                              {order.phone}
                            </div>
                            <div className="text-sm text-admin-text-secondary flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {order.email}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <div className="mt-1">{getCategoryBadge(order.category)}</div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-admin-text font-medium">{order.service}</div>
                          <div className="text-sm text-admin-text-secondary mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDate(order.date)}
                            {order.time && ` - ${order.time}`}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            order.date === new Date().toISOString().split('T')[0] 
                              ? 'bg-red-500' 
                              : order.status === 'new' 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-400'
                          }`}></div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetails(order)}
                              className="admin-button-outline text-sm py-2 px-3"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </button>
                            <button
                              onClick={() => updateStatus(order, 'confirmed')}
                              disabled={saving || order.status === 'confirmed'}
                              className={`text-sm py-2 px-3 rounded-lg ${
                                order.status === 'confirmed' 
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                  : 'admin-button'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Bevestig
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal تفاصيل الطلب */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-admin-text">Bestelling Details</h3>
                  <button 
                    onClick={closeDetails} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <strong className="text-admin-text">Naam:</strong> {selected.name}
                  </div>
                  <div>
                    <strong className="text-admin-text">Telefoon:</strong> {selected.phone}
                  </div>
                  <div>
                    <strong className="text-admin-text">E-mail:</strong> {selected.email}
                  </div>
                  <div>
                    <strong className="text-admin-text">Service:</strong> {selected.service}
                  </div>
                  <div>
                    <strong className="text-admin-text">Categorie:</strong> {getCategoryBadge(selected.category)}
                  </div>
                  <div>
                    <strong className="text-admin-text">Status:</strong> {getStatusBadge(selected.status)}
                  </div>
                  <div>
                    <strong className="text-admin-text">Datum:</strong> {formatDate(selected.date)}
                  </div>
                  {selected.time && (
                    <div>
                      <strong className="text-admin-text">Tijd:</strong> {selected.time}
                    </div>
                  )}
                </div>
                
                {selected.address && (
                  <div className="mb-4">
                    <strong className="text-admin-text">Adres:</strong>
                    <div className="mt-1 p-3 bg-gray-100 rounded-md text-admin-text">
                      {selected.address}
                    </div>
                  </div>
                )}
                
                {selected.notes && (
                  <div className="mb-4">
                    <strong className="text-admin-text">Notities:</strong>
                    <div className="mt-1 p-3 bg-gray-100 rounded-md text-admin-text">
                      {selected.notes}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-admin-text-secondary">
                  <div>
                    <strong>Ontvangen:</strong> {formatDate(selected.created_at)}
                  </div>
                  <div>
                    <strong>Laatst bijgewerkt:</strong> {formatDate(selected.updated_at)}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={closeDetails} 
                  className="admin-button-outline"
                >
                  Sluiten
                </button>
                {selected.status !== 'confirmed' && (
                  <button 
                    onClick={() => updateStatus(selected, 'confirmed')}
                    disabled={saving}
                    className="admin-button"
                  >
                    Bevestig Bestelling
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default OrdersPage;
