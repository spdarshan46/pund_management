import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.rp-wrap {
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
  --green:    #059669;
  --green-d:  #047857;
  --green-l:  #ecfdf5;
  --green-b:  #a7f3d0;
  --sh-lg:    0 12px 40px rgba(0,0,0,.10);
}
.pd-root.dark .rp-wrap {
  --bg:       #0d1117;
  --bg-2:     #21262d;
  --surf:     #161b22;
  --t1:       #f0f6fc;
  --t2:       #c9d1d9;
  --t3:       #8b949e;
  --t4:       #6e7681;
  --bd:       #30363d;
  --bd-2:     #21262d;
  --green:    #34d399;
  --green-d:  #6ee7b7;
  --green-l:  rgba(52,211,153,.1);
  --green-b:  rgba(52,211,153,.25);
  --sh-lg:    0 12px 40px rgba(0,0,0,.45);
}

/* ── Card ── */
.rp-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; overflow: hidden; box-shadow: var(--sh-lg);
}

/* ── Banner ── */
.rp-banner {
  background: linear-gradient(135deg, #047857 0%, #059669 55%, #10b981 100%);
  padding: 22px 24px; position: relative; overflow: hidden;
}
.rp-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.rp-banner-row { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.rp-banner-icon {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.rp-banner-title { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin-bottom: 3px; }
.rp-banner-sub   { font-size: 12.5px; color: rgba(255,255,255,.72); }

/* ── Body ── */
.rp-body { padding: 22px; }

/* ── Info box ── */
.rp-info {
  display: flex; align-items: flex-start; gap: 13px;
  padding: 16px; border-radius: 13px; margin-bottom: 22px;
  background: var(--green-l); border: 1px solid var(--green-b);
}
.rp-info-ico { color: var(--green); flex-shrink: 0; margin-top: 1px; }
.rp-info-title {
  font-size: 13.5px; font-weight: 600; color: var(--green); margin-bottom: 10px;
}
.rp-info-title strong { font-weight: 800; }
.rp-info-list { display: flex; flex-direction: column; gap: 6px; }
.rp-info-item {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 12.5px; color: var(--green); opacity: .85; line-height: 1.5;
}
.rp-info-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--green);
  flex-shrink: 0; margin-top: 7px;
}

/* ── Buttons ── */
.rp-btn-row { display: flex; gap: 10px; }
.rp-btn-ghost {
  flex: 1; height: 44px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 14px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.rp-btn-ghost:hover { background: var(--bg-2); color: var(--t1); border-color: var(--bd-2); }
.rp-btn-primary {
  flex: 1; height: 44px; border-radius: 10px; border: none;
  font-size: 14px; font-weight: 600; color: #fff; background: var(--green);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  box-shadow: 0 3px 12px rgba(5,150,105,.35);
  transition: background .15s, transform .15s, box-shadow .15s;
}
.rp-btn-primary:hover:not(:disabled) { background: var(--green-d); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(5,150,105,.45); }
.rp-btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }
.rp-spin {
  width: 17px; height: 17px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: rp-rot .65s linear infinite;
}
@keyframes rp-rot { to { transform: rotate(360deg); } }
`;

let _rpIn = false;
const Styles = () => {
  useEffect(() => {
    if (_rpIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _rpIn = true;
  }, []);
  return null;
};

const INFO_ITEMS = [
  'The pund will be marked as active again',
  'All members will regain access',
  'New cycles can be generated',
  'Existing data and history will be preserved',
];

/* ═══════════════════════════════════════════════════════════ */
const ReopenPundTab = ({ pundName, onReopen, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onReopen();
    setLoading(false);
  };

  return (
    <>
      <Styles />
      <div className="rp-wrap">
        <motion.div className="rp-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
        >
          {/* Banner */}
          <div className="rp-banner">
            <div className="rp-banner-row">
              <div className="rp-banner-icon"><FiRefreshCw size={20} /></div>
              <div>
                <div className="rp-banner-title">Reopen Pund</div>
                <div className="rp-banner-sub">Reactivate the pund and restore member access</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="rp-body">
            {/* Info box */}
            <div className="rp-info">
              <span className="rp-info-ico"><FiCheckCircle size={16} /></span>
              <div>
                <div className="rp-info-title">
                  Reopen <strong>{pundName}</strong>
                </div>
                <div className="rp-info-list">
                  {INFO_ITEMS.map((item, i) => (
                    <div key={i} className="rp-info-item">
                      <span className="rp-info-dot" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="rp-btn-row">
                <button type="button" className="rp-btn-ghost" onClick={onCancel}>
                  <FiArrowLeft size={14} /> Cancel
                </button>
                <motion.button type="submit" className="rp-btn-primary"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.015 } : {}}
                  whileTap={!loading ? { scale: 0.985 } : {}}
                >
                  {loading
                    ? <div className="rp-spin" />
                    : <><FiRefreshCw size={14} /> Reopen Pund</>
                  }
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ReopenPundTab;