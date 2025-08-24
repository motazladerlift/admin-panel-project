import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter,
  Linkedin,
  Building,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';

const SiteConfigurationPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET;

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBase}/site-configuration`);
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }

      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching configuration:', error);
      setError('Er is een fout opgetreden bij het laden van de configuratie');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${apiBase}/site-configuration/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret || ''
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError('Er is een fout opgetreden bij het opslaan van de configuratie');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setShowResetModal(false);
    try {
      setSaving(true);
      setError(null);

      const defaultConfig = {
        contact: {
          phone: "+32 469 11 91 19",
          phone_display: "0469 119 119",
          email: "motazladerlift@gmail.com",
          email_display: "motazladerlift@gmail.com",
          whatsapp: "https://wa.me/message/27GB2V4YVAZ4E1",
          whatsapp_number: "+32469119119"
        },
        address: {
          street: "Frans Adriaenssensstraat 25",
          city: "Antwerpen",
          postal_code: "2170",
          country: "België"
        },
        business_hours: {
          display: "24 uur / 7 dagen",
          availability: "24/7 Beschikbaar"
        },
        social_media: {
          facebook: "https://www.facebook.com/motaz.ladderlift",
          instagram: "https://www.instagram.com/motaz_ladderlift/",
          youtube: "https://www.youtube.com/@motazladderlift",
          tiktok: "https://www.tiktok.com/@motazladderlift",
          linkedin: null,
          twitter: null
        },
        company: {
          name: "Motaz Ladderlift",
          description: "Professionele verhuis- en ladderlift services in Antwerpen en omgeving.",
          tagline: "Uw betrouwbare partner voor verhuis en ladderlift services",
          founded_year: 2020,
          registration_number: null,
          vat_number: null
        }
      };

      const response = await fetch(`${apiBase}/site-configuration/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret || ''
        },
        body: JSON.stringify(defaultConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to reset configuration');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error resetting configuration:', error);
      setError('Er is een fout opgetreden bij het resetten van de configuratie');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setShowMobileMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Site Configuratie</h1>
            <p className="text-sm sm:text-base text-gray-600">Beheer contactgegevens en sociale media links</p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Configuratie laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Site Configuratie</h1>
              <p className="text-sm sm:text-base text-gray-600">Beheer contactgegevens en sociale media links</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setShowResetModal(true)}
                disabled={saving}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={16} className="mr-2" />
                <span className="hidden sm:inline">Reset naar Standaard</span>
                <span className="sm:hidden">Reset</span>
              </button>
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Opslaan...</span>
                    <span className="sm:hidden">Opslaan</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    <span className="hidden sm:inline">Opslaan</span>
                    <span className="sm:hidden">Opslaan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 sm:mb-6">
            <div className="flex">
              <AlertCircle size={20} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm sm:text-base text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 sm:mb-6">
            <div className="flex">
              <CheckCircle size={20} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm sm:text-base text-green-700">Configuratie succesvol opgeslagen!</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Mobile Tab Toggle */}
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {showMobileMenu ? (
                <>
                  <X size={16} className="mr-2" />
                  Sluit Menu
                </>
              ) : (
                <>
                  <Menu size={16} className="mr-2" />
                  Open Menu
                </>
              )}
            </button>
          </div>

          {/* Mobile Tab Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-2 space-y-1">
                {[
                  { key: 'contact', label: 'Contactgegevens', icon: Phone },
                  { key: 'address', label: 'Adres', icon: MapPin },
                  { key: 'hours', label: 'Openingstijden', icon: Clock },
                  { key: 'social', label: 'Sociale Media', icon: Facebook },
                  { key: 'company', label: 'Bedrijfsinformatie', icon: Building }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTabChange(key)}
                    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${
                      activeTab === key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className="mr-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Tabs */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { key: 'contact', label: 'Contactgegevens', icon: Phone },
                  { key: 'address', label: 'Adres', icon: MapPin },
                  { key: 'hours', label: 'Openingstijden', icon: Clock },
                  { key: 'social', label: 'Sociale Media', icon: Facebook },
                  { key: 'company', label: 'Bedrijfsinformatie', icon: Building }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTabChange(key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                      activeTab === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              {/* Contact Information Tab */}
              {activeTab === 'contact' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Informatie</h3>
                    <p className="text-sm sm:text-base text-gray-600">Beheer telefoon, email en WhatsApp gegevens</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefoonnummer
                      </label>
                      <input
                        type="tel"
                        value={config?.contact?.phone || ''}
                        onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                        placeholder="+32 469 11 91 19"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Volledig telefoonnummer met landcode
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weergave Telefoonnummer
                      </label>
                      <input
                        type="text"
                        value={config?.contact?.phone_display || ''}
                        onChange={(e) => handleInputChange('contact', 'phone_display', e.target.value)}
                        placeholder="0469 119 119"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Hoe het nummer wordt weergegeven op de website
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Adres
                      </label>
                      <input
                        type="email"
                        value={config?.contact?.email || ''}
                        onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                        placeholder="motazladerlift@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weergave Email
                      </label>
                      <input
                        type="text"
                        value={config?.contact?.email_display || ''}
                        onChange={(e) => handleInputChange('contact', 'email_display', e.target.value)}
                        placeholder="motazladerlift@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Link
                      </label>
                      <input
                        type="url"
                        value={config?.contact?.whatsapp || ''}
                        onChange={(e) => handleInputChange('contact', 'whatsapp', e.target.value)}
                        placeholder="https://wa.me/message/27GB2V4YVAZ4E1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Nummer
                      </label>
                      <input
                        type="tel"
                        value={config?.contact?.whatsapp_number || ''}
                        onChange={(e) => handleInputChange('contact', 'whatsapp_number', e.target.value)}
                        placeholder="+32469119119"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Adres Informatie</h3>
                    <p className="text-sm sm:text-base text-gray-600">Beheer het hoofdkantoor adres</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Straat & Huisnummer
                      </label>
                      <input
                        type="text"
                        value={config?.address?.street || ''}
                        onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                        placeholder="Frans Adriaenssensstraat 25"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode
                      </label>
                      <input
                        type="text"
                        value={config?.address?.postal_code || ''}
                        onChange={(e) => handleInputChange('address', 'postal_code', e.target.value)}
                        placeholder="2170"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stad
                      </label>
                      <input
                        type="text"
                        value={config?.address?.city || ''}
                        onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                        placeholder="Antwerpen"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Land
                      </label>
                      <input
                        type="text"
                        value={config?.address?.country || ''}
                        onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                        placeholder="België"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours Tab */}
              {activeTab === 'hours' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Openingstijden</h3>
                    <p className="text-sm sm:text-base text-gray-600">Beheer de beschikbaarheid van het bedrijf</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weergave Openingstijden
                      </label>
                      <input
                        type="text"
                        value={config?.business_hours?.display || ''}
                        onChange={(e) => handleInputChange('business_hours', 'display', e.target.value)}
                        placeholder="24 uur / 7 dagen"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Korte beschrijving van openingstijden
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beschikbaarheid
                      </label>
                      <input
                        type="text"
                        value={config?.business_hours?.availability || ''}
                        onChange={(e) => handleInputChange('business_hours', 'availability', e.target.value)}
                        placeholder="24/7 Beschikbaar"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Uitgebreide beschrijving van beschikbaarheid
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sociale Media Links</h3>
                    <p className="text-sm sm:text-base text-gray-600">Beheer alle sociale media profielen</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Facebook size={16} className="mr-2" />
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={config?.social_media?.facebook || ''}
                        onChange={(e) => handleInputChange('social_media', 'facebook', e.target.value)}
                        placeholder="https://www.facebook.com/motaz.ladderlift"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Instagram size={16} className="mr-2" />
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={config?.social_media?.instagram || ''}
                        onChange={(e) => handleInputChange('social_media', 'instagram', e.target.value)}
                        placeholder="https://www.instagram.com/motaz_ladderlift/"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Youtube size={16} className="mr-2" />
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={config?.social_media?.youtube || ''}
                        onChange={(e) => handleInputChange('social_media', 'youtube', e.target.value)}
                        placeholder="https://www.youtube.com/@motazladderlift"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                        TikTok URL
                      </label>
                      <input
                        type="url"
                        value={config?.social_media?.tiktok || ''}
                        onChange={(e) => handleInputChange('social_media', 'tiktok', e.target.value)}
                        placeholder="https://www.tiktok.com/@motazladderlift"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Linkedin size={16} className="mr-2" />
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={config?.social_media?.linkedin || ''}
                        onChange={(e) => handleInputChange('social_media', 'linkedin', e.target.value)}
                        placeholder="https://www.linkedin.com/company/motaz-ladderlift"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Twitter size={16} className="mr-2" />
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={config?.social_media?.twitter || ''}
                        onChange={(e) => handleInputChange('social_media', 'twitter', e.target.value)}
                        placeholder="https://twitter.com/motazladderlift"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information Tab */}
              {activeTab === 'company' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bedrijfsinformatie</h3>
                    <p className="text-sm sm:text-base text-gray-600">Beheer bedrijfsnaam en beschrijving</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrijfsnaam
                      </label>
                      <input
                        type="text"
                        value={config?.company?.name || ''}
                        onChange={(e) => handleInputChange('company', 'name', e.target.value)}
                        placeholder="Motaz Ladderlift"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Oprichtingsjaar
                      </label>
                      <input
                        type="number"
                        value={config?.company?.founded_year || ''}
                        onChange={(e) => handleInputChange('company', 'founded_year', parseInt(e.target.value) || null)}
                        placeholder="2020"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrijfsbeschrijving
                      </label>
                      <textarea
                        value={config?.company?.description || ''}
                        onChange={(e) => handleInputChange('company', 'description', e.target.value)}
                        placeholder="Professionele verhuis- en ladderlift services in Antwerpen en omgeving."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-vertical"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slogan
                      </label>
                      <input
                        type="text"
                        value={config?.company?.tagline || ''}
                        onChange={(e) => handleInputChange('company', 'tagline', e.target.value)}
                        placeholder="Uw betrouwbare partner voor verhuis en ladderlift services"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KvK Nummer
                      </label>
                      <input
                        type="text"
                        value={config?.company?.registration_number || ''}
                        onChange={(e) => handleInputChange('company', 'registration_number', e.target.value)}
                        placeholder="12345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BTW Nummer
                      </label>
                      <input
                        type="text"
                        value={config?.company?.vat_number || ''}
                        onChange={(e) => handleInputChange('company', 'vat_number', e.target.value)}
                        placeholder="BE0123456789"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-sm shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reset naar Standaard</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Weet je zeker dat je alle configuratie wilt resetten naar de standaardwaarden? 
                  Deze actie kan niet ongedaan worden gemaakt.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteConfigurationPage;
