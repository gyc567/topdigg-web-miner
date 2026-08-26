/**
 * ProductCard — AI产品分析详情页顶部的"产品速览"卡片
 *
 * 数据形态：
 *   - product: 必填核心数据（name / url / category / launch_date / revenue / users / pricing_model / logo）
 *   - pricing: 可选结构化定价数组（喂 Product JSON-LD offers）
 *   - metrics: 可选数字徽章数组
 *   - sources: 可选来源链接数组（数据可验证性）
 *
 * 边界条件：
 *   - logo 缺省时 fallback 到产品名首字母 + 品牌色占位
 *   - 缺数据字段优雅降级（单行不渲染，不显示空白）
 *   - metrics / sources 数组为空时整段隐藏
 *   - pricing 缺省时显示 pricing_model 文本
 *
 * 可访问性：语义化 <aside> + logo alt + 链接 rel="noopener noreferrer"
 */
import { useTranslation } from "react-i18next";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export type ProductCardProduct = {
  name: string;
  url: string;
  category: string;
  launch_date: string;
  revenue?: string;
  users?: string;
  pricing_model?: string;
  logo?: string;
};

export type ProductCardPricing = {
  plan: string;
  price: number | null;
  currency: string;
  period: string | null;
};

export type ProductCardMetric = {
  name: string;
  value: string;
};

export type ProductCardSource = {
  label: string;
  url: string;
};

export type ProductCardProps = {
  product: ProductCardProduct;
  pricing?: ProductCardPricing[];
  metrics?: ProductCardMetric[];
  sources?: ProductCardSource[];
};

/** Logo fallback: 渲染产品名首字母 + 品牌色背景。 */
function LogoFallback({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden="true"
      className="w-14 h-14 rounded-lg bg-gradient-to-br from-brand to-brand/70 text-brand-foreground flex items-center justify-center text-xl font-bold shrink-0"
    >
      {initial}
    </div>
  );
}

export const ProductCard = ({ product, pricing, metrics, sources }: ProductCardProps) => {
  const { t } = useTranslation();
  const hasPricingArray = Array.isArray(pricing) && pricing.length > 0;
  const hasMetrics = Array.isArray(metrics) && metrics.length > 0;
  const hasSources = Array.isArray(sources) && sources.length > 0;

  return (
    <aside className="rounded-xl border bg-card p-6 md:p-8 mb-8">
      {/* Header: Logo + Name + Website link */}
      <div className="flex items-start gap-4 mb-6">
        {product.logo ? (
          <img
            src={product.logo}
            alt={`${product.name} logo`}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
        ) : (
          <LogoFallback name={product.name} />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold mb-1">{product.name}</h2>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand transition-colors"
            aria-label={`${product.name} — ${t("aiProducts.post.productCard.website")}`}
          >
            {t("aiProducts.post.productCard.website")}
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Data grid — 桌面 2 列 / 移动单列 */}
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
        {product.category && (
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("aiProducts.post.productCard.category")}
            </dt>
            <dd className="text-sm font-medium mt-0.5">{product.category}</dd>
          </div>
        )}
        {product.launch_date && (
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("aiProducts.post.productCard.launchDate")}
            </dt>
            <dd className="text-sm font-medium mt-0.5">{product.launch_date}</dd>
          </div>
        )}
        {product.revenue && (
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("aiProducts.post.productCard.revenue")}
            </dt>
            <dd className="text-sm font-medium mt-0.5">{product.revenue}</dd>
          </div>
        )}
        {product.users && (
          <div>
            <dt className="text-xs text-muted-foreground">
              {t("aiProducts.post.productCard.users")}
            </dt>
            <dd className="text-sm font-medium mt-0.5">{product.users}</dd>
          </div>
        )}
        {!hasPricingArray && product.pricing_model && (
          <div className="md:col-span-2">
            <dt className="text-xs text-muted-foreground">
              {t("aiProducts.post.productCard.pricing")}
            </dt>
            <dd className="text-sm font-medium mt-0.5">{product.pricing_model}</dd>
          </div>
        )}
      </dl>

      {/* Pricing table (structured) */}
      {hasPricingArray && (
        <div className="mb-6">
          <h3 className="text-xs text-muted-foreground mb-2">
            {t("aiProducts.post.productCard.pricing")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2 pr-4">Plan</th>
                  <th className="text-right py-2 pr-4">Price</th>
                  <th className="text-left py-2">Period</th>
                </tr>
              </thead>
              <tbody>
                {pricing!.map((p, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-medium">{p.plan}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {p.price === null ? "—" : `${p.currency} ${p.price}`}
                    </td>
                    <td className="py-2 text-muted-foreground">{p.period ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metrics badges */}
      {hasMetrics && (
        <div className="mb-6">
          <h3 className="text-xs text-muted-foreground mb-2">
            {t("aiProducts.post.productCard.metrics")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {metrics!.map((m, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <span className="font-normal text-muted-foreground mr-1">{m.name}:</span>
                <span className="font-medium">{m.value}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sources list */}
      {hasSources && (
        <div>
          <h3 className="text-xs text-muted-foreground mb-2">
            {t("aiProducts.post.productCard.sources")}
          </h3>
          <ul className="text-xs space-y-1">
            {sources!.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand transition-colors inline-flex items-center gap-1"
                >
                  {s.label}
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default ProductCard;
