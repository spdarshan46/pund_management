import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiX, FiSave, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.em-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.em-panel {
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
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --err:      #dc2626;

  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 20px; width: 100%; max-width: 440px;
  overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.pd-root.dark .em-panel {
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
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --err:      #f87171;
}

/* ── Banner ── */
.em-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #7c3aed 100%);
  padding: 18px 20px; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: space-between;
}
.em-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.13) 0%, transparent 60%);
  pointer-events: none;
}
.em-banner-left { display: flex; align-items: center; gap: 11px; position: relative; z-index: 1; }
.em-banner-icon {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center; color: #fff;
  backdrop-filter: blur(8px);
}
.em-banner-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.02em; position: relative; z-index: 1; }
.em-banner-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }
.em-close {
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff; position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.em-close:hover { background: rgba(255,255,255,.25); }

/* ── Body ── */
.em-body { padding: 20px; }

/* ── Field ── */
.em-field { margin-bottom: 14px; }
.em-field:last-of-type { margin-bottom: 0; }
.em-label {
  display: block; font-size: 13px; font-weight: 500; color: var(--t2); margin-bottom: 6px;
}
.em-req { color: var(--err); margin-left: 2px; }
.em-inp-wrap { position: relative; }
.em-inp-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.em-input {
  width: 100%; height: 44px; padding: 0 14px 0 40px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.em-input::placeholder { color: var(--t4); }
.em-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.em-helper { font-size: 11.5px; color: var(--t4); margin-top: 4px; }

/* ── Buttons ── */
.em-btn-row { display: flex; gap: 10px; margin-top: 18px; }
.em-btn-ghost {
  flex: 1; height: 44px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 14px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.em-btn-ghost:hover { background: var(--bg-2); color: var(--t1); }
.em-btn-save {
  flex: 1; height: 44px; border-radius: 10px; border: none;
  font-size: 14px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  box-shadow: 0 3px 12px rgba(37,99,235,.3);
  transition: opacity .15s, transform .15s, box-shadow .15s;
}
.em-btn-save:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.4); }
.em-btn-save:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.em-spin {
  width: 17px; height: 17px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: em-rot .65s linear infinite;
}
@keyframes em-rot { to { transform: rotate(360deg); } }

/* ── OTP sent state ── */
.em-otp-sent {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 24px 0 8px;
}
.em-otp-ico {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  display: flex; align-items: center; justify-content: center;
  color: var(--blue); margin-bottom: 14px;
}
.em-otp-title { font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 8px; }
.em-otp-sub   { font-size: 13px; color: var(--t3); line-height: 1.6; margin-bottom: 20px; }
.em-otp-close {
  padding: 10px 24px; border-radius: 10px; border: none;
  font-size: 13.5px; font-weight: 600; color: #fff; background: var(--blue);
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.3);
}
`;

let _emIn = false;
const Styles = () => {
  useEffect(() => {
    if (_emIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _emIn = true;
  }, []);
  return null;
};

/* ── Field component ── */
const Field = ({ icon: Icon, name, helper, required, ...rest }) => {
  const labels = { name: 'Full Name', email: 'Email Address', mobile: 'Mobile Number' };
  return (
    <div className="em-field">
      <label className="em-label">
        {labels[name] || name}
        {required && <span className="em-req">*</span>}
      </label>
      <div className="em-inp-wrap">
        <span className="em-inp-ico"><Icon size={14} /></span>
        <input name={name} className="em-input" {...rest} />
      </div>
      {helper && <p className="em-helper">{helper}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
const EditMemberModal = ({ isOpen, onClose, member, pundId, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [loading,  setLoading]  = useState(false);
  const [otpSent,  setOtpSent]  = useState(false);

  useEffect(() => {
    if (member) setFormData({ name: member.name || '', email: member.email || '', mobile: member.mobile || '' });
  }, [member]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Please enter member name'); return; }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) { toast.error('Please enter a valid 10-digit mobile number'); return; }
    const userId = member?.id;
    if (!userId) { toast.error('Invalid member data: missing user ID'); return; }

    setLoading(true);
    try {
      const res = await api.patch(`/punds/${pundId}/edit-member/${userId}/`, {
        name: formData.name,
        email: formData.email !== member.email ? formData.email : undefined,
        mobile: formData.mobile || undefined,
      });
      if (res.data.message === 'OTP sent to new email. Member must verify to complete change.') {
        setOtpSent(true);
        toast.success('OTP sent to new email for verification');
      } else {
        toast.success('Member updated successfully!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update member');
    } finally { setLoading(false); }
  };

  if (!member) return null;

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="em-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
          >
            <motion.div className="em-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="em-banner">
                <div className="em-banner-left">
                  <div className="em-banner-icon"><FiUser size={17} /></div>
                  <div>
                    <div className="em-banner-title">Edit Member</div>
                    <div className="em-banner-sub">{member.name || member.email}</div>
                  </div>
                </div>
                <button className="em-close" onClick={onClose}><FiX size={15} /></button>
              </div>

              {/* Body */}
              <div className="em-body">
                {otpSent ? (
                  <div className="em-otp-sent">
                    <div className="em-otp-ico"><FiCheckCircle size={26} /></div>
                    <div className="em-otp-title">Verification Email Sent</div>
                    <div className="em-otp-sub">
                      An OTP has been sent to the new email address. The member must verify to complete the change.
                    </div>
                    <button className="em-otp-close" onClick={onClose}>Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <Field icon={FiUser}  name="name"   value={formData.name}   onChange={handleChange} required placeholder="Full name" />
                    <Field icon={FiMail}  name="email"  value={formData.email}  onChange={handleChange} type="email" placeholder="Email address" helper="Changing email will require OTP verification" />
                    <Field icon={FiPhone} name="mobile" value={formData.mobile} onChange={handleChange} type="tel" placeholder="10-digit mobile number" maxLength="10" />

                    <div className="em-btn-row">
                      <button type="button" className="em-btn-ghost" onClick={onClose}>Cancel</button>
                      <motion.button type="submit" className="em-btn-save" disabled={loading}
                        whileHover={!loading ? { scale: 1.015 } : {}}
                        whileTap={!loading ? { scale: 0.985 } : {}}
                      >
                        {loading ? <div className="em-spin" /> : <><FiSave size={14} /> Save Changes</>}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditMemberModal;