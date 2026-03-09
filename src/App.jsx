import { useState, useEffect } from "react";
import AuthPage        from "./pages/AuthPage";
import HomePage        from "./pages/HomePage";
import CheckoutPage    from "./pages/CheckoutPage";
import AdminPage       from "./pages/AdminPage";
import OrdersPage      from "./pages/OrdersPage";
import AccountSettings from "./pages/AccountSettings";
import "./styles/index.css";

// page: "home" | "checkout" | "admin" | "orders" | "settings"
const App = () => {
  const [user,           setUser]           = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [page,           setPage]           = useState("home");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("https://sales-savvy-1-chm6.onrender.com/api/products", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const username = data.user?.name;
          const role     = data.user?.role;
          if (username) setUser({ username, role });
        }
      } catch {}
      finally { setSessionChecked(true); }
    };
    checkSession();
  }, []);

  if (!sessionChecked) {
    return (
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f1b2d",flexDirection:"column",gap:"16px" }}>
        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:900,color:"#fff" }}>
          Sales<span style={{color:"#00c2a8"}}>Savvy</span>
        </div>
        <div style={{ width:"40px",height:"40px",border:"3px solid rgba(255,255,255,0.1)",borderTop:"3px solid #00c2a8",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={setUser} />;

  const handleSignOut = () => { setUser(null); setPage("home"); };
  const sharedProps = {
    user, onSignOut: handleSignOut,
    onAdminPanel: () => setPage("admin"),
    onOrders:     () => setPage("orders"),
    onSettings:   () => setPage("settings"),
  };

  if (page === "admin") {
    if (user.role !== "ADMIN") { setPage("home"); return null; }
    return <AdminPage {...sharedProps} onBack={() => setPage("home")} />;
  }
  if (page === "checkout") {
    return <CheckoutPage user={user} onBack={()=>setPage("home")} onOrderSuccess={()=>setPage("home")} />;
  }
  if (page === "orders") {
    return <OrdersPage user={user} onBack={()=>setPage("home")} />;
  }
  if (page === "settings") {
    return <AccountSettings user={user} onBack={()=>setPage("home")} onUserUpdate={u=>setUser(u)} />;
  }

  return (
    <HomePage
      user={user}
      onSignOut={handleSignOut}
      onCheckout={()=>setPage("checkout")}
      onAdminPanel={()=>setPage("admin")}
      onOrders={()=>setPage("orders")}
      onSettings={()=>setPage("settings")}
    />
  );
};

export default App;
