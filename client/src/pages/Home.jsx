// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiCheckCircle, FiUsers, FiLock, FiClock,
  FiShield, FiPieChart, FiMenu, FiX, FiMail, FiLinkedin,
  FiGithub, FiInstagram, FiTrendingUp, FiStar, FiSun, FiMoon
} from 'react-icons/fi';

/* ── inject once ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');

html { scroll-behavior: smooth; }

.hw,
.hw * { box-sizing: border-box; }

.hw {
  --a: #4f46e5;
  --a2: #7c3aed;
  --t1: #0f172a;
  --t2: #475569;
  --t3: #94a3b8;
  --bd: #e2e8f0;
  --bg: #ffffff;
  --bg2: #f8fafc;
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  background: var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
}

.hw.dark {
  --a: #6366f1;
  --a2: #8b5cf6;
  --t1: #f1f5f9;
  --t2: #94a3b8;
  --t3: #64748b;
  --bd: #334155;
  --bg: #0f172a;
  --bg2: #1e293b;
}

/* NAV */
.hw-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  transition: background .25s, box-shadow .25s;
}
.hw-nav.sc {
  background: rgba(255,255,255,.97);
  box-shadow: 0 1px 0 var(--bd);
  backdrop-filter: blur(12px);
}
.dark .hw-nav.sc {
  background: rgba(15,23,42,.97);
}
.hw-nav-row {
  max-width: 1080px; margin: 0 auto;
  padding: 0 24px; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px;
}
.hw-logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; flex-shrink: 0;
}
.hw-logo-mark {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--a), var(--a2));
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #fff;
}
.hw-logo-name {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: var(--t1);
}
.hw-links {
  display: flex; align-items: center; gap: 28px;
}
.hw-link {
  color: var(--t2); font-size: 13px; font-weight: 500;
  text-decoration: none; white-space: nowrap; transition: color .15s;
}
.hw-link:hover { color: var(--t1); }
.hw-auth {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.hw-theme {
  background: none; border: 1px solid var(--bd); border-radius: 8px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t2); transition: .15s;
}
.hw-theme:hover { border-color: #c7d2fe; color: var(--a); }
.hw-btn-out {
  color: var(--t2); font-size: 13px; font-weight: 500;
  background: none; border: 1px solid var(--bd); border-radius: 8px;
  padding: 7px 15px; cursor: pointer; font-family: 'Inter', sans-serif;
  text-decoration: none; display: inline-flex; align-items: center;
  transition: .15s; white-space: nowrap;
}
.hw-btn-out:hover { border-color: #c7d2fe; color: var(--t1); background: var(--bg2); }
.hw-btn-fill {
  color: #fff; font-size: 13px; font-weight: 600;
  background: linear-gradient(135deg, var(--a), var(--a2));
  border: none; border-radius: 8px; padding: 8px 16px;
  cursor: pointer; font-family: 'Inter', sans-serif;
  text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
  box-shadow: 0 2px 10px rgba(79,70,229,.28); transition: .15s; white-space: nowrap;
}
.hw-btn-fill:hover { box-shadow: 0 4px 18px rgba(79,70,229,.42); }
.hw-ham {
  display: none;
  background: none; border: 1px solid var(--bd); border-radius: 8px;
  width: 34px; height: 34px; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t2); flex-shrink: 0;
}

/* MOBILE MENU */
.hw-mob {
  position: fixed; top: 60px; left: 0; right: 0; z-index: 99;
  background: var(--bg); border-bottom: 1px solid var(--bd);
  box-shadow: 0 8px 24px rgba(0,0,0,.07); overflow: hidden;
}
.hw-mob-body { padding: 8px 24px 20px; }
.hw-mob-link {
  display: block; padding: 10px 0; color: var(--t2); font-size: 14px; font-weight: 500;
  text-decoration: none; border-bottom: 1px solid var(--bd); transition: color .15s;
}
.hw-mob-link:hover { color: var(--t1); }
.hw-mob-btns { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.hw-mob-btns .hw-btn-out,
.hw-mob-btns .hw-btn-fill { justify-content: center; }

/* HERO */
.hw-hero {
  padding: 108px 24px 40px;
  background: linear-gradient(180deg, #f5f3ff 0%, var(--bg) 100%);
  text-align: center; position: relative; overflow: hidden;
}
.dark .hw-hero {
  background: linear-gradient(180deg, #1e1b4b 0%, var(--bg) 100%);
}
.hw-hero::before {
  content: '';
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: min(900px, 140%); height: 480px;
  background: radial-gradient(ellipse at top, rgba(99,102,241,.09) 0%, transparent 68%);
  pointer-events: none;
}
.hw-h1 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(30px, 5.5vw, 58px);
  line-height: 1.1; letter-spacing: -.03em;
  color: var(--t1); max-width: 720px; margin: 0 auto 18px;
}
.hw-h1 span {
  background: linear-gradient(135deg, var(--a), var(--a2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hw-hero-p {
  font-size: clamp(14px, 2vw, 17px); color: var(--t2);
  max-width: 520px; margin: 0 auto 36px; line-height: 1.75;
}
.hw-cta-row {
  display: flex; justify-content: center; align-items: center;
  gap: 10px; flex-wrap: wrap;
}
.hw-cta-pri {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 12px 26px; font-size: 14px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, var(--a), var(--a2));
  border: none; border-radius: 10px; cursor: pointer;
  text-decoration: none; font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 16px rgba(79,70,229,.35); transition: .15s;
}
.hw-cta-pri:hover { box-shadow: 0 6px 24px rgba(79,70,229,.48); transform: translateY(-1px); }
.hw-cta-sec {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 26px; font-size: 14px; font-weight: 500; color: var(--t2);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px;
  cursor: pointer; text-decoration: none; font-family: 'Inter', sans-serif; transition: .15s;
}
.hw-cta-sec:hover { border-color: #c7d2fe; color: var(--t1); }

/* DASHBOARD PREVIEW */
.hw-preview {
  margin-top: 60px;
  position: relative;
}
.hw-preview-img {
  width: 100%;
  max-width: 900px;
  border-radius: 16px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  border: 1px solid var(--bd);
}

/* TRUST SECTION */
.hw-trust {
  padding: 40px 24px;
  border-top: 1px solid var(--bd);
  border-bottom: 1px solid var(--bd);
  background: var(--bg2);
}
.hw-trust-inner {
  max-width: 1060px;
  margin: 0 auto;
  text-align: center;
}
.hw-trust-label {
  font-size: 13px;
  color: var(--t3);
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.hw-trust-items {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}
.hw-trust-item {
  font-size: 15px;
  color: var(--t1);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hw-trust-icon {
  color: var(--a);
}

/* SECTIONS */
.hw-sec { padding: 72px 24px; }
.hw-sec-inner { max-width: 1060px; margin: 0 auto; }
.hw-sec-hd { text-align: center; margin-bottom: 44px; }
.hw-sec-h2 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(22px, 3.5vw, 36px); color: var(--t1);
  letter-spacing: -.025em; margin-bottom: 10px;
}
.hw-sec-sub { font-size: 15px; color: var(--t2); max-width: 440px; margin: 0 auto; line-height: 1.7; }

/* HOW IT WORKS */
.hw-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.hw-step {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 16px;
  padding: 26px 22px; transition: .22s;
}
.hw-step:hover {
  border-color: var(--a);
  box-shadow: 0 8px 28px rgba(79,70,229,.09);
  transform: translateY(-5px) scale(1.01);
}
.hw-step-num {
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px;
  color: var(--a); letter-spacing: .05em; margin-bottom: 10px;
}
.hw-step-ico { font-size: 30px; display: block; margin-bottom: 12px; }
.hw-step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--t1); margin-bottom: 7px; }
.hw-step-desc { font-size: 13.5px; color: var(--t2); line-height: 1.68; }

/* USE CASES */
.hw-usecases {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.hw-usecase {
  background: var(--bg2);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--bd);
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  transition: .22s;
  color: var(--t1);
}
.hw-usecase:hover {
  transform: translateY(-3px);
  border-color: var(--a);
  box-shadow: 0 4px 12px rgba(79,70,229,.1);
}

/* FEATURES */
.hw-feats-bg { background: var(--bg2); }
.hw-feats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.hw-feat {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 14px;
  padding: 22px; transition: .22s;
}
.hw-feat:hover {
  border-color: var(--a);
  box-shadow: 0 8px 24px rgba(79,70,229,.09);
  transform: translateY(-5px) scale(1.01);
}
.hw-feat-ico {
  width: 42px; height: 42px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px; color: #fff; flex-shrink: 0;
}
.hw-feat-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--t1); margin-bottom: 7px; }
.hw-feat-desc { font-size: 13px; color: var(--t2); line-height: 1.7; margin-bottom: 12px; }
.hw-feat-badge {
  display: inline-flex; font-size: 10px; font-weight: 600;
  color: var(--a); background: rgba(79,70,229,.08);
  padding: 3px 9px; border-radius: 100px;
}

/* TESTIMONIALS */
.hw-testimonials {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.hw-testimonial {
  background: var(--bg);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--bd);
  transition: .22s;
}
.hw-testimonial:hover {
  border-color: var(--a);
  transform: translateY(-3px);
}
.hw-testimonial-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--t2);
  margin-bottom: 16px;
}
.hw-testimonial-author {
  font-weight: 600;
  font-size: 13px;
  color: var(--t1);
}
.hw-testimonial-role {
  font-size: 12px;
  color: var(--t3);
  margin-top: 4px;
}

/* SECURITY */
.hw-sec-dark { background: var(--t1); }
.dark .hw-sec-dark { background: #020617; }
.hw-sec-dark .hw-sec-h2 { color: #f1f5f9; }
.hw-sec-dark .hw-sec-sub { color: #94a3b8; }
.hw-sec-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px; max-width: 620px; margin: 32px auto 0;
}
.hw-sec-item {
  display: flex; align-items: center; gap: 9px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 10px 13px; transition: .18s;
}
.hw-sec-item:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.14); }

/* FINAL CTA */
.hw-cta-final {
  background: linear-gradient(135deg, var(--a), var(--a2));
  padding: 60px 24px;
}
.hw-cta-final-inner {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.hw-cta-final h2 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
}
.hw-cta-final p {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 32px;
}
.hw-cta-final-btn {
  display: inline-block;
  background: #fff;
  color: var(--a);
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  font-size: 16px;
  transition: .15s;
  box-shadow: 0 8px 20px rgba(0,0,0,.2);
}
.hw-cta-final-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 28px rgba(0,0,0,.3);
}

/* FOOTER */
.hw-footer { border-top: 1px solid var(--bd); padding: 36px 24px; text-align: center; background: var(--bg); }
.hw-soc-row { display: flex; justify-content: center; gap: 10px; margin-bottom: 16px; }
.hw-soc-btn {
  width: 36px; height: 36px; border-radius: 9px;
  background: var(--bg2); border: 1px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  color: var(--t3); text-decoration: none; transition: .18s;
}
.hw-soc-btn:hover { background: rgba(79,70,229,.07); border-color: var(--a); color: var(--a); }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .hw-links, .hw-auth .hw-btn-out, .hw-auth .hw-btn-fill, .hw-theme { display: none !important; }
  .hw-ham { display: flex !important; }
  .hw-steps { grid-template-columns: 1fr 1fr; }
  .hw-feats { grid-template-columns: 1fr 1fr; }
  .hw-usecases { grid-template-columns: 1fr 1fr; }
  .hw-testimonials { grid-template-columns: 1fr; }
  .hw-sec-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px) {
  .hw-hero { padding: 90px 16px 40px; }
  .hw-sec { padding: 52px 16px; }
  .hw-nav-row { padding: 0 16px; }
  .hw-steps { grid-template-columns: 1fr; }
  .hw-feats { grid-template-columns: 1fr; }
  .hw-usecases { grid-template-columns: 1fr; }
  .hw-cta-row { flex-direction: column; align-items: stretch; }
  .hw-cta-pri, .hw-cta-sec { justify-content: center; }
  .hw-trust-items { gap: 24px; flex-direction: column; align-items: center; }
}
`;

let injected = false;
const InjectCSS = () => {
  useEffect(() => {
    if (injected) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    injected = true;
  }, []);
  return null;
};

const FU = ({ children, delay = 0 }) => {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const features = [
    { icon: <FiClock size={18} />, title: '10x Faster Tracking', description: 'Automated savings cycles eliminate manual work', color: 'linear-gradient(135deg,#3b82f6,#06b6d4)', stats: '100% automated' },
    { icon: <FiUsers size={18} />, title: '0% Default Rate', description: 'Smart loan tracking with automated reminders', color: 'linear-gradient(135deg,#8b5cf6,#ec4899)', stats: '99.9% repayment' },
    { icon: <FiShield size={18} />, title: 'EMI Automation', description: 'Automated calculation of EMIs and penalties with instant notifications.', color: 'linear-gradient(135deg,#f97316,#ef4444)', stats: '100% accurate' },
    { icon: <FiPieChart size={18} />, title: 'Live Dashboard', description: 'Instant visibility of savings, loans, and available group funds.', color: 'linear-gradient(135deg,#10b981,#059669)', stats: 'Real-time' },
    { icon: <FiLock size={18} />, title: 'Role-Based Access', description: 'Granular permissions for owners and members with distinct views.', color: 'linear-gradient(135deg,#6366f1,#4f46e5)', stats: 'Secure' },
    { icon: <FiTrendingUp size={18} />, title: 'Audit Reports', description: 'Complete financial audit trail with detailed reports and exports.', color: 'linear-gradient(135deg,#f59e0b,#d97706)', stats: '100% traceable' },
  ];

  const howItWorks = [
    { step: '01', title: 'Create Your Group', description: 'Set up your savings group with custom rules in minutes', icon: '🚀' },
    { step: '02', title: 'Add Members', description: 'Invite members via email or link, define their roles', icon: '👥' },
    { step: '03', title: 'Start Saving', description: 'Begin automated savings with real-time tracking', icon: '💰' },
  ];

  const useCases = [
    '👨‍👩‍👧‍👦 Families',
    '🤝 Community Groups',
    '🏦 Self Help Groups',
    '🔄 Rotating Savings',
    '💼 Small Finance',
    '🌾 Farmer Groups'
  ];

  const testimonials = [
    { text: '"This replaced all our manual bookkeeping. We save 10+ hours every month."', author: 'Priya K', role: 'Community Leader' },
    { text: '"Finally a digital solution for our family savings group. The loan tracking is perfect."', author: 'Rajesh M', role: 'Group Organizer' }
  ];

  const securityItems = ['256-bit encryption', 'JWT authentication', 'Role-based access', 'Audit trails', '2FA support', 'Real-time monitoring'];

  const socials = [
    { icon: FiMail, href: 'mailto:darshan@pundx.com', label: 'Email' },
    { icon: FiLinkedin, href: 'https://linkedin.com/in/spdarshan', label: 'LinkedIn' },
    { icon: FiGithub, href: 'https://github.com/spdarshan', label: 'GitHub' },
    { icon: FiInstagram, href: 'https://instagram.com/spdarshan252', label: 'Instagram' },
  ];

  const navLinks = [
    ['#how-it-works', 'How it works'],
    ['#features', 'Features'],
    ['#security', 'Security']
  ];

  return (
    <>
      <InjectCSS />
      <div className={`hw ${darkMode ? 'dark' : ''}`}>

        {/* ── NAV ── */}
        <nav className={`hw-nav ${scrolled ? 'sc' : ''}`}>
          <div className="hw-nav-row">
            <Link to="/" className="hw-logo">
              <motion.div className="hw-logo-mark" whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}>P</motion.div>
              <span className="hw-logo-name">PundX</span>
            </Link>

            <div className="hw-links">
              {navLinks.map(([href, label]) => (
                <a key={href} href={href} className="hw-link">{label}</a>
              ))}
            </div>

            <div className="hw-auth">
              <button onClick={() => setDarkMode(!darkMode)} className="hw-theme">
                {darkMode ? <FiSun size={14} /> : <FiMoon size={14} />}
              </button>
              <Link to="/login"><button className="hw-btn-out">Sign in</button></Link>
              <Link to="/register">
                <motion.button className="hw-btn-fill" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  Get started <FiArrowRight size={12} />
                </motion.button>
              </Link>
            </div>

            <button className="hw-ham" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={17} /> : <FiMenu size={17} />}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div className="hw-mob"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="hw-mob-body">
                  {navLinks.map(([href, label]) => (
                    <a key={href} href={href} className="hw-mob-link" onClick={() => setMenuOpen(false)}>{label}</a>
                  ))}
                  <div className="hw-mob-btns">
                    <button onClick={() => setDarkMode(!darkMode)} className="hw-btn-out" style={{ width: '100%', justifyContent: 'center' }}>
                      {darkMode ? 'Light mode' : 'Dark mode'}
                    </button>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      <button className="hw-btn-out" style={{ width: '100%' }}>Sign in</button>
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>
                      <button className="hw-btn-fill" style={{ width: '100%', justifyContent: 'center' }}>
                        Get started <FiArrowRight size={12} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* ── HERO ── */}
        <section className="hw-hero">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <h1 className="hw-h1">
              <span>Run Your Savings Group</span>
              <br />
              Like a Digital Bank
            </h1>

            <motion.p className="hw-hero-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              PundX helps communities, families, and organizations manage collective savings
              with transparency and automation. Replace manual bookkeeping with intelligent tools.
            </motion.p>

            <motion.div className="hw-cta-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="hw-cta-pri">
                  Start free trial
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                    <FiArrowRight size={15} />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link to="/login" className="hw-cta-sec">Sign in</Link>
              </motion.div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div 
              className="hw-preview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <img 
                src="/dashboard-preview.png"
                alt="PundX dashboard"
                className="hw-preview-img"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Trust Section */}
        <section className="hw-trust">
          <div className="hw-trust-inner">
            <p className="hw-trust-label">Trusted by savings groups worldwide</p>
            <div className="hw-trust-items">
              <span className="hw-trust-item"><FiLock className="hw-trust-icon" size={14} /> Bank-level security</span>
              <span className="hw-trust-item"><FiClock className="hw-trust-icon" size={14} /> Real-time updates</span>
              <span className="hw-trust-item"><FiPieChart className="hw-trust-icon" size={14} /> 100% transparent</span>
              <span className="hw-trust-item"><FiUsers className="hw-trust-icon" size={14} /> 1000+ members</span>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="hw-sec">
          <div className="hw-sec-inner">
            <FU>
              <div className="hw-sec-hd">
                <h2 className="hw-sec-h2">How It Works</h2>
                <p className="hw-sec-sub">Simple, transparent process for digital savings management</p>
              </div>
            </FU>
            <div className="hw-steps">
              {howItWorks.map((s, i) => (
                <FU key={i} delay={i * 0.1}>
                  <motion.div className="hw-step" whileHover={{ y: -5 }}>
                    <div className="hw-step-num">{s.step}</div>
                    <span className="hw-step-ico">{s.icon}</span>
                    <div className="hw-step-title">{s.title}</div>
                    <div className="hw-step-desc">{s.description}</div>
                  </motion.div>
                </FU>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="hw-sec hw-feats-bg">
          <div className="hw-sec-inner">
            <FU>
              <div className="hw-sec-hd">
                <h2 className="hw-sec-h2">Perfect For</h2>
              </div>
            </FU>
            <div className="hw-usecases">
              {useCases.map((item, i) => (
                <motion.div key={i} className="hw-usecase" whileHover={{ y: -3 }}>
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="hw-sec">
          <div className="hw-sec-inner">
            <FU>
              <div className="hw-sec-hd">
                <h2 className="hw-sec-h2">Everything You Need</h2>
                <p className="hw-sec-sub">Comprehensive tools for modern group financial management</p>
              </div>
            </FU>
            <div className="hw-feats">
              {features.map((f, i) => (
                <FU key={i} delay={i * 0.07}>
                  <motion.div className="hw-feat" whileHover={{ y: -5 }}>
                    <div className="hw-feat-ico" style={{ background: f.color }}>{f.icon}</div>
                    <div className="hw-feat-title">{f.title}</div>
                    <div className="hw-feat-desc">{f.description}</div>
                    <div className="hw-feat-badge">{f.stats}</div>
                  </motion.div>
                </FU>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="hw-sec hw-feats-bg">
          <div className="hw-sec-inner">
            <FU>
              <div className="hw-sec-hd">
                <h2 className="hw-sec-h2">What Groups Say</h2>
              </div>
            </FU>
            <div className="hw-testimonials">
              {testimonials.map((t, i) => (
                <motion.div key={i} className="hw-testimonial" whileHover={{ y: -3 }}>
                  <p className="hw-testimonial-text">{t.text}</p>
                  <div className="hw-testimonial-author">{t.author}</div>
                  <div className="hw-testimonial-role">{t.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section id="security" className="hw-sec hw-sec-dark">
          <div className="hw-sec-inner">
            <FU>
              <div className="hw-sec-hd">
                <h2 className="hw-sec-h2">Bank-Grade Security</h2>
                <p className="hw-sec-sub">Your data is protected with enterprise-level security measures</p>
              </div>
            </FU>
            <div className="hw-sec-grid">
              {securityItems.map((item, i) => (
                <motion.div key={i} className="hw-sec-item"
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <FiCheckCircle size={13} style={{ color: '#34d399', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500 }}>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="hw-cta-final">
          <div className="hw-cta-final-inner">
            <h2>Start Managing Your Savings Group Today</h2>
            <p>Join thousands of groups already using PundX</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="hw-cta-final-btn">
                Create Your Group <FiArrowRight size={16} style={{ marginLeft: 8 }} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="hw-footer">
          <div className="hw-soc-row">
            {socials.map((s, i) => (
              <motion.a key={i} href={s.href} className="hw-soc-btn"
                target="_blank" rel="noopener noreferrer" aria-label={s.label}
                whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
              >
                <s.icon size={14} />
              </motion.a>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 4 }}>
            Developed by <span style={{ fontWeight: 600, color: 'var(--t2)' }}>S P Darshan</span>
          </p>
          <p style={{ fontSize: 11, color: 'var(--t3)' }}>© 2026 PundX. All rights reserved.</p>
        </footer>

      </div>
    </>
  );
};

export default Home;