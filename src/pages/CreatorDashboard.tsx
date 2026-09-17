import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  getLoggedInCreatorId, creatorLogout, getCreatorById, listAccountsByCreator,
  listEarningsByCreator, listCampaignsByCreator, listWithdrawalsByCreator,
  getCreatorIncomeSummary, createWithdrawal, updateCreator, type Creator,
  type Campaign, type CreatorEarning, type Withdrawal, type CampaignStatus,
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

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  '待审核': '待审核',
  '待开始': '待开始',
  '进行中': '进行中',
  '待确认': '待确认（请确认广告效果）',
  '已完成': '已完成',
  '已取消': '已取消',
  '退款中': '退款中',
};

function fmtCents(c: number) { return (c / 100).toFixed(2); }

export default function CreatorDashboard() {
  const { t } = useTranslation();
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalEarned: 0, availableBalance: 0, frozenBalance: 0, withdrawnBalance: 0 });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [earnings, setEarnings] = useState<CreatorEarning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tab, setTab] = useState<'overview' | 'campaigns' | 'earnings' | 'withdrawals'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<Creator['cooperation_status']>('开放合作');

  useEffect(() => {
    const id = getLoggedInCreatorId();
    if (!id) {
      // Try to find by phone from localStorage (shared with submit flow)
      const stored = localStorage.getItem('creator_dashboard_id');
      if (stored) setCreatorId(Number(stored));
      return;
    }
    setCreatorId(id);
  }, []);

  useEffect(() => {
    if (!creatorId) return;
    localStorage.setItem('creator_dashboard_id', String(creatorId));
    Promise.all([
      getCreatorById(creatorId),
      listAccountsByCreator(creatorId),
      getCreatorIncomeSummary(creatorId),
      listCampaignsByCreator(creatorId),
      listEarningsByCreator(creatorId),
      listWithdrawalsByCreator(creatorId),
    ]).then(([c, accs, sum, cams, ears, wds]) => {
      setCreator(c);
      setAccounts(accs);
      setSummary(sum);
      setCampaigns(cams);
      setEarnings(ears);
      setWithdrawals(wds);
      if (c) {
        setEditName(c.name);
        setEditStatus(c.cooperation_status);
      }
    });
  }, [creatorId]);

  const handleLogout = () => {
    creatorLogout();
    localStorage.removeItem('creator_dashboard_id');
    setCreatorId(null);
    window.location.href = '/creators/join';
  };

  const handleSaveEdit = async () => {
    if (!creatorId) return;
    await updateCreator(creatorId, { name: editName, cooperation_status: editStatus });
    setCreator(prev => prev ? { ...prev, name: editName, cooperation_status: editStatus } : prev);
    setEditMode(false);
  };

  const handleWithdraw = async () => {
    if (!creatorId) return;
    const amount = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(amount) || amount <= 0) { setWithdrawMsg('请输入有效金额'); return; }
    if (amount > summary.availableBalance) { setWithdrawMsg('可提现余额不足'); return; }
    setWithdrawLoading(true);
    try {
      await createWithdrawal({ creator_id: creatorId, amount, status: 'pending', note: withdrawNote, created_at: new Date().toISOString() });
      setWithdrawMsg('提现申请已提交，等待平台处理');
      setWithdrawAmount('');
      setWithdrawNote('');
      const wds = await listWithdrawalsByCreator(creatorId);
      setWithdrawals(wds);
    } catch (e: any) {
      setWithdrawMsg('提交失败：' + e.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (!creatorId) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-xl font-bold mb-3">创作者后台</h1>
        <p className="text-muted-foreground text-sm mb-6">请先在入驻时登录，或联系管理员获取登录权限。</p>
        <Link to="/creators/submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 inline-block">
          前往入驻
        </Link>
      </div>
    );
  }

  if (!creator) {
    return <div className="text-center py-20 text-muted-foreground">加载中…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">创作者后台</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {creator.name} · {creator.cooperation_status}
          </p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">保存</button>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-md text-sm">取消</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 border rounded-md text-sm">编辑资料</button>
          )}
          <button onClick={handleLogout} className="px-4 py-2 border rounded-md text-sm text-red-500">退出登录</button>
        </div>
      </div>

      {/* Edit form */}
      {editMode && (
        <div className="mb-6 p-4 border rounded-lg bg-card space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">姓名/昵称</label>
            <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">合作状态</label>
            <select value={editStatus} onChange={e => setEditStatus(e.target.value as Creator['cooperation_status'])} className="border rounded-md px-3 py-2 bg-background text-sm">
              <option value="开放合作">开放合作</option>
              <option value="暂停接单">暂停接单</option>
              <option value="已签约">已签约</option>
            </select>
          </div>
        </div>
      )}

      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '累计收入', value: fmtCents(summary.totalEarned), unit: '元', color: 'text-green-600' },
          { label: '可提现', value: fmtCents(summary.availableBalance), unit: '元', color: 'text-primary font-bold' },
          { label: '冻结中', value: fmtCents(summary.frozenBalance), unit: '元', color: 'text-yellow-600' },
          { label: '已提现', value: fmtCents(summary.withdrawnBalance), unit: '元', color: 'text-muted-foreground' },
        ].map(card => (
          <div key={card.label} className="border rounded-xl p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Withdraw */}
      {summary.availableBalance > 0 && (
        <div className="mb-8 p-4 border border-primary/30 rounded-xl bg-primary/5">
          <h3 className="font-semibold mb-3 text-sm">申请提现</h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">提现金额（元）</label>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                placeholder={`最高 ${fmtCents(summary.availableBalance)}`}
                className="border rounded-md px-3 py-2 bg-background text-sm w-40" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground mb-1">备注（可选）</label>
              <input value={withdrawNote} onChange={e => setWithdrawNote(e.target.value)}
                placeholder="如：收款账号信息"
                className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
            </div>
            <button onClick={handleWithdraw} disabled={withdrawLoading}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50">
              {withdrawLoading ? '提交中…' : '提交提现'}
            </button>
          </div>
          {withdrawMsg && <p className="text-sm text-primary mt-2">{withdrawMsg}</p>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {(['overview', 'campaigns', 'earnings', 'withdrawals'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'overview' ? '我的账号' : t === 'campaigns' ? '项目' : t === 'earnings' ? '收入明细' : '提现记录'}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-3 text-sm">基本信息</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">手机：</span>{creator.phone}</div>
              <div><span className="text-muted-foreground">邮箱：</span>{creator.email || '-'}</div>
              <div><span className="text-muted-foreground">公司/MCN：</span>{creator.company || '-'}</div>
              <div><span className="text-muted-foreground">入驻时间：</span>{new Date(creator.submitted_at).toLocaleDateString()}</div>
              <div><span className="text-muted-foreground">内容分类：</span>{creator.categories.join(', ') || '-'}</div>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-3 text-sm">平台账号</h3>
            {accounts.length === 0 ? <p className="text-sm text-muted-foreground">暂无平台账号</p> : (
              <div className="space-y-3">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-sm">{acc.platform} · {acc.account_name}</div>
                      <div className="text-xs text-muted-foreground">{acc.followers.toLocaleString()} 粉丝 · 互动率 {acc.engagement_rate}% · {acc.is_verified}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">均播 {acc.avg_views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">最高 {acc.max_views.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Campaigns */}
      {tab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无项目</div>
          ) : campaigns.map(c => (
            <div key={c.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.platform} · {c.creator_snapshot_account}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    预算：¥{fmtCents(c.budget_total)} · 已放款 ¥{fmtCents(c.budget_released)}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                  {CAMPAIGN_STATUS_LABELS[c.status]}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                创建于 {new Date(c.created_at).toLocaleDateString()}
                {c.started_at && ` · 开始于 ${new Date(c.started_at).toLocaleDateString()}`}
                {c.completed_at && ` · 完成于 ${new Date(c.completed_at).toLocaleDateString()}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Earnings */}
      {tab === 'earnings' && (
        <div className="space-y-3">
          {earnings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无收入记录</div>
          ) : earnings.map(e => (
            <div key={e.id} className="border rounded-lg p-3 bg-card flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">项目 #{e.campaign_id}</div>
                <div className="text-xs text-muted-foreground">
                  佣金 {e.commission_rate * 100}% · 税前 ¥{fmtCents(e.gross_amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleDateString()}
                  {e.released_at && ` · 到账 ${new Date(e.released_at).toLocaleDateString()}`}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${e.status === 'available' ? 'text-green-600' : e.status === 'frozen' ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  +¥{fmtCents(e.net_amount)}
                </div>
                <div className="text-xs text-muted-foreground">{e.status === 'available' ? '可提现' : e.status === 'frozen' ? '冻结中' : e.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Withdrawals */}
      {tab === 'withdrawals' && (
        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无提现记录</div>
          ) : withdrawals.map(w => (
            <div key={w.id} className="border rounded-lg p-3 bg-card flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">¥{fmtCents(w.amount)}</div>
                <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</div>
                {w.note && <div className="text-xs text-muted-foreground">{w.note}</div>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                w.status === 'approved' ? 'bg-green-100 text-green-800' :
                w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{w.status === 'approved' ? '已处理' : w.status === 'pending' ? '待处理' : '已拒绝'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
