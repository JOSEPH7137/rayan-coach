import { useState, useEffect, useRef } from "react";

// ============================================================
// DESIGN TOKENS & GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --orange: #FF6B00;
      --orange-light: #FF8C38;
      --orange-dark: #CC5500;
      --orange-glow: rgba(255,107,0,0.25);
      --black: #0A0A0A;
      --black-2: #111111;
      --black-3: #1A1A1A;
      --black-4: #222222;
      --white: #FFFFFF;
      --white-dim: rgba(255,255,255,0.85);
      --white-mute: rgba(255,255,255,0.5);
      --white-ghost: rgba(255,255,255,0.08);
      --white-border: rgba(255,255,255,0.12);
      --success: #22C55E;
      --warning: #F59E0B;
      --danger: #EF4444;
      --info: #3B82F6;
      --glass: rgba(255,255,255,0.06);
      --glass-border: rgba(255,255,255,0.1);
      --sidebar-w: 260px;
    }
    
    body {
      font-family: 'Satoshi', sans-serif;
      background: var(--black);
      color: var(--white);
      overflow-x: hidden;
      min-height: 100vh;
    }
    
    .display { font-family: 'Clash Display', sans-serif; }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--black-2); }
    ::-webkit-scrollbar-thumb { background: var(--orange); border-radius: 2px; }
    
    /* Animations */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px var(--orange-glow); } 50% { box-shadow: 0 0 40px var(--orange-glow), 0 0 60px var(--orange-glow); } }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    
    .fade-in { animation: fadeIn 0.5s ease forwards; }
    .slide-in { animation: slideIn 0.4s ease forwards; }
    
    /* Glassmorphism */
    .glass-card {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(20px);
      border-radius: 16px;
    }
    
    /* Buttons */
    .btn-primary {
      background: var(--orange);
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 12px;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary:hover { background: var(--orange-light); transform: translateY(-1px); box-shadow: 0 8px 24px var(--orange-glow); }
    
    .btn-outline {
      background: transparent;
      color: var(--orange);
      border: 1.5px solid var(--orange);
      padding: 10px 24px;
      border-radius: 12px;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--orange-glow); }
    
    .btn-ghost {
      background: var(--white-ghost);
      color: var(--white);
      border: 1px solid var(--white-border);
      padding: 10px 20px;
      border-radius: 10px;
      font-family: 'Satoshi', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.12); }
    
    /* Form inputs */
    .input-field {
      background: var(--black-3);
      border: 1.5px solid rgba(255,255,255,0.1);
      color: var(--white);
      padding: 12px 16px;
      border-radius: 10px;
      font-family: 'Satoshi', sans-serif;
      font-size: 15px;
      width: 100%;
      transition: border 0.2s;
      outline: none;
    }
    .input-field:focus { border-color: var(--orange); }
    .input-field::placeholder { color: var(--white-mute); }
    .input-field option { background: var(--black-3); }
    
    /* Sidebar */
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      width: var(--sidebar-w);
      background: var(--black-2);
      border-right: 1px solid var(--white-border);
      display: flex;
      flex-direction: column;
      z-index: 100;
      overflow-y: auto;
    }
    
    .sidebar-logo {
      padding: 24px 20px;
      border-bottom: 1px solid var(--white-border);
    }
    
    .sidebar-nav { padding: 16px 12px; flex: 1; }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 10px;
      color: var(--white-mute);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    .nav-item:hover { color: var(--white); background: var(--white-ghost); }
    .nav-item.active { color: var(--orange); background: rgba(255,107,0,0.12); }
    .nav-item .icon { font-size: 18px; min-width: 22px; }
    
    .main-content {
      margin-left: var(--sidebar-w);
      min-height: 100vh;
      background: var(--black);
    }
    
    .page-header {
      padding: 24px 32px;
      border-bottom: 1px solid var(--white-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .page-body { padding: 28px 32px; }
    
    /* Stats cards */
    .stat-card {
      background: var(--black-2);
      border: 1px solid var(--white-border);
      border-radius: 16px;
      padding: 20px;
    }
    
    /* Tables */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: var(--black-3);
      color: var(--white-mute);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      text-align: left;
    }
    .data-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--white-border);
      font-size: 14px;
      color: var(--white-dim);
    }
    .data-table tr:hover td { background: var(--white-ghost); }
    
    /* Badge */
    .badge {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background: rgba(34,197,94,0.15); color: var(--success); }
    .badge-warning { background: rgba(245,158,11,0.15); color: var(--warning); }
    .badge-danger { background: rgba(239,68,68,0.15); color: var(--danger); }
    .badge-info { background: rgba(59,130,246,0.15); color: var(--info); }
    .badge-orange { background: rgba(255,107,0,0.15); color: var(--orange); }
    
    /* Map placeholder */
    .map-area {
      background: var(--black-3);
      border: 1px solid var(--white-border);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 12px;
      color: var(--white-mute);
      position: relative;
      overflow: hidden;
    }
    
    /* Progress bar */
    .progress-bar {
      height: 4px;
      background: var(--black-3);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--orange), var(--orange-light));
      border-radius: 2px;
      transition: width 0.5s ease;
    }
    
    /* Avatar */
    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--orange), var(--orange-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
      flex-shrink: 0;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal {
      background: var(--black-2);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 32px;
      width: 100%;
      max-width: 480px;
      animation: fadeIn 0.3s ease;
    }
    
    /* Divider */
    .divider { border: none; border-top: 1px solid var(--white-border); margin: 20px 0; }
    
    /* Ticker */
    .ticker-wrap { overflow: hidden; background: rgba(255,107,0,0.08); border-top: 1px solid rgba(255,107,0,0.2); border-bottom: 1px solid rgba(255,107,0,0.2); }
    .ticker { display: flex; gap: 60px; animation: marquee 30s linear infinite; white-space: nowrap; padding: 10px 0; }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      :root { --sidebar-w: 0px; }
      .sidebar { transform: translateX(-260px); transition: transform 0.3s; }
      .sidebar.open { transform: translateX(0); --sidebar-w: 260px; }
      .main-content { margin-left: 0; }
      .page-body { padding: 16px; }
      .page-header { padding: 16px; }
    }
    
    /* Notification dot */
    .notif-dot {
      width: 8px; height: 8px;
      background: var(--orange);
      border-radius: 50%;
      position: absolute;
      top: -2px; right: -2px;
      animation: pulse 2s infinite;
    }
    
    /* SOS Button */
    .sos-btn {
      background: var(--danger);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 50px;
      font-weight: 800;
      font-size: 16px;
      cursor: pointer;
      letter-spacing: 2px;
      animation: glow 2s infinite;
      transition: transform 0.1s;
    }
    .sos-btn:active { transform: scale(0.96); }

    /* Chat bubble */
    .chat-bubble { border-radius: 16px; padding: 10px 14px; max-width: 75%; font-size: 14px; line-height: 1.5; }
    .chat-mine { background: var(--orange); color: white; margin-left: auto; border-bottom-right-radius: 4px; }
    .chat-other { background: var(--black-3); border: 1px solid var(--white-border); border-bottom-left-radius: 4px; }

    /* Star rating */
    .stars { display: flex; gap: 3px; }
    .star { color: var(--warning); font-size: 14px; }

    select.input-field { appearance: none; }
  `}</style>
);

// ============================================================
// ICONS (emoji-based for portability)
// ============================================================
const Icon = ({ n, size = 18 }) => <span style={{ fontSize: size }}>{n}</span>;

// ============================================================
// SHARED COMPONENTS
// ============================================================
const Logo = ({ size = "md" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: size === "lg" ? 44 : 36,
      height: size === "lg" ? 44 : 36,
      background: "linear-gradient(135deg, #FF6B00, #CC5500)",
      borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size === "lg" ? 22 : 18, flexShrink: 0
    }}>🚌</div>
    <div>
      <div className="display" style={{ fontSize: size === "lg" ? 22 : 16, fontWeight: 700, lineHeight: 1.1 }}>
        Rayan <span style={{ color: "var(--orange)" }}>Coach</span>
      </div>
      {size === "lg" && <div style={{ fontSize: 11, color: "var(--white-mute)", letterSpacing: 1 }}>KENYA'S PREMIUM TRANSPORT</div>}
    </div>
  </div>
);

const Sidebar = ({ items, active, onSelect, role, user, onLogout }) => {
  const roleColors = { traveller: "#FF6B00", driver: "#22C55E", admin: "#3B82F6" };
  const roleLabels = { traveller: "Traveller", driver: "Driver", admin: "Administrator" };
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Logo />
        <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--white-ghost)", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="avatar">{user?.name?.charAt(0) || "?"}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: roleColors[role] || "var(--orange)", fontWeight: 600 }}>{roleLabels[role]}</div>
            </div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item, i) => (
          item.divider ? <hr key={i} className="divider" /> :
          <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => onSelect(item.id)}>
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="badge badge-orange" style={{ marginLeft: "auto", fontSize: 11 }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--white-border)" }}>
        <button className="nav-item" onClick={onLogout} style={{ width: "100%" }}>
          <span className="icon">🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, change, color = "var(--orange)", sub }) => (
  <div className="stat-card fade-in" style={{ position: "relative", overflow: "hidden" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 13, color: "var(--white-mute)", marginBottom: 8 }}>{label}</div>
        <div className="display" style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--white-mute)", marginTop: 4 }}>{sub}</div>}
        {change && <div style={{ fontSize: 13, marginTop: 6, color: change.startsWith("+") ? "var(--success)" : "var(--danger)" }}>{change}</div>}
      </div>
      <div style={{ fontSize: 32, opacity: 0.6 }}>{icon}</div>
    </div>
    <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, background: color, opacity: 0.05, borderRadius: "50%" }} />
  </div>
);

const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="display" style={{ fontSize: 22, fontWeight: 700 }}>{title}</h1>
      {subtitle && <p style={{ color: "var(--white-mute)", fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
  </div>
);

const MapPlaceholder = ({ height = 360, label = "Live Map", buses = [] }) => (
  <div className="map-area" style={{ height }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)"
    }} />
    <div style={{ textAlign: "center", zIndex: 1 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--white-dim)" }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--white-mute)", marginTop: 6 }}>Google Maps Integration Active</div>
      {buses.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {buses.map((b, i) => (
            <div key={i} style={{ background: "var(--black-2)", border: "1px solid var(--white-border)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
              🚌 {b.id} — <span style={{ color: b.status === "en_route" ? "var(--success)" : b.status === "idle" ? "var(--warning)" : "var(--white-mute)" }}>
                {b.status === "en_route" ? "En Route" : b.status === "idle" ? "Idle" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 className="display" style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--white-mute)", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================================
// DATA
// ============================================================
const ROUTES_DATA = [
  { from: "Nairobi", to: "Mombasa", price: 1500, distance: "480 km", duration: "8 hrs" },
  { from: "Nairobi", to: "Garissa", price: 1200, distance: "370 km", duration: "6 hrs" },
  { from: "Nairobi", to: "Thika", price: 300, distance: "45 km", duration: "1 hr" },
  { from: "Nairobi", to: "Mwingi", price: 900, distance: "200 km", duration: "4 hrs" },
  { from: "Mombasa", to: "Nairobi", price: 1500, distance: "480 km", duration: "8 hrs" },
  { from: "Garissa", to: "Nairobi", price: 1200, distance: "370 km", duration: "6 hrs" },
];

const BUSES = [
  { id: "RC-001", name: "Rayan VIP Express", type: "VIP", seats: 44, amenities: ["WiFi", "AC", "USB", "TV"], status: "en_route", driver: "Abdi Hassan" },
  { id: "RC-002", name: "Rayan Standard Plus", type: "Standard", seats: 56, amenities: ["AC", "USB"], status: "idle", driver: "James Mwangi" },
  { id: "RC-003", name: "Rayan Coastal Liner", type: "VIP", seats: 44, amenities: ["WiFi", "AC", "USB", "TV", "Snacks"], status: "en_route", driver: "Fatuma Said" },
  { id: "RC-004", name: "Rayan Economy", type: "Standard", seats: 60, amenities: ["AC"], status: "offline", driver: "Peter Kamau" },
];

const DRIVERS_DATA = [
  { id: "D001", name: "Abdi Hassan", phone: "+254 712 345678", license: "DL-2025-001", expiry: "2026-03-15", psv: "PSV-2024-123", bus: "RC-001", status: "active", rating: 4.8, trips: 234, earnings: 128000 },
  { id: "D002", name: "James Mwangi", phone: "+254 723 456789", license: "DL-2024-089", expiry: "2025-12-20", psv: "PSV-2024-456", bus: "RC-002", status: "active", rating: 4.6, trips: 189, earnings: 105000 },
  { id: "D003", name: "Fatuma Said", phone: "+254 734 567890", license: "DL-2023-234", expiry: "2026-08-01", psv: "PSV-2025-789", bus: "RC-003", status: "en_route", rating: 4.9, trips: 312, earnings: 168000 },
  { id: "D004", name: "Peter Kamau", phone: "+254 745 678901", license: "DL-2025-056", expiry: "2025-11-30", psv: "PSV-2023-012", bus: "RC-004", status: "offline", rating: 4.3, trips: 156, earnings: 89000 },
];

const TRIPS_DATA = [
  { id: "T2024-001", from: "Nairobi", to: "Mombasa", date: "2024-06-15", time: "06:00", driver: "Abdi Hassan", bus: "RC-001", status: "en_route", passengers: 38, revenue: 57000 },
  { id: "T2024-002", from: "Nairobi", to: "Garissa", date: "2024-06-15", time: "07:30", driver: "James Mwangi", bus: "RC-002", status: "completed", passengers: 50, revenue: 60000 },
  { id: "T2024-003", from: "Mombasa", to: "Nairobi", date: "2024-06-15", time: "08:00", driver: "Fatuma Said", bus: "RC-003", status: "en_route", passengers: 42, revenue: 63000 },
  { id: "T2024-004", from: "Nairobi", to: "Thika", date: "2024-06-16", time: "09:00", driver: "Peter Kamau", bus: "RC-004", status: "scheduled", passengers: 0, revenue: 0 },
];

const BOOKINGS = [
  { id: "BK-0042", route: "Nairobi → Mombasa", date: "2024-06-15", seat: "12A", class: "VIP", price: 1500, status: "confirmed", bus: "RC-001", qr: "QR-BK0042" },
  { id: "BK-0038", route: "Mombasa → Nairobi", date: "2024-06-20", seat: "08B", class: "Standard", price: 1500, status: "upcoming", bus: "RC-002", qr: "QR-BK0038" },
  { id: "BK-0031", route: "Nairobi → Garissa", date: "2024-05-28", seat: "05C", class: "VIP", price: 1200, status: "completed", bus: "RC-001", qr: "QR-BK0031" },
];

// ============================================================
// AUTH PAGE
// ============================================================
const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState("landing");
  const [role, setRole] = useState("traveller");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(role, { name: form.name || (role === "driver" ? "Abdi Hassan" : role === "admin" ? "Admin Manager" : "John Traveller"), email: form.email || "user@rayan.co.ke" });
    }, 1200);
  };

  if (mode === "landing") return <LandingPage onGetStarted={(r) => { setRole(r); setMode("auth"); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <GlobalStyles />
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo size="lg" />
          <p style={{ color: "var(--white-mute)", marginTop: 12, fontSize: 15 }}>Kenya's Premium Transport System</p>
        </div>

        {/* Role tabs */}
        <div style={{ display: "flex", background: "var(--black-2)", borderRadius: 12, padding: 4, marginBottom: 28, border: "1px solid var(--white-border)" }}>
          {[["traveller", "🧑 Traveller"], ["driver", "🚛 Driver"], ["admin", "🧑‍💼 Admin"]].map(([r, label]) => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer",
              background: role === r ? "var(--orange)" : "transparent",
              color: role === r ? "white" : "var(--white-mute)",
              fontSize: 13, fontWeight: 600, fontFamily: "Satoshi, sans-serif", transition: "all 0.2s"
            }}>{label}</button>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <h2 className="display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--white-mute)", fontSize: 14, marginBottom: 24 }}>
            {role === "traveller" ? "Book your next journey" : role === "driver" ? "Driver portal access" : "Admin control panel"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isLogin && <input className="input-field" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
            <input className="input-field" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {role === "driver" && <input className="input-field" placeholder="+254 Phone (OTP)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />}
            <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
              {loading ? "⏳ Authenticating..." : isLogin ? "Sign In →" : "Create Account →"}
            </button>
          </div>

          {role === "traveller" && (
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--white-mute)" }}>
              {isLogin ? "No account? " : "Already registered? "}
              <span style={{ color: "var(--orange)", cursor: "pointer", fontWeight: 600 }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign up free" : "Sign in"}
              </span>
            </p>
          )}
        </div>

        <button onClick={() => setMode("landing")} style={{ background: "none", border: "none", color: "var(--white-mute)", cursor: "pointer", marginTop: 20, display: "block", marginLeft: "auto", marginRight: "auto", fontSize: 14 }}>
          ← Back to home
        </button>
      </div>
    </div>
  );
};

// ============================================================
// LANDING PAGE
// ============================================================
const LandingPage = ({ onGetStarted }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    { name: "Sarah Wanjiku", route: "Nairobi → Mombasa", rating: 5, text: "Rayan Coach is absolutely incredible! The VIP seats are so comfortable and the WiFi worked perfectly the whole journey." },
    { name: "Mohammed Ali", route: "Garissa → Nairobi", rating: 5, text: "Best bus service in Kenya by far. Always on time, professional drivers, and the app makes booking so easy." },
    { name: "Grace Muthoni", route: "Nairobi → Thika", rating: 4, text: "Clean buses, friendly staff, and real-time tracking gives me peace of mind. Highly recommend!" },
  ];

  const amenities = [
    { icon: "📡", title: "High-Speed WiFi", desc: "Stay connected throughout your journey" },
    { icon: "🔌", title: "USB Charging Ports", desc: "Keep your devices powered" },
    { icon: "❄️", title: "Climate Control", desc: "Comfortable temperature all year" },
    { icon: "📺", title: "Entertainment Screens", desc: "Movies and music on demand" },
    { icon: "🛋️", title: "VIP Reclining Seats", desc: "Extra legroom for your comfort" },
    { icon: "🛡️", title: "GPS Tracked", desc: "Real-time safety monitoring" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <GlobalStyles />
      
      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, z: 100, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--white-border)", zIndex: 100 }}>
        <Logo />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => onGetStarted("traveller")}>Login</button>
          <button className="btn-primary" onClick={() => onGetStarted("traveller")}>Book Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 80, textAlign: "center", position: "relative", overflow: "hidden", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(255,107,0,0.12) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 200, height: 200, background: "var(--orange-glow)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 150, height: 150, background: "rgba(59,130,246,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
        
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px", zIndex: 1, position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 50, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ color: "var(--success)", fontSize: 10 }}>●</span>
            <span style={{ fontSize: 13, color: "var(--white-dim)", fontWeight: 500 }}>Kenya's #1 Premium Bus Service</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
            Travel in <span style={{ color: "var(--orange)" }}>Comfort</span><br />Across Kenya
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: "var(--white-mute)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Premium bus travel from Nairobi to Mombasa, Garissa, Thika & beyond. VIP seating, live tracking, and seamless M-Pesa booking.
          </p>
          
          {/* Quick booking bar */}
          <div style={{ background: "var(--black-2)", border: "1px solid var(--white-border)", borderRadius: 16, padding: 20, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 720, margin: "0 auto 32px" }}>
            <select className="input-field" style={{ flex: 1, minWidth: 140 }}>
              <option>📍 From</option>
              {["Nairobi", "Mombasa", "Garissa", "Thika", "Mwingi"].map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input-field" style={{ flex: 1, minWidth: 140 }}>
              <option>🏁 To</option>
              {["Mombasa", "Nairobi", "Garissa", "Thika", "Mwingi"].map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" className="input-field" style={{ flex: 1, minWidth: 140 }} defaultValue="2024-06-15" />
            <button className="btn-primary" onClick={() => onGetStarted("traveller")} style={{ padding: "12px 24px", whiteSpace: "nowrap" }}>🔍 Search Buses</button>
          </div>
          
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[["500K+", "Happy Passengers"], ["15+", "Years Experience"], ["50+", "Daily Routes"], ["4.8⭐", "Average Rating"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div className="display" style={{ fontSize: 24, fontWeight: 700, color: "var(--orange)" }}>{v}</div>
                <div style={{ fontSize: 12, color: "var(--white-mute)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 60 }}>
              {["🚌 Nairobi → Mombasa: KSh 1,500", "🚌 Nairobi → Garissa: KSh 1,200", "🚌 Nairobi → Thika: KSh 300", "🚌 Mombasa → Nairobi: KSh 1,500", "🚌 Nairobi → Mwingi: KSh 900", "📦 Parcel Delivery Available", "⚡ Book in 60 seconds"].map(t => (
                <span key={t} style={{ fontSize: 13, color: "var(--orange)", fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Showcase */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Our <span style={{ color: "var(--orange)" }}>Fleet</span></h2>
          <p style={{ color: "var(--white-mute)", fontSize: 15 }}>Modern, well-maintained buses for every journey</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
          {BUSES.map(bus => (
            <div key={bus.id} className="glass-card" style={{ padding: 24, transition: "transform 0.2s" }}>
              <div style={{ background: "linear-gradient(135deg, #1A1A1A, #222)", borderRadius: 12, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 64 }}>🚌</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{bus.name}</h3>
                  <div style={{ fontSize: 13, color: "var(--white-mute)" }}>{bus.seats} seats • {bus.type}</div>
                </div>
                <span className={`badge badge-${bus.type === "VIP" ? "orange" : "info"}`}>{bus.type}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {bus.amenities.map(a => (
                  <span key={a} style={{ background: "var(--white-ghost)", border: "1px solid var(--white-border)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--white-dim)" }}>{a}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section style={{ padding: "80px 40px", background: "var(--black-2)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Premium <span style={{ color: "var(--orange)" }}>Amenities</span></h2>
          <p style={{ color: "var(--white-mute)" }}>High-speed WiFi and power outlets available onboard</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
          {amenities.map(a => (
            <div key={a.title} className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{a.title}</div>
              <div style={{ color: "var(--white-mute)", fontSize: 13 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>What <span style={{ color: "var(--orange)" }}>Travellers</span> Say</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card" style={{ padding: 24 }}>
              <div className="stars" style={{ marginBottom: 12 }}>
                {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="star">★</span>)}
              </div>
              <p style={{ fontSize: 14, color: "var(--white-dim)", lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--orange)" }}>{t.route}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "80px 40px", background: "var(--black-2)", borderTop: "1px solid var(--white-border)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div>
            <h2 className="display" style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Get in <span style={{ color: "var(--orange)" }}>Touch</span></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[["📍", "Nairobi HQ", "Second St, Nairobi CBD"], ["📍", "Mombasa Branch", "Moi Avenue, Mombasa"], ["📞", "Phone", "+254 745 129233"], ["📧", "Email", "info@rayan.co.ke"]].map(([i, l, v]) => (
                <div key={l} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{i}</span>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--white-mute)", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Quick Message</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input-field" placeholder="Your name" />
              <input className="input-field" type="email" placeholder="Email address" />
              <textarea className="input-field" placeholder="Message..." rows={4} style={{ resize: "vertical" }} />
              <button className="btn-primary">Send Message 📨</button>
            </div>
          </div>
        </div>
      </section>

      {/* Portal entry */}
      <section style={{ padding: "60px 40px", textAlign: "center" }}>
        <h2 className="display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Access Your Portal</h2>
        <p style={{ color: "var(--white-mute)", marginBottom: 32, fontSize: 15 }}>Separate dashboards for each role</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[["traveller", "🧑", "Traveller Portal", "Book tickets, track buses"], ["driver", "🚛", "Driver Portal", "Manage trips, earnings"], ["admin", "🧑‍💼", "Admin Panel", "Full system control"]].map(([r, ic, label, desc]) => (
            <div key={r} className="glass-card" style={{ padding: 24, width: 200, cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => onGetStarted(r)}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{ic}</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 12, color: "var(--white-mute)", marginBottom: 16 }}>{desc}</div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 13, padding: "10px 16px" }}>Enter →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--white-border)", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <p style={{ fontSize: 13, color: "var(--white-mute)" }}>© 2024 Rayan Coach Ltd. All rights reserved. | Nairobi, Kenya</p>
      </footer>
    </div>
  );
};

// ============================================================
// TRAVELLER DASHBOARD
// ============================================================
const TravellerDashboard = ({ user, onLogout }) => {
  const [page, setPage] = useState("dashboard");
  const [bookingStep, setBookingStep] = useState(1);
  const [booking, setBooking] = useState({ from: "", to: "", date: "", returnDate: "", tripType: "one-way", class: "Standard", bus: "" });
  const [modal, setModal] = useState(null);
  const [parcel, setParcel] = useState({ senderName: "", receiverName: "", type: "", delivery: "same-day" });

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "book", icon: "🎫", label: "Book Ticket" },
    { id: "parcel", icon: "📦", label: "Parcel Delivery" },
    { id: "track", icon: "📍", label: "Live Tracking" },
    { id: "tickets", icon: "🎟️", label: "My Tickets" },
    { id: "routes", icon: "🗺️", label: "Saved Routes" },
    { divider: true },
    { id: "notifications", icon: "🔔", label: "Notifications", badge: "3" },
    { id: "reviews", icon: "⭐", label: "Reviews" },
    { id: "safety", icon: "🛡️", label: "Safety" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <TravellerHome user={user} setPage={setPage} bookings={BOOKINGS} />;
      case "book": return <BookingPage booking={booking} setBooking={setBooking} step={bookingStep} setStep={setBookingStep} onConfirm={() => { setModal("ticket"); setBookingStep(1); }} />;
      case "parcel": return <ParcelPage parcel={parcel} setParcel={setParcel} />;
      case "track": return <TrackingPage />;
      case "tickets": return <TicketsPage bookings={BOOKINGS} />;
      case "routes": return <SavedRoutesPage />;
      case "notifications": return <NotificationsPage />;
      case "reviews": return <ReviewsPage />;
      case "safety": return <SafetyPage />;
      case "profile": return <ProfilePage user={user} />;
      default: return <TravellerHome user={user} setPage={setPage} bookings={BOOKINGS} />;
    }
  };

  return (
    <div>
      <GlobalStyles />
      <Sidebar items={navItems} active={page} onSelect={setPage} role="traveller" user={user} onLogout={onLogout} />
      <div className="main-content">
        {renderPage()}
      </div>
      <Modal open={modal === "ticket"} onClose={() => setModal(null)} title="🎉 Booking Confirmed!">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ background: "var(--black-3)", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid var(--white-border)" }}>
            <div style={{ fontSize: 11, color: "var(--white-mute)", marginBottom: 8 }}>BOOKING REFERENCE</div>
            <div className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--orange)" }}>BK-{Math.floor(Math.random() * 9000 + 1000)}</div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <div style={{ background: "white", padding: 12, borderRadius: 8, fontSize: 48 }}>▣</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--white-mute)", marginTop: 8 }}>QR Code — Show at boarding</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-outline" style={{ flex: 1 }}>⬇️ Download PDF</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>🖨️ Print Ticket</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const TravellerHome = ({ user, setPage, bookings }) => (
  <div className="fade-in">
    <PageHeader title={`Hello, ${user.name.split(" ")[0]} 👋`} subtitle="Welcome back to Rayan Coach" actions={
      <button className="btn-primary" onClick={() => setPage("book")}>+ Book Trip</button>
    } />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🎫" label="Total Bookings" value="12" change="+2 this month" />
        <StatCard icon="✅" label="Completed Trips" value="10" color="var(--success)" />
        <StatCard icon="⭐" label="Avg Rating Given" value="4.7" color="var(--warning)" />
        <StatCard icon="💰" label="Total Spent" value="KSh 18K" color="var(--info)" />
      </div>

      {/* Upcoming trip */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Upcoming Trip</h3>
          <span className="badge badge-success">Confirmed</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div className="display" style={{ fontSize: 22, fontWeight: 700 }}>NBI</div>
                <div style={{ fontSize: 11, color: "var(--white-mute)" }}>Nairobi</div>
              </div>
              <div style={{ flex: 1, height: 2, background: "var(--orange)", position: "relative" }}>
                <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: 20 }}>✈️</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div className="display" style={{ fontSize: 22, fontWeight: 700 }}>MBA</div>
                <div style={{ fontSize: 11, color: "var(--white-mute)" }}>Mombasa</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[["📅", "15 Jun 2024"], ["⏰", "06:00 AM"], ["💺", "Seat 12A (VIP)"], ["🚌", "RC-001"]].map(([ic, val]) => (
                <div key={val} style={{ fontSize: 13 }}><span>{ic}</span> {val}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignSelf: "flex-end" }}>
            <button className="btn-ghost" onClick={() => {}}>🎟️ View Ticket</button>
            <button className="btn-primary" onClick={() => setPage("track")}>📍 Track Bus</button>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Recent Bookings</h3>
          <button className="btn-ghost" style={{ fontSize: 13, padding: "6px 14px" }} onClick={() => setPage("tickets")}>View All</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Booking ID</th><th>Route</th><th>Date</th><th>Class</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td style={{ color: "var(--orange)", fontWeight: 600 }}>{b.id}</td>
                <td>{b.route}</td>
                <td>{b.date}</td>
                <td><span className={`badge badge-${b.class === "VIP" ? "orange" : "info"}`}>{b.class}</span></td>
                <td style={{ fontWeight: 600 }}>KSh {b.price.toLocaleString()}</td>
                <td><span className={`badge badge-${b.status === "confirmed" ? "success" : b.status === "upcoming" ? "info" : "warning"}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const BookingPage = ({ booking, setBooking, step, setStep, onConfirm }) => {
  const cities = ["Nairobi", "Mombasa", "Garissa", "Thika", "Mwingi"];
  const route = ROUTES_DATA.find(r => r.from === booking.from && r.to === booking.to);
  const selectedBus = BUSES.find(b => b.id === booking.bus);

  return (
    <div className="fade-in">
      <PageHeader title="Book a Ticket" subtitle="Find and book your next journey" />
      <div className="page-body">
        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          {["Route", "Bus & Class", "Payment"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: step > i + 1 ? "var(--success)" : step === i + 1 ? "var(--orange)" : "var(--black-3)", border: `2px solid ${step >= i + 1 ? "transparent" : "var(--white-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 14, color: step === i + 1 ? "var(--white)" : "var(--white-mute)", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              {i < 2 && <div style={{ width: 40, height: 2, background: step > i + 1 ? "var(--orange)" : "var(--white-border)" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, maxWidth: 960 }}>
          <div>
            {step === 1 && (
              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Select Your Route</h3>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  {["one-way", "return"].map(t => (
                    <button key={t} onClick={() => setBooking({ ...booking, tripType: t })} style={{
                      flex: 1, padding: "10px 16px", borderRadius: 10, border: `2px solid ${booking.tripType === t ? "var(--orange)" : "var(--white-border)"}`,
                      background: booking.tripType === t ? "rgba(255,107,0,0.1)" : "transparent",
                      color: booking.tripType === t ? "var(--orange)" : "var(--white-mute)",
                      cursor: "pointer", fontFamily: "Satoshi", fontWeight: 600, fontSize: 14
                    }}>{t === "one-way" ? "→ One Way" : "⇄ Return"}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>From</label>
                    <select className="input-field" value={booking.from} onChange={e => setBooking({ ...booking, from: e.target.value })}>
                      <option value="">Select city</option>
                      {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>To</label>
                    <select className="input-field" value={booking.to} onChange={e => setBooking({ ...booking, to: e.target.value })}>
                      <option value="">Select city</option>
                      {cities.filter(c => c !== booking.from).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>Travel Date</label>
                    <input type="date" className="input-field" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} defaultValue="2024-06-15" />
                  </div>
                  {booking.tripType === "return" && (
                    <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>Return Date</label>
                      <input type="date" className="input-field" value={booking.returnDate} onChange={e => setBooking({ ...booking, returnDate: e.target.value })} />
                    </div>
                  )}
                </div>
                {route && <div className="glass-card" style={{ padding: 16, background: "rgba(255,107,0,0.08)", borderColor: "rgba(255,107,0,0.2)" }}>
                  <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
                    <span>📏 {route.distance}</span>
                    <span>⏱️ {route.duration}</span>
                    <span style={{ color: "var(--orange)", fontWeight: 700 }}>💰 From KSh {route.price.toLocaleString()}</span>
                  </div>
                </div>}
                <button className="btn-primary" style={{ marginTop: 20, padding: "13px 32px" }} onClick={() => setStep(2)} disabled={!booking.from || !booking.to}>Next: Choose Bus →</button>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Choose Bus & Class</h3>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {["Standard", "VIP"].map(c => (
                    <button key={c} onClick={() => setBooking({ ...booking, class: c })} style={{
                      flex: 1, padding: "10px 16px", borderRadius: 10, border: `2px solid ${booking.class === c ? "var(--orange)" : "var(--white-border)"}`,
                      background: booking.class === c ? "rgba(255,107,0,0.1)" : "transparent",
                      color: booking.class === c ? "var(--orange)" : "var(--white-mute)", cursor: "pointer", fontFamily: "Satoshi", fontWeight: 600, fontSize: 14
                    }}>{c === "VIP" ? "👑 VIP" : "🪑 Standard"}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {BUSES.filter(b => b.type === booking.class || booking.class === "Standard").map(bus => (
                    <div key={bus.id} onClick={() => setBooking({ ...booking, bus: bus.id })} style={{
                      padding: 16, borderRadius: 12, border: `2px solid ${booking.bus === bus.id ? "var(--orange)" : "var(--white-border)"}`,
                      background: booking.bus === bus.id ? "rgba(255,107,0,0.08)" : "var(--black-3)", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{bus.name}</div>
                          <div style={{ fontSize: 13, color: "var(--white-mute)" }}>{bus.seats} seats • {bus.id}</div>
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            {bus.amenities.map(a => <span key={a} style={{ background: "var(--white-ghost)", borderRadius: 4, padding: "2px 6px", fontSize: 11 }}>{a}</span>)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {booking.bus === bus.id && <div style={{ color: "var(--orange)", fontSize: 22 }}>✓</div>}
                          <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 16 }}>KSh {route?.price.toLocaleString() || "—"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" onClick={() => setStep(3)} disabled={!booking.bus}>Next: Payment →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>💳 Payment</h3>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {["M-Pesa", "Bank"].map(m => (
                    <button key={m} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "2px solid var(--orange)", background: m === "M-Pesa" ? "rgba(255,107,0,0.1)" : "transparent", color: m === "M-Pesa" ? "var(--orange)" : "var(--white-mute)", cursor: "pointer", fontFamily: "Satoshi", fontWeight: 600, fontSize: 14 }}>{m === "M-Pesa" ? "📱 M-Pesa" : "🏦 Bank"}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>M-Pesa Phone Number</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ background: "var(--black-3)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 14, whiteSpace: "nowrap" }}>🇰🇪 +254</div>
                      <input className="input-field" placeholder="7XX XXX XXX" style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 13, color: "var(--white-mute)", marginBottom: 4 }}>You will receive an M-Pesa prompt to confirm</div>
                    <div className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>KSh {route?.price.toLocaleString() || "—"}</div>
                  </div>
                  <button className="btn-primary" style={{ padding: 14, justifyContent: "center", fontSize: 15 }} onClick={onConfirm}>📱 Pay with M-Pesa</button>
                </div>
                <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setStep(2)}>← Back</button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="glass-card" style={{ padding: 24, alignSelf: "start" }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Booking Summary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Route", booking.from && booking.to ? `${booking.from} → ${booking.to}` : "—"],
                ["Date", booking.date || "—"],
                ["Type", booking.tripType === "return" ? "Return" : "One-Way"],
                ["Class", booking.class],
                ["Bus", selectedBus?.name || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--white-mute)" }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <hr className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 700, color: "var(--orange)", fontSize: 18 }}>KSh {route?.price.toLocaleString() || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParcelPage = ({ parcel, setParcel }) => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title="📦 Parcel Delivery" subtitle="Send parcels across Kenya with Rayan Coach" />
      <div className="page-body">
        {submitted ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Parcel Registered!</h3>
            <p style={{ color: "var(--white-mute)", marginBottom: 24 }}>Your parcel has been registered. Tracking ID: <strong style={{ color: "var(--orange)" }}>RC-PKG-{Math.floor(Math.random() * 9000 + 1000)}</strong></p>
            <button className="btn-primary" onClick={() => setSubmitted(false)}>Send Another Parcel</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 800 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Sender Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input-field" placeholder="Sender name" value={parcel.senderName} onChange={e => setParcel({ ...parcel, senderName: e.target.value })} />
                <input className="input-field" placeholder="+254 Phone" />
                <select className="input-field"><option>From city</option>{["Nairobi", "Mombasa", "Garissa", "Thika", "Mwingi"].map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="glass-card" style={{ padding: 24 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Receiver Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input-field" placeholder="Receiver name" value={parcel.receiverName} onChange={e => setParcel({ ...parcel, receiverName: e.target.value })} />
                <input className="input-field" placeholder="+254 Phone" />
                <select className="input-field"><option>To city</option>{["Mombasa", "Nairobi", "Garissa", "Thika", "Mwingi"].map(c => <option key={c}>{c}</option>)}</select>
              </div>
            </div>
            <div className="glass-card" style={{ padding: 24, gridColumn: "1 / -1" }}>
              <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Parcel Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                <select className="input-field" value={parcel.type} onChange={e => setParcel({ ...parcel, type: e.target.value })}>
                  <option>Parcel type</option>
                  {["Documents", "Electronics", "Clothing", "Food", "Medicine", "Other"].map(t => <option key={t}>{t}</option>)}
                </select>
                <input className="input-field" placeholder="Weight (kg)" type="number" />
                <select className="input-field" value={parcel.delivery} onChange={e => setParcel({ ...parcel, delivery: e.target.value })}>
                  <option value="same-day">Same Day</option>
                  <option value="next-day">Next Day</option>
                </select>
              </div>
              <textarea className="input-field" placeholder="Special instructions..." rows={3} />
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "var(--orange)", fontWeight: 700, fontSize: 16 }}>Estimated: KSh 500 – 1,200</div>
                <button className="btn-primary" onClick={() => setSubmitted(true)}>Submit Parcel 📦</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TrackingPage = () => (
  <div className="fade-in">
    <PageHeader title="📍 Live Tracking" subtitle="Track your bus in real-time" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <MapPlaceholder height={440} label="Live Bus Tracking" buses={BUSES} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Your Bus — RC-001</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["🚌", "Bus", "RC-001 Rayan VIP Express"],
                ["👤", "Driver", "Abdi Hassan"],
                ["📍", "Location", "Mtito Andei"],
                ["🏁", "Destination", "Mombasa"],
                ["⏱️", "ETA", "2h 45min"],
                ["🟢", "Status", "En Route"]].map(([ic, k, v]) => (
                <div key={k} style={{ display: "flex", gap: 10, fontSize: 14 }}>
                  <span>{ic}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--white-mute)", fontSize: 11 }}>{k}</div>
                    <div style={{ fontWeight: 500 }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="progress-bar" style={{ marginTop: 16 }}>
              <div className="progress-fill" style={{ width: "62%" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--white-mute)", marginTop: 4 }}>
              <span>Nairobi</span>
              <span style={{ color: "var(--orange)" }}>62% complete</span>
              <span>Mombasa</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>📤 Share Trip</button>
            <button className="sos-btn" style={{ flex: 1, fontSize: 14, padding: "12px 16px" }}>🆘 SOS</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TicketsPage = ({ bookings }) => (
  <div className="fade-in">
    <PageHeader title="🎟️ My Tickets" subtitle="Download and manage your bookings" />
    <div className="page-body">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bookings.map(b => (
          <div key={b.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span className="display" style={{ fontSize: 18, fontWeight: 700, color: "var(--orange)" }}>{b.id}</span>
                  <span className={`badge badge-${b.status === "confirmed" ? "success" : b.status === "upcoming" ? "info" : "warning"}`}>{b.status}</span>
                  <span className={`badge badge-${b.class === "VIP" ? "orange" : "info"}`}>{b.class}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{b.route}</h3>
                <div style={{ display: "flex", gap: 20, fontSize: 14, color: "var(--white-mute)" }}>
                  <span>📅 {b.date}</span>
                  <span>💺 Seat {b.seat}</span>
                  <span>🚌 {b.bus}</span>
                  <span style={{ color: "var(--orange)", fontWeight: 700 }}>KSh {b.price.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ background: "white", padding: 10, borderRadius: 8, fontSize: 36 }}>▣</div>
                <div style={{ fontSize: 11, color: "var(--white-mute)" }}>{b.qr}</div>
              </div>
            </div>
            <hr className="divider" />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>⬇️ Download PDF</button>
              <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>🖨️ Print</button>
              {b.status === "completed" && <button className="btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>⭐ Rate Trip</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SavedRoutesPage = () => (
  <div className="fade-in">
    <PageHeader title="🗺️ Saved Routes" subtitle="Your frequently traveled routes" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {[["Nairobi", "Mombasa", "KSh 1,500", "8h", 5], ["Nairobi", "Thika", "KSh 300", "1h", 3]].map(([f, t, price, dur, cnt]) => (
          <div key={`${f}${t}`} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="display" style={{ fontSize: 18, fontWeight: 700 }}>{f} → {t}</div>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--danger)" }}>🗑️</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--white-mute)", marginBottom: 16 }}>{dur} • {price} • Booked {cnt} times</div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "10px 16px" }}>Book Again</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NotificationsPage = () => (
  <div className="fade-in">
    <PageHeader title="🔔 Notifications" />
    <div className="page-body">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 600 }}>
        {[
          { ic: "✅", title: "Booking Confirmed", msg: "Your trip Nairobi → Mombasa on 15 Jun is confirmed.", time: "2 min ago", unread: true },
          { ic: "🚌", title: "Bus Departed", msg: "RC-001 has departed Nairobi CBD. ETA Mombasa: 8hrs.", time: "1 hour ago", unread: true },
          { ic: "💰", title: "Payment Received", msg: "M-Pesa payment of KSh 1,500 confirmed. Ref: QW123.", time: "1 hour ago", unread: true },
          { ic: "⭐", title: "Rate Your Trip", msg: "How was your recent trip Nairobi → Garissa?", time: "2 days ago" },
        ].map((n, i) => (
          <div key={i} className="glass-card" style={{ padding: 16, display: "flex", gap: 14, borderColor: n.unread ? "rgba(255,107,0,0.3)" : "var(--glass-border)" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{n.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "var(--white-mute)" }}>{n.time}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--white-mute)" }}>{n.msg}</div>
            </div>
            {n.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReviewsPage = () => {
  const [rating, setRating] = useState(0);
  return (
    <div className="fade-in">
      <PageHeader title="⭐ Reviews & Ratings" />
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 900 }}>
          <div>
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Rate a Trip</h4>
              <select className="input-field" style={{ marginBottom: 12 }}>
                <option>Select trip to rate</option>
                <option>BK-0042 — Nairobi → Mombasa</option>
                <option>BK-0031 — Nairobi → Garissa</option>
              </select>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} onClick={() => setRating(s)} style={{ fontSize: 32, cursor: "pointer", color: s <= rating ? "var(--warning)" : "var(--black-4)" }}>★</span>
                ))}
              </div>
              <textarea className="input-field" placeholder="Share your experience..." rows={4} style={{ marginBottom: 12 }} />
              <button className="btn-primary">Submit Review</button>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Reviews</h4>
            {[{ name: "Sarah W.", rating: 5, route: "Nairobi → Mombasa", text: "Excellent service! Very comfortable VIP seats." },
              { name: "John K.", rating: 4, route: "Nairobi → Thika", text: "Quick and efficient. Driver was very professional." }].map((r, i) => (
              <div key={i} className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{r.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--white-mute)" }}>{r.route}</div>
                  </div>
                  <div className="stars" style={{ marginLeft: "auto" }}>{Array.from({ length: r.rating }).map((_, i) => <span key={i} className="star">★</span>)}</div>
                </div>
                <p style={{ fontSize: 13, color: "var(--white-mute)" }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SafetyPage = () => (
  <div className="fade-in">
    <PageHeader title="🛡️ Safety Center" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 900 }}>
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🆘</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Emergency SOS</h3>
          <p style={{ color: "var(--white-mute)", fontSize: 14, marginBottom: 20 }}>Press to alert emergency services and share your location with family</p>
          <button className="sos-btn" style={{ width: "100%", fontSize: 18 }}>SOS</button>
        </div>
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Share Trip</h3>
          <p style={{ color: "var(--white-mute)", fontSize: 14, marginBottom: 20 }}>Share live trip details with your emergency contacts</p>
          <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Share Live Location</button>
        </div>
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Emergency Contacts</h3>
          <p style={{ color: "var(--white-mute)", fontSize: 14, marginBottom: 20 }}>Add trusted contacts for emergencies</p>
          <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>Manage Contacts</button>
        </div>
      </div>
      <div className="glass-card" style={{ padding: 24, maxWidth: 600, marginTop: 20 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Emergency Contacts</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {["Police: 999", "Ambulance: 999", "Rayan Coach Emergency: +254 745 129233"].map(c => (
            <div key={c} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "10px 14px", background: "var(--black-3)", borderRadius: 8 }}>
              <span>{c}</span>
              <span style={{ color: "var(--orange)", cursor: "pointer" }}>📞 Call</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage = ({ user }) => (
  <div className="fade-in">
    <PageHeader title="👤 My Profile" />
    <div className="page-body">
      <div style={{ maxWidth: 600 }}>
        <div className="glass-card" style={{ padding: 28, marginBottom: 20, textAlign: "center" }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, margin: "0 auto 16px" }}>{user.name.charAt(0)}</div>
          <h3 className="display" style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</h3>
          <div style={{ color: "var(--white-mute)", fontSize: 14 }}>{user.email}</div>
          <div style={{ color: "var(--orange)", fontSize: 13, marginTop: 6 }}>Rayan Premier Member</div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Personal Information</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>Full Name</label><input className="input-field" defaultValue={user.name} /></div>
            <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>Email</label><input className="input-field" defaultValue={user.email} /></div>
            <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>Phone</label><input className="input-field" defaultValue="+254 7XX XXX XXX" /></div>
            <div><label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 6 }}>National ID</label><input className="input-field" placeholder="ID number" /></div>
            <button className="btn-primary" style={{ alignSelf: "flex-start" }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// DRIVER DASHBOARD
// ============================================================
const DriverDashboard = ({ user, onLogout }) => {
  const [page, setPage] = useState("dashboard");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "admin", text: "Good morning Abdi! Your trip to Mombasa departs at 06:00.", time: "05:30" },
    { from: "me", text: "Understood, I'm ready. Bus checked.", time: "05:45" },
  ]);

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "trips", icon: "🗺️", label: "My Trips", badge: "1" },
    { id: "tracking", icon: "📍", label: "GPS & Navigation" },
    { id: "attendance", icon: "🕐", label: "Attendance" },
    { id: "vehicle", icon: "🚌", label: "My Vehicle" },
    { id: "earnings", icon: "💰", label: "Earnings" },
    { divider: true },
    { id: "chat", icon: "💬", label: "Chat with Admin", badge: "1" },
    { id: "incidents", icon: "⚠️", label: "Incident Reports" },
    { id: "safety", icon: "🛡️", label: "Safety & SOS" },
    { id: "profile", icon: "👤", label: "Profile & Documents" },
  ];

  const driver = DRIVERS_DATA[0];
  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages([...messages, { from: "me", text: chatMsg, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatMsg("");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DriverHome driver={driver} setPage={setPage} />;
      case "trips": return <DriverTrips driver={driver} />;
      case "tracking": return <DriverTracking />;
      case "attendance": return <DriverAttendance />;
      case "vehicle": return <DriverVehicle />;
      case "earnings": return <DriverEarnings driver={driver} />;
      case "chat": return <DriverChat messages={messages} chatMsg={chatMsg} setChatMsg={setChatMsg} sendMessage={sendMessage} />;
      case "incidents": return <IncidentPage />;
      case "safety": return <DriverSafety />;
      case "profile": return <DriverProfile driver={driver} />;
      default: return <DriverHome driver={driver} setPage={setPage} />;
    }
  };

  return (
    <div>
      <GlobalStyles />
      <Sidebar items={navItems} active={page} onSelect={setPage} role="driver" user={{ name: driver.name }} onLogout={onLogout} />
      <div className="main-content">{renderPage()}</div>
    </div>
  );
};

const DriverHome = ({ driver, setPage }) => {
  const [clocked, setClocked] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title={`Morning, ${driver.name.split(" ")[0]} 🌅`} subtitle="Driver Control Center" actions={
        <button className={clocked ? "btn-ghost" : "btn-primary"} onClick={() => setClocked(!clocked)}>
          {clocked ? "⏹️ Clock Out" : "▶️ Clock In"}
        </button>
      } />
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard icon="🗺️" label="Trips Today" value="1" color="var(--orange)" />
          <StatCard icon="👥" label="Passengers" value="38" color="var(--success)" />
          <StatCard icon="💰" label="Today's Earnings" value="KSh 4.2K" color="var(--warning)" />
          <StatCard icon="⭐" label="Rating" value={driver.rating} color="var(--info)" />
          <StatCard icon="⏰" label="Hours Worked" value={clocked ? "3h 20m" : "—"} sub={clocked ? "Clocked in" : "Not clocked in"} />
        </div>

        {/* Active trip */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20, border: "1px solid rgba(255,107,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>🚌 Active Trip</h3>
            <span className="badge badge-success">En Route</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[["Route", "Nairobi → Mombasa"], ["Bus", "RC-001"], ["Passengers", "38 / 44"], ["Departure", "06:00 AM"], ["ETA", "14:00 PM"], ["Distance Left", "188 km"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "var(--white-mute)", marginBottom: 3 }}>{k}</div>
                <div style={{ fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "62%" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary">📍 Update Location</button>
            <button className="btn-outline" onClick={() => setPage("tracking")}>🧭 Navigation</button>
            <button className="btn-ghost" onClick={() => setPage("chat")}>💬 Contact Admin</button>
          </div>
        </div>

        {/* Trip controls */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Trip Controls</h4>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[["🟡", "Idle", "warning"], ["🟢", "En Route", "success"], ["✅", "Completed", "info"]].map(([ic, label, color]) => (
              <button key={label} className="btn-ghost" style={{ padding: "12px 20px", borderColor: `var(--${color})`, color: `var(--${color})` }}>
                {ic} {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverTrips = ({ driver }) => (
  <div className="fade-in">
    <PageHeader title="🗺️ My Trips" subtitle="View and manage assigned trips" />
    <div className="page-body">
      <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Trip ID</th><th>Route</th><th>Date & Time</th><th>Bus</th><th>Passengers</th><th>Status</th><th>Revenue</th></tr></thead>
          <tbody>
            {TRIPS_DATA.filter(t => t.driver === driver.name).map(t => (
              <tr key={t.id}>
                <td style={{ color: "var(--orange)", fontWeight: 600 }}>{t.id}</td>
                <td>{t.from} → {t.to}</td>
                <td>{t.date} {t.time}</td>
                <td>{t.bus}</td>
                <td>{t.passengers}</td>
                <td><span className={`badge badge-${t.status === "en_route" ? "success" : t.status === "completed" ? "info" : "warning"}`}>{t.status}</span></td>
                <td style={{ fontWeight: 600 }}>{t.revenue > 0 ? `KSh ${t.revenue.toLocaleString()}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DriverTracking = () => (
  <div className="fade-in">
    <PageHeader title="📍 GPS & Navigation" />
    <div className="page-body">
      <MapPlaceholder height={400} label="GPS Navigation — RC-001" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
        {[["📍", "Current", "Mtito Andei"], ["🏁", "Destination", "Mombasa CBD"], ["⏱️", "ETA", "2h 45min"]].map(([ic, k, v]) => (
          <div key={k} className="stat-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{ic}</div>
            <div style={{ fontSize: 11, color: "var(--white-mute)" }}>{k}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DriverAttendance = () => {
  const [clocked, setClocked] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title="🕐 Attendance" subtitle="Track your work hours" />
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700 }}>
          <div className="glass-card" style={{ padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>⏰</div>
            <div style={{ fontSize: 14, color: "var(--white-mute)", marginBottom: 4 }}>Current Status</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 700, color: clocked ? "var(--success)" : "var(--white-mute)", marginBottom: 20 }}>
              {clocked ? "Clocked In" : "Clocked Out"}
            </div>
            <button className={clocked ? "btn-outline" : "btn-primary"} style={{ width: "100%", justifyContent: "center" }} onClick={() => setClocked(!clocked)}>
              {clocked ? "⏹️ Clock Out" : "▶️ Clock In"}
            </button>
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>This Week</h4>
            {[["Mon", "06:00 - 14:30", "8.5h"], ["Tue", "06:00 - 15:00", "9h"], ["Wed", "REST", "—"], ["Thu", "06:00 - 14:00", "8h"], ["Fri", "Today", "—"]].map(([d, s, h]) => (
              <div key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: "1px solid var(--white-border)" }}>
                <span style={{ fontWeight: 600, width: 40 }}>{d}</span>
                <span style={{ color: "var(--white-mute)" }}>{s}</span>
                <span style={{ color: "var(--orange)", fontWeight: 600 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverVehicle = () => (
  <div className="fade-in">
    <PageHeader title="🚌 My Vehicle" subtitle="RC-001 — Rayan VIP Express" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 800 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>🚌</div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Vehicle Details</h3>
          {[["Plate", "KBZ 123A"], ["Make", "Scania Touring"], ["Year", "2022"], ["Seats", "44"], ["Type", "VIP"], ["Fuel", "Diesel"], ["Mileage", "87,432 km"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: "1px solid var(--white-border)" }}>
              <span style={{ color: "var(--white-mute)" }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Maintenance Alerts</h4>
            {[["🔧", "Oil Change", "Due in 800 km", "warning"], ["🛞", "Tyre Rotation", "Due in 5,000 km", "info"], ["🔍", "Vehicle Inspection", "Next: 2024-08-01", "success"]].map(([ic, t, d, s]) => (
              <div key={t} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "12px", background: "var(--black-3)", borderRadius: 8 }}>
                <span style={{ fontSize: 20 }}>{ic}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t}</div>
                  <div style={{ fontSize: 12 }}><span className={`badge badge-${s}`}>{d}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Report a Fault</h4>
            <textarea className="input-field" placeholder="Describe the issue..." rows={3} style={{ marginBottom: 12 }} />
            <button className="btn-primary">⚠️ Report Fault</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DriverEarnings = ({ driver }) => (
  <div className="fade-in">
    <PageHeader title="💰 Earnings" subtitle="Track your income and payouts" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="💰" label="Total Earnings" value={`KSh ${(driver.earnings / 1000).toFixed(0)}K`} color="var(--success)" />
        <StatCard icon="📅" label="This Month" value="KSh 22K" change="+12%" color="var(--orange)" />
        <StatCard icon="⏳" label="Pending Payout" value="KSh 8.5K" color="var(--warning)" />
        <StatCard icon="🗺️" label="Total Trips" value={driver.trips} color="var(--info)" />
      </div>
      <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white-border)" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Payment History</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Trip</th><th>Route</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {[["Jun 14", "T2024-001", "Nairobi → Mombasa", 4200, "paid"],
              ["Jun 13", "T2024-099", "Mombasa → Nairobi", 3900, "paid"],
              ["Jun 12", "T2024-097", "Nairobi → Garissa", 3600, "pending"],
            ].map(([d, id, r, a, s]) => (
              <tr key={id}><td>{d}</td><td style={{ color: "var(--orange)" }}>{id}</td><td>{r}</td>
                <td style={{ color: "var(--success)", fontWeight: 600 }}>KSh {a.toLocaleString()}</td>
                <td><span className={`badge badge-${s === "paid" ? "success" : "warning"}`}>{s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DriverChat = ({ messages, chatMsg, setChatMsg, sendMessage }) => (
  <div className="fade-in">
    <PageHeader title="💬 Chat with Admin" />
    <div className="page-body">
      <div className="glass-card" style={{ maxWidth: 600, display: "flex", flexDirection: "column", height: 480 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--white-border)", display: "flex", gap: 10, alignItems: "center" }}>
          <div className="avatar" style={{ background: "linear-gradient(135deg, var(--info), #2563EB)" }}>A</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Admin Manager</div>
            <div style={{ fontSize: 11, color: "var(--success)" }}>● Online</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
              <div>
                <div className={`chat-bubble ${m.from === "me" ? "chat-mine" : "chat-other"}`}>{m.text}</div>
                <div style={{ fontSize: 10, color: "var(--white-mute)", marginTop: 4, textAlign: m.from === "me" ? "right" : "left" }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid var(--white-border)", display: "flex", gap: 10 }}>
          <input className="input-field" placeholder="Type a message..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} style={{ flex: 1 }} />
          <button className="btn-primary" style={{ padding: "12px 16px" }} onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  </div>
);

const IncidentPage = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title="⚠️ Incident Reports" />
      <div className="page-body">
        {submitted ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Report Submitted</h3>
            <p style={{ color: "var(--white-mute)", fontSize: 14, marginBottom: 20 }}>Admin has been notified. Incident ID: <strong style={{ color: "var(--orange)" }}>INC-{Math.floor(Math.random() * 9000 + 1000)}</strong></p>
            <button className="btn-ghost" onClick={() => setSubmitted(false)}>Submit Another</button>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 28, maxWidth: 560 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Report an Incident</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <select className="input-field">
                <option>Select incident type</option>
                <option>🚨 Accident</option>
                <option>🔧 Breakdown</option>
                <option>👤 Passenger Issue</option>
                <option>🚦 Traffic Delay</option>
                <option>Other</option>
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input className="input-field" placeholder="Location" />
                <input type="datetime-local" className="input-field" />
              </div>
              <textarea className="input-field" placeholder="Describe the incident in detail..." rows={5} />
              <div style={{ border: "2px dashed var(--white-border)", borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, color: "var(--white-mute)" }}>Upload photos (tap to select)</div>
              </div>
              <div style={{ background: "var(--black-3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--white-mute)" }}>
                📍 GPS: Mtito Andei, -2.8274° S, 38.1653° E • {new Date().toLocaleString()}
              </div>
              <button className="btn-primary" onClick={() => setSubmitted(true)}>Submit Incident Report ⚠️</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DriverSafety = () => (
  <div className="fade-in">
    <PageHeader title="🛡️ Safety & SOS" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 800 }}>
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🆘</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Emergency SOS</h3>
          <p style={{ color: "var(--white-mute)", fontSize: 14, marginBottom: 20 }}>Alerts admin and emergency services with your GPS location</p>
          <button className="sos-btn" style={{ width: "100%", fontSize: 18, padding: 18 }}>SOS</button>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Contacts</h4>
          {[["Admin", "+254 745 129233"], ["Breakdown", "+254 700 000000"], ["Police", "999"], ["Ambulance", "999"]].map(([n, p]) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--white-border)", fontSize: 14 }}>
              <span>{n}</span>
              <span style={{ color: "var(--orange)", cursor: "pointer" }}>📞 {p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DriverProfile = ({ driver }) => (
  <div className="fade-in">
    <PageHeader title="👤 Profile & Documents" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 800 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 24, margin: "0 auto 12px", background: "linear-gradient(135deg, var(--success), #16A34A)" }}>{driver.name.charAt(0)}</div>
            <h3 style={{ fontWeight: 700 }}>{driver.name}</h3>
            <div style={{ fontSize: 13, color: "var(--success)" }}>● Active Driver</div>
          </div>
          {[["Driver ID", driver.id], ["Phone", driver.phone], ["Assigned Bus", driver.bus], ["Rating", `⭐ ${driver.rating}`], ["Total Trips", driver.trips]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderBottom: "1px solid var(--white-border)" }}>
              <span style={{ color: "var(--white-mute)" }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Documents & Compliance</h4>
          {[
            { name: "Driver's License", num: driver.license, exp: driver.expiry, status: "valid" },
            { name: "PSV Badge (NTSA)", num: driver.psv, exp: "2025-06-30", status: "expiring" },
            { name: "Medical Certificate", num: "MED-2024-78", exp: "2024-12-31", status: "valid" },
          ].map(doc => (
            <div key={doc.name} style={{ padding: 14, background: "var(--black-3)", borderRadius: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{doc.name}</span>
                <span className={`badge badge-${doc.status === "valid" ? "success" : "warning"}`}>{doc.status}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--white-mute)" }}>{doc.num} • Expires: {doc.exp}</div>
            </div>
          ))}
          <button className="btn-ghost" style={{ width: "100%", marginTop: 8, justifyContent: "center" }}>📤 Upload Document</button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// ADMIN DASHBOARD
// ============================================================
const AdminDashboard = ({ user, onLogout }) => {
  const [page, setPage] = useState("dashboard");
  const [chatMsg, setChatMsg] = useState("");
  const [adminMessages, setAdminMessages] = useState([
    { from: "driver", driver: "Abdi Hassan", text: "Bus checked and ready to go.", time: "05:45" },
  ]);

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Mission Control" },
    { id: "drivers", icon: "👥", label: "Drivers" },
    { id: "vehicles", icon: "🚌", label: "Fleet" },
    { id: "dispatch", icon: "📡", label: "Dispatch" },
    { id: "tracking", icon: "📍", label: "Live Tracking" },
    { id: "payments", icon: "💰", label: "Payments" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { divider: true },
    { id: "compliance", icon: "📋", label: "Compliance" },
    { id: "chat", icon: "💬", label: "Communications" },
    { id: "roles", icon: "🔑", label: "Roles & Access" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  const sendAdminMsg = () => {
    if (!chatMsg.trim()) return;
    setAdminMessages([...adminMessages, { from: "admin", text: chatMsg, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatMsg("");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <AdminHome setPage={setPage} />;
      case "drivers": return <AdminDrivers />;
      case "vehicles": return <AdminVehicles />;
      case "dispatch": return <AdminDispatch />;
      case "tracking": return <AdminTracking />;
      case "payments": return <AdminPayments />;
      case "analytics": return <AdminAnalytics />;
      case "compliance": return <AdminCompliance />;
      case "chat": return <AdminChat messages={adminMessages} chatMsg={chatMsg} setChatMsg={setChatMsg} send={sendAdminMsg} />;
      case "roles": return <AdminRoles />;
      case "settings": return <AdminSettings />;
      default: return <AdminHome setPage={setPage} />;
    }
  };

  return (
    <div>
      <GlobalStyles />
      <Sidebar items={navItems} active={page} onSelect={setPage} role="admin" user={user} onLogout={onLogout} />
      <div className="main-content">{renderPage()}</div>
    </div>
  );
};

const AdminHome = ({ setPage }) => (
  <div className="fade-in">
    <PageHeader title="🧑‍💼 Mission Control" subtitle="Rayan Coach — System Overview" actions={
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-ghost">📊 Export Report</button>
        <button className="btn-primary" onClick={() => setPage("dispatch")}>+ Create Trip</button>
      </div>
    } />
    <div className="page-body">
      {/* Alert banner */}
      <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>2 Alerts: </span>
          <span style={{ fontSize: 14, color: "var(--white-mute)" }}>Driver D004 PSV badge expires in 30 days • Vehicle RC-004 oil change overdue</span>
        </div>
        <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPage("compliance")}>View →</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🚌" label="Active Trips" value="2" color="var(--success)" change="+1 from yesterday" />
        <StatCard icon="👥" label="Drivers Online" value="3/4" color="var(--orange)" />
        <StatCard icon="💰" label="Today's Revenue" value="KSh 180K" change="+18%" color="var(--warning)" />
        <StatCard icon="🎫" label="Tickets Sold" value="130" color="var(--info)" change="+22 today" />
        <StatCard icon="📦" label="Parcels" value="14" color="var(--success)" />
        <StatCard icon="⭐" label="Avg Rating" value="4.7" color="var(--warning)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Driver status */}
        <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white-border)", display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Driver Status</h3>
            <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setPage("drivers")}>Manage</button>
          </div>
          <div style={{ padding: 16 }}>
            {DRIVERS_DATA.map(d => (
              <div key={d.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--white-border)" }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{d.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "var(--white-mute)" }}>{d.bus}</div>
                </div>
                <span className={`badge badge-${d.status === "active" || d.status === "en_route" ? "success" : d.status === "idle" ? "warning" : "danger"}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet status */}
        <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white-border)", display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Fleet Status</h3>
            <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setPage("vehicles")}>Manage</button>
          </div>
          <div style={{ padding: 16 }}>
            {BUSES.map(b => (
              <div key={b.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--white-border)" }}>
                <span style={{ fontSize: 24 }}>🚌</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "var(--white-mute)" }}>{b.id} • Driver: {b.driver}</div>
                </div>
                <span className={`badge badge-${b.status === "en_route" ? "success" : b.status === "idle" ? "warning" : "danger"}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent trips */}
      <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white-border)" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Today's Trips</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Trip ID</th><th>Route</th><th>Driver</th><th>Bus</th><th>Passengers</th><th>Status</th><th>Revenue</th></tr></thead>
          <tbody>
            {TRIPS_DATA.map(t => (
              <tr key={t.id}>
                <td style={{ color: "var(--orange)", fontWeight: 600 }}>{t.id}</td>
                <td>{t.from} → {t.to}</td>
                <td>{t.driver}</td>
                <td>{t.bus}</td>
                <td>{t.passengers || "—"}</td>
                <td><span className={`badge badge-${t.status === "en_route" ? "success" : t.status === "completed" ? "info" : t.status === "scheduled" ? "warning" : "danger"}`}>{t.status}</span></td>
                <td style={{ fontWeight: 600, color: "var(--success)" }}>{t.revenue ? `KSh ${t.revenue.toLocaleString()}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AdminDrivers = () => {
  const [modal, setModal] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title="👥 Drivers Management" subtitle={`${DRIVERS_DATA.length} drivers registered`} actions={
        <button className="btn-primary" onClick={() => setModal(true)}>+ Add Driver</button>
      } />
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icon="✅" label="Active" value="3" color="var(--success)" />
          <StatCard icon="🟡" label="On Route" value="2" color="var(--warning)" />
          <StatCard icon="❌" label="Offline" value="1" color="var(--danger)" />
          <StatCard icon="⭐" label="Avg Rating" value="4.65" color="var(--orange)" />
        </div>
        <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
          <table className="data-table">
            <thead><tr><th>Driver</th><th>Phone</th><th>License</th><th>PSV Badge</th><th>Bus</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {DRIVERS_DATA.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{d.name.charAt(0)}</div>
                      <div><div style={{ fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 11, color: "var(--white-mute)" }}>{d.id}</div></div>
                    </div>
                  </td>
                  <td>{d.phone}</td>
                  <td><div style={{ fontSize: 13 }}>{d.license}</div><div style={{ fontSize: 11, color: "var(--white-mute)" }}>Exp: {d.expiry}</div></td>
                  <td><div style={{ fontSize: 13 }}>{d.psv}</div></td>
                  <td>{d.bus}</td>
                  <td><span style={{ color: "var(--warning)" }}>⭐ {d.rating}</span></td>
                  <td><span className={`badge badge-${d.status === "active" || d.status === "en_route" ? "success" : "danger"}`}>{d.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>Edit</button>
                      <button style={{ padding: "5px 10px", fontSize: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", borderRadius: 8, cursor: "pointer", fontFamily: "Satoshi" }}>Block</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Driver">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input-field" placeholder="Full name" />
          <input className="input-field" placeholder="Phone number" />
          <input className="input-field" placeholder="Email address" />
          <input className="input-field" placeholder="License number" />
          <input className="input-field" placeholder="PSV Badge number" />
          <select className="input-field"><option>Assign bus</option>{BUSES.map(b => <option key={b.id}>{b.id} — {b.name}</option>)}</select>
          <input type="date" className="input-field" placeholder="License expiry" />
          <button className="btn-primary" style={{ justifyContent: "center" }} onClick={() => setModal(false)}>Add Driver</button>
        </div>
      </Modal>
    </div>
  );
};

const AdminVehicles = () => {
  const [modal, setModal] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title="🚌 Fleet Management" subtitle={`${BUSES.length} vehicles registered`} actions={
        <button className="btn-primary" onClick={() => setModal(true)}>+ Register Vehicle</button>
      } />
      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {BUSES.map(bus => (
            <div key={bus.id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>🚌</span>
                <span className={`badge badge-${bus.status === "en_route" ? "success" : bus.status === "idle" ? "warning" : "danger"}`}>{bus.status}</span>
              </div>
              <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{bus.name}</h4>
              <div style={{ fontSize: 13, color: "var(--white-mute)", marginBottom: 12 }}>{bus.id} • {bus.type} • {bus.seats} seats</div>
              <div style={{ fontSize: 13, marginBottom: 12 }}>👤 Driver: {bus.driver}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {bus.amenities.map(a => <span key={a} style={{ background: "var(--white-ghost)", borderRadius: 4, padding: "2px 6px", fontSize: 11 }}>{a}</span>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: "7px 10px" }}>Edit</button>
                <button className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: "7px 10px" }}>Maintenance</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Register Vehicle">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input-field" placeholder="Vehicle name" />
          <input className="input-field" placeholder="Plate number" />
          <select className="input-field"><option>Type</option><option>VIP</option><option>Standard</option></select>
          <input className="input-field" placeholder="Seats" type="number" />
          <select className="input-field"><option>Assign driver</option>{DRIVERS_DATA.map(d => <option key={d.id}>{d.name}</option>)}</select>
          <button className="btn-primary" style={{ justifyContent: "center" }} onClick={() => setModal(false)}>Register Vehicle</button>
        </div>
      </Modal>
    </div>
  );
};

const AdminDispatch = () => {
  const [modal, setModal] = useState(false);
  return (
    <div className="fade-in">
      <PageHeader title="📡 Dispatch Center" subtitle="Create and manage trip assignments" actions={
        <button className="btn-primary" onClick={() => setModal(true)}>+ Create Trip</button>
      } />
      <div className="page-body">
        <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
          <table className="data-table">
            <thead><tr><th>Trip ID</th><th>Route</th><th>Date/Time</th><th>Driver</th><th>Bus</th><th>Passengers</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {TRIPS_DATA.map(t => (
                <tr key={t.id}>
                  <td style={{ color: "var(--orange)", fontWeight: 600 }}>{t.id}</td>
                  <td>{t.from} → {t.to}</td>
                  <td>{t.date} {t.time}</td>
                  <td>{t.driver}</td>
                  <td>{t.bus}</td>
                  <td>{t.passengers || "0"}</td>
                  <td><span className={`badge badge-${t.status === "en_route" ? "success" : t.status === "completed" ? "info" : t.status === "scheduled" ? "warning" : "danger"}`}>{t.status}</span></td>
                  <td><div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>Reassign</button>
                    <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>Track</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Create New Trip">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <select className="input-field"><option>From city</option>{["Nairobi","Mombasa","Garissa","Thika","Mwingi"].map(c=><option key={c}>{c}</option>)}</select>
          <select className="input-field"><option>To city</option>{["Mombasa","Nairobi","Garissa","Thika","Mwingi"].map(c=><option key={c}>{c}</option>)}</select>
          <input type="date" className="input-field" />
          <input type="time" className="input-field" />
          <select className="input-field"><option>Assign driver</option>{DRIVERS_DATA.map(d=><option key={d.id}>{d.name}</option>)}</select>
          <select className="input-field"><option>Assign bus</option>{BUSES.map(b=><option key={b.id}>{b.id} — {b.name}</option>)}</select>
          <button className="btn-primary" style={{ justifyContent: "center" }} onClick={() => setModal(false)}>Create Trip</button>
        </div>
      </Modal>
    </div>
  );
};

const AdminTracking = () => (
  <div className="fade-in">
    <PageHeader title="📍 Live Fleet Tracking" subtitle="Real-time map of all vehicles" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <MapPlaceholder height={500} label="All Buses — Live Map" buses={BUSES} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ fontWeight: 700 }}>Bus Status</h4>
          {BUSES.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{b.id}</span>
                <span className={`badge badge-${b.status === "en_route" ? "success" : b.status === "idle" ? "warning" : "danger"}`}>{b.status}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--white-mute)" }}>{b.name}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>👤 {b.driver}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AdminPayments = () => (
  <div className="fade-in">
    <PageHeader title="💰 Payments & Financials" actions={
      <select className="input-field" style={{ width: 140 }}><option>This Month</option><option>This Week</option><option>Today</option></select>
    } />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="💰" label="Total Revenue" value="KSh 540K" change="+22%" color="var(--success)" />
        <StatCard icon="📱" label="M-Pesa Revenue" value="KSh 480K" change="89%" color="var(--orange)" />
        <StatCard icon="🏦" label="Bank Revenue" value="KSh 60K" change="11%" color="var(--info)" />
        <StatCard icon="👥" label="Driver Payouts" value="KSh 162K" color="var(--warning)" />
        <StatCard icon="📈" label="Net Profit" value="KSh 378K" color="var(--success)" />
        <StatCard icon="🎫" label="Commission" value="30%" color="var(--orange)" />
      </div>
      <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white-border)" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Transaction Log</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Ref</th><th>Passenger</th><th>Route</th><th>Method</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {[
              ["MP-2024-001", "Sarah W.", "Nairobi → Mombasa", "M-Pesa", 1500, "Jun 15", "confirmed"],
              ["MP-2024-002", "Ali H.", "Nairobi → Garissa", "M-Pesa", 1200, "Jun 15", "confirmed"],
              ["BK-2024-003", "Grace M.", "Mombasa → Nairobi", "Bank", 1500, "Jun 14", "confirmed"],
              ["MP-2024-004", "Peter K.", "Nairobi → Thika", "M-Pesa", 300, "Jun 14", "pending"],
            ].map(([ref, p, r, m, a, d, s]) => (
              <tr key={ref}>
                <td style={{ color: "var(--orange)", fontWeight: 600, fontSize: 12 }}>{ref}</td>
                <td>{p}</td><td>{r}</td>
                <td><span className={`badge badge-${m === "M-Pesa" ? "success" : "info"}`}>{m}</span></td>
                <td style={{ color: "var(--success)", fontWeight: 600 }}>KSh {a.toLocaleString()}</td>
                <td>{d}</td>
                <td><span className={`badge badge-${s === "confirmed" ? "success" : "warning"}`}>{s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AdminAnalytics = () => (
  <div className="fade-in">
    <PageHeader title="📊 Reports & Analytics" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Revenue Trend (This Month)</h4>
          <div style={{ display: "flex", align: "flex-end", gap: 6, height: 120 }}>
            {[60, 45, 80, 90, 55, 70, 100, 85, 75, 95, 110, 88, 92, 78].map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ background: `linear-gradient(180deg, var(--orange), var(--orange-dark))`, height: `${v}%`, borderRadius: "3px 3px 0 0", opacity: 0.8 + i * 0.01 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--white-mute)" }}>
            <span>Jun 1</span><span>Jun 14</span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Top Routes by Revenue</h4>
          {[["Nairobi → Mombasa", 240000, 88], ["Nairobi → Garissa", 96000, 35], ["Mombasa → Nairobi", 180000, 66], ["Nairobi → Thika", 24000, 9]].map(([r, v, pct]) => (
            <div key={r} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>{r}</span>
                <span style={{ color: "var(--orange)", fontWeight: 600 }}>KSh {(v / 1000).toFixed(0)}K</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {[["📈", "Total Revenue (Month)", "KSh 540K", "+22%", "success"],
          ["🎫", "Tickets Sold", "360", "+18%", "info"],
          ["🚌", "Trips Completed", "48", "+8%", "orange"],
          ["⭐", "Customer Satisfaction", "4.7/5", "+0.2", "warning"]].map(([ic, label, val, ch, color]) => (
          <StatCard key={label} icon={ic} label={label} value={val} change={ch} color={`var(--${color})`} />
        ))}
      </div>
    </div>
  </div>
);

const AdminCompliance = () => (
  <div className="fade-in">
    <PageHeader title="📋 Compliance Center" subtitle="Track documents and expiry alerts" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Driver Compliance</h4>
          {DRIVERS_DATA.map(d => (
            <div key={d.id} className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{d.name.charAt(0)}</div>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
              </div>
              {[["License", d.license, d.expiry, new Date(d.expiry) < new Date("2025-12-01") ? "warning" : "success"],
                ["PSV Badge", d.psv, "2025-06-30", "warning"]].map(([doc, num, exp, status]) => (
                <div key={doc} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, padding: "6px 10px", background: "var(--black-3)", borderRadius: 6 }}>
                  <span style={{ color: "var(--white-mute)" }}>{doc}: {num}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "var(--white-mute)" }}>Exp: {exp}</span>
                    <span className={`badge badge-${status}`}>{status === "warning" ? "Expiring" : "Valid"}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Vehicle Compliance</h4>
          {BUSES.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>{b.id} — {b.name}</div>
              {[["Insurance", "INS-2024-001", "2024-12-31", "warning"],
                ["Inspection", "NTSA-2024-RC001", "2024-09-01", "info"],
                ["Roadworthiness", "RW-2024-001", "2025-03-01", "success"]].map(([doc, num, exp, status]) => (
                <div key={doc} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, padding: "6px 10px", background: "var(--black-3)", borderRadius: 6 }}>
                  <span style={{ color: "var(--white-mute)" }}>{doc}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "var(--white-mute)" }}>Exp: {exp}</span>
                    <span className={`badge badge-${status}`}>{status === "warning" ? "Expiring" : status === "info" ? "Review" : "Valid"}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AdminChat = ({ messages, chatMsg, setChatMsg, send }) => (
  <div className="fade-in">
    <PageHeader title="💬 Communications" subtitle="Chat with drivers and send broadcasts" />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, height: 520 }}>
        <div style={{ background: "var(--black-2)", borderRadius: 16, border: "1px solid var(--white-border)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--white-border)", fontWeight: 700, fontSize: 14 }}>Drivers</div>
          {DRIVERS_DATA.map(d => (
            <div key={d.id} style={{ display: "flex", gap: 10, padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid var(--white-border)", alignItems: "center" }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{d.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name.split(" ")[0]}</div>
                <div style={{ fontSize: 11, color: d.status === "en_route" ? "var(--success)" : "var(--white-mute)" }}>● {d.status}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--white-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>A</div>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>Abdi Hassan</div><div style={{ fontSize: 11, color: "var(--success)" }}>● En Route</div></div>
            </div>
            <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>📢 Broadcast</button>
          </div>
          <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "admin" ? "flex-end" : "flex-start" }}>
                <div>
                  {m.from !== "admin" && <div style={{ fontSize: 11, color: "var(--white-mute)", marginBottom: 4 }}>{m.driver}</div>}
                  <div className={`chat-bubble ${m.from === "admin" ? "chat-mine" : "chat-other"}`}>{m.text}</div>
                  <div style={{ fontSize: 10, color: "var(--white-mute)", marginTop: 4, textAlign: m.from === "admin" ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--white-border)", display: "flex", gap: 10 }}>
            <input className="input-field" placeholder="Message driver..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1 }} />
            <button className="btn-primary" style={{ padding: "12px 16px" }} onClick={send}>➤</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminRoles = () => (
  <div className="fade-in">
    <PageHeader title="🔑 Roles & Access Control" actions={<button className="btn-primary">+ Add Role</button>} />
    <div className="page-body">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {[
          { role: "Admin", icon: "👑", color: "var(--orange)", perms: ["Full system access", "Manage drivers", "Manage vehicles", "View financials", "Role management", "Settings"] },
          { role: "Dispatcher", icon: "📡", color: "var(--info)", perms: ["Create trips", "Assign drivers", "Reassign trips", "View tracking", "View drivers"] },
          { role: "Accountant", icon: "💰", color: "var(--success)", perms: ["View payments", "Export reports", "View earnings", "Generate invoices"] },
        ].map(({ role, icon, color, perms }) => (
          <div key={role} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{role}</div>
                <div style={{ fontSize: 12, color: "var(--white-mute)" }}>{perms.length} permissions</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {perms.map(p => (
                <div key={p} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--white-dim)" }}>
                  <span style={{ color }}>✓</span>{p}
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: "100%", marginTop: 16, justifyContent: "center", fontSize: 13 }}>Edit Permissions</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="fade-in">
    <PageHeader title="⚙️ System Settings" />
    <div className="page-body">
      <div style={{ maxWidth: 600 }}>
        {[
          { title: "Company Information", fields: [["Company Name", "Rayan Coach Ltd"], ["Phone", "+254 745 129233"], ["Email", "info@rayan.co.ke"], ["Nairobi Office", "Second St, Nairobi CBD"], ["Mombasa Branch", "Moi Avenue, Mombasa"]] },
          { title: "Payment Settings", fields: [["M-Pesa Paybill", "247247"], ["Commission Rate", "30%"], ["Driver Pay Rate", "70%"]] },
          { title: "System", fields: [["System Name", "Rayan Coach Platform"], ["Version", "v2.4.1"], ["Environment", "Production"]] },
        ].map(({ title, fields }) => (
          <div key={title} className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>{title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {fields.map(([k, v]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, color: "var(--white-mute)", display: "block", marginBottom: 5 }}>{k}</label>
                  <input className="input-field" defaultValue={v} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="btn-primary">💾 Save Settings</button>
      </div>
    </div>
  </div>
);

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [auth, setAuth] = useState(null);

  const handleLogin = (role, user) => setAuth({ role, user });
  const handleLogout = () => setAuth(null);

  if (!auth) return <AuthPage onLogin={handleLogin} />;

  if (auth.role === "traveller") return <TravellerDashboard user={auth.user} onLogout={handleLogout} />;
  if (auth.role === "driver") return <DriverDashboard user={auth.user} onLogout={handleLogout} />;
  if (auth.role === "admin") return <AdminDashboard user={auth.user} onLogout={handleLogout} />;
}