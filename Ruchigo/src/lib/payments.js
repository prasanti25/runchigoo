import { apiRequest } from "./api.js";

let checkoutScript;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScript) return checkoutScript;
  checkoutScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    const timer = setTimeout(() => {
      checkoutScript = null;
      script.remove();
      reject(
        new Error("Payment checkout took too long to load. Please retry."),
      );
    }, 15000);
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      checkoutScript = null;
      script.remove();
      reject(
        new Error(
          "Could not load payment checkout. Check your connection and retry.",
        ),
      );
    };
    document.head.appendChild(script);
  });
  return checkoutScript;
}

export async function payForOrder(order, { token, keyId, user }) {
  if (
    order.payment_expires_at &&
    new Date(order.payment_expires_at).getTime() <= Date.now()
  )
    throw new Error(
      "This payment window has expired. Refresh your order. Contact support if money was debited.",
    );
  if (!keyId || !order.payment?.provider_order_id)
    throw new Error("Online payment is unavailable for this order.");
  await loadCheckout();
  return new Promise((resolve, reject) => {
    let verifying = false;
    const checkout = new window.Razorpay({
      key: keyId,
      order_id: order.payment.provider_order_id,
      amount: Math.round(Number(order.total) * 100),
      currency: "INR",
      name: "RuchiGo",
      description: `Order ${String(order.number).slice(0, 8).toUpperCase()}`,
      prefill: {
        name: user?.first_name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: { color: "#e85e2b" },
      handler: async (response) => {
        verifying = true;
        try {
          const verified = await apiRequest("/online-payments/verify/", {
            token,
            method: "POST",
            body: {
              order_id: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          if (verified.status === "cancelled")
            throw new Error(
              "Payment arrived after this order closed. A support case has been opened; your order has not restarted.",
            );
          resolve(verified);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          if (!verifying)
            reject(
              new Error(
                "Payment wasn’t completed. You can retry from your order page.",
              ),
            );
        },
      },
    });
    checkout.open();
  });
}
