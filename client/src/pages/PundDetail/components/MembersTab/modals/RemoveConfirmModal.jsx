// src/pages/PundDetail/components/MembersTab/modals/RemoveConfirmModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.rcm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.rcm-panel {
  --bg:       #f3f4f6;
  --bg-2:     #e9eaec;
  --surf:     #ffffff;
  --t1:       #111827;
  --t2:       #374151;
  --t3:       #6b7280;
  --t4:       #9ca3af;
  --bd:       #e5e7eb;
  --bd-2:     #d1d5db;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --amber-b:  #fde68a;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --red-b:    #fecaca;

  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; width: 100%; max-width: 400px;
  overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.pd-root.dark .rcm-panel {
  --bg:       #0d1117;
  --bg-2:     #21262d;
  --surf:     #161b22;
  --t1:       #f0f6fc;
  --t2:       #c9d1d9;
  --t3:       #8b949e;
  --t4:       #6e7681;
  --bd:       #30363d;
  --bd-2:     #21262d;
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --amber-b:  rgba(251,191,36,.25);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --red-b:    rgba(248,113,113,.25);
}

/* banner */
.rcm-banner {
  background: linear-gradient(135deg, #b91c1c, #dc2626, #ef4444);
  padding: 18px 20px; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: space-between;
}
.rcm-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.rcm-banner-left { display: flex; align-items: center; gap: 11px; position: relative; z-index: 1; }
.rcm-banner-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.rcm-banner-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.02em; }
.rcm-close {
  width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff; position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.rcm-close:hover { background: rgba(255,255,255,.25); }

/* body */
.rcm-body { padding: 20px; }
.rcm-question {
  font-size: 13.5px; color: var(--t2); line-height: 1.6; margin-bottom: 14px;
}
.rcm-question strong { color: var(--t1); font-weight: 700; }

/* note */
.rcm-note {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 12px 14px; border-radius: 10px; margin-bottom: 18px;
  background: var(--amber-l); border: 1px solid var(--amber-b);
  font-size: 12.5px; color: var(--amber); line-height: 1.5;
}
.rcm-note-ico { flex-shrink: 0; margin-top: 1px; }

/* buttons */
.rcm-btn-row { display: flex; gap: 10px; }
.rcm-btn-ghost {
  flex: 1; height: 42px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 13.5px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.rcm-btn-ghost:hover:not(:disabled) { background: var(--bg-2); color: var(--t1); }
.rcm-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }
.rcm-btn-danger {
  flex: 1; height: 42px; border-radius: 10px; border: none;
  font-size: 13.5px; font-weight: 600; color: #fff; background: var(--red);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 3px 12px rgba(220,38,38,.3);
  transition: background .15s, transform .15s;
}
.rcm-btn-danger:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
.rcm-btn-danger:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.rcm-spin {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: rcm-rot .65s linear infinite;
}
@keyframes rcm-rot { to { transform: rotate(360deg); } }
`;

let _rcmIn = false;
const Styles = () => {
  useEffect(() => {
    if (_rcmIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _rcmIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const RemoveConfirmModal = ({ isOpen, onClose, member, onConfirm, loading }) => {
  if (!member) return null;

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="rcm-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
          >
            <motion.div className="rcm-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="rcm-banner">
                <div className="rcm-banner-left">
                  <div className="rcm-banner-icon"><FiTrash2 size={16} /></div>
                  <span className="rcm-banner-title">Remove Member</span>
                </div>
                <button className="rcm-close" onClick={onClose}><FiX size={15} /></button>
              </div>

              {/* Body */}
              <div className="rcm-body">
                <p className="rcm-question">
                  Are you sure you want to remove <strong>{member.name}</strong> from this pund?
                  This action will deactivate their membership.
                </p>

                <div className="rcm-note">
                  <span className="rcm-note-ico"><FiAlertTriangle size={13} /></span>
                  Member must have no active loans to be removed.
                </div>

                <div className="rcm-btn-row">
                  <button className="rcm-btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel
                  </button>
                  <motion.button className="rcm-btn-danger" onClick={onConfirm} disabled={loading}
                    whileHover={!loading ? { scale: 1.015 } : {}}
                    whileTap={!loading ? { scale: 0.985 } : {}}
                  >
                    {loading ? <div className="rcm-spin" /> : <><FiTrash2 size={13} /> Remove</>}
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

export default RemoveConfirmModal;