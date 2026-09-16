import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { listCreators, listAccountsByCreator, updateCreator, isAdmin, type Creator, type PlatformAccount, type CooperationStatus } from '@/lib/creators';

const PLATFORMS: Platform[] = ['视频号', '小红书', '抖音'];
const STATUS_COLORS: Record<CooperationStatus, string> = {
  '开放合作': 'bg-green-100 text-green-800',
  '暂停接单': 'bg-yellow-100 text-yellow-800',
  '已签约': 'bg-red-100 text-red-800',
};
const ALL_STATUSES: CooperationStatus[] = ['开放合作', '暂停接单', '已签约'];

export default function CreatorHub() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [accountsMap, setAccountsMap] = useState<Record<string, PlatformAccount[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | ''>('');
  const [filterStatus, setFilterStatus] = useState<CooperationStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFollowersMin, setFilterFollowersMin] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [showExportLock, setShowExportLock] = useState(false);

  const admin = isAdmin();

  useEffect(() => {
    listCreators().then(async (creators) => {
      setCreators(creators);
      const map: Record<string, PlatformAccount[]> = {};
      await Promise.all(creators.map(async (c) => {
        map[c.id] = await listAccountsByCreator(c.id);
      }));
      setAccountsMap(map);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return creators.filter(c => {
      const accounts = accountsMap[c.id] || [];
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !accounts.some(a => a.account_name.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filterStatus && c.cooperation_status !== filterStatus) return false;
      if (filterPlatform && !accounts.some(a => a.platform === filterPlatform)) return false;
      if (filterCategory && !c.categories.includes(filterCategory as any)) return false;
      if (filterFollowersMin && !accounts.some(a => a.followers >= Number(filterFollowersMin))) return false;
      if (filterVerified === 'true' && !accounts.some(a => a.is_verified === '蓝V认证')) return false;
      if (filterVerified === 'false' && !accounts.every(a => a.is_verified === '普通账号')) return false;
      return true;
    });
  }, [creators, accountsMap, search, filterPlatform, filterStatus, filterCategory, filterFollowersMin, filterVerified]);

  const handleExportCSV = () => {
    if (!admin) { setShowExportLock(true); return; }
    const headers = ['Name', 'Phone', 'Email', 'Company', 'Status', 'Categories', 'Platform', 'Account Name', 'Followers', 'Avg Views', 'Max Views', 'Engagement Rate', 'Verified', 'Rate Card'];
    const rows = filtered.flatMap(c => {
      const accounts = accountsMap[c.id] || [];
      if (accounts.length === 0) {
        return [[c.name, c.phone, c.email || '', c.company || '', c.cooperation_status, c.categories.join(','), '', '', '', '', '', '', '', '']];
      }
      return accounts.map(a => [
        c.name, c.phone, c.email || '', c.company || '', c.cooperation_status, c.categories.join(','),
        a.platform, a.account_name, a.followers, a.avg_views, a.max_views, a.engagement_rate + '%',
        a.is_verified, a.rate_card || '',
      ]);
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creators-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (creatorId: number, newStatus: CooperationStatus) => {
    await updateCreator(creatorId, { cooperation_status: newStatus });
    setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, cooperation_status: newStatus } : c));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Creator Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} creators{filtersActive() && ` (filtered from ${creators.length})`}
          </p>
        </div>
        <div className="flex gap-2">
          {showExportLock && (
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-yellow-50 text-sm">
              <span className="text-yellow-800">🔒 Admin required</span>
              <button onClick={() => { setShowExportLock(false); navigate('/creators/admin'); }}
                className="text-primary underline text-xs">Login</button>
              <button onClick={() => setShowExportLock(false)} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
          )}
          <button onClick={handleExportCSV}
            className="px-4 py-2 border rounded-md hover:bg-muted text-sm flex items-center gap-1.5 disabled:opacity-50">
            {admin ? '' : '🔒 '}<span>Export CSV</span>
          </button>
          <Link to="/creators/submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 text-sm">
            + Submit Creator
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or account..."
          className="border rounded-md px-3 py-1.5 text-sm bg-background flex-1 min-w-[200px]" />
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value as Platform | '')}
          className="border rounded-md px-3 py-1.5 text-sm bg-background">
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as CooperationStatus | '')}
          className="border rounded-md px-3 py-1.5 text-sm bg-background">
          <option value="">All Status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background">
          <option value="">All Categories</option>
          {['知识干货','小清新','接地气','娱乐搞笑','测评好物','生活方式','职场成长','科技数码','美食','旅行','健身','美妆','母婴','教育'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterFollowersMin} onChange={e => setFilterFollowersMin(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background">
          <option value="">Any Followers</option>
          <option value="10000">10k+</option>
          <option value="100000">100k+</option>
          <option value="500000">500k+</option>
        </select>
        <select value={filterVerified} onChange={e => setFilterVerified(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background">
          <option value="">Any Verification</option>
          <option value="true">蓝V Only</option>
          <option value="false">Non-verified</option>
        </select>
        {filtersActive() && (
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline px-2 py-1.5">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🔍</p>
          <p>No creators match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => {
            const accounts = accountsMap[c.id] || [];
            return (
              <div key={c.id}
                className="block border rounded-lg p-4 hover:border-primary transition-colors bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link to={`/creators/${c.id}`} className="font-semibold text-base hover:text-primary">
                        {c.name}
                      </Link>
                      {admin ? (
                        <select value={c.cooperation_status}
                          onChange={e => handleStatusChange(c.id, e.target.value as CooperationStatus)}
                          className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer ${STATUS_COLORS[c.cooperation_status]}`}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.cooperation_status]}`}>
                          {c.cooperation_status}
                        </span>
                      )}
                      {c.categories.map(cat => (
                        <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span>📞 {c.phone}</span>
                      {c.email && <span>✉️ {c.email}</span>}
                      {c.company && <span>🏢 {c.company}</span>}
                      {c.submitted_at && <span>📅 {new Date(c.submitted_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {accounts.map(acc => (
                      <span key={acc.id} className="text-xs px-2 py-1 rounded-md bg-muted border">
                        {acc.platform} · {formatNumber(acc.followers)}粉 · {acc.engagement_rate}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  function filtersActive() {
    return !!(search || filterPlatform || filterStatus || filterCategory || filterFollowersMin || filterVerified);
  }

  function clearFilters() {
    setSearch('');
    setFilterPlatform('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterFollowersMin('');
    setFilterVerified('');
  }
}

function formatNumber(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
