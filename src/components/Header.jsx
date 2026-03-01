import { useState, useRef, useEffect } from "react";
import api from "../api/api";

const CATEGORIES = ["All","Shirts","Pants","Accessories","Mobiles","Mobile Accessories"];

const Header = ({
  user, cartCount=0, activeCategory, searchQuery,
  onCategoryChange, onSearchChange, onCartOpen,
  onSignOut, onAdminPanel, onOrders, onSettings,
  hideSearch=false, hideNav=false,
}) => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.logout(); } catch {}
    setLoggingOut(false);
    setProfileOpen(false);
    onSignOut();
  };

  const isAdmin = user?.role === "ADMIN";

  const navigate = (fn) => { setProfileOpen(false); fn && fn(); };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">Sales<span>Savvy</span></div>

        {!hideSearch && (
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Search products…" value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)} />
          </div>
        )}

        {!hideNav && (
          <nav className="nav-links">
            {CATEGORIES.map((cat) => (
              <button key={cat} className={activeCategory === cat ? "active" : ""}
                onClick={() => onCategoryChange(cat)}>{cat}</button>
            ))}
          </nav>
        )}

        <div className="header-actions">
          {!hideSearch && (
            <button className="cart-btn" onClick={onCartOpen}>
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {/* Profile Dropdown */}
          <div className="profile-wrap" ref={profileRef}>
            <button className={`profile-trigger ${profileOpen ? "open" : ""}`}
              onClick={() => setProfileOpen(!profileOpen)}>
              <div className="profile-av">{user.username[0].toUpperCase()}</div>
              <span className="profile-name">{user.username}</span>
              <span className={`profile-caret ${profileOpen ? "up" : ""}`}>▾</span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="pd-user-card">
                  <div className="pd-av-lg">{user.username[0].toUpperCase()}</div>
                  <div>
                    <div className="pd-username">{user.username}</div>
                    <div className={`pd-role-badge ${isAdmin ? "admin" : "user"}`}>
                      {isAdmin ? "⚡ Admin" : "👤 Customer"}
                    </div>
                  </div>
                </div>

                <div className="pd-divider" />

                <div className="pd-menu">
                  <button className="pd-item" onClick={() => { setProfileOpen(false); onOrders?.(); }}>
                    <span className="pd-item-icon">📦</span><span>My Orders</span>
                  </button>
                  <button className="pd-item" onClick={() => { setProfileOpen(false); onSettings?.(); }}>
                    <span className="pd-item-icon">⚙️</span><span>Account Settings</span>
                  </button>
                  <button className="pd-item">
                    <span className="pd-item-icon">❤️</span><span>Wishlist</span>
                  </button>
                  <button className="pd-item">
                    <span className="pd-item-icon">🏠</span><span>Saved Addresses</span>
                  </button>
                  <button className="pd-item">
                    <span className="pd-item-icon">🎁</span><span>Coupons & Offers</span>
                  </button>
                  <button className="pd-item">
                    <span className="pd-item-icon">💬</span><span>Help & Support</span>
                  </button>

                  {isAdmin && (
                    <>
                      <div className="pd-divider" />
                      <button className="pd-item pd-admin-item"
                        onClick={() => navigate(onAdminPanel)}>
                        <span className="pd-item-icon">🛡️</span>
                        <span>Admin Dashboard</span>
                        <span className="pd-admin-badge">Admin</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="pd-divider" />

                <button className="pd-logout-btn" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut
                    ? <><span className="pd-logout-spinner"/> Signing out…</>
                    : <><span>🚪</span> Sign Out</>}
                </button>
              </div>
            )}
          </div>

          {!hideNav && (
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          )}
        </div>
      </div>

      {!hideNav && (
        <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
          <div className="mobile-nav-inner">
            {CATEGORIES.map((cat) => (
              <button key={cat} className={activeCategory === cat ? "active" : ""}
                onClick={() => { onCategoryChange(cat); setMenuOpen(false); }}>{cat}</button>
            ))}
            <button onClick={() => { setMenuOpen(false); onOrders?.(); }}>📦 My Orders</button>
            <button onClick={() => { setMenuOpen(false); onSettings?.(); }}>⚙️ Account Settings</button>
            {isAdmin && (
              <button style={{color:"var(--gold)",fontWeight:700}}
                onClick={() => { setMenuOpen(false); onAdminPanel?.(); }}>🛡️ Admin Dashboard</button>
            )}
            <button className="mobile-logout" onClick={handleLogout}>🚪 Sign Out</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
