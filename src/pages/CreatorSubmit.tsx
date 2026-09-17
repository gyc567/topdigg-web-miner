import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createCreator, createAccount, createCase, autoApproveCreator } from '@/lib/creators';
import type { CooperationStatus, Platform, ContentCategory, ContentType, ExclusiveType } from '@/lib/creators';

const PLATFORMS: Platform[] = ['视频号', '小红书', '抖音'];
const CATEGORIES: ContentCategory[] = [
  '知识干货', '小清新', '接地气', '娱乐搞笑', '测评好物', '生活方式',
  '职场成长', '科技数码', '美食', '旅行', '健身', '美妆', '母婴', '教育',
];

interface PlatformForm {
  platform: Platform;
  account_name: string;
  account_url: string;
  followers: string;
  avg_views: string;
  max_views: string;
  likes_avg: string;
  comments_avg: string;
  is_verified: '蓝V认证' | '普通账号';
  rate_card: string;
}

interface CaseForm {
  platform: Platform;
  brand_name: string;
  content_type: ContentType;
  is_exclusive: ExclusiveType;
  campaign_url: string;
  results: string;
  cooperation_date: string;
}

export default function CreatorSubmit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [cooperationStatus, setCooperationStatus] = useState<CooperationStatus>('开放合作');
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [referralSource, setReferralSource] = useState('');

  // Step 2: Platform accounts
  const [platformForms, setPlatformForms] = useState<PlatformForm[]>([
    { platform: '视频号', account_name: '', account_url: '', followers: '', avg_views: '', max_views: '', likes_avg: '', comments_avg: '', is_verified: '普通账号', rate_card: '' },
  ]);

  // Step 3: Cases
  const [cases, setCases] = useState<CaseForm[]>([]);

  const toggleCategory = (cat: ContentCategory) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const addPlatform = () => {
    const used = platformForms.map(p => p.platform);
    const next = PLATFORMS.find(p => !used.includes(p)) || '视频号';
    setPlatformForms(prev => [...prev, { platform: next, account_name: '', account_url: '', followers: '', avg_views: '', max_views: '', likes_avg: '', comments_avg: '', is_verified: '普通账号', rate_card: '' }]);
  };

  const removePlatform = (index: number) => {
    setPlatformForms(prev => prev.filter((_, i) => i !== index));
  };

  const updatePlatform = (index: number, field: keyof PlatformForm, value: string) => {
    setPlatformForms(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addCase = () => {
    setCases(prev => [...prev, { platform: '视频号', brand_name: '', content_type: '图文', is_exclusive: '非独家', campaign_url: '', results: '', cooperation_date: '' }]);
  };

  const removeCase = (index: number) => {
    setCases(prev => prev.filter((_, i) => i !== index));
  };

  const updateCase = (index: number, field: keyof CaseForm, value: string) => {
    setCases(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError(t('creatorSubmit.namePhoneRequired'));
      return;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError(t('creatorSubmit.invalidPhone'));
      return;
    }
    const validAccounts = platformForms.filter(p => p.account_name.trim() && p.account_url.trim());
    if (validAccounts.length === 0) {
      setError(t('creatorSubmit.atLeastOneAccount'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const creatorId = await createCreator({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        cooperation_status: cooperationStatus,
        categories,
        referral_source: referralSource as any || undefined,
        submitted_at: new Date().toISOString(),
      });

      for (const acc of validAccounts) {
        await createAccount({
          creator_id: creatorId,
          platform: acc.platform,
          account_name: acc.account_name.trim(),
          account_url: acc.account_url.trim(),
          followers: Number(acc.followers) || 0,
          avg_views: Number(acc.avg_views) || 0,
          max_views: Number(acc.max_views) || 0,
          likes_avg: Number(acc.likes_avg) || 0,
          comments_avg: Number(acc.comments_avg) || 0,
          is_verified: acc.is_verified,
          rate_card: acc.rate_card.trim() || undefined,
        });
      }

      for (const c of cases.filter(c => c.brand_name.trim())) {
        await createCase({
          creator_id: creatorId,
          platform: c.platform,
          brand_name: c.brand_name.trim(),
          content_type: c.content_type,
          is_exclusive: c.is_exclusive,
          campaign_url: c.campaign_url.trim() || undefined,
          results: c.results.trim() || undefined,
          cooperation_date: c.cooperation_date || undefined,
        });
      }

      setStep(4); // success

      // Trigger auto-approval asynchronously (non-blocking)
      autoApproveCreator(creatorId).catch(() => {});
    } catch (err: any) {
      setError(err.message || t('creatorSubmit.submissionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const notConfigured = false; // SQLite always available

  if (notConfigured) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
          <h2 className="text-lg font-semibold mb-2">{t('creatorSubmit.setupRequired')}</h2>
          <p className="text-sm">{t('creatorSubmit.sqliteReady')}</p>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold mb-4">{t('creatorSubmit.submissionReceived')}</h1>
        <p className="text-muted-foreground mb-8">{t('creatorSubmit.submissionSuccessDesc')}</p>
        <button onClick={() => navigate('/creators')} className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
          {t('creatorSubmit.viewAllCreators')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
            <p className="text-xs text-center mt-1 text-muted-foreground">
              {s === 1 ? t('creatorSubmit.basicInfo') : s === 2 ? t('creatorSubmit.platforms') : t('creatorSubmit.cases')}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-700">{error}</div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{t('creatorSubmit.creatorRegistration')}</h1>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.nameNickname')}</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" placeholder={t('creatorSubmit.nameNickname')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.phone')}</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" placeholder="1XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" placeholder={t('creatorSubmit.email')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.mcnCompany')}</label>
              <input value={company} onChange={e => setCompany(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" placeholder={t('creatorSubmit.mcnCompany')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.cooperationStatus')}</label>
              <div className="flex gap-3">
                {[
                  { value: '开放合作', label: t('creatorSubmit.organic') },
                  { value: '暂停接单', label: t('creatorSubmit.paused') },
                  { value: '已签约', label: t('creatorSubmit.signed') },
                ].map(s => (
                  <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={cooperationStatus === s.value} onChange={() => setCooperationStatus(s.value)} />
                    <span className="text-sm">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.contentCategories')}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${categories.includes(cat) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-muted hover:border-primary'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('creatorSubmit.howDidYouFindUs')}</label>
              <select value={referralSource} onChange={e => setReferralSource(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background">
                <option value="">{t('creatorSubmit.select')}</option>
                <option value="自然流量">{t('creatorSubmit.organic')}</option>
                <option value="朋友推荐">{t('creatorSubmit.friendReferral')}</option>
                <option value="运营邀请">{t('creatorSubmit.invitation')}</option>
                <option value="其他">{t('creatorSubmit.other')}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90" disabled={!name.trim() || !phone.trim()}>
              {t('creatorSubmit.nextPlatformAccounts')}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Platform Accounts */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t('creatorSubmit.platformAccounts')}</h1>
            <button onClick={addPlatform} className="text-sm text-primary hover:underline">+ {t('creatorSubmit.addPlatform')}</button>
          </div>
          {platformForms.map((form, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <select value={form.platform} onChange={e => updatePlatform(idx, 'platform', e.target.value as Platform)}
                  className="border rounded-md px-2 py-1 bg-background text-sm">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {platformForms.length > 1 && (
                  <button onClick={() => removePlatform(idx)} className="text-sm text-red-500 hover:underline">{t('creatorSubmit.remove')}</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.accountName')}</label>
                  <input value={form.account_name} onChange={e => updatePlatform(idx, 'account_name', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.profileUrl')}</label>
                  <input value={form.account_url} onChange={e => updatePlatform(idx, 'account_url', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.followers')}</label>
                  <input type="number" value={form.followers} onChange={e => updatePlatform(idx, 'followers', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.avgViews')}</label>
                  <input type="number" value={form.avg_views} onChange={e => updatePlatform(idx, 'avg_views', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.maxViews')}</label>
                  <input type="number" value={form.max_views} onChange={e => updatePlatform(idx, 'max_views', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.avgLikes')}</label>
                  <input type="number" value={form.likes_avg} onChange={e => updatePlatform(idx, 'likes_avg', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.avgComments')}</label>
                  <input type="number" value={form.comments_avg} onChange={e => updatePlatform(idx, 'comments_avg', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.verification')}</label>
                  <select value={form.is_verified} onChange={e => updatePlatform(idx, 'is_verified', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                    <option value="普通账号">{t('creatorSubmit.nonVerified')}</option>
                    <option value="蓝V认证">{t('creatorSubmit.blueV')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('creatorSubmit.rateCard')}</label>
                <textarea value={form.rate_card} onChange={e => updatePlatform(idx, 'rate_card', e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm" rows={2}
                  placeholder={t('creatorSubmit.rateCard')} />
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-md hover:bg-muted">{t('creatorSubmit.back')}</button>
            <button onClick={() => setStep(3)} className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">{t('creatorSubmit.nextCases')}</button>
          </div>
        </div>
      )}

      {/* Step 3: Collaboration Cases */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t('creatorSubmit.pastCollaborationCases')}</h1>
            <button onClick={addCase} className="text-sm text-primary hover:underline">+ {t('creatorSubmit.addCase')}</button>
          </div>
          {cases.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('creatorSubmit.noCasesYet')}</p>
          )}
          {cases.map((c, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('creatorSubmit.caseN', { idx: idx + 1 })}</span>
                <button onClick={() => removeCase(idx)} className="text-sm text-red-500 hover:underline">{t('creatorSubmit.remove')}</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.brandName')}</label>
                  <input value={c.brand_name} onChange={e => updateCase(idx, 'brand_name', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.platform')}</label>
                  <select value={c.platform} onChange={e => updateCase(idx, 'platform', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.contentType')}</label>
                  <select value={c.content_type} onChange={e => updateCase(idx, 'content_type', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                    {[
                      { value: '图文', label: '图文' },
                      { value: '短视频', label: '短视频' },
                      { value: '直播', label: '直播' },
                      { value: '长期代言', label: '长期代言' },
                    ].map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.exclusive')}</label>
                  <select value={c.is_exclusive} onChange={e => updateCase(idx, 'is_exclusive', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                    {[
                      { value: '独家', label: '独家' },
                      { value: '非独家', label: '非独家' },
                    ].map(ex => <option key={ex.value} value={ex.value}>{ex.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.campaignUrl')}</label>
                  <input value={c.campaign_url} onChange={e => updateCase(idx, 'campaign_url', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('creatorSubmit.resultsDescription')}</label>
                  <textarea value={c.results} onChange={e => updateCase(idx, 'results', e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background text-sm" rows={2} placeholder={t('creatorSubmit.resultsDescription')} />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-md hover:bg-muted">{t('creatorSubmit.back')}</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">
              {submitting ? t('creatorSubmit.submitting') : t('creatorSubmit.submitProfile')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
