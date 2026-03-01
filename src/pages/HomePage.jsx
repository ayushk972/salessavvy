import { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import Toast from "../components/Toast";

const CATEGORIES = [
  "All",
  "Shirts",
  "Pants",
  "Accessories",
  "Mobiles",
  "Mobile Accessories",
];

const HomePage = ({ user, onSignOut, onCheckout, onAdminPanel, onOrders, onSettings }) => {
  // ── Products state ─────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Cart state ─────────────────────────────────
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [addingIds, setAddingIds] = useState(new Set());
  const [addedIds, setAddedIds] = useState(new Set());

  // ── Toast state ────────────────────────────────
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2200);
  };

  // ── Fetch Products ─────────────────────────────
  const fetchProducts = useCallback(
    async (category) => {
      setProductsLoading(true);
      setProductsError("");
      try {
        const res = await api.getProducts(category);
        if (res.status === 401 || res.status === 403) {
          onSignOut();
          return;
        }
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (e) {
        setProductsError(
          e.message || "Could not load products. Check your backend."
        );
      } finally {
        setProductsLoading(false);
      }
    },
    [onSignOut]
  );

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  // ── Fetch Cart ─────────────────────────────────
  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const res = await api.getCartItems();
      if (!res.ok) return;
      const data = await res.json();
      setCartItems(data.cart?.products || []);
    } catch {
      // silent
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Add to Cart ────────────────────────────────
  const handleAddToCart = async (product) => {
    setAddingIds((s) => new Set([...s, product.productId]));
    try {
      const res = await api.addToCart(user.username, product.productId, 1);
      if (res.ok) {
        await fetchCart();
        setAddedIds((s) => new Set([...s, product.productId]));
        setTimeout(() => {
          setAddedIds((s) => {
            const n = new Set(s);
            n.delete(product.productId);
            return n;
          });
        }, 1200);
        showToast(`${product.name} added to cart!`);
      }
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAddingIds((s) => {
        const n = new Set(s);
        n.delete(product.productId);
        return n;
      });
    }
  };

  // ── Update Cart Qty ────────────────────────────
  const handleUpdateQty = async (productId, quantity) => {
    try {
      await api.updateCart(user.username, productId, quantity);
      await fetchCart();
    } catch {
      // silent
    }
  };

  // ── Remove from Cart ───────────────────────────
  const handleRemoveFromCart = async (productId) => {
    try {
      await api.deleteCartItem(user.username, productId);
      await fetchCart();
      showToast("Item removed from cart");
    } catch {
      // silent
    }
  };

  const cartCount = cartItems.reduce((s, p) => s + (p.quantity || 0), 0);
  const cartTotal = cartItems.reduce((s, p) => s + (p.total_price || 0), 0);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Toast msg={toast.msg} show={toast.show} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        cartLoading={cartLoading}
        cartTotal={cartTotal}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
        onCheckout={onCheckout}
      />

      {/* Header */}
      <Header
        user={user}
        cartCount={cartCount}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
        onCheckout={onCheckout}
        onAdminPanel={onAdminPanel}
        onOrders={onOrders}
        onSettings={onSettings}
        onCartOpen={() => {
          setCartOpen(true);
          fetchCart();
        }}
        onSignOut={onSignOut}
      />

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-label">✦ Welcome back, {user.username}!</div>
          <h1>
            Shop Smarter,
            <br />
            Live <em>Better.</em>
          </h1>
          <p>
            Live products from your Spring Boot backend at{" "}
            <code
              style={{
                background: "rgba(255,255,255,.1)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: ".85rem",
              }}
            >
              localhost:8080
            </code>
          </p>
          <button className="hero-cta">Explore Collection →</button>
        </div>
      </section>

      {/* Category Pills */}
      <div className="cat-section">
        <div className="cat-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <div className="section-title">
          {activeCategory === "All" ? "All Products" : activeCategory}
        </div>
        <div className="section-count">
          {!productsLoading &&
            `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid-wrap">
        <div className="product-grid">
          {productsLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : productsError ? (
            <div className="state-center">
              <div className="state-icon">⚠️</div>
              <div className="state-msg">{productsError}</div>
              <button
                className="retry-btn"
                onClick={() => fetchProducts(activeCategory)}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-center">
              <div className="state-icon">🔍</div>
              <div className="state-msg">
                No products found{searchQuery ? ` for "${searchQuery}"` : ""}
              </div>
            </div>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onAddToCart={handleAddToCart}
                isAdding={addingIds.has(product.productId)}
                isAdded={addedIds.has(product.productId)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
