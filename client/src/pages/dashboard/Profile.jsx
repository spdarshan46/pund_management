// src/pages/dashboard/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  FiUser, FiMail, FiPhone, FiEdit2, FiSave,
  FiX, FiCheckCircle, FiEye, FiEyeOff,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.pf-wrap {
  max-width: 560px;
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
  --err:     #dc2626;
  --err-l:   #fef2f2;
  --sh:      0 1px 3px rgba(0,0,0,.07);
  --sh-lg:   0 12px 40px rgba(0,0,0,.10);
}
.db-root.dark .pf-wrap {
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
  --err:     #f87171;
  --err-l:   rgba(248,113,113,.1);
  --sh:      0 1px 3px rgba(0,0,0,.5);
  --sh-lg:   0 12px 40px rgba(0,0,0,.45);
}

/* ── Card ── */
.pf-card {
  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--sh-lg);
}

/* ── Hero banner ── */
.pf-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 60%, #7c3aed 100%);
  padding: 28px 24px 24px;
  position: relative;
  overflow: hidden;
}
.pf-banner::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.pf-banner-row {
  display: flex; align-items: center; gap: 16px; position: relative; z-index: 1;
}
.pf-avatar {
  width: 60px; height: 60px; border-radius: 16px; flex-shrink: 0;
  background: rgba(255,255,255,.18);
  border: 2px solid rgba(255,255,255,.35);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800; color: #fff;
  backdrop-filter: blur(8px);
}
.pf-banner-name {
  font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin-bottom: 3px;
}
.pf-banner-email { font-size: 13px; color: rgba(255,255,255,.75); }
.pf-edit-btn {
  margin-left: auto; flex-shrink: 0;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 12.5px; font-weight: 600;
  color: #fff; background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 9px; cursor: pointer; font-family: inherit;
  backdrop-filter: blur(8px); transition: .15s;
}
.pf-edit-btn:hover { background: rgba(255,255,255,.28); border-color: rgba(255,255,255,.5); }

/* ── Body ── */
.pf-body { padding: 24px; }

/* ── Info rows (view mode) ── */
.pf-info-row {
  display: flex; align-items: center; gap: 13px;
  padding: 13px 14px; border-radius: 12px;
  background: var(--bg); border: 1px solid var(--bd);
  margin-bottom: 10px;
  transition: background .15s, border-color .15s;
}
.pf-info-row:last-child { margin-bottom: 0; }
.pf-info-ico {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  display: flex; align-items: center; justify-content: center;
  color: var(--blue);
}
.pf-info-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 3px; }
.pf-info-val { font-size: 14px; font-weight: 600; color: var(--t1); }
.pf-empty-val { font-size: 13px; color: var(--t4); font-style: italic; }

/* ── Form (edit mode) ── */
.pf-field { margin-bottom: 15px; }
.pf-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 5px;
}
.pf-inp-wrap { position: relative; }
.pf-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.pf-input {
  width: 100%; height: 44px; padding: 0 42px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.pf-input::placeholder { color: var(--t4); }
.pf-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.pf-input.err { border-color: var(--err); box-shadow: 0 0 0 3px var(--err-l); }
.pf-hint {
  font-size: 11.5px; color: var(--blue); margin-top: 5px;
  display: flex; align-items: center; gap: 5px;
}

/* ── OTP row ── */
.pf-otp-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; color: var(--blue);
}
.pf-otp-hint { font-size: 13.5px; color: var(--t3); text-align: center; line-height: 1.6; margin-bottom: 20px; }
.pf-otp-hint b { color: var(--t1); font-weight: 600; }
.pf-otp-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
.pf-otp-cell {
  width: 44px; height: 52px; text-align: center;
  font-size: 20px; font-weight: 700; font-family: inherit;
  color: var(--t1); background: var(--bg);
  border: 1.5px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s;
  caret-color: var(--blue);
}
.pf-otp-cell:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.pf-otp-cell.filled { border-color: var(--blue); color: var(--blue); }

/* ── Buttons ── */
.pf-btn-row { display: flex; gap: 10px; margin-top: 20px; }
.pf-btn {
  flex: 1; height: 44px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 10px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.35);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.pf-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.45); }
.pf-btn:disabled { opacity: .6; cursor: not-allowed; }
.pf-btn-ghost {
  flex: 1; height: 44px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 14px; font-weight: 500; color: var(--t2);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px;
  cursor: pointer; font-family: inherit; transition: .15s;
}
.pf-btn-ghost:hover { background: var(--bg-2); border-color: var(--bd-2); color: var(--t1); }
.pf-spin {
  width: 17px; height: 17px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: pf-rot .65s linear infinite;
}
@keyframes pf-rot { to { transform: rotate(360deg); } }

/* ── Loading skeleton ── */
.pf-skel-banner {
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  height: 96px; border-radius: 18px 18px 0 0;
  animation: pf-pulse 1.5s ease-in-out infinite;
}
.pf-skel-body { padding: 24px; }
.pf-skel-row {
  height: 62px; border-radius: 12px;
  background: var(--bd); margin-bottom: 10px;
  animation: pf-pulse 1.5s ease-in-out infinite;
}
@keyframes pf-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
`;

let _pfIn = false;
const Styles = () => {
  useEffect(() => {
    if (_pfIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _pfIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const Profile = ({ userName: propName, userEmail: propEmail, onRefresh }) => {
  const { dark } = useTheme();

  const [userName,   setUserName]   = useState(propName  || 'User');
  const [userEmail,  setUserEmail]  = useState(propEmail || '');
  const [userMobile, setUserMobile] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [isEditing,  setIsEditing]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent,    setOtpSent]    = useState(false);
  const [otpCells,   setOtpCells]   = useState(['','','','','','']);
  const [pendingEmail, setPendingEmail] = useState('');
  const [editForm,   setEditForm]   = useState({ name: propName || '', email: propEmail || '', mobile: '' });
  const [errors,     setErrors]     = useState({});

  useEffect(() => { fetchUserDetails(); }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me/');
      const name   = res.data.name   || res.data.username || propName;
      const email  = res.data.email  || propEmail;
      const mobile = res.data.mobile || '';
      setUserName(name); setUserEmail(email); setUserMobile(mobile);
      setEditForm({ name, email, mobile });
      if (res.data.name)  localStorage.setItem('user_name',  res.data.name);
      if (res.data.email) localStorage.setItem('user_email', res.data.email);
    } catch {
      toast.error('Failed to load profile');
    } finally { setLoading(false); }
  };

  const handleEditClick = () => {
    setEditForm({ name: userName, email: userEmail, mobile: userMobile });
    setErrors({}); setIsEditing(true); setOtpSent(false); setOtpCells(['','','','','','']);
  };
  const handleCancel = () => {
    setIsEditing(false); setOtpSent(false); setOtpCells(['','','','','','']);
    setEditForm({ name: userName, email: userEmail, mobile: userMobile });
    setErrors({});
  };
  const handleChange = (e) => {
    setEditForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  /* OTP cell helpers */
  const handleOtpChange = (idx, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const n = [...otpCells]; n[idx] = val; setOtpCells(n);
    if (val && idx < 5) document.getElementById(`pfotp-${idx+1}`)?.focus();
  };
  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otpCells[idx] && idx > 0)
      document.getElementById(`pfotp-${idx-1}`)?.focus();
  };
  const handleOtpPaste = (e) => {
    const d = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (!d.length) return;
    const n = [...otpCells];
    d.split('').forEach((c,i) => { if (i < 6) n[i] = c; });
    setOtpCells(n);
    document.getElementById(`pfotp-${Math.min(d.length,5)}`)?.focus();
    e.preventDefault();
  };
  const otpValue = otpCells.join('');

  /* Submit edit form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.name.trim())                          errs.name   = 'Name cannot be empty';
    if (editForm.mobile && !/^\d{10}$/.test(editForm.mobile)) errs.mobile = 'Enter a valid 10-digit number';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const payload = { name: editForm.name, mobile: editForm.mobile || undefined };
      if (editForm.email !== userEmail) payload.email = editForm.email;
      const res = await api.patch('/users/me/', payload);

      if (res.data.message === 'OTP sent to new email. Verify to complete change.') {
        setPendingEmail(editForm.email);
        setOtpSent(true);
        setOtpCells(['','','','','','']);
        toast.success('OTP sent to new email');
      } else {
        setUserName(editForm.name); setUserEmail(editForm.email); setUserMobile(editForm.mobile);
        localStorage.setItem('user_name',  editForm.name);
        localStorage.setItem('user_email', editForm.email);
        setIsEditing(false);
        toast.success('Profile updated successfully');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally { setSubmitting(false); }
  };

  /* Verify OTP */
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setSubmitting(true);
    try {
      await api.post('/users/verify-email-change/', { otp: otpValue });
      setUserEmail(pendingEmail); setUserName(editForm.name); setUserMobile(editForm.mobile);
      localStorage.setItem('user_name',  editForm.name);
      localStorage.setItem('user_email', pendingEmail);
      setIsEditing(false); setOtpSent(false); setOtpCells(['','','','','','']);
      toast.success('Email updated successfully');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally { setSubmitting(false); }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <>
      <Styles />
      <div className="pf-wrap">
        <div className="pf-card">
          <div className="pf-skel-banner" />
          <div className="pf-skel-body">
            {[0,1,2].map(i => <div key={i} className="pf-skel-row" />)}
          </div>
        </div>
      </div>
    </>
  );

  /* ── Main render ── */
  const initials = userName.charAt(0).toUpperCase();

  return (
    <>
      <Styles />
      <div className="pf-wrap">
        <motion.div className="pf-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
        >

          {/* ── Banner ── */}
          <div className="pf-banner">
            <div className="pf-banner-row">
              <div className="pf-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div className="pf-banner-name">{userName}</div>
                <div className="pf-banner-email">{userEmail}</div>
              </div>
              {!isEditing && (
                <button className="pf-edit-btn" onClick={handleEditClick}>
                  <FiEdit2 size={13} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="pf-body">
            <AnimatePresence mode="wait">

              {/* ── VIEW MODE ── */}
              {!isEditing && (
                <motion.div key="view"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.25, 1, 0.35, 1] }}
                >
                  {[
                    { icon: <FiUser size={15} />, label: 'Full Name',      value: userName },
                    { icon: <FiMail size={15} />, label: 'Email Address',  value: userEmail },
                    { icon: <FiPhone size={15} />, label: 'Mobile Number', value: userMobile || null },
                  ].map((row, i) => (
                    <motion.div key={i} className="pf-info-row"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.28 }}
                    >
                      <div className="pf-info-ico">{row.icon}</div>
                      <div>
                        <div className="pf-info-lbl">{row.label}</div>
                        {row.value
                          ? <div className="pf-info-val">{row.value}</div>
                          : <div className="pf-empty-val">Not provided</div>
                        }
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* ── EDIT FORM ── */}
              {isEditing && !otpSent && (
                <motion.div key="edit"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.25, 1, 0.35, 1] }}
                >
                  <form onSubmit={handleSubmit} noValidate>

                    {/* Name */}
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="pf-name">Full name</label>
                      <div className="pf-inp-wrap">
                        <span className="pf-ico"><FiUser size={15} /></span>
                        <input id="pf-name" type="text" name="name"
                          value={editForm.name} onChange={handleChange}
                          className={`pf-input${errors.name ? ' err' : ''}`}
                          placeholder="Your full name" autoComplete="name" />
                      </div>
                      {errors.name && <p style={{ fontSize: 12, color: 'var(--err)', marginTop: 4 }} role="alert">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="pf-email">Email address</label>
                      <div className="pf-inp-wrap">
                        <span className="pf-ico"><FiMail size={15} /></span>
                        <input id="pf-email" type="email" name="email"
                          value={editForm.email} onChange={handleChange}
                          className="pf-input"
                          placeholder="you@example.com" autoComplete="email" />
                      </div>
                      {editForm.email !== userEmail && (
                        <p className="pf-hint">
                          <FiMail size={11} /> Changing email requires OTP verification
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="pf-field">
                      <label className="pf-label" htmlFor="pf-mobile">Mobile number</label>
                      <div className="pf-inp-wrap">
                        <span className="pf-ico"><FiPhone size={15} /></span>
                        <input id="pf-mobile" type="tel" name="mobile"
                          value={editForm.mobile} onChange={handleChange}
                          maxLength="10" placeholder="10-digit mobile number"
                          className={`pf-input${errors.mobile ? ' err' : ''}`}
                          autoComplete="tel" />
                      </div>
                      {errors.mobile && <p style={{ fontSize: 12, color: 'var(--err)', marginTop: 4 }} role="alert">{errors.mobile}</p>}
                    </div>

                    {/* Actions */}
                    <div className="pf-btn-row">
                      <button type="button" className="pf-btn-ghost" onClick={handleCancel}>
                        <FiX size={14} /> Cancel
                      </button>
                      <motion.button type="submit" className="pf-btn" disabled={submitting}
                        whileHover={!submitting ? { scale: 1.015 } : {}}
                        whileTap={!submitting ? { scale: 0.985 } : {}}>
                        {submitting ? <div className="pf-spin" /> : <><FiSave size={14} /> Save changes</>}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── OTP VERIFY ── */}
              {isEditing && otpSent && (
                <motion.div key="otp"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.25, 1, 0.35, 1] }}
                >
                  <div className="pf-otp-icon" aria-hidden="true"><FiMail size={20} /></div>

                  <p className="pf-otp-hint">
                    Enter the 6-digit code sent to<br />
                    <b>{pendingEmail}</b>
                  </p>

                  <div className="pf-otp-row" onPaste={handleOtpPaste}>
                    {otpCells.map((d, i) => (
                      <input key={i} id={`pfotp-${i}`} type="text" inputMode="numeric"
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        className={`pf-otp-cell${d ? ' filled' : ''}`}
                        maxLength={1} autoFocus={i === 0}
                        aria-label={`Code digit ${i+1}`}
                      />
                    ))}
                  </div>

                  <div className="pf-btn-row">
                    <button type="button" className="pf-btn-ghost"
                      onClick={() => { setOtpSent(false); setOtpCells(['','','','','','']); }}>
                      Back
                    </button>
                    <motion.button type="button" className="pf-btn"
                      onClick={handleVerifyOtp}
                      disabled={submitting || otpValue.length !== 6}
                      whileHover={!submitting && otpValue.length === 6 ? { scale: 1.015 } : {}}
                      whileTap={!submitting && otpValue.length === 6 ? { scale: 0.985 } : {}}
                    >
                      {submitting
                        ? <div className="pf-spin" />
                        : <><FiCheckCircle size={14} /> Verify &amp; save</>
                      }
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default Profile;