import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCreditCard, FiTrendingUp, FiCheckCircle,
  FiClock, FiAlertCircle, FiXCircle,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.ml-wrap {
  max-width: 720px;
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
  --blue-d:   #1d4ed8;
  --blue-l:   #eff6ff;
  --blue-b:   #bfdbfe;
  --purple:   #7c3aed;
  --purple-l: #f5f3ff;
  --green:    #059669;
  --green-l:  #ecfdf5;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --gray-l:   #f3f4f6;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 36px rgba(0,0,0,.09);
}
.db-root.dark .ml-wrap {
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
  --purple:   #a78bfa;
  --purple-l: rgba(139,92,246,.12);
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --gray-l:   rgba(255,255,255,.05);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 36px rgba(0,0,0,.4);
}

/* ── Page heading ── */
.ml-heading {
  font-size: 18px; font-weight: 700; color: var(--t1);
  letter-spacing: -.025em; margin-bottom: 18px;
}

/* ── Loading ── */
.ml-loading {
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 12px;
  padding: 64px 0;
}
.ml-spin {
  width: 32px; height: 32px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: ml-rot .7s linear infinite;
}
@keyframes ml-rot { to { transform: rotate(360deg); } }
.ml-loading-txt { font-size: 13px; color: var(--t3); }

/* ── Empty state ── */
.ml-empty {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 18px;
  padding: 56px 24px; text-align: center; box-shadow: var(--sh);
}
.ml-empty-ico {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--bg-2); border: 1px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--t4);
}
.ml-empty-title { font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 6px; }
.ml-empty-sub   { font-size: 13px; color: var(--t3); }

/* ── Loan card ── */
.ml-card {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 16px;
  padding: 18px; box-shadow: var(--sh); margin-bottom: 12px;
  transition: box-shadow .2s, border-color .2s;
}
.ml-card:last-child { margin-bottom: 0; }
.ml-card:hover { box-shadow: var(--sh-lg); border-color: var(--bd-2); }

/* ── Card header ── */
.ml-card-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.ml-card-hd-left { display: flex; align-items: center; gap: 12px; }
.ml-loan-icon {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,.28);
}
.ml-loan-name { font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.ml-loan-id   { font-size: 11.5px; color: var(--t3); }

/* ── Status badge ── */
.ml-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 600; padding: 4px 11px; border-radius: 100px;
}
.ml-badge-active   { background: var(--green-l);  color: var(--green);  }
.ml-badge-pending  { background: var(--amber-l);  color: var(--amber);  }
.ml-badge-approved { background: var(--blue-l);   color: var(--blue);   }
.ml-badge-closed   { background: var(--gray-l);   color: var(--t3);     }
.ml-badge-rejected { background: var(--red-l);    color: var(--red);    }

/* ── Stat grid ── */
.ml-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  margin-bottom: 16px;
}
.ml-stat {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 11px;
  padding: 12px 14px;
}
.ml-stat-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 4px; }
.ml-stat-val { font-size: 15px; font-weight: 700; color: var(--t1); }
.ml-stat-val.green  { color: var(--green); }
.ml-stat-val.blue   { color: var(--blue);  }
.ml-stat-val.amber  { color: var(--amber); }

/* ── Progress ── */
.ml-progress-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.ml-progress-lbl { font-size: 12px; color: var(--t3); font-weight: 500; }
.ml-progress-pct { font-size: 12px; font-weight: 700; color: var(--t1); }
.ml-track {
  width: 100%; height: 6px; background: var(--bd); border-radius: 100px;
  overflow: hidden; margin-bottom: 14px;
}
.ml-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  transition: width .6s cubic-bezier(.25,1,.35,1);
}
.ml-fill.done { background: linear-gradient(90deg, #059669, #34d399); }

/* ── Footer row ── */
.ml-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 12px; border-top: 1px solid var(--bd); flex-wrap: wrap; gap: 10px;
}
.ml-footer-group { display: flex; align-items: center; gap: 20px; }
.ml-footer-item-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 3px; }
.ml-footer-item-val { font-size: 13px; font-weight: 600; color: var(--t1); }
.ml-footer-item-val.green { color: var(--green); }
.ml-footer-item-val.blue  { color: var(--blue); }
.ml-emi-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 9px;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  font-size: 13px; font-weight: 700; color: var(--blue);
}
.ml-paid-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 9px;
  background: var(--green-l); border: 1px solid var(--green);
  font-size: 12px; font-weight: 600; color: var(--green);
}

/* ── Skeleton ── */
.ml-skel {
  background: var(--surf); border: 1px solid var(--bd); border-radius: 16px;
  padding: 18px; margin-bottom: 12px;
}
.ml-skel-line {
  height: 14px; border-radius: 7px; background: var(--bd);
  animation: ml-pulse 1.5s ease-in-out infinite; margin-bottom: 10px;
}
@keyframes ml-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
`;

let _mlIn = false;
const Styles = () => {
  useEffect(() => {
    if (_mlIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _mlIn = true;
  }, []);
  return null;
};

/* ── Helpers ── */
const calculateEmi = (loan) => {
  if (loan.total_installments > 0) {
    return Math.round((parseFloat(loan.total_payable) || 0) / loan.total_installments);
  }
  return 0;
};

const calculateProgress = (loan) => {
  if (loan.progress > 0) return loan.progress;
  if (loan.total_installments > 0)
    return Math.round((loan.paid_installments / loan.total_installments) * 100);
  const total = parseFloat(loan.total_payable) || 0;
  const paid  = parseFloat(loan.paid_amount)   || 0;
  return total > 0 ? Math.round((paid / total) * 100) : 0;
};

const STATUS_META = {
  active:   { cls: 'ml-badge-active',   icon: <FiTrendingUp  size={11} /> },
  pending:  { cls: 'ml-badge-pending',  icon: <FiClock       size={11} /> },
  approved: { cls: 'ml-badge-approved', icon: <FiCheckCircle size={11} /> },
  closed:   { cls: 'ml-badge-closed',   icon: <FiCheckCircle size={11} /> },
  rejected: { cls: 'ml-badge-rejected', icon: <FiXCircle     size={11} /> },
};

const statusMeta = (s) =>
  STATUS_META[(s || '').toLowerCase()] || { cls: 'ml-badge-closed', icon: <FiAlertCircle size={11} /> };

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

/* ═══════════════════════════════════════════════════════════ */
const MyLoans = () => {
  const [loans,   setLoans]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/finance/my-loans/');
      setLoans(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load loans');
    } finally { setLoading(false); }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Styles />
      <div className="ml-wrap">
        <div className="ml-heading">My Loans</div>
        {[0,1,2].map(i => (
          <div key={i} className="ml-skel">
            <div className="ml-skel-line" style={{ width: '40%' }} />
            <div className="ml-skel-line" style={{ width: '70%' }} />
            <div className="ml-skel-line" style={{ width: '55%' }} />
          </div>
        ))}
      </div>
    </>
  );

  /* ── Empty ── */
  if (loans.length === 0) return (
    <>
      <Styles />
      <div className="ml-wrap">
        <div className="ml-heading">My Loans</div>
        <div className="ml-empty">
          <div className="ml-empty-ico"><FiCreditCard size={22} /></div>
          <div className="ml-empty-title">No loans yet</div>
          <div className="ml-empty-sub">Any loans from your punds will appear here</div>
        </div>
      </div>
    </>
  );

  /* ── Loans list ── */
  return (
    <>
      <Styles />
      <div className="ml-wrap">
        <div className="ml-heading">My Loans</div>

        {loans.map((loan, idx) => {
          const emi              = calculateEmi(loan);
          const progress         = calculateProgress(loan);
          const principal        = parseFloat(loan.principal)     || 0;
          const totalPayable     = parseFloat(loan.total_payable) || 0;
          const paidAmount       = parseFloat(loan.paid_amount)   || 0;
          const remaining        = parseFloat(loan.remaining)     || (totalPayable - paidAmount);
          const paidInst         = loan.paid_installments         || 0;
          const totalInst        = loan.total_installments        || 0;
          const isCompleted      = totalInst > 0 && paidInst >= totalInst;
          const status           = (loan.status || '').toLowerCase();
          const meta             = statusMeta(loan.status);

          return (
            <motion.div key={loan.loan_id} className="ml-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: idx * 0.07, ease: [0.25, 1, 0.35, 1] }}
            >
              {/* Header */}
              <div className="ml-card-hd">
                <div className="ml-card-hd-left">
                  <div className="ml-loan-icon"><FiCreditCard size={17} /></div>
                  <div>
                    <div className="ml-loan-name">{loan.pund || 'Pund Loan'}</div>
                    <div className="ml-loan-id">Loan #{loan.loan_id}</div>
                  </div>
                </div>
                <span className={`ml-badge ${meta.cls}`}>
                  {meta.icon}
                  {loan.status}
                </span>
              </div>

              {/* Stats */}
              <div className="ml-stats">
                <div className="ml-stat">
                  <div className="ml-stat-lbl">Principal</div>
                  <div className="ml-stat-val">₹{fmt(principal)}</div>
                </div>
                <div className="ml-stat">
                  <div className="ml-stat-lbl">Total Payable</div>
                  <div className="ml-stat-val blue">₹{fmt(totalPayable)}</div>
                </div>
                <div className="ml-stat">
                  <div className="ml-stat-lbl">Paid</div>
                  <div className="ml-stat-val green">₹{fmt(paidAmount)}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="ml-progress-row">
                <span className="ml-progress-lbl">Repayment progress</span>
                <span className="ml-progress-pct">{progress}%</span>
              </div>
              <div className="ml-track">
                <div
                  className={`ml-fill${isCompleted ? ' done' : ''}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* Footer */}
              <div className="ml-footer">
                <div className="ml-footer-group">
                  <div>
                    <div className="ml-footer-item-lbl">Installments</div>
                    <div className="ml-footer-item-val">
                      {paidInst} / {totalInst}
                      {isCompleted && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="ml-footer-item-lbl">Remaining</div>
                    <div className="ml-footer-item-val">₹{fmt(remaining)}</div>
                  </div>
                </div>

                {emi > 0 && status === 'active' && (
                  <div className="ml-emi-tag">
                    ₹{fmt(emi)}<span style={{ fontSize: 11, fontWeight: 500, opacity: .8 }}>/mo</span>
                  </div>
                )}
                {status === 'closed' && (
                  <div className="ml-paid-tag">
                    <FiCheckCircle size={13} /> Fully Paid
                  </div>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default MyLoans;