import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail, FiLock, FiUser, FiPhone, FiArrowRight,
  FiArrowLeft, FiEye, FiEyeOff, FiSun, FiMoon,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.rg-root {
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
  --err:    #dc2626;
  --err-l:  #fef2f2;
  --sh:     0 1px 3px rgba(0,0,0,.08);
  --sh-lg:  0 20px 64px rgba(0,0,0,.10);

  background: var(--bg);
  color: var(--t1);
}
.rg-root.dark {
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
  --err:    #f87171;
  --err-l:  rgba(248,113,113,.1);
  --sh:     0 1px 3px rgba(0,0,0,.5);
  --sh-lg:  0 20px 64px rgba(0,0,0,.55);
}

/* Glow orbs */
.rg-glow-1 {
  position: absolute; top: -160px; left: -120px;
  width: 560px; height: 560px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(37,99,235,.12) 0%, transparent 68%);
  filter: blur(64px);
}
.rg-glow-2 {
  position: absolute; bottom: -140px; right: -100px;
  width: 480px; height: 480px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(109,40,217,.1) 0%, transparent 68%);
  filter: blur(64px);
}
.dark .rg-glow-1 { background: radial-gradient(circle, rgba(88,166,255,.08) 0%, transparent 68%); }
.dark .rg-glow-2 { background: radial-gradient(circle, rgba(167,139,250,.07) 0%, transparent 68%); }

/* Grid */
.rg-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(var(--bd) 1px, transparent 1px),
                    linear-gradient(90deg, var(--bd) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 0%, transparent 100%);
  mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 0%, transparent 100%);
  opacity: .35;
}
.dark .rg-grid { opacity: .16; }

/* Theme btn */
.rg-theme-btn {
  position: fixed; top: 16px; right: 18px; z-index: 100;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: var(--surf);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3);
  box-shadow: var(--sh); transition: .15s;
}
.rg-theme-btn:hover { border-color: var(--bd-2); color: var(--t1); background: var(--bg-3); }

/* Wrap */
.rg-wrap { width: 100%; max-width: 420px; position: relative; z-index: 1; }

/* Back */
.rg-back {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 500; color: var(--t3);
  text-decoration: none; margin-bottom: 20px; transition: color .12s;
}
.rg-back:hover { color: var(--t1); }

/* Logo */
.rg-logo-row { text-align: center; margin-bottom: 24px; }
.rg-logo { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; }
.rg-logo-box {
  width: 36px; height: 36px; border-radius: 9px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
  box-shadow: 0 3px 12px rgba(37,99,235,.38);
}
.dark .rg-logo-box { box-shadow: 0 3px 12px rgba(88,166,255,.2); }
.rg-logo-name {
  font-size: 18px; font-weight: 800; letter-spacing: -.3px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .rg-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Card */
.rg-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 20px; padding: 32px 28px;
  box-shadow: var(--sh-lg);
}
.rg-hd { text-align: center; margin-bottom: 24px; }
.rg-title { font-size: 22px; font-weight: 800; color: var(--t1); letter-spacing: -.035em; margin-bottom: 6px; }
.rg-sub { font-size: 14px; color: var(--t3); line-height: 1.5; }

/* Step indicator */
.rg-step-bar { display: flex; align-items: center; margin-bottom: 6px; }
.rg-step-dot {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  border: 2px solid var(--bd); color: var(--t4); background: var(--bg);
  transition: .2s;
}
.rg-step-dot.active { border-color: var(--blue); color: var(--blue); background: var(--blue-l); }
.rg-step-dot.done   { border-color: var(--blue); color: #fff; background: var(--blue); }
.rg-step-conn { flex: 1; height: 2px; background: var(--bd); transition: background .25s; }
.rg-step-conn.done  { background: var(--blue); }
.rg-step-lbls { display: flex; justify-content: space-between; margin-bottom: 22px; }
.rg-step-lbl { font-size: 11px; font-weight: 600; letter-spacing: .03em; color: var(--t4); }
.rg-step-lbl.active { color: var(--blue); }

/* Field */
.rg-field { margin-bottom: 14px; }
.rg-label { display: block; font-size: 13px; font-weight: 500; color: var(--t2); margin-bottom: 5px; }
.rg-inp-wrap { position: relative; }
.rg-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.rg-input {
  width: 100%; height: 44px; padding: 0 42px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.rg-input::placeholder { color: var(--t4); }
.rg-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.rg-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.rg-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--t4); display: flex; align-items: center; transition: color .12s;
}
.rg-eye:hover { color: var(--t2); }
.rg-err-msg { font-size: 12px; color: var(--err); margin-top: 4px; }

/* Strength bars */
.rg-strength { display: flex; gap: 4px; margin-top: 6px; }
.rg-bar { flex: 1; height: 3px; border-radius: 3px; background: var(--bd); transition: background .25s; }
.rg-bar.w { background: #ef4444; }
.rg-bar.m { background: #f59e0b; }
.rg-bar.s { background: #22c55e; }
.rg-strength-lbl { font-size: 11px; color: var(--t4); margin-top: 4px; }

/* Primary button */
.rg-btn {
  width: 100%; height: 46px; margin-top: 18px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14.5px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 18px rgba(37,99,235,.38);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.rg-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 7px 24px rgba(37,99,235,.48); }
.rg-btn:disabled { opacity: .6; cursor: not-allowed; }
.dark .rg-btn { box-shadow: 0 4px 18px rgba(88,166,255,.2); }

/* Ghost button */
.rg-btn-ghost {
  flex: 1; height: 46px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 14px; font-weight: 500; color: var(--t2);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px;
  cursor: pointer; font-family: inherit; transition: .15s;
}
.rg-btn-ghost:hover { background: var(--bg-3); border-color: var(--bd-2); color: var(--t1); }

.rg-btn-row { display: flex; gap: 10px; margin-top: 18px; }
.rg-btn-inline { flex: 1; margin-top: 0; }

/* Spinner */
.rg-spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
  border-radius: 50%; animation: rg-rot .65s linear infinite;
}
@keyframes rg-rot { to { transform: rotate(360deg); } }

/* OTP */
.rg-otp-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--blue);
}
.rg-otp-hint { font-size: 13.5px; color: var(--t3); text-align: center; line-height: 1.6; margin-bottom: 22px; }
.rg-otp-hint b { color: var(--t1); font-weight: 600; }
.rg-otp-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
.rg-otp-cell {
  width: 46px; height: 54px; text-align: center;
  font-size: 22px; font-weight: 700; font-family: inherit;
  color: var(--t1); background: var(--bg);
  border: 1.5px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
  caret-color: var(--blue);
}
.rg-otp-cell:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.rg-otp-cell.filled { border-color: var(--blue); color: var(--blue); }
.rg-resend { text-align: center; margin-bottom: 6px; }
.rg-resend-btn {
  font-size: 13px; font-weight: 500; background: none; border: none;
  cursor: pointer; font-family: inherit; transition: color .12s;
}
.rg-resend-btn:not(:disabled) { color: var(--blue); }
.rg-resend-btn:not(:disabled):hover { color: var(--blue-d); }
.rg-resend-btn:disabled { color: var(--t4); cursor: not-allowed; }

/* Footer */
.rg-foot { text-align: center; margin-top: 20px; font-size: 13px; color: var(--t3); }
.rg-foot a { color: var(--blue); font-weight: 600; text-decoration: none; transition: color .12s; }
.rg-foot a:hover { color: var(--blue-d); }
`;

let _rgIn = false;
const Styles = () => {
  useEffect(() => {
    if (_rgIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _rgIn = true;
  }, []);
  return null;
};

/* Password strength helper */
const strength = (pw) => {
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
const barCls = (i, lvl) => {
  if (i >= lvl) return '';
  return ['w','m','s'][lvl - 1] || '';
};

/* ═══════════════════════════════════════════════════════════ */
const Register = () => {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [step, setStep]       = useState('register');
  const [formData, setFormData] = useState({ name:'', email:'', mobile:'', password:'', confirmPassword:'' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [otp, setOtp]         = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer]     = useState(0);
  const [errors, setErrors]   = useState({});

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleOtpChange = (idx, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val; setOtp(n);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const d = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (!d.length) return;
    const n = [...otp];
    d.split('').forEach((c, i) => { if (i < 6) n[i] = c; });
    setOtp(n);
    document.getElementById(`otp-${Math.min(d.length, 5)}`)?.focus();
    e.preventDefault();
  };

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => setTimer(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }), 1000);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())                                e.name            = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email           = 'Enter a valid email';
    if (!/^\d{10}$/.test(formData.mobile))                   e.mobile          = 'Enter a valid 10-digit mobile';
    if (formData.password.length < 8)                        e.password        = 'Minimum 8 characters';
    if (formData.password !== formData.confirmPassword)      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.sendOTP(formData.email);
      toast.success('Verification code sent!');
      setStep('verify'); startTimer();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send code'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await authAPI.verifyOTP(formData.email, code);
      await authAPI.register({ name: formData.name, email: formData.email, mobile: formData.mobile, password: formData.password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try { await authAPI.sendOTP(formData.email); toast.success('Code resent!'); startTimer(); }
    catch { toast.error('Failed to resend'); }
    finally { setLoading(false); }
  };

  const pw      = strength(formData.password);
  const otpDone = otp.join('').length === 6;

  return (
    <>
      <Styles />
      <div className={`rg-root${dark ? ' dark' : ''}`}>

        <div className="rg-glow-1" aria-hidden="true" />
        <div className="rg-glow-2" aria-hidden="true" />
        <div className="rg-grid"   aria-hidden="true" />

        {/* Theme toggle */}
        <button className="rg-theme-btn" onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>

        <motion.div className="rg-wrap"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Back */}
          <Link to="/" className="rg-back">
            <FiArrowLeft size={14} /> Back to home
          </Link>

          {/* Logo */}
          <div className="rg-logo-row">
            <Link to="/" className="rg-logo" aria-label="PundX home">
              <div className="rg-logo-box">P</div>
              <span className="rg-logo-name">PundX</span>
            </Link>
          </div>

          {/* Card */}
          <motion.div className="rg-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 1, 0.35, 1] }}
          >
            {/* Header */}
            <div className="rg-hd">
              <h1 className="rg-title">
                {step === 'register' ? 'Create account' : 'Verify your email'}
              </h1>
              <p className="rg-sub">
                {step === 'register'
                  ? 'Enter your details to get started'
                  : <span>Code sent to <b style={{ color: 'var(--t1)' }}>{formData.email}</b></span>}
              </p>
            </div>

            {/* Step indicator */}
            <div className="rg-step-bar">
              <div className={`rg-step-dot ${step === 'register' ? 'active' : 'done'}`}>
                {step === 'register' ? '1' : '✓'}
              </div>
              <div className={`rg-step-conn ${step === 'verify' ? 'done' : ''}`} />
              <div className={`rg-step-dot ${step === 'verify' ? 'active' : ''}`}>2</div>
            </div>
            <div className="rg-step-lbls">
              <span className={`rg-step-lbl ${step === 'register' ? 'active' : ''}`}>Details</span>
              <span className={`rg-step-lbl ${step === 'verify' ? 'active' : ''}`}>Verify</span>
            </div>

            <AnimatePresence mode="wait">

              {/* ── Step 1 ── */}
              {step === 'register' && (
                <motion.div key="reg"
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.24, ease: [0.25, 1, 0.35, 1] }}
                >
                  {/* Name */}
                  <div className="rg-field">
                    <label className="rg-label" htmlFor="rg-name">Full name</label>
                    <div className="rg-inp-wrap">
                      <span className="rg-ico"><FiUser size={15} /></span>
                      <input id="rg-name" type="text" name="name" value={formData.name}
                        onChange={handleChange} placeholder="..Darshan" autoComplete="name"
                        className={`rg-input${errors.name ? ' err' : ''}`} />
                    </div>
                    {errors.name && <p className="rg-err-msg" role="alert">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="rg-field">
                    <label className="rg-label" htmlFor="rg-email">Email</label>
                    <div className="rg-inp-wrap">
                      <span className="rg-ico"><FiMail size={15} /></span>
                      <input id="rg-email" type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="your@example.com" autoComplete="email"
                        className={`rg-input${errors.email ? ' err' : ''}`} />
                    </div>
                    {errors.email && <p className="rg-err-msg" role="alert">{errors.email}</p>}
                  </div>

                  {/* Mobile */}
                  <div className="rg-field">
                    <label className="rg-label" htmlFor="rg-mobile">Mobile</label>
                    <div className="rg-inp-wrap">
                      <span className="rg-ico"><FiPhone size={15} /></span>
                      <input id="rg-mobile" type="tel" name="mobile" value={formData.mobile}
                        onChange={handleChange} placeholder="9876543210" maxLength="10" autoComplete="tel"
                        className={`rg-input${errors.mobile ? ' err' : ''}`} />
                    </div>
                    {errors.mobile && <p className="rg-err-msg" role="alert">{errors.mobile}</p>}
                  </div>

                  {/* Password */}
                  <div className="rg-field">
                    <label className="rg-label" htmlFor="rg-pass">Password</label>
                    <div className="rg-inp-wrap">
                      <span className="rg-ico"><FiLock size={15} /></span>
                      <input id="rg-pass" type={showPass ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Min. 8 characters" autoComplete="new-password"
                        className={`rg-input${errors.password ? ' err' : ''}`} />
                      <button type="button" className="rg-eye"
                        onClick={() => setShowPass(s => !s)}
                        aria-label={showPass ? 'Hide password' : 'Show password'}>
                        {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {formData.password && (
                      <>
                        <div className="rg-strength">
                          {[0,1,2].map(i => <div key={i} className={`rg-bar ${barCls(i, pw.lvl)}`} />)}
                        </div>
                        <p className="rg-strength-lbl">{pw.lbl}</p>
                      </>
                    )}
                    {errors.password && <p className="rg-err-msg" role="alert">{errors.password}</p>}
                  </div>

                  {/* Confirm */}
                  <div className="rg-field">
                    <label className="rg-label" htmlFor="rg-conf">Confirm password</label>
                    <div className="rg-inp-wrap">
                      <span className="rg-ico"><FiLock size={15} /></span>
                      <input id="rg-conf" type={showConf ? 'text' : 'password'} name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Repeat password" autoComplete="new-password"
                        className={`rg-input${errors.confirmPassword ? ' err' : ''}`} />
                      <button type="button" className="rg-eye"
                        onClick={() => setShowConf(s => !s)}
                        aria-label={showConf ? 'Hide password' : 'Show password'}>
                        {showConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="rg-err-msg" role="alert">{errors.confirmPassword}</p>}
                  </div>

                  <motion.button type="button" className="rg-btn" onClick={handleSendOTP}
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.015 } : {}}
                    whileTap={!loading ? { scale: 0.985 } : {}}>
                    {loading ? <div className="rg-spin" /> : <>Send verification code <FiArrowRight size={15} /></>}
                  </motion.button>
                </motion.div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 'verify' && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.24, ease: [0.25, 1, 0.35, 1] }}
                >
                  <div className="rg-otp-icon" aria-hidden="true"><FiMail size={22} /></div>

                  <p className="rg-otp-hint">
                    Enter the 6-digit code sent to<br />
                    <b>{formData.email}</b>
                  </p>

                  <div className="rg-otp-row" onPaste={handlePaste}>
                    {otp.map((d, i) => (
                      <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        className={`rg-otp-cell${d ? ' filled' : ''}`}
                        maxLength={1} autoFocus={i === 0}
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="rg-resend">
                    <button className="rg-resend-btn" onClick={handleResend} disabled={timer > 0 || loading}>
                      {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
                    </button>
                  </div>

                  <div className="rg-btn-row">
                    <button type="button" className="rg-btn-ghost" onClick={() => setStep('register')}>
                      <FiArrowLeft size={14} /> Back
                    </button>
                    <motion.button type="button"
                      className="rg-btn rg-btn-inline"
                      onClick={handleVerifyOTP}
                      disabled={loading || !otpDone}
                      whileHover={!loading && otpDone ? { scale: 1.015 } : {}}
                      whileTap={!loading && otpDone ? { scale: 0.985 } : {}}
                    >
                      {loading ? <div className="rg-spin" /> : 'Verify & create account'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Footer */}
            <div className="rg-foot">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </>
  );
};

export default Register;