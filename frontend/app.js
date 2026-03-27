<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rayan Coach | Kenya's Premium Transport</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/react-router-dom@6.8.0/dist/umd/react-router-dom.development.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --rc-black: #0A0A0F;
      --rc-deep: #11111A;
      --rc-card: #16161F;
      --rc-border: #2A2A3A;
      --rc-amber: #F59E0B;
      --rc-amber-light: #FCD34D;
      --rc-amber-dim: rgba(245,158,11,0.12);
      --rc-green: #10B981;
      --rc-red: #EF4444;
      --rc-blue: #3B82F6;
      --rc-text: #F1F1F5;
      --rc-muted: #8B8BA0;
      --rc-soft: #C4C4D4;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body { background: var(--rc-black); color: var(--rc-text); }
    .syne { font-family: 'Syne', 'Inter', system-ui, sans-serif; font-weight: 700; }
    .btn-amber {
      background: linear-gradient(135deg, #F59E0B, #D97706);
      color: #0A0A0F;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 12px 20px;
    }
    .btn-amber:hover {
      background: linear-gradient(135deg, #FCD34D, #F59E0B);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(245,158,11,0.3);
    }
    .btn-ghost {
      background: transparent;
      color: var(--rc-soft);
      border: 1px solid var(--rc-border);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 12px 20px;
    }
    .btn-ghost:hover { border-color: var(--rc-amber); color: var(--rc-amber); }
    .rc-input {
      background: var(--rc-deep);
      border: 1px solid var(--rc-border);
      border-radius: 10px;
      color: var(--rc-text);
      padding: 12px 16px;
      width: 100%;
      font-size: 14px;
      outline: none;
    }
    .rc-input:focus { border-color: var(--rc-amber); box-shadow: 0 0 0 3px var(--rc-amber-dim); }
    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      color: var(--rc-muted);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sidebar-link:hover { background: var(--rc-border); color: var(--rc-text); }
    .sidebar-link.active { background: var(--rc-amber-dim); color: var(--rc-amber); }
    .stat-card {
      background: var(--rc-card);
      border: 1px solid var(--rc-border);
      border-radius: 14px;
      padding: 20px;
      transition: all 0.25s;
    }
    .stat-card:hover { border-color: var(--rc-amber); }
    .role-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .role-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .chat-bubble { max-width: 70%; padding: 10px 14px; border-radius: 14px; font-size: 13px; margin: 4px 0; }
    .chat-out { background: var(--rc-amber-dim); color: var(--rc-amber); border-radius: 14px 14px 4px 14px; }
    .chat-in { background: var(--rc-card); color: var(--rc-soft); border-radius: 14px 14px 14px 4px; }
    .map-placeholder {
      background: var(--rc-deep);
      border-radius: 14px;
      position: relative;
      overflow: hidden;
      min-height: 320px;
    }
    .map-grid {
      position: absolute; inset: 0;
      background-image: linear-gradient(var(--rc-border) 1px, transparent 1px), linear-gradient(90deg, var(--rc-border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.4;
    }
    .bus-dot {
      position: absolute;
      width: 32px; height: 32px;
      background: var(--rc-amber);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.25);
      animation: pulse-amber 2s infinite;
      cursor: pointer;
      transform: translate(-50%, -50%);
    }
    @keyframes pulse-amber {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .loading-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--rc-amber);
      animation: dotPulse 1.4s ease-in-out infinite;
    }
    @keyframes dotPulse {
      0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    // ==================== REACT IMPORTS ====================
    const { useState, useEffect, useRef, createContext, useContext } = React;
    const { createRoot } = ReactDOM;
    const { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } = ReactRouterDOM;

    // ==================== GLOBAL STYLES COMPONENT ====================
    const GlobalStyles = () => null; // Styles already in head

    // ==================== ICON COMPONENT ====================
    const Icon = ({ name, size = 18, color = "currentColor" }) => {
      const icons = {
        user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        driver: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
        shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
        home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
        ticket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>,
        map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
        package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
        gift: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
        chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
        dollar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        bus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h5l2 4v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M5 9h6m-6 4h6"/></svg>,
        users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
        barChart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
        settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
        logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
        chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
        chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
        check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
        x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
        star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
        bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
        send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
        download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
        plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
        camera: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
        file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
        image: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
      };
      return icons[name] || null;
    };

    // ==================== LOGO COMPONENT ====================
    const Logo = ({ size = "md" }) => {
      const s = size === "sm" ? { badge: 28, text: 14 } : size === "lg" ? { badge: 48, text: 22 } : { badge: 36, text: 17 };
      return React.createElement('div', { style: { display: "flex", alignItems: "center", gap: 10 } },
        React.createElement('div', { style: { width: s.badge, height: s.badge, borderRadius: 8, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: s.text - 3, color: "#0A0A0F" } }, "Rc"),
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: s.text, color: "#F1F1F5" } }, "RAYAN COACH"),
          size !== "sm" && React.createElement('div', { style: { fontSize: 9, color: "#F59E0B", fontWeight: 500 } }, "KENYA'S PREMIUM TRANSPORT")
        )
      );
    };

    // ==================== TOAST COMPONENT ====================
    const Toast = ({ msg, type = "success", onClose }) => {
      useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
      const colors = { success: "#10B981", error: "#EF4444", info: "#F59E0B" };
      return React.createElement('div', { style: { position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#16161F", border: `1px solid ${colors[type]}`, borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 } },
        React.createElement('div', { style: { width: 8, height: 8, borderRadius: "50%", background: colors[type] } }),
        React.createElement('span', { style: { fontSize: 13, color: "#C4C4D4", flex: 1 } }, msg),
        React.createElement('button', { onClick: onClose, style: { background: "none", border: "none", cursor: "pointer", color: "#8B8BA0" } }, "✕")
      );
    };

    // ==================== LOADING SCREEN ====================
    const LoadingScreen = () => React.createElement('div', { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, background: "#0A0A0F" } },
      React.createElement('div', { className: "float" }, React.createElement(Logo, { size: "lg" })),
      React.createElement('div', { style: { display: "flex", gap: 8 } }, [0, 1, 2].map(i => React.createElement('div', { key: i, className: "loading-dot", style: { animationDelay: `${i * 0.2}s` } }))),
      React.createElement('p', { style: { color: "#8B8BA0", fontSize: 13 } }, "Loading your experience...")
    );

    // ==================== WELCOME PAGE ====================
    const WelcomePage = ({ navigate }) => {
      const roles = [
        { id: 'user', icon: 'user', title: 'Traveller', description: 'Book trips, track buses & send parcels', path: '/user/login', color: '#3B82F6' },
        { id: 'driver', icon: 'driver', title: 'Driver', description: 'Manage trips, track earnings & navigate', path: '/driver/login', color: '#10B981' },
        { id: 'admin', icon: 'shield', title: 'Admin', description: 'Control fleet, drivers & analytics', path: '/admin/login', color: '#F59E0B' }
      ];

      return React.createElement('div', { className: "min-h-screen bg-black" },
        React.createElement('div', { className: "relative overflow-hidden py-20 px-4" },
          React.createElement('div', { className: "absolute inset-0 bg-gradient-to-r from-orange-600/20 to-black/40" }),
          React.createElement('div', { className: "relative max-w-6xl mx-auto text-center" },
            React.createElement('div', { className: "flex justify-center mb-6" },
              React.createElement('div', { className: "w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-3xl font-bold" }, "RC")
            ),
            React.createElement('h1', { className: "text-5xl md:text-6xl font-extrabold mb-4 syne" }, "Welcome to Rayan Coach"),
            React.createElement('p', { className: "text-xl text-gray-400" }, "Comfortable, Safe & Reliable Travel Across Kenya")
          )
        ),
        React.createElement('div', { className: "max-w-6xl mx-auto py-16 px-4" },
          React.createElement('div', { className: "grid md:grid-cols-3 gap-8" },
            roles.map(role => 
              React.createElement('div', { key: role.id, className: "role-card rounded-2xl p-8 text-center", style: { background: '#16161F', border: '1px solid #2A2A3A' }, onClick: () => navigate(role.path) },
                React.createElement('div', { className: "w-20 h-20 mx-auto mb-4 bg-opacity-20 rounded-full flex items-center justify-center", style: { background: `${role.color}20` } },
                  React.createElement(Icon, { name: role.icon, size: 36, color: role.color })
                ),
                React.createElement('h3', { className: "text-2xl font-bold mb-3 syne" }, role.title),
                React.createElement('p', { className: "text-gray-400 mb-6", style: { color: '#8B8BA0' } }, role.description),
                React.createElement('button', { className: "btn-amber w-full" }, "Sign In →")
              )
            )
          )
        ),
        React.createElement('div', { className: "text-center py-8 px-4 border-t", style: { borderColor: '#2A2A3A' } },
          React.createElement('div', { className: "max-w-6xl mx-auto grid md:grid-cols-3 gap-6" },
            React.createElement('div', {}, "📍 Second St, Nairobi, Kenya"),
            React.createElement('div', {}, "📞 +254 745 129233"),
            React.createElement('div', {}, "✉️ info@rayan.co.ke")
          )
        )
      );
    };

    // ==================== LOGIN PAGE ====================
    const LoginPage = ({ role, onLogin }) => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isSignup, setIsSignup] = useState(false);
      const [name, setName] = useState('');
      const [phone, setPhone] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
      const navigate = useNavigate();

      const configs = {
        user: { title: 'Traveller Login', icon: 'user', color: '#3B82F6' },
        driver: { title: 'Driver Login', icon: 'driver', color: '#10B981' },
        admin: { title: 'Admin Login', icon: 'shield', color: '#F59E0B' }
      };
      const cfg = configs[role];

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        let result;
        if (isSignup && role !== 'admin') {
          result = await onLogin.register(name, email, phone, password);
        } else {
          result = await onLogin.login(email, password, role);
        }
        if (result.success) {
          navigate(`/${role}/dashboard`);
        } else {
          setError(result.error || 'Login failed');
        }
        setLoading(false);
      };

      return React.createElement('div', { className: "min-h-screen flex items-center justify-center bg-black" },
        React.createElement('div', { className: "rounded-2xl p-8 w-full max-w-md", style: { background: '#16161F', border: '1px solid #2A2A3A' } },
          React.createElement('div', { className: "text-center mb-6" },
            React.createElement('div', { className: "w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center", style: { background: `${cfg.color}20` } },
              React.createElement(Icon, { name: cfg.icon, size: 32, color: cfg.color })
            ),
            React.createElement('h2', { className: "text-2xl font-bold syne" }, isSignup ? `Create Account` : cfg.title),
            React.createElement('p', { className: "text-gray-400 mt-2", style: { color: '#8B8BA0' } }, isSignup ? "Join Rayan Coach today" : "Welcome back to Rayan Coach")
          ),
          React.createElement('form', { onSubmit: handleSubmit },
            isSignup && React.createElement('input', { type: "text", placeholder: "Full Name", className: "rc-input mb-4", value: name, onChange: e => setName(e.target.value), required: true }),
            React.createElement('input', { type: "email", placeholder: "Email Address", className: "rc-input mb-4", value: email, onChange: e => setEmail(e.target.value), required: true }),
            isSignup && React.createElement('input', { type: "tel", placeholder: "Phone Number (+254...)", className: "rc-input mb-4", value: phone, onChange: e => setPhone(e.target.value), required: true }),
            React.createElement('input', { type: "password", placeholder: "Password", className: "rc-input mb-4", value: password, onChange: e => setPassword(e.target.value), required: true }),
            error && React.createElement('p', { className: "text-red-500 text-sm mb-4" }, error),
            React.createElement('button', { type: "submit", className: "btn-amber w-full", disabled: loading }, loading ? "Processing..." : (isSignup ? "Create Account →" : "Sign In →"))
          ),
          role !== 'admin' && React.createElement('div', { className: "text-center mt-4" },
            React.createElement('button', { onClick: () => setIsSignup(!isSignup), className: "text-orange-500 text-sm" }, isSignup ? "Already have an account? Sign In" : "New user? Create an account")
          ),
          React.createElement('button', { onClick: () => navigate('/'), className: "text-center text-sm mt-4 w-full", style: { color: '#F59E0B' } }, "← Back to Role Selection")
        )
      );
    };

    // ==================== AUTH CONTEXT ====================
    const AuthContext = createContext(null);

    const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const stored = localStorage.getItem('rayan_user');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch(e) { localStorage.removeItem('rayan_user'); }
        }
        setLoading(false);
      }, []);

      const login = (email, password, role) => {
        const mockUser = {
          id: Math.random().toString(36),
          name: role === 'user' ? 'Jane Doe' : role === 'driver' ? 'John Mwangi' : 'Admin User',
          email,
          role,
          rewardPoints: role === 'user' ? 1240 : 0
        };
        setUser(mockUser);
        localStorage.setItem('rayan_user', JSON.stringify(mockUser));
        return { success: true, data: mockUser };
      };

      const register = (name, email, phone, password) => {
        const mockUser = {
          id: Math.random().toString(36),
          name,
          email,
          phone,
          role: 'user',
          rewardPoints: 0
        };
        setUser(mockUser);
        localStorage.setItem('rayan_user', JSON.stringify(mockUser));
        return { success: true, data: mockUser };
      };

      const logout = () => {
        localStorage.removeItem('rayan_user');
        setUser(null);
      };

      return React.createElement(AuthContext.Provider, { value: { user, login, register, logout, loading } }, children);
    };

    // ==================== PROTECTED ROUTE ====================
    const ProtectedRoute = ({ children, allowedRoles }) => {
      const { user, loading } = useContext(AuthContext);
      if (loading) return React.createElement('div', { className: "flex items-center justify-center h-screen" }, "Loading...");
      if (!user) return React.createElement(Navigate, { to: "/", replace: true });
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return React.createElement(Navigate, { to: `/${user.role}/dashboard`, replace: true });
      }
      return children;
    };

    // ==================== DASHBOARD SHELL ====================
    const DashboardShell = ({ role, user, onLogout, children, activeTab, setActiveTab, tabs }) => {
      const [sidebarOpen, setSidebarOpen] = useState(true);
      const roleColors = { user: '#3B82F6', driver: '#10B981', admin: '#F59E0B' };
      
      return React.createElement('div', { className: "flex min-h-screen bg-black" },
        React.createElement('div', { style: { width: sidebarOpen ? 240 : 60, background: '#11111A', borderRight: '1px solid #2A2A3A', transition: 'width 0.3s ease' } },
          React.createElement('div', { className: "p-4 flex justify-between items-center" },
            sidebarOpen ? 
              React.createElement('div', { className: "flex items-center gap-2" },
                React.createElement('div', { className: "w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold" }, "RC"),
                React.createElement('span', { className: "font-bold syne" }, "Rayan Coach")
              ) : 
              React.createElement('div', { className: "w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold" }, "RC"),
            React.createElement('button', { onClick: () => setSidebarOpen(!sidebarOpen), className: "btn-ghost p-2" }, sidebarOpen ? "←" : "→")
          ),
          React.createElement('nav', { className: "p-2" },
            tabs.map(tab => 
              React.createElement('div', { key: tab.id, className: `sidebar-link ${activeTab === tab.id ? 'active' : ''}`, onClick: () => setActiveTab(tab.id) },
                React.createElement(Icon, { name: tab.icon, size: 16 }),
                sidebarOpen && React.createElement('span', null, tab.label)
              )
            ),
            React.createElement('div', { onClick: onLogout, className: "sidebar-link mt-4", style: { color: '#EF4444' } },
              React.createElement('span', null, "🚪"),
              sidebarOpen && React.createElement('span', null, "Logout")
            )
          )
        ),
        React.createElement('div', { className: "flex-1" },
          React.createElement('header', { className: "h-16 flex items-center justify-between px-6", style: { background: '#11111A', borderBottom: '1px solid #2A2A3A' } },
            React.createElement('div', null,
              React.createElement('span', { className: "font-bold syne" }, tabs.find(t => t.id === activeTab)?.label),
              React.createElement('span', { className: "text-sm ml-2", style: { color: '#8B8BA0' } }, `· ${role} Portal`)
            ),
            React.createElement('div', { className: "flex items-center gap-3" },
              React.createElement('div', { className: "flex items-center gap-2 px-3 py-2 rounded-lg", style: { background: '#16161F', border: '1px solid #2A2A3A' } },
                React.createElement('div', { className: "w-8 h-8 rounded-full flex items-center justify-center text-black font-bold", style: { background: roleColors[role] } }, user?.charAt(0)?.toUpperCase() || 'U'),
                React.createElement('span', { className: "text-sm" }, user?.name || user?.email || 'User')
              )
            )
          ),
          React.createElement('main', { className: "p-6" }, children)
        )
      );
    };

    // ==================== USER DASHBOARD ====================
    const UserDashboard = ({ showToast }) => {
      const { user } = useContext(AuthContext);
      return React.createElement('div', null,
        React.createElement('div', { className: "p-6 rounded-2xl mb-8", style: { background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.2)' } },
          React.createElement('h2', { className: "text-2xl font-bold syne" }, `Good morning, ${user?.name || 'Traveller'}! 👋`),
          React.createElement('p', { className: "text-gray-400 mt-2", style: { color: '#8B8BA0' } }, "You have 2 upcoming trips this week")
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" },
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-3xl mb-2" }, "🚌"), React.createElement('div', { className: "text-2xl font-bold syne" }, "2"), React.createElement('div', { className: "text-sm", style: { color: '#8B8BA0' } }, "Upcoming Trips")),
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-3xl mb-2" }, "⭐"), React.createElement('div', { className: "text-2xl font-bold syne" }, user?.rewardPoints || 0), React.createElement('div', { className: "text-sm", style: { color: '#8B8BA0' } }, "Reward Points")),
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-3xl mb-2" }, "📦"), React.createElement('div', { className: "text-2xl font-bold syne" }, "0"), React.createElement('div', { className: "text-sm", style: { color: '#8B8BA0' } }, "Active Parcels"))
        ),
        React.createElement('div', { className: "stat-card" },
          React.createElement('h3', { className: "font-bold mb-4 syne" }, "Recent Bookings"),
          React.createElement('div', { className: "border-b py-3 flex justify-between", style: { borderColor: '#2A2A3A' } },
            React.createElement('div', null, React.createElement('p', { className: "font-semibold" }, "Nairobi → Mombasa"), React.createElement('p', { className: "text-sm", style: { color: '#8B8BA0' } }, "May 20, 2025 at 07:30")),
            React.createElement('span', { className: "badge badge-green" }, "Confirmed")
          )
        )
      );
    };

    // ==================== BOOKING PAGE ====================
    const BookingPage = ({ showToast }) => {
      const [from, setFrom] = useState('Nairobi');
      const [to, setTo] = useState('Mombasa');
      const [date, setDate] = useState('');
      return React.createElement('div', { className: "max-w-2xl mx-auto" },
        React.createElement('div', { className: "stat-card" },
          React.createElement('h3', { className: "text-xl font-bold mb-6 syne" }, "Book a Trip"),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" },
            React.createElement('select', { className: "rc-input", value: from, onChange: e => setFrom(e.target.value) }, ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'].map(c => React.createElement('option', { key: c }, c))),
            React.createElement('select', { className: "rc-input", value: to, onChange: e => setTo(e.target.value) }, ['Mombasa', 'Nairobi', 'Kisumu', 'Eldoret', 'Nakuru'].map(c => React.createElement('option', { key: c }, c))),
            React.createElement('input', { type: "date", className: "rc-input", value: date, onChange: e => setDate(e.target.value) })
          ),
          React.createElement('button', { className: "btn-amber w-full", onClick: () => showToast("Searching for trips...", "info") }, "Search Trips →")
        )
      );
    };

    // ==================== TRACKING PAGE ====================
    const TrackingPage = () => {
      return React.createElement('div', { className: "map-placeholder", style: { height: 400, position: 'relative' } },
        React.createElement('div', { className: "map-grid" }),
        React.createElement('div', { className: "bus-dot", style: { top: "40%", left: "68%" } }, "🚌"),
        React.createElement('div', { style: { position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '4px 10px', fontSize: 11 } }, "📍 Current Location: Thika Road, Nairobi")
      );
    };

    // ==================== PARCEL PAGE ====================
    const ParcelPage = ({ showToast }) => {
      const [submitted, setSubmitted] = useState(false);
      if (submitted) {
        return React.createElement('div', { className: "stat-card text-center" },
          React.createElement('div', { className: "text-5xl mb-4" }, "📦"),
          React.createElement('h3', { className: "text-xl font-bold mb-2 syne" }, "Parcel Booked!"),
          React.createElement('p', { className: "text-gray-400 mb-4" }, "Tracking ID: RC-P-20250328-4821"),
          React.createElement('button', { className: "btn-amber", onClick: () => setSubmitted(false) }, "Send Another")
        );
      }
      return React.createElement('div', { className: "max-w-2xl mx-auto" },
        React.createElement('div', { className: "stat-card" },
          React.createElement('h3', { className: "text-xl font-bold mb-6 syne" }, "Send a Parcel"),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" },
            React.createElement('input', { className: "rc-input", placeholder: "Sender Name" }),
            React.createElement('input', { className: "rc-input", placeholder: "Sender Phone" }),
            React.createElement('input', { className: "rc-input", placeholder: "Receiver Name" }),
            React.createElement('input', { className: "rc-input", placeholder: "Receiver Phone" })
          ),
          React.createElement('button', { className: "btn-amber w-full", onClick: () => setSubmitted(true) }, "Confirm Booking →")
        )
      );
    };

    // ==================== USER CHAT ====================
    const UserChat = ({ showToast }) => {
      const [messages, setMessages] = useState([
        { from: "admin", text: "Welcome to Rayan Coach support! How can I help you?", time: "10:30" }
      ]);
      const [input, setInput] = useState("");
      const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { from: "user", text: input, time: new Date().toLocaleTimeString() }]);
        setInput("");
        showToast("Message sent", "success");
      };
      return React.createElement('div', { className: "stat-card", style: { height: '500px', display: 'flex', flexDirection: 'column' } },
        React.createElement('div', { className: "flex-1 overflow-y-auto mb-4" },
          messages.map((m, i) => React.createElement('div', { key: i, className: `flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} mb-3` },
            React.createElement('div', { className: `max-w-[70%] p-3 rounded-xl ${m.from === 'user' ? 'chat-out' : 'chat-in'}` },
              React.createElement('p', { className: "text-sm" }, m.text),
              React.createElement('span', { className: "text-xs opacity-70 block mt-1" }, m.time)
            )
          ))
        ),
        React.createElement('div', { className: "flex gap-2" },
          React.createElement('input', { className: "rc-input flex-1", placeholder: "Type your message...", value: input, onChange: e => setInput(e.target.value), onKeyPress: e => e.key === 'Enter' && sendMessage() }),
          React.createElement('button', { className: "btn-amber", onClick: sendMessage }, "Send")
        )
      );
    };

    // ==================== REWARDS PAGE ====================
    const RewardsPage = ({ showToast }) => {
      return React.createElement('div', { className: "stat-card text-center" },
        React.createElement('div', { className: "text-5xl mb-4" }, "⭐"),
        React.createElement('div', { className: "text-3xl font-bold syne" }, "1,240"),
        React.createElement('p', null, "Reward Points"),
        React.createElement('button', { className: "btn-amber mt-4", onClick: () => showToast("Rewards redeemed!", "success") }, "Redeem")
      );
    };

    // ==================== DRIVER DASHBOARD ====================
    const DriverDashboard = ({ showToast }) => {
      return React.createElement('div', null,
        React.createElement('div', { className: "p-6 rounded-2xl mb-8", style: { background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)' } },
          React.createElement('div', { className: "flex items-center gap-4" },
            React.createElement('div', { className: "w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-3xl" }, "👨‍✈️"),
            React.createElement('div', null,
              React.createElement('h2', { className: "text-2xl font-bold syne" }, "James Mwangi"),
              React.createElement('p', { className: "text-gray-400", style: { color: '#8B8BA0' } }, "PSV-KE-2024-00821 · 5 years experience")
            ),
            React.createElement('div', { className: "ml-auto text-right" },
              React.createElement('div', { className: "text-2xl font-bold text-green-500" }, "KES 4,200"),
              React.createElement('p', { className: "text-sm text-gray-400" }, "Today's earnings")
            )
          )
        ),
        React.createElement('div', { className: "stat-card" },
          React.createElement('h3', { className: "font-bold mb-4 syne" }, "Active Trip"),
          React.createElement('div', { className: "bg-gray-800 rounded-xl p-4 mb-4", style: { background: '#11111A' } },
            React.createElement('div', { className: "flex justify-between mb-2" }, React.createElement('span', null, "Route"), React.createElement('span', { className: "font-semibold" }, "Nairobi → Mombasa")),
            React.createElement('div', { className: "flex justify-between mb-2" }, React.createElement('span', null, "Departure"), React.createElement('span', { className: "font-semibold" }, "07:00 AM")),
            React.createElement('div', { className: "flex justify-between" }, React.createElement('span', null, "Passengers"), React.createElement('span', { className: "font-semibold" }, "38/45"))
          ),
          React.createElement('button', { className: "btn-amber w-full", onClick: () => showToast("Trip started!", "success") }, "Start Trip →")
        )
      );
    };

    // ==================== DRIVER EARNINGS ====================
    const DriverEarnings = ({ showToast }) => {
      return React.createElement('div', { className: "stat-card" },
        React.createElement('h3', null, "Earnings"),
        React.createElement('div', { className: "text-2xl font-bold text-green-500" }, "KES 48,700"),
        React.createElement('p', null, "This Month"),
        React.createElement('button', { className: "btn-amber mt-4", onClick: () => showToast("View details", "info") }, "View Details")
      );
    };

    // ==================== DRIVER CHAT ====================
    const DriverChat = ({ showToast }) => {
      const [messages, setMessages] = useState([
        { from: "admin", text: "James, confirm you have reached Mombasa checkpoint.", time: "09:14" },
        { from: "me", text: "Yes, checkpoint cleared.", time: "09:17" }
      ]);
      const [input, setInput] = useState("");
      const send = () => {
        if (!input.trim()) return;
        setMessages([...messages, { from: "me", text: input, time: new Date().toLocaleTimeString() }]);
        setInput("");
        showToast("Message sent", "success");
      };
      return React.createElement('div', { className: "stat-card", style: { height: '400px', display: 'flex', flexDirection: 'column' } },
        React.createElement('div', { className: "flex-1 overflow-y-auto mb-4" },
          messages.map((m, i) => React.createElement('div', { key: i, className: `flex ${m.from === 'me' ? 'justify-end' : 'justify-start'} mb-3` },
            React.createElement('div', { className: `max-w-[70%] p-3 rounded-xl ${m.from === 'me' ? 'chat-out' : 'chat-in'}` },
              React.createElement('p', { className: "text-sm" }, m.text),
              React.createElement('span', { className: "text-xs opacity-70" }, m.time)
            )
          ))
        ),
        React.createElement('div', { className: "flex gap-2" },
          React.createElement('input', { className: "rc-input flex-1", placeholder: "Type message...", value: input, onChange: e => setInput(e.target.value), onKeyPress: e => e.key === 'Enter' && send() }),
          React.createElement('button', { className: "btn-amber", onClick: send }, "Send")
        )
      );
    };

    // ==================== ADMIN DASHBOARD ====================
    const AdminDashboard = ({ showToast }) => {
      return React.createElement('div', null,
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" },
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-2xl font-bold syne" }, "14"), React.createElement('div', { className: "text-sm text-gray-400" }, "Active Trips")),
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-2xl font-bold syne" }, "KES 84K"), React.createElement('div', { className: "text-sm text-gray-400" }, "Today's Revenue")),
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-2xl font-bold syne" }, "31"), React.createElement('div', { className: "text-sm text-gray-400" }, "Active Drivers")),
          React.createElement('div', { className: "stat-card" }, React.createElement('div', { className: "text-2xl font-bold syne" }, "3"), React.createElement('div', { className: "text-sm text-gray-400" }, "Alerts"))
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
          React.createElement('div', { className: "stat-card" },
            React.createElement('h3', { className: "font-bold mb-4 syne" }, "Recent Trips"),
            React.createElement('div', { className: "border-b py-2 flex justify-between", style: { borderColor: '#2A2A3A' } }, React.createElement('span', null, "Nairobi → Mombasa"), React.createElement('span', { className: "badge badge-green" }, "En Route")),
            React.createElement('div', { className: "border-b py-2 flex justify-between", style: { borderColor: '#2A2A3A' } }, React.createElement('span', null, "Mombasa → Nairobi"), React.createElement('span', { className: "badge badge-blue" }, "Scheduled"))
          ),
          React.createElement('div', { className: "stat-card" },
            React.createElement('h3', { className: "font-bold mb-4 syne" }, "Driver Status"),
            React.createElement('div', { className: "border-b py-2 flex justify-between", style: { borderColor: '#2A2A3A' } }, React.createElement('span', null, "James Mwangi"), React.createElement('span', { className: "badge badge-green" }, "Available")),
            React.createElement('div', { className: "border-b py-2 flex justify-between", style: { borderColor: '#2A2A3A' } }, React.createElement('span', null, "Peter Otieno"), React.createElement('span', { className: "badge badge-amber" }, "Busy"))
          )
        )
      );
    };

    // ==================== ADMIN DRIVERS ====================
    const AdminDrivers = ({ showToast }) => {
      const drivers = [
        { name: "James Mwangi", id: "DRV-001", status: "active", rating: 4.9, trips: 284, vehicle: "RC-001" },
        { name: "Peter Otieno", id: "DRV-002", status: "active", rating: 4.7, trips: 192, vehicle: "RC-003" },
        { name: "Sarah Wanjiku", id: "DRV-003", status: "off-duty", rating: 4.8, trips: 156, vehicle: "—" }
      ];
      return React.createElement('div', { className: "stat-card" },
        React.createElement('div', { className: "overflow-x-auto" },
          React.createElement('table', { className: "w-full" },
            React.createElement('thead', null,
              React.createElement('tr', { className: "border-b", style: { borderColor: '#2A2A3A' } },
                React.createElement('th', { className: "text-left py-3" }, "Driver"),
                React.createElement('th', { className: "text-left py-3" }, "ID"),
                React.createElement('th', { className: "text-left py-3" }, "Status"),
                React.createElement('th', { className: "text-left py-3" }, "Rating"),
                React.createElement('th', { className: "text-left py-3" }, "Trips"),
                React.createElement('th', { className: "text-left py-3" }, "Actions")
              )
            ),
            React.createElement('tbody', null,
              drivers.map(d => 
                React.createElement('tr', { key: d.id, className: "border-b", style: { borderColor: '#2A2A3A' } },
                  React.createElement('td', { className: "py-3" }, d.name),
                  React.createElement('td', { className: "py-3" }, d.id),
                  React.createElement('td', { className: "py-3" }, React.createElement('span', { className: `badge ${d.status === 'active' ? 'badge-green' : 'badge-amber'}` }, d.status)),
                  React.createElement('td', { className: "py-3" }, `${d.rating}★`),
                  React.createElement('td', { className: "py-3" }, d.trips),
                  React.createElement('td', { className: "py-3" }, React.createElement('button', { className: "btn-ghost text-sm px-3 py-1", onClick: () => showToast(`Editing ${d.name}`, "info") }, "Edit"))
                )
              )
            )
          )
        ),
        React.createElement('button', { className: "btn-amber mt-4", onClick: () => showToast("Add driver form opened", "info") }, "+ Add Driver")
      );
    };

    // ==================== ADMIN VEHICLES ====================
    const AdminVehicles = ({ showToast }) => {
      const vehicles = [
        { id: "RC-001", plate: "KAA 123B", type: "VIP Coach", capacity: 45, status: "active", driver: "James Mwangi" },
        { id: "RC-003", plate: "KBA 456C", type: "Standard", capacity: 48, status: "active", driver: "Peter Otieno" }
      ];
      return React.createElement('div', { className: "stat-card" },
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
          vehicles.map(v => 
            React.createElement('div', { key: v.id, className: "p-4 rounded-xl", style: { background: '#11111A', border: '1px solid #2A2A3A' } },
              React.createElement('div', { className: "flex justify-between mb-2" },
                React.createElement('span', { className: "font-bold syne" }, v.id),
                React.createElement('span', { className: `badge ${v.status === 'active' ? 'badge-green' : 'badge-amber'}` }, v.status)
              ),
              React.createElement('p', { className: "text-sm" }, v.plate),
              React.createElement('p', { className: "text-sm text-gray-400" }, v.type),
              React.createElement('p', { className: "text-sm" }, `Driver: ${v.driver}`)
            )
          )
        ),
        React.createElement('button', { className: "btn-amber mt-4 w-full", onClick: () => showToast("Add vehicle form opened", "info") }, "+ Add Vehicle")
      );
    };

    // ==================== ADMIN REPORTS ====================
    const AdminReports = ({ showToast }) => {
      return React.createElement('div', { className: "stat-card" },
        React.createElement('h3', null, "Reports"),
        React.createElement('button', { className: "btn-amber mt-4", onClick: () => showToast("Downloading report...", "info") }, "Download Report")
      );
    };

    // ==================== ADMIN LIVE TRACKING ====================
    const AdminLiveTracking = () => {
      return React.createElement('div', { className: "map-placeholder", style: { height: 400 } },
        React.createElement('div', { className: "map-grid" }),
        React.createElement('div', { className: "bus-dot", style: { top: "30%", left: "45%" } }, "🚌"),
        React.createElement('div', { className: "bus-dot", style: { top: "60%", left: "70%", background: "#10B981" } }, "🚌")
      );
    };

    // ==================== ADMIN PAYMENTS ====================
    const AdminPayments = ({ showToast }) => {
      return React.createElement('div', { className: "stat-card" },
        React.createElement('h3', null, "Payments"),
        React.createElement('button', { className: "btn-amber mt-4", onClick: () => showToast("Processing payouts...", "info") }, "Process Payouts")
      );
    };

    // ==================== ADMIN SETTINGS ====================
    const AdminSettings = ({ showToast }) => {
      return React.createElement('div', { className: "stat-card" },
        React.createElement('h3', null, "Settings"),
        React.createElement('button', { className: "btn-amber mt-4", onClick: () => showToast("Settings saved", "success") }, "Save Changes")
      );
    };

    // ==================== MAIN APP ====================
    const App = () => {
      const [userTab, setUserTab] = useState('dashboard');
      const [driverTab, setDriverTab] = useState('dashboard');
      const [adminTab, setAdminTab] = useState('dashboard');
      const [toast, setToast] = useState(null);
      const { user, login, register, logout } = useContext(AuthContext);
      const navigate = useNavigate();

      const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
      };

      const userTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'booking', label: 'Book Trip', icon: 'ticket' },
        { id: 'tracking', label: 'Tracking', icon: 'map' },
        { id: 'parcel', label: 'Parcel', icon: 'package' },
        { id: 'rewards', label: 'Rewards', icon: 'gift' },
        { id: 'chat', label: 'Support Chat', icon: 'chat' }
      ];

      const driverTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'trips', label: 'Trips', icon: 'bus' },
        { id: 'earnings', label: 'Earnings', icon: 'dollar' },
        { id: 'chat', label: 'Chat Admin', icon: 'chat' }
      ];

      const adminTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'tracking', label: 'Live Tracking', icon: 'map' },
        { id: 'drivers', label: 'Drivers', icon: 'users' },
        { id: 'vehicles', label: 'Fleet', icon: 'bus' },
        { id: 'payments', label: 'Payments', icon: 'dollar' },
        { id: 'reports', label: 'Reports', icon: 'barChart' },
        { id: 'settings', label: 'Settings', icon: 'settings' }
      ];

      return React.createElement(AuthProvider, null,
        React.createElement(BrowserRouter, null,
          React.createElement(Routes, null,
            React.createElement(Route, { path: "/", element: React.createElement(WelcomePage, { navigate: (path) => navigate(path) }) }),
            React.createElement(Route, { path: "/user/login", element: React.createElement(LoginPage, { role: "user", onLogin: login }) }),
            React.createElement(Route, { path: "/driver/login", element: React.createElement(LoginPage, { role: "driver", onLogin: login }) }),
            React.createElement(Route, { path: "/admin/login", element: React.createElement(LoginPage, { role: "admin", onLogin: login }) }),
            
            React.createElement(Route, { path: "/user/dashboard", element: React.createElement(ProtectedRoute, { allowedRoles: ['user'] },
              React.createElement(DashboardShell, { role: "user", user: user, onLogout: logout, activeTab: userTab, setActiveTab: setUserTab, tabs: userTabs },
                userTab === 'dashboard' && React.createElement(UserDashboard, { showToast }),
                userTab === 'booking' && React.createElement(BookingPage, { showToast }),
                userTab === 'tracking' && React.createElement(TrackingPage, null),
                userTab === 'parcel' && React.createElement(ParcelPage, { showToast }),
                userTab === 'rewards' && React.createElement(RewardsPage, { showToast }),
                userTab === 'chat' && React.createElement(UserChat, { showToast })
              )
            ) }),
            
            React.createElement(Route, { path: "/driver/dashboard", element: React.createElement(ProtectedRoute, { allowedRoles: ['driver'] },
              React.createElement(DashboardShell, { role: "driver", user: user, onLogout: logout, activeTab: driverTab, setActiveTab: setDriverTab, tabs: driverTabs },
                driverTab === 'dashboard' && React.createElement(DriverDashboard, { showToast }),
                driverTab === 'trips' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', null, "Assigned Trips"), React.createElement('p', null, "Nairobi → Mombasa (07:00 AM)"), React.createElement('p', null, "Mombasa → Nairobi (14:00 PM)")),
                driverTab === 'earnings' && React.createElement(DriverEarnings, { showToast }),
                driverTab === 'chat' && React.createElement(DriverChat, { showToast })
              )
            ) }),
            
            React.createElement(Route, { path: "/admin/dashboard", element: React.createElement(ProtectedRoute, { allowedRoles: ['admin'] },
              React.createElement(DashboardShell, { role: "admin", user: user, onLogout: logout, activeTab: adminTab, setActiveTab: setAdminTab, tabs: adminTabs },
                adminTab === 'dashboard' && React.createElement(AdminDashboard, { showToast }),
                adminTab === 'tracking' && React.createElement(AdminLiveTracking, null),
                adminTab === 'drivers' && React.createElement(AdminDrivers, { showToast }),
                adminTab === 'vehicles' && React.createElement(AdminVehicles, { showToast }),
                adminTab === 'payments' && React.createElement(AdminPayments, { showToast }),
                adminTab === 'reports' && React.createElement(AdminReports, { showToast }),
                adminTab === 'settings' && React.createElement(AdminSettings, { showToast })
              )
            ) })
          )
        ),
        toast && React.createElement(Toast, { msg: toast.msg, type: toast.type, onClose: () => setToast(null) })
      );
    };

    // ==================== RENDER ====================
    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>