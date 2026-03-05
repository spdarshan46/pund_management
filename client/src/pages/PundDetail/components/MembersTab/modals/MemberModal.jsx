// src/pages/PundDetail/components/MembersTab/modals/MemberModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail, FiCalendar, FiPhone, FiX,
  FiCheckCircle, FiXCircle, FiAward, FiCreditCard,
} from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.mm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.mm-panel {
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
  --blue-b:   #bfdbfe;
  --purple:   #7c3aed;
  --purple-l: #f5f3ff;
  --purple-b: #ddd6fe;
  --green:    #059669;
  --green-l:  #ecfdf5;
  --green-b:  #a7f3d0;

  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 20px; width: 100%; max-width: 420px;
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.pd-root.dark .mm-panel {
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
  --blue-b:   rgba(56,139,253,.3);
  --purple:   #a78bfa;
  --purple-l: rgba(139,92,246,.12);
  --purple-b: rgba(139,92,246,.3);
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --green-b:  rgba(52,211,153,.25);
}

/* ── Banner ── */
.mm-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #7c3aed 100%);
  padding: 20px; position: relative; overflow: hidden; flex-shrink: 0;
}
.mm-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 15%, rgba(255,255,255,.13) 0%, transparent 60%);
  pointer-events: none;
}
.mm-banner-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  position: relative; z-index: 1; gap: 12px;
}
.mm-avatar {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  background: rgba(255,255,255,.22); border: 2px solid rgba(255,255,255,.35);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; color: #fff;
  backdrop-filter: blur(8px);
}
.mm-banner-info { flex: 1; min-width: 0; }
.mm-name {
  font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 6px;
}
.mm-badges { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.mm-role-badge {
  font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px;
}
.mm-role-badge.owner  { background: rgba(167,139,250,.35); color: #ede9fe; }
.mm-role-badge.member { background: rgba(147,197,253,.35); color: #dbeafe; }
.mm-active-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: rgba(255,255,255,.85);
}
.mm-close {
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; transition: background .15s;
}
.mm-close:hover { background: rgba(255,255,255,.25); }

/* ── Body ── */
.mm-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }

/* ── Detail row ── */
.mm-detail {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: var(--bg); border: 1px solid var(--bd);
}
.mm-detail-ico {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.mm-detail-ico.blue   { background: var(--blue-l);   color: var(--blue); }
.mm-detail-ico.purple { background: var(--purple-l); color: var(--purple); }
.mm-detail-ico.green  { background: var(--green-l);  color: var(--green); }
.mm-detail-lbl  { font-size: 11.5px; color: var(--t3); font-weight: 500; margin-bottom: 3px; }
.mm-detail-val  { font-size: 13.5px; font-weight: 600; color: var(--t1); word-break: break-all; }

/* ── Stats grid ── */
.mm-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.mm-stat {
  border-radius: 12px; padding: 14px; border: 1px solid var(--bd);
}
.mm-stat.blue   { background: var(--blue-l); }
.mm-stat.green  { background: var(--green-l); }
.mm-stat-ico  { margin-bottom: 8px; }
.mm-stat-lbl  { font-size: 11px; font-weight: 500; margin-bottom: 4px; }
.mm-stat-lbl.blue  { color: var(--blue); }
.mm-stat-lbl.green { color: var(--green); }
.mm-stat-val  { font-size: 16px; font-weight: 800; color: var(--t1); }

/* ── Footer ── */
.mm-footer {
  padding: 13px 18px; border-top: 1px solid var(--bd);
  background: var(--bg); flex-shrink: 0;
}
.mm-footer-btn {
  width: 100%; height: 42px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 14px; font-weight: 500; color: var(--t2); background: var(--surf);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.mm-footer-btn:hover { background: var(--bg-2); color: var(--t1); border-color: var(--bd-2); }
`;

let _mmIn = false;
const Styles = () => {
  useEffect(() => {
    if (_mmIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _mmIn = true;
  }, []);
  return null;
};

const fmtDate = (d) =>
  new Date(d || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ═══════════════════════════════════════════════════════════ */
const MemberModal = ({ isOpen, onClose, member }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!member) return null;

  const initial  = (member.name || member.email || 'U').charAt(0).toUpperCase();
  const isOwner  = member.role === 'OWNER';
  const isActive = member.membership_active;

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="mm-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
          >
            <motion.div className="mm-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="mm-banner">
                <div className="mm-banner-row">
                  <div className="mm-avatar">{initial}</div>
                  <div className="mm-banner-info">
                    <div className="mm-name">{member.name || 'Unknown'}</div>
                    <div className="mm-badges">
                      <span className={`mm-role-badge ${isOwner ? 'owner' : 'member'}`}>
                        {member.role || 'MEMBER'}
                      </span>
                      <span className="mm-active-badge">
                        {isActive
                          ? <><FiCheckCircle size={11} /> Active</>
                          : <><FiXCircle size={11} style={{ opacity: .7 }} /> Inactive</>
                        }
                      </span>
                    </div>
                  </div>
                  <button className="mm-close" onClick={onClose}><FiX size={15} /></button>
                </div>
              </div>

              {/* Body */}
              <div className="mm-body">
                {/* Email */}
                <div className="mm-detail">
                  <div className="mm-detail-ico blue"><FiMail size={15} /></div>
                  <div>
                    <div className="mm-detail-lbl">Email Address</div>
                    <div className="mm-detail-val">{member.email}</div>
                  </div>
                </div>

                {/* Joined */}
                <div className="mm-detail">
                  <div className="mm-detail-ico purple"><FiCalendar size={15} /></div>
                  <div>
                    <div className="mm-detail-lbl">Joined Date</div>
                    <div className="mm-detail-val">{fmtDate(member.joined_at)}</div>
                  </div>
                </div>

                {/* Mobile */}
                {member.mobile && (
                  <div className="mm-detail">
                    <div className="mm-detail-ico green"><FiPhone size={15} /></div>
                    <div>
                      <div className="mm-detail-lbl">Mobile Number</div>
                      <div className="mm-detail-val">{member.mobile}</div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                {(member.total_savings !== undefined || member.active_loans !== undefined) && (
                  <div className="mm-stats">
                    {member.total_savings !== undefined && (
                      <div className="mm-stat blue">
                        <div className="mm-stat-ico" style={{ color: 'var(--blue)' }}><FiAward size={16} /></div>
                        <div className="mm-stat-lbl blue">Total Saved</div>
                        <div className="mm-stat-val">₹{(member.total_savings || 0).toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    {member.active_loans !== undefined && (
                      <div className="mm-stat green">
                        <div className="mm-stat-ico" style={{ color: 'var(--green)' }}><FiCreditCard size={16} /></div>
                        <div className="mm-stat-lbl green">Active Loans</div>
                        <div className="mm-stat-val">{member.active_loans || 0}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mm-footer">
                <button className="mm-footer-btn" onClick={onClose}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MemberModal;