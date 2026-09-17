import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PLATFORM_OPTIONS, CATEGORY_OPTIONS } from '@/lib/creators';

const PLATFORM_ICONS: Record<string, string> = {
  '视频号': '🎬',
  '小红书': '📕',
  '抖音': '🎵',
};

const STEPS = [
  { n: 1, title: '提交资料', desc: '填写基本信息与平台账号' },
  { n: 2, title: '自动审核', desc: '系统验证手机号与账号真实性' },
  { n: 3, title: '开放接单', desc: '审核通过后立即开始在平台展示' },
];

export default function CreatorJoin() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          创作者入驻
        </div>
        <h1 className="text-4xl font-bold mb-4">
          把你的流量变成收入
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          入驻 TopDigg，接广告主投放订单。平台抽佣仅 1%，预付 50% 起步，满意后再付尾款，无账期。
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/creators/submit"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            立即入驻 →
          </Link>
          <a
            href="#process"
            className="px-8 py-3 border rounded-lg hover:bg-muted transition-colors"
          >
            了解流程
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-16 px-4">
        {[
          { value: '1%', label: '平台抽佣', sub: '行业最低档' },
          { value: '50%', label: '预付比例', sub: '满意后再付尾款' },
          { value: '0', label: '账期', sub: '结算无等待' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-6 border rounded-xl bg-card">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="font-medium">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Platforms */}
      <div className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">支持的平台</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          {PLATFORM_OPTIONS.map((p) => (
            <div key={p} className="flex items-center gap-2 px-5 py-3 border rounded-lg bg-card">
              <span className="text-2xl">{PLATFORM_ICONS[p]}</span>
              <span className="font-medium">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div id="process" className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">入驻流程</h2>
        <div className="flex items-start gap-4 justify-center flex-wrap">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-2 mx-auto">
                  {step.n}
                </div>
                <div className="font-semibold text-sm">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">{step.desc}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="text-muted-foreground mt-5 hidden sm:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">内容分类</h2>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {CATEGORY_OPTIONS.map((cat) => (
            <span key={cat} className="px-3 py-1.5 rounded-full bg-muted text-sm">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">入驻门槛</h2>
        <div className="max-w-md mx-auto space-y-3">
          {[
            '任一平台账号粉丝 ≥ 1,000',
            '手机号真实有效（用于接收订单通知）',
            '账号内容原创，无违规记录',
            '合作状态设为「开放合作」',
          ].map((req) => (
            <div key={req} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <span className="text-green-600 text-lg">✓</span>
              <span className="text-sm">{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">常见问题</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              q: '佣金怎么算？',
              a: '平台仅收取 1% 佣金。例如广告主付 1000 元，创作者实得 990 元，平台赚 10 元。',
            },
            {
              q: '收款流程是怎样的？',
              a: '广告主预付 50% 到平台后即刻到账，满意后付剩余 50%。全程无账期，平台不拖款。',
            },
            {
              q: '入驻需要费用吗？',
              a: '完全免费入驻，不收任何入驻费或月费。',
            },
            {
              q: '如何保护创作者权益？',
              a: '平台提供撮合服务，广告主需预付全款到平台托管，确保创作者按时收款。',
            },
          ].map((faq) => (
            <div key={faq.q} className="p-4 border rounded-lg bg-card">
              <div className="font-medium text-sm mb-1">{faq.q}</div>
              <div className="text-sm text-muted-foreground">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-16 px-4">
        <h2 className="text-2xl font-bold mb-4">准备好开始了？</h2>
        <p className="text-muted-foreground mb-6">入驻审核自动完成，提交后即刻知道结果。</p>
        <Link
          to="/creators/submit"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          立即入驻 →
        </Link>
      </div>
    </div>
  );
}
