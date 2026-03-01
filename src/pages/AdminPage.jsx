import { useState, useEffect, useRef } from "react";
import api from "../api/api";

// ═══════════════════════════════════════════════════
//  CUSTOM MODAL COMPONENT
// ═══════════════════════════════════════════════════
const CustomModal = ({ isOpen, onClose, title, icon, children }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">{icon}</span>
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  RESULT DISPLAY — shows success/error response
// ═══════════════════════════════════════════════════
const ResultBox = ({ result }) => {
  if (!result) return null;
  if (result.type === "error") {
    return (
      <div className="result-box error">
        <span className="result-icon">✕</span>
        <div>
          <div className="result-title">Error</div>
          <div className="result-msg">{result.message}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="result-box success">
      <span className="result-icon">✓</span>
      <div className="result-content">{result.content}</div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  CATEGORY SALES BAR CHART
// ═══════════════════════════════════════════════════
const CategoryChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const max = Math.max(...Object.values(data));
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="cat-chart">
      <div className="cat-chart-title">Sales by Category</div>
      {sorted.map(([cat, qty]) => (
        <div className="cat-chart-row" key={cat}>
          <span className="cat-chart-label">{cat}</span>
          <div className="cat-chart-bar-wrap">
            <div className="cat-chart-bar"
              style={{ width: `${Math.round((qty / max) * 100)}%` }} />
            <span className="cat-chart-qty">{qty} units</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  BUSINESS RESULT DISPLAY
// ═══════════════════════════════════════════════════
const BusinessResult = ({ data, periodLabel }) => {
  if (!data) return null;
  const revenue = data.totalRevenue ?? data.totalBusiness ?? 0;
  return (
    <div className="biz-result">
      <div className="biz-result-period">{periodLabel}</div>
      <div className="biz-result-amount">
        ₹{Number(revenue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </div>
      <div className="biz-result-label">Total Revenue</div>
      {data.totalBusiness && data.totalRevenue && (
        <div className="biz-extra">
          <span>All-time: ₹{Number(data.totalBusiness).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      )}
      <CategoryChart data={data.categorySales} />
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  USER DETAIL CARD
// ═══════════════════════════════════════════════════
const UserDetailCard = ({ user }) => {
  if (!user) return null;
  const isAdmin = (user.role?.name || user.role) === "ADMIN";
  return (
    <div className="user-detail-card">
      <div className="udc-av">{(user.username || "?")[0].toUpperCase()}</div>
      <div className="udc-info">
        <div className="udc-name">{user.username}</div>
        <div className="udc-email">{user.email}</div>
        <div className="udc-meta">
          <span className={`udc-role ${isAdmin ? "admin" : "user"}`}>
            {isAdmin ? "⚡ Admin" : "👤 User"}
          </span>
          <span className="udc-id">ID: {user.userid}</span>
        </div>
        {user.created_at && (
          <div className="udc-date">
            Joined: {new Date(user.created_at).toLocaleDateString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  SPINNER
// ═══════════════════════════════════════════════════
const Spinner = () => <div className="modal-spinner" />;

// ═══════════════════════════════════════════════════
//  THE 8 DASHBOARD CARDS CONFIG
// ═══════════════════════════════════════════════════
const CARDS = [
  {
    id: "addProduct",
    icon: "➕",
    title: "Add Product",
    desc: "Create new product listings with full details, pricing, and category mapping.",
    team: "Product Team",
    color: "#00c2a8",
    category: "products",
  },
  {
    id: "deleteProduct",
    icon: "🗑️",
    title: "Delete Product",
    desc: "Permanently remove a product from the inventory by entering its ID.",
    team: "Product Team",
    color: "#ef4444",
    category: "products",
  },
  {
    id: "modifyUser",
    icon: "✏️",
    title: "Modify User",
    desc: "Update user details — username, email, or role. Fetch first, then edit.",
    team: "User Team",
    color: "#667eea",
    category: "users",
  },
  {
    id: "viewUser",
    icon: "👁️",
    title: "View User Details",
    desc: "Look up any user's profile, role, and account information by ID.",
    team: "User Team",
    color: "#764ba2",
    category: "users",
  },
  {
    id: "monthlyBusiness",
    icon: "📅",
    title: "Monthly Business",
    desc: "View total revenue and category-wise sales for any month and year.",
    team: "Analytics Team",
    color: "#f5c842",
    category: "analytics",
  },
  {
    id: "dailyBusiness",
    icon: "📆",
    title: "Daily Business",
    desc: "Analyze daily revenue metrics and sales breakdown for a specific date.",
    team: "Analytics Team",
    color: "#fb923c",
    category: "analytics",
  },
  {
    id: "yearlyBusiness",
    icon: "📈",
    title: "Yearly Business",
    desc: "Get an annual revenue overview and category performance for any year.",
    team: "Analytics Team",
    color: "#10b981",
    category: "analytics",
  },
  {
    id: "overallBusiness",
    icon: "🏆",
    title: "Overall Business",
    desc: "View total cumulative revenue and all-time category sales since launch.",
    team: "Analytics Team",
    color: "#0f1b2d",
    category: "analytics",
  },
];

// ═══════════════════════════════════════════════════
//  MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════
const AdminPage = ({ user, onBack }) => {
  const [modalType, setModalType]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [filter, setFilter]         = useState("all");

  // ── Shared form states ──────────────────────────
  const [formData, setFormData]     = useState({});
  const [inputValue, setInputValue] = useState("");

  // ── Modify User: two-step state ─────────────────
  const [modifyStep, setModifyStep]     = useState("fetch"); // "fetch" | "edit"
  const [fetchedUser, setFetchedUser]   = useState(null);
  const [modifyForm, setModifyForm]     = useState({ userid:"", username:"", email:"", role:"" });

  // ── Business period labels ───────────────────────
  const [bizPeriodLabel, setBizPeriodLabel] = useState("");

  const currentCard = CARDS.find(c => c.id === modalType);

  const openModal = (type) => {
    setModalType(type);
    setResult(null);
    setLoading(false);
    setFormData({});
    setInputValue("");
    setModifyStep("fetch");
    setFetchedUser(null);
    setModifyForm({ userid:"", username:"", email:"", role:"" });
    setBizPeriodLabel("");
  };

  const closeModal = () => {
    setModalType(null);
    setResult(null);
    setLoading(false);
  };

  const setError = (msg) => setResult({ type: "error", message: msg });

  // ── Form field helper ───────────────────────────
  const field = (key, placeholder, type = "text", opts = {}) => (
    <div className="mf-field" key={key}>
      <label className="mf-label">{opts.label || placeholder}</label>
      <input
        className="mf-input"
        type={type}
        placeholder={placeholder}
        value={formData[key] || ""}
        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
        {...(opts.min !== undefined ? { min: opts.min } : {})}
      />
    </div>
  );

  // ════════════════════════════════════════════════
  //  HANDLER: Add Product — POST /admin/products/add
  // ════════════════════════════════════════════════
  const handleAddProduct = async () => {
    const { name, description, price, stock, categoryId, imageUrl } = formData;
    if (!name || !price || !stock || !categoryId || !imageUrl)
      return setError("All fields are required except description.");

    setLoading(true); setResult(null);
    try {
      const res = await api.adminAddProduct({
        name, description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        imageUrl,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: (
          <div className="success-content">
            <div className="success-badge">✓ Product Added Successfully</div>
            <div className="success-rows">
              <div className="sr-row"><span>Name</span><strong>{data.name}</strong></div>
              <div className="sr-row"><span>Price</span><strong>₹{data.price}</strong></div>
              <div className="sr-row"><span>Stock</span><strong>{data.stock} units</strong></div>
              <div className="sr-row"><span>Product ID</span><strong>#{data.product_id || data.productId || "—"}</strong></div>
            </div>
          </div>
        ),
      });
      setFormData({});
    } catch (e) {
      setError(e.message || "Failed to add product");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: Delete Product — DELETE /admin/products/delete
  // ════════════════════════════════════════════════
  const handleDeleteProduct = async () => {
    if (!inputValue) return setError("Please enter a product ID.");
    setLoading(true); setResult(null);
    try {
      const res = await api.adminDeleteProduct(parseInt(inputValue));
      if (!res.ok) throw new Error(await res.text());
      setResult({
        type: "success",
        content: (
          <div className="success-content">
            <div className="success-badge">✓ Product Deleted</div>
            <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 8 }}>
              Product <strong>#{inputValue}</strong> has been permanently removed from inventory.
            </p>
          </div>
        ),
      });
      setInputValue("");
    } catch (e) {
      setError(e.message || "Failed to delete product");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: View User — GET /admin/user/get?userid=
  // ════════════════════════════════════════════════
  const handleViewUser = async () => {
    if (!inputValue) return setError("Please enter a user ID.");
    setLoading(true); setResult(null);
    try {
      const res = await api.adminGetUser(parseInt(inputValue));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: <UserDetailCard user={data} />,
      });
    } catch (e) {
      setError(e.message || "User not found");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: Modify User — two step
  //  Step 1: GET /admin/user/get?userid= (fetch)
  //  Step 2: PUT /admin/user/modify (update)
  // ════════════════════════════════════════════════
  const handleFetchUserForModify = async () => {
    if (!inputValue) return setError("Please enter a user ID.");
    setLoading(true); setResult(null);
    try {
      const res = await api.adminGetUser(parseInt(inputValue));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFetchedUser(data);
      setModifyForm({
        userid: data.userid,
        username: data.username || "",
        email: data.email || "",
        role: data.role?.name || data.role || "",
      });
      setModifyStep("edit");
    } catch (e) {
      setError(e.message || "User not found");
    } finally { setLoading(false); }
  };

  const handleModifyUserSubmit = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await api.adminModifyUser(modifyForm);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: (
          <div className="success-content">
            <div className="success-badge">✓ User Updated Successfully</div>
            <div className="success-rows">
              <div className="sr-row"><span>Username</span><strong>{data.username}</strong></div>
              <div className="sr-row"><span>Email</span><strong>{data.email}</strong></div>
              <div className="sr-row"><span>Role</span><strong>{data.role}</strong></div>
            </div>
          </div>
        ),
      });
      setModifyStep("fetch");
      setFetchedUser(null);
      setInputValue("");
    } catch (e) {
      setError(e.message || "Failed to update user");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: Monthly Business
  // ════════════════════════════════════════════════
  const handleMonthlyBusiness = async () => {
    const { month, year } = formData;
    if (!month || !year) return setError("Please enter both month and year.");
    setLoading(true); setResult(null);
    const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    setBizPeriodLabel(`${months[parseInt(month)]} ${year}`);
    try {
      const res = await api.adminGetMonthlyBusiness(parseInt(month), parseInt(year));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: <BusinessResult data={data} periodLabel={`${months[parseInt(month)]} ${year}`} />,
      });
    } catch (e) {
      setError(e.message || "Failed to fetch monthly data");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: Daily Business
  // ════════════════════════════════════════════════
  const handleDailyBusiness = async () => {
    const { date } = formData;
    if (!date) return setError("Please select a date.");
    setLoading(true); setResult(null);
    try {
      const res = await api.adminGetDailyBusiness(date);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: <BusinessResult data={data} periodLabel={new Date(date).toLocaleDateString("en-IN", { dateStyle: "long" })} />,
      });
    } catch (e) {
      setError(e.message || "Failed to fetch daily data");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: Yearly Business
  // ════════════════════════════════════════════════
  const handleYearlyBusiness = async () => {
    const { year } = formData;
    if (!year) return setError("Please enter a year.");
    setLoading(true); setResult(null);
    try {
      const res = await api.adminGetYearlyBusiness(parseInt(year));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: <BusinessResult data={data} periodLabel={`Year ${year}`} />,
      });
    } catch (e) {
      setError(e.message || "Failed to fetch yearly data");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  HANDLER: Overall Business
  // ════════════════════════════════════════════════
  const handleOverallBusiness = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await api.adminGetOverallBusiness();
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({
        type: "success",
        content: <BusinessResult data={data} periodLabel="All Time" />,
      });
    } catch (e) {
      setError(e.message || "Failed to fetch overall data");
    } finally { setLoading(false); }
  };

  // ════════════════════════════════════════════════
  //  MODAL CONTENT RENDERER
  // ════════════════════════════════════════════════
  const renderModalContent = () => {
    switch (modalType) {

      // ── Add Product ─────────────────────────────
      case "addProduct":
        return (
          <div className="modal-form">
            {field("name", "e.g. Premium Cotton Shirt", "text", { label: "Product Name *" })}
            {field("description", "Brief description of the product", "text", { label: "Description" })}
            <div className="mf-row">
              {field("price", "e.g. 999.99", "number", { label: "Price (₹) *" })}
              {field("stock", "e.g. 50", "number", { label: "Stock Quantity *" })}
            </div>
            {field("categoryId", "e.g. 1", "number", { label: "Category ID *" })}
            {field("imageUrl", "https://example.com/image.jpg", "url", { label: "Image URL *" })}
            <ResultBox result={result} />
            <button className="mf-submit-btn green" onClick={handleAddProduct} disabled={loading}>
              {loading ? <><Spinner /> Adding Product…</> : "➕ Add Product"}
            </button>
          </div>
        );

      // ── Delete Product ──────────────────────────
      case "deleteProduct":
        return (
          <div className="modal-form">
            <div className="delete-warning">
              <span>⚠️</span>
              <span>This action is <strong>permanent</strong> and cannot be undone. The product and all its images will be removed.</span>
            </div>
            <div className="mf-field">
              <label className="mf-label">Product ID to Delete *</label>
              <input className="mf-input" type="number" placeholder="Enter product ID"
                value={inputValue} onChange={e => setInputValue(e.target.value)} />
            </div>
            <ResultBox result={result} />
            <button className="mf-submit-btn red" onClick={handleDeleteProduct} disabled={loading || !inputValue}>
              {loading ? <><Spinner /> Deleting…</> : "🗑️ Delete Product"}
            </button>
          </div>
        );

      // ── View User ───────────────────────────────
      case "viewUser":
        return (
          <div className="modal-form">
            <div className="mf-field">
              <label className="mf-label">User ID *</label>
              <input className="mf-input" type="number" placeholder="Enter user ID to look up"
                value={inputValue} onChange={e => setInputValue(e.target.value)} />
            </div>
            <ResultBox result={result} />
            <button className="mf-submit-btn teal" onClick={handleViewUser} disabled={loading || !inputValue}>
              {loading ? <><Spinner /> Searching…</> : "🔍 Find User"}
            </button>
          </div>
        );

      // ── Modify User ─────────────────────────────
      case "modifyUser":
        if (modifyStep === "fetch") {
          return (
            <div className="modal-form">
              <p className="mf-hint">First, look up the user you want to modify.</p>
              <div className="mf-field">
                <label className="mf-label">User ID *</label>
                <input className="mf-input" type="number" placeholder="Enter user ID"
                  value={inputValue} onChange={e => setInputValue(e.target.value)} />
              </div>
              <ResultBox result={result} />
              <button className="mf-submit-btn teal" onClick={handleFetchUserForModify}
                disabled={loading || !inputValue}>
                {loading ? <><Spinner /> Fetching…</> : "🔍 Fetch User Details"}
              </button>
            </div>
          );
        }
        return (
          <div className="modal-form">
            {fetchedUser && <UserDetailCard user={fetchedUser} />}
            <div className="mf-divider">Edit Fields</div>
            <div className="mf-field">
              <label className="mf-label">Username</label>
              <input className="mf-input" type="text" placeholder="New username"
                value={modifyForm.username}
                onChange={e => setModifyForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="mf-field">
              <label className="mf-label">Email</label>
              <input className="mf-input" type="email" placeholder="New email"
                value={modifyForm.email}
                onChange={e => setModifyForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="mf-field">
              <label className="mf-label">Role</label>
              <select className="mf-input" value={modifyForm.role}
                onChange={e => setModifyForm(f => ({ ...f, role: e.target.value }))}>
                <option value="">— Keep current —</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <ResultBox result={result} />
            <div className="mf-btn-row">
              <button className="mf-submit-btn ghost"
                onClick={() => { setModifyStep("fetch"); setFetchedUser(null); setResult(null); }}>
                ← Back
              </button>
              <button className="mf-submit-btn purple" onClick={handleModifyUserSubmit} disabled={loading}>
                {loading ? <><Spinner /> Saving…</> : "✏️ Save Changes"}
              </button>
            </div>
          </div>
        );

      // ── Monthly Business ────────────────────────
      case "monthlyBusiness":
        return (
          <div className="modal-form">
            <div className="mf-row">
              <div className="mf-field">
                <label className="mf-label">Month *</label>
                <select className="mf-input" value={formData.month || ""}
                  onChange={e => setFormData(p => ({ ...p, month: e.target.value }))}>
                  <option value="">Select month</option>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"]
                    .map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="mf-field">
                <label className="mf-label">Year *</label>
                <input className="mf-input" type="number" placeholder="e.g. 2025"
                  value={formData.year || ""}
                  onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} />
              </div>
            </div>
            <ResultBox result={result} />
            <button className="mf-submit-btn gold" onClick={handleMonthlyBusiness} disabled={loading}>
              {loading ? <><Spinner /> Fetching…</> : "📅 Get Monthly Report"}
            </button>
          </div>
        );

      // ── Daily Business ──────────────────────────
      case "dailyBusiness":
        return (
          <div className="modal-form">
            <div className="mf-field">
              <label className="mf-label">Date *</label>
              <input className="mf-input" type="date"
                value={formData.date || ""}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
            </div>
            <ResultBox result={result} />
            <button className="mf-submit-btn orange" onClick={handleDailyBusiness} disabled={loading}>
              {loading ? <><Spinner /> Fetching…</> : "📆 Get Daily Report"}
            </button>
          </div>
        );

      // ── Yearly Business ─────────────────────────
      case "yearlyBusiness":
        return (
          <div className="modal-form">
            <div className="mf-field">
              <label className="mf-label">Year *</label>
              <input className="mf-input" type="number" placeholder="e.g. 2025"
                min="2020" max="2030"
                value={formData.year || ""}
                onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} />
            </div>
            <ResultBox result={result} />
            <button className="mf-submit-btn green" onClick={handleYearlyBusiness} disabled={loading}>
              {loading ? <><Spinner /> Fetching…</> : "📈 Get Yearly Report"}
            </button>
          </div>
        );

      // ── Overall Business ────────────────────────
      case "overallBusiness":
        return (
          <div className="modal-form">
            <p className="mf-hint">
              Fetch the total cumulative revenue and all-time category-wise sales breakdown since platform launch.
            </p>
            <ResultBox result={result} />
            <button className="mf-submit-btn dark" onClick={handleOverallBusiness} disabled={loading}>
              {loading ? <><Spinner /> Loading…</> : "🏆 Fetch Overall Business"}
            </button>
          </div>
        );

      default: return null;
    }
  };

  // ════════════════════════════════════════════════
  //  FILTER TABS
  // ════════════════════════════════════════════════
  const FILTERS = [
    { id: "all",       label: "All",       count: 8 },
    { id: "products",  label: "Products",  count: 2 },
    { id: "users",     label: "Users",     count: 2 },
    { id: "analytics", label: "Analytics", count: 4 },
  ];

  const visibleCards = filter === "all"
    ? CARDS
    : CARDS.filter(c => c.category === filter);

  // ════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════
  return (
    <div className="adm-page">

      {/* ── Topbar ── */}
      <div className="adm-topbar">
        <button className="adm-back-btn" onClick={onBack}>← Back to Shop</button>
        <div className="adm-topbar-center">
          <div className="adm-topbar-logo">Sales<span>Savvy</span></div>
          <span className="adm-topbar-label">Admin Dashboard</span>
        </div>
        <div className="adm-topbar-user">
          <div className="adm-topbar-av">{user.username[0].toUpperCase()}</div>
          <div>
            <div className="adm-topbar-name">{user.username}</div>
            <div className="adm-topbar-role">⚡ Administrator</div>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="adm-hero">
        <div className="adm-hero-inner">
          <div className="adm-hero-text">
            <h1>Welcome back, <span>{user.username}</span> 👋</h1>
            <p>Manage your platform — products, users, and business analytics — all from one place.</p>
          </div>
          <div className="adm-hero-stats">
            <div className="adm-hero-stat"><span className="adm-hs-num">8</span><span className="adm-hs-label">Controls</span></div>
            <div className="adm-hero-stat-divider" />
            <div className="adm-hero-stat"><span className="adm-hs-num">2</span><span className="adm-hs-label">Product Ops</span></div>
            <div className="adm-hero-stat-divider" />
            <div className="adm-hero-stat"><span className="adm-hs-num">4</span><span className="adm-hs-label">Analytics</span></div>
          </div>
        </div>
        <div className="adm-hero-orbs">
          <div className="adm-orb adm-orb1" />
          <div className="adm-orb adm-orb2" />
          <div className="adm-orb adm-orb3" />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="adm-content">

        {/* Filter tabs */}
        <div className="adm-filter-tabs">
          {FILTERS.map(f => (
            <button key={f.id}
              className={`adm-filter-tab ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="adm-filter-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="adm-cards-grid">
          {visibleCards.map((card, i) => (
            <button key={card.id}
              className="adm-card"
              style={{ "--card-accent": card.color, animationDelay: `${i * 60}ms` }}
              onClick={() => openModal(card.id)}>
              <div className="adm-card-accent-bar" />
              <div className="adm-card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                {card.icon}
              </div>
              <div className="adm-card-body">
                <div className="adm-card-title">{card.title}</div>
                <div className="adm-card-desc">{card.desc}</div>
              </div>
              <div className="adm-card-footer">
                <span className="adm-card-team">{card.team}</span>
                <span className="adm-card-arrow" style={{ color: card.color }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="adm-footer">
        <div className="adm-footer-inner">
          <div className="adm-footer-logo">Sales<span>Savvy</span> Admin</div>
          <div className="adm-footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Support</a>
            <a href="#">Documentation</a>
          </div>
          <div className="adm-footer-copy">© 2025 SalesSavvy. All rights reserved.</div>
        </div>
      </footer>

      {/* ── Custom Modal ── */}
      <CustomModal
        isOpen={!!modalType}
        onClose={closeModal}
        title={currentCard?.title || ""}
        icon={currentCard?.icon || ""}
      >
        {renderModalContent()}
      </CustomModal>
    </div>
  );
};

export default AdminPage;
