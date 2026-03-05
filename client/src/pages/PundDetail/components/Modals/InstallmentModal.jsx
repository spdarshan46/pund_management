// src/pages/PundDetail/components/Modals/InstallmentModal.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiCheckCircle, FiClock, FiDollarSign,
  FiCalendar, FiUser, FiTrendingUp, FiAlertCircle,
} from 'react-icons/fi';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.im-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}

.im-panel {
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
  width: 100%; max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.pd-root.dark .im-panel {
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
.im-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #7c3aed 100%);
  padding: 18px 20px; position: relative; overflow: hidden; flex-shrink: 0;
}
.im-banner::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.13) 0%, transparent 60%);
  pointer-events: none;
}
.im-banner-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  position: relative; z-index: 1; gap: 10px;
}
.im-banner-left { display: flex; align-items: center; gap: 11px; }
.im-banner-icon {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px);
}
.im-banner-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -.02em; }
.im-banner-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; display: flex; align-items: center; gap: 5px; }
.im-close {
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  background: rgba(255,255,255,.15); color: #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.im-close:hover { background: rgba(255,255,255,.25); }

/* ── Summary bar ── */
.im-summary {
  background: var(--bg); border-bottom: 1px solid var(--bd);
  padding: 12px 18px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.im-summary-left  { display: flex; align-items: center; gap: 10px; }
.im-summary-label { font-size: 12px; color: var(--t3); font-weight: 500; }
.im-prog-track { width: 80px; height: 6px; background: var(--bd-2); border-radius: 100px; overflow: hidden; }
.im-prog-fill  { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #059669, #34d399); transition: width .5s ease; }
.im-summary-count { font-size: 12.5px; font-weight: 700; color: var(--t1); }
.im-summary-right { display: flex; align-items: center; gap: 12px; }
.im-summary-paid  { font-size: 12.5px; font-weight: 700; color: var(--green); }
.im-summary-pen   { font-size: 12px; font-weight: 600; color: var(--amber); }
.im-summary-div   { width: 1px; height: 14px; background: var(--bd); }

/* ── Body (scrollable) ── */
.im-body {
  flex: 1; overflow-y: auto; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.im-body::-webkit-scrollbar { width: 5px; }
.im-body::-webkit-scrollbar-track { background: transparent; }
.im-body::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 10px; }

/* ── Loading / Empty ── */
.im-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 48px 0;
}
.im-spin {
  width: 24px; height: 24px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: im-rot .65s linear infinite;
}
@keyframes im-rot { to { transform: rotate(360deg); } }
.im-loading-txt { font-size: 13px; color: var(--t3); }
.im-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; padding: 48px 0; text-align: center;
}
.im-empty-ico { color: var(--t4); }
.im-empty-txt { font-size: 13px; color: var(--t3); }

/* ── Installment row card ── */
.im-row {
  border: 1px solid var(--bd); border-radius: 12px; padding: 13px 14px;
  transition: box-shadow .15s, border-color .15s;
}
.im-row:hover { box-shadow: 0 3px 10px rgba(0,0,0,.06); border-color: var(--bd-2); }
.im-row.paid     { background: var(--green-l); border-color: var(--green-b); }
.im-row.overdue  { background: var(--red-l);   border-color: var(--red-b); }
.im-row.pending  { background: var(--surf); }

.im-row-top { display: flex; align-items: center; justify-content: space-between; }
.im-row-left { display: flex; align-items: center; gap: 10px; }

.im-status-ico {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.im-status-ico.paid    { background: var(--green-l); color: var(--green); }
.im-status-ico.overdue { background: var(--red-l);   color: var(--red); }
.im-status-ico.pending { background: var(--amber-l); color: var(--amber); }

.im-cycle-num  { font-size: 13px; font-weight: 700; color: var(--t1); margin-bottom: 3px; }
.im-status-badge {
  font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 100px;
  display: inline-flex;
}
.im-status-badge.paid    { background: var(--green-l); color: var(--green); }
.im-status-badge.overdue { background: var(--red-l);   color: var(--red); }
.im-status-badge.pending { background: var(--amber-l); color: var(--amber); }

.im-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.im-total-amt { font-size: 14px; font-weight: 800; color: var(--t1); }
.im-date-row  { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--t4); }

/* Amount detail row */
.im-amounts {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--t3); margin-top: 4px;
}
.im-emi-val     { font-weight: 600; color: var(--t2); }
.im-penalty-val { font-weight: 600; color: var(--red); }

/* Mark paid button */
.im-mark-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; margin-top: 10px; border-top: 1px solid var(--bd);
  padding-top: 10px; width: 100%; justify-content: flex-end;
  background: none; border: none; border-top: 1px solid var(--bd);
  cursor: pointer; font-family: inherit;
}
.im-mark-btn-inner {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 12.5px; font-weight: 600; color: #fff;
  background: var(--green); border-radius: 8px; border: none; cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(5,150,105,.25);
  transition: background .15s, transform .15s;
}
.im-mark-btn-inner:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
.im-mark-btn-inner:disabled { opacity: .55; cursor: not-allowed; }
.im-mark-spin {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: im-rot .65s linear infinite;
}

/* ── Footer ── */
.im-footer {
  padding: 13px 16px; border-top: 1px solid var(--bd);
  background: var(--bg); flex-shrink: 0;
}
.im-footer-btn {
  width: 100%; height: 42px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 14px; font-weight: 500; color: var(--t2); background: var(--surf);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.im-footer-btn:hover { background: var(--bg-2); color: var(--t1); border-color: var(--bd-2); }
`;

let _imIn = false;
const Styles = () => {
  useEffect(() => {
    if (_imIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _imIn = true;
  }, []);
  return null;
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v) => {
  if (v === undefined || v === null) return '₹0';
  return `₹${(parseFloat(v) || 0).toLocaleString('en-IN')}`;
};
const fmtDate = (s) => {
  if (!s) return 'N/A';
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return 'N/A'; }
};
const rowCls = (inst) => {
  if (inst.is_paid) return 'paid';
  if (new Date(inst.due_date) < new Date()) return 'overdue';
  return 'pending';
};

/* ═══════════════════════════════════════════════════════════ */
const InstallmentModal = ({
  isOpen, onClose, installments = [],
  loading = false, onMarkPaid, isOwner = false, markingPaid = false,
}) => {
  const sorted = [...installments].sort((a, b) => (a.cycle_number || 0) - (b.cycle_number || 0));

  const totalEMI     = sorted.reduce((s, i) => s + parseFloat(i.emi_amount || 0), 0);
  const totalPenalty = sorted.reduce((s, i) => s + parseFloat(i.penalty_amount || 0), 0);
  const paidEMI      = sorted.filter(i => i.is_paid).reduce((s, i) => s + parseFloat(i.emi_amount || 0), 0);
  const paidCount    = sorted.filter(i => i.is_paid).length;
  const totalCount   = sorted.length;
  const progress     = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
  const loanInfo     = installments[0] || null;

  return (
    <>
      <Styles />
      <AnimatePresence>
        {isOpen && (
          <motion.div className="im-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} onClick={onClose}
          >
            <motion.div className="im-panel"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.35, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Banner ── */}
              <div className="im-banner">
                <div className="im-banner-row">
                  <div className="im-banner-left">
                    <div className="im-banner-icon"><FiTrendingUp size={18} /></div>
                    <div>
                      <div className="im-banner-title">Installments</div>
                      {loanInfo && (
                        <div className="im-banner-sub">
                          <FiUser size={10} />
                          {loanInfo.member_email?.split('@')[0] || 'Member'}
                          &nbsp;·&nbsp;Loan #{loanInfo.loan_id}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="im-close" onClick={onClose}><FiX size={15} /></button>
                </div>
              </div>

              {/* ── Summary bar ── */}
              {!loading && installments.length > 0 && (
                <div className="im-summary">
                  <div className="im-summary-left">
                    <span className="im-summary-label">Progress</span>
                    <div className="im-prog-track">
                      <div className="im-prog-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="im-summary-count">{paidCount} / {totalCount}</span>
                  </div>
                  <div className="im-summary-right">
                    <span className="im-summary-label">Paid:</span>
                    <span className="im-summary-paid">{fmt(paidEMI)}</span>
                    {totalPenalty > 0 && (
                      <>
                        <div className="im-summary-div" />
                        <span className="im-summary-pen">Penalties: {fmt(totalPenalty)}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Body ── */}
              <div className="im-body">
                {loading ? (
                  <div className="im-loading">
                    <div className="im-spin" />
                    <span className="im-loading-txt">Loading installments…</span>
                  </div>
                ) : installments.length === 0 ? (
                  <div className="im-empty">
                    <FiClock size={28} className="im-empty-ico" />
                    <p className="im-empty-txt">No installments found</p>
                  </div>
                ) : (
                  sorted.map((inst, idx) => {
                    const emi     = parseFloat(inst.emi_amount || 0);
                    const penalty = parseFloat(inst.penalty_amount || 0);
                    const cls     = rowCls(inst);

                    return (
                      <motion.div key={idx} className={`im-row ${cls}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.24 }}
                      >
                        <div className="im-row-top">
                          <div className="im-row-left">
                            <div className={`im-status-ico ${cls}`}>
                              {cls === 'paid'
                                ? <FiCheckCircle size={15} />
                                : cls === 'overdue'
                                  ? <FiAlertCircle size={15} />
                                  : <FiClock size={15} />
                              }
                            </div>
                            <div>
                              <div className="im-cycle-num">Cycle #{inst.cycle_number}</div>
                              <span className={`im-status-badge ${cls}`}>
                                {cls === 'paid' ? 'Paid' : cls === 'overdue' ? 'Overdue' : 'Pending'}
                              </span>
                            </div>
                          </div>

                          <div className="im-row-right">
                            <span className="im-total-amt">{fmt(emi + penalty)}</span>
                            <div className="im-date-row">
                              <FiCalendar size={11} />
                              {fmtDate(inst.due_date)}
                            </div>
                          </div>
                        </div>

                        {/* Amount breakdown */}
                        <div className="im-amounts">
                          <FiDollarSign size={11} />
                          <span>EMI: <span className="im-emi-val">{fmt(emi)}</span></span>
                          {penalty > 0 && (
                            <><span style={{ color:'var(--t4)' }}>+</span>
                            <span>Penalty: <span className="im-penalty-val">{fmt(penalty)}</span></span></>
                          )}
                        </div>

                        {/* Mark paid */}
                        {isOwner && !inst.is_paid && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--bd)', display:'flex', justifyContent:'flex-end' }}>
                            <button className="im-mark-btn-inner"
                              onClick={() => onMarkPaid && onMarkPaid(inst.id)}
                              disabled={markingPaid}
                            >
                              {markingPaid
                                ? <div className="im-mark-spin" />
                                : <FiCheckCircle size={13} />
                              }
                              Mark Paid
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* ── Footer ── */}
              <div className="im-footer">
                <button className="im-footer-btn" onClick={onClose}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallmentModal;