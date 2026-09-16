import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, logout, isAdmin } from '@/lib/creators';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError('Please enter password'); return; }
    setLoading(true);
    setError('');
    const ok = await login(password);
    setLoading(false);
    if (ok) { navigate('/creators'); }
    else { setError('Incorrect password'); setPassword(''); }
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
          <h1 className="text-2xl font-bold mb-2">Admin Mode Active</h1>
          <p className="text-muted-foreground mb-8">You are logged in as administrator.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/creators')}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 font-medium">
              Go to Creator Hub
            </button>
            <button onClick={handleLogout}
              className="px-6 py-2.5 border rounded-md hover:bg-muted text-sm">
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Enter the administrator password to unlock export and status editing.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-md px-4 py-2.5 bg-background"
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 text-left">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 font-medium">
              {loading ? 'Verifying...' : 'Unlock Admin'}
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-6">
            Contact administrator if locked out.
          </p>
        </>
      )}
    </div>
  );
}
