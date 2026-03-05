// src/pages/PundDetail/components/MembersTab/modals/ReactivateConfirmModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiCheckCircle, FiX } from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.rac-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.rac-panel {
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

  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; width: 100%; max-width: 400px;
  overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.pd-root.dark .rac-panel {
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
}

/* banner */
.rac-banner {
  background: linear-gradient(135deg, #047857, #059669, #10b981);
  padding: 18px 20px; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: space-between;
}
.rac-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.rac-banner-left { display: flex; align-items: center; gap: 11px; position: relative; z-index: 1; }
.rac-banner-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.rac-banner-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.02em; }
.rac-close {
  width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff; position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.rac-close:hover { background: rgba(255,255,255,.25); }

/* body */
.rac-body { padding: 20px; }
.rac-question {
  font-size: 13.5px; color: var(--t2); line-height: 1.6; margin-bottom: 14px;
}
.rac-question strong { color: var(--t1); font-weight: 700; }

/* info note */
.rac-note {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 12px 14px; border-radius: 10px; margin-bottom: 18px;
  background: var(--green-l); border: 1px solid var(--green-b);
  font-size: 12.5px; color: var(--green); line-height: 1.5;
}
.rac-note-ico { flex-shrink: 0; margin-top: 1px; }

/* buttons */
.rac-btn-row { display: flex; gap: 10px; }
.rac-btn-ghost {
  flex: 1; height: 42px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 13.5px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.rac-btn-ghost:hover:not(:disabled) { background: var(--bg-2); color: var(--t1); }
.rac-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }
.rac-btn-primary {
  flex: 1; height: 42px; border-radius: 10px; border: none;
  font-size: 13.5px; font-weight: 600; color: #fff; background: var(--green);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 3px 12px rgba(5,150,105,.3);
  transition: background .15s, transform .15s;
}
.rac-btn-primary:hover:not(:disabled) { background: var(--green-d); transform: translateY(-1px); }
.rac-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.rac-spin {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: rac-rot .65s linear infinite;
}
@keyframes rac-rot { to { transform: rotate(360deg); } }
`;

let _racIn = false;
const Styles = () => {
  useEffect(() => {
    if (_racIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _racIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const ReactivateConfirmModal = ({ isOpen, onClose, member, onConfirm, loading }) => {
  if (!member) return null;

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="rac-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
          >
            <motion.div className="rac-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="rac-banner">
                <div className="rac-banner-left">
                  <div className="rac-banner-icon"><FiRefreshCw size={16} /></div>
                  <span className="rac-banner-title">Reactivate Member</span>
                </div>
                <button className="rac-close" onClick={onClose}><FiX size={15} /></button>
              </div>

              {/* Body */}
              <div className="rac-body">
                <p className="rac-question">
                  Are you sure you want to reactivate <strong>{member.name}</strong>?
                  Their membership will be fully restored.
                </p>

                <div className="rac-note">
                  <span className="rac-note-ico"><FiCheckCircle size={13} /></span>
                  This will restore the member's access to the pund and all its features.
                </div>

                <div className="rac-btn-row">
                  <button className="rac-btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel
                  </button>
                  <motion.button className="rac-btn-primary" onClick={onConfirm} disabled={loading}
                    whileHover={!loading ? { scale: 1.015 } : {}}
                    whileTap={!loading ? { scale: 0.985 } : {}}
                  >
                    {loading ? <div className="rac-spin" /> : <><FiRefreshCw size={13} /> Reactivate</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReactivateConfirmModal;