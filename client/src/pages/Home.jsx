import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiUsers,
  FiLock,
  FiClock,
  FiShield,
  FiPieChart,
  FiMenu,
  FiX,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiInstagram,
  FiTrendingUp,
  FiSun,
  FiMoon
} from 'react-icons/fi';

import { useTheme } from '../context/ThemeContext';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS + GLOBAL CSS
══════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

/* ── Tokens ── */
.px-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  overflow-x: hidden;
  transition: background .3s, color .3s;

  /* Light */
  --bg:       #ffffff;
  --bg-2:     #f9fafb;
  --bg-3:     #f3f4f6;
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
  --sh:       0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
  --sh-lg:    0 12px 40px rgba(0,0,0,.1);
  --sh-xl:    0 24px 64px rgba(0,0,0,.14);
  background: var(--bg);
  color: var(--t1);
}

/* Dark */
.px-root.dark {
  --bg:       #0d1117;
  --bg-2:     #161b22;
  --bg-3:     #21262d;
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
  --blue-b:   rgba(56,139,253,.35);
  --sh:       0 1px 3px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4);
  --sh-lg:    0 12px 40px rgba(0,0,0,.5);
  --sh-xl:    0 24px 64px rgba(0,0,0,.6);
}

/* ── NAV ── */
.px-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 60px;
  background: rgba(255,255,255,.85);
  border-bottom: 1px solid var(--bd);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  transition: background .3s, border-color .3s;
}
.dark .px-nav { background: rgba(13,17,23,.88); }
.px-nav-wrap {
  max-width: 1160px; margin: 0 auto;
  padding: 0 28px; height: 60px;
  display: flex; align-items: center;
}
.px-logo {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none; flex-shrink: 0; margin-right: 40px;
}
.px-logo-box {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,.4);
}
.px-logo-name {
  font-size: 16px; font-weight: 800; letter-spacing: -.3px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: brightness(1.1);
}
.dark .px-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.px-nav-links { display: flex; align-items: center; gap: 2px; flex: 1; }
.px-nav-a {
  font-size: 14px; font-weight: 500; color: var(--t3);
  text-decoration: none; padding: 6px 12px; border-radius: 7px;
  transition: background .12s, color .12s;
}
.px-nav-a:hover { background: var(--bg-3); color: var(--t1); }

.px-nav-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.px-icon-btn {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3); transition: .15s;
}
.px-icon-btn:hover { border-color: var(--bd-2); color: var(--t1); background: var(--bg-3); }
.px-btn-ghost {
  font-size: 14px; font-weight: 500; color: var(--t2);
  background: none; border: none; padding: 7px 14px; border-radius: 8px;
  cursor: pointer; font-family: inherit; text-decoration: none;
  display: inline-flex; align-items: center; transition: .12s;
}
.px-btn-ghost:hover { background: var(--bg-3); color: var(--t1); }
.px-btn-solid {
  font-size: 14px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 8px;
  padding: 8px 18px; cursor: pointer; font-family: inherit;
  text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
  box-shadow: 0 2px 10px rgba(37,99,235,.35); transition: .15s;
}
.px-btn-solid:hover { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(37,99,235,.45); }
.dark .px-btn-solid { box-shadow: 0 2px 14px rgba(88,166,255,.2); }

.px-ham {
  display: none; width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: transparent;
  align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3); flex-shrink: 0; margin-left: auto;
}

/* ── DRAWER ── */
.px-overlay { position: fixed; inset: 0; z-index: 300; }
.px-overlay-bg { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.px-drawer {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: min(308px, 86vw); background: var(--bg);
  display: flex; flex-direction: column;
  border-left: 1px solid var(--bd);
}
.px-drawer-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid var(--bd);
}
.px-drawer-links { flex: 1; overflow-y: auto; }
.px-drawer-a {
  display: block; padding: 14px 22px;
  font-size: 15px; font-weight: 500; color: var(--t2);
  text-decoration: none; border-bottom: 1px solid var(--bd); transition: background .1s;
}
.px-drawer-a:hover { background: var(--bg-2); color: var(--t1); }
.px-drawer-foot {
  padding: 18px 22px; display: flex; flex-direction: column; gap: 8px;
  border-top: 1px solid var(--bd);
}

/* ── HERO ── */
.px-hero {
  padding: 136px 28px 100px;
  text-align: center;
  position: relative; overflow: hidden;
  background: var(--bg);
}
.px-hero-glow {
  position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 960px; height: 680px; pointer-events: none;
  background: radial-gradient(ellipse 65% 55% at 50% 0%, rgba(37,99,235,.13) 0%, transparent 70%);
  filter: blur(60px); opacity: .85;
}
.dark .px-hero-glow {
  background: radial-gradient(ellipse 65% 55% at 50% 0%, rgba(88,166,255,.1) 0%, transparent 70%);
}
.px-hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(var(--bd) 1px, transparent 1px),
                    linear-gradient(90deg, var(--bd) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(ellipse 80% 65% at 50% 0%, #000 0%, transparent 80%);
  mask-image: radial-gradient(ellipse 80% 65% at 50% 0%, #000 0%, transparent 80%);
  opacity: .38;
}
.dark .px-hero-grid { opacity: .18; }



.px-h1 {
  font-size: clamp(55px, 6.5vw, 72px);
  font-weight: 800; line-height: 1.06; letter-spacing: -.05em;
  color: var(--t1); max-width: 820px; margin: 0 auto 22px;
  position: relative; z-index: 1;
}
.px-h1 em {
  font-style: normal;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .px-h1 em {
  background: linear-gradient(135deg, #58a6ff, #818cf8, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.px-hero-sub {
  font-size: clamp(15px, 1.9vw, 18px); font-weight: 400; line-height: 1.8;
  color: var(--t3); max-width: 520px; margin: 0 auto 40px;
  position: relative; z-index: 1;
}
.px-hero-ctas {
  display: flex; justify-content: center; align-items: center;
  gap: 10px; flex-wrap: wrap; margin-bottom: 52px;
  position: relative; z-index: 1;
}
.px-cta-main {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 26px; font-size: 15px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit; text-decoration: none;
  box-shadow: 0 4px 18px rgba(37,99,235,.4); transition: .15s;
}
.px-cta-main:hover { background: var(--blue-d); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,.52); }
.px-cta-out {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 26px; font-size: 15px; font-weight: 500; color: var(--t2);
  background: var(--surf); border: 1px solid var(--bd); border-radius: 10px;
  cursor: pointer; font-family: inherit; text-decoration: none; transition: .15s;
}
.px-cta-out:hover { background: var(--bg-2); border-color: var(--bd-2); color: var(--t1); }




/* ── SECTION SHELL ── */
.px-sec { padding: 96px 28px; }
.px-sec-in { max-width: 1160px; margin: 0 auto; }
.px-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--blue); margin-bottom: 12px;
}
.px-tag::before { content: ''; width: 16px; height: 2px; background: var(--blue); border-radius: 2px; }
.px-sh2 {
  font-size: clamp(26px, 3.8vw, 42px); font-weight: 800;
  line-height: 1.12; letter-spacing: -.035em; color: var(--t1); margin-bottom: 12px;
}
.px-ssub { font-size: 16px; line-height: 1.75; color: var(--t3); max-width: 460px; }
.px-shd { margin-bottom: 52px; }

/* ── HOW IT WORKS ── */
.px-bg2 { background: var(--bg-2); }
.px-steps {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px; position: relative;
}
/* connector line between cards */
.px-steps::before {
  content: '';
  position: absolute;
  top: 52px; left: calc(16.66% + 20px); right: calc(16.66% + 20px);
  height: 2px;
  background: linear-gradient(90deg, var(--blue-b), var(--blue), var(--blue-b));
  opacity: .45; z-index: 0;
  border-radius: 2px;
}
.dark .px-steps::before { opacity: .25; }
.px-step {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: 20px;
  padding: 36px 28px 32px;
  position: relative; z-index: 1;
  transition: box-shadow .22s, transform .22s, border-color .22s;
  display: flex; flex-direction: column; align-items: flex-start;
}
.px-step:hover {
  box-shadow: 0 12px 36px rgba(37,99,235,.10);
  transform: translateY(-5px);
  border-color: var(--blue-b);
}
.dark .px-step:hover { box-shadow: 0 12px 36px rgba(88,166,255,.12); }
/* numbered circle */
.px-step-num {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), #6d28d9);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; color: #fff;
  margin-bottom: 24px; flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(37,99,235,.35);
}
.dark .px-step-num { box-shadow: 0 4px 14px rgba(88,166,255,.2); }
.px-step-ico { font-size: 32px; display: block; margin-bottom: 14px; line-height: 1; }
.px-step-t {
  font-size: 17px; font-weight: 700; color: var(--t1);
  letter-spacing: -.02em; margin-bottom: 10px;
}
.px-step-d { font-size: 13.5px; line-height: 1.78; color: var(--t3); }

/* ── FEATURES ── */
.px-feats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.px-feat {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 14px;
  padding: 28px 26px; transition: box-shadow .2s, transform .2s, border-color .2s;
}
.px-feat:hover { box-shadow: var(--sh-lg); transform: translateY(-6px) scale(1.01); border-color: var(--blue-b); }
.px-feat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; margin-bottom: 18px;
}
.px-feat-t { font-size: 15.5px; font-weight: 700; color: var(--t1); letter-spacing: -.015em; margin-bottom: 8px; }
.px-feat-d { font-size: 13.5px; line-height: 1.75; color: var(--t3); margin-bottom: 14px; }
.px-feat-chip {
  font-size: 11px; font-weight: 600; color: var(--blue);
  background: var(--blue-l); padding: 3px 9px; border-radius: 5px;
  letter-spacing: .01em; display: inline-flex;
}

/* ── USE CASES ── */
.px-uc-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.px-uc {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 12px;
  padding: 20px 14px; text-align: center; font-size: 13.5px; font-weight: 600;
  color: var(--t2); transition: .2s; cursor: default;
}
.px-uc:hover { border-color: var(--blue-b); background: var(--blue-l); color: var(--blue); transform: translateY(-3px); }





/* ── FINAL CTA ── */
.px-cta-sec {
  background: var(--t1); padding: 100px 28px; text-align: center;
  position: relative; overflow: hidden;
}
.dark .px-cta-sec { background: #010409; }
.px-cta-glow {
  position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
  width: 800px; height: 500px; pointer-events: none;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,.22) 0%, transparent 70%);
  filter: blur(60px); opacity: .7;
}
.px-cta-tag { color: #93c5fd !important; }
.px-cta-tag::before { background: #93c5fd !important; }
.px-cta-h2 {
  font-size: clamp(28px, 4.5vw, 52px); font-weight: 800; line-height: 1.08;
  letter-spacing: -.04em; color: #fff; max-width: 640px; margin: 0 auto 14px;
  position: relative; z-index: 1;
}
.px-cta-sub {
  font-size: 17px; line-height: 1.72; color: #6b7280;
  max-width: 400px; margin: 0 auto 40px; position: relative; z-index: 1;
}
.px-cta-acts { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; position: relative; z-index: 1; }
.px-cta-w {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 28px; font-size: 15px; font-weight: 600; color: #111827;
  background: #fff; border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit; text-decoration: none; transition: .12s;
}
.px-cta-w:hover { background: #f3f4f6; }
.px-cta-o {
  display: inline-flex; align-items: center;
  padding: 12px 28px; font-size: 15px; font-weight: 500; color: rgba(255,255,255,.65);
  background: transparent; border: 1px solid rgba(255,255,255,.2);
  border-radius: 10px; cursor: pointer; font-family: inherit; text-decoration: none; transition: .12s;
}
.px-cta-o:hover { border-color: rgba(255,255,255,.42); color: #fff; }
.px-cta-checks { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; position: relative; z-index: 1; }
.px-cta-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }

/* ── FOOTER ── */
.px-footer { border-top: 1px solid var(--bd); padding: 28px 28px; background: var(--bg); }
.px-footer-in { max-width: 1160px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
.px-footer-l { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.px-footer-copy { font-size: 13px; color: var(--t4); }
.px-footer-dot { color: var(--bd-2); }
.px-footer-dev { font-size: 13px; color: var(--t4); }
.px-footer-dev b { color: var(--t3); font-weight: 500; }
.px-socs { display: flex; gap: 6px; }
.px-soc {
  width: 32px; height: 32px; border-radius: 7px;
  background: var(--bg-2); border: 1px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  color: var(--t3); text-decoration: none; transition: .15s;
}
.px-soc:hover { background: var(--blue-l); border-color: var(--blue-b); color: var(--blue); }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .px-uc-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .px-nav-links, .px-nav-right { display: none !important; }
  .px-ham { display: flex !important; }
  .px-nav-wrap { gap: 0; }
  .px-steps { grid-template-columns: 1fr; }
  .px-steps::before { display: none; }
  .px-feats { grid-template-columns: 1fr 1fr; }

  .px-uc-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .px-hero { padding: 94px 20px 80px; }
  .px-sec { padding: 72px 20px; }
  .px-nav-wrap { padding: 0 20px; }
  .px-feats { grid-template-columns: 1fr; }
  .px-uc-grid { grid-template-columns: repeat(2, 1fr); }
  .px-hero-ctas { flex-direction: column; align-items: stretch; }
  .px-cta-main, .px-cta-out { justify-content: center; }
  .px-cta-acts { flex-direction: column; align-items: stretch; }
  .px-cta-w, .px-cta-o { justify-content: center; }
  .px-cta-checks { gap: 12px; }
  .px-footer-in { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 400px) {

  .px-uc-grid { grid-template-columns: 1fr; }
}
`;

/* Inject once */
let _stylesIn = false;
const InjectStyles = () => {
  useEffect(() => {
    if (_stylesIn) return;
    const el = document.createElement('style');
    el.textContent = STYLES;
    document.head.appendChild(el);
    _stylesIn = true;
  }, []);
  return null;
};

/* Scroll reveal */
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef();
  const visible = useInView(ref, { once: true, margin: '-44px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.44, delay, ease: [0.25, 1, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
};



/* ═══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const Home = () => {
  const [drawer, setDrawer]   = useState(false);
  const { dark, toggle } = useTheme();

  /* Drawer body-scroll lock */
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  /* ── DATA ── */
  const features = [
    { icon: <FiClock size={19} />,     title: 'Automated Savings',  description: 'Create daily, weekly, or monthly savings cycles with automatic tracking and reminders.', color: '#2563eb', chip: '100% automated' },
    { icon: <FiUsers size={19} />,     title: 'Smart Loans',        description: 'Members request loans with configurable interest and automated repayment schedules.',      color: '#7c3aed', chip: '0% defaults' },
    { icon: <FiShield size={19} />,    title: 'EMI Automation',     description: 'Automated EMI calculation and penalty enforcement with instant member notifications.',      color: '#dc2626', chip: '99.9% accurate' },
    { icon: <FiPieChart size={19} />,  title: 'Real-Time Tracking', description: 'Instant visibility of savings, loans, and available group funds on every device.',         color: '#059669', chip: 'Live updates' },
    { icon: <FiLock size={19} />,      title: 'Role-Based Access',  description: 'Granular permissions for owners and members with fully distinct views and controls.',        color: '#d97706', chip: 'Secure' },
    { icon: <FiTrendingUp size={19} />, title: 'Audit Reports',     description: 'Complete financial audit trail with detailed downloadable reports for every transaction.',   color: '#0891b2', chip: '100% traceable' },
  ];
  const steps = [
    { n: '01', icon: '🚀', title: 'Create your group',  desc: 'Set up your savings group with custom rules, cycles, and member limits — all in minutes.' },
    { n: '02', icon: '👥', title: 'Invite members',     desc: 'Invite via email or shareable link. Assign roles and set individual contribution amounts.' },
    { n: '03', icon: '💰', title: 'Start saving',       desc: 'Automated tracking begins instantly. Real-time dashboards. Smart notifications. Zero manual work.' },
  ];
  const useCases = ['👨‍👩‍👧‍👦 Families', '🤝 Community Groups', '🏦 Self-Help Groups', '🔄 Rotating Savings', '💼 Small Finance', '🌾 Farmer Groups'];
  const navLinks = [['#how-it-works', 'How it works'], ['#features', 'Features'], ['#security', 'Security']];
  const socials  = [
    { icon: FiMail,      href: 'mailto:spdarshan252@gmail.com',              label: 'Email' },
    { icon: FiLinkedin,  href: 'https://www.linkedin.com/in/spdarshan252',      label: 'LinkedIn' },
    { icon: FiGithub,    href: 'https://github.com/spdarshan46',           label: 'GitHub' },
    { icon: FiInstagram, href: 'https://instagram.com/spdarshan252',     label: 'Instagram' },
  ];

  /* ── RENDER ── */
  return (
    <>
      <InjectStyles />
      <div className={`px-root${dark ? ' dark' : ''}`}>

        {/* ════ NAV ════ */}
        <nav className="px-nav" role="navigation" aria-label="Main navigation">
          <div className="px-nav-wrap">
            <Link to="/" className="px-logo" aria-label="PundX — go to home">
              <div className="px-logo-box">P</div>
              <span className="px-logo-name">PundX</span>
            </Link>

            <div className="px-nav-links" role="menubar">
              {navLinks.map(([href, label]) => (
                <a key={href} href={href} className="px-nav-a" role="menuitem">{label}</a>
              ))}
            </div>

            <div className="px-nav-right">
              <button
                className="px-icon-btn"
                onClick={() => toggle()}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
              </button>
              <Link to="/login">
                <button className="px-btn-ghost">Sign in</button>
              </Link>
              <Link to="/register">
                <motion.button
                  className="px-btn-solid"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  aria-label="Create a free savings group"
                >
                  Get started
                </motion.button>
              </Link>
            </div>

            <button className="px-ham" onClick={() => setDrawer(true)} aria-label="Open navigation menu">
              <FiMenu size={17} />
            </button>
          </div>
        </nav>

        {/* ════ MOBILE DRAWER ════ */}
        <AnimatePresence>
          {drawer && (
            <motion.div className="px-overlay" role="dialog" aria-modal="true" aria-label="Navigation"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
            >
              <motion.div className="px-overlay-bg" onClick={() => setDrawer(false)} />
              <motion.div className="px-drawer"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              >
                <div className="px-drawer-top">
                  <Link to="/" className="px-logo" onClick={() => setDrawer(false)}>
                    <div className="px-logo-box">P</div>
                    <span className="px-logo-name">PundX</span>
                  </Link>
                  <button className="px-icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu">
                    <FiX size={15} />
                  </button>
                </div>

                <div className="px-drawer-links">
                  {navLinks.map(([href, label]) => (
                    <a key={href} href={href} className="px-drawer-a" onClick={() => setDrawer(false)}>{label}</a>
                  ))}
                  <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--bd)' }}>
                    <button
                      className="px-btn-ghost"
                      style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                      onClick={() => toggle()}
                    >
                      {dark ? <><FiSun size={14} /> Light mode</> : <><FiMoon size={14} /> Dark mode</>}
                    </button>
                  </div>
                </div>

                <div className="px-drawer-foot">
                  <Link to="/login" onClick={() => setDrawer(false)}>
                    <button className="px-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Sign in</button>
                  </Link>
                  <Link to="/register" onClick={() => setDrawer(false)}>
                    <button className="px-btn-solid" style={{ width: '100%', justifyContent: 'center' }}>Get started</button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ HERO ════ */}
        <section className="px-hero" aria-label="Hero">
          <div className="px-hero-glow" aria-hidden="true" />
          <div className="px-hero-grid" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.35, 1] }}
          >
            <br></br>
            {/* H1 */}
            <h1 className="px-h1">
              Group savings,<br />
              <em>built for everyone</em>
            </h1>

            {/* Sub */}
            <motion.p className="px-hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              PundX helps communities, families, and organizations manage collective savings
              with transparency and automation — no more spreadsheets or manual bookkeeping.
            </motion.p>

            {/* CTAs */}
            <motion.div className="px-hero-ctas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link to="/register" className="px-cta-main" aria-label="Start for free — create a savings group">
                  Start for free
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
                    <FiArrowRight size={15} />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link to="/login" className="px-cta-out">Sign in</Link>
              </motion.div>
            </motion.div>

          </motion.div>
        </section>

        {/* ════ HOW IT WORKS ════ */}
        <section id="how-it-works" className="px-sec" aria-labelledby="hiw-h">
          <div className="px-sec-in">
            <Reveal>
              <div className="px-shd">
                <p className="px-tag">How it works</p>
                <h2 className="px-sh2" id="hiw-h">Up and running in minutes</h2>
                <p className="px-ssub">Three simple steps to digitise your group's savings.</p>
              </div>
            </Reveal>
            <div className="px-steps">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="px-step">
                    <div className="px-step-num">{s.n}</div>
                    <span className="px-step-ico" role="img" aria-label={s.title}>{s.icon}</span>
                    <h3 className="px-step-t">{s.title}</h3>
                    <p className="px-step-d">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════ USE CASES ════ */}
        <section className="px-sec px-bg2" aria-labelledby="uc-h">
          <div className="px-sec-in">
            <Reveal>
              <div className="px-shd">
                <p className="px-tag">Who it's for</p>
                <h2 className="px-sh2" id="uc-h">Perfect for every group</h2>
              </div>
            </Reveal>
            <div className="px-uc-grid">
              {useCases.map((item, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <motion.div className="px-uc" whileHover={{ y: -3 }}>{item}</motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════ FEATURES ════ */}
        <section id="features" className="px-sec" aria-labelledby="feat-h">
          <div className="px-sec-in">
            <Reveal>
              <div className="px-shd">
                <p className="px-tag">Features</p>
                <h2 className="px-sh2" id="feat-h">Everything your group needs</h2>
                <p className="px-ssub">Comprehensive tools built for modern group financial management.</p>
              </div>
            </Reveal>
            <div className="px-feats">
              {features.map((f, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <motion.div className="px-feat" whileHover={{ y: -6 }}>
                    <div className="px-feat-icon" style={{ background: f.color }}>{f.icon}</div>
                    <h3 className="px-feat-t">{f.title}</h3>
                    <p className="px-feat-d">{f.description}</p>
                    <span className="px-feat-chip">{f.chip}</span>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════ FINAL CTA / SECURITY ════ */}
        <section id="security" className="px-cta-sec" aria-labelledby="cta-h">
          <div className="px-cta-glow" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <p className="px-tag px-cta-tag" style={{ justifyContent: 'center' }}>Secure &amp; free to start</p>
            <h2 className="px-cta-h2" id="cta-h">
              Create your first savings group<br />in 60 seconds
            </h2>
            <p className="px-cta-sub">
              No spreadsheets. No manual bookkeeping.<br />
              Bank-grade security built in from day one.
            </p>
            <div className="px-cta-acts">
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link to="/register" className="px-cta-w" aria-label="Create a free savings group">
                  Start for free <FiArrowRight size={14} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link to="/login" className="px-cta-o">Sign in</Link>
              </motion.div>
            </div>
            <div className="px-cta-checks">
              {['No credit card required', 'Free to get started', '256-bit encryption', '24/7 support'].map((c, i) => (
                <div key={i} className="px-cta-check">
                  <FiCheckCircle size={13} style={{ color: '#34d399' }} aria-hidden="true" />
                  {c}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ════ FOOTER ════ */}
        <footer className="px-footer" role="contentinfo">
          <div className="px-footer-in">
            <div className="px-footer-l">
              <span className="px-footer-copy">© 2026 PundX. All rights reserved.</span>
              <span className="px-footer-dot">·</span>
              <span className="px-footer-dev">Developed by <b>S P Darshan</b></span>
            </div>
            <div className="px-socs">
              {socials.map((s, i) => (
                <motion.a key={i} href={s.href} className="px-soc"
                  target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                >
                  <s.icon size={13} />
                </motion.a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;