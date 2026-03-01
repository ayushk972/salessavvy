import { useState, useEffect } from "react";
import api from "../api/api";

const OrdersPage = ({ user, onBack }) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [selected, setSelected] = useState(null); // order detail view
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getMyOrders();
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setOrders(data.orders || data || []);
      } catch (e) {
        setError(e.message || "Failed to load orders");
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const openDetail = async (order) => {
    setSelected({ ...order, items: null });
    setDetailLoading(true);
    try {
      const res = await api.getOrderById(order.orderId || order.order_id);
      if (res.ok) {
        const data = await res.json();
        setSelected(data.order || data);
      }
    } catch {}
    finally { setDetailLoading(false); }
  };

  const statusColor = (s) => ({
    SUCCESS: "#10b981", PENDING: "#f59e0b", FAILED: "#ef4444",
  }[s] || "#6b7a8d");

  const statusIcon = (s) => ({ SUCCESS:"✓", PENDING:"⏳", FAILED:"✕" }[s] || "?");

  const fmt = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  };

  // ── Detail View ─────────────────────────────────
  if (selected) {
    const items = selected.orderItems || selected.items || [];
    return (
      <div className="ord-page">
        <div className="ord-topbar">
          <button className="ord-back" onClick={() => setSelected(null)}>← All Orders</button>
          <div className="ord-topbar-title">Order Details</div>
          <button className="ord-back" onClick={onBack}>← Shop</button>
        </div>

        <div className="ord-detail-body">
          {/* Order Header Card */}
          <div className="ord-detail-card ord-header-card">
            <div className="ord-detail-header">
              <div>
                <div className="ord-detail-id">#{selected.orderId || selected.order_id}</div>
                <div className="ord-detail-date">Placed on {fmt(selected.createdAt || selected.created_at)}</div>
              </div>
              <div className="ord-status-pill" style={{ background: `${statusColor(selected.status)}22`, color: statusColor(selected.status), border: `1.5px solid ${statusColor(selected.status)}44` }}>
                <span>{statusIcon(selected.status)}</span> {selected.status}
              </div>
            </div>

            {/* Key metrics row */}
            <div className="ord-metrics">
              <div className="ord-metric">
                <span className="ord-metric-icon">💰</span>
                <div>
                  <div className="ord-metric-val">₹{Number(selected.totalAmount || selected.total_amount || 0).toLocaleString("en-IN", {minimumFractionDigits:2})}</div>
                  <div className="ord-metric-label">Order Total</div>
                </div>
              </div>
              <div className="ord-metric">
                <span className="ord-metric-icon">🔑</span>
                <div>
                  <div className="ord-metric-val ord-txn-id">{selected.orderId || selected.order_id || "—"}</div>
                  <div className="ord-metric-label">Transaction / Order ID</div>
                </div>
              </div>
              <div className="ord-metric">
                <span className="ord-metric-icon">📦</span>
                <div>
                  <div className="ord-metric-val">{items.length} item{items.length !== 1 ? "s" : ""}</div>
                  <div className="ord-metric-label">Items Ordered</div>
                </div>
              </div>
              {selected.updatedAt && (
                <div className="ord-metric">
                  <span className="ord-metric-icon">🕐</span>
                  <div>
                    <div className="ord-metric-val">{fmt(selected.updatedAt)}</div>
                    <div className="ord-metric-label">Last Updated</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="ord-detail-card">
            <div className="ord-card-title">🛍️ Ordered Items</div>
            {detailLoading ? (
              <div className="ord-loading"><div className="ord-spinner"/>Loading items…</div>
            ) : items.length === 0 ? (
              <div className="ord-empty-items">No item details available</div>
            ) : (
              <div className="ord-items-list">
                {items.map((item, i) => (
                  <div key={i} className="ord-item">
                    <div className="ord-item-thumb">
                      {item.imageUrl || item.image_url ? (
                        <img src={item.imageUrl || item.image_url} alt={item.productName || item.name}
                          onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                      ) : null}
                      <span style={{display: item.imageUrl ? "none" : "flex"}}>🛍️</span>
                    </div>
                    <div className="ord-item-info">
                      <div className="ord-item-name">{item.productName || item.name || `Product #${item.productId}`}</div>
                      <div className="ord-item-meta">
                        <span className="ord-item-qty">× {item.quantity}</span>
                        <span className="ord-item-unit">₹{Number(item.pricePerUnit || item.price_per_unit || 0).toFixed(2)} / unit</span>
                      </div>
                    </div>
                    <div className="ord-item-total">
                      ₹{Number(item.totalPrice || item.total_price || 0).toLocaleString("en-IN", {minimumFractionDigits:2})}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="ord-detail-card">
            <div className="ord-card-title">💳 Payment Summary</div>
            <div className="ord-summary-rows">
              <div className="ord-summary-row">
                <span>Payment Status</span>
                <span style={{color: statusColor(selected.status), fontWeight:700}}>{selected.status}</span>
              </div>
              <div className="ord-summary-row">
                <span>Order ID (Transaction Ref)</span>
                <span className="ord-txn-chip">{selected.orderId || selected.order_id || "—"}</span>
              </div>
              <div className="ord-summary-row">
                <span>Order Date</span>
                <span>{fmt(selected.createdAt || selected.created_at)}</span>
              </div>
              <div className="ord-summary-divider"/>
              <div className="ord-summary-row ord-summary-total">
                <span>Total Paid</span>
                <span>₹{Number(selected.totalAmount || selected.total_amount || 0).toLocaleString("en-IN", {minimumFractionDigits:2})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Orders List ──────────────────────────────────
  return (
    <div className="ord-page">
      <div className="ord-topbar">
        <button className="ord-back" onClick={onBack}>← Back to Shop</button>
        <div className="ord-topbar-title">My Orders</div>
        <div className="ord-topbar-user">{user.username}</div>
      </div>

      <div className="ord-list-body">
        <div className="ord-list-header">
          <h2 className="ord-list-title">📦 Order History</h2>
          <p className="ord-list-sub">Click any order to view full details and items</p>
        </div>

        {loading ? (
          <div className="ord-loading"><div className="ord-spinner"/>Loading your orders…</div>
        ) : error ? (
          <div className="ord-state-box">
            <div className="ord-state-icon">⚠️</div>
            <div className="ord-state-title">Couldn't load orders</div>
            <div className="ord-state-sub">{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="ord-state-box">
            <div className="ord-state-icon">📦</div>
            <div className="ord-state-title">No orders yet</div>
            <div className="ord-state-sub">Start shopping and your orders will appear here.</div>
            <button className="ord-shop-btn" onClick={onBack}>Browse Products →</button>
          </div>
        ) : (
          <div className="ord-list">
            {orders.map((order, i) => {
              const oid = order.orderId || order.order_id;
              const amt = order.totalAmount || order.total_amount || 0;
              const dt  = order.createdAt || order.created_at;
              const st  = order.status;
              return (
                <div key={i} className="ord-card" onClick={() => openDetail(order)}
                  style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="ord-card-left">
                    <div className="ord-card-icon" style={{color: statusColor(st)}}>
                      {statusIcon(st)}
                    </div>
                    <div>
                      <div className="ord-card-id">#{oid}</div>
                      <div className="ord-card-date">{fmt(dt)}</div>
                    </div>
                  </div>
                  <div className="ord-card-right">
                    <div className="ord-card-amt">₹{Number(amt).toLocaleString("en-IN", {minimumFractionDigits:2})}</div>
                    <div className="ord-card-status" style={{color: statusColor(st), background: `${statusColor(st)}18`}}>
                      {st}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
