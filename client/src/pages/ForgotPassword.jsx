// src/pages/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail, FiLock, FiArrowRight, FiArrowLeft,
  FiCheckCircle, FiEye, FiEyeOff, FiSun, FiMoon,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.fp-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 28px 24px;
  position: relative; overflow: hidden;
  transition: background .3s, color .3s;

  --bg:     #f9fafb;
  --bg-3:   #f3f4f6;
  --surf:   #ffffff;
  --t1:     #111827;
  --t2:     #374151;
  --t3:     #6b7280;
  --t4:     #9ca3af;
  --bd:     #e5e7eb;
  --bd-2:   #d1d5db;
  --blue:   #2563eb;
  --blue-d: #1d4ed8;
  --blue-l: #eff6ff;
  --blue-b: #bfdbfe;
  --green:  #16a34a;
  --green-l:#f0fdf4;
  --err:    #dc2626;
  --err-l:  #fef2f2;
  --sh:     0 1px 3px rgba(0,0,0,.08);
  --sh-lg:  0 20px 64px rgba(0,0,0,.10);

  background: var(--bg);
  color: var(--t1);
}
.fp-root.dark {
  --bg:     #0d1117;
  --bg-3:   #21262d;
  --surf:   #161b22;
  --t1:     #f0f6fc;
  --t2:     #c9d1d9;
  --t3:     #8b949e;
  --t4:     #6e7681;
  --bd:     #30363d;
  --bd-2:   #21262d;
  --blue:   #58a6ff;
  --blue-d: #79c0ff;
  --blue-l: rgba(56,139,253,.12);
  --blue-b: rgba(56,139,253,.35);
  --green:  #4ade80;
  --green-l:rgba(74,222,128,.1);
  --err:    #f87171;
  --err-l:  rgba(248,113,113,.1);
  --sh:     0 1px 3px rgba(0,0,0,.5);
  --sh-lg:  0 20px 64px rgba(0,0,0,.55);
}

/* Glow orbs */
.fp-glow-1 {
  position: absolute; top: -160px; left: -120px;
  width: 560px; height: 560px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(37,99,235,.12) 0%, transparent 68%);
  filter: blur(64px);
}
.fp-glow-2 {
  position: absolute; bottom: -140px; right: -100px;
  width: 480px; height: 480px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(109,40,217,.1) 0%, transparent 68%);
  filter: blur(64px);
}
.dark .fp-glow-1 { background: radial-gradient(circle, rgba(88,166,255,.08) 0%, transparent 68%); }
.dark .fp-glow-2 { background: radial-gradient(circle, rgba(167,139,250,.07) 0%, transparent 68%); }

/* Grid */
.fp-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(var(--bd) 1px, transparent 1px),
                    linear-gradient(90deg, var(--bd) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 0%, transparent 100%);
  mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 0%, transparent 100%);
  opacity: .35;
}
.dark .fp-grid { opacity: .16; }

/* Theme toggle */
.fp-theme-btn {
  position: fixed; top: 16px; right: 18px; z-index: 100;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: var(--surf);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3);
  box-shadow: var(--sh); transition: .15s;
}
.fp-theme-btn:hover { border-color: var(--bd-2); color: var(--t1); background: var(--bg-3); }

/* Wrap */
.fp-wrap { width: 100%; max-width: 400px; position: relative; z-index: 1; }

/* Back */
.fp-back {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 500; color: var(--t3);
  text-decoration: none; margin-bottom: 20px; transition: color .12s;
}
.fp-back:hover { color: var(--t1); }

/* Logo */
.fp-logo-row { text-align: center; margin-bottom: 24px; }
.fp-logo { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; }
.fp-logo-box {
  width: 36px; height: 36px; border-radius: 9px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
  box-shadow: 0 3px 12px rgba(37,99,235,.38);
}
.dark .fp-logo-box { box-shadow: 0 3px 12px rgba(88,166,255,.2); }
.fp-logo-name {
  font-size: 18px; font-weight: 800; letter-spacing: -.3px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .fp-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Card */
.fp-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 20px; padding: 36px 32px;
  box-shadow: var(--sh-lg);
}
.fp-hd { text-align: center; margin-bottom: 26px; }
.fp-title { font-size: 22px; font-weight: 800; color: var(--t1); letter-spacing: -.035em; margin-bottom: 6px; }
.fp-sub { font-size: 14px; color: var(--t3); line-height: 1.5; }

/* 3-step tracker */
.fp-tracker { display: flex; align-items: center; margin-bottom: 6px; }
.fp-dot {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  border: 2px solid var(--bd); color: var(--t4); background: var(--bg);
  transition: .22s;
}
.fp-dot.active { border-color: var(--blue); color: var(--blue); background: var(--blue-l); }
.fp-dot.done   { border-color: var(--blue); color: #fff; background: var(--blue); }
.fp-conn { flex: 1; height: 2px; background: var(--bd); transition: background .3s; }
.fp-conn.done { background: var(--blue); }
.fp-tracker-lbls { display: flex; justify-content: space-between; margin-bottom: 26px; }
.fp-tracker-lbl { font-size: 11px; font-weight: 600; letter-spacing: .03em; color: var(--t4); }
.fp-tracker-lbl.active { color: var(--blue); }

/* Field */
.fp-field { margin-bottom: 16px; }
.fp-label { display: block; font-size: 13px; font-weight: 500; color: var(--t2); margin-bottom: 5px; }
.fp-inp-wrap { position: relative; }
.fp-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.fp-input {
  width: 100%; height: 46px; padding: 0 44px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.fp-input::placeholder { color: var(--t4); }
.fp-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.fp-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.fp-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--t4); display: flex; align-items: center; transition: color .12s;
}
.fp-eye:hover { color: var(--t2); }
.fp-err-msg { font-size: 12px; color: var(--err); margin-top: 4px; }

/* Strength */
.fp-strength { display: flex; gap: 4px; margin-top: 6px; }
.fp-bar { flex: 1; height: 3px; border-radius: 3px; background: var(--bd); transition: background .25s; }
.fp-bar.w { background: #ef4444; }
.fp-bar.m { background: #f59e0b; }
.fp-bar.s { background: #22c55e; }
.fp-strength-lbl { font-size: 11px; color: var(--t4); margin-top: 4px; }

/* Primary btn */
.fp-btn {
  width: 100%; height: 46px; margin-top: 20px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14.5px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 18px rgba(37,99,235,.38);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.fp-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 7px 24px rgba(37,99,235,.48); }
.fp-btn:disabled { opacity: .6; cursor: not-allowed; }
.dark .fp-btn { box-shadow: 0 4px 18px rgba(88,166,255,.2); }

/* Ghost btn */
.fp-btn-ghost {
  flex: 1; height: 46px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 14px; font-weight: 500; color: var(--t2);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px;
  cursor: pointer; font-family: inherit; transition: .15s;
}
.fp-btn-ghost:hover { background: var(--bg-3); border-color: var(--bd-2); color: var(--t1); }
.fp-btn-row { display: flex; gap: 10px; margin-top: 20px; }
.fp-btn-inline { flex: 1; margin-top: 0; }

/* Spinner */
.fp-spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
  border-radius: 50%; animation: fp-rot .65s linear infinite;
}
@keyframes fp-rot { to { transform: rotate(360deg); } }

/* OTP icon */
.fp-otp-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--blue);
}
.fp-otp-hint { font-size: 13.5px; color: var(--t3); text-align: center; line-height: 1.6; margin-bottom: 22px; }
.fp-otp-hint b { color: var(--t1); font-weight: 600; }
.fp-otp-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
.fp-otp-cell {
  width: 46px; height: 54px; text-align: center;
  font-size: 22px; font-weight: 700; font-family: inherit;
  color: var(--t1); background: var(--bg);
  border: 1.5px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
  caret-color: var(--blue);
}
.fp-otp-cell:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.fp-otp-cell.filled { border-color: var(--blue); color: var(--blue); }
.fp-resend { text-align: center; margin-bottom: 4px; }
.fp-resend-btn {
  font-size: 13px; font-weight: 500; background: none; border: none;
  cursor: pointer; font-family: inherit; transition: color .12s;
}
.fp-resend-btn:not(:disabled) { color: var(--blue); }
.fp-resend-btn:not(:disabled):hover { color: var(--blue-d); }
.fp-resend-btn:disabled { color: var(--t4); cursor: not-allowed; }

/* Footer */
.fp-foot { text-align: center; margin-top: 22px; }
.fp-foot a {
  font-size: 13px; font-weight: 500; color: var(--blue);
  text-decoration: none; transition: color .12s;
}
.fp-foot a:hover { color: var(--blue-d); }
`;

let _fpIn = false;
const Styles = () => {
  useEffect(() => {
    if (_fpIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _fpIn = true;
  }, []);
  return null;
};

/* Password strength */
const getStrength = (pw) => {
  if (!pw) return { lvl: 0, lbl: '' };
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { lvl: 1, lbl: 'Weak' };
  if (s <= 2) return { lvl: 2, lbl: 'Fair' };
  return { lvl: 3, lbl: 'Strong' };
};
const barCls = (i, lvl) => { if (i >= lvl) return ''; return ['w','m','s'][lvl - 1] || ''; };

const STEPS = ['email', 'otp', 'password'];

/* ═══════════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [step, setStep]         = useState('email');
  const [email, setEmail]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [otp, setOtp]           = useState(['','','','','','']);
  const [newPass, setNewPass]   = useState('');
  const [confPass, setConfPass] = useState('');
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [passErrs, setPassErrs] = useState({});
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(0);

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => setTimer(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }), 1000);
  };

  /* OTP handlers */
  const handleOtpChange = (idx, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val; setOtp(n);
    if (val && idx < 5) document.getElementById(`fpotp-${idx + 1}`)?.focus();
  };
  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      document.getElementById(`fpotp-${idx - 1}`)?.focus();
  };
  const handlePaste = (e) => {
    const d = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (!d.length) return;
    const n = [...otp];
    d.split('').forEach((c, i) => { if (i < 6) n[i] = c; });
    setOtp(n);
    document.getElementById(`fpotp-${Math.min(d.length, 5)}`)?.focus();
    e.preventDefault();
  };

  /* Step 1 */
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Enter a valid email address'); return;
    }
    setEmailErr(''); setLoading(true);
    try {
      await authAPI.forgotPasswordSendOTP(email);
      toast.success('Reset code sent!');
      setStep('otp'); startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally { setLoading(false); }
  };

  /* Step 2 */
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await authAPI.verifyOTP(email, code);
      toast.success('Email verified!');
      setStep('password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    } finally { setLoading(false); }
  };

  /* Step 3 */
  const handleReset = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (newPass.length < 8)   errs.newPass  = 'Minimum 8 characters';
    if (newPass !== confPass)  errs.confPass = 'Passwords do not match';
    setPassErrs(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await authAPI.resetPassword(email, otp.join(''), newPass);
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try { await authAPI.forgotPasswordSendOTP(email); toast.success('Code resent!'); startTimer(); }
    catch { toast.error('Failed to resend'); }
    finally { setLoading(false); }
  };

  const si      = STEPS.indexOf(step);
  const pw      = getStrength(newPass);
  const otpDone = otp.join('').length === 6;

  const TITLES = { email: 'Reset password', otp: 'Verify your email', password: 'Set new password' };
  const SUBS   = {
    email:    'Enter your email to receive a reset code',
    otp:      <span>Code sent to <b style={{ color: 'var(--t1)' }}>{email}</b></span>,
    password: 'Create a strong new password',
  };

  return (
    <>
      <Styles />
      <div className={`fp-root${dark ? ' dark' : ''}`}>

        <div className="fp-glow-1" aria-hidden="true" />
        <div className="fp-glow-2" aria-hidden="true" />
        <div className="fp-grid"   aria-hidden="true" />

        {/* Theme toggle */}
        <button className="fp-theme-btn" onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>

        <motion.div className="fp-wrap"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Back */}
          <Link to="/" className="fp-back">
            <FiArrowLeft size={14} /> Back to home
          </Link>

          {/* Logo */}
          <div className="fp-logo-row">
            <Link to="/" className="fp-logo" aria-label="PundX home">
              <div className="fp-logo-box">P</div>
              <span className="fp-logo-name">PundX</span>
            </Link>
          </div>

          {/* Card */}
          <motion.div className="fp-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 1, 0.35, 1] }}
          >
            {/* Header */}
            <div className="fp-hd">
              <h1 className="fp-title">{TITLES[step]}</h1>
              <p className="fp-sub">{SUBS[step]}</p>
            </div>

            {/* 3-step tracker */}
            <div className="fp-tracker">
              {['1','2','3'].map((n, i) => (
                <React.Fragment key={i}>
                  <div className={`fp-dot ${si === i ? 'active' : si > i ? 'done' : ''}`}>
                    {si > i ? '✓' : n}
                  </div>
                  {i < 2 && <div className={`fp-conn ${si > i ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
            <div className="fp-tracker-lbls">
              <span className={`fp-tracker-lbl ${step === 'email'    ? 'active' : ''}`}>Email</span>
              <span className={`fp-tracker-lbl ${step === 'otp'      ? 'active' : ''}`}>Verify</span>
              <span className={`fp-tracker-lbl ${step === 'password' ? 'active' : ''}`}>Reset</span>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Step 1: Email ── */}
              {step === 'email' && (
                <motion.div key="email"
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
                >
                  <form onSubmit={handleSendOTP} noValidate>
                    <div className="fp-field">
                      <label className="fp-label" htmlFor="fp-email">Email address</label>
                      <div className="fp-inp-wrap">
                        <span className="fp-ico"><FiMail size={15} /></span>
                        <input
                          id="fp-email" type="email" value={email}
                          onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                          placeholder="you@example.com" autoComplete="email"
                          className={`fp-input${emailErr ? ' err' : ''}`}
                          aria-describedby={emailErr ? 'fp-email-err' : undefined}
                        />
                      </div>
                      {emailErr && <p id="fp-email-err" className="fp-err-msg" role="alert">{emailErr}</p>}
                    </div>

                    <motion.button type="submit" className="fp-btn" disabled={loading}
                      whileHover={!loading ? { scale: 1.015 } : {}}
                      whileTap={!loading ? { scale: 0.985 } : {}}>
                      {loading ? <div className="fp-spin" /> : <>Send reset code <FiArrowRight size={15} /></>}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 'otp' && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
                >
                  <div className="fp-otp-icon" aria-hidden="true"><FiMail size={22} /></div>

                  <p className="fp-otp-hint">
                    Enter the 6-digit code sent to<br />
                    <b>{email}</b>
                  </p>

                  <div className="fp-otp-row" onPaste={handlePaste}>
                    {otp.map((d, i) => (
                      <input key={i} id={`fpotp-${i}`} type="text" inputMode="numeric"
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        className={`fp-otp-cell${d ? ' filled' : ''}`}
                        maxLength={1} autoFocus={i === 0}
                        aria-label={`Code digit ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="fp-resend">
                    <button className="fp-resend-btn" onClick={handleResend} disabled={timer > 0 || loading}>
                      {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
                    </button>
                  </div>

                  <div className="fp-btn-row">
                    <button type="button" className="fp-btn-ghost" onClick={() => setStep('email')}>
                      <FiArrowLeft size={14} /> Back
                    </button>
                    <motion.button type="button"
                      className="fp-btn fp-btn-inline"
                      onClick={handleVerifyOTP}
                      disabled={loading || !otpDone}
                      whileHover={!loading && otpDone ? { scale: 1.015 } : {}}
                      whileTap={!loading && otpDone ? { scale: 0.985 } : {}}
                    >
                      {loading ? <div className="fp-spin" /> : 'Verify code'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: New password ── */}
              {step === 'password' && (
                <motion.div key="password"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
                >
                  <form onSubmit={handleReset} noValidate>
                    {/* New password */}
                    <div className="fp-field">
                      <label className="fp-label" htmlFor="fp-newpass">New password</label>
                      <div className="fp-inp-wrap">
                        <span className="fp-ico"><FiLock size={15} /></span>
                        <input id="fp-newpass" type={showNew ? 'text' : 'password'}
                          value={newPass}
                          onChange={e => { setNewPass(e.target.value); setPassErrs(p => ({ ...p, newPass: '' })); }}
                          placeholder="Min. 8 characters" autoComplete="new-password"
                          className={`fp-input${passErrs.newPass ? ' err' : ''}`}
                        />
                        <button type="button" className="fp-eye"
                          onClick={() => setShowNew(s => !s)}
                          aria-label={showNew ? 'Hide password' : 'Show password'}>
                          {showNew ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                      {newPass && (
                        <>
                          <div className="fp-strength">
                            {[0,1,2].map(i => <div key={i} className={`fp-bar ${barCls(i, pw.lvl)}`} />)}
                          </div>
                          <p className="fp-strength-lbl">{pw.lbl}</p>
                        </>
                      )}
                      {passErrs.newPass && <p className="fp-err-msg" role="alert">{passErrs.newPass}</p>}
                    </div>

                    {/* Confirm password */}
                    <div className="fp-field">
                      <label className="fp-label" htmlFor="fp-confpass">Confirm password</label>
                      <div className="fp-inp-wrap">
                        <span className="fp-ico"><FiLock size={15} /></span>
                        <input id="fp-confpass" type={showConf ? 'text' : 'password'}
                          value={confPass}
                          onChange={e => { setConfPass(e.target.value); setPassErrs(p => ({ ...p, confPass: '' })); }}
                          placeholder="Repeat new password" autoComplete="new-password"
                          className={`fp-input${passErrs.confPass ? ' err' : ''}`}
                        />
                        <button type="button" className="fp-eye"
                          onClick={() => setShowConf(s => !s)}
                          aria-label={showConf ? 'Hide password' : 'Show password'}>
                          {showConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                      {passErrs.confPass && <p className="fp-err-msg" role="alert">{passErrs.confPass}</p>}
                    </div>

                    <motion.button type="submit" className="fp-btn" disabled={loading}
                      whileHover={!loading ? { scale: 1.015 } : {}}
                      whileTap={!loading ? { scale: 0.985 } : {}}>
                      {loading
                        ? <div className="fp-spin" />
                        : <>Reset password <FiCheckCircle size={15} /></>
                      }
                    </motion.button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Footer */}
            <div className="fp-foot">
              <Link to="/login">← Back to sign in</Link>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </>
  );
};

export default ForgotPassword;