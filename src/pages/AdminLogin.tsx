import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { login, logout, isAdmin } from '@/lib/creators';

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError(t('adminLogin.pleaseEnterPassword')); return; }
    setLoading(true);
    setError('');
    const ok = await login(password);
    setLoading(false);
    if (ok) { navigate('/creators'); }
    else { setError(t('adminLogin.incorrectPassword')); setPassword(''); }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="max-w-sm mx-auto text-center py-20">
      <div className="text-6xl mb-6">{isAdmin() ? '🔓' : '🔒'}</div>

      {isAdmin() ? (
        <>
          <h1 className="text-2xl font-bold mb-2">{t('adminLogin.adminModeActive')}</h1>
          <p className="text-muted-foreground mb-8">{t('adminLogin.loggedInAsAdmin')}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/creators')}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 font-medium">
              {t('adminLogin.goToCreatorHub')}
            </button>
            <button onClick={handleLogout}
              className="px-6 py-2.5 border rounded-md hover:bg-muted text-sm">
              {t('adminLogin.logout')}
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">{t('adminLogin.adminLogin')}</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {t('adminLogin.adminPasswordDesc')}
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-md px-4 py-2.5 bg-background"
              placeholder={t('adminLogin.enterPassword')}
              autoFocus
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 text-left">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 font-medium">
              {loading ? t('adminLogin.verifying') : t('adminLogin.unlockAdmin')}
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-6">
            {t('adminLogin.contactAdmin')}
          </p>
        </>
      )}
    </div>
  );
}
