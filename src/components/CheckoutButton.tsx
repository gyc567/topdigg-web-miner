/**
 * CheckoutButton — opens Paddle v2 Overlay Checkout with lazy load.
 * Listens to paddle:checkout:completed event for instant feedback.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, type ButtonProps } from "@/components/ui/button";
import { openCheckout, getPriceId, onPaddleEvent } from "@/lib/paddle";
import type { PriceKind } from "@/lib/paddle-config";
import { useAuth } from "@/lib/auth";

type CheckoutButtonProps = ButtonProps & {
  priceKind: PriceKind;
  postSlug?: string;
  userEmail?: string;
};

export function CheckoutButton({
  priceKind,
  postSlug,
  userEmail,
  children,
  ...buttonProps
}: CheckoutButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const offCompleted = onPaddleEvent("paddle:checkout:completed", () => {
      setLoading(false);
    });
    const offClose = onPaddleEvent("paddle:checkout:close", () => {
      setLoading(false);
    });
    const offError = onPaddleEvent("paddle:checkout:error", () => {
      setLoading(false);
    });
    return () => {
      offCompleted();
      offClose();
      offError();
    };
  }, []);

  const handleClick = async () => {
    if (!userEmail) {
      alert(t("moneyLab.checkout.signInRequired", "请先登录"));
      return;
    }
    setLoading(true);
    try {
      const successUrl = postSlug
        ? `${window.location.origin}/money-lab/${postSlug}?purchased=1`
        : `${window.location.origin}/account?purchased=1`;
      await openCheckout({
        items: [{ priceId: getPriceId(priceKind), quantity: 1 }],
        customer: { email: userEmail },
        customData: {
          user_id: user?.id ?? "",
          user_email: userEmail,
          ...(postSlug ? { post_slug: postSlug } : {}),
        },
        successUrl,
      });
    } catch (e) {
      console.error("Checkout failed", e);
      alert(t("moneyLab.checkout.error", "结账初始化失败，请稍后重试"));
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} {...buttonProps}>
      {loading
        ? t("moneyLab.checkout.loading", "加载中...")
        : children ?? t("moneyLab.checkout.buy", "立即购买")}
    </Button>
  );
}
