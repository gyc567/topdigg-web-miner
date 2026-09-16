import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { getCreatorById, listAccountsByCreator, listCasesByCreator, updateCreator, isAdmin, type Creator, type PlatformAccount, type CollaborationCase, type CooperationStatus } from '@/lib/creators';

const ALL_STATUSES: CooperationStatus[] = ['开放合作', '暂停接单', '已签约'];
const STATUS_COLORS: Record<string, string> = {
  '开放合作': 'bg-green-100 text-green-800',
  '暂停接单': 'bg-yellow-100 text-yellow-800',
  '已签约': 'bg-red-100 text-red-800',
};

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [cases, setCases] = useState<CollaborationCase[]>([]);
  const [loading, setLoading] = useState(true);

  const admin = isAdmin();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCreatorById(id),
      listAccountsByCreator(id),
      listCasesByCreator(id),
    ]).then(([c, accs, cs]) => {
      setCreator(c);
      setAccounts(accs);
      setCases(cs);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center py-16 text-muted-foreground">{t('creatorHub.loading')}</div>;

  if (!creator) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground mb-4">{t('creatorDetail.creatorNotFound')}</p>
      <Link to="/creators" className="text-primary hover:underline">{t('creatorDetail.backToCreatorHub')}</Link>
    </div>
  );

  const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
  const avgEngagement = accounts.length > 0
    ? Math.round(accounts.reduce((sum, a) => sum + a.engagement_rate, 0) / accounts.length * 100) / 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/creators" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">{t('creatorDetail.backToCreatorHub')}</Link>

      {/* Header */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{creator.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {admin ? (
                <select value={creator.cooperation_status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as CooperationStatus;
                    await updateCreator(creator.id, { cooperation_status: newStatus });
                    setCreator(prev => prev ? { ...prev, cooperation_status: newStatus } : prev);
                  }}
                  className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer ${STATUS_COLORS[creator.cooperation_status]}`}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[creator.cooperation_status]}`}>
                  {creator.cooperation_status}
                </span>
              )}
              {creator.categories.map(cat => (
                <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              <span>📞 {creator.phone}</span>
              {creator.email && <span>✉️ {creator.email}</span>}
              {creator.company && <span>🏢 {creator.company}</span>}
              <span>📅 {new Date(creator.submitted_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <MetricCard label={t('creatorDetail.totalFollowers')} value={formatNum(totalFollowers)} />
            <MetricCard label={t('creatorDetail.avgEngagement')} value={avgEngagement + '%'} />
          </div>
        </div>
        {creator.admin_notes && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
            <strong>{t('creatorDetail.adminNotes')}</strong> {creator.admin_notes}
          </div>
        )}
      </div>

      {/* Platform Accounts */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('creatorDetail.platformAccounts')}</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('creatorDetail.noAccountsRegistered')}</p>
        ) : (
          <div className="space-y-4">
            {accounts.map(acc => (
              <div key={acc.id} className="border rounded-lg p-5 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{
                      acc.platform === '抖音' ? '🎵' :
                      acc.platform === '小红书' ? '📕' : '📺'
                    }</span>
                    <div>
                      <p className="font-semibold">{acc.account_name}</p>
                      <a href={acc.account_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline">{acc.account_url}</a>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${acc.is_verified === '蓝V认证' ? 'bg-blue-100 text-blue-800' : 'bg-muted text-muted-foreground'}`}>
                    {acc.is_verified}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label={t('creatorDetail.followers')} value={formatNum(acc.followers)} />
                  <MetricCard label={t('creatorDetail.avgViews')} value={formatNum(acc.avg_views)} />
                  <MetricCard label={t('creatorDetail.maxViews')} value={formatNum(acc.max_views)} />
                  <MetricCard label={t('creatorDetail.engRate')} value={acc.engagement_rate + '%'} />
                </div>
                {acc.rate_card && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-md text-sm">
                    <strong>{t('creatorDetail.rateCard')}</strong> {acc.rate_card}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Collaboration Cases */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t('creatorDetail.pastCollaborations')}</h2>
        {cases.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('creatorDetail.noPastCollaborations')}</p>
        ) : (
          <div className="space-y-3">
            {cases.map(c => (
              <div key={c.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{c.brand_name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{c.platform}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{c.content_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_exclusive === '独家' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                        {c.is_exclusive}
                      </span>
                      {c.cooperation_date && (
                        <span className="text-xs text-muted-foreground">{new Date(c.cooperation_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {c.campaign_url && (
                    <a href={c.campaign_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline">🔗 {t('creatorDetail.viewCampaign')}</a>
                  )}
                </div>
                {c.results && (
                  <p className="mt-2 text-sm text-muted-foreground">{c.results}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
