/**
 * CheckoutButton — opens Paddle Checkout overlay with lazy load.
 * Returns user to original slug after success.
 */
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { openCheckout, getPriceId } from "@/lib/paddle";
import type { PriceKind } from "@/lib/paddle-config";

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
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userEmail) {
      alert("请先登录");
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
        customData: postSlug ? { post_slug: postSlug } : {},
        successUrl,
      });
    } catch (e) {
      console.error("Checkout failed", e);
      alert("结账初始化失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading} {...buttonProps}>
      {loading ? "加载中..." : children ?? "立即购买"}
    </Button>
  );
}