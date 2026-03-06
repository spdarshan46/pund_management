import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiInfo, FiDollarSign, FiTrendingUp, FiClock,
  FiAlertCircle, FiCheckCircle, FiPercent,
  FiUsers, FiRepeat, FiBarChart2,
} from 'react-icons/fi';
import api from '../../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.ov-wrap {
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
  --green:    #059669;
  --green-l:  #ecfdf5;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 36px rgba(0,0,0,.09);
}
.pd-root.dark .ov-wrap {
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
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 36px rgba(0,0,0,.4);
}

/* ── Loading ── */
.ov-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 64px 0;
}
.ov-spin {
  width: 28px; height: 28px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: ov-rot .7s linear infinite;
}
@keyframes ov-rot { to { transform: rotate(360deg); } }
.ov-loading-txt { font-size: 13px; color: var(--t3); }

/* ── Section spacing ── */
.ov-section { margin-bottom: 14px; }
.ov-section:last-child { margin-bottom: 0; }

/* ── Card base ── */
.ov-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; padding: 20px; box-shadow: var(--sh);
}
.ov-card-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 16px;
}
.ov-card-title-ico {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}

/* ── Structure stats grid ── */
.ov-struct-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
@media (min-width: 640px) { .ov-struct-grid { grid-template-columns: repeat(4, 1fr); } }

.ov-struct-cell {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 11px;
  padding: 12px 14px;
}
.ov-struct-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 5px; }
.ov-struct-val { font-size: 15px; font-weight: 700; color: var(--t1); }
.ov-struct-val.red { color: var(--red); }
.ov-effective {
  margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--bd);
  font-size: 12px; color: var(--t3);
}
.ov-effective span { color: var(--t2); font-weight: 500; }

/* ── Fund summary — 3 gradient cards ── */
.ov-fund-grid {
  display: grid; grid-template-columns: repeat(1, 1fr); gap: 12px;
}
@media (min-width: 640px) { .ov-fund-grid { grid-template-columns: repeat(3, 1fr); } }

.ov-fund-card {
  border-radius: 14px; padding: 18px; color: #fff; position: relative; overflow: hidden;
}
.ov-fund-card::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 85% 15%, rgba(255,255,255,.15) 0%, transparent 55%);
  pointer-events: none;
}
.ov-fund-card.blue   { background: linear-gradient(135deg, #1d4ed8, #2563eb); }
.ov-fund-card.purple { background: linear-gradient(135deg, #6d28d9, #7c3aed); }
.ov-fund-card.green  { background: linear-gradient(135deg, #047857, #059669); }

.ov-fund-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500; color: rgba(255,255,255,.75); margin-bottom: 8px;
}
.ov-fund-val { font-size: 20px; font-weight: 800; letter-spacing: -.03em; margin-bottom: 6px; }
.ov-fund-sub { font-size: 11px; color: rgba(255,255,255,.65); line-height: 1.5; }

/* ── Saving summary ── */
.ov-saving-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;
}
@media (min-width: 640px) { .ov-saving-grid { grid-template-columns: repeat(6, 1fr); } }

.ov-saving-cell {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 11px;
  padding: 12px; text-align: center;
}
.ov-saving-lbl { font-size: 10.5px; color: var(--t3); font-weight: 500; margin-bottom: 5px; }
.ov-saving-val { font-size: 14px; font-weight: 700; color: var(--t1); }
.ov-saving-val.green  { color: var(--green); }
.ov-saving-val.red    { color: var(--red); }
.ov-saving-val.amber  { color: var(--amber); }
.ov-saving-val.blue   { color: var(--blue); }

/* ── Breakdown box ── */
.ov-breakdown {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 12px; padding: 14px;
}
.ov-breakdown-title { font-size: 12px; font-weight: 600; color: var(--t2); margin-bottom: 10px; }
.ov-breakdown-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13px; padding: 5px 0;
}
.ov-breakdown-row + .ov-breakdown-row { border-top: 1px solid var(--bd); }
.ov-breakdown-lbl { color: var(--t3); font-weight: 500; }
.ov-breakdown-val { font-weight: 600; color: var(--t1); }
.ov-breakdown-val.green { color: var(--green); }
.ov-breakdown-val.amber { color: var(--amber); }
.ov-breakdown-total {
  margin-top: 6px; padding-top: 8px; border-top: 2px solid var(--bd-2);
  display: flex; justify-content: space-between;
  font-size: 13.5px; font-weight: 700; color: var(--green);
}

/* ── Member stats ── */
.ov-member-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.ov-member-cell {
  border-radius: 12px; padding: 14px; border: 1px solid var(--bd);
}
.ov-member-cell.blue   { background: var(--blue-l);   border-color: var(--blue-b); }
.ov-member-cell.amber  { background: var(--amber-l);  border-color: color-mix(in srgb, var(--amber) 25%, transparent); }
.ov-member-cell.red    { background: var(--red-l);    border-color: color-mix(in srgb, var(--red) 25%, transparent); }
.ov-member-lbl  { font-size: 11px; font-weight: 500; margin-bottom: 5px; }
.ov-member-lbl.blue  { color: var(--blue); }
.ov-member-lbl.amber { color: var(--amber); }
.ov-member-lbl.red   { color: var(--red); }
.ov-member-val  { font-size: 16px; font-weight: 700; color: var(--t1); }

/* ── Loan summary ── */
.ov-loan-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.ov-loan-cell {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 11px; padding: 12px 14px;
}
.ov-loan-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 4px; }
.ov-loan-val { font-size: 14px; font-weight: 700; color: var(--t1); }
.ov-loan-val.amber { color: var(--amber); }
.ov-loan-status {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px;
}
.ov-loan-status.active   { background: var(--green-l); color: var(--green); }
.ov-loan-status.pending  { background: var(--amber-l); color: var(--amber); }
.ov-loan-status.approved { background: var(--blue-l);  color: var(--blue); }

/* Skeleton */
.ov-skel { background: var(--bd); border-radius: 16px; animation: ov-pulse 1.5s ease-in-out infinite; }
@keyframes ov-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
`;

let _ovIn = false;
const Styles = () => {
  useEffect(() => {
    if (_ovIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _ovIn = true;
  }, []);
  return null;
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v) => `₹${(parseFloat(v) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const num = (v) => parseFloat(v) || 0;

/* ═══════════════════════════════════════════════════════════ */
const OverviewTab = ({ pundData, role, fundSummary: propFund, savingSummary: propSaving, myFinancials }) => {
  const [fundSummary,   setFundSummary]   = useState(propFund);
  const [savingSummary, setSavingSummary] = useState(propSaving);
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    if (role === 'MEMBER' && !propFund && !propSaving) fetchSummaries();
  }, [role, pundData?.pund_id]);

  useEffect(() => {
    setFundSummary(propFund);
    setSavingSummary(propSaving);
  }, [propFund, propSaving]);

  const fetchSummaries = async () => {
    if (!pundData?.pund_id) return;
    setLoading(true);
    try {
      try {
        const r = await api.get(`/finance/pund/${pundData.pund_id}/fund-summary/`);
        setFundSummary(r.data);
      } catch { await calculateFromCycles(); }
      try {
        const r = await api.get(`/finance/pund/${pundData.pund_id}/saving-summary/`);
        setSavingSummary(r.data);
      } catch {}
    } catch (e) { console.error(e);
    } finally { setLoading(false); }
  };

  const calculateFromCycles = async () => {
    try {
      const res = await api.get(`/finance/pund/${pundData.pund_id}/cycle-payments/`);
      const cycles = res.data;
      let totalCollected=0, totalPenalties=0, totalExpected=0, totalPaid=0;
      const uCycles=new Set(), uMembers=new Set();
      cycles.forEach(c => {
        uCycles.add(c.cycle_number);
        c.payments?.forEach(p => {
          uMembers.add(p.member_id);
          totalExpected += num(p.amount);
          if (p.is_paid) {
            totalCollected += num(p.amount) + num(p.penalty_amount);
            totalPaid      += num(p.amount) + num(p.penalty_amount);
            totalPenalties += num(p.penalty_amount);
          }
        });
      });
      let activeLoanPrincipal=0, activeLoanOutstanding=0;
      try {
        const lr = await api.get(`/finance/pund/${pundData.pund_id}/loans/`);
        (lr.data || []).forEach(l => {
          if (l.is_active || l.status==='ACTIVE' || l.status==='APPROVED') {
            activeLoanPrincipal    += num(l.principal_amount);
            activeLoanOutstanding  += num(l.remaining_amount || l.total_payable || 0);
          }
        });
      } catch {}
      setFundSummary({ total_collected: String(totalCollected), active_loan_outstanding: String(activeLoanOutstanding), active_loan_principal: String(activeLoanPrincipal), available_fund: String(totalCollected - activeLoanPrincipal) });
      setSavingSummary({ total_cycles: uCycles.size, total_members: uMembers.size, total_expected_savings: String(totalExpected), total_paid_savings: String(totalPaid), total_unpaid_savings: String(totalExpected - (totalPaid - totalPenalties)), total_penalties_collected: String(totalPenalties) });
    } catch (e) { console.error(e); }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Styles />
      <div className="ov-wrap">
        <div className="ov-loading">
          <div className="ov-spin" />
          <span className="ov-loading-txt">Loading overview…</span>
        </div>
      </div>
    </>
  );

  const loanStatus = (s='') => s.toLowerCase().includes('active') || s === 'APPROVED' || s === 'ACTIVE' ? 'active' : 'pending';

  return (
    <>
      <Styles />
      <div className="ov-wrap">

        {/* ── Structure card ── */}
        {pundData?.structure && (
          <motion.div className="ov-card ov-section"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.25,1,.35,1] }}
          >
            <div className="ov-card-title">
              <div className="ov-card-title-ico" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>
                <FiInfo size={14} />
              </div>
              Current Structure
            </div>

            <div className="ov-struct-grid">
              {[
                { lbl: 'Saving Amount',   val: fmt(pundData.structure.saving_amount),             cls: '' },
                { lbl: 'Interest Rate',   val: `${pundData.structure.loan_interest_percentage || 0}%`, cls: '' },
                { lbl: 'Saving Penalty',  val: fmt(pundData.structure.missed_saving_penalty),      cls: 'red' },
                { lbl: 'Loan Penalty',    val: fmt(pundData.structure.missed_loan_penalty),         cls: 'red' },
              ].map((c, i) => (
                <div key={i} className="ov-struct-cell">
                  <div className="ov-struct-lbl">{c.lbl}</div>
                  <div className={`ov-struct-val ${c.cls}`}>{c.val}</div>
                </div>
              ))}
            </div>

            {pundData.structure.effective_from && (
              <div className="ov-effective">
                Effective from: <span>{new Date(pundData.structure.effective_from).toLocaleDateString('en-IN')}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Fund summary — 3 gradient cards ── */}
        {fundSummary && (
          <motion.div className="ov-section"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.07, ease: [0.25,1,.35,1] }}
          >
            <div className="ov-fund-grid">
              {/* Total Collected */}
              <div className="ov-fund-card blue">
                <div className="ov-fund-label"><FiDollarSign size={13} /> Total Collected</div>
                <div className="ov-fund-val">{fmt(fundSummary.total_collected)}</div>
                {savingSummary && (
                  <div className="ov-fund-sub">
                    Savings: {fmt(num(fundSummary.total_collected) - num(savingSummary.total_penalties_collected))}
                    &nbsp;·&nbsp;Penalties: {fmt(savingSummary.total_penalties_collected)}
                  </div>
                )}
              </div>

              {/* Active Loans */}
              <div className="ov-fund-card purple">
                <div className="ov-fund-label"><FiTrendingUp size={13} /> Active Loans</div>
                <div className="ov-fund-val">{fmt(fundSummary.active_loan_outstanding)}</div>
                <div className="ov-fund-sub">
                  Principal: {fmt(fundSummary?.active_loan_principal || 0)}
                  &nbsp;·&nbsp;Interest: {fmt(fundSummary?.active_loan_interest || 0)}
                </div>
              </div>

              {/* Available Fund */}
              <div className="ov-fund-card green">
                <div className="ov-fund-label"><FiClock size={13} /> Available Fund</div>
                <div className="ov-fund-val">{fmt(fundSummary.available_fund)}</div>
                <div className="ov-fund-sub">
                  Collected − Outstanding Loans
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Saving summary ── */}
        {savingSummary && (
          <motion.div className="ov-card ov-section"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.14, ease: [0.25,1,.35,1] }}
          >
            <div className="ov-card-title">
              <div className="ov-card-title-ico" style={{ background: 'var(--green-l)', color: 'var(--green)' }}>
                <FiBarChart2 size={14} />
              </div>
              Saving Summary
            </div>

            {/* 6-cell grid */}
            <div className="ov-saving-grid">
              {[
                { lbl: 'Cycles',   val: savingSummary.total_cycles   || 0, cls: 'blue' },
                { lbl: 'Members',  val: savingSummary.total_members  || 0, cls: '' },
                { lbl: 'Expected', val: fmt(savingSummary.total_expected_savings), cls: '' },
                { lbl: 'Paid',     val: fmt(savingSummary.total_paid_savings),     cls: 'green' },
                { lbl: 'Unpaid',   val: fmt(savingSummary.total_unpaid_savings),   cls: 'red' },
                { lbl: 'Penalties',val: fmt(savingSummary.total_penalties_collected), cls: 'amber' },
              ].map((c, i) => (
                <div key={i} className="ov-saving-cell">
                  <div className="ov-saving-lbl">{c.lbl}</div>
                  <div className={`ov-saving-val ${c.cls}`}>{c.val}</div>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="ov-breakdown">
              <div className="ov-breakdown-title">Breakdown</div>
              <div className="ov-breakdown-row">
                <span className="ov-breakdown-lbl">Savings collected</span>
                <span className="ov-breakdown-val">
                  {fmt(num(savingSummary.total_paid_savings) - num(savingSummary.total_penalties_collected))}
                </span>
              </div>
              <div className="ov-breakdown-row">
                <span className="ov-breakdown-lbl">Penalties collected</span>
                <span className="ov-breakdown-val amber">{fmt(savingSummary.total_penalties_collected)}</span>
              </div>
              <div className="ov-breakdown-total">
                <span>Total paid</span>
                <span>{fmt(savingSummary.total_paid_savings)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Member personal section ── */}
        {role === 'MEMBER' && myFinancials && (
          <motion.div className="ov-section"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.21, ease: [0.25,1,.35,1] }}
          >

            {/* My Savings */}
            <div className="ov-card" style={{ marginBottom: 12 }}>
              <div className="ov-card-title">
                <div className="ov-card-title-ico" style={{ background: 'var(--blue-l)', color: 'var(--blue)' }}>
                  <FiDollarSign size={14} />
                </div>
                My Savings
              </div>
              <div className="ov-member-grid">
                <div className="ov-member-cell blue">
                  <div className="ov-member-lbl blue">Total Paid</div>
                  <div className="ov-member-val">{fmt(myFinancials.saving_summary?.total_savings_paid)}</div>
                </div>
                <div className="ov-member-cell amber">
                  <div className="ov-member-lbl amber">Unpaid</div>
                  <div className="ov-member-val">{fmt(myFinancials.saving_summary?.total_unpaid_savings)}</div>
                </div>
                <div className="ov-member-cell red">
                  <div className="ov-member-lbl red">Penalties</div>
                  <div className="ov-member-val">{fmt(myFinancials.saving_summary?.total_saving_penalty)}</div>
                </div>
              </div>
            </div>

            {/* My Active Loan */}
            {myFinancials.loan_summary && (
              <div className="ov-card">
                <div className="ov-card-title">
                  <div className="ov-card-title-ico" style={{ background: 'var(--purple-l)', color: 'var(--purple)' }}>
                    <FiTrendingUp size={14} />
                  </div>
                  My Active Loan
                </div>
                <div className="ov-loan-grid">
                  <div className="ov-loan-cell">
                    <div className="ov-loan-lbl">Principal</div>
                    <div className="ov-loan-val">{fmt(myFinancials.loan_summary.principal)}</div>
                  </div>
                  <div className="ov-loan-cell">
                    <div className="ov-loan-lbl">Remaining</div>
                    <div className="ov-loan-val amber">{fmt(myFinancials.loan_summary.remaining_amount)}</div>
                  </div>
                  <div className="ov-loan-cell">
                    <div className="ov-loan-lbl">Total Payable</div>
                    <div className="ov-loan-val">{fmt(myFinancials.loan_summary.total_payable)}</div>
                  </div>
                  <div className="ov-loan-cell">
                    <div className="ov-loan-lbl">Status</div>
                    <span className={`ov-loan-status ${loanStatus(myFinancials.loan_summary.status)}`}>
                      {myFinancials.loan_summary.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </>
  );
};

export default OverviewTab;