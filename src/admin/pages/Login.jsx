import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User,
  LogIn
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Demo credentials - في التطبيق الحقيقي ستكون من قاعدة البيانات
      if (formData.username === 'admin' && formData.password === 'motaz123') {
        // Store auth token and admin secret
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminSecret', 'your-admin-secret-here'); // يجب تغيير هذا في الإنتاج
        localStorage.setItem('adminUser', JSON.stringify({
          username: formData.username,
          loginTime: new Date().toISOString()
        }));
        onLogin(true);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-bg via-gray-50 to-admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="admin-card overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mb-6">
                <img 
                  src="/images/FurnitureTransport.png" 
                  alt="Motaz Logo" 
                  className="w-20 h-20 mx-auto object-contain drop-shadow-lg filter hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">Admin paneel</h2>
              <p className="text-admin-text-secondary">Log in om de website te beheren</p>
            </div>

            {error && (
              <div className="alert-error mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-admin-text mb-2">Gebruikersnaam</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-admin-text-secondary" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Gebruikersnaam"
                    required
                    className="admin-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-text mb-2">Wachtwoord</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-admin-text-secondary" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Wachtwoord"
                    required
                    className="admin-input pl-10 pr-12"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-admin-text-secondary hover:text-admin-primary transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full admin-button py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="spinner"></div>
                    <span>Bezig met inloggen...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <LogIn size={20} />
                    <span>Inloggen</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-center text-admin-text-secondary">
                <strong>Demo login:</strong> admin / motaz123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
