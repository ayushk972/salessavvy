import { useState } from "react";
import api from "../api/api";

const AccountSettings = ({ user, onBack, onUserUpdate }) => {
  const [tab, setTab] = useState("profile");
  const [toast, setToast] = useState({ show:false, msg:"", ok:true });

  const showToast = (msg, ok=true) => {
    setToast({show:true,msg,ok});
    setTimeout(() => setToast(t=>({...t,show:false})), 2800);
  };

  // ── Profile ──────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ username: user.username, email: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      const res = await api.updateProfile(profileForm);
      if (!res.ok) throw new Error(await res.text());
      showToast("Profile updated successfully!");
      if (onUserUpdate) onUserUpdate({ ...user, username: profileForm.username });
    } catch (e) { showToast(e.message || "Update failed", false); }
    finally { setProfileLoading(false); }
  };

  // ── Password ─────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ cur:false, new:false, con:false });

  const handlePasswordChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword)
      return showToast("All password fields are required", false);
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return showToast("New passwords do not match", false);
    if (pwForm.newPassword.length < 8)
      return showToast("New password must be at least 8 characters", false);
    setPwLoading(true);
    try {
      const res = await api.changePassword({ username: user.username, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      if (!res.ok) throw new Error(await res.text());
      showToast("Password changed successfully!");
      setPwForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (e) { showToast(e.message || "Password change failed", false); }
    finally { setPwLoading(false); }
  };

  const pwStrength = (pw) => {
    if (!pw) return { level:0, label:"", color:"" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return [
      { level:0, label:"", color:"" },
      { level:1, label:"Weak",   color:"#ef4444" },
      { level:2, label:"Fair",   color:"#f59e0b" },
      { level:3, label:"Good",   color:"#3b82f6" },
      { level:4, label:"Strong", color:"#10b981" },
    ][score];
  };
  const strength = pwStrength(pwForm.newPassword);

  const TABS = [
    { id:"profile",  icon:"👤", label:"Profile" },
    { id:"password", icon:"🔒", label:"Password" },
    { id:"role",     icon:"🛡️", label:"Account Info" },
  ];

  return (
    <div className="acc-page">
      {/* Toast */}
      <div className={`acc-toast ${toast.ok?"ok":"err"} ${toast.show?"show":""}`}>
        {toast.ok?"✓":"✕"} {toast.msg}
      </div>

      {/* Topbar */}
      <div className="acc-topbar">
        <button className="acc-back" onClick={onBack}>← Back to Shop</button>
        <div className="acc-topbar-title">Account Settings</div>
        <div className="acc-topbar-user">
          <div className="acc-topbar-av">{user.username[0].toUpperCase()}</div>
          <span>{user.username}</span>
        </div>
      </div>

      <div className="acc-body">
        {/* Sidebar tabs */}
        <aside className="acc-sidebar">
          <div className="acc-profile-card">
            <div className="acc-profile-av">{user.username[0].toUpperCase()}</div>
            <div className="acc-profile-name">{user.username}</div>
            <div className={`acc-profile-role ${user.role === "ADMIN" ? "admin" : "user"}`}>
              {user.role === "ADMIN" ? "⚡ Admin" : "👤 Customer"}
            </div>
          </div>
          <nav className="acc-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`acc-tab ${tab===t.id?"active":""}`}
                onClick={() => setTab(t.id)}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="acc-main">

          {/* ── Profile Tab ── */}
          {tab === "profile" && (
            <div className="acc-panel">
              <div className="acc-panel-title">👤 Profile Information</div>
              <p className="acc-panel-sub">Update your display name and email address.</p>

              <div className="acc-form">
                <div className="acc-field">
                  <label>Username</label>
                  <input type="text" value={profileForm.username}
                    onChange={e=>setProfileForm(f=>({...f,username:e.target.value}))}
                    placeholder="Your username" />
                  <span className="acc-hint">This is how you appear across the platform.</span>
                </div>
                <div className="acc-field">
                  <label>Email Address</label>
                  <input type="email" value={profileForm.email}
                    onChange={e=>setProfileForm(f=>({...f,email:e.target.value}))}
                    placeholder="your@email.com" />
                  <span className="acc-hint">Used for order confirmations and notifications.</span>
                </div>
                <button className="acc-save-btn" onClick={handleProfileSave} disabled={profileLoading}>
                  {profileLoading ? <><span className="acc-spinner"/>Saving…</> : "💾 Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── Password Tab ── */}
          {tab === "password" && (
            <div className="acc-panel">
              <div className="acc-panel-title">🔒 Change Password</div>
              <p className="acc-panel-sub">Choose a strong password with at least 8 characters.</p>

              <div className="acc-form">
                {/* Current */}
                <div className="acc-field">
                  <label>Current Password</label>
                  <div className="acc-pw-wrap">
                    <input type={showPw.cur?"text":"password"} value={pwForm.currentPassword}
                      onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))}
                      placeholder="Enter current password" />
                    <button className="acc-pw-eye" onClick={()=>setShowPw(p=>({...p,cur:!p.cur}))}>
                      {showPw.cur?"🙈":"👁️"}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div className="acc-field">
                  <label>New Password</label>
                  <div className="acc-pw-wrap">
                    <input type={showPw.new?"text":"password"} value={pwForm.newPassword}
                      onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))}
                      placeholder="Enter new password" />
                    <button className="acc-pw-eye" onClick={()=>setShowPw(p=>({...p,new:!p.new}))}>
                      {showPw.new?"🙈":"👁️"}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pwForm.newPassword && (
                    <div className="acc-strength">
                      <div className="acc-strength-bar">
                        {[1,2,3,4].map(n => (
                          <div key={n} className="acc-strength-seg"
                            style={{background: n <= strength.level ? strength.color : "#e2e8f0"}}/>
                        ))}
                      </div>
                      <span style={{color: strength.color}}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="acc-field">
                  <label>Confirm New Password</label>
                  <div className="acc-pw-wrap">
                    <input type={showPw.con?"text":"password"} value={pwForm.confirmPassword}
                      onChange={e=>setPwForm(f=>({...f,confirmPassword:e.target.value}))}
                      placeholder="Confirm new password" />
                    <button className="acc-pw-eye" onClick={()=>setShowPw(p=>({...p,con:!p.con}))}>
                      {showPw.con?"🙈":"👁️"}
                    </button>
                  </div>
                  {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <span className="acc-mismatch">⚠️ Passwords do not match</span>
                  )}
                  {pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && (
                    <span className="acc-match">✓ Passwords match</span>
                  )}
                </div>

                <div className="acc-pw-rules">
                  <div className="acc-pw-rule-title">Password requirements</div>
                  {[
                    ["At least 8 characters", pwForm.newPassword.length >= 8],
                    ["One uppercase letter", /[A-Z]/.test(pwForm.newPassword)],
                    ["One number", /[0-9]/.test(pwForm.newPassword)],
                    ["One special character", /[^A-Za-z0-9]/.test(pwForm.newPassword)],
                  ].map(([rule, met]) => (
                    <div key={rule} className={`acc-pw-rule ${met?"met":""}`}>
                      <span>{met?"✓":"○"}</span><span>{rule}</span>
                    </div>
                  ))}
                </div>

                <button className="acc-save-btn" onClick={handlePasswordChange} disabled={pwLoading}>
                  {pwLoading ? <><span className="acc-spinner"/>Changing…</> : "🔒 Change Password"}
                </button>
              </div>
            </div>
          )}

          {/* ── Account Info Tab ── */}
          {tab === "role" && (
            <div className="acc-panel">
              <div className="acc-panel-title">🛡️ Account Information</div>
              <p className="acc-panel-sub">Your account details and current permissions.</p>

              <div className="acc-info-grid">
                <div className="acc-info-item">
                  <span className="acc-info-icon">👤</span>
                  <div>
                    <div className="acc-info-label">Username</div>
                    <div className="acc-info-val">{user.username}</div>
                  </div>
                </div>
                <div className="acc-info-item">
                  <span className="acc-info-icon">🛡️</span>
                  <div>
                    <div className="acc-info-label">Account Role</div>
                    <div className={`acc-role-badge ${user.role==="ADMIN"?"admin":"user"}`}>
                      {user.role === "ADMIN" ? "⚡ Administrator" : "👤 Customer"}
                    </div>
                  </div>
                </div>
                <div className="acc-info-item">
                  <span className="acc-info-icon">🔒</span>
                  <div>
                    <div className="acc-info-label">Session</div>
                    <div className="acc-info-val acc-active">● Active</div>
                  </div>
                </div>
              </div>

              <div className="acc-permissions">
                <div className="acc-perm-title">Your Permissions</div>
                {[
                  ["Browse & search products",    true],
                  ["Add items to cart",           true],
                  ["Place and pay for orders",    true],
                  ["View order history",          true],
                  ["Manage product catalog",      user.role==="ADMIN"],
                  ["Access admin dashboard",      user.role==="ADMIN"],
                  ["View business analytics",     user.role==="ADMIN"],
                  ["Modify user accounts",        user.role==="ADMIN"],
                ].map(([perm, granted]) => (
                  <div key={perm} className={`acc-perm-row ${granted?"granted":"denied"}`}>
                    <span>{granted?"✓":"✕"}</span>
                    <span>{perm}</span>
                  </div>
                ))}
              </div>

              <div className="acc-role-note">
                {user.role === "ADMIN"
                  ? "⚡ You have administrator privileges. Be careful with sensitive operations."
                  : "To request role changes, please contact your platform administrator."}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AccountSettings;
