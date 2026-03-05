// src/pages/PundDetail/components/MembersTab/modals/AddMemberModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail, FiUser, FiPhone, FiX, FiSend, FiInfo, FiUserPlus,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.am-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.am-panel {
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
  --err:      #dc2626;
  --err-l:    #fef2f2;

  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 20px; width: 100%; max-width: 460px;
  max-height: 90vh; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.pd-root.dark .am-panel {
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
  --err:      #f87171;
  --err-l:    rgba(248,113,113,.1);
}

/* ── Banner ── */
.am-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #7c3aed 100%);
  padding: 18px 20px; position: relative; overflow: hidden; flex-shrink: 0;
}
.am-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.13) 0%, transparent 60%);
  pointer-events: none;
}
.am-banner-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  position: relative; z-index: 1;
}
.am-banner-left  { display: flex; align-items: center; gap: 11px; }
.am-banner-icon  {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.am-banner-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.02em; }
.am-banner-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }
.am-close {
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.am-close:hover { background: rgba(255,255,255,.25); }

/* ── Scrollable body ── */
.am-body {
  flex: 1; overflow-y: auto; padding: 22px;
  display: flex; flex-direction: column; gap: 16px;
}
.am-body::-webkit-scrollbar { width: 5px; }
.am-body::-webkit-scrollbar-track { background: transparent; }
.am-body::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 10px; }

/* ── Section title ── */
.am-section-title {
  font-size: 13px; font-weight: 600; color: var(--t2); margin-bottom: 14px;
}

/* ── Field ── */
.am-field { margin-bottom: 14px; }
.am-field:last-of-type { margin-bottom: 0; }
.am-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 5px;
}
.am-req { color: var(--err); margin-left: 2px; }
.am-inp-wrap { position: relative; }
.am-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none;
}
.am-input {
  width: 100%; height: 44px; padding: 0 14px 0 40px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.am-input::placeholder { color: var(--t4); }
.am-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }

/* ── Info box ── */
.am-info {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 13px 14px; border-radius: 11px;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  font-size: 12.5px; color: var(--blue); line-height: 1.5;
}
.am-info-ico { flex-shrink: 0; margin-top: 1px; }

/* ── Submit button ── */
.am-submit {
  width: 100%; height: 46px; border-radius: 10px; border: none;
  font-size: 14px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  cursor: pointer; font-family: inherit; margin-top: 4px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 3px 12px rgba(37,99,235,.32);
  transition: opacity .15s, transform .15s, box-shadow .15s;
}
.am-submit:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.42); }
.am-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.am-spin {
  width: 17px; height: 17px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: am-rot .65s linear infinite;
}
@keyframes am-rot { to { transform: rotate(360deg); } }
`;

let _amIn = false;
const Styles = () => {
  useEffect(() => {
    if (_amIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _amIn = true;
  }, []);
  return null;
};

/* ── Reusable field ── */
const LABELS = { email: 'Email Address', name: 'Full Name', mobile: 'Mobile Number' };
const Field = ({ icon: Icon, name, ...rest }) => (
  <div className="am-field">
    <label className="am-label" htmlFor={`am-${name}`}>
      {LABELS[name] || name} {rest.required && <span className="am-req">*</span>}
    </label>
    <div className="am-inp-wrap">
      <span className="am-ico"><Icon size={14} /></span>
      <input id={`am-${name}`} name={name} className="am-input" {...rest} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
const AddMemberModal = ({ isOpen, onClose, pundId, pundName, onSuccess }) => {
  const [formData, setFormData] = useState({ email: '', name: '', mobile: '' });
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!isOpen) setFormData({ email: '', name: '', mobile: '' });
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim())              { toast.error('Please enter email address'); return; }
    if (!formData.name.trim())               { toast.error('Please enter member name'); return; }
    if (!formData.mobile.match(/^\d{10}$/)) { toast.error('Please enter a valid 10-digit mobile number'); return; }

    setLoading(true);
    try {
      await api.post(`/punds/${pundId}/add-member/`, formData);
      toast.success('Member added successfully!');
      setFormData({ email: '', name: '', mobile: '' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="am-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
          >
            <motion.div className="am-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="am-banner">
                <div className="am-banner-row">
                  <div className="am-banner-left">
                    <div className="am-banner-icon"><FiUserPlus size={17} /></div>
                    <div>
                      <div className="am-banner-title">Add New Member</div>
                      <div className="am-banner-sub">{pundName}</div>
                    </div>
                  </div>
                  <button className="am-close" onClick={onClose}><FiX size={15} /></button>
                </div>
              </div>

              {/* Body */}
              <div className="am-body">
                <div className="am-section-title">Member Details</div>

                <form onSubmit={handleSubmit} noValidate>
                  <Field icon={FiMail}  name="email"  type="email" value={formData.email}  onChange={handleChange} placeholder="member@example.com"    required />
                  <Field icon={FiUser}  name="name"   type="text"  value={formData.name}   onChange={handleChange} placeholder="Full name of the member" required />
                  <Field icon={FiPhone} name="mobile" type="tel"   value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile number"  maxLength="10" required />

                  {/* Info */}
                  <div className="am-info" style={{ marginTop: 16, marginBottom: 16 }}>
                    <span className="am-info-ico"><FiInfo size={14} /></span>
                    Member will receive an email invitation to join the pund.
                  </div>

                  {/* Submit */}
                  <motion.button type="submit" className="am-submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.012 } : {}}
                    whileTap={!loading ? { scale: 0.988 } : {}}
                  >
                    {loading ? <div className="am-spin" /> : <><FiSend size={15} /> Add Member</>}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddMemberModal;