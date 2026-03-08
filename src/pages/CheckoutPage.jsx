import { useState, useEffect } from "react";
import api from "../api/api";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ⚠️ Replace with your Razorpay test key from dashboard.razorpay.com
const RAZORPAY_KEY_ID = "rzp_test_LqWBBDbgwot5lh";

const CheckoutPage = ({ user, onBack, onOrderSuccess }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("review");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.getCartItems();
        if (!res.ok) throw new Error("Failed to load cart");
        const data = await res.json();
        setCartItems(data.cart?.products || []);
      } catch (e) {
        setError("Could not load cart: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((s, i) => s + Number(i.total_price || 0), 0);
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const totalAmount = subtotal + deliveryFee;

  const handlePayment = async () => {
    if (cartItems.length === 0) { setError("Your cart is empty."); return; }
    setPaymentLoading(true);
    setError("");

    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      setError("Failed to load Razorpay SDK. Check your internet connection.");
      setPaymentLoading(false);
      return;
    }

    // POST /api/payment/create
    // Body: { totalAmount, cartItems: [{productId, quantity, price}] }
    // Returns: plain string razorpayOrderId
    let razorpayOrderId;
    try {
      const cartPayload = cartItems.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: Number(item.price_per_unit),
      }));
      const res = await api.createPaymentOrder(totalAmount, cartPayload);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create payment order");
      }
      razorpayOrderId = await res.text();
      setOrderId(razorpayOrderId);
    } catch (e) {
      setError("Order creation failed: " + e.message);
      setPaymentLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      name: "SalesSavvy",
      description: "Order Payment",
      order_id: razorpayOrderId,
      prefill: { name: user.username },
      theme: { color: "#00c2a8" },
      handler: async (response) => {
        setStep("processing");
        setPaymentLoading(false);
        try {
          // POST /api/payment/verify
          // Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
          // Returns: plain string "Payment verified successfully"
          const verifyRes = await api.verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          if (verifyRes.ok) {
            setStep("success");
            setTimeout(() => onOrderSuccess(), 2500);
          } else {
            setStep("failed");
          }
        } catch {
          setStep("failed");
        }
      },
      modal: { ondismiss: () => setPaymentLoading(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => { setPaymentLoading(false); setStep("failed"); });
    rzp.open();
    setPaymentLoading(false);
  };

  if (step === "processing") {
    return (
      <div className="co-state-page">
        <div className="co-state-card">
          <div className="co-spinner-wrap">
            <div className="co-spinner" />
            <div className="co-spinner-inner">💳</div>
          </div>
          <h2 className="co-state-title">Verifying Payment</h2>
          <p className="co-state-sub">Confirming with Razorpay… please don't close this tab.</p>
          <div className="co-step-trail">
            <span className="co-trail-dot done">✓</span>
            <span className="co-trail-line done" />
            <span className="co-trail-dot done">✓</span>
            <span className="co-trail-line done" />
            <span className="co-trail-dot active" />
          </div>
          <div className="co-trail-labels"><span>Cart</span><span>Order</span><span>Verify</span></div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="co-state-page">
        <div className="co-state-card">
          <div className="co-success-burst">
            <div className="co-success-ring" />
            <div className="co-success-icon">✓</div>
          </div>
          <h2 className="co-state-title">Payment Successful! 🎉</h2>
          <p className="co-state-sub">Your order is confirmed. Cart cleared. Returning to shop…</p>
          {orderId && <div className="co-order-ref">Ref: <code>{orderId}</code></div>}
          <div className="co-step-trail">
            <span className="co-trail-dot done">✓</span>
            <span className="co-trail-line done" />
            <span className="co-trail-dot done">✓</span>
            <span className="co-trail-line done" />
            <span className="co-trail-dot done">✓</span>
            <span className="co-trail-line done" />
            <span className="co-trail-dot done">✓</span>
          </div>
          <div className="co-trail-labels"><span>Cart</span><span>Order</span><span>Paid</span><span>Done</span></div>
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="co-state-page">
        <div className="co-state-card">
          <div className="co-fail-icon">✕</div>
          <h2 className="co-state-title">Payment Failed</h2>
          <p className="co-state-sub">Something went wrong. Your cart is still saved — try again.</p>
          <div className="co-state-actions">
            <button className="co-retry-btn" onClick={() => setStep("review")}>Try Again</button>
            <button className="co-back-link" onClick={onBack}>Back to Shop</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div className="co-topbar">
        <button className="co-back-btn" onClick={onBack}>← Shop</button>
        <div className="co-topbar-logo">Sales<span>Savvy</span></div>
        <div className="co-secure-tag">🔒 Secure Checkout</div>
      </div>

      <div className="co-progress">
        <div className="co-progress-inner">
          {["Cart", "Review", "Payment", "Confirmed"].map((label, i) => (
            <div key={label} className="co-prog-item">
              <div className={`co-prog-dot ${i <= 1 ? "done" : ""} ${i === 1 ? "current" : ""}`}>
                {i < 1 ? "✓" : i + 1}
              </div>
              <div className={`co-prog-label ${i === 1 ? "current" : ""}`}>{label}</div>
              {i < 3 && <div className={`co-prog-line ${i < 1 ? "done" : ""}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="co-body">
        <div className="co-left">
          <div className="co-panel">
            <div className="co-panel-title">
              <span>🧾</span> Order Summary
              {!loading && <span className="co-item-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>}
            </div>
            {loading ? (
              <div className="co-loading"><div className="co-load-spinner" />Loading your cart…</div>
            ) : cartItems.length === 0 ? (
              <div className="co-empty">
                <span className="co-empty-icon">🛒</span>
                <p>Your cart is empty</p>
                <button className="co-retry-btn" onClick={onBack}>Go Shopping</button>
              </div>
            ) : (
              <div className="co-items-list">
                {cartItems.map((item, i) => (
                  <div className="co-item" key={i}>
                    <div className="co-item-thumb">
                      {item["image-url"] && item["image-url"] !== "default-image-url"
                        ? <img src={item["image-url"]} alt={item.name} onError={(e) => { e.target.style.display = "none"; }} />
                        : "🛍️"}
                    </div>
                    <div className="co-item-info">
                      <div className="co-item-name">{item.name}</div>
                      <div className="co-item-desc">{item.description}</div>
                      <div className="co-item-meta">
                        <span className="co-item-qty">× {item.quantity}</span>
                        <span className="co-item-unit">₹{Number(item.price_per_unit).toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="co-item-price">₹{Number(item.total_price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!loading && cartItems.length > 0 && (
            <div className="co-panel co-price-panel">
              <div className="co-panel-title"><span>💰</span> Price Details</div>
              <div className="co-price-row"><span>Items subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="co-price-row">
                <span>Delivery charges</span>
                {deliveryFee === 0 ? <span className="co-free">FREE</span> : <span>₹{deliveryFee.toFixed(2)}</span>}
              </div>
              {deliveryFee > 0 && (
                <div className="co-delivery-hint">Add ₹{(500 - subtotal).toFixed(2)} more for FREE delivery</div>
              )}
              <div className="co-price-divider" />
              <div className="co-price-row co-price-total"><span>Amount Payable</span><span>₹{totalAmount.toFixed(2)}</span></div>
              {deliveryFee === 0 && <div className="co-savings">🎉 You saved ₹49 on delivery!</div>}
            </div>
          )}
        </div>

        <div className="co-right">
          <div className="co-panel co-user-panel">
            <div className="co-panel-title"><span>👤</span> Account</div>
            <div className="co-user-row">
              <div className="co-user-av">{user.username[0].toUpperCase()}</div>
              <div>
                <div className="co-user-name">{user.username}</div>
                <div className="co-user-role">{user.role || "Customer"}</div>
              </div>
            </div>
          </div>

          <div className="co-panel co-pay-method-panel">
            <div className="co-panel-title"><span>💳</span> Payment Method</div>
            <div className="co-method-card">
              <div className="co-method-radio">●</div>
              <div className="co-method-info">
                <div className="co-method-name">Razorpay</div>
                <div className="co-method-sub">UPI · Cards · Net Banking · Wallets</div>
              </div>
              <div className="co-method-icons">💳 🏦 📱</div>
            </div>
          </div>

          {error && <div className="co-error-box"><span>⚠️</span> {error}</div>}

          <div className="co-panel co-pay-panel">
            <div className="co-pay-amount-label">Total Amount</div>
            <div className="co-pay-amount">₹{totalAmount.toFixed(2)}</div>
            <button
              className="co-pay-btn"
              onClick={handlePayment}
              disabled={paymentLoading || loading || cartItems.length === 0}
            >
              {paymentLoading ? <span className="co-btn-spinner" /> : "🔒"}
              {paymentLoading ? "Creating Order…" : `Pay ₹${totalAmount.toFixed(2)}`}
            </button>
            <p className="co-pay-note">Clicking Pay will open Razorpay's secure checkout</p>
            <div className="co-trust-row">
              {[["🔒","SSL Encrypted"],["✓","PCI DSS Safe"],["↩️","Easy Refunds"]].map(([icon, label]) => (
                <div className="co-trust-item" key={label}><span>{icon}</span><span>{label}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
