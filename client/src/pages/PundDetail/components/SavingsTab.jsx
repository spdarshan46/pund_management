// src/pages/PundDetail/components/SavingsTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronDown, FiChevronUp, FiPieChart, FiClock,
  FiCheckCircle, FiXCircle, FiGrid, FiList, FiPlusCircle,
  FiTrendingUp, FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.sv-wrap {
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
  --green:    #059669;
  --green-l:  #ecfdf5;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 32px rgba(0,0,0,.09);
}
.pd-root.dark .sv-wrap {
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
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 32px rgba(0,0,0,.4);
}

/* ── Summary stat grid ── */
.sv-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 14px;
}
@media (min-width: 640px) { .sv-stats { grid-template-columns: repeat(6, 1fr); } }

.sv-stat {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 12px; padding: 12px; text-align: center; box-shadow: var(--sh);
}
.sv-stat-lbl { font-size: 10.5px; color: var(--t3); font-weight: 500; margin-bottom: 5px; }
.sv-stat-val { font-size: 14px; font-weight: 700; color: var(--t1); }
.sv-stat-val.green  { color: var(--green); }
.sv-stat-val.red    { color: var(--red); }
.sv-stat-val.amber  { color: var(--amber); }
.sv-stat-val.blue   { color: var(--blue); }

/* ── Section card ── */
.sv-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; overflow: hidden; box-shadow: var(--sh); margin-bottom: 14px;
}
.sv-card-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid var(--bd); flex-wrap: wrap; gap: 10px;
}
.sv-card-title { font-size: 14px; font-weight: 700; color: var(--t1); }
.sv-card-actions { display: flex; align-items: center; gap: 8px; }

/* Generate cycle button */
.sv-gen-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 13px; font-weight: 600; color: #fff;
  background: var(--green); border: none; border-radius: 9px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 2px 8px rgba(5,150,105,.28);
  transition: background .15s, transform .15s;
}
.sv-gen-btn:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
.sv-gen-btn:disabled { opacity: .6; cursor: not-allowed; }

/* View toggle */
.sv-toggle {
  display: flex; align-items: center; gap: 2px;
  background: var(--bg); border: 1px solid var(--bd); border-radius: 9px; padding: 3px;
}
.sv-toggle-btn {
  width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--t4); background: transparent; transition: .12s;
}
.sv-toggle-btn.active { background: var(--blue-l); color: var(--blue); }
.sv-toggle-btn:hover:not(.active) { background: var(--bg-2); color: var(--t2); }

/* ── Loading ── */
.sv-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 56px 24px;
}
.sv-spin {
  width: 28px; height: 28px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: sv-rot .7s linear infinite;
}
@keyframes sv-rot { to { transform: rotate(360deg); } }
.sv-loading-txt { font-size: 13px; color: var(--t3); }

/* ── Empty state ── */
.sv-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px;
  padding: 56px 24px; text-align: center;
  background: var(--bg); margin: 16px; border-radius: 12px;
}
.sv-empty-ico { color: var(--t4); }
.sv-empty-txt { font-size: 13px; color: var(--t3); }

/* ══ GRID VIEW ══ */
.sv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px; padding: 16px;
}
.sv-cycle-card {
  background: var(--bg); border: 1px solid var(--bd);
  border-radius: 13px; overflow: hidden;
  transition: box-shadow .2s, border-color .2s, transform .2s;
  cursor: default;
}
.sv-cycle-card:hover { box-shadow: var(--sh-lg); border-color: var(--bd-2); transform: translateY(-2px); }

.sv-cycle-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; background: var(--surf); border-bottom: 1px solid var(--bd);
}
.sv-cycle-title-row { display: flex; align-items: center; gap: 9px; }
.sv-cycle-num-badge {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}
.sv-cycle-num-badge.done    { background: var(--green-l); color: var(--green); }
.sv-cycle-num-badge.partial { background: var(--amber-l); color: var(--amber); }
.sv-cycle-num-badge.low     { background: var(--red-l);   color: var(--red); }
.sv-cycle-name { font-size: 13px; font-weight: 600; color: var(--t1); }
.sv-cycle-date { font-size: 11px; color: var(--t4); margin-top: 2px; }
.sv-pct-badge {
  font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px;
}
.sv-pct-badge.done    { background: var(--green-l); color: var(--green); }
.sv-pct-badge.partial { background: var(--amber-l); color: var(--amber); }
.sv-pct-badge.low     { background: var(--red-l);   color: var(--red); }

.sv-cycle-body { padding: 12px 14px; }

/* progress bar */
.sv-prog-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--t3); margin-bottom: 5px; }
.sv-prog-val  { font-weight: 600; color: var(--t2); }
.sv-track { width: 100%; height: 5px; background: var(--bd); border-radius: 100px; overflow: hidden; margin-bottom: 12px; }
.sv-fill  { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #2563eb, #7c3aed); transition: width .5s ease; }
.sv-fill.done { background: linear-gradient(90deg, #059669, #34d399); }

/* mini stats */
.sv-mini-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px; }
.sv-mini-cell {
  border-radius: 9px; padding: 9px 10px; border: 1px solid var(--bd);
}
.sv-mini-cell.blue   { background: var(--blue-l); }
.sv-mini-cell.green  { background: var(--green-l); }
.sv-mini-cell.red    { background: var(--red-l); }
.sv-mini-lbl  { font-size: 10px; font-weight: 500; margin-bottom: 3px; }
.sv-mini-lbl.blue  { color: var(--blue); }
.sv-mini-lbl.green { color: var(--green); }
.sv-mini-lbl.red   { color: var(--red); }
.sv-mini-val  { font-size: 12.5px; font-weight: 700; color: var(--t1); }
.sv-mini-val.red { color: var(--red); }

/* expand toggle */
.sv-expand-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 12px; color: var(--t4); border: none; background: transparent;
  cursor: pointer; padding: 5px; border-radius: 7px; transition: .12s; font-family: inherit;
}
.sv-expand-btn:hover { background: var(--bg-2); color: var(--t2); }

/* expanded member list */
.sv-members { border-top: 1px solid var(--bd); background: var(--surf); }
.sv-members-title { font-size: 12px; font-weight: 600; color: var(--t2); padding: 12px 14px 6px; }
.sv-pay-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; border-top: 1px solid var(--bd);
}
.sv-pay-row:first-of-type { border-top: none; }
.sv-pay-avatar {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #fff;
}
.sv-pay-name   { font-size: 12px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.sv-pay-detail { font-size: 10.5px; color: var(--t3); }
.sv-pay-detail .penalty { color: var(--red); }
.sv-pay-total  { font-size: 12.5px; font-weight: 700; color: var(--t1); }

/* ══ LIST VIEW ══ */
.sv-list { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.sv-list-row {
  background: var(--bg); border: 1px solid var(--bd); border-radius: 12px; overflow: hidden;
}
.sv-list-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; cursor: pointer;
  transition: background .12s;
}
.sv-list-hd:hover { background: var(--bg-2); }
.sv-list-left  { display: flex; align-items: center; gap: 10px; }
.sv-list-right { display: flex; align-items: center; gap: 12px; }
.sv-list-prog-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.sv-list-prog-txt  { font-size: 11px; font-weight: 600; color: var(--t2); }
.sv-list-track { width: 72px; height: 5px; background: var(--bd); border-radius: 100px; overflow: hidden; }
.sv-list-fill  { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #2563eb, #7c3aed); }
.sv-list-fill.done { background: linear-gradient(90deg, #059669, #34d399); }
.sv-chevron { color: var(--t4); transition: transform .2s; }
.sv-chevron.open { transform: rotate(180deg); }

.sv-list-details { border-top: 1px solid var(--bd); }
.sv-detail-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  padding: 12px 14px; border-bottom: 1px solid var(--bd);
}
.sv-detail-cell {
  border-radius: 9px; padding: 10px 11px; border: 1px solid var(--bd);
}
.sv-detail-cell.blue   { background: var(--blue-l); }
.sv-detail-cell.green  { background: var(--green-l); }
.sv-detail-cell.red    { background: var(--red-l); }
.sv-detail-lbl { font-size: 10.5px; font-weight: 500; margin-bottom: 3px; }
.sv-detail-lbl.blue  { color: var(--blue); }
.sv-detail-lbl.green { color: var(--green); }
.sv-detail-lbl.red   { color: var(--red); }
.sv-detail-val { font-size: 13px; font-weight: 700; color: var(--t1); }
.sv-detail-val.red { color: var(--red); }

.sv-pay-list { padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
.sv-pay-list-title { font-size: 12px; font-weight: 600; color: var(--t2); margin-bottom: 4px; }
.sv-pay-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 12px; background: var(--surf);
  border: 1px solid var(--bd); border-radius: 9px;
}
.sv-pay-item-l { display: flex; align-items: center; gap: 9px; }
.sv-pay-item-r { display: flex; align-items: center; gap: 8px; }
.sv-cycle-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; border-top: 1px solid var(--bd);
  font-size: 13px;
}
.sv-cycle-total-lbl { font-weight: 500; color: var(--t3); }
.sv-cycle-total-val { font-weight: 700; color: var(--t1); }

/* ── Verification box ── */
.sv-verify {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 12px;
  background: var(--blue-l); border: 1px solid var(--blue-b);
  font-size: 12.5px; color: var(--blue);
}
.sv-verify b { font-weight: 700; }

/* ── Member view ── */
.sv-member-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; padding: 20px; box-shadow: var(--sh);
}
.sv-member-title { font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 14px; }
.sv-member-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.sv-member-cell {
  border-radius: 12px; padding: 14px; border: 1px solid var(--bd);
}
.sv-member-cell.blue   { background: var(--blue-l); }
.sv-member-cell.amber  { background: var(--amber-l); }
.sv-member-cell.red    { background: var(--red-l); }
.sv-member-lbl  { font-size: 11px; font-weight: 500; margin-bottom: 5px; }
.sv-member-lbl.blue  { color: var(--blue); }
.sv-member-lbl.amber { color: var(--amber); }
.sv-member-lbl.red   { color: var(--red); }
.sv-member-val  { font-size: 16px; font-weight: 700; color: var(--t1); }
`;

let _svIn = false;
const Styles = () => {
  useEffect(() => {
    if (_svIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _svIn = true;
  }, []);
  return null;
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v) => `₹${(parseFloat(v) || 0).toLocaleString('en-IN')}`;
const num = (v) => parseFloat(v) || 0;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';

const progressCls = (p) => p >= 100 ? 'done' : p >= 50 ? 'partial' : 'low';

const PayStatusIcon = ({ isPaid, dueDate }) => {
  if (isPaid) return <FiCheckCircle size={13} style={{ color: 'var(--green)' }} />;
  if (new Date(dueDate) < new Date()) return <FiXCircle size={13} style={{ color: 'var(--red)' }} />;
  return <FiClock size={13} style={{ color: 'var(--amber)' }} />;
};

/* ── Shared payment row ── */
const PayRow = ({ payment, variant = 'card' }) => {
  const amount  = num(payment.amount);
  const penalty = num(payment.penalty_amount);
  const total   = amount + penalty;
  const Cls     = variant === 'list' ? 'sv-pay-item' : 'sv-pay-row';
  return (
    <div className={Cls}>
      <div className={variant === 'list' ? 'sv-pay-item-l' : 'flex items-center gap-9'} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div className="sv-pay-avatar">
          {payment.member_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <div className="sv-pay-name">{payment.member_name}</div>
          <div className="sv-pay-detail">
            {fmt(amount)}
            {penalty > 0 && <span className="penalty"> +{fmt(penalty)}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="sv-pay-total">{fmt(total)}</span>
        <PayStatusIcon isPaid={payment.is_paid} dueDate={payment.due_date} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
const SavingsTab = ({ role, savingSummary, myFinancials, pundId, onGenerateCycle, generatingCycle }) => {
  const [cycles,        setCycles]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const [viewMode,      setViewMode]      = useState('grid');

  useEffect(() => {
    if (role === 'OWNER' && pundId) fetchCycles();
  }, [role, pundId]);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
      setCycles(res.data);
    } catch { toast.error('Failed to load cycle data'); }
    finally { setLoading(false); }
  };

  const toggle = (n) => setExpandedCycle(prev => prev === n ? null : n);

  /* ── MEMBER view ── */
  if (role !== 'OWNER') return (
    <>
      <Styles />
      <div className="sv-wrap">
        <div className="sv-member-card">
          <div className="sv-member-title">My Savings</div>
          <div className="sv-member-grid">
            <div className="sv-member-cell blue">
              <div className="sv-member-lbl blue">Total Paid</div>
              <div className="sv-member-val">{fmt(myFinancials?.saving_summary?.total_savings_paid)}</div>
            </div>
            <div className="sv-member-cell amber">
              <div className="sv-member-lbl amber">Unpaid</div>
              <div className="sv-member-val">{fmt(myFinancials?.saving_summary?.total_unpaid_savings)}</div>
            </div>
            <div className="sv-member-cell red">
              <div className="sv-member-lbl red">Penalties</div>
              <div className="sv-member-val">{fmt(myFinancials?.saving_summary?.total_saving_penalty)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /* ── OWNER view ── */
  return (
    <>
      <Styles />
      <div className="sv-wrap">

        {/* Summary stats */}
        <div className="sv-stats">
          {[
            { lbl: 'Cycles',   val: savingSummary?.total_cycles   || 0,                                            cls: 'blue' },
            { lbl: 'Members',  val: savingSummary?.total_members  || 0,                                            cls: '' },
            { lbl: 'Expected', val: fmt(savingSummary?.total_expected_savings),                                    cls: '' },
            { lbl: 'Collected',val: fmt(savingSummary?.total_paid_savings),                                        cls: 'green' },
            { lbl: 'Unpaid',   val: fmt(savingSummary?.total_unpaid_savings),                                      cls: 'red' },
            { lbl: 'Penalties',val: fmt(savingSummary?.total_penalties_collected),                                 cls: 'amber' },
          ].map((s, i) => (
            <motion.div key={i} className="sv-stat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.28 }}
            >
              <div className="sv-stat-lbl">{s.lbl}</div>
              <div className={`sv-stat-val ${s.cls}`}>{s.val}</div>
            </motion.div>
          ))}
        </div>

        {/* Cycles card */}
        <motion.div className="sv-card"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.1, ease: [0.25,1,.35,1] }}
        >
          {/* Header */}
          <div className="sv-card-hd">
            <span className="sv-card-title">Cycle Details</span>
            <div className="sv-card-actions">
              <button className="sv-gen-btn" onClick={onGenerateCycle} disabled={generatingCycle}>
                {generatingCycle
                  ? <div className="sv-spin" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
                  : <FiPlusCircle size={14} />
                }
                New Cycle
              </button>

              <div className="sv-toggle">
                <button className={`sv-toggle-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                  <FiGrid size={14} />
                </button>
                <button className={`sv-toggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                  <FiList size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="sv-loading">
              <div className="sv-spin" />
              <span className="sv-loading-txt">Loading cycles…</span>
            </div>
          ) : cycles.length === 0 ? (
            <div className="sv-empty">
              <FiPieChart size={32} className="sv-empty-ico" />
              <p className="sv-empty-txt">No cycles generated yet</p>
              <button className="sv-gen-btn" onClick={onGenerateCycle} disabled={generatingCycle}>
                {generatingCycle ? <div className="sv-spin" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> : <FiPlusCircle size={14} />}
                Generate First Cycle
              </button>
            </div>
          ) : viewMode === 'grid' ? (

            /* ── GRID ── */
            <div className="sv-grid">
              {cycles.map((cycle, idx) => {
                const progress = cycle.progress || 0;
                const cls      = progressCls(progress);
                const isOpen   = expandedCycle === cycle.cycle_number;
                const totalExp = num(cycle.total_expected);
                const totalCol = num(cycle.total_collected);
                const totalPen = num(cycle.total_penalties);

                return (
                  <motion.div key={cycle.cycle_number} className="sv-cycle-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.25,1,.35,1] }}
                  >
                    {/* Card header */}
                    <div className="sv-cycle-hd">
                      <div className="sv-cycle-title-row">
                        <div className={`sv-cycle-num-badge ${cls}`}>
                          <FiPieChart size={12} />
                        </div>
                        <div>
                          <div className="sv-cycle-name">Cycle {cycle.cycle_number}</div>
                          <div className="sv-cycle-date">Due: {fmtDate(cycle.due_date)}</div>
                        </div>
                      </div>
                      <span className={`sv-pct-badge ${cls}`}>{progress}%</span>
                    </div>

                    {/* Card body */}
                    <div className="sv-cycle-body">
                      <div className="sv-prog-row">
                        <span>Progress</span>
                        <span className="sv-prog-val">{cycle.paid_count || 0} / {cycle.total_count || 0}</span>
                      </div>
                      <div className="sv-track">
                        <div className={`sv-fill${cls === 'done' ? ' done' : ''}`} style={{ width: `${progress}%` }} />
                      </div>

                      <div className="sv-mini-grid">
                        <div className="sv-mini-cell blue">
                          <div className="sv-mini-lbl blue">Expected</div>
                          <div className="sv-mini-val">{fmt(totalExp)}</div>
                        </div>
                        <div className="sv-mini-cell green">
                          <div className="sv-mini-lbl green">Collected</div>
                          <div className="sv-mini-val">{fmt(totalCol)}</div>
                        </div>
                        {totalPen > 0 && (
                          <div className="sv-mini-cell red" style={{ gridColumn: '1 / -1' }}>
                            <div className="sv-mini-lbl red">Penalties</div>
                            <div className="sv-mini-val red">{fmt(totalPen)}</div>
                          </div>
                        )}
                      </div>

                      <button className="sv-expand-btn" onClick={() => toggle(cycle.cycle_number)}>
                        {isOpen ? <><FiChevronUp size={13} /> Hide members</> : <><FiChevronDown size={13} /> Show members</>}
                      </button>
                    </div>

                    {/* Members expand */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div className="sv-members"
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                        >
                          <div className="sv-members-title">Member Payments</div>
                          {cycle.payments?.map(p => <PayRow key={p.id} payment={p} variant="card" />)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

          ) : (

            /* ── LIST ── */
            <div className="sv-list">
              {cycles.map((cycle, idx) => {
                const progress = cycle.progress || 0;
                const cls      = progressCls(progress);
                const isOpen   = expandedCycle === cycle.cycle_number;
                const totalExp = num(cycle.total_expected);
                const totalCol = num(cycle.total_collected);
                const totalPen = num(cycle.total_penalties);

                return (
                  <motion.div key={cycle.cycle_number} className="sv-list-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.28, ease: [0.25,1,.35,1] }}
                  >
                    {/* Row header */}
                    <div className="sv-list-hd" onClick={() => toggle(cycle.cycle_number)}>
                      <div className="sv-list-left">
                        <div className={`sv-cycle-num-badge ${cls}`}><FiPieChart size={12} /></div>
                        <div>
                          <div className="sv-cycle-name">Cycle {cycle.cycle_number}</div>
                          <div className="sv-cycle-date">{fmtDate(cycle.due_date)}</div>
                        </div>
                      </div>
                      <div className="sv-list-right">
                        <div className="sv-list-prog-wrap">
                          <span className="sv-list-prog-txt">{cycle.paid_count || 0}/{cycle.total_count || 0}</span>
                          <div className="sv-list-track">
                            <div className={`sv-list-fill${cls === 'done' ? ' done' : ''}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <span className={`sv-pct-badge ${cls}`}>{progress}%</span>
                        <FiChevronDown size={14} className={`sv-chevron${isOpen ? ' open' : ''}`} />
                      </div>
                    </div>

                    {/* Expandable details */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div className="sv-list-details"
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                        >
                          <div className="sv-detail-stats">
                            <div className="sv-detail-cell blue">
                              <div className="sv-detail-lbl blue">Expected</div>
                              <div className="sv-detail-val">{fmt(totalExp)}</div>
                            </div>
                            <div className="sv-detail-cell green">
                              <div className="sv-detail-lbl green">Collected</div>
                              <div className="sv-detail-val">{fmt(totalCol)}</div>
                            </div>
                            <div className="sv-detail-cell red">
                              <div className="sv-detail-lbl red">Penalties</div>
                              <div className="sv-detail-val red">{fmt(totalPen)}</div>
                            </div>
                          </div>

                          <div className="sv-pay-list">
                            <div className="sv-pay-list-title">Member Payments</div>
                            {cycle.payments?.map(p => <PayRow key={p.id} payment={p} variant="list" />)}
                          </div>

                          <div className="sv-cycle-total">
                            <span className="sv-cycle-total-lbl">Cycle total</span>
                            <span className="sv-cycle-total-val">{fmt(totalCol)} / {fmt(totalExp)}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Verification hint */}
        <div className="sv-verify">
          <FiTrendingUp size={14} />
          <span><b>Verification:</b> Expected = Collected + Unpaid</span>
        </div>

      </div>
    </>
  );
};

export default SavingsTab;