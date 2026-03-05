// src/pages/dashboard/ChangePassword.jsx
import React, { useState, useEffect } from 'react';
import { FiLock, FiSave, FiEye, FiEyeOff, FiShield, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.cp-wrap {
  max-width: 480px;
  margin: 0 auto;

  --bg:      #f3f4f6;
  --bg-2:    #e9eaec;
  --surf:    #ffffff;
  --t1:      #111827;
  --t2:      #374151;
  --t3:      #6b7280;
  --t4:      #9ca3af;
  --bd:      #e5e7eb;
  --bd-2:    #d1d5db;
  --blue:    #2563eb;
  --blue-d:  #1d4ed8;
  --blue-l:  #eff6ff;
  --blue-b:  #bfdbfe;
  --green:   #059669;
  --green-l: #ecfdf5;
  --err:     #dc2626;
  --err-l:   #fef2f2;
  --sh-lg:   0 12px 40px rgba(0,0,0,.10);
}
.db-root.dark .cp-wrap {
  --bg:      #0d1117;
  --bg-2:    #21262d;
  --surf:    #161b22;
  --t1:      #f0f6fc;
  --t2:      #c9d1d9;
  --t3:      #8b949e;
  --t4:      #6e7681;
  --bd:      #30363d;
  --bd-2:    #21262d;
  --blue:    #58a6ff;
  --blue-d:  #79c0ff;
  --blue-l:  rgba(56,139,253,.12);
  --blue-b:  rgba(56,139,253,.3);
  --green:   #34d399;
  --green-l: rgba(52,211,153,.1);
  --err:     #f87171;
  --err-l:   rgba(248,113,113,.1);
  --sh-lg:   0 12px 40px rgba(0,0,0,.45);
}

/* Card */
.cp-card {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--sh-lg);
}

/* Banner */
.cp-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 60%, #7c3aed 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.cp-banner::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.cp-banner-row {
  display: flex; align-items: center; gap: 14px; position: relative; z-index: 1;
}
.cp-banner-icon {
  width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
  background: rgba(255,255,255,.18);
  border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.cp-banner-title { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin-bottom: 3px; }
.cp-banner-sub   { font-size: 13px; color: rgba(255,255,255,.72); }

/* Body */
.cp-body { padding: 24px; }

/* Field */
.cp-field { margin-bottom: 16px; }
.cp-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 5px;
}
.cp-inp-wrap { position: relative; }
.cp-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.cp-input {
  width: 100%; height: 46px; padding: 0 44px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.cp-input::placeholder { color: var(--t4); }
.cp-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.cp-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.cp-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--t4); display: flex; align-items: center; transition: color .12s;
}
.cp-eye:hover { color: var(--t2); }
.cp-err-msg { font-size: 12px; color: var(--err); margin-top: 4px; }

/* Strength bars */
.cp-strength { display: flex; gap: 4px; margin-top: 7px; }
.cp-bar { flex: 1; height: 3px; border-radius: 3px; background: var(--bd); transition: background .25s; }
.cp-bar.w { background: #ef4444; }
.cp-bar.m { background: #f59e0b; }
.cp-bar.s { background: #22c55e; }
.cp-strength-lbl { font-size: 11px; color: var(--t4); margin-top: 4px; }

/* Rules checklist */
.cp-rules { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.cp-rule {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: var(--t4); transition: color .2s;
}
.cp-rule.ok { color: var(--green); }
.cp-rule-dot {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  transition: border-color .2s, background .2s;
}
.cp-rule.ok .cp-rule-dot {
  border-color: var(--green); background: var(--green-l);
  color: var(--green);
}

/* Divider */
.cp-divider {
  height: 1px; background: var(--bd); margin: 20px 0;
}

/* Submit btn */
.cp-btn {
  width: 100%; height: 46px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14.5px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 16px rgba(37,99,235,.38);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.cp-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 7px 22px rgba(37,99,235,.46); }
.cp-btn:disabled { opacity: .6; cursor: not-allowed; }
.db-root.dark .cp-btn { box-shadow: 0 4px 16px rgba(88,166,255,.2); }

.cp-spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: cp-rot .65s linear infinite;
}
@keyframes cp-rot { to { transform: rotate(360deg); } }

/* Success toast-style banner */
.cp-success {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 14px; border-radius: 10px;
  background: var(--green-l); border: 1px solid var(--green);
  margin-bottom: 18px; font-size: 13px; font-weight: 500; color: var(--green);
}
`;

let _cpIn = false;
const Styles = () => {
  useEffect(() => {
    if (_cpIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _cpIn = true;
  }, []);
  return null;
};

/* ── Password strength ── */
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
const barCls = (i, lvl) => { if (i >= lvl) return ''; return ['w','m','s'][lvl-1] || ''; };

/* ── Password rules ── */
const RULES = [
  { label: 'At least 8 characters',       test: pw => pw.length >= 8 },
  { label: 'One uppercase letter',         test: pw => /[A-Z]/.test(pw) },
  { label: 'One number',                   test: pw => /[0-9]/.test(pw) },
  { label: 'Passwords match',              test: (pw, conf) => pw.length > 0 && pw === conf },
];

/* ═══════════════════════════════════════════════════════════ */
const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: '', new_password: '', confirm_password: '',
  });
  const [show,    setShow]    = useState({ old: false, new: false, conf: false });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
    if (done) setDone(false);
  };
  const toggle = (f) => setShow(p => ({ ...p, [f]: !p[f] }));

  const validate = () => {
    const errs = {};
    if (!formData.old_password)                              errs.old_password     = 'Current password is required';
    if (formData.new_password.length < 8)                   errs.new_password     = 'Minimum 8 characters';
    if (formData.new_password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users/change-password/', {
        current_password: formData.old_password,
        new_password:     formData.new_password,
        confirm_password: formData.confirm_password,
      });
      toast.success('Password changed successfully');
      setFormData({ old_password: '', new_password: '', confirm_password: '' });
      setErrors({});
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const pw   = getStrength(formData.new_password);
  const allOk = RULES.every((r, i) =>
    i < 3 ? r.test(formData.new_password) : r.test(formData.new_password, formData.confirm_password)
  );

  return (
    <>
      <Styles />
      <div className="cp-wrap">
        <motion.div className="cp-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
        >

          {/* ── Banner ── */}
          <div className="cp-banner">
            <div className="cp-banner-row">
              <div className="cp-banner-icon"><FiShield size={22} /></div>
              <div>
                <div className="cp-banner-title">Change Password</div>
                <div className="cp-banner-sub">Keep your account secure with a strong password</div>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="cp-body">

            {/* Success notice */}
            <AnimatePresence>
              {done && (
                <motion.div className="cp-success"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <FiCheck size={16} />
                  Password updated successfully — you're all set!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate>

              {/* Current password */}
              <div className="cp-field">
                <label className="cp-label" htmlFor="cp-old">Current password</label>
                <div className="cp-inp-wrap">
                  <span className="cp-ico"><FiLock size={15} /></span>
                  <input id="cp-old" type={show.old ? 'text' : 'password'}
                    name="old_password" value={formData.old_password}
                    onChange={handleChange} placeholder="Enter current password"
                    autoComplete="current-password"
                    className={`cp-input${errors.old_password ? ' err' : ''}`} />
                  <button type="button" className="cp-eye"
                    onClick={() => toggle('old')}
                    aria-label={show.old ? 'Hide password' : 'Show password'}>
                    {show.old ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.old_password && <p className="cp-err-msg" role="alert">{errors.old_password}</p>}
              </div>

              <div className="cp-divider" />

              {/* New password */}
              <div className="cp-field">
                <label className="cp-label" htmlFor="cp-new">New password</label>
                <div className="cp-inp-wrap">
                  <span className="cp-ico"><FiLock size={15} /></span>
                  <input id="cp-new" type={show.new ? 'text' : 'password'}
                    name="new_password" value={formData.new_password}
                    onChange={handleChange} placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={`cp-input${errors.new_password ? ' err' : ''}`} />
                  <button type="button" className="cp-eye"
                    onClick={() => toggle('new')}
                    aria-label={show.new ? 'Hide password' : 'Show password'}>
                    {show.new ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>

                {/* Strength bars */}
                {formData.new_password && (
                  <>
                    <div className="cp-strength">
                      {[0,1,2].map(i => <div key={i} className={`cp-bar ${barCls(i, pw.lvl)}`} />)}
                    </div>
                    <p className="cp-strength-lbl">{pw.lbl}</p>
                  </>
                )}
                {errors.new_password && <p className="cp-err-msg" role="alert">{errors.new_password}</p>}
              </div>

              {/* Confirm password */}
              <div className="cp-field">
                <label className="cp-label" htmlFor="cp-conf">Confirm new password</label>
                <div className="cp-inp-wrap">
                  <span className="cp-ico"><FiLock size={15} /></span>
                  <input id="cp-conf" type={show.conf ? 'text' : 'password'}
                    name="confirm_password" value={formData.confirm_password}
                    onChange={handleChange} placeholder="Repeat new password"
                    autoComplete="new-password"
                    className={`cp-input${errors.confirm_password ? ' err' : ''}`} />
                  <button type="button" className="cp-eye"
                    onClick={() => toggle('conf')}
                    aria-label={show.conf ? 'Hide password' : 'Show password'}>
                    {show.conf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.confirm_password && <p className="cp-err-msg" role="alert">{errors.confirm_password}</p>}
              </div>

              {/* Rules checklist */}
              {(formData.new_password || formData.confirm_password) && (
                <motion.div className="cp-rules"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {RULES.map((rule, i) => {
                    const ok = i < 3
                      ? rule.test(formData.new_password)
                      : rule.test(formData.new_password, formData.confirm_password);
                    return (
                      <div key={i} className={`cp-rule${ok ? ' ok' : ''}`}>
                        <span className="cp-rule-dot">
                          {ok && <FiCheck size={9} />}
                        </span>
                        {rule.label}
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button type="submit" className="cp-btn"
                disabled={loading}
                style={{ marginTop: 22 }}
                whileHover={!loading ? { scale: 1.015 } : {}}
                whileTap={!loading ? { scale: 0.985 } : {}}
              >
                {loading
                  ? <div className="cp-spin" />
                  : <><FiSave size={15} /> Update password</>
                }
              </motion.button>

            </form>
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default ChangePassword;