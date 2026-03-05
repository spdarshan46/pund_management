// src/pages/PundDetail/components/Modals/LoanModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiDollarSign, FiAlertCircle,
  FiCheckCircle, FiCreditCard, FiInfo,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.lm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}

.lm-panel {
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
  --green:    #059669;
  --green-l:  #ecfdf5;
  --green-b:  #a7f3d0;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --amber-b:  #fde68a;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --red-b:    #fecaca;

  background: var(--surf);
  border: 1px solid var(--bd);
  border-radius: 20px;
  width: 100%; max-width: 440px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
}

/* dark mode — panel sits inside .pd-root.dark */
.pd-root.dark .lm-panel {
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
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --green-b:  rgba(52,211,153,.25);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --amber-b:  rgba(251,191,36,.25);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --red-b:    rgba(248,113,113,.25);
}

/* ── Banner ── */
.lm-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #7c3aed 100%);
  padding: 18px 20px; position: relative; overflow: hidden;
}
.lm-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.13) 0%, transparent 60%);
  pointer-events: none;
}
.lm-banner-row {
  display: flex; align-items: center; justify-content: space-between;
  position: relative; z-index: 1;
}
.lm-banner-left { display: flex; align-items: center; gap: 11px; }
.lm-banner-icon {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.lm-banner-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.02em; }
.lm-banner-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }
.lm-close {
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lm-close:hover { background: rgba(255,255,255,.25); }

/* ── Body ── */
.lm-body { padding: 20px; }

/* ── Available fund pill ── */
.lm-avail {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-radius: 12px; margin-bottom: 18px;
  background: var(--blue-l); border: 1px solid var(--blue-b);
}
.lm-avail-left { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--blue); }
.lm-avail-val  { font-size: 15px; font-weight: 800; color: var(--blue); }

/* ── Field ── */
.lm-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--t2); margin-bottom: 6px;
}
.lm-req { color: var(--red); margin-left: 2px; }
.lm-inp-wrap { position: relative; }
.lm-inp-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  font-size: 13px; font-weight: 700; color: var(--t4); pointer-events: none;
}
.lm-input {
  width: 100%; height: 46px; padding: 0 14px 0 38px;
  font-size: 14px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1.5px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
  -moz-appearance: textfield;
}
.lm-input::-webkit-inner-spin-button,
.lm-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.lm-input::placeholder { color: var(--t4); }
.lm-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); background: var(--surf); }
.lm-input.valid { border-color: var(--green); box-shadow: 0 0 0 3px var(--green-l); }
.lm-input.invalid { border-color: var(--red); box-shadow: 0 0 0 3px var(--red-l); }

.lm-feedback {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; margin-top: 5px;
}
.lm-feedback.err   { color: var(--red); }
.lm-feedback.ok    { color: var(--green); }

/* Max btn */
.lm-max-row { display: flex; justify-content: flex-end; margin-top: 6px; }
.lm-max-btn {
  font-size: 12px; color: var(--blue); background: none; border: none;
  cursor: pointer; font-family: inherit; text-decoration: underline;
  transition: color .12s;
}
.lm-max-btn:hover { color: var(--blue-d); }

/* Info box */
.lm-info {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 13px 14px; border-radius: 11px; margin: 16px 0;
  background: var(--amber-l); border: 1px solid var(--amber-b);
  font-size: 12.5px; color: var(--amber); line-height: 1.5;
}
.lm-info-ico { flex-shrink: 0; margin-top: 1px; }

/* ── Buttons ── */
.lm-btn-row { display: flex; gap: 10px; margin-top: 4px; }
.lm-btn-ghost {
  flex: 1; height: 44px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 14px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.lm-btn-ghost:hover { background: var(--bg-2); color: var(--t1); }
.lm-btn-submit {
  flex: 1; height: 44px; border-radius: 10px; border: none;
  font-size: 14px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.32);
  transition: opacity .15s, transform .15s, box-shadow .15s;
}
.lm-btn-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.42); }
.lm-btn-submit:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
`;

let _lmIn = false;
const Styles = () => {
  useEffect(() => {
    if (_lmIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _lmIn = true;
  }, []);
  return null;
};

const fmt = (v) => `₹${(parseFloat(v) || 0).toLocaleString('en-IN')}`;

/* ═══════════════════════════════════════════════════════════ */
const LoanModal = ({ isOpen, onClose, onSubmit, submitting, availableFund = 0 }) => {
  const [amount,  setAmount]  = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) { setAmount(''); setError(''); setSuccess(''); }
  }, [isOpen]);

  const handleChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    const n = parseFloat(val);
    if (!val)                    { setError(''); setSuccess(''); }
    else if (isNaN(n) || n <= 0) { setError('Enter a valid amount greater than 0'); setSuccess(''); }
    else if (n > availableFund)  { setError(`Exceeds available fund by ${fmt(n - availableFund)}`); setSuccess(''); }
    else                         { setError(''); setSuccess(`You can request up to ${fmt(availableFund)}`); }
  };

  const setMax = () => {
    setAmount(availableFund.toString());
    setError('');
    setSuccess(`Maximum amount ${fmt(availableFund)} selected`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0)          { toast.error('Please enter a valid amount'); return; }
    if (n > availableFund)     { toast.error(`Insufficient funds! Available: ${fmt(availableFund)}`); return; }
    onSubmit({ principal_amount: amount });
  };

  const inputCls = () => {
    if (error)             return 'lm-input invalid';
    if (amount && !error)  return 'lm-input valid';
    return 'lm-input';
  };

  const canSubmit = !submitting && !error && !!amount && parseFloat(amount) <= availableFund && parseFloat(amount) > 0;

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="lm-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          >
            <motion.div className="lm-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="lm-banner">
                <div className="lm-banner-row">
                  <div className="lm-banner-left">
                    <div className="lm-banner-icon"><FiCreditCard size={18} /></div>
                    <div>
                      <div className="lm-banner-title">Request Loan</div>
                      <div className="lm-banner-sub">Submit a loan request to the owner</div>
                    </div>
                  </div>
                  <button className="lm-close" onClick={onClose}><FiX size={16} /></button>
                </div>
              </div>

              {/* Body */}
              <div className="lm-body">
                {/* Available fund */}
                <div className="lm-avail">
                  <div className="lm-avail-left"><FiDollarSign size={14} /> Available Fund</div>
                  <span className="lm-avail-val">{fmt(availableFund)}</span>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Amount field */}
                  <label className="lm-label" htmlFor="lm-amount">
                    Loan Amount <span className="lm-req">*</span>
                  </label>
                  <div className="lm-inp-wrap">
                    <span className="lm-inp-ico">₹</span>
                    <input id="lm-amount" type="number"
                      value={amount} onChange={handleChange}
                      placeholder={`Max ${fmt(availableFund)}`}
                      min="1" max={availableFund} step="1"
                      className={inputCls()}
                    />
                  </div>

                  {error   && <div className="lm-feedback err"><FiAlertCircle size={12} />{error}</div>}
                  {success && !error && amount && <div className="lm-feedback ok"><FiCheckCircle size={12} />{success}</div>}

                  {/* Max button */}
                  {availableFund > 0 && (
                    <div className="lm-max-row">
                      <button type="button" className="lm-max-btn" onClick={setMax}>
                        Request maximum amount
                      </button>
                    </div>
                  )}

                  {/* Info */}
                  <div className="lm-info">
                    <span className="lm-info-ico"><FiInfo size={14} /></span>
                    <span>
                      <strong>Note:</strong> Your request will be reviewed by the pund owner.
                      Approval depends on available funds and your repayment capacity.
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="lm-btn-row">
                    <button type="button" className="lm-btn-ghost" onClick={onClose}>Cancel</button>
                    <motion.button type="submit" className="lm-btn-submit"
                      disabled={!canSubmit}
                      whileHover={canSubmit ? { scale: 1.015 } : {}}
                      whileTap={canSubmit ? { scale: 0.985 } : {}}
                    >
                      {submitting ? 'Submitting…' : 'Submit Request'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoanModal;