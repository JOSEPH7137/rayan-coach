import { useState, useEffect, useRef } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
      font-family: 'DM Sans', sans-serif;
    }

    html, body { background: var(--rc-black); color: var(--rc-text); min-height: 100vh; }

    .syne { font-family: 'Syne', sans-serif; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--rc-deep); }
    ::-webkit-scrollbar-thumb { background: var(--rc-border); border-radius: 2px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes pulse-amber {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); } to { transform: rotate(360deg); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes busMove {
      0%   { left: 10%; }
      100% { left: 85%; }
    }
    @keyframes dotPulse {
      0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
      40%          { transform: scale(1);   opacity: 1;   }
    }

    .fade-up  { animation: fadeUp  0.5s ease forwards; }
    .fade-in  { animation: fadeIn  0.3s ease forwards; }
    .float    { animation: float   3s ease-in-out infinite; }

    .skeleton {
      background: linear-gradient(90deg, var(--rc-card) 25%, var(--rc-border) 50%, var(--rc-card) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 6px;
    }

    /* Card hover */
    .hover-card {
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .hover-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      border-color: var(--rc-amber) !important;
    }

    /* Button styles */
    .btn-amber {
      background: linear-gradient(135deg, #F59E0B, #D97706);
      color: #0A0A0F;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Syne', sans-serif;
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
      font-family: 'DM Sans', sans-serif;
    }
    .btn-ghost:hover {
      border-color: var(--rc-amber);
      color: var(--rc-amber);
    }
    .btn-danger {
      background: rgba(239,68,68,0.15);
      color: var(--rc-red);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-danger:hover { background: rgba(239,68,68,0.25); }

    /* Input */
    .rc-input {
      background: var(--rc-deep);
      border: 1px solid var(--rc-border);
      border-radius: 10px;
      color: var(--rc-text);
      padding: 12px 16px;
      width: 100%;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
    }
    .rc-input:focus { border-color: var(--rc-amber); box-shadow: 0 0 0 3px var(--rc-amber-dim); }
    .rc-input::placeholder { color: var(--rc-muted); }

    /* Badge */
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .badge-green  { background: rgba(16,185,129,0.15); color: var(--rc-green); }
    .badge-amber  { background: var(--rc-amber-dim);    color: var(--rc-amber); }
    .badge-red    { background: rgba(239,68,68,0.15);   color: var(--rc-red); }
    .badge-blue   { background: rgba(59,130,246,0.15);  color: var(--rc-blue); }
    .badge-muted  { background: rgba(139,139,160,0.15); color: var(--rc-muted); }

    /* Sidebar */
    .sidebar-link {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 10px;
      color: var(--rc-muted); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s ease; text-decoration: none;
    }
    .sidebar-link:hover { background: var(--rc-border); color: var(--rc-text); }
    .sidebar-link.active { background: var(--rc-amber-dim); color: var(--rc-amber); }

    /* Stat card */
    .stat-card {
      background: var(--rc-card);
      border: 1px solid var(--rc-border);
      border-radius: 14px;
      padding: 20px;
      transition: all 0.25s;
    }
    .stat-card:hover { border-color: var(--rc-amber); }

    /* Seat map */
    .seat {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; cursor: pointer;
      transition: all 0.15s ease; border: 1.5px solid transparent;
    }
    .seat-free     { background: rgba(16,185,129,0.15); color: var(--rc-green); border-color: rgba(16,185,129,0.3); }
    .seat-free:hover { background: var(--rc-green); color: #fff; transform: scale(1.1); }
    .seat-taken    { background: rgba(239,68,68,0.15);   color: var(--rc-red);   border-color: rgba(239,68,68,0.3); cursor: not-allowed; }
    .seat-selected { background: var(--rc-amber); color: var(--rc-black); border-color: var(--rc-amber); animation: pulse-amber 1.5s infinite; }
    .seat-vip      { background: rgba(245,158,11,0.15); color: var(--rc-amber); border-color: var(--rc-amber-dim); }

    /* Tab */
    .tab-bar { display: flex; border-bottom: 1px solid var(--rc-border); gap: 4px; }
    .tab { padding: 10px 18px; cursor: pointer; font-size: 13px; font-weight: 500;
           color: var(--rc-muted); border-bottom: 2px solid transparent; transition: all 0.2s; }
    .tab.active { color: var(--rc-amber); border-bottom-color: var(--rc-amber); }
    .tab:hover:not(.active) { color: var(--rc-soft); }

    /* Map placeholder */
    .map-placeholder {
      background: var(--rc-deep);
      border-radius: 14px;
      position: relative;
      overflow: hidden;
    }
    .map-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(var(--rc-border) 1px, transparent 1px),
        linear-gradient(90deg, var(--rc-border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.4;
    }
    .map-road-h {
      position: absolute; height: 3px;
      background: rgba(245,158,11,0.3);
    }
    .map-road-v {
      position: absolute; width: 3px;
      background: rgba(245,158,11,0.2);
    }
    .bus-dot {
      position: absolute;
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--rc-amber);
      display: flex; align-items: center; justify-content: center;
      font-size: 10px;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.25), 0 0 0 8px rgba(245,158,11,0.1);
      animation: pulse-amber 2s infinite;
      cursor: pointer;
    }

    /* Chat bubble */
    .chat-bubble { max-width: 70%; padding: 10px 14px; border-radius: 14px; font-size: 13px; margin: 4px 0; }
    .chat-out { background: var(--rc-amber-dim); color: var(--rc-amber); border-radius: 14px 14px 4px 14px; }
    .chat-in  { background: var(--rc-card); color: var(--rc-soft); border-radius: 14px 14px 14px 4px; }

    /* Loading dots */
    .loading-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--rc-amber);
      animation: dotPulse 1.4s ease-in-out infinite;
    }

    /* Progress bar */
    .progress-bar { height: 6px; background: var(--rc-border); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--rc-amber), #FCD34D); border-radius: 3px; transition: width 0.6s ease; }

    /* Toggle */
    .toggle { position: relative; width: 44px; height: 24px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-track {
      position: absolute; inset: 0; background: var(--rc-border);
      border-radius: 12px; transition: 0.3s;
    }
    .toggle input:checked + .toggle-track { background: var(--rc-amber); }
    .toggle-thumb {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; background: white;
      border-radius: 50%; transition: 0.3s;
    }
    .toggle input:checked ~ .toggle-thumb { transform: translateX(20px); }

    /* Notification dot */
    .notif-dot {
      position: absolute; top: -2px; right: -2px;
      width: 8px; height: 8px; background: var(--rc-red);
      border-radius: 50%; border: 2px solid var(--rc-deep);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    bus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h5l2 4v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M5 9h6m-6 4h6"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    driver: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    ticket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>,
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    trending: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    dollar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    clipboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    wifi: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    qr: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="7" y="7" width="3" height="3" fill={color}/><rect x="14" y="14" width="3" height="3" fill={color}/><path d="M14 17h3v3M17 17v3h3"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    gift: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
    tool: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    sos: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    camera: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    car: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2M9 17h6M9 3v7h6"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    barChart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    arrowUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    navigation: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  };
  return icons[name] || null;
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const Logo = ({ size = "md" }) => {
  const s = size === "sm" ? { badge: 28, text: 14, sub: 9 } : size === "lg" ? { badge: 48, text: 22, sub: 12 } : { badge: 36, text: 17, sub: 10 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: s.badge, height: s.badge, borderRadius: 8,
        background: "linear-gradient(135deg, #F59E0B, #D97706)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: s.sub + 2,
        color: "#0A0A0F", flexShrink: 0
      }}>Rc</div>
      <div>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: s.text, color: "#F1F1F5", lineHeight: 1.1 }}>RAYAN COACH</div>
        {size !== "sm" && <div style={{ fontSize: s.sub, color: "#F59E0B", fontWeight: 500, letterSpacing: "0.05em" }}>KENYA'S PREMIUM TRANSPORT</div>}
      </div>
    </div>
  );
};

// ─── MINI CHART ───────────────────────────────────────────────────────────────
const MiniChart = ({ data, color = "#F59E0B", height = 60 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200; const h = height;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 10) - 5
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`cg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#cg-${color.replace("#","")})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => i === pts.length - 1 ? <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color}/> : null)}
    </svg>
  );
};

// ─── BAR CHART ────────────────────────────────────────────────────────────────
const BarChart = ({ data, labels }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", height: (v / max) * 64 + 8,
            background: i === data.length - 1 ? "linear-gradient(180deg,#F59E0B,#D97706)" : "rgba(245,158,11,0.25)",
            borderRadius: "4px 4px 0 0", transition: "height 0.4s ease"
          }}/>
          <span style={{ fontSize: 9, color: "var(--rc-muted)" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const colors = { success: "var(--rc-green)", error: "var(--rc-red)", info: "var(--rc-amber)" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "var(--rc-card)", border: `1px solid ${colors[type]}`,
      borderRadius: 12, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
      animation: "fadeUp 0.3s ease",
      maxWidth: 320
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[type], flexShrink: 0 }}/>
      <span style={{ fontSize: 13, color: "var(--rc-soft)", flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rc-muted)", padding: 2 }}>
        <Icon name="x" size={14}/>
      </button>
    </div>
  );
};

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, background: "var(--rc-black)" }}>
    <div className="float"><Logo size="lg"/></div>
    <div style={{ display: "flex", gap: 8 }}>
      {[0,1,2].map(i => <div key={i} className="loading-dot" style={{ animationDelay: `${i*0.2}s` }}/>)}
    </div>
    <p style={{ color: "var(--rc-muted)", fontSize: 13 }}>Loading your experience...</p>
  </div>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, children, onClose, width = 480 }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: "var(--rc-card)", border: "1px solid var(--rc-border)",
      borderRadius: 18, width: "100%", maxWidth: width,
      animation: "fadeUp 0.25s ease", maxHeight: "90vh", overflow: "auto"
    }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rc-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 className="syne" style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} className="btn-ghost" style={{ padding: "6px 8px", fontSize: 12 }}><Icon name="x" size={16}/></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// PAGES
// ══════════════════════════════════════════════════════════════════════════════

// ─── WELCOME PAGE ─────────────────────────────────────────────────────────────
const WelcomePage = ({ navigate }) => {
  const routes = [
    { role: "USER", label: "Traveller", icon: "user", desc: "Book tickets, track buses & manage your travel", color: "#3B82F6", path: "/user/login" },
    { role: "DRIVER", label: "Driver", icon: "driver", desc: "Manage trips, track earnings & navigate routes", color: "#10B981", path: "/driver/login" },
    { role: "ADMIN", label: "Admin", icon: "shield", desc: "Control fleet, drivers, payments & analytics", color: "#F59E0B", path: "/admin/login" },
  ];
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--rc-black)", display: "flex", flexDirection: "column" }}>
      {/* Hero BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}/>
        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }}/>
      </div>

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(42,42,58,0.5)" }}>
        <Logo size="md"/>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }}>EN</button>
          <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }}>SW</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--rc-amber-dim)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "6px 14px", marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rc-amber)" }}/>
            <span style={{ fontSize: 12, color: "var(--rc-amber)", fontWeight: 600, letterSpacing: "0.06em" }}>KENYA'S #1 INTERCITY BUS PLATFORM</span>
          </div>
          <h1 className="syne" style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            Welcome to<br/>
            <span style={{ background: "linear-gradient(90deg, #F59E0B, #FCD34D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Rayan Coach</span>
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "var(--rc-muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Comfortable, Safe & Reliable Travel Across Kenya
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, width: "100%", maxWidth: 880 }}>
          {routes.map((r, i) => (
            <div
              key={r.role}
              className="hover-card"
              style={{
                background: hovered === i ? `linear-gradient(135deg, ${r.color}12, ${r.color}06)` : "var(--rc-card)",
                border: `1px solid ${hovered === i ? r.color : "var(--rc-border)"}`,
                borderRadius: 18, padding: 28,
                cursor: "pointer", animation: `fadeUp 0.5s ease ${i * 0.1}s both`
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(r.path)}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon name={r.icon} size={24} color={r.color}/>
              </div>
              <div className="syne" style={{ fontSize: 12, fontWeight: 700, color: r.color, letterSpacing: "0.08em", marginBottom: 6 }}>{r.role}</div>
              <h3 className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{r.label}</h3>
              <p style={{ fontSize: 13, color: "var(--rc-muted)", lineHeight: 1.6, marginBottom: 24 }}>{r.desc}</p>
              <button className="btn-amber" style={{ padding: "10px 20px", fontSize: 13, width: "100%", background: hovered === i ? `linear-gradient(135deg, ${r.color}, ${r.color}cc)` : undefined }}>
                Sign In →
              </button>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, marginTop: 64, flexWrap: "wrap", justifyContent: "center" }}>
          {[["50K+", "Happy Travellers"], ["120+", "Daily Routes"], ["98%", "On-time Rate"], ["24/7", "Support"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: "var(--rc-amber)" }}>{v}</div>
              <div style={{ fontSize: 12, color: "var(--rc-muted)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "16px 24px", borderTop: "1px solid var(--rc-border)", fontSize: 12, color: "var(--rc-muted)" }}>
        © 2025 Rayan Coach Kenya. All rights reserved. | Comfort. Safety. Reliability.
      </div>
    </div>
  );
};

// ─── AUTH PAGE (shared) ────────────────────────────────────────────────────────
const AuthPage = ({ role, navigate, onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const configs = {
    user: { color: "#3B82F6", icon: "user", label: "Traveller", dashboard: "/user/dashboard", canSignup: true },
    driver: { color: "#10B981", icon: "driver", label: "Driver", dashboard: "/driver/dashboard", canSignup: true },
    admin: { color: "#F59E0B", icon: "shield", label: "Admin", dashboard: "/admin/dashboard", canSignup: false },
  };
  const cfg = configs[role];

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(role, form.name || cfg.label + " User");
      navigate(cfg.dashboard);
    }, 1400);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--rc-black)" }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 40px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <button onClick={() => navigate("/")} className="btn-ghost" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Icon name="chevronLeft" size={14}/> Back
          </button>
          <Logo size="sm"/>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${cfg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Icon name={cfg.icon} size={24} color={cfg.color}/>
          </div>
          <h2 className="syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <p style={{ color: "var(--rc-muted)", fontSize: 14, marginBottom: 32 }}>
            {cfg.label} Portal · {mode === "login" ? "Welcome back" : "Join Rayan Coach"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 6, display: "block" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <input className="rc-input" placeholder="John Kamau" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={{ paddingLeft: 40 }}/>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--rc-muted)" }}><Icon name="user" size={16}/></div>
                </div>
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 6, display: "block" }}>Email / Phone</label>
              <div style={{ position: "relative" }}>
                <input className="rc-input" placeholder={role === "admin" ? "admin@rayancoach.co.ke" : "you@example.com or 0712345678"} value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} style={{ paddingLeft: 40 }}/>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--rc-muted)" }}><Icon name="mail" size={16}/></div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 6, display: "block" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="rc-input" type={showPw ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} style={{ paddingLeft: 40, paddingRight: 40 }}/>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--rc-muted)" }}><Icon name="lock" size={16}/></div>
                <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--rc-muted)" }}><Icon name="eye" size={16}/></button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 6, display: "block" }}>Phone (M-Pesa)</label>
                <div style={{ position: "relative" }}>
                  <input className="rc-input" placeholder="0712 345 678" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={{ paddingLeft: 40 }}/>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--rc-muted)" }}><Icon name="phone" size={16}/></div>
                </div>
              </div>
            )}

            <button className="btn-amber" style={{ padding: "13px 20px", fontSize: 14, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><div style={{ width: 16, height: 16, border: "2px solid #0A0A0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/> Authenticating...</> : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>

            {role !== "admin" && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span style={{ fontSize: 13, color: "var(--rc-muted)" }}>
                  {mode === "login" ? "No account? " : "Have an account? "}
                </span>
                <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, fontSize: 13, fontWeight: 600 }}>
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </div>
            )}

            {role === "admin" && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 12, fontSize: 12, color: "var(--rc-muted)", textAlign: "center" }}>
                🔒 Admin access is restricted. Contact your system administrator.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel – decorative */}
      <div className="hide-mobile" style={{ flex: 1, background: `linear-gradient(135deg, ${cfg.color}0A, var(--rc-deep))`, borderLeft: "1px solid var(--rc-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: 40 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🚌</div>
          <h3 className="syne" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Kenya's Premier Coach</h3>
          <p style={{ color: "var(--rc-muted)", lineHeight: 1.7 }}>Experience first-class intercity travel<br/>with real-time tracking & digital tickets</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 320 }}>
          {[["WiFi", "wifi", "#3B82F6"], ["Charging", "zap", "#F59E0B"], ["AC Seats", "star", "#10B981"], ["GPS Track", "map", "#F59E0B"]].map(([l, ic, c]) => (
            <div key={l} style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={ic} size={16} color={c}/><span style={{ fontSize: 12, fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD SHELL ──────────────────────────────────────────────────────────
const DashboardShell = ({ role, user, navigate, onLogout, children, activeTab, setActiveTab, tabs }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const roleColors = { user: "#3B82F6", driver: "#10B981", admin: "#F59E0B" };
  const color = roleColors[role];

  const notifs = [
    { text: "Trip KJK-001 departs in 2 hours", time: "10m ago", type: "info" },
    { text: "Payment of KES 850 confirmed", time: "1h ago", type: "success" },
    { text: "New message from Admin", time: "2h ago", type: "info" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--rc-black)" }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 240 : 60, flexShrink: 0,
        background: "var(--rc-deep)", borderRight: "1px solid var(--rc-border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s ease", overflow: "hidden", position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ padding: "16px 12px", borderBottom: "1px solid var(--rc-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {sidebarOpen ? <Logo size="sm"/> : <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#0A0A0F", fontFamily: "Syne,sans-serif" }}>Rc</div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost" style={{ padding: 6, display: "flex" }}>
            <Icon name={sidebarOpen ? "chevronLeft" : "chevronRight"} size={14}/>
          </button>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`sidebar-link ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
            >
              <Icon name={tab.icon} size={16} color={activeTab === tab.id ? "var(--rc-amber)" : "currentColor"}/>
              {sidebarOpen && <span>{tab.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--rc-border)" }}>
          <div className="sidebar-link" onClick={onLogout} style={{ justifyContent: sidebarOpen ? "flex-start" : "center", color: "var(--rc-red)" }}>
            <Icon name="logout" size={16} color="var(--rc-red)"/>
            {sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ background: "var(--rc-deep)", borderBottom: "1px solid var(--rc-border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <span className="syne" style={{ fontSize: 15, fontWeight: 700 }}>{tabs.find(t => t.id === activeTab)?.label}</span>
            <span style={{ fontSize: 12, color: "var(--rc-muted)", marginLeft: 8 }}>· {role.charAt(0).toUpperCase() + role.slice(1)} Portal</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notif */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="btn-ghost" style={{ padding: 8, display: "flex" }}>
                <Icon name="bell" size={18}/>
                <div className="notif-dot"/>
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300, background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.4)", animation: "fadeIn 0.2s ease", zIndex: 200 }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--rc-border)", display: "flex", justifyContent: "space-between" }}>
                    <span className="syne" style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                    <span className="badge badge-amber">3 new</span>
                  </div>
                  {notifs.map((n, i) => (
                    <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--rc-border)", display: "flex", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.type === "success" ? "var(--rc-green)" : "var(--rc-amber)", marginTop: 4, flexShrink: 0 }}/>
                      <div>
                        <p style={{ fontSize: 12 }}>{n.text}</p>
                        <p style={{ fontSize: 11, color: "var(--rc-muted)", marginTop: 2 }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color }}>
                {user?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// USER DASHBOARD TABS
// ══════════════════════════════════════════════════════════════════════════════

const UserDashboard = ({ showToast }) => {
  const upcoming = [
    { from: "Nairobi", to: "Mombasa", date: "28 Mar 2025", seat: "12A", bus: "RC Express 001", status: "confirmed" },
    { from: "Nairobi", to: "Kisumu", date: "02 Apr 2025", seat: "7B", bus: "RC VIP 003", status: "confirmed" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Greeting */}
      <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Good morning, Traveller! 👋</h2>
          <p style={{ color: "var(--rc-muted)", fontSize: 14 }}>You have 2 upcoming trips this week</p>
        </div>
        <button className="btn-amber" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => showToast("Opening booking flow...", "info")}>+ Book Now</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Trips", value: "24", icon: "bus", color: "#3B82F6", delta: "+3 this month" },
          { label: "Reward Points", value: "1,240", icon: "star", color: "#F59E0B", delta: "+80 pts" },
          { label: "Money Saved", value: "KES 720", icon: "dollar", color: "#10B981", delta: "via rewards" },
          { label: "Parcels Sent", value: "6", icon: "package", color: "#8B5CF6", delta: "2 in transit" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={18} color={s.color}/>
              </div>
            </div>
            <div className="syne" style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--rc-muted)", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 4 }}>↑ {s.delta}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div>
        <h3 className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Upcoming Trips</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map((t, i) => (
            <div key={i} style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="bus" size={20} color="#3B82F6"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>{t.from}</span>
                  <Icon name="chevronRight" size={14} color="var(--rc-muted)"/>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>{t.to}</span>
                  <span className="badge badge-green">{t.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--rc-muted)" }}>{t.date} · Seat {t.seat} · {t.bus}</div>
              </div>
              <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => showToast("Ticket opened!", "success")}>
                <Icon name="ticket" size={14}/> View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes */}
      <div>
        <h3 className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Popular Routes</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { from: "Nairobi", to: "Mombasa", price: "KES 1,200", duration: "7h", seats: 12 },
            { from: "Nairobi", to: "Kisumu", price: "KES 950", duration: "5h", seats: 8 },
            { from: "Nairobi", to: "Eldoret", price: "KES 750", duration: "4h", seats: 15 },
            { from: "Nairobi", to: "Nakuru", price: "KES 450", duration: "2h", seats: 20 },
          ].map((r, i) => (
            <div key={i} className="hover-card" style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 14, cursor: "pointer" }} onClick={() => showToast(`Booking ${r.from}→${r.to}`, "info")}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.from} → {r.to}</span>
                <span className="badge badge-amber">{r.price}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--rc-muted)" }}>{r.duration} · {r.seats} seats left</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${100 - (r.seats / 45 * 100)}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── BOOKING PAGE ──────────────────────────────────────────────────────────────
const BookingPage = ({ showToast }) => {
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState("one-way");
  const [from, setFrom] = useState("Nairobi");
  const [to, setTo] = useState("Mombasa");
  const [date, setDate] = useState("2025-03-28");
  const [busClass, setBusClass] = useState("standard");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [payMethod, setPayMethod] = useState("mpesa");
  const [processing, setProcessing] = useState(false);

  const cities = ["Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru", "Nyeri", "Thika", "Machakos"];

  // Seat layout: null=aisle, true=taken, false=free
  const seatRows = [
    ["1A","1B",null,"1C","1D"],
    ["2A","2B",null,"2C","2D"],
    ["3A","3B",null,"3C","3D"],
    ["4A","4B",null,"4C","4D"],
    ["5A","5B",null,"5C","5D"],
    ["6A","6B",null,"6C","6D"],
    ["7A","7B",null,"7C","7D"],
    ["8A","8B",null,"8C","8D"],
  ];
  const takenSeats = ["1A","2C","3B","4D","5A","6C","7B"];
  const vipSeats = ["1A","1B","1C","1D","2A","2B","2C","2D"];

  const fare = busClass === "vip" ? 1800 : 1200;
  const tax = Math.round(fare * 0.16);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(4);
      showToast("Payment confirmed! Ticket generated.", "success");
    }, 2500);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        {["Route & Date", "Select Seat", "Payment", "Confirmation"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < 3 ? 1 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: step > i + 1 ? "var(--rc-green)" : step === i + 1 ? "var(--rc-amber)" : "var(--rc-border)",
                color: step >= i + 1 ? "var(--rc-black)" : "var(--rc-muted)"
              }}>
                {step > i + 1 ? <Icon name="check" size={14} color="white"/> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: step === i + 1 ? "var(--rc-amber)" : "var(--rc-muted)", display: step !== i + 1 ? "none" : undefined }} className="hide-mobile">{s}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "var(--rc-green)" : "var(--rc-border)" }}/>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease" }}>
          <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 24 }}>
            <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Plan Your Journey</h3>

            {/* Trip type */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["one-way", "return"].map(t => (
                <button key={t} onClick={() => setTripType(t)} className={tripType === t ? "btn-amber" : "btn-ghost"} style={{ padding: "8px 18px", fontSize: 13, flex: 1 }}>
                  {t === "one-way" ? "One Way" : "Return"}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>FROM</label>
                <select className="rc-input" value={from} onChange={e => setFrom(e.target.value)} style={{ appearance: "none" }}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={() => { const t = from; setFrom(to); setTo(t); }} style={{ background: "var(--rc-amber-dim)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--rc-amber)" }}>
                <Icon name="refresh" size={14}/>
              </button>
              <div>
                <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>TO</label>
                <select className="rc-input" value={to} onChange={e => setTo(e.target.value)} style={{ appearance: "none" }}>
                  {cities.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>TRAVEL DATE</label>
                <input type="date" className="rc-input" value={date} onChange={e => setDate(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>CLASS</label>
                <select className="rc-input" value={busClass} onChange={e => setBusClass(e.target.value)} style={{ appearance: "none" }}>
                  <option value="standard">Standard – KES 1,200</option>
                  <option value="vip">VIP Premium – KES 1,800</option>
                </select>
              </div>
            </div>

            {/* AI suggestion */}
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ color: "var(--rc-amber)", marginTop: 2 }}>✨</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--rc-amber)", marginBottom: 2 }}>AI Recommendation</div>
                <div style={{ fontSize: 12, color: "var(--rc-muted)" }}>Best departure: <strong style={{ color: "var(--rc-soft)" }}>07:00 AM</strong> (lowest traffic). Off-peak savings: <strong style={{ color: "var(--rc-green)" }}>KES 120</strong></div>
              </div>
            </div>
          </div>

          {/* Available buses */}
          <div>
            <h3 className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Available Buses</h3>
            {[
              { name: "RC Express 001", depart: "07:00", arrive: "14:00", seats: 12, price: busClass === "vip" ? 1800 : 1200, amenities: ["wifi", "zap", "star"] },
              { name: "RC Comfort 002", depart: "09:30", arrive: "16:30", seats: 22, price: busClass === "vip" ? 1700 : 1100, amenities: ["wifi", "zap"] },
              { name: "RC VIP 003", depart: "14:00", arrive: "21:00", seats: 6, price: busClass === "vip" ? 2000 : 1300, amenities: ["wifi", "zap", "star", "camera"] },
            ].map((b, i) => (
              <div key={i} className="hover-card" style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }} onClick={() => setStep(2)}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  🚌
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</span>
                    {b.seats < 10 && <span className="badge badge-red">Only {b.seats} left</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 6 }}>{b.depart} → {b.arrive} · {from} → {to}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {b.amenities.map(a => <div key={a} style={{ color: "var(--rc-muted)" }}><Icon name={a} size={13}/></div>)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="syne" style={{ fontSize: 18, fontWeight: 800, color: "var(--rc-amber)" }}>KES {b.price.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "var(--rc-muted)" }}>per seat</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 24 }}>
            <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Choose Your Seat</h3>
            <p style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 20 }}>{from} → {to} · RC Express 001</p>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              {[["Free", "seat-free"], ["Taken", "seat-taken"], ["Selected", "seat-selected"], ["VIP", "seat-vip"]].map(([l, cls]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className={`seat ${cls}`} style={{ width: 20, height: 20, borderRadius: 4, fontSize: 9 }}/>
                  <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>{l}</span>
                </div>
              ))}
            </div>

            {/* Driver area */}
            <div style={{ background: "var(--rc-deep)", borderRadius: 10, padding: "8px 16px", marginBottom: 16, textAlign: "center", fontSize: 11, color: "var(--rc-muted)" }}>🚗 DRIVER</div>

            {/* Seats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {seatRows.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {row.map((seat, si) => {
                    if (!seat) return <div key={si} style={{ width: 36 }}/>;
                    const isTaken = takenSeats.includes(seat);
                    const isSelected = selectedSeat === seat;
                    const isVip = vipSeats.includes(seat) && busClass === "vip";
                    return (
                      <div
                        key={seat}
                        className={`seat ${isSelected ? "seat-selected" : isTaken ? "seat-taken" : isVip ? "seat-vip" : "seat-free"}`}
                        onClick={() => !isTaken && setSelectedSeat(seat)}
                        title={seat}
                      >{seat}</div>
                    );
                  })}
                </div>
              ))}
            </div>

            {selectedSeat && (
              <div style={{ background: "var(--rc-amber-dim)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 }}>
                ✅ Seat <strong>{selectedSeat}</strong> selected — {busClass.toUpperCase()} class
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ padding: "10px 20px", fontSize: 13, flex: 1 }}>← Back</button>
              <button className="btn-amber" onClick={() => selectedSeat ? setStep(3) : showToast("Please select a seat", "error")} style={{ padding: "10px 20px", fontSize: 13, flex: 2 }}>Continue to Payment →</button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 24 }}>
            <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Payment Details</h3>

            {/* Fare breakdown */}
            <div style={{ background: "var(--rc-deep)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--rc-muted)" }}>Base Fare ({busClass})</span>
                <span style={{ fontSize: 13 }}>KES {fare.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--rc-muted)" }}>VAT (16%)</span>
                <span style={{ fontSize: 13 }}>KES {tax.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--rc-muted)" }}>Service Fee</span>
                <span style={{ fontSize: 13 }}>KES 50</span>
              </div>
              <div style={{ height: 1, background: "var(--rc-border)", margin: "12px 0" }}/>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="syne" style={{ fontWeight: 700 }}>Total</span>
                <span className="syne" style={{ fontWeight: 800, fontSize: 18, color: "var(--rc-amber)" }}>KES {(fare + tax + 50).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment methods */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 10, display: "block" }}>PAYMENT METHOD</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { id: "mpesa", label: "M-Pesa STK Push", desc: "Instant mobile payment", icon: "📱" },
                  { id: "card", label: "Visa / Mastercard", desc: "Secure card payment", icon: "💳" },
                  { id: "bank", label: "Bank Transfer", desc: "Direct bank payment", icon: "🏦" },
                ].map(m => (
                  <div key={m.id} onClick={() => setPayMethod(m.id)} style={{ background: payMethod === m.id ? "var(--rc-amber-dim)" : "var(--rc-deep)", border: `1px solid ${payMethod === m.id ? "rgba(245,158,11,0.4)" : "var(--rc-border)"}`, borderRadius: 10, padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: "var(--rc-muted)" }}>{m.desc}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${payMethod === m.id ? "var(--rc-amber)" : "var(--rc-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {payMethod === m.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--rc-amber)" }}/>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {payMethod === "mpesa" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 6, display: "block" }}>M-PESA NUMBER</label>
                <input className="rc-input" placeholder="0712 345 678" defaultValue="0712 345 678"/>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(2)} style={{ padding: "10px 20px", fontSize: 13 }}>← Back</button>
              <button className="btn-amber" onClick={handlePay} style={{ padding: "10px 20px", fontSize: 13, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={processing}>
                {processing ? <><div style={{ width: 16, height: 16, border: "2px solid #0A0A0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/> Processing...</> : `Pay KES ${(fare + tax + 50).toLocaleString()} →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <div style={{ background: "var(--rc-card)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon name="check" size={32} color="var(--rc-green)"/>
            </div>
            <h3 className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Booking Confirmed!</h3>
            <p style={{ color: "var(--rc-muted)", marginBottom: 24 }}>Your ticket has been issued and sent to your phone</p>

            <div style={{ background: "var(--rc-deep)", borderRadius: 14, padding: 20, marginBottom: 20, textAlign: "left" }}>
              <div className="syne" style={{ fontSize: 13, fontWeight: 700, color: "var(--rc-amber)", marginBottom: 12 }}>TICKET RC-2025-00847</div>
              {[["Route", `${from} → ${to}`], ["Date", date], ["Bus", "RC Express 001"], ["Seat", selectedSeat || "7A"], ["Class", busClass.toUpperCase()]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, background: "var(--rc-deep)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="qr" size={48} color="var(--rc-amber)"/>
              </div>
              <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>QR Code for boarding</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ padding: "10px 20px", fontSize: 13, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => showToast("Downloading ticket PDF...", "info")}>
                <Icon name="download" size={14}/> Download PDF
              </button>
              <button className="btn-amber" style={{ padding: "10px 20px", fontSize: 13, flex: 1 }} onClick={() => setStep(1)}>
                Book Another Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TRACKING PAGE ─────────────────────────────────────────────────────────────
const TrackingPage = ({ showToast }) => {
  const [selectedBus, setSelectedBus] = useState(0);
  const buses = [
    { id: "RC-001", from: "Nairobi", to: "Mombasa", status: "en-route", speed: 94, eta: "14:30", progress: 68, driver: "James Mwangi", lat: "02°40'S", lng: "38°00'E" },
    { id: "RC-003", from: "Nairobi", to: "Kisumu", status: "en-route", speed: 82, eta: "16:15", progress: 34, driver: "Peter Otieno", lat: "00°30'S", lng: "36°20'E" },
    { id: "RC-005", from: "Eldoret", to: "Nairobi", status: "idle", speed: 0, eta: "—", progress: 0, driver: "Sarah Wanjiku", lat: "00°31'N", lng: "35°17'E" },
  ];
  const b = buses[selectedBus];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {buses.map((bus, i) => (
          <div key={bus.id} onClick={() => setSelectedBus(i)} style={{ background: selectedBus === i ? "var(--rc-amber-dim)" : "var(--rc-card)", border: `1px solid ${selectedBus === i ? "rgba(245,158,11,0.4)" : "var(--rc-border)"}`, borderRadius: 12, padding: "10px 16px", cursor: "pointer", display: "flex", align: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{bus.id}</span>
            <span className={`badge ${bus.status === "en-route" ? "badge-green" : "badge-muted"}`}>{bus.status}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="map-placeholder" style={{ height: 320, border: "1px solid var(--rc-border)" }}>
        <div className="map-grid"/>
        {/* Roads */}
        <div className="map-road-h" style={{ top: "40%", left: "5%", width: "90%" }}/>
        <div className="map-road-h" style={{ top: "65%", left: "10%", width: "70%" }}/>
        <div className="map-road-v" style={{ top: "10%", left: "25%", height: "80%" }}/>
        <div className="map-road-v" style={{ top: "20%", left: "70%", height: "60%" }}/>
        {/* Bus */}
        <div className="bus-dot" style={{ top: "35%", left: `${b.progress * 0.7 + 10}%`, transform: "translate(-50%,-50%)" }} title={b.id}>
          🚌
        </div>
        {/* Origin/Dest markers */}
        <div style={{ position: "absolute", top: "37%", left: "12%", transform: "translate(-50%,-50%)", background: "var(--rc-blue)", borderRadius: "50%", width: 12, height: 12 }}/>
        <div style={{ position: "absolute", top: "37%", left: "88%", transform: "translate(-50%,-50%)", background: "var(--rc-red)", borderRadius: "50%", width: 12, height: 12 }}/>
        {/* Labels */}
        <div style={{ position: "absolute", top: "25%", left: "10%", fontSize: 10, color: "var(--rc-amber)", fontWeight: 600 }}>{b.from}</div>
        <div style={{ position: "absolute", top: "25%", left: "82%", fontSize: 10, color: "var(--rc-amber)", fontWeight: 600 }}>{b.to}</div>
        {/* Progress line */}
        <div style={{ position: "absolute", top: "40%", left: "12%", width: `${b.progress * 0.74}%`, height: 3, background: "var(--rc-amber)", borderRadius: 2 }}/>
        {/* Map label */}
        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--rc-amber)" }}>🗺 Live Tracking · Google Maps</div>
      </div>

      {/* Bus details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: "Status", value: b.status.replace("-", " ").toUpperCase(), icon: "navigation", color: b.status === "en-route" ? "var(--rc-green)" : "var(--rc-muted)" },
          { label: "Speed", value: `${b.speed} km/h`, icon: "zap", color: "var(--rc-amber)" },
          { label: "ETA", value: b.eta, icon: "bell", color: "var(--rc-blue)" },
          { label: "Driver", value: b.driver.split(" ")[0], icon: "user", color: "var(--rc-soft)" },
          { label: "Progress", value: `${b.progress}%`, icon: "trending", color: "var(--rc-green)" },
          { label: "Bus ID", value: b.id, icon: "bus", color: "var(--rc-amber)" },
        ].map(d => (
          <div key={d.label} className="stat-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon name={d.icon} size={14} color={d.color}/>
              <span style={{ fontSize: 10, color: "var(--rc-muted)" }}>{d.label}</span>
            </div>
            <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.value}</div>
          </div>
        ))}
      </div>

      {/* Journey progress */}
      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{b.from}</span>
          <span style={{ fontSize: 12, color: "var(--rc-amber)" }}>{b.progress}% completed</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{b.to}</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${b.progress}%` }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>Departed 07:00</span>
          <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>ETA {b.eta}</span>
        </div>
      </div>
    </div>
  );
};

// ─── PARCEL PAGE ───────────────────────────────────────────────────────────────
const ParcelPage = ({ showToast }) => {
  const [form, setForm] = useState({ senderName: "", senderPhone: "", receiverName: "", receiverPhone: "", from: "Nairobi", to: "Mombasa", type: "document", size: "small", delivery: "next-day" });
  const [submitted, setSubmitted] = useState(false);

  const pricing = { small: 250, medium: 450, large: 750 };
  const deliveryFee = form.delivery === "same-day" ? 200 : 0;
  const total = pricing[form.size] + deliveryFee + 50;

  const handleSubmit = () => {
    setSubmitted(true);
    showToast("Parcel booking confirmed!", "success");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {!submitted ? (
        <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 24 }}>
          <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Send a Parcel</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>SENDER NAME</label>
              <input className="rc-input" placeholder="Your name" value={form.senderName} onChange={e => setForm(f => ({...f, senderName: e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>SENDER PHONE</label>
              <input className="rc-input" placeholder="0712 345 678" value={form.senderPhone} onChange={e => setForm(f => ({...f, senderPhone: e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>RECEIVER NAME</label>
              <input className="rc-input" placeholder="Receiver name" value={form.receiverName} onChange={e => setForm(f => ({...f, receiverName: e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>RECEIVER PHONE</label>
              <input className="rc-input" placeholder="0798 765 432" value={form.receiverPhone} onChange={e => setForm(f => ({...f, receiverPhone: e.target.value}))}/>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>FROM</label>
              <select className="rc-input" value={form.from} onChange={e => setForm(f => ({...f, from: e.target.value}))} style={{ appearance: "none" }}>
                {["Nairobi","Mombasa","Kisumu","Eldoret","Nakuru"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>TO</label>
              <select className="rc-input" value={form.to} onChange={e => setForm(f => ({...f, to: e.target.value}))} style={{ appearance: "none" }}>
                {["Mombasa","Nairobi","Kisumu","Eldoret","Nakuru"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[["small","Small\nUp to 2kg","KES 250"],["medium","Medium\n2–10kg","KES 450"],["large","Large\n10–30kg","KES 750"]].map(([s, l, p]) => (
              <div key={s} onClick={() => setForm(f => ({...f, size: s}))} style={{ background: form.size === s ? "var(--rc-amber-dim)" : "var(--rc-deep)", border: `1px solid ${form.size === s ? "rgba(245,158,11,0.4)" : "var(--rc-border)"}`, borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "pre-line", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 12, color: "var(--rc-amber)" }}>{p}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 8, display: "block" }}>DELIVERY TYPE</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["next-day", "Next Day", "Free"], ["same-day", "Same Day", "+KES 200"]].map(([d, l, e]) => (
                <div key={d} onClick={() => setForm(f => ({...f, delivery: d}))} style={{ flex: 1, background: form.delivery === d ? "var(--rc-amber-dim)" : "var(--rc-deep)", border: `1px solid ${form.delivery === d ? "rgba(245,158,11,0.4)" : "var(--rc-border)"}`, borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 11, color: "var(--rc-muted)" }}>{e}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price estimate */}
          <div style={{ background: "var(--rc-deep)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>Base ({form.size})</span>
              <span style={{ fontSize: 12 }}>KES {pricing[form.size]}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>Delivery fee</span>
              <span style={{ fontSize: 12 }}>KES {deliveryFee}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>Handling</span>
              <span style={{ fontSize: 12 }}>KES 50</span>
            </div>
            <div style={{ height: 1, background: "var(--rc-border)", margin: "8px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="syne" style={{ fontWeight: 700, fontSize: 13 }}>Total</span>
              <span className="syne" style={{ fontWeight: 800, color: "var(--rc-amber)" }}>KES {total}</span>
            </div>
          </div>

          <button className="btn-amber" onClick={handleSubmit} style={{ padding: "12px 20px", fontSize: 14, width: "100%" }}>
            Confirm Parcel Booking →
          </button>
        </div>
      ) : (
        <div style={{ background: "var(--rc-card)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 className="syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Parcel Booked!</h3>
          <p style={{ color: "var(--rc-muted)", marginBottom: 16 }}>Tracking ID: <strong style={{ color: "var(--rc-amber)" }}>RC-P-20250328-4821</strong></p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => setSubmitted(false)} style={{ flex: 1, padding: "10px 20px", fontSize: 13 }}>Send Another</button>
            <button className="btn-amber" onClick={() => showToast("Tracking opened", "info")} style={{ flex: 1, padding: "10px 20px", fontSize: 13 }}>Track Parcel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── REWARDS PAGE ──────────────────────────────────────────────────────────────
const RewardsPage = ({ showToast }) => {
  const points = 1240;
  const level = points >= 2000 ? "Gold" : points >= 1000 ? "Silver" : "Bronze";
  const nextLevel = 2000;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
        <div className="syne" style={{ fontSize: 42, fontWeight: 800, color: "var(--rc-amber)" }}>{points.toLocaleString()}</div>
        <div style={{ fontSize: 14, color: "var(--rc-muted)", marginBottom: 16 }}>Reward Points</div>
        <span className="badge badge-amber" style={{ padding: "6px 16px", fontSize: 13 }}>{level} Member</span>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>{points} pts</span>
            <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>{nextLevel} pts (Gold)</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(points / nextLevel) * 100}%` }}/>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { title: "Free Ticket", desc: "Nairobi → Nakuru", cost: "800 pts", icon: "ticket" },
          { title: "20% Discount", desc: "Any VIP seat", cost: "400 pts", icon: "star" },
          { title: "Free Parcel", desc: "Small size delivery", cost: "300 pts", icon: "package" },
          { title: "Priority Seat", desc: "Front row guarantee", cost: "150 pts", icon: "zap" },
        ].map(r => (
          <div key={r.title} className="stat-card hover-card" style={{ cursor: "pointer" }} onClick={() => showToast(`Redeemed: ${r.title}!`, "success")}>
            <div style={{ marginBottom: 10 }}><Icon name={r.icon} size={24} color="var(--rc-amber)"/></div>
            <div className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 10 }}>{r.desc}</div>
            <span className="badge badge-amber">{r.cost}</span>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
        <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🎁 Refer & Earn</h3>
        <p style={{ fontSize: 13, color: "var(--rc-muted)", marginBottom: 16 }}>Invite friends to Rayan Coach and earn 200 points per referral</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="rc-input" readOnly value="RC-REF-JK8271" style={{ flex: 1 }}/>
          <button className="btn-amber" style={{ padding: "10px 16px", fontSize: 13 }} onClick={() => showToast("Referral code copied!", "success")}>Copy</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DRIVER DASHBOARD TABS
// ══════════════════════════════════════════════════════════════════════════════

const DriverDashboard = ({ showToast }) => {
  const [tripStatus, setTripStatus] = useState("assigned");

  const statusFlow = ["assigned", "en-route", "completed"];
  const statusLabels = { assigned: "Assigned", "en-route": "En Route", completed: "Completed" };
  const statusColors = { assigned: "var(--rc-amber)", "en-route": "var(--rc-green)", completed: "var(--rc-blue)" };

  const nextStatus = () => {
    const idx = statusFlow.indexOf(tripStatus);
    if (idx < statusFlow.length - 1) {
      const next = statusFlow[idx + 1];
      setTripStatus(next);
      showToast(`Trip status: ${statusLabels[next]}`, "success");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Profile card */}
      <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: 24, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👨‍✈️</div>
        <div style={{ flex: 1 }}>
          <h3 className="syne" style={{ fontSize: 18, fontWeight: 800 }}>James Mwangi</h3>
          <p style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 8 }}>PSV-KE-2024-00821 · 5 yrs experience</p>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="badge badge-green">Active</span>
            <span className="badge badge-amber">4.9 ★</span>
            <span className="badge badge-blue">RC Express</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: "var(--rc-green)" }}>KES 4,200</div>
          <div style={{ fontSize: 11, color: "var(--rc-muted)" }}>Today's earnings</div>
        </div>
      </div>

      {/* Today's trip */}
      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="syne" style={{ fontSize: 15, fontWeight: 700 }}>Active Trip</h3>
          <span className="badge" style={{ background: `${statusColors[tripStatus]}20`, color: statusColors[tripStatus] }}>● {statusLabels[tripStatus]}</span>
        </div>

        <div style={{ background: "var(--rc-deep)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          {[["Route", "Nairobi → Mombasa"], ["Bus", "RC Express 001 (KAA 123B)"], ["Departure", "07:00 AM"], ["Passengers", "38/45"], ["Expected Arrival", "14:00 PM"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        {tripStatus !== "completed" && (
          <button className="btn-amber" onClick={nextStatus} style={{ padding: "12px 20px", fontSize: 14, width: "100%" }}>
            {tripStatus === "assigned" ? "🚀 Start Trip" : "✅ Complete Trip"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        {[
          { label: "Trips This Month", value: "22", icon: "bus", color: "var(--rc-green)" },
          { label: "On-time Rate", value: "94%", icon: "check", color: "var(--rc-amber)" },
          { label: "Rating", value: "4.9★", icon: "star", color: "var(--rc-amber)" },
          { label: "Total Earnings", value: "KES 48K", icon: "dollar", color: "var(--rc-green)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <Icon name={s.icon} size={20} color={s.color}/>
            <div className="syne" style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--rc-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SOS */}
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div className="syne" style={{ fontWeight: 700, marginBottom: 4, color: "var(--rc-red)" }}>🆘 Emergency SOS</div>
          <div style={{ fontSize: 12, color: "var(--rc-muted)" }}>Alert admin & dispatch with your GPS location</div>
        </div>
        <button className="btn-danger" style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700 }} onClick={() => showToast("SOS Alert sent to Admin & Next of Kin!", "error")}>
          SOS
        </button>
      </div>
    </div>
  );
};

const DriverEarnings = ({ showToast }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
      {[["This Week", "KES 14,200", "green"], ["This Month", "KES 48,700", "amber"], ["Total", "KES 284K", "blue"]].map(([l, v, c]) => (
        <div key={l} className="stat-card">
          <div style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 6 }}>{l}</div>
          <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: `var(--rc-${c})` }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
      <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Earnings Trend (7 days)</h3>
      <MiniChart data={[2100, 1800, 2400, 2200, 3100, 2800, 3600]} color="var(--rc-green)" height={80}/>
    </div>
    <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
      <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recent Payments</h3>
      {[
        { date: "27 Mar", route: "NBI→MSA", amount: "KES 3,600", status: "paid" },
        { date: "26 Mar", route: "MSA→NBI", amount: "KES 3,600", status: "paid" },
        { date: "25 Mar", route: "NBI→KSM", amount: "KES 2,800", status: "paid" },
        { date: "24 Mar", route: "KSM→NBI", amount: "KES 2,800", status: "processing" },
      ].map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--rc-border)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="dollar" size={16} color="var(--rc-green)"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.route}</div>
            <div style={{ fontSize: 11, color: "var(--rc-muted)" }}>{p.date}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--rc-green)" }}>{p.amount}</div>
            <span className={`badge ${p.status === "paid" ? "badge-green" : "badge-amber"}`}>{p.status}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DriverChat = ({ showToast }) => {
  const [messages, setMessages] = useState([
    { from: "admin", text: "James, confirm you have reached Mombasa checkpoint.", time: "09:14" },
    { from: "me", text: "Yes, checkpoint cleared. All passengers accounted for.", time: "09:17" },
    { from: "admin", text: "Good. ETA to terminal is 14:00. Proceed.", time: "09:18" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: "me", text: input, time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { from: "admin", text: "Acknowledged. Keep us updated.", time: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "60vh", background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--rc-border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="shield" size={16} color="var(--rc-amber)"/>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Admin / Dispatch</div>
          <div style={{ fontSize: 11, color: "var(--rc-green)" }}>● Online</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div>
              <div className={`chat-bubble ${m.from === "me" ? "chat-out" : "chat-in"}`}>{m.text}</div>
              <div style={{ fontSize: 10, color: "var(--rc-muted)", textAlign: m.from === "me" ? "right" : "left", marginTop: 2 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: "1px solid var(--rc-border)", display: "flex", gap: 8 }}>
        <input className="rc-input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1 }}/>
        <button className="btn-amber" onClick={send} style={{ padding: "10px 14px", display: "flex", alignItems: "center" }}><Icon name="send" size={16}/></button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD TABS
// ══════════════════════════════════════════════════════════════════════════════

const AdminDashboard = ({ showToast }) => {
  const revenueData = [820, 940, 780, 1100, 1050, 1280, 1420];
  const monthBars = [420, 580, 510, 670, 720, 890, 840, 950, 1100, 980, 1200, 1350];
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { label: "Active Trips", value: "14", icon: "navigation", color: "#3B82F6", delta: "+3 vs yesterday" },
          { label: "Revenue Today", value: "KES 84K", icon: "dollar", color: "#10B981", delta: "+12%" },
          { label: "Active Drivers", value: "31/40", icon: "users", color: "#F59E0B", delta: "9 off-duty" },
          { label: "Fleet Active", value: "18/25", icon: "bus", color: "#8B5CF6", delta: "7 maintenance" },
          { label: "Passengers", value: "1,284", icon: "user", color: "#06B6D4", delta: "today" },
          { label: "Alerts", value: "3", icon: "alert", color: "#EF4444", delta: "2 urgent" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={18} color={s.color}/>
              </div>
            </div>
            <div className="syne" style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--rc-muted)", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="syne" style={{ fontSize: 14, fontWeight: 700 }}>Revenue (7 days)</h3>
            <span className="badge badge-green">↑ 18%</span>
          </div>
          <MiniChart data={revenueData} color="var(--rc-amber)"/>
        </div>
        <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
          <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Monthly Overview</h3>
          <BarChart data={monthBars} labels={months}/>
        </div>
      </div>

      {/* Active Trips */}
      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="syne" style={{ fontSize: 14, fontWeight: 700 }}>Active Trips</h3>
          <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>View All</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { id: "RC-001", route: "NBI→MSA", driver: "James Mwangi", progress: 68, status: "en-route", pax: 38 },
            { id: "RC-003", route: "NBI→KSM", driver: "Peter Otieno", progress: 34, status: "en-route", pax: 42 },
            { id: "RC-007", route: "ELD→NBI", driver: "Sarah Wanjiku", progress: 91, status: "arriving", pax: 30 },
          ].map(t => (
            <div key={t.id} style={{ background: "var(--rc-deep)", borderRadius: 10, padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <span className="syne" style={{ fontSize: 12, fontWeight: 700, color: "var(--rc-amber)", width: 64 }}>{t.id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.route}</span>
                  <span className="badge badge-blue">{t.pax} pax</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="progress-bar" style={{ flex: 1, height: 4 }}>
                    <div className="progress-fill" style={{ width: `${t.progress}%` }}/>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--rc-muted)" }}>{t.progress}%</span>
                </div>
              </div>
              <span className={`badge ${t.status === "arriving" ? "badge-amber" : "badge-green"}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
        <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>⚠ System Alerts</h3>
        {[
          { msg: "Vehicle KAA 456C insurance expires in 7 days", type: "red", time: "Now" },
          { msg: "Driver Michael Otieno PSV badge expiry: 5 days", type: "amber", time: "2h ago" },
          { msg: "RC-009 delay detected: 45 mins late", type: "amber", time: "3h ago" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--rc-border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: `var(--rc-${a.type})`, marginTop: 5, flexShrink: 0 }}/>
            <div style={{ flex: 1, fontSize: 12 }}>{a.msg}</div>
            <span style={{ fontSize: 10, color: "var(--rc-muted)", flexShrink: 0 }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDrivers = ({ showToast }) => {
  const [filter, setFilter] = useState("all");
  const drivers = [
    { name: "James Mwangi", id: "DRV-001", status: "active", rating: 4.9, trips: 284, vehicle: "RC-001", psv: "2025-08", badge: "green" },
    { name: "Peter Otieno", id: "DRV-002", status: "active", rating: 4.7, trips: 192, vehicle: "RC-003", psv: "2025-11", badge: "green" },
    { name: "Sarah Wanjiku", id: "DRV-003", status: "off-duty", rating: 4.8, trips: 156, vehicle: "—", psv: "2025-03", badge: "amber" },
    { name: "Michael Kamau", id: "DRV-004", status: "active", rating: 4.5, trips: 88, vehicle: "RC-007", psv: "2024-12", badge: "red" },
    { name: "Grace Njeri", id: "DRV-005", status: "suspended", rating: 3.9, trips: 44, vehicle: "—", psv: "2025-06", badge: "red" },
  ];

  const filtered = filter === "all" ? drivers : drivers.filter(d => d.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "active", "off-duty", "suspended"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={filter === f ? "btn-amber" : "btn-ghost"} style={{ padding: "7px 14px", fontSize: 12, textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>
        <button className="btn-amber" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => showToast("Add driver modal opened", "info")}>
          <Icon name="plus" size={14}/> Add Driver
        </button>
      </div>

      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rc-deep)" }}>
                {["Driver", "ID", "Status", "Rating", "Trips", "Vehicle", "PSV Expiry", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "var(--rc-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} style={{ borderTop: "1px solid var(--rc-border)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--rc-muted)" }}>{d.id}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className={`badge ${d.status === "active" ? "badge-green" : d.status === "off-duty" ? "badge-amber" : "badge-red"}`}>{d.status}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--rc-amber)" }}>{d.rating}★</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{d.trips}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12 }}>{d.vehicle}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className={`badge badge-${d.badge}`}>{d.psv}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Viewing ${d.name}`, "info")}>View</button>
                      <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Editing ${d.name}`, "info")}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminVehicles = ({ showToast }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 className="syne" style={{ fontSize: 15, fontWeight: 700 }}>Fleet Registry</h3>
      <button className="btn-amber" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => showToast("Add vehicle modal", "info")}>
        <Icon name="plus" size={14}/> Add Vehicle
      </button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
      {[
        { id: "RC-001", plate: "KAA 123B", type: "VIP Coach", capacity: 45, status: "active", driver: "James Mwangi", maint: "2025-06-01", insurance: "2025-12" },
        { id: "RC-003", plate: "KBA 456C", type: "Standard", capacity: 48, status: "active", driver: "Peter Otieno", maint: "2025-04-15", insurance: "2025-10" },
        { id: "RC-005", plate: "KBZ 789A", type: "VIP Coach", capacity: 40, status: "maintenance", driver: "—", maint: "In progress", insurance: "2025-11" },
        { id: "RC-007", plate: "KCA 321D", type: "Standard", capacity: 48, status: "active", driver: "Sarah Wanjiku", maint: "2025-07-20", insurance: "2025-09" },
        { id: "RC-009", plate: "KDA 654E", type: "Express", capacity: 35, status: "idle", driver: "Unassigned", maint: "2025-05-30", insurance: "2025-08" },
      ].map(v => (
        <div key={v.id} className="hover-card" style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="syne" style={{ fontSize: 15, fontWeight: 800, color: "var(--rc-amber)" }}>{v.id}</div>
              <div style={{ fontSize: 12, color: "var(--rc-muted)" }}>{v.plate}</div>
            </div>
            <span className={`badge ${v.status === "active" ? "badge-green" : v.status === "maintenance" ? "badge-red" : "badge-muted"}`}>{v.status}</span>
          </div>
          <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>🚌</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["Type", v.type], ["Capacity", `${v.capacity} seats`], ["Driver", v.driver], ["Next Maint.", v.maint], ["Insurance", v.insurance]].map(([k, val]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>{k}</span>
                <span style={{ fontSize: 11 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            <button className="btn-ghost" style={{ flex: 1, padding: "7px 10px", fontSize: 11 }} onClick={() => showToast("Viewing vehicle details", "info")}>Details</button>
            <button className="btn-ghost" style={{ flex: 1, padding: "7px 10px", fontSize: 11 }} onClick={() => showToast("Maintenance log opened", "info")}>Maintenance</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminReports = ({ showToast }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {[
        { label: "Total Revenue (MTD)", value: "KES 1.28M", delta: "+18%", color: "var(--rc-green)" },
        { label: "Total Trips (MTD)", value: "842", delta: "+24", color: "var(--rc-amber)" },
        { label: "Avg Occupancy", value: "87%", delta: "+3%", color: "var(--rc-blue)" },
        { label: "Top Route", value: "NBI→MSA", delta: "42% share", color: "var(--rc-amber)" },
      ].map(s => (
        <div key={s.label} className="stat-card">
          <div style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 6 }}>{s.label}</div>
          <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, marginTop: 4, color: s.color }}>↑ {s.delta}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
        <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Route Performance</h3>
        {[["NBI → MSA", 94, "KES 340K"], ["NBI → KSM", 81, "KES 280K"], ["NBI → ELD", 73, "KES 215K"], ["NBI → NKR", 88, "KES 190K"]].map(([r, occ, rev]) => (
          <div key={r} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{r}</span>
              <span style={{ fontSize: 12, color: "var(--rc-amber)" }}>{rev}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${occ}%` }}/>
            </div>
            <div style={{ fontSize: 10, color: "var(--rc-muted)", marginTop: 2 }}>{occ}% occupancy</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 20 }}>
        <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Driver Rankings</h3>
        {[["James Mwangi", 4.9, 284], ["Sarah Wanjiku", 4.8, 156], ["Peter Otieno", 4.7, 192], ["Grace Njeri", 4.6, 120]].map(([n, r, t], i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--rc-border)" }}>
            <div className="syne" style={{ width: 24, fontWeight: 800, color: i === 0 ? "var(--rc-amber)" : "var(--rc-muted)", fontSize: 14 }}>#{i + 1}</div>
            <div style={{ flex: 1, fontSize: 13 }}>{n}</div>
            <span className="badge badge-amber">{r}★</span>
            <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>{t} trips</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {["Revenue Report", "Trip Report", "Driver Report", "Compliance Report"].map(r => (
        <button key={r} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => showToast(`Downloading ${r}...`, "info")}>
          <Icon name="download" size={14}/> {r}
        </button>
      ))}
    </div>
  </div>
);

const AdminLiveTracking = () => {
  const buses = [
    { id: "RC-001", top: "40%", left: "68%", status: "en-route" },
    { id: "RC-003", top: "55%", left: "30%", status: "en-route" },
    { id: "RC-007", top: "25%", left: "20%", status: "arriving" },
    { id: "RC-009", top: "70%", left: "55%", status: "idle" },
    { id: "RC-011", top: "35%", left: "80%", status: "en-route" },
  ];
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[["en-route", "green", "14"], ["arriving", "amber", "3"], ["idle", "muted", "5"], ["maintenance", "red", "3"]].map(([s, c, n]) => (
          <div key={s} style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: `var(--rc-${c})` }}/>
            <span style={{ fontSize: 12, textTransform: "capitalize" }}>{s}</span>
            <span className="syne" style={{ fontSize: 14, fontWeight: 800 }}>{n}</span>
          </div>
        ))}
      </div>

      <div className="map-placeholder" style={{ height: 400, border: "1px solid var(--rc-border)" }}>
        <div className="map-grid"/>
        <div className="map-road-h" style={{ top: "40%", left: 0, width: "100%" }}/>
        <div className="map-road-h" style={{ top: "65%", left: "5%", width: "80%" }}/>
        <div className="map-road-v" style={{ top: 0, left: "30%", height: "100%" }}/>
        <div className="map-road-v" style={{ top: 0, left: "70%", height: "100%" }}/>

        {buses.map(b => (
          <div
            key={b.id}
            className="bus-dot"
            style={{
              top: b.top, left: b.left, transform: "translate(-50%,-50%)",
              background: b.status === "en-route" ? "var(--rc-green)" : b.status === "arriving" ? "var(--rc-amber)" : "var(--rc-muted)",
              cursor: "pointer"
            }}
            onClick={() => setSelected(selected === b.id ? null : b.id)}
            title={b.id}
          >🚌</div>
        ))}

        {selected && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 10, padding: 12, width: 160 }}>
            <div className="syne" style={{ fontSize: 13, fontWeight: 700, color: "var(--rc-amber)", marginBottom: 8 }}>{selected}</div>
            {[["Speed", "84 km/h"], ["Route", "NBI→MSA"], ["Progress", "68%"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "var(--rc-muted)" }}>{k}</span>
                <span style={{ fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--rc-amber)" }}>
          🗺 Live Fleet Map · {buses.length} vehicles
        </div>
      </div>
    </div>
  );
};

const AdminPayments = ({ showToast }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      {[["Today's Revenue", "KES 84,200", "green"], ["Pending", "KES 12,400", "amber"], ["Driver Payouts", "KES 28,000", "blue"], ["Commission", "KES 8,400", "amber"]].map(([l, v, c]) => (
        <div key={l} className="stat-card">
          <div style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 6 }}>{l}</div>
          <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: `var(--rc-${c})` }}>{v}</div>
        </div>
      ))}
    </div>

    <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--rc-border)" }}>
        <h3 className="syne" style={{ fontSize: 14, fontWeight: 700 }}>Recent Transactions</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "var(--rc-deep)" }}>
            {["Ref", "Type", "Customer", "Amount", "Method", "Status", "Time"].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "var(--rc-muted)", fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[
              { ref: "TXN-001", type: "Ticket", cust: "John K.", amount: "KES 1,400", method: "M-Pesa", status: "success" },
              { ref: "TXN-002", type: "Parcel", cust: "Mary W.", amount: "KES 450", method: "Card", status: "success" },
              { ref: "TXN-003", type: "Ticket", cust: "Peter O.", amount: "KES 950", method: "M-Pesa", status: "pending" },
              { ref: "TXN-004", type: "Ticket", cust: "Grace N.", amount: "KES 1,800", method: "M-Pesa", status: "failed" },
              { ref: "TXN-005", type: "Payout", cust: "James M.", amount: "KES 4,200", method: "Bank", status: "success" },
            ].map((t, i) => (
              <tr key={t.ref} style={{ borderTop: "1px solid var(--rc-border)" }}>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--rc-amber)" }}>{t.ref}</td>
                <td style={{ padding: "10px 14px", fontSize: 12 }}>{t.type}</td>
                <td style={{ padding: "10px 14px", fontSize: 12 }}>{t.cust}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{t.amount}</td>
                <td style={{ padding: "10px 14px", fontSize: 12 }}>{t.method}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span className={`badge ${t.status === "success" ? "badge-green" : t.status === "pending" ? "badge-amber" : "badge-red"}`}>{t.status}</span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--rc-muted)" }}>Just now</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AdminSettings = ({ showToast }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
    {[
      { section: "System Settings", items: [["Dark Mode", true], ["Email Notifications", true], ["SMS Alerts", true], ["Auto-dispatch", false]] },
      { section: "Security", items: [["Two-Factor Auth (2FA)", true], ["Activity Logs", true], ["IP Whitelisting", false]] },
      { section: "Integrations", items: [["M-Pesa API", true], ["Google Maps API", true], ["SMS Gateway", true], ["Email Service", false]] },
    ].map(({ section, items }) => (
      <div key={section} style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--rc-border)" }}>
          <h3 className="syne" style={{ fontSize: 14, fontWeight: 700 }}>{section}</h3>
        </div>
        {items.map(([label, on]) => (
          <div key={label} style={{ padding: "14px 18px", borderBottom: "1px solid var(--rc-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>{label}</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked={on} onChange={() => showToast(`${label} toggled`, "info")}/>
              <div className="toggle-track"/>
              <div className="toggle-thumb"/>
            </label>
          </div>
        ))}
      </div>
    ))}

    <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 18 }}>
      <h3 className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>System Info</h3>
      {[["Version", "v2.4.1"], ["Database", "PostgreSQL 15.2"], ["Last Backup", "Today 06:00"], ["Uptime", "99.97%"]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--rc-border)" }}>
          <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>{k}</span>
          <span style={{ fontSize: 12 }}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════

export default function RayanCoach() {
  const [route, setRoute] = useState("/");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Tab states
  const [userTab, setUserTab] = useState("dashboard");
  const [driverTab, setDriverTab] = useState("dashboard");
  const [adminTab, setAdminTab] = useState("dashboard");

  const navigate = (path) => {
    setLoading(true);
    setTimeout(() => { setRoute(path); setLoading(false); }, 600);
  };

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleLogin = (role, name) => {
    setUser(name);
    setUserRole(role);
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    navigate("/");
  };

  if (loading) return <><GlobalStyles/><LoadingScreen/></>;

  // ── USER PORTAL ──────────────────────────────────────────────────────────────
  if (route.startsWith("/user/login")) {
    return <><GlobalStyles/><AuthPage role="user" navigate={navigate} onLogin={handleLogin}/>{toast && <Toast {...toast} onClose={() => setToast(null)}/>}</>;
  }

  if (route.startsWith("/user/") && user && userRole === "user") {
    const tabs = [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "booking", label: "Book Ticket", icon: "ticket" },
      { id: "tracking", label: "Live Tracking", icon: "map" },
      { id: "parcel", label: "Parcel", icon: "package" },
      { id: "tickets", label: "My Tickets", icon: "clipboard" },
      { id: "rewards", label: "Rewards", icon: "gift" },
      { id: "profile", label: "Profile", icon: "user" },
    ];
    return (
      <><GlobalStyles/>
      <DashboardShell role="user" user={user} navigate={navigate} onLogout={handleLogout} activeTab={userTab} setActiveTab={setUserTab} tabs={tabs}>
        {userTab === "dashboard" && <UserDashboard showToast={showToast}/>}
        {userTab === "booking"   && <BookingPage showToast={showToast}/>}
        {userTab === "tracking"  && <TrackingPage showToast={showToast}/>}
        {userTab === "parcel"    && <ParcelPage showToast={showToast}/>}
        {userTab === "rewards"   && <RewardsPage showToast={showToast}/>}
        {userTab === "tickets"   && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 className="syne" style={{ fontSize: 15, fontWeight: 700 }}>My Tickets</h3>
            {[
              { id: "RC-2025-00847", route: "NBI→MSA", date: "28 Mar 2025", seat: "12A", status: "upcoming" },
              { id: "RC-2025-00720", route: "NBI→KSM", date: "12 Mar 2025", seat: "7B", status: "used" },
              { id: "RC-2025-00615", route: "ELD→NBI", date: "02 Mar 2025", seat: "3C", status: "used" },
            ].map(t => (
              <div key={t.id} style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="qr" size={24} color="var(--rc-amber)"/></div>
                <div style={{ flex: 1 }}>
                  <div className="syne" style={{ fontWeight: 700, fontSize: 13, color: "var(--rc-amber)", marginBottom: 4 }}>{t.id}</div>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{t.route} · {t.date} · Seat {t.seat}</div>
                  <span className={`badge ${t.status === "upcoming" ? "badge-green" : "badge-muted"}`}>{t.status}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: "7px 12px", fontSize: 12, display: "flex", gap: 4 }} onClick={() => showToast("Downloading ticket...", "info")}><Icon name="download" size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {userTab === "profile" && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, cursor: "pointer", position: "relative" }} onClick={() => showToast("Upload photo feature", "info")}>
                  👤<div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "var(--rc-amber)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="camera" size={12} color="black"/></div>
                </div>
                <div>
                  <h3 className="syne" style={{ fontSize: 18, fontWeight: 800 }}>{user}</h3>
                  <p style={{ fontSize: 12, color: "var(--rc-muted)" }}>john.kamau@example.com · 0712 345 678</p>
                  <span className="badge badge-amber" style={{ marginTop: 4 }}>Silver Member</span>
                </div>
              </div>
              {[["Full Name", user], ["Email", "john.kamau@example.com"], ["Phone", "0712 345 678"]].map(([k, v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "var(--rc-muted)", marginBottom: 4, display: "block" }}>{k}</label>
                  <input className="rc-input" defaultValue={v}/>
                </div>
              ))}
              <button className="btn-amber" style={{ padding: "10px 20px", fontSize: 13 }} onClick={() => showToast("Profile updated!", "success")}>Save Changes</button>
            </div>
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 16 }}>
              <div className="syne" style={{ fontWeight: 700, color: "var(--rc-red)", marginBottom: 8 }}>🆘 SOS Emergency</div>
              <p style={{ fontSize: 12, color: "var(--rc-muted)", marginBottom: 12 }}>Alert admin & next of kin with your GPS location</p>
              <button className="btn-danger" style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700 }} onClick={() => showToast("SOS alert sent to admin and next of kin!", "error")}>Activate SOS</button>
            </div>
          </div>
        )}
      </DashboardShell>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
      </>
    );
  }

  // ── DRIVER PORTAL ────────────────────────────────────────────────────────────
  if (route.startsWith("/driver/login")) {
    return <><GlobalStyles/><AuthPage role="driver" navigate={navigate} onLogin={handleLogin}/>{toast && <Toast {...toast} onClose={() => setToast(null)}/>}</>;
  }

  if (route.startsWith("/driver/") && user && userRole === "driver") {
    const tabs = [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "trips", label: "My Trips", icon: "bus" },
      { id: "earnings", label: "Earnings", icon: "dollar" },
      { id: "chat", label: "Chat Admin", icon: "chat" },
      { id: "profile", label: "Profile", icon: "user" },
    ];
    return (
      <><GlobalStyles/>
      <DashboardShell role="driver" user={user} navigate={navigate} onLogout={handleLogout} activeTab={driverTab} setActiveTab={setDriverTab} tabs={tabs}>
        {driverTab === "dashboard" && <DriverDashboard showToast={showToast}/>}
        {driverTab === "earnings"  && <DriverEarnings showToast={showToast}/>}
        {driverTab === "chat"      && <DriverChat showToast={showToast}/>}
        {driverTab === "trips"     && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 className="syne" style={{ fontSize: 15, fontWeight: 700 }}>Trip History</h3>
            {[["NBI→MSA", "27 Mar", "KES 3,600", "completed", 38], ["MSA→NBI", "26 Mar", "KES 3,600", "completed", 42], ["NBI→KSM", "25 Mar", "KES 2,800", "completed", 35], ["KSM→NBI", "24 Mar", "KES 2,800", "completed", 40]].map(([r, d, e, s, p], i) => (
              <div key={i} style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="bus" size={18} color="var(--rc-green)"/></div>
                <div style={{ flex: 1 }}>
                  <div className="syne" style={{ fontWeight: 700, fontSize: 14 }}>{r}</div>
                  <div style={{ fontSize: 12, color: "var(--rc-muted)" }}>{d} · {p} passengers</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rc-green)" }}>{e}</div>
                  <span className="badge badge-green">{s}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {driverTab === "profile" && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ background: "var(--rc-card)", border: "1px solid var(--rc-border)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👨‍✈️</div>
                <div>
                  <h3 className="syne" style={{ fontSize: 18, fontWeight: 800 }}>{user}</h3>
                  <span className="badge badge-green" style={{ marginTop: 4 }}>Active Driver</span>
                </div>
              </div>
              {[["License", "DL-KE-2021-004821"], ["PSV Badge", "PSV-KE-2024-00821"], ["Badge Expiry", "Aug 2025"], ["Vehicle", "RC-001 (KAA 123B)"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--rc-border)" }}>
                  <span style={{ fontSize: 12, color: "var(--rc-muted)" }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <button className="btn-amber" style={{ padding: "10px 20px", fontSize: 13, marginTop: 16 }} onClick={() => showToast("Profile updated!", "success")}>Update Profile</button>
            </div>
          </div>
        )}
      </DashboardShell>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
      </>
    );
  }

  // ── ADMIN PORTAL ─────────────────────────────────────────────────────────────
  if (route.startsWith("/admin/login")) {
    return <><GlobalStyles/><AuthPage role="admin" navigate={navigate} onLogin={handleLogin}/>{toast && <Toast {...toast} onClose={() => setToast(null)}/>}</>;
  }

  if (route.startsWith("/admin/") && user && userRole === "admin") {
    const tabs = [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "tracking", label: "Live Tracking", icon: "map" },
      { id: "drivers", label: "Drivers", icon: "users" },
      { id: "vehicles", label: "Fleet", icon: "bus" },
      { id: "payments", label: "Payments", icon: "dollar" },
      { id: "reports", label: "Reports", icon: "barChart" },
      { id: "settings", label: "Settings", icon: "settings" },
    ];
    return (
      <><GlobalStyles/>
      <DashboardShell role="admin" user={user} navigate={navigate} onLogout={handleLogout} activeTab={adminTab} setActiveTab={setAdminTab} tabs={tabs}>
        {adminTab === "dashboard" && <AdminDashboard showToast={showToast}/>}
        {adminTab === "tracking"  && <AdminLiveTracking/>}
        {adminTab === "drivers"   && <AdminDrivers showToast={showToast}/>}
        {adminTab === "vehicles"  && <AdminVehicles showToast={showToast}/>}
        {adminTab === "payments"  && <AdminPayments showToast={showToast}/>}
        {adminTab === "reports"   && <AdminReports showToast={showToast}/>}
        {adminTab === "settings"  && <AdminSettings showToast={showToast}/>}
      </DashboardShell>
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
      </>
    );
  }

  // ── REDIRECT UNAUTHENTICATED ──────────────────────────────────────────────────
  if (route !== "/" && !user) {
    const loginRoute = route.startsWith("/user") ? "/user/login" : route.startsWith("/driver") ? "/driver/login" : "/admin/login";
    return <><GlobalStyles/><AuthPage role={loginRoute.split("/")[1]} navigate={navigate} onLogin={handleLogin}/></>;
  }

  // ── WELCOME PAGE ──────────────────────────────────────────────────────────────
  return (
    <><GlobalStyles/>
    <WelcomePage navigate={navigate}/>
    {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
    </>
  );
}
