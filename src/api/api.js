const BASE_URL = "https://sales-savvy-1.onrender.com";


const api = {
  // ── SESSION ───────────────────────────────────────────
  verifySession: () =>
    fetch(`${BASE_URL}/api/products`, { credentials: "include" }),

  // ── AUTH ──────────────────────────────────────────────
  register: (payload) =>
    fetch(`${BASE_URL}/api/users/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload),
    }),

  login: (payload) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload),
    }),

  // POST /api/auth/logout — deletes JWT from DB, expires cookie
  logout: () =>
    fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST", credentials: "include",
    }),

  // ── PRODUCTS ──────────────────────────────────────────
  getProducts: (category) =>
    fetch(
      `${BASE_URL}/api/products${category && category !== "All" ? `?category=${encodeURIComponent(category)}` : ""}`,
      { credentials: "include" }
    ),

  // ── CART ──────────────────────────────────────────────
  getCartItems: () =>
    fetch(`${BASE_URL}/api/cart/items`, { credentials: "include" }),

  addToCart: (username, productId, quantity = 1) =>
    fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ username, productId, quantity }),
    }),

  updateCart: (username, productId, quantity) =>
    fetch(`${BASE_URL}/api/cart/update`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ username, productId, quantity }),
    }),

  deleteCartItem: (username, productId) =>
    fetch(`${BASE_URL}/api/cart/delete`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ username, productId }),
    }),

  // ── PAYMENT ───────────────────────────────────────────
  // POST /api/payment/create — body: { totalAmount, cartItems }
  createPaymentOrder: (totalAmount, cartItems) =>
    fetch(`${BASE_URL}/api/payment/create`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ totalAmount, cartItems }),
    }),

  // POST /api/payment/verify
  verifyPayment: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    fetch(`${BASE_URL}/api/payment/verify`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
    }),

  // ── ADMIN — BUSINESS ──────────────────────────────────
  adminGetOverallBusiness: () =>
    fetch(`${BASE_URL}/admin/business/overall`, { credentials: "include" }),

  adminGetMonthlyBusiness: (month, year) =>
    fetch(`${BASE_URL}/admin/business/monthly?month=${month}&year=${year}`, { credentials: "include" }),

  adminGetYearlyBusiness: (year) =>
    fetch(`${BASE_URL}/admin/business/yearly?year=${year}`, { credentials: "include" }),

  adminGetDailyBusiness: (date) =>
    fetch(`${BASE_URL}/admin/business/daily?date=${date}`, { credentials: "include" }),

  // ── ADMIN — PRODUCTS ──────────────────────────────────
  // POST /admin/products/add
  adminAddProduct: (payload) =>
    fetch(`${BASE_URL}/admin/products/add`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload),
    }),

  // DELETE /admin/products/delete — { productId }
  adminDeleteProduct: (productId) =>
    fetch(`${BASE_URL}/admin/products/delete`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ productId }),
    }),

  // ── ADMIN — USERS ─────────────────────────────────────
  // GET /admin/user/get?userid=N  — fixed controller uses @GetMapping + @RequestParam
  adminGetUser: (userid) =>
    fetch(`${BASE_URL}/admin/user/get?userid=${userid}`, { credentials: "include" }),

  // PUT /admin/user/modify — { userid, username, email, role }
  adminModifyUser: (payload) =>
    fetch(`${BASE_URL}/admin/user/modify`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload),
    }),

  // ── ORDERS ────────────────────────────────────────────
  // GET /api/orders/myorders — returns list of user's orders with items
  getMyOrders: () =>
    fetch(`${BASE_URL}/api/orders/myorders`, { credentials: "include" }),

  // GET /api/orders/{orderId} — returns single order detail
  getOrderById: (orderId) =>
    fetch(`${BASE_URL}/api/orders/${orderId}`, { credentials: "include" }),

  // ── USER PROFILE ──────────────────────────────────────
  // PUT /api/users/update — { username, email }
  updateProfile: (payload) =>
    fetch(`${BASE_URL}/api/users/update`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload),
    }),

  // PUT /api/users/changepassword — { username, currentPassword, newPassword }
  changePassword: (payload) =>
    fetch(`${BASE_URL}/api/users/changepassword`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify(payload),
    }),
};

export default api;
