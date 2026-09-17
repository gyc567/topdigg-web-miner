import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isAdvertiserLoggedIn, getLoggedInAdvertiserPhone, advertiserLogin, advertiserLogout,
  getAdvertiserByPhone, getAdvertiserById,
  listCreators, listAccountsByCreator, getCreatorById,
  listCampaignsByAdvertiser, listTransactionsByAdvertiser,
  createAdvertiser, advertiserTopUp, createCampaignWithPayment, advertiserConfirm, advertiserRefund,
  updateCampaign,
  type Creator, type PlatformAccount, type Campaign, type Transaction,
  type CampaignStatus, PLATFORM_OPTIONS,
} from '@/lib/creators';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  '待审核': 'bg-yellow-100 text-yellow-800',
  '待开始': 'bg-blue-100 text-blue-800',
  '进行中': 'bg-green-100 text-green-800',
  '待确认': 'bg-orange-100 text-orange-800',
  '已完成': 'bg-gray-100 text-gray-800',
  '已取消': 'bg-red-100 text-red-800',
  '退款中': 'bg-red-100 text-red-800',
};

function fmtCents(c: number) { return (c / 100).toFixed(2); }

export default function AdvertiserDashboard() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [advertiser, setAdvertiser] = useState<any>(null);
  const [tab, setTab] = useState<'browse' | 'campaigns' | 'balance'>('browse');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [loginError, setLoginError] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupMsg, setTopupMsg] = useState('');

  // Browse creators
  const [creators, setCreators] = useState<Creator[]>([]);
  const [accountsMap, setAccountsMap] = useState<Record<number, PlatformAccount[]>>({});
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [filterFollowers, setFilterFollowers] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Create campaign
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PlatformAccount | null>(null);
  const [campaignPlatform, setCampaignPlatform] = useState<string>('视频号');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Campaigns & Transactions
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const phone = getLoggedInAdvertiserPhone();
    if (phone) {
      advertiserLogin(phone);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const phone = getLoggedInAdvertiserPhone();
    if (!phone) return;
    getAdvertiserByPhone(phone).then(adv => {
      if (adv) setAdvertiser(adv);
    });
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    listCreators().then(async (creators) => {
      // Only show approved creators
      const approved = creators.filter(c => c.cooperation_status === '开放合作');
      setCreators(approved);
      const map: Record<number, PlatformAccount[]> = {};
      await Promise.all(approved.map(async (c) => {
        map[c.id] = await listAccountsByCreator(c.id);
      }));
      setAccountsMap(map);
    });
    const phone = getLoggedInAdvertiserPhone();
    if (!phone) return;
    getAdvertiserByPhone(phone).then(async (adv) => {
      if (!adv) return;
      const cams = await listCampaignsByAdvertiser(adv.id);
      setCampaigns(cams);
      const txns = await listTransactionsByAdvertiser(adv.id);
      setTransactions(txns);
    });
  }, [loggedIn]);

  const handleLogin = async () => {
    setLoginError('');
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) { setLoginError('请输入有效手机号'); return; }
    if (loginMode === 'register') {
      if (!name.trim()) { setLoginError('请输入姓名/公司名'); return; }
      const existing = await getAdvertiserByPhone(phone);
      if (existing) { setLoginError('该手机号已注册，请登录'); return; }
      const id = await createAdvertiser({ name: name.trim(), phone, email: '', company: '', balance: 0, created_at: new Date().toISOString() });
      advertiserLogin(phone);
      const adv = await getAdvertiserById(id);
      setAdvertiser(adv);
      setLoggedIn(true);
    } else {
      const adv = await getAdvertiserByPhone(phone);
      if (!adv) { setLoginError('未找到账号，请先注册'); return; }
      advertiserLogin(phone);
      setAdvertiser(adv);
      setLoggedIn(true);
    }
  };

  const handleLogout = () => {
    advertiserLogout();
    setLoggedIn(false);
    setAdvertiser(null);
  };

  const handleTopUp = async () => {
    if (!advertiser) return;
    const amount = Math.round(parseFloat(topupAmount) * 100);
    if (isNaN(amount) || amount <= 0) { setTopupMsg('请输入有效金额'); return; }
    try {
      await advertiserTopUp(advertiser.id, amount);
      const updated = await getAdvertiserById(advertiser.id);
      setAdvertiser(updated);
      setTopupMsg(`充值成功！当前余额：¥${fmtCents(updated!.balance)}`);
      setTopupAmount('');
    } catch (e: any) {
      setTopupMsg('充值失败：' + e.message);
    }
  };

  const handleCreateCampaign = async () => {
    if (!advertiser || !selectedCreator || !selectedAccount) return;
    setCreateError('');
    const budget = Math.round(parseFloat(campaignBudget) * 100);
    if (isNaN(budget) || budget < 50000) { setCreateError('预算最低 500 元'); return; }
    if (!campaignTitle.trim()) { setCreateError('请填写投放标题'); return; }
    if (advertiser.balance < budget) { setCreateError('余额不足，请先充值'); return; }
    try {
      const campaignId = await createCampaignWithPayment(
        advertiser.id, selectedCreator.id, campaignPlatform as any,
        campaignTitle.trim(), campaignDesc.trim(), budget,
        selectedCreator.name, selectedAccount.platform as any, selectedAccount.account_name
      );
      setCreateSuccess(`投放创建成功！项目 ID: ${campaignId}`);
      setCampaignTitle(''); setCampaignDesc(''); setCampaignBudget('');
      setSelectedCreator(null); setSelectedAccount(null);
      // Refresh
      const cams = await listCampaignsByAdvertiser(advertiser.id);
      setCampaigns(cams);
      const updated = await getAdvertiserById(advertiser.id);
      setAdvertiser(updated);
    } catch (e: any) {
      setCreateError('创建失败：' + e.message);
    }
  };

  const handleConfirm = async (campaignId: number) => {
    await advertiserConfirm(campaignId);
    const cams = await listCampaignsByAdvertiser(advertiser!.id);
    setCampaigns(cams);
    const updated = await getAdvertiserById(advertiser!.id);
    setAdvertiser(updated);
    const txns = await listTransactionsByAdvertiser(advertiser!.id);
    setTransactions(txns);
  };

  const handleRefund = async (campaignId: number) => {
    await advertiserRefund(campaignId);
    const cams = await listCampaignsByAdvertiser(advertiser!.id);
    setCampaigns(cams);
    const updated = await getAdvertiserById(advertiser!.id);
    setAdvertiser(updated);
    const txns = await listTransactionsByAdvertiser(advertiser!.id);
    setTransactions(txns);
  };

  const filteredCreators = creators.filter(c => {
    const accs = accountsMap[c.id] || [];
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !accs.some(a => a.account_name.includes(search))) return false;
    if (filterPlatform && !accs.some(a => a.platform === filterPlatform)) return false;
    if (filterFollowers && !accs.some(a => a.followers >= Number(filterFollowers))) return false;
    if (filterCategory && !c.categories.includes(filterCategory as any)) return false;
    return true;
  });

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto text-center py-20">
        <div className="text-5xl mb-4">📢</div>
        <h1 className="text-xl font-bold mb-3">广告主登录</h1>
        <p className="text-sm text-muted-foreground mb-6">输入手机号登录或注册新账号</p>
        <div className="space-y-3 text-left">
          <div>
            <label className="block text-sm font-medium mb-1">手机号</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="1XXXXXXXXXX"
              className="w-full border rounded-md px-3 py-2 bg-background" />
          </div>
          {loginMode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">姓名/公司名</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="张三 / XX公司"
                className="w-full border rounded-md px-3 py-2 bg-background" />
            </div>
          )}
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button onClick={handleLogin}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
            {loginMode === 'login' ? '登录' : '注册'}
          </button>
          <button onClick={() => { setLoginMode(m => m === 'login' ? 'register' : 'login'); setLoginError(''); }}
            className="w-full text-sm text-primary hover:underline">
            {loginMode === 'login' ? '没有账号？立即注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    );
  }

  // ── Logged in ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">广告主后台</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {advertiser?.name} · 余额：<span className="font-bold text-primary">¥{fmtCents(advertiser?.balance || 0)}</span>
          </p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 border rounded-md text-sm text-red-500">退出登录</button>
      </div>

      {/* Balance quick-action */}
      <div className="mb-6 p-4 border border-primary/20 rounded-xl bg-primary/5">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">充值金额（元）</label>
            <input type="number" value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
              placeholder="输入金额"
              className="border rounded-md px-3 py-2 bg-background text-sm w-40" />
          </div>
          <button onClick={handleTopUp} className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90">
            充值
          </button>
          {topupMsg && <span className="text-sm text-primary">{topupMsg}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-2">⚠️ 演示模式：充值仅更新本地余额，无真实支付通道</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {(['browse', 'campaigns', 'balance'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'browse' ? '浏览创作者' : t === 'campaigns' ? '我的投放' : '资金明细'}
          </button>
        ))}
      </div>

      {/* ── Browse Creators ── */}
      {tab === 'browse' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索创作者姓名或账号名"
              className="border rounded-md px-3 py-1.5 text-sm bg-background flex-1 min-w-[200px]" />
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background">
              <option value="">全平台</option>
              {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterFollowers} onChange={e => setFilterFollowers(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background">
              <option value="">任意粉丝</option>
              <option value="10000">10w+</option>
              <option value="100000">100w+</option>
              <option value="500000">500w+</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background">
              <option value="">全部分类</option>
              {['知识干货','小清新','接地气','娱乐搞笑','测评好物','生活方式','职场成长','科技数码'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Creator list */}
          {filteredCreators.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无符合条件的创作者</div>
          ) : (
            <div className="space-y-3">
              {filteredCreators.map(c => {
                const accs = accountsMap[c.id] || [];
                return (
                  <div key={c.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.categories.slice(0, 3).join(' · ')}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {accs.map(a => (
                            <span key={a.id} className="text-xs px-2 py-0.5 rounded bg-muted">
                              {a.platform} · {a.followers.toLocaleString()}粉 · 互动{a.engagement_rate}%
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedCreator(c); setSelectedAccount(accs[0] || null); setCampaignPlatform(accs[0]?.platform || '视频号'); }}
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 flex-shrink-0"
                      >
                        投放
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create campaign modal (inline) */}
          {selectedCreator && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-background border rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">创建投放</h3>
                  <button onClick={() => setSelectedCreator(null)} className="text-muted-foreground hover:text-foreground">×</button>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  创作者：{selectedCreator.name}
                  {selectedAccount && <span> · {selectedAccount.platform} · {selectedAccount.account_name}</span>}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">投放标题 *</label>
                    <input value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-background text-sm" placeholder="例如：产品测评合作" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">平台</label>
                    <select value={campaignPlatform} onChange={e => setCampaignPlatform(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                      {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">预算（元）*</label>
                    <input type="number" value={campaignBudget} onChange={e => setCampaignBudget(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-background text-sm" placeholder="最低 500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">需求描述</label>
                    <textarea value={campaignDesc} onChange={e => setCampaignDesc(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-background text-sm" rows={3} placeholder="描述你的推广需求…" />
                  </div>
                  {createError && <p className="text-sm text-red-600">{createError}</p>}
                  {createSuccess && <p className="text-sm text-green-600">{createSuccess}</p>}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setSelectedCreator(null)} className="px-4 py-2 border rounded-md text-sm">取消</button>
                    <button onClick={handleCreateCampaign} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90">
                      确认创建（预付 50%）
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Campaigns ── */}
      {tab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无投放记录</div>
          ) : campaigns.map(c => (
            <div key={c.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    创作者：{c.creator_snapshot_name} · {c.creator_snapshot_platform} · {c.creator_snapshot_account}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    预算：¥{fmtCents(c.budget_total)} · 已放款 ¥{fmtCents(c.budget_released)} · 已确认 ¥{fmtCents(c.budget_confirmed)}
                  </div>
                  {c.description && <div className="text-xs text-muted-foreground mt-1">{c.description}</div>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                {c.status === '进行中' && (
                  <button onClick={() => handleConfirm(c.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:opacity-90">
                    确认效果（付尾款）
                  </button>
                )}
                {['待审核', '待开始', '进行中'].includes(c.status) && (
                  <button onClick={() => handleRefund(c.id)}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-xs hover:bg-red-50">
                    退款
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Balance ── */}
      {tab === 'balance' && (
        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground">当前余额</div>
            <div className="text-2xl font-bold text-primary">¥{fmtCents(advertiser?.balance || 0)}</div>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无资金记录</div>
          ) : transactions.map(tx => (
            <div key={tx.id} className="border rounded-lg p-3 bg-card flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{tx.type}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(tx.created_at).toLocaleString()}
                  {tx.remark && ` · ${tx.remark}`}
                </div>
              </div>
              <div className={`text-sm font-bold ${tx.type === '退款' ? 'text-red-600' : 'text-green-600'}`}>
                {tx.type === '退款' ? '-' : '+'}¥{fmtCents(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
