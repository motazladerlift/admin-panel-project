import React, { useEffect, useState, startTransition } from 'react';
import { 
  Mail, 
  Eye, 
  Trash2, 
  Edit, 
  Filter, 
  Search,
  Send,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import CustomSpinner from '../../components/ui/CustomSpinner';

// حالات الرسائل باللغة الهولندية
const MESSAGE_STATUSES = {
  new: { label: 'Nieuw', className: 'bg-yellow-100 text-yellow-800', description: 'Nieuw ontvangen bericht' },
  read: { label: 'Gelezen', className: 'bg-blue-100 text-blue-800', description: 'Bericht is gelezen' },
  replied: { label: 'Beantwoord', className: 'bg-green-100 text-green-800', description: 'Bericht is beantwoord' },
  archived: { label: 'Gearchiveerd', className: 'bg-gray-100 text-gray-800', description: 'Bericht gearchiveerd' }
};

// مصادر الرسائل
const MESSAGE_SOURCES = {
  contact_form: { label: 'Contact Formulier', className: 'bg-blue-100 text-blue-800' },
  footer_form: { label: 'Footer Formulier', className: 'bg-purple-100 text-purple-800' },
  pricing_form: { label: 'Prijzen Formulier', className: 'bg-green-100 text-green-800' }
};

// الأولويات
const PRIORITIES = {
  low: { label: 'Laag', className: 'bg-gray-100 text-gray-800' },
  normal: { label: 'Normaal', className: 'bg-blue-100 text-blue-800' },
  high: { label: 'Hoog', className: 'bg-yellow-100 text-yellow-800' },
  urgent: { label: 'Dringend', className: 'bg-red-100 text-red-800' }
};

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0
  });

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET;

  // التحقق من وجود adminSecret
  if (!adminSecret) {
    console.error('VITE_ADMIN_SECRET is not defined in environment variables');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-red-600 text-xl font-bold mb-2">Configuration Error</h3>
          <p className="text-admin-text-secondary">VITE_ADMIN_SECRET is not defined. Please check your environment variables.</p>
        </div>
      </div>
    );
  }

  const load = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${apiBase}/contact-messages`, {
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          throw new Error('Unauthorized: Please check your admin secret configuration');
        }
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      const data = await resp.json();
      const messagesData = Array.isArray(data) ? data : [];
      
      startTransition(() => {
        setMessages(messagesData);
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      startTransition(() => {
        setMessages([]);
      });
      
      if (error.message.includes('Unauthorized')) {
        alert('خطأ في الإعداد: يرجى التحقق من متغيرات البيئة (VITE_ADMIN_SECRET)');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const resp = await fetch(`${apiBase}/contact-messages-stats`, {
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (resp.ok) {
        const statsData = await resp.json();
        setStats(statsData);
      } else if (resp.status === 401) {
        console.error('Unauthorized: Please check your admin secret configuration');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => { 
    load(); 
    loadStats();
  }, []);

  // تصفية الرسائل
  const filtered = messages.filter(message => {
    const searchMatch = !searchTerm || 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || message.status === statusFilter;
    const sourceMatch = sourceFilter === 'all' || message.source === sourceFilter;
    const priorityMatch = priorityFilter === 'all' || message.priority === priorityFilter;
    
    return searchMatch && statusMatch && sourceMatch && priorityMatch;
  });

  const openDetails = (message) => startTransition(() => setSelected(message));
  const closeDetails = () => startTransition(() => setSelected(null));
  
  const openReplyModal = (message) => {
    setReplyMessage(message);
    setReplyContent('');
    setShowReplyModal(true);
  };
  
  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyMessage(null);
    setReplyContent('');
  };

  const updateStatus = async (message, status) => {
    try {
      setSaving(true);
      const resp = await fetch(`${apiBase}/contact-messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ status })
      });
      
      if (!resp.ok) {
        throw new Error('Failed to update status');
      }
      
      await load();
      await loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Er is een fout opgetreden bij het bijwerken van de status.');
    } finally {
      setSaving(false);
    }
  };

  const updatePriority = async (message, priority) => {
    try {
      setSaving(true);
      const resp = await fetch(`${apiBase}/contact-messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ priority })
      });
      
      if (!resp.ok) {
        throw new Error('Failed to update priority');
      }
      
      await load();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Er is een fout opgetreden bij het bijwerken van de prioriteit.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm('Weet u zeker dat u dit bericht wilt verwijderen?')) {
      return;
    }
    
    try {
      setSaving(true);
      const resp = await fetch(`${apiBase}/contact-messages/${message.id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      
      if (!resp.ok) {
        throw new Error('Failed to delete message');
      }
      
      await load();
      await loadStats();
      if (selected?.id === message.id) {
        closeDetails();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Er is een fout opgetreden bij het verwijderen van het bericht.');
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || replyContent.trim().length < 10) {
      alert('Het antwoord moet minimaal 10 tekens bevatten.');
      return;
    }
    
    try {
      setSaving(true);
      const resp = await fetch(`${apiBase}/contact-messages/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({
          message_id: replyMessage.id,
          reply_content: replyContent.trim(),
          admin_name: 'فريق Motaz'
        })
      });
      
      if (!resp.ok) {
        throw new Error('Failed to send reply');
      }
      
      alert('Antwoord succesvol verzonden naar de klant.');
      closeReplyModal();
      await load();
      await loadStats();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Er is een fout opgetreden bij het verzenden van het antwoord.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('nl-NL');
  };

  const getStatusBadge = (status) => {
    const statusInfo = MESSAGE_STATUSES[status] || MESSAGE_STATUSES.new;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const getSourceBadge = (source) => {
    const sourceInfo = MESSAGE_SOURCES[source] || MESSAGE_SOURCES.contact_form;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sourceInfo.className}`}>{sourceInfo.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityInfo = PRIORITIES[priority] || PRIORITIES.normal;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityInfo.className}`}>{priorityInfo.label}</span>;
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
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow">Contact Berichten</h1>
          <p className="text-xl text-white/90 text-shadow">Beheer en beantwoord klantberichten</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-admin-text flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Contact Berichten
          </h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="admin-button-outline flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-admin-primary">{stats.total}</h4>
              <p className="text-admin-text-secondary text-sm">Totaal</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-yellow-600">{stats.new}</h4>
              <p className="text-admin-text-secondary text-sm">Nieuw</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-blue-600">{stats.read}</h4>
              <p className="text-admin-text-secondary text-sm">Gelezen</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-green-600">{stats.replied}</h4>
              <p className="text-admin-text-secondary text-sm">Beantwoord</p>
            </div>
          </div>
          <div className="admin-card text-center">
            <div className="p-4">
              <h4 className="text-2xl font-bold text-gray-600">{stats.archived}</h4>
              <p className="text-admin-text-secondary text-sm">Gearchiveerd</p>
            </div>
          </div>
        </div>

        {/* فلاتر */}
        {showFilters && (
          <div className="admin-card mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Zoeken</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Zoek in berichten..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="admin-input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Alle Statussen</option>
                    {Object.entries(MESSAGE_STATUSES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Bron</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Alle Bronnen</option>
                    {Object.entries(MESSAGE_SOURCES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Prioriteit</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">Alle Prioriteiten</option>
                    {Object.entries(PRIORITIES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* جدول الرسائل */}
        <div className="admin-card">
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-admin-text mb-2">Geen berichten gevonden</h3>
                <p className="text-admin-text-secondary">Er zijn geen berichten die voldoen aan de geselecteerde filters.</p>
              </div>
            ) : (
              <>
                {/* عرض الجدول للشاشات الكبيرة */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-admin-border">
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Naam</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">E-mail</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Onderwerp</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Bron</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Prioriteit</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Datum</th>
                        <th className="text-left py-3 px-4 font-semibold text-admin-text">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((message) => (
                        <tr key={message.id} className="border-b border-admin-border hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-admin-text">{message.name}</div>
                              {message.phone && (
                                <div className="text-sm text-admin-text-secondary flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {message.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-admin-text">{message.email}</td>
                          <td className="py-3 px-4">
                            <div className="text-admin-text">
                              {message.subject || 'Geen onderwerp'}
                              {message.move_date && (
                                <div className="text-xs text-admin-text-secondary mt-1">
                                  Verhuisdatum: {message.move_date}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">{getSourceBadge(message.source)}</td>
                          <td className="py-3 px-4">{getStatusBadge(message.status)}</td>
                          <td className="py-3 px-4">{getPriorityBadge(message.priority)}</td>
                          <td className="py-3 px-4 text-sm text-admin-text-secondary">{formatDate(message.created_at)}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openDetails(message)}
                                title="Bekijk details"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => openReplyModal(message)}
                                title="Antwoord sturen"
                                disabled={message.status === 'replied'}
                                className={`p-2 rounded-md transition-colors ${
                                  message.status === 'replied' 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => deleteMessage(message)}
                                disabled={saving}
                                title="Verwijder bericht"
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
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
                  {filtered.map((message) => (
                    <div key={message.id} className={`admin-card ${message.status === 'new' ? 'border-l-4 border-yellow-400' : ''}`}>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h6 className="font-bold text-admin-text mb-1">{message.name}</h6>
                            <p className="text-admin-text-secondary text-sm mb-1">{message.email}</p>
                            {message.phone && (
                              <p className="text-admin-text-secondary text-sm flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {message.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(message.status)}
                            {getPriorityBadge(message.priority)}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <strong className="text-admin-text">Onderwerp:</strong>
                          <div className="mt-1 text-sm text-admin-text">
                            {message.subject || 'Geen onderwerp'}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <strong className="text-admin-text">Bericht:</strong>
                          <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm text-admin-text">
                            {message.message.length > 100 
                              ? `${message.message.substring(0, 100)}...` 
                              : message.message}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetails(message)}
                            className="flex-1 admin-button-outline text-sm py-2"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </button>
                          
                          <button
                            onClick={() => openReplyModal(message)}
                            disabled={message.status === 'replied'}
                            className={`flex-1 text-sm py-2 ${
                              message.status === 'replied' 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'admin-button text-sm'
                            }`}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Antwoord
                          </button>
                          
                          <button
                            onClick={() => deleteMessage(message)}
                            disabled={saving}
                            className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Verwijder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal تفاصيل الرسالة */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-admin-text">Bericht Details</h3>
                  <button 
                    onClick={closeDetails} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <strong className="text-admin-text">Naam:</strong> {selected.name}
                  </div>
                  <div>
                    <strong className="text-admin-text">E-mail:</strong> {selected.email}
                  </div>
                  <div>
                    <strong className="text-admin-text">Telefoon:</strong> {selected.phone || 'Niet opgegeven'}
                  </div>
                  <div>
                    <strong className="text-admin-text">Bron:</strong> {getSourceBadge(selected.source)}
                  </div>
                  <div>
                    <strong className="text-admin-text">Status:</strong> {getStatusBadge(selected.status)}
                  </div>
                  <div>
                    <strong className="text-admin-text">Prioriteit:</strong> {getPriorityBadge(selected.priority)}
                  </div>
                </div>
                
                {selected.move_date && (
                  <div className="mb-4">
                    <strong className="text-admin-text">Verhuisdatum:</strong> {selected.move_date}
                  </div>
                )}
                
                <div className="mb-4">
                  <strong className="text-admin-text">Onderwerp:</strong> {selected.subject || 'Geen onderwerp'}
                </div>
                
                <div className="mb-4">
                  <strong className="text-admin-text">Bericht:</strong>
                  <div className="mt-2 p-4 bg-gray-100 rounded-md text-admin-text whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-admin-text-secondary">
                  <div>
                    <strong>Ontvangen:</strong> {formatDate(selected.created_at)}
                  </div>
                  <div>
                    <strong>Laatst bijgewerkt:</strong> {formatDate(selected.updated_at)}
                  </div>
                  {selected.read_at && (
                    <div>
                      <strong>Gelezen op:</strong> {formatDate(selected.read_at)}
                    </div>
                  )}
                  {selected.replied_at && (
                    <div>
                      <strong>Beantwoord op:</strong> {formatDate(selected.replied_at)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={closeDetails} 
                  className="admin-button-outline"
                >
                  Sluiten
                </button>
                {selected.status === 'new' && (
                  <button 
                    onClick={() => {
                      updateStatus(selected, 'read');
                      closeDetails();
                    }}
                    disabled={saving}
                    className="admin-button"
                  >
                    Markeer als Gelezen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal الرد على الرسالة */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-admin-text">Antwoord Sturen</h3>
                  <button 
                    onClick={closeReplyModal} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {replyMessage && (
                  <div>
                    <div className="mb-4">
                      <strong className="text-admin-text">Naar:</strong> {replyMessage.name} ({replyMessage.email})
                    </div>
                    <div className="mb-4">
                      <strong className="text-admin-text">Onderwerp:</strong> {replyMessage.subject || 'Geen onderwerp'}
                    </div>
                    <div className="mb-4">
                      <strong className="text-admin-text">Origineel bericht:</strong>
                      <div className="mt-2 p-4 bg-gray-100 rounded-md text-admin-text whitespace-pre-wrap">
                        {replyMessage.message}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-admin-text mb-2">Uw antwoord:</label>
                      <textarea
                        rows={6}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Schrijf uw antwoord hier..."
                        className="admin-input"
                      />
                      <p className="text-sm text-admin-text-secondary mt-1">
                        Minimaal 10 tekens vereist.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={closeReplyModal} 
                  className="admin-button-outline"
                >
                  Annuleren
                </button>
                <button 
                  onClick={sendReply}
                  disabled={saving || !replyContent.trim() || replyContent.trim().length < 10}
                  className="admin-button"
                >
                  {saving ? 'Verzenden...' : 'Verstuur Antwoord'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ContactMessagesPage;
