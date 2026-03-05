// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  FiHome, FiUser, FiLogOut, FiPlus, FiSearch, FiMenu,
  FiTrendingUp, FiUsers, FiAward, FiEye, FiCreditCard,
  FiList, FiLock, FiChevronRight, FiSun, FiMoon,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

import MyPunds        from './dashboard/MyPunds';
import MyLoans        from './dashboard/MyLoans';
import Profile        from './dashboard/Profile';
import ChangePassword from './dashboard/ChangePassword';
import CreatePund     from './dashboard/CreatePund';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── RESET: make html/body fill viewport ── */
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* ══════════════════════════════════════════
   TOKENS — defined on root wrapper
═══════════════════════════════════════════ */
.db-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;

  /* FIX 1 ▸ Use height:100vh + overflow:hidden, NOT min-height
     This is the foundation. Without this, the sidebar can't
     reliably fill the screen and double-scrollbars appear.      */
  height: 100vh;
  overflow: hidden;

  /* FIX 3 ▸ Correct flex: row, no wrap */
  display: flex;
  flex-direction: row;

  transition: background .3s, color .3s;

  /* Light tokens */
  --bg:       #f3f4f6;
  --bg-2:     #e9eaec;
  --surf:     #ffffff;
  --t1:       #111827;
  --t2:       #374151;
  --t3:       #6b7280;
  --t4:       #9ca3af;
  --bd:       #e5e7eb;
  --bd-2:     #d1d5db;
  --blue:     #2563eb;
  --blue-d:   #1d4ed8;
  --blue-l:   #eff6ff;
  --blue-b:   #bfdbfe;
  --purple:   #7c3aed;
  --purple-l: #f5f3ff;
  --green:    #059669;
  --green-l:  #ecfdf5;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --sh:       0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
  --sh-lg:    0 10px 36px rgba(0,0,0,.09);
  --sb-w:     240px;   /* sidebar width — single source of truth */
  --hdr-h:    56px;    /* header height — single source of truth */

  background: var(--bg);
  color: var(--t1);
}

/* Dark tokens */
.db-root.dark {
  --bg:       #0d1117;
  --bg-2:     #21262d;
  --surf:     #161b22;
  --t1:       #f0f6fc;
  --t2:       #c9d1d9;
  --t3:       #8b949e;
  --t4:       #6e7681;
  --bd:       #30363d;
  --bd-2:     #21262d;
  --blue:     #58a6ff;
  --blue-d:   #79c0ff;
  --blue-l:   rgba(56,139,253,.12);
  --blue-b:   rgba(56,139,253,.3);
  --purple:   #a78bfa;
  --purple-l: rgba(139,92,246,.12);
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 36px rgba(0,0,0,.4);
}

/* ══════════════════════════════════════════
   SIDEBAR
   FIX 1 ▸ position:fixed + height:100vh
   ensures it always fills full screen
   regardless of content scroll
═══════════════════════════════════════════ */
.db-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sb-w);
  height: 100vh;           /* ← fills full screen */
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: var(--surf);
  border-right: 1px solid var(--bd);
  transition: transform .22s cubic-bezier(.25,1,.35,1),
              background .3s, border-color .3s;
  will-change: transform;
}

/* Mobile: slide out by default */
.db-sidebar.closed { transform: translateX(-100%); }

/* Desktop: always visible */
@media (min-width: 1024px) {
  .db-sidebar { transform: translateX(0) !important; }
}

/* ── Sidebar logo row ──
   Height exactly matches header so the horizontal
   border-bottom lines up pixel-perfectly.           */
.db-sb-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--hdr-h);
  padding: 0 18px;
  border-bottom: 1px solid var(--bd);
  text-decoration: none;
  flex-shrink: 0;
}
.db-sb-logo-box {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 900; color: #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,.4);
}

/* PundX text — same size as header brand */
.db-sb-logo-name {
  font-size: 18px;           /* ← matches header brand size */
  font-weight: 800;
  letter-spacing: -.4px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.dark .db-sb-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.db-sb-ver {
  margin-left: auto;
  font-size: 10px; font-weight: 600; color: var(--t4);
  background: var(--bg-2); border: 1px solid var(--bd);
  padding: 2px 7px; border-radius: 100px; white-space: nowrap;
  flex-shrink: 0;
}

/* ── Sidebar user section ── */
.db-sb-user {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--bd);
  flex-shrink: 0;
}
.db-sb-avatar {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
}
.db-sb-uname {
  font-size: 13px; font-weight: 600; color: var(--t1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  min-width: 0;
}

/* ── Sidebar nav ── */
.db-sb-nav {
  flex: 1;             /* ← takes remaining height */
  padding: 8px;
  overflow-y: auto;    /* ← scrolls if many items */
}
.db-sb-item {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 9px 11px; border-radius: 9px; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--t3); background: transparent;
  transition: background .12s, color .12s;
  margin-bottom: 2px; text-align: left;
}
.db-sb-item:hover  { background: var(--bg-2); color: var(--t1); }
.db-sb-item.active { background: var(--blue-l); color: var(--blue); }
.db-sb-item-l { display: flex; align-items: center; gap: 9px; }
.db-sb-badge {
  font-size: 10px; font-weight: 700; padding: 1px 7px;
  background: var(--red-l); color: var(--red); border-radius: 100px;
}

/* ── Sidebar footer ── */
.db-sb-foot {
  padding: 8px;
  border-top: 1px solid var(--bd);
  flex-shrink: 0;
}
.db-sb-logout {
  width: 100%; display: flex; align-items: center; gap: 9px;
  padding: 9px 11px; border-radius: 9px; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--red); background: transparent; transition: background .12s;
}
.db-sb-logout:hover { background: var(--red-l); }

/* ── Mobile overlay ── */
.db-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  z-index: 40;
  backdrop-filter: blur(3px);
}

/* ══════════════════════════════════════════
   MAIN CONTENT AREA
   FIX 2+3 ▸ flex:1 + height:100vh + overflow-y:auto
   The main area is a flex child that fills the
   remaining width. It scrolls independently of
   the fixed sidebar — no layout push.
═══════════════════════════════════════════ */
.db-main {
  flex: 1;                  /* fills remaining width */
  height: 100vh;            /* same height as root */
  overflow-y: auto;         /* main scrolls, sidebar stays fixed */
  display: flex;
  flex-direction: column;

  /* Desktop: push right of sidebar */
  margin-left: var(--sb-w);
}
@media (max-width: 1023px) {
  .db-main { margin-left: 0; }
}

/* ══════════════════════════════════════════
   HEADER — two-zone split
   LEFT zone = exact --sb-w width → aligns with sidebar
   RIGHT zone = flex:1 → page title + actions
═══════════════════════════════════════════ */
.db-header {
  position: sticky;
  top: 0; z-index: 30;
  height: var(--hdr-h);
  display: flex;
  flex-direction: row;
  align-items: stretch;       /* children fill full height */
  flex-shrink: 0;
  background: rgba(255,255,255,.94);
  border-bottom: 1px solid var(--bd);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  transition: background .3s, border-color .3s;
}
.dark .db-header { background: rgba(22,27,34,.94); }

/* ── Left brand zone (desktop only) ──
   width matches sidebar exactly, aligns logo visually */
.db-hdr-brand {
  display: none;
}
@media (min-width: 1024px) {
  .db-hdr-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    width: var(--sb-w);
    flex-shrink: 0;
    padding: 0 18px;
    border-right: 1px solid var(--bd);
  }
}
.db-hdr-brand-box {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 900; color: #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,.35);
}
.db-hdr-brand-name {
  font-size: 18px;        /* ← same as sidebar */
  font-weight: 800;
  letter-spacing: -.4px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.dark .db-hdr-brand-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Right content zone ── */
.db-hdr-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 12px;
  min-width: 0;
}
.db-hdr-left { display: flex; align-items: center; gap: 10px; min-width: 0; }

/* Hamburger — mobile only */
.db-ham {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: transparent;
  cursor: pointer; color: var(--t3); flex-shrink: 0; transition: .12s;
}
@media (min-width: 1024px) { .db-ham { display: none; } }
.db-ham:hover { background: var(--bg-2); color: var(--t1); }

/* Mobile logo — shown below 1024px */
.db-mob-logo {
  display: flex; align-items: center; gap: 8px; text-decoration: none;
}
@media (min-width: 1024px) { .db-mob-logo { display: none; } }
.db-mob-logo-box {
  width: 26px; height: 26px; border-radius: 6px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 900; color: #fff;
}
.db-mob-logo-name {
  font-size: 16px; font-weight: 800; letter-spacing: -.3px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .db-mob-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Page title — desktop only */
.db-hdr-title {
  font-size: 14px; font-weight: 600; color: var(--t2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: none;
}
@media (min-width: 1024px) { .db-hdr-title { display: block; } }

/* Right side actions */
.db-hdr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.db-theme-btn {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3); transition: .12s;
}
.db-theme-btn:hover { background: var(--bg-2); color: var(--t1); border-color: var(--bd-2); }

.db-new-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 13px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 8px;
  cursor: pointer; font-family: inherit; text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(37,99,235,.35);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.db-new-btn:hover { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,.45); }
.dark .db-new-btn { box-shadow: 0 2px 10px rgba(88,166,255,.2); }

/* ── Search bar ── */
.db-search-wrap {
  padding: 10px 16px;
  border-bottom: 1px solid var(--bd);
  background: var(--surf);
  flex-shrink: 0;
  transition: background .3s, border-color .3s;
}
.db-search-inp-wrap { position: relative; }
.db-search-ico {
  position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
  color: var(--t4); display: flex; align-items: center; pointer-events: none;
}
.db-search-inp {
  width: 100%; height: 36px; padding: 0 12px 0 34px;
  font-size: 13px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 9px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.db-search-inp::placeholder { color: var(--t4); }
.db-search-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }

/* ── Page content ── */
.db-content { flex: 1; padding: 20px 20px 40px; }

/* ══════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════ */
.db-loading {
  height: 100vh; display: flex; align-items: center;
  justify-content: center; flex-direction: column; gap: 14px;
}
.db-spin {
  width: 36px; height: 36px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: db-rot .7s linear infinite;
}
@keyframes db-rot { to { transform: rotate(360deg); } }
.db-loading-txt { font-size: 13px; color: var(--t3); }

/* ══════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════ */
.db-welcome { margin-bottom: 22px; }
.db-welcome h2 { font-size: 18px; font-weight: 700; color: var(--t1); margin: 0 0 4px; }
.db-welcome h2 span { color: var(--blue); }
.db-welcome p  { font-size: 13px; color: var(--t3); margin: 0; }

/* Stat grid */
.db-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
@media (min-width: 640px)  { .db-stats { grid-template-columns: repeat(4, 1fr); } }

.db-stat {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 14px;
  padding: 18px 16px; box-shadow: var(--sh);
  transition: box-shadow .2s, transform .2s;
}
.db-stat:hover { box-shadow: var(--sh-lg); transform: translateY(-2px); }
.db-stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.db-stat-val { font-size: 26px; font-weight: 800; color: var(--t1); letter-spacing: -.04em; line-height: 1; margin-bottom: 5px; }
.db-stat-lbl { font-size: 12px; color: var(--t3); font-weight: 500; }

/* Recent punds */
.db-recent {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; padding: 18px; box-shadow: var(--sh);
}
.db-recent-hd {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
}
.db-recent-title { font-size: 14px; font-weight: 700; color: var(--t1); }
.db-view-all {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 12px; font-weight: 500; color: var(--blue);
  background: none; border: none; cursor: pointer; font-family: inherit; transition: color .12s;
}
.db-view-all:hover { color: var(--blue-d); }

/* Empty */
.db-empty { text-align: center; padding: 32px 16px; }
.db-empty-txt { font-size: 13px; color: var(--t3); margin: 12px 0 18px; }
.db-create-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; font-size: 13px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 9px;
  cursor: pointer; font-family: inherit; text-decoration: none;
  box-shadow: 0 2px 10px rgba(37,99,235,.3); transition: .15s;
}
.db-create-btn:hover { background: var(--blue-d); }

/* Pund row */
.db-pund-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 12px; border-radius: 11px;
  background: var(--bg); border: 1px solid var(--bd);
  cursor: pointer; margin-bottom: 8px;
  transition: background .12s, border-color .12s, transform .12s;
}
.db-pund-row:last-child { margin-bottom: 0; }
.db-pund-row:hover { background: var(--bg-2); border-color: var(--bd-2); transform: translateX(3px); }
.db-pund-row-l { display: flex; align-items: center; gap: 10px; }
.db-pund-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff;
  box-shadow: 0 2px 8px rgba(37,99,235,.28);
}
.db-pund-name { font-size: 13px; font-weight: 600; color: var(--t1); }
.db-pund-type { font-size: 11px; color: var(--t3); margin-top: 2px; }
.db-pund-row-r { display: flex; align-items: center; gap: 8px; }
.db-role-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; }
.db-role-owner  { background: var(--purple-l); color: var(--purple); }
.db-role-member { background: var(--blue-l);   color: var(--blue); }
`;

/* Inject styles once */
let _dbIn = false;
const Styles = () => {
  useEffect(() => {
    if (_dbIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _dbIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { dark, toggle } = useTheme();

  const [punds,     setPunds]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userName,  setUserName]  = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [search,    setSearch]    = useState('');
  const [sidebar,   setSidebar]   = useState(false);

  useEffect(() => {
    fetchMyPunds();
    setUserName(localStorage.getItem('user_name') || 'User');
    setUserEmail(localStorage.getItem('user_email') || '');
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebar(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebar ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebar]);

  const fetchMyPunds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/punds/my-all/');
      setPunds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      }
    } finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const totalPunds  = punds.length;
  const ownerPunds  = punds.filter(p => p.role?.toLowerCase() === 'owner').length;
  const memberPunds = punds.filter(p => p.role?.toLowerCase() === 'member').length;
  const activePunds = punds.filter(p => p.pund_active).length;

  const menuItems = [
    { path: '/dashboard',                 label: 'Home',            icon: FiHome,      exact: true },
    { path: '/dashboard/punds',           label: 'My Punds',        icon: FiList,      badge: totalPunds },
    { path: '/dashboard/loans',           label: 'My Loans',        icon: FiCreditCard },
    { path: '/dashboard/profile',         label: 'Profile',         icon: FiUser },
    { path: '/dashboard/change-password', label: 'Change Password', icon: FiLock },
  ];

  const PAGE_TITLES = {
    '/dashboard':                 'Dashboard',
    '/dashboard/punds':           'My Punds',
    '/dashboard/loans':           'My Loans',
    '/dashboard/profile':         'Profile',
    '/dashboard/change-password': 'Change Password',
    '/dashboard/pund/create':     'Create Pund',
  };
  const pageTitle  = PAGE_TITLES[location.pathname] || 'Dashboard';
  const showSearch = location.pathname === '/dashboard' || location.pathname === '/dashboard/punds';
  const isCreate   = location.pathname === '/dashboard/pund/create';

  /* ── Loading ── */
  if (loading) return (
    <>
      <Styles />
      <div className={`db-loading db-root${dark ? ' dark' : ''}`}>
        <div className="db-spin" />
        <p className="db-loading-txt">Loading your dashboard…</p>
      </div>
    </>
  );

  /* ── Sidebar markup (reused) ── */
  const SidebarInner = () => (
    <>
      <Link to="/dashboard" className="db-sb-logo" onClick={() => setSidebar(false)}>
        <div className="db-sb-logo-box">P</div>
        <span className="db-sb-logo-name">PundX</span>
        <span className="db-sb-ver">v2.52</span>
      </Link>

      <div className="db-sb-user">
        <div className="db-sb-avatar">{userName.charAt(0).toUpperCase()}</div>
        <span className="db-sb-uname">{userName}</span>
      </div>

      <nav className="db-sb-nav">
        {menuItems.map(item => {
          const active = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <button key={item.path}
              className={`db-sb-item${active ? ' active' : ''}`}
              onClick={() => { navigate(item.path); setSidebar(false); }}
            >
              <span className="db-sb-item-l">
                <item.icon size={15} />
                {item.label}
              </span>
              {item.badge > 0 && <span className="db-sb-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="db-sb-foot">
        <button className="db-sb-logout" onClick={handleLogout}>
          <FiLogOut size={15} /> Logout
        </button>
      </div>
    </>
  );

  /* ── Main render ── */
  return (
    <>
      <Styles />
      <div className={`db-root${dark ? ' dark' : ''}`}>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebar && (
            <motion.div className="db-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSidebar(false)}
            />
          )}
        </AnimatePresence>

        {/* ── SIDEBAR ── */}
        <aside className={`db-sidebar${sidebar ? '' : ' closed'}`}
          role="navigation" aria-label="Main navigation">
          <SidebarInner />
        </aside>

        {/* ── MAIN COLUMN ──
            flex:1 + height:100vh + overflow-y:auto
            This is the only scrollable area.
            The sidebar stays fixed behind it.       */}
        <main className="db-main">

          {/* Sticky header */}
          <header className="db-header">

            {/* Desktop: brand zone (width = sidebar width) */}
            <div className="db-hdr-brand">
              <div className="db-hdr-brand-box">P</div>
              <span className="db-hdr-brand-name">PundX</span>
            </div>

            {/* Content zone */}
            <div className="db-hdr-content">
              <div className="db-hdr-left">
                {/* Hamburger — mobile only */}
                <button className="db-ham" onClick={() => setSidebar(true)} aria-label="Open menu">
                  <FiMenu size={17} />
                </button>

                {/* Mobile: show brand */}
                <Link to="/dashboard" className="db-mob-logo">
                  <div className="db-mob-logo-box">P</div>
                  <span className="db-mob-logo-name">PundX</span>
                </Link>

                {/* Desktop: page title */}
                <span className="db-hdr-title">{pageTitle}</span>
              </div>

              <div className="db-hdr-right">
                <button className="db-theme-btn" onClick={toggle}
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
                </button>
                {!isCreate && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/dashboard/pund/create" className="db-new-btn">
                      <FiPlus size={14} /> New Pund
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </header>

          {/* Search — only on home + punds */}
          {showSearch && (
            <div className="db-search-wrap">
              <div className="db-search-inp-wrap">
                <span className="db-search-ico"><FiSearch size={13} /></span>
                <input
                  type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search punds…"
                  className="db-search-inp"
                  aria-label="Search punds"
                />
              </div>
            </div>
          )}

          {/* Page routes */}
          <div className="db-content">
            <Routes>
              <Route index element={
                <HomePage
                  userName={userName}
                  stats={{ totalPunds, ownerPunds, memberPunds, activePunds }}
                  punds={punds.slice(0, 3)}
                  searchTerm={search}
                  onViewAll={() => navigate('/dashboard/punds')}
                  onPundClick={id => navigate(`/pund/${id}`)}
                />
              } />
              <Route path="punds"           element={<MyPunds punds={punds} searchTerm={search} onPundClick={id => navigate(`/pund/${id}`)} />} />
              <Route path="loans"           element={<MyLoans />} />
              <Route path="profile"         element={<Profile userName={userName} userEmail={userEmail} />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="pund/create"     element={<CreatePund />} />
            </Routes>
          </div>

        </main>
      </div>
    </>
  );
};

/* ─── HOME PAGE ─────────────────────────────────────────────── */
const HomePage = ({ userName, stats, punds, searchTerm, onViewAll, onPundClick }) => {
  const cards = [
    { label: 'Total Punds', value: stats.totalPunds, icon: FiHome,       bg: 'var(--blue-l)',   ic: 'var(--blue)'   },
    { label: 'As Owner',    value: stats.ownerPunds,  icon: FiTrendingUp, bg: 'var(--purple-l)', ic: 'var(--purple)' },
    { label: 'As Member',   value: stats.memberPunds, icon: FiUsers,      bg: 'var(--green-l)',  ic: 'var(--green)'  },
    { label: 'Active Now',  value: stats.activePunds, icon: FiAward,      bg: 'var(--amber-l)',  ic: 'var(--amber)'  },
  ];

  const filtered = punds.filter(p =>
    p.pund_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>

      <motion.div className="db-welcome"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
      >
        <h2>Hi, <span>{userName}</span> 👋</h2>
        <p>Here's your savings overview</p>
      </motion.div>

      {/* Stats */}
      <div className="db-stats">
        {cards.map((s, i) => (
          <motion.div key={i} className="db-stat"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: i * 0.07, ease: [0.25, 1, 0.35, 1] }}
          >
            <div className="db-stat-icon" style={{ background: s.bg }}>
              <s.icon size={17} style={{ color: s.ic }} />
            </div>
            <div className="db-stat-val">{s.value}</div>
            <div className="db-stat-lbl">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent punds */}
      <motion.div className="db-recent"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.28, ease: [0.25, 1, 0.35, 1] }}
      >
        <div className="db-recent-hd">
          <span className="db-recent-title">Recent Punds</span>
          <button className="db-view-all" onClick={onViewAll}>
            View all <FiChevronRight size={13} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="db-empty">
            <FiHome size={38} color="var(--t4)" />
            <p className="db-empty-txt">No punds yet. Create your first savings group!</p>
            <Link to="/dashboard/pund/create" className="db-create-btn">
              <FiPlus size={14} /> Create Pund
            </Link>
          </div>
        ) : (
          <div>
            {filtered.map((pund, i) => {
              const role = (pund.role || 'member').toLowerCase();
              return (
                <motion.div key={pund.pund_id} className="db-pund-row"
                  onClick={() => onPundClick(pund.pund_id)}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.06, duration: 0.28 }}
                >
                  <div className="db-pund-row-l">
                    <div className="db-pund-avatar">
                      {pund.pund_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="db-pund-name">{pund.pund_name}</div>
                      <div className="db-pund-type">{pund.pund_type || 'General'}</div>
                    </div>
                  </div>
                  <div className="db-pund-row-r">
                    <span className={`db-role-badge ${role === 'owner' ? 'db-role-owner' : 'db-role-member'}`}>
                      {pund.role || 'Member'}
                    </span>
                    <FiEye size={13} style={{ color: 'var(--t4)' }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;