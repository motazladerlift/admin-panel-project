import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Euro,
  Clock,
  Package,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PricingManagement = () => {
  const [pricingData, setPricingData] = useState({ mainServices: [], additionalServices: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const [formData, setFormData] = useState({
    price: '',
    period: '',
    title: '',
    features: [''],
    notes: [''],
    category: 'main',
    active: true
  });

  const reloadData = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const resp = await fetch(`${apiBase}/pricing`, { cache: 'no-cache' });
      const data = await resp.json();
      setPricingData({
        mainServices: data?.mainServices || [],
        additionalServices: data?.additionalServices || []
      });
    } catch (e) {
      console.error('Failed to load pricing', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleShowModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        price: service.price,
        period: service.period,
        title: service.title,
        features: [...service.features],
        notes: [...service.notes],
        category: service.category,
        active: service.active
      });
    } else {
      setEditingService(null);
      setFormData({
        price: '',
        period: '',
        title: '',
        features: [''],
        notes: [''],
        category: 'main',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSaveAPI = async () => {
    try {
      setSaving(true);
      const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
      const payload = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        notes: formData.notes.filter(n => n.trim() !== ''),
      };
      let resp;
      if (editingService) {
        resp = await fetch(`${apiBase}/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': adminSecret || '' },
          body: JSON.stringify(payload)
        });
      } else {
        resp = await fetch(`${apiBase}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': adminSecret || '' },
          body: JSON.stringify(payload)
        });
      }
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.detail || json.error || 'فشل الحفظ');
      setAlertMessage(editingService ? 'تم تحديث الخدمة بنجاح' : 'تم إضافة الخدمة بنجاح');
      setAlertType('success');
      setShowAlert(true);
      handleCloseModal();
      await reloadData();
      setTimeout(() => setShowAlert(false), 2000);
    } catch (e) {
      setAlertMessage('فشل الحفظ: ' + e.message);
      setAlertType('danger');
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
      const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
      const resp = await fetch(`${apiBase}/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Secret': adminSecret || '' }
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.detail || json.error || 'فشل الحذف');
      setAlertMessage('تم حذف الخدمة بنجاح');
      setAlertType('success');
      setShowAlert(true);
      await reloadData();
      setTimeout(() => setShowAlert(false), 2000);
    } catch (e) {
      setAlertMessage('فشل الحذف: ' + e.message);
      setAlertType('danger');
      setShowAlert(true);
    }
  };

  const toggleServiceStatus = async (serviceId) => {
    try {
      const current = [...pricingData.mainServices, ...pricingData.additionalServices].find(s => s.id === serviceId);
      if (!current) return;
      const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
      const resp = await fetch(`${apiBase}/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': adminSecret || '' },
        body: JSON.stringify({ active: !current.active })
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.detail || json.error || 'فشل التحديث');
      await reloadData();
    } catch (e) {
      setAlertMessage('فشل تحديث الحالة: ' + e.message);
      setAlertType('danger');
      setShowAlert(true);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'main': return <Package size={16} />;
      case 'package': return <Settings size={16} />;
      case 'truck': return <Clock size={16} />;
      default: return <Euro size={16} />;
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'main': return 'الخدمات الرئيسية';
      case 'package': return 'الباقات';
      case 'truck': return 'شاحنة النقل';
      default: return 'أخرى';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-admin-text-secondary">جارِ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ltr bg-admin-bg min-h-screen p-6">
      {/* Page Header */}
      <div className="text-center mb-8 bg-admin-gradient text-white py-8 rounded-b-3xl shadow-admin-card">
        <h1 className="text-4xl font-bold text-white mb-2 text-shadow">Prijzen en diensten</h1>
        <p className="text-xl text-white/90 text-shadow">Beheer prijzen, opties en zichtbaarheid op de website</p>
      </div>

      {showAlert && (
        <div className={`mb-6 p-4 rounded-lg border ${
          alertType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {alertType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{alertMessage}</span>
            </div>
            <button 
              onClick={() => setShowAlert(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => handleShowModal()}
          className="admin-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nieuwe dienst toevoegen
        </button>
      </div>

      {/* Main Services */}
      <div className="admin-card mb-6">
        <div className="p-6 border-b border-admin-border">
          <h3 className="text-xl font-bold text-admin-text">الخدمات الرئيسية</h3>
        </div>
        <div className="p-6">
          {/* عرض الجدول للشاشات الكبيرة */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الخدمة</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">السعر</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الميزات</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الحالة</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.mainServices.map((service) => (
                  <tr key={service.id} className="border-b border-admin-border hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-admin-text">{service.title}</div>
                        <div className="text-sm text-admin-text-secondary flex items-center gap-1 mt-1">
                          {getCategoryIcon(service.category)} {getCategoryName(service.category)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-admin-text">{service.price}</div>
                        <div className="text-sm text-admin-text-secondary">{service.period}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 2 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                            +{service.features.length - 2} أكثر
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={service.active}
                          onChange={() => toggleServiceStatus(service.id)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          service.active ? 'bg-admin-primary' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            service.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                        <span className="ml-2 text-sm text-admin-text">
                          {service.active ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowModal(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="حذف"
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
            {pricingData.mainServices.map((service) => (
              <div key={service.id} className="admin-card">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-admin-text mb-1">{service.title}</h4>
                      <div className="text-sm text-admin-text-secondary flex items-center gap-1">
                        {getCategoryIcon(service.category)} {getCategoryName(service.category)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-admin-text">{service.price}</div>
                      <div className="text-sm text-admin-text-secondary">{service.period}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.active}
                        onChange={() => toggleServiceStatus(service.id)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        service.active ? 'bg-admin-primary' : 'bg-gray-300'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          service.active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                      <span className="ml-2 text-sm text-admin-text">
                        {service.active ? 'مفعل' : 'معطل'}
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowModal(service)}
                        className="admin-button-outline text-sm py-2 px-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="admin-card">
        <div className="p-6 border-b border-admin-border">
          <h3 className="text-xl font-bold text-admin-text">الخدمات الإضافية</h3>
        </div>
        <div className="p-6">
          {/* عرض الجدول للشاشات الكبيرة */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الخدمة</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">السعر</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الميزات</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الحالة</th>
                  <th className="text-left py-3 px-4 font-semibold text-admin-text">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.additionalServices.map((service) => (
                  <tr key={service.id} className="border-b border-admin-border hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-admin-text">{service.title}</div>
                        <div className="text-sm text-admin-text-secondary flex items-center gap-1 mt-1">
                          {getCategoryIcon(service.category)} {getCategoryName(service.category)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-admin-text">{service.price}</div>
                        <div className="text-sm text-admin-text-secondary">{service.period}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 2 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                            +{service.features.length - 2} أكثر
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={service.active}
                          onChange={() => toggleServiceStatus(service.id)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          service.active ? 'bg-admin-primary' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            service.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                        <span className="ml-2 text-sm text-admin-text">
                          {service.active ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowModal(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="حذف"
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
            {pricingData.additionalServices.map((service) => (
              <div key={service.id} className="admin-card">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-admin-text mb-1">{service.title}</h4>
                      <div className="text-sm text-admin-text-secondary flex items-center gap-1">
                        {getCategoryIcon(service.category)} {getCategoryName(service.category)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-admin-text">{service.price}</div>
                      <div className="text-sm text-admin-text-secondary">{service.period}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.active}
                        onChange={() => toggleServiceStatus(service.id)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        service.active ? 'bg-admin-primary' : 'bg-gray-300'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          service.active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                      <span className="ml-2 text-sm text-admin-text">
                        {service.active ? 'مفعل' : 'معطل'}
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShowModal(service)}
                        className="admin-button-outline text-sm py-2 px-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal إضافة/تعديل الخدمة */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full h-full md:max-w-2xl md:h-auto md:mx-4 md:max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  {editingService ? (
                    <>
                      <Edit size={20} className="text-white" />
                      تعديل الخدمة
                    </>
                  ) : (
                    <>
                      <Plus size={20} className="text-white" />
                      إضافة خدمة جديدة
                    </>
                  )}
                </h3>
                <button 
                  onClick={handleCloseModal} 
                  className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* المعلومات الأساسية */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings size={18} className="text-orange-500" />
                    المعلومات الأساسية
                  </h4>
                  
                  {/* عنوان الخدمة */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الخدمة *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-base"
                      placeholder="مثال: خدمة النقل الأساسية"
                      autoFocus
                    />
                  </div>

                  {/* نوع الخدمة */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الخدمة</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-base"
                    >
                      <option value="main">الخدمات الرئيسية</option>
                      <option value="package">الباقات</option>
                      <option value="truck">شاحنة النقل</option>
                    </select>
                  </div>

                  {/* السعر والفترة */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">السعر *</label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-base"
                        placeholder="مثال: €60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الفترة</label>
                      <input
                        type="text"
                        value={formData.period}
                        onChange={(e) => handleInputChange('period', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-base"
                        placeholder="مثال: / UUR"
                      />
                    </div>
                  </div>

                  {/* الحالة */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">حالة الخدمة</label>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.active ? 'bg-orange-500' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.active ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                        <span className="mr-3 text-sm font-medium text-gray-700">
                          {formData.active ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* الميزات */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-orange-500" />
                    الميزات والخدمات المقدمة
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayChange('features', index, e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-base"
                          placeholder="أضف ميزة أو خدمة مقدمة"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('features', index)}
                          disabled={formData.features.length === 1}
                          className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="حذف الميزة"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('features')}
                      className="w-full mt-4 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      إضافة ميزة جديدة
                    </button>
                  </div>
                </div>

                {/* الملاحظات */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-orange-500" />
                    ملاحظات إضافية
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {formData.notes.map((note, index) => (
                      <div key={index} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => handleArrayChange('notes', index, e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-base"
                          placeholder="أضف ملاحظة أو شرط إضافي"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('notes', index)}
                          disabled={formData.notes.length === 1}
                          className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="حذف الملاحظة"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('notes')}
                      className="w-full mt-4 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      إضافة ملاحظة جديدة
                    </button>
                  </div>
                </div>
                <div className="pb-4"></div>
            </div>
            
            <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleCloseModal} 
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X size={16} />
                إلغاء
              </button>
              <button 
                onClick={handleSaveAPI}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    حفظ...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingService ? 'تحديث الخدمة' : 'حفظ الخدمة'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;
