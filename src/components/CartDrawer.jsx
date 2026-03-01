const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  cartLoading,
  cartTotal,
  onUpdateQty,
  onRemove,
  onCheckout,
}) => {
  return (
    <>
      {/* Overlay */}
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={onClose} />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">🛒 Your Cart</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {cartLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              Loading cart…
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="icon">🛍️</div>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: ".8rem", marginTop: 6 }}>Start adding items!</p>
            </div>
          ) : (
            cartItems.map((item, i) => (
              <div className="cart-item" key={i}>
                {/* Image */}
                <div className="ci-img">
                  {item["image-url"] && item["image-url"] !== "default-image-url"
                    ? <img src={item["image-url"]} alt={item.name} />
                    : "🛒"}
                </div>

                {/* Info */}
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-price">₹{Number(item.total_price).toFixed(2)}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>
                    ₹{Number(item.price_per_unit).toFixed(2)} / unit
                  </div>

                  {/* Quantity Controls */}
                  <div className="ci-controls">
                    <button className="qty-btn" onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                </div>

                {/* Remove */}
                <button className="ci-del" onClick={() => onRemove(item.product_id)}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="total-row">
              <span className="total-label">Subtotal</span>
              <span className="total-amount">₹{cartTotal.toFixed(2)}</span>
            </div>
            {cartTotal < 500 && (
              <div style={{
                fontSize: ".75rem", color: "var(--teal)",
                background: "rgba(0,194,168,.08)",
                borderRadius: 8, padding: "6px 12px",
                marginBottom: 12, textAlign: "center"
              }}>
                Add ₹{(500 - cartTotal).toFixed(2)} more for FREE delivery!
              </div>
            )}
            <button className="checkout-btn" onClick={() => { onClose(); onCheckout(); }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
