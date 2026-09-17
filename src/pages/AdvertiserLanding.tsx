import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PROCESS = [
  { n: 1, title: '浏览创作者', desc: '按平台/粉丝量/内容类型筛选合适博主' },
  { n: 2, title: '创建投放', desc: '填写需求并预付 50% 预算到平台' },
  { n: 3, title: '博主执行', desc: '博主开始推广，全程可跟踪' },
  { n: 4, title: '效果确认', desc: '满意后付剩余 50%，完成投放' },
];

export default function AdvertiserLanding() {
  const { t } = useTranslation();
  const WECHAT = '360369487';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          广告主入口
        </div>
        <h1 className="text-4xl font-bold mb-4">
          找到合适的创作者，让推广更简单
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          预付 50% 起步，效果满意再付尾款。全程平台托管，7 天无理由退款，无账期。
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/advertisers/dashboard"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            立即投放 →
          </Link>
          <a
            href={`https://wa.me/${WECHAT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border rounded-lg hover:bg-muted transition-colors"
          >
            咨询合作
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-16 px-4">
        {[
          { value: '50%', label: '预付起步', sub: '满意后再付尾款' },
          { value: '7天', label: '无理由退款', sub: '风险由平台承担' },
          { value: '1%', label: '超低佣金', sub: '创作者让利给你' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-6 border rounded-xl bg-card">
            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="font-medium">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Process */}
      <div className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">合作流程</h2>
        <div className="flex items-start gap-4 justify-center flex-wrap">
          {PROCESS.map((step, i) => (
            <div key={step.n} className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-2 mx-auto">
                  {step.n}
                </div>
                <div className="font-semibold text-sm">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">{step.desc}</div>
              </div>
              {i < PROCESS.length - 1 && (
                <div className="text-muted-foreground mt-5 hidden sm:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Why us */}
      <div className="px-4 mb-16">
        <h2 className="text-xl font-bold text-center mb-8">为什么选择我们</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '🛡️', title: '资金托管', desc: '预算先到平台，完成后才打给创作者' },
            { icon: '🔍', title: '真实数据', desc: '平台账号经自动审核验证，排除虚假粉丝' },
            { icon: '💰', title: '无账期', desc: '完成即结算，不拖欠创作者，也不拖欠你' },
            { icon: '📋', title: '7 天退款', desc: '效果不满意，无条件退还未执行部分' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 p-4 border rounded-xl bg-card">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-16 px-4">
        <h2 className="text-2xl font-bold mb-4">准备好开始了？</h2>
        <p className="text-muted-foreground mb-6">浏览创作者列表，找到最适合你的博主。</p>
        <Link
          to="/advertisers/dashboard"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          浏览创作者 →
        </Link>
      </div>
    </div>
  );
}
