import { useState } from "react";
import api from "../api/api";

// ── Password strength helper ──────────────────────
function getPwStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const PW_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const PW_COLORS = ["", "s1", "s2", "s3", "s4"];

// ── AuthPage ──────────────────────────────────────
const AuthPage = ({ onAuth }) => {
  const [tab, setTab] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr, setApiErr] = useState("");
  const [apiOk, setApiOk] = useState("");

  // Login fields
  const [ld, setLd] = useState({ username: "", password: "" });
  const [le, setLe] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Signup fields
  const [sd, setSd] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [se, setSe] = useState({});
  const [agreed, setAgreed] = useState(false);

  const strength = getPwStrength(sd.password);

  // ── Validation ────────────────────────────────
  const validateLogin = () => {
    const e = {};
    if (!ld.username.trim()) e.username = "Username is required";
    if (!ld.password) e.password = "Password is required";
    return e;
  };

  const validateSignup = () => {
    const e = {};
    if (!sd.username || sd.username.length < 5)
      e.username = "Min. 5 characters required";
    if (!sd.email || !/\S+@\S+\.\S+/.test(sd.email))
      e.email = "Valid email required";
    if (!sd.password || sd.password.length < 8)
      e.password = "Min. 8 characters required";
    else {
      const ok =
        /[A-Z]/.test(sd.password) &&
        /[a-z]/.test(sd.password) &&
        /\d/.test(sd.password) &&
        /[@#$%^&+=!]/.test(sd.password);
      if (!ok)
        e.password = "Need uppercase, lowercase, digit & special char (@#$%^&+=!)";
    }
    if (sd.confirm !== sd.password) e.confirm = "Passwords don't match";
    if (!agreed) e.terms = "You must agree to the terms";
    return e;
  };

  // ── Handlers ──────────────────────────────────
  const handleLogin = async () => {
    const errs = validateLogin();
    if (Object.keys(errs).length) { setLe(errs); return; }
    setLe({}); setApiErr(""); setLoading(true);
    try {
      const res = await api.login({ username: ld.username, password: ld.password });
      const data = await res.json();
      if (!res.ok) {
        setApiErr(data.error || "Login failed. Check your credentials.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => onAuth({ username: data.username, role: data.role }), 1000);
    } catch {
      setApiErr("Cannot connect to server. Is Spring Boot running on port 8080?");
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const errs = validateSignup();
    if (Object.keys(errs).length) { setSe(errs); return; }
    setSe({}); setApiErr(""); setLoading(true);
    try {
      const res = await api.register({
        username: sd.username,
        email: sd.email,
        password: sd.password,
        role: "USER",
      });
      const data = await res.json();
      if (!res.ok) {
        setApiErr(data.error || "Registration failed.");
        setLoading(false);
        return;
      }
      setApiOk("Account created! Switching to login…");
      setLoading(false);
      setTimeout(() => { setTab("login"); setApiOk(""); }, 1500);
    } catch {
      setApiErr("Cannot connect to server. Is Spring Boot running on port 8080?");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-orb o1" />
        <div className="auth-orb o2" />
        <div className="auth-left-inner">
          <div className="auth-logo">Sales<span>Savvy</span></div>
          <div className="auth-tagline">Smart Shopping. Every Day.</div>
          <div className="auth-float">🛍️</div>
          <ul className="feat-list">
            {[
              ["🚚", "Free delivery on orders over $50"],
              ["🔒", "JWT secured sessions"],
              ["↩️", "30-day hassle-free returns"],
              ["⭐", "Exclusive deals for members"],
            ].map(([icon, text]) => (
              <li key={text}>
                <span className="feat-icon">{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-card">
          {success ? (
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <div className="success-title">Welcome back! 🎉</div>
              <div className="success-sub">
                Authenticated via your Spring Boot backend. Loading your
                homepage…
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${tab === "login" ? "active" : ""}`}
                  onClick={() => { setTab("login"); setApiErr(""); setApiOk(""); }}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${tab === "signup" ? "active" : ""}`}
                  onClick={() => { setTab("signup"); setApiErr(""); setApiOk(""); }}
                >
                  Create Account
                </button>
              </div>

              {apiErr && <div className="api-err">⚠️ {apiErr}</div>}
              {apiOk  && <div className="api-ok">✓ {apiOk}</div>}

              {/* ── LOGIN FORM ── */}
              {tab === "login" ? (
                <>
                  <div className="auth-heading">Welcome back 👋</div>
                  <div className="auth-sub">
                    Sign in with your SalesSavvy credentials.
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrap">
                      <span className="input-icon">👤</span>
                      <input
                        className={`form-input ${le.username ? "err" : ""}`}
                        placeholder="your_username"
                        value={ld.username}
                        onChange={(e) => setLd((d) => ({ ...d, username: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                    {le.username && <div className="field-err">{le.username}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔑</span>
                      <input
                        className={`form-input ${le.password ? "err" : ""}`}
                        type={showPw ? "text" : "password"}
                        placeholder="Enter password"
                        value={ld.password}
                        onChange={(e) => setLd((d) => ({ ...d, password: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                      <button className="eye-btn" onClick={() => setShowPw(!showPw)}>
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {le.password && <div className="field-err">{le.password}</div>}
                  </div>

                  <a href="#" className="forgot">Forgot password?</a>

                  <div className="check-row">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Keep me signed in</span>
                  </div>

                  <button className="auth-btn" onClick={handleLogin} disabled={loading}>
                    {loading ? "Signing in…" : "Sign In →"}
                  </button>

                  <div className="divider"><hr /><span>or continue with</span><hr /></div>
                  <div className="social-row">
                    <button className="social-btn">🌐 Google</button>
                    <button className="social-btn">🍎 Apple</button>
                  </div>
                </>
              ) : (
                /* ── SIGNUP FORM ── */
                <>
                  <div className="auth-heading">Join SalesSavvy ✨</div>
                  <div className="auth-sub">
                    Calls{" "}
                    <code
                      style={{
                        fontSize: ".75rem",
                        background: "#f1f5f9",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      POST /api/users/register
                    </code>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrap">
                      <span className="input-icon">👤</span>
                      <input
                        className={`form-input ${se.username ? "err" : ""}`}
                        placeholder="min. 5 characters"
                        value={sd.username}
                        onChange={(e) => setSd((d) => ({ ...d, username: e.target.value }))}
                      />
                    </div>
                    {se.username && <div className="field-err">{se.username}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="input-wrap">
                      <span className="input-icon">📧</span>
                      <input
                        className={`form-input ${se.email ? "err" : ""}`}
                        type="email"
                        placeholder="you@example.com"
                        value={sd.email}
                        onChange={(e) => setSd((d) => ({ ...d, email: e.target.value }))}
                      />
                    </div>
                    {se.email && <div className="field-err">{se.email}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔑</span>
                      <input
                        className={`form-input ${se.password ? "err" : ""}`}
                        type={showPw ? "text" : "password"}
                        placeholder="Upper+lower+digit+special"
                        value={sd.password}
                        onChange={(e) => setSd((d) => ({ ...d, password: e.target.value }))}
                      />
                      <button className="eye-btn" onClick={() => setShowPw(!showPw)}>
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {sd.password && (
                      <>
                        <div className="pw-bar">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`pw-seg ${i <= strength ? PW_COLORS[strength] : ""}`}
                            />
                          ))}
                        </div>
                        <div className="pw-label">{PW_LABELS[strength]} password</div>
                      </>
                    )}
                    {se.password && <div className="field-err">{se.password}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔒</span>
                      <input
                        className={`form-input ${se.confirm ? "err" : ""}`}
                        type={showPw2 ? "text" : "password"}
                        placeholder="Repeat password"
                        value={sd.confirm}
                        onChange={(e) => setSd((d) => ({ ...d, confirm: e.target.value }))}
                      />
                      <button className="eye-btn" onClick={() => setShowPw2(!showPw2)}>
                        {showPw2 ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {se.confirm && <div className="field-err">{se.confirm}</div>}
                  </div>

                  <div className="check-row" style={{ marginBottom: se.terms ? 4 : 18 }}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      I agree to the <a href="#">Terms</a> and{" "}
                      <a href="#">Privacy Policy</a>
                    </span>
                  </div>
                  {se.terms && (
                    <div className="field-err" style={{ marginBottom: 14 }}>
                      {se.terms}
                    </div>
                  )}

                  <button className="auth-btn" onClick={handleSignup} disabled={loading}>
                    {loading ? "Creating account…" : "Create Account →"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
