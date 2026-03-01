# SalesSavvy Frontend

React + Vite frontend connected to your Spring Boot backend.

---

## 📁 Project Structure

```
salessavvy/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              ← Entry point
    ├── App.jsx               ← Root (Auth ↔ Homepage routing)
    ├── api/
    │   └── api.js            ← All fetch calls to Spring Boot
    ├── styles/
    │   └── index.css         ← All styles
    ├── components/
    │   ├── Header.jsx        ← Sticky navbar
    │   ├── CartDrawer.jsx    ← Slide-in cart panel
    │   ├── ProductCard.jsx   ← Individual product card
    │   ├── SkeletonCard.jsx  ← Loading placeholder
    │   └── Toast.jsx         ← Bottom notification
    └── pages/
        ├── AuthPage.jsx      ← Login + Register page
        └── HomePage.jsx      ← Product listing page
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```
> Runs on **http://localhost:5174** — already configured in your Spring Boot `@CrossOrigin`

### 3. Make sure Spring Boot is running
Your backend should be running on **http://localhost:8080**

---

## 🔌 API Endpoints Used

| Action | Method | Endpoint |
|---|---|---|
| Register | POST | `/api/users/register` |
| Login | POST | `/api/auth/login` |
| Get Products | GET | `/api/products?category=Shirts` |
| Get Cart | GET | `/api/cart/items` |
| Add to Cart | POST | `/api/cart/add` |
| Update Qty | PUT | `/api/cart/update` |
| Remove Item | DELETE | `/api/cart/delete` |

---

## 🍪 Authentication

Your backend sets an **HttpOnly cookie** (`authToken`) on login.  
The frontend uses `credentials: "include"` on every request so the cookie is sent automatically — no manual token handling needed.

---

## 🛠 Notes

- If you see **401/403** errors, the session cookie has expired — the app will auto sign out
- If the backend is unreachable, a clear error message is shown on the auth form
- Password validation on signup mirrors your `UserService.validateUser()` rules exactly
