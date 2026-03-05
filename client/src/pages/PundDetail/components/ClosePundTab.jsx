// src/pages/PundDetail/components/ClosePundTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiLock, FiX, FiArrowLeft } from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.cl-wrap {
  max-width: 520px;
  margin: 0 auto;

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
  --blue-l:   #eff6ff;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --amber-b:  #fde68a;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --red-b:    #fecaca;
  --err:      #dc2626;
  --err-l:    #fef2f2;
  --sh-lg:    0 12px 40px rgba(0,0,0,.10);
}
.pd-root.dark .cl-wrap {
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
  --blue-l:   rgba(56,139,253,.12);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --amber-b:  rgba(251,191,36,.25);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --red-b:    rgba(248,113,113,.25);
  --err:      #f87171;
  --err-l:    rgba(248,113,113,.1);
  --sh-lg:    0 12px 40px rgba(0,0,0,.45);
}

/* ── Card ── */
.cl-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; overflow: hidden; box-shadow: var(--sh-lg);
}

/* ── Banner ── */
.cl-banner {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 55%, #ef4444 100%);
  padding: 22px 24px; position: relative; overflow: hidden;
}
.cl-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.cl-banner-row { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.cl-banner-icon {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.cl-banner-title { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin-bottom: 3px; }
.cl-banner-sub   { font-size: 12.5px; color: rgba(255,255,255,.72); }

/* ── Body ── */
.cl-body { padding: 22px; }

/* ── Warning box ── */
.cl-warn {
  display: flex; align-items: flex-start; gap: 13px;
  padding: 16px; border-radius: 13px; margin-bottom: 20px;
  background: var(--amber-l); border: 1px solid var(--amber-b);
}
.cl-warn-ico { color: var(--amber); flex-shrink: 0; margin-top: 1px; }
.cl-warn-title {
  font-size: 13.5px; font-weight: 600; color: var(--amber); margin-bottom: 10px;
}
.cl-warn-title strong { font-weight: 800; }
.cl-warn-list { display: flex; flex-direction: column; gap: 6px; }
.cl-warn-item {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 12.5px; color: var(--amber); opacity: .85; line-height: 1.5;
}
.cl-warn-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--amber);
  flex-shrink: 0; margin-top: 7px;
}

/* ── Confirm field ── */
.cl-field { margin-bottom: 20px; }
.cl-label { font-size: 13px; font-weight: 500; color: var(--t2); margin-bottom: 6px; display: block; }
.cl-code {
  display: inline-flex; font-size: 12px; font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 700; color: var(--red); background: var(--red-l);
  border: 1px solid var(--red-b); padding: 2px 8px; border-radius: 6px;
  letter-spacing: .04em;
}
.cl-input {
  width: 100%; height: 44px; padding: 0 14px;
  font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: .08em; color: var(--t1);
  background: var(--bg); border: 1.5px solid var(--bd); border-radius: 10px; outline: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.cl-input::placeholder { color: var(--t4); font-weight: 400; letter-spacing: 0; }
.cl-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px var(--red-l); background: var(--surf); }
.cl-input.ready { border-color: var(--red); color: var(--red); }

/* ── Buttons ── */
.cl-btn-row { display: flex; gap: 10px; }
.cl-btn-ghost {
  flex: 1; height: 44px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 14px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.cl-btn-ghost:hover { background: var(--bg-2); color: var(--t1); border-color: var(--bd-2); }
.cl-btn-danger {
  flex: 1; height: 44px; border-radius: 10px; border: none;
  font-size: 14px; font-weight: 600; color: #fff; background: var(--red);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  box-shadow: 0 3px 12px rgba(220,38,38,.35);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.cl-btn-danger:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,.45); }
.cl-btn-danger:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.cl-spin {
  width: 17px; height: 17px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: cl-rot .65s linear infinite;
}
@keyframes cl-rot { to { transform: rotate(360deg); } }
`;

let _clIn = false;
const Styles = () => {
  useEffect(() => {
    if (_clIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _clIn = true;
  }, []);
  return null;
};

const WARN_ITEMS = [
  'The pund will be marked as inactive',
  'No further cycles can be generated',
  'Loan requests will be paused',
  'You can reopen it anytime from the sidebar',
];

/* ═══════════════════════════════════════════════════════════ */
const ClosePundTab = ({ pundName, onClose, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading,     setLoading]     = useState(false);
  const ready = confirmText === 'CLOSE';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    await onClose();
    setLoading(false);
  };

  return (
    <>
      <Styles />
      <div className="cl-wrap">
        <motion.div className="cl-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Banner */}
          <div className="cl-banner">
            <div className="cl-banner-row">
              <div className="cl-banner-icon"><FiLock size={20} /></div>
              <div>
                <div className="cl-banner-title">Close Pund</div>
                <div className="cl-banner-sub">This action will deactivate the pund</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="cl-body">
            {/* Warning */}
            <div className="cl-warn">
              <span className="cl-warn-ico"><FiAlertTriangle size={16} /></span>
              <div>
                <div className="cl-warn-title">
                  You are about to close <strong>{pundName}</strong>
                </div>
                <div className="cl-warn-list">
                  {WARN_ITEMS.map((item, i) => (
                    <div key={i} className="cl-warn-item">
                      <span className="cl-warn-dot" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="cl-field">
                <label className="cl-label">
                  Type <span className="cl-code">CLOSE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="CLOSE"
                  className={`cl-input${ready ? ' ready' : ''}`}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="cl-btn-row">
                <button type="button" className="cl-btn-ghost" onClick={onCancel}>
                  <FiArrowLeft size={14} /> Cancel
                </button>
                <motion.button type="submit" className="cl-btn-danger"
                  disabled={loading || !ready}
                  whileHover={!loading && ready ? { scale: 1.015 } : {}}
                  whileTap={!loading && ready ? { scale: 0.985 } : {}}
                >
                  {loading ? <div className="cl-spin" /> : <><FiLock size={14} /> Close Pund</>}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ClosePundTab;