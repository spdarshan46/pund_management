import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

input[type="password"]::-webkit-textfield-decoration-container {
  display: none !important;
}

.lg-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  position: relative; overflow: hidden;
  transition: background .3s, color .3s;

  --bg:     #f9fafb;
  --bg-2:   #ffffff;
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
.lg-root.dark {
  --bg:     #0d1117;
  --bg-2:   #161b22;
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
.lg-glow-1 {
  position: absolute; top: -160px; left: -120px;
  width: 560px; height: 560px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(37,99,235,.12) 0%, transparent 68%);
  filter: blur(64px);
}
.lg-glow-2 {
  position: absolute; bottom: -140px; right: -100px;
  width: 480px; height: 480px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(109,40,217,.1) 0%, transparent 68%);
  filter: blur(64px);
}
.dark .lg-glow-1 { background: radial-gradient(circle, rgba(88,166,255,.08) 0%, transparent 68%); }
.dark .lg-glow-2 { background: radial-gradient(circle, rgba(167,139,250,.07) 0%, transparent 68%); }

/* Grid */
.lg-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(var(--bd) 1px, transparent 1px),
                    linear-gradient(90deg, var(--bd) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 0%, transparent 100%);
  mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, #000 0%, transparent 100%);
  opacity: .35;
}
.dark .lg-grid { opacity: .16; }

/* Theme toggle fixed */
.lg-theme-btn {
  position: fixed; top: 16px; right: 18px; z-index: 100;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: var(--surf);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3);
  box-shadow: var(--sh); transition: .15s;
}
.lg-theme-btn:hover { border-color: var(--bd-2); color: var(--t1); background: var(--bg-3); }

/* Wrap */
.lg-wrap { width: 100%; max-width: 400px; position: relative; z-index: 1; }

/* Back */
.lg-back {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 500; color: var(--t3);
  text-decoration: none; margin-bottom: 20px; transition: color .12s;
}
.lg-back:hover { color: var(--t1); }

/* Logo */
.lg-logo-row { text-align: center; margin-bottom: 28px; }
.lg-logo {
  display: inline-flex; align-items: center; gap: 9px; text-decoration: none;
}
.lg-logo-box {
  width: 36px; height: 36px; border-radius: 9px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
  box-shadow: 0 3px 12px rgba(37,99,235,.38);
}
.dark .lg-logo-box { box-shadow: 0 3px 12px rgba(88,166,255,.2); }
.lg-logo-name {
  font-size: 18px; font-weight: 800; letter-spacing: -.3px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .lg-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Card */
.lg-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 20px; padding: 36px 32px;
  box-shadow: var(--sh-lg);
}
.lg-hd { text-align: center; margin-bottom: 30px; }
.lg-title {
  font-size: 22px; font-weight: 800; color: var(--t1);
  letter-spacing: -.035em; margin-bottom: 6px;
}
.lg-sub { font-size: 14px; color: var(--t3); line-height: 1.5; }

/* Field */
.lg-field { margin-bottom: 18px; }
.lg-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 6px;
}
.lg-inp-wrap { position: relative; }
.lg-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.lg-input {
  width: 100%; height: 46px; padding: 0 44px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd);
  border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.lg-input::placeholder { color: var(--t4); }
.lg-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.lg-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.lg-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--t4); display: flex; align-items: center; transition: color .12s;
}
.lg-eye:hover { color: var(--t2); }

/* Inline error */
.lg-err { font-size: 12px; color: var(--err); margin-top: 5px; }

/* Forgot */
.lg-forgot-row { display: flex; justify-content: flex-end; margin-top: 6px; }
.lg-forgot { font-size: 12.5px; font-weight: 500; color: var(--blue); text-decoration: none; transition: color .12s; }
.lg-forgot:hover { color: var(--blue-d); }

/* Submit btn */
.lg-btn {
  width: 100%; height: 48px; margin-top: 22px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 15px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 11px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 18px rgba(37,99,235,.38);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.lg-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 7px 24px rgba(37,99,235,.48); }
.lg-btn:disabled { opacity: .6; cursor: not-allowed; }
.dark .lg-btn { box-shadow: 0 4px 18px rgba(88,166,255,.2); }

/* Spinner */
.lg-spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.lg-foot { text-align: center; margin-top: 22px; font-size: 13px; color: var(--t3); }
.lg-foot a { color: var(--blue); font-weight: 600; text-decoration: none; transition: color .12s; }
.lg-foot a:hover { color: var(--blue-d); }
`;

let _lgIn = false;
const Styles = () => {
  useEffect(() => {
    if (_lgIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _lgIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email)                  errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password)               errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authAPI.login(formData.email, formData.password);
      localStorage.setItem('access_token',  response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_name',     formData.email.split('@')[0]);
      localStorage.setItem('user_email',    formData.email);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Styles />
      <div className={`lg-root${dark ? ' dark' : ''}`}>

        {/* bg decor */}
        <div className="lg-glow-1" aria-hidden="true" />
        <div className="lg-glow-2" aria-hidden="true" />
        <div className="lg-grid"   aria-hidden="true" />

        {/* theme toggle */}
        <button className="lg-theme-btn" onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>

        <motion.div className="lg-wrap"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Back */}
          <Link to="/" className="lg-back">
            <FiArrowLeft size={14} /> Back to home
          </Link>

          {/* Logo */}
          <div className="lg-logo-row">
            <Link to="/" className="lg-logo" aria-label="PundX home">
              <div className="lg-logo-box">P</div>
              <span className="lg-logo-name">PundX</span>
            </Link>
          </div>

          {/* Card */}
          <motion.div className="lg-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 1, 0.35, 1] }}
          >
            <div className="lg-hd">
              <h1 className="lg-title">Welcome back</h1>
              <p className="lg-sub">Sign in to your PundX account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-email">Email</label>
                <div className="lg-inp-wrap">
                  <span className="lg-ico"><FiMail size={15} /></span>
                  <input
                    id="lg-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`lg-input${errors.email ? ' err' : ''}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-describedby={errors.email ? 'err-email' : undefined}
                  />
                </div>
                {errors.email && <p id="err-email" className="lg-err" role="alert">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-pass">Password</label>
                <div className="lg-inp-wrap">
                  <span className="lg-ico"><FiLock size={15} /></span>
                  <input
                    id="lg-pass"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`lg-input${errors.password ? ' err' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-describedby={errors.password ? 'err-pass' : undefined}
                  />
                  <button type="button" className="lg-eye"
                    onClick={() => setShowPass(s => !s)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.password && <p id="err-pass" className="lg-err" role="alert">{errors.password}</p>}
              </div>

              {/* Forgot */}
              <div className="lg-forgot-row">
                <Link to="/forgot-password" className="lg-forgot">Forgot password?</Link>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                className="lg-btn"
                disabled={loading}
                whileHover={!loading ? { scale: 1.015 } : {}}
                whileTap={!loading ? { scale: 0.985 } : {}}
              >
                {loading
                  ? <div className="lg-spin" />
                  : <> Sign in <FiArrowRight size={15} /> </>
                }
              </motion.button>
            </form>

            {/* Footer */}
            <div className="lg-foot">
              Don't have an account?{' '}
              <Link to="/register">Create account</Link>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </>
  );
};

export default Login;