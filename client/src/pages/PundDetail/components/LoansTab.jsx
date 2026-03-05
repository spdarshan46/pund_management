// src/pages/PundDetail/components/LoansTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCreditCard, FiCheckCircle, FiXCircle, FiClock,
  FiDollarSign, FiTrendingUp, FiAlertCircle,
  FiCheck, FiX, FiEye, FiChevronDown,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import LoanModal        from './Modals/LoanModal';
import InstallmentModal from './Modals/InstallmentModal';
import api from '../../../services/api';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.lt-wrap {
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
  --green-b:  #a7f3d0;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --amber-b:  #fde68a;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --red-b:    #fecaca;
  --gray-l:   #f3f4f6;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 32px rgba(0,0,0,.09);
}
.pd-root.dark .lt-wrap {
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
  --green-b:  rgba(52,211,153,.25);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --amber-b:  rgba(251,191,36,.25);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --red-b:    rgba(248,113,113,.25);
  --gray-l:   rgba(255,255,255,.05);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 32px rgba(0,0,0,.4);
}

/* ── Stats grid ── */
.lt-stats {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 10px; margin-bottom: 14px;
}
@media (min-width: 640px) { .lt-stats { grid-template-columns: repeat(4, 1fr); } }
.lt-stat {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 12px; padding: 13px; box-shadow: var(--sh);
}
.lt-stat-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-bottom: 5px; }
.lt-stat-val { font-size: 16px; font-weight: 700; color: var(--t1); }
.lt-stat-val.green  { color: var(--green); }
.lt-stat-val.amber  { color: var(--amber); }
.lt-stat-val.blue   { color: var(--blue); }
.lt-stat-val.red    { color: var(--red); }

/* ── Section card ── */
.lt-section {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; overflow: hidden; box-shadow: var(--sh); margin-bottom: 12px;
}
.lt-section:last-child { margin-bottom: 0; }
.lt-section-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px; border-bottom: 1px solid var(--bd);
}
.lt-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13.5px; font-weight: 600; color: var(--t1);
}
.lt-section-ico {
  width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.lt-section-ico.amber  { background: var(--amber-l); color: var(--amber); }
.lt-section-ico.green  { background: var(--green-l); color: var(--green); }
.lt-section-ico.gray   { background: var(--gray-l);  color: var(--t3); }
.lt-section-ico.red    { background: var(--red-l);   color: var(--red); }

.lt-count-badge {
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px;
}
.lt-count-badge.amber  { background: var(--amber-l); color: var(--amber); }
.lt-count-badge.green  { background: var(--green-l); color: var(--green); }
.lt-count-badge.gray   { background: var(--gray-l);  color: var(--t3); }
.lt-count-badge.red    { background: var(--red-l);   color: var(--red); }

.lt-body { padding: 14px; }

/* ── Empty state ── */
.lt-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 8px; padding: 40px 16px; text-align: center;
  background: var(--bg); border-radius: 12px;
}
.lt-empty-ico  { color: var(--t4); }
.lt-empty-txt  { font-size: 13px; color: var(--t3); }

/* ── Loan row cards ── */
.lt-loan-card {
  border: 1px solid var(--bd); border-radius: 12px; overflow: hidden;
  margin-bottom: 10px; transition: box-shadow .2s, border-color .2s;
}
.lt-loan-card:last-child { margin-bottom: 0; }
.lt-loan-card:hover { box-shadow: var(--sh-lg); border-color: var(--bd-2); }

/* pending */
.lt-loan-card.pending { border-color: var(--amber-b); }
/* active */
.lt-loan-card.active  { border-color: var(--green-b); }
/* closed */
.lt-loan-card.closed  { border-color: var(--bd); }
/* rejected */
.lt-loan-card.rejected { border-color: var(--red-b); }

.lt-loan-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; cursor: pointer;
}
.lt-loan-hd.pending  { background: var(--amber-l); }
.lt-loan-hd.active   { background: var(--green-l); }
.lt-loan-hd.closed   { background: var(--gray-l); }
.lt-loan-hd.rejected { background: var(--red-l); }

.lt-loan-left  { display: flex; align-items: center; gap: 10px; }
.lt-loan-right { display: flex; align-items: center; gap: 8px; }

.lt-avatar {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff;
}
.lt-avatar.gray { background: var(--bg-2); color: var(--t3); }
.lt-loan-name  { font-size: 13px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.lt-loan-id    { font-size: 11px; color: var(--t3); }
.lt-loan-amount { font-size: 13px; font-weight: 700; color: var(--t1); }

/* Status badges */
.lt-badge {
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
  display: inline-flex; align-items: center; gap: 4px;
}
.lt-badge.pending  { background: var(--amber-l); color: var(--amber); }
.lt-badge.active   { background: var(--green-l); color: var(--green); }
.lt-badge.approved { background: var(--blue-l);  color: var(--blue); }
.lt-badge.closed   { background: var(--gray-l);  color: var(--t3); }
.lt-badge.rejected { background: var(--red-l);   color: var(--red); }

.lt-eye-btn {
  width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--blue-b);
  background: var(--blue-l); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: .12s;
}
.lt-eye-btn:hover { background: var(--blue-b); }

/* Expand panel */
.lt-expand { border-top: 1px solid var(--bd); padding: 14px; background: var(--surf); }

/* Progress bar */
.lt-prog-row { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--t3); margin-bottom: 5px; }
.lt-prog-val  { font-weight: 600; color: var(--t2); }
.lt-track { width: 100%; height: 6px; background: var(--bd); border-radius: 100px; overflow: hidden; margin-bottom: 13px; }
.lt-fill  { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #059669, #34d399); transition: width .5s ease; }

/* Detail stat cells */
.lt-detail-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 0;
}
@media (min-width: 480px) { .lt-detail-grid { grid-template-columns: repeat(4, 1fr); } }
.lt-detail-cell {
  border-radius: 9px; padding: 10px 11px; border: 1px solid var(--bd);
}
.lt-detail-cell.blue   { background: var(--blue-l); }
.lt-detail-cell.purple { background: var(--purple-l); }
.lt-detail-cell.green  { background: var(--green-l); }
.lt-detail-cell.amber  { background: var(--amber-l); }
.lt-detail-lbl { font-size: 10.5px; font-weight: 500; margin-bottom: 3px; }
.lt-detail-lbl.blue   { color: var(--blue); }
.lt-detail-lbl.purple { color: var(--purple); }
.lt-detail-lbl.green  { color: var(--green); }
.lt-detail-lbl.amber  { color: var(--amber); }
.lt-detail-val { font-size: 13px; font-weight: 700; color: var(--t1); }
.lt-detail-val.purple { color: var(--purple); }
.lt-detail-val.green  { color: var(--green); }
.lt-detail-val.amber  { color: var(--amber); }

/* Insufficient funds warning */
.lt-warn {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 10px 12px; border-radius: 9px; margin-bottom: 12px;
  background: var(--red-l); border: 1px solid var(--red-b);
  font-size: 12px; color: var(--red);
}
.lt-warn-ico { flex-shrink: 0; margin-top: 1px; }

/* Approve / reject buttons */
.lt-approve-btn {
  flex: 1; height: 36px; border-radius: 9px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; display: flex; align-items: center;
  justify-content: center; gap: 6px; font-family: inherit; transition: .15s;
  background: var(--green); color: #fff;
  box-shadow: 0 2px 8px rgba(5,150,105,.25);
}
.lt-approve-btn:hover:not(:disabled) { background: #047857; }
.lt-approve-btn:disabled { background: var(--bg-2); color: var(--t4); box-shadow: none; cursor: not-allowed; }
.lt-reject-btn {
  flex: 1; height: 36px; border-radius: 9px; border: 1.5px solid var(--red-b);
  cursor: pointer; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-family: inherit; background: var(--red-l); color: var(--red); transition: .15s;
}
.lt-reject-btn:hover { background: var(--red-b); }
.lt-action-row { display: flex; gap: 8px; margin-top: 12px; }

/* ── Reject modal ── */
.lt-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 16px;
}
.lt-modal {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 18px; width: 100%; max-width: 420px;
  padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.lt-modal-title {
  font-size: 16px; font-weight: 700; color: var(--t1); margin-bottom: 6px;
}
.lt-modal-sub {
  font-size: 13px; color: var(--t3); margin-bottom: 16px; line-height: 1.5;
}
.lt-textarea {
  width: 100%; padding: 12px 14px; font-size: 13.5px; font-family: inherit;
  color: var(--t1); background: var(--bg); border: 1px solid var(--bd);
  border-radius: 10px; outline: none; resize: vertical; min-height: 88px;
  transition: border-color .15s, box-shadow .15s;
  margin-bottom: 16px;
}
.lt-textarea::placeholder { color: var(--t4); }
.lt-textarea:focus { border-color: var(--red); box-shadow: 0 0 0 3px var(--red-l); background: var(--surf); }
.lt-modal-btns { display: flex; gap: 10px; }
.lt-modal-cancel {
  flex: 1; height: 42px; border-radius: 10px; border: 1px solid var(--bd);
  font-size: 13.5px; font-weight: 500; color: var(--t2); background: var(--bg);
  cursor: pointer; font-family: inherit; transition: .15s;
}
.lt-modal-cancel:hover { background: var(--bg-2); color: var(--t1); }
.lt-modal-confirm {
  flex: 1; height: 42px; border-radius: 10px; border: none;
  font-size: 13.5px; font-weight: 600; color: #fff; background: var(--red);
  cursor: pointer; font-family: inherit; display: flex; align-items: center;
  justify-content: center; gap: 7px;
  box-shadow: 0 3px 12px rgba(220,38,38,.3); transition: .15s;
}
.lt-modal-confirm:hover:not(:disabled) { background: #b91c1c; }
.lt-modal-confirm:disabled { opacity: .6; cursor: not-allowed; }

/* ── Member view ── */
.lt-avail-box {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-radius: 12px; margin-bottom: 12px;
  background: var(--blue-l); border: 1px solid var(--blue-b);
}
.lt-avail-left { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 600; color: var(--blue); }
.lt-avail-val  { font-size: 16px; font-weight: 800; color: var(--blue); }
.lt-req-btn {
  width: 100%; height: 44px; border-radius: 10px; border: none;
  font-size: 14px; font-weight: 600; color: #fff; background: var(--blue);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 3px 12px rgba(37,99,235,.3); transition: .15s; margin-bottom: 14px;
}
.lt-req-btn:hover:not(:disabled) { background: var(--blue-d); transform: translateY(-1px); }
.lt-req-btn:disabled { background: var(--bg-2); color: var(--t4); box-shadow: none; cursor: not-allowed; transform: none; }

/* Spinner */
.lt-spin {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: lt-rot .65s linear infinite;
}
@keyframes lt-rot { to { transform: rotate(360deg); } }
.lt-spin-dark {
  width: 15px; height: 15px;
  border: 2px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: lt-rot .65s linear infinite;
}
`;

let _ltIn = false;
const Styles = () => {
  useEffect(() => {
    if (_ltIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _ltIn = true;
  }, []);
  return null;
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (v) => {
  if (v === undefined || v === null) return '₹0';
  return `₹${(parseFloat(v) || 0).toLocaleString('en-IN')}`;
};

const calcLoan = (loan) => {
  const principal      = parseFloat(loan?.principal || loan?.principal_amount || 0);
  const totalPayable   = parseFloat(loan?.total_payable || 0);
  const interestAmount = parseFloat(loan?.interest_amount || (totalPayable - principal) || 0);
  const paid           = parseFloat(loan?.paid_amount || 0);
  let emiPaid          = parseFloat(loan?.emi_paid || 0);
  if (emiPaid === 0 && loan?.remaining) emiPaid = totalPayable - parseFloat(loan.remaining);
  let remaining        = parseFloat(loan?.remaining || 0);
  if (remaining === 0) remaining = totalPayable - emiPaid;
  let progress = totalPayable > 0 ? Math.round((emiPaid / totalPayable) * 100) : 0;
  progress = Math.max(0, Math.min(100, progress));
  return { principal, interestAmount, totalPayable, paid, emiPaid, remaining, progress };
};

const statusCls = (s = '') => {
  const v = s.toLowerCase();
  if (v === 'pending')  return 'pending';
  if (v === 'approved') return 'approved';
  if (v === 'active')   return 'active';
  if (v === 'closed')   return 'closed';
  if (v === 'rejected') return 'rejected';
  return 'closed';
};

const SECTION_DEFS = {
  pending:  { ico: FiClock,       icoCls: 'amber', countCls: 'amber', title: 'Pending Loan Requests' },
  active:   { ico: FiTrendingUp,  icoCls: 'green', countCls: 'green', title: 'Active Loans' },
  closed:   { ico: FiCheckCircle, icoCls: 'gray',  countCls: 'gray',  title: 'Closed Loans' },
  rejected: { ico: FiXCircle,     icoCls: 'red',   countCls: 'red',   title: 'Rejected Loans' },
};

/* ═══════════════════════════════════════════════════════════ */
const LoansTab = ({
  role, loans = [], myLoans = [], pundData = {},
  onApproveLoan, onMarkInstallment, onRequestLoan, onRejectLoan,
  approvingLoan = false, fundSummary: propFundSummary, onRefresh,
}) => {
  const [showLoanModal,          setShowLoanModal]          = useState(false);
  const [showInstallmentModal,   setShowInstallmentModal]   = useState(false);
  const [selectedLoan,           setSelectedLoan]           = useState(null);
  const [installments,           setInstallments]           = useState([]);
  const [loadingInstallments,    setLoadingInstallments]    = useState(false);
  const [expandedLoan,           setExpandedLoan]           = useState(null);
  const [showRejectModal,        setShowRejectModal]        = useState(false);
  const [rejectLoanId,           setRejectLoanId]           = useState(null);
  const [rejectReason,           setRejectReason]           = useState('');
  const [loading,                setLoading]                = useState(false);
  const [memberAvailableFund,    setMemberAvailableFund]    = useState(0);
  const [fetchingFund,           setFetchingFund]           = useState(false);
  const [markingPaid,            setMarkingPaid]            = useState(false);

  const availableFund = propFundSummary?.available_fund || pundData?.fund_summary?.available_fund || 0;
  const displayFund   = memberAvailableFund > 0 ? memberAvailableFund : availableFund;

  useEffect(() => {
    if (role === 'MEMBER' && pundData?.pund_id) fetchAvailableFund();
  }, [role, pundData]);

  const fetchAvailableFund = async () => {
    if (fetchingFund) return;
    setFetchingFund(true);
    try {
      const r = await api.get(`/finance/pund/${pundData.pund_id}/fund-summary/`);
      if (r.data?.available_fund) setMemberAvailableFund(parseFloat(r.data.available_fund));
    } catch {} finally { setFetchingFund(false); }
  };

  const handleViewInstallments = async (loan) => {
    const loanId = loan?.loan_id || loan?.id;
    if (!loanId) { toast.error('Invalid loan data'); return; }
    setSelectedLoan(loan);
    setLoadingInstallments(true);
    try {
      const r = await api.get(`/finance/loan/${loanId}/detail/`);
      if (r.data?.installments) {
        setInstallments(r.data.installments.map(i => ({
          id: i.id, cycle_number: i.cycle_number, emi_amount: i.emi_amount,
          penalty_amount: i.penalty_amount || '0', is_paid: i.is_paid,
          due_date: i.due_date, loan_id: loanId,
          member_email: loan?.member || loan?.member_email,
        })));
        setShowInstallmentModal(true);
        if (r.data.installments.length === 0) toast.info('No installments found');
      } else { toast.info('No installments found'); }
    } catch { toast.error('Failed to load installments');
    } finally { setLoadingInstallments(false); }
  };

  const handleMarkInstallmentPaid = async (instId) => {
    setMarkingPaid(true);
    try {
      await api.post(`/finance/installment/${instId}/mark-paid/`);
      toast.success('Installment marked as paid');
      if (selectedLoan) {
        const r = await api.get(`/finance/loan/${selectedLoan.loan_id}/detail/`);
        if (r.data?.installments)
          setInstallments(r.data.installments.map(i => ({
            id: i.id, cycle_number: i.cycle_number, emi_amount: i.emi_amount,
            penalty_amount: i.penalty_amount || '0', is_paid: i.is_paid,
            due_date: i.due_date, loan_id: selectedLoan.loan_id,
            member_email: selectedLoan?.member,
          })));
      }
      if (onRefresh) onRefresh();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed');
    } finally { setMarkingPaid(false); }
  };

  const handleApproveLoanClick = (loan) => {
    const loanId = loan?.loan_id || loan?.id;
    if (!loanId) { toast.error('Invalid loan data'); return; }
    const cycles = prompt('Enter number of cycles for repayment:', '6');
    if (cycles && parseInt(cycles) > 0) onApproveLoan(loanId, parseInt(cycles));
  };

  const handleRejectClick = (loan) => {
    setRejectLoanId(loan?.loan_id || loan?.id);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setLoading(true);
    try {
      const res = await api.post(`/finance/loan/${rejectLoanId}/reject/`, { reason: rejectReason });
      if (res.status === 200) {
        toast.success('Loan rejected successfully');
        if (onRejectLoan) onRejectLoan(rejectLoanId, rejectReason);
        setShowRejectModal(false); setRejectReason(''); setRejectLoanId(null);
        if (onRefresh) await onRefresh();
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to reject loan');
    } finally { setLoading(false); }
  };

  if (!role) return (
    <>
      <Styles />
      <div className="lt-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 0', gap:10 }}>
        <div className="lt-spin-dark" style={{ width:28, height:28, borderWidth:3 }} />
        <span style={{ fontSize:13, color:'var(--t3)' }}>Loading loans…</span>
      </div>
    </>
  );

  /* ── Reusable section renderer ── */
  const LoanSection = ({ statusKey, filterFn, children }) => {
    const def    = SECTION_DEFS[statusKey];
    const count  = loans.filter(filterFn).length;
    if (statusKey === 'closed' && count === 0) return null;
    if (statusKey === 'rejected' && count === 0) return null;
    return (
      <div className="lt-section">
        <div className="lt-section-hd">
          <div className="lt-section-title">
            <div className={`lt-section-ico ${def.icoCls}`}><def.ico size={13} /></div>
            {def.title}
          </div>
          <span className={`lt-count-badge ${def.countCls}`}>{count}</span>
        </div>
        <div className="lt-body">{children}</div>
      </div>
    );
  };

  /* ── Progress details ── */
  const LoanDetails = ({ loan }) => {
    const d = calcLoan(loan);
    return (
      <div className="lt-expand">
        <div className="lt-prog-row">
          <span>Repayment progress</span>
          <span className="lt-prog-val">{d.progress}%</span>
        </div>
        <div className="lt-track">
          <div className="lt-fill" style={{ width: `${d.progress}%` }} />
        </div>
        <div className="lt-detail-grid">
          <div className="lt-detail-cell blue">
            <div className="lt-detail-lbl blue">Principal</div>
            <div className="lt-detail-val">{fmt(d.principal)}</div>
          </div>
          <div className="lt-detail-cell purple">
            <div className="lt-detail-lbl purple">Interest</div>
            <div className="lt-detail-val purple">{fmt(d.interestAmount)}</div>
          </div>
          <div className="lt-detail-cell green">
            <div className="lt-detail-lbl green">Paid</div>
            <div className="lt-detail-val green">{fmt(d.paid)}</div>
          </div>
          <div className="lt-detail-cell amber">
            <div className="lt-detail-lbl amber">Remaining</div>
            <div className="lt-detail-val amber">{fmt(d.remaining)}</div>
          </div>
        </div>
      </div>
    );
  };

  /* ── OWNER ── */
  if (role === 'OWNER') return (
    <>
      <Styles />
      <div className="lt-wrap">

        {/* Summary stats */}
        <div className="lt-stats">
          {[
            { lbl: 'Total Loans',    val: loans.length,                                                                  cls: '' },
            { lbl: 'Pending',        val: loans.filter(l => l?.status === 'PENDING').length,                             cls: 'amber' },
            { lbl: 'Active',         val: loans.filter(l => l?.status === 'APPROVED' || l?.status === 'ACTIVE').length,  cls: 'green' },
            { lbl: 'Available Fund', val: fmt(availableFund),                                                             cls: 'blue' },
          ].map((s, i) => (
            <motion.div key={i} className="lt-stat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.28 }}
            >
              <div className="lt-stat-lbl">{s.lbl}</div>
              <div className={`lt-stat-val ${s.cls}`}>{s.val}</div>
            </motion.div>
          ))}
        </div>

        {/* PENDING */}
        <LoanSection statusKey="pending" filterFn={l => l?.status === 'PENDING'}>
          {loans.filter(l => l?.status === 'PENDING').length === 0 ? (
            <div className="lt-empty">
              <FiCreditCard size={28} className="lt-empty-ico" />
              <p className="lt-empty-txt">No pending loan requests</p>
            </div>
          ) : (
            loans.filter(l => l?.status === 'PENDING').map((loan, idx) => {
              const memberName = loan?.member?.split('@')[0] || 'Unknown';
              const principal  = parseFloat(loan?.principal || 0);
              const insufficient = principal > availableFund;
              return (
                <motion.div key={loan.loan_id} className="lt-loan-card pending"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.28 }}
                >
                  <div className="lt-loan-hd pending" style={{ cursor: 'default' }}>
                    <div className="lt-loan-left">
                      <div className="lt-avatar">{memberName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="lt-loan-name">{memberName}</div>
                        <div className="lt-loan-id">{loan.member}</div>
                      </div>
                    </div>
                    <div className="lt-loan-right">
                      <span className="lt-loan-amount">{fmt(principal)}</span>
                      <span className="lt-badge pending"><FiClock size={10} /> Pending</span>
                    </div>
                  </div>

                  <div className="lt-expand">
                    <div className="lt-detail-grid" style={{ marginBottom: 12 }}>
                      <div className="lt-detail-cell blue">
                        <div className="lt-detail-lbl blue">Principal</div>
                        <div className="lt-detail-val">{fmt(principal)}</div>
                      </div>
                      <div className="lt-detail-cell green">
                        <div className="lt-detail-lbl green">Available Fund</div>
                        <div className={`lt-detail-val${insufficient ? ' amber' : ' green'}`}>{fmt(availableFund)}</div>
                      </div>
                    </div>

                    {insufficient && (
                      <div className="lt-warn">
                        <FiAlertCircle size={13} className="lt-warn-ico" />
                        <span>Insufficient funds — requested amount exceeds available balance by {fmt(principal - availableFund)}</span>
                      </div>
                    )}

                    <div className="lt-action-row">
                      <button className="lt-approve-btn"
                        onClick={() => handleApproveLoanClick(loan)}
                        disabled={approvingLoan || insufficient}
                      >
                        <FiCheck size={13} /> Approve
                      </button>
                      <button className="lt-reject-btn" onClick={() => handleRejectClick(loan)}>
                        <FiX size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </LoanSection>

        {/* ACTIVE */}
        <LoanSection statusKey="active" filterFn={l => l?.status === 'APPROVED' || l?.status === 'ACTIVE'}>
          {loans.filter(l => l?.status === 'APPROVED' || l?.status === 'ACTIVE').length === 0 ? (
            <div className="lt-empty">
              <FiCreditCard size={28} className="lt-empty-ico" />
              <p className="lt-empty-txt">No active loans</p>
            </div>
          ) : (
            loans.filter(l => l?.status === 'APPROVED' || l?.status === 'ACTIVE').map((loan, idx) => {
              const memberName = loan?.member?.split('@')[0] || 'Unknown';
              const sc         = statusCls(loan.status);
              const isOpen     = expandedLoan === loan.loan_id;
              return (
                <motion.div key={loan.loan_id} className={`lt-loan-card ${sc}`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.28 }}
                >
                  <div className={`lt-loan-hd ${sc}`} onClick={() => setExpandedLoan(isOpen ? null : loan.loan_id)}>
                    <div className="lt-loan-left">
                      <div className="lt-avatar">{memberName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="lt-loan-name">{memberName}</div>
                        <div className="lt-loan-id">Loan #{loan.loan_id}</div>
                      </div>
                    </div>
                    <div className="lt-loan-right">
                      <span className={`lt-badge ${sc}`}>{loan.status}</span>
                      <button className="lt-eye-btn"
                        onClick={e => { e.stopPropagation(); handleViewInstallments(loan); }}
                        title="View Installments"
                      >
                        <FiEye size={14} />
                      </button>
                      <FiChevronDown size={14} style={{ color:'var(--t4)', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                        exit={{ opacity:0, height:0 }} transition={{ duration:.22 }}
                      >
                        <LoanDetails loan={loan} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </LoanSection>

        {/* CLOSED */}
        <LoanSection statusKey="closed" filterFn={l => l?.status === 'CLOSED'}>
          {loans.filter(l => l?.status === 'CLOSED').map((loan, idx) => {
            const memberName = loan?.member?.split('@')[0] || 'Unknown';
            return (
              <div key={loan.loan_id} className="lt-loan-card closed">
                <div className="lt-loan-hd closed" style={{ cursor:'default' }}>
                  <div className="lt-loan-left">
                    <div className="lt-avatar gray">{memberName.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="lt-loan-name">{memberName}</div>
                      <div className="lt-loan-id">Loan #{loan.loan_id}</div>
                    </div>
                  </div>
                  <div className="lt-loan-right">
                    <span className="lt-loan-amount">{fmt(loan.principal)}</span>
                    <span className="lt-badge closed"><FiCheckCircle size={10} /> Closed</span>
                  </div>
                </div>
              </div>
            );
          })}
        </LoanSection>

        {/* REJECTED */}
        <LoanSection statusKey="rejected" filterFn={l => l?.status === 'REJECTED'}>
          {loans.filter(l => l?.status === 'REJECTED').map((loan) => {
            const memberName = loan?.member?.split('@')[0] || 'Unknown';
            return (
              <div key={loan.loan_id} className="lt-loan-card rejected">
                <div className="lt-loan-hd rejected" style={{ cursor:'default' }}>
                  <div className="lt-loan-left">
                    <div className="lt-avatar" style={{ background:'linear-gradient(135deg,#dc2626,#f87171)' }}>
                      {memberName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="lt-loan-name">{memberName}</div>
                      <div className="lt-loan-id">Loan #{loan.loan_id}</div>
                    </div>
                  </div>
                  <div className="lt-loan-right">
                    <span className="lt-loan-amount">{fmt(loan.principal)}</span>
                    <span className="lt-badge rejected"><FiXCircle size={10} /> Rejected</span>
                  </div>
                </div>
              </div>
            );
          })}
        </LoanSection>

        {/* Reject reason modal */}
        <AnimatePresence>
          {showRejectModal && (
            <motion.div className="lt-modal-overlay"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:.18 }}
              onClick={() => setShowRejectModal(false)}
            >
              <motion.div className="lt-modal"
                initial={{ scale:.95, y:16 }} animate={{ scale:1, y:0 }}
                exit={{ scale:.95, y:16 }} transition={{ duration:.2 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="lt-modal-title">Reject Loan Request</div>
                <div className="lt-modal-sub">Please provide a reason — this will be visible to the member.</div>
                <textarea className="lt-textarea" rows={3}
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection…"
                />
                <div className="lt-modal-btns">
                  <button className="lt-modal-cancel"
                    onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectLoanId(null); }}>
                    Cancel
                  </button>
                  <button className="lt-modal-confirm"
                    onClick={handleConfirmReject}
                    disabled={loading || !rejectReason.trim()}
                  >
                    {loading ? <div className="lt-spin" /> : <><FiX size={14} /> Confirm Reject</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Shared modals */}
      <InstallmentModal
        isOpen={showInstallmentModal} onClose={() => setShowInstallmentModal(false)}
        installments={installments} loading={loadingInstallments}
        onMarkPaid={handleMarkInstallmentPaid} isOwner={true} markingPaid={markingPaid}
      />
    </>
  );

  /* ══════════════════════════════════════
     MEMBER VIEW
  ══════════════════════════════════════ */
  return (
    <>
      <Styles />
      <div className="lt-wrap">

        {/* Member stats */}
        <div className="lt-stats">
          <motion.div className="lt-stat"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0 }}>
            <div className="lt-stat-lbl">My Total Loans</div>
            <div className="lt-stat-val">{myLoans.length}</div>
          </motion.div>
          <motion.div className="lt-stat"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.06 }}>
            <div className="lt-stat-lbl">Active Loans</div>
            <div className="lt-stat-val green">
              {myLoans.filter(l => l?.status === 'ACTIVE' || l?.status === 'APPROVED').length}
            </div>
          </motion.div>
        </div>

        {/* Available fund */}
        <div className="lt-avail-box">
          <div className="lt-avail-left"><FiDollarSign size={15} /> Available Fund to Borrow</div>
          <span className="lt-avail-val">{fmt(displayFund)}</span>
        </div>

        {/* Request button */}
        <button className="lt-req-btn"
          disabled={displayFund <= 0}
          onClick={() => displayFund > 0 ? setShowLoanModal(true) : toast.error('No funds available')}
        >
          <FiCreditCard size={15} />
          {displayFund > 0 ? 'Request New Loan' : 'No Funds Available'}
        </button>

        {/* My loans list */}
        <div className="lt-section">
          <div className="lt-section-hd">
            <div className="lt-section-title">
              <div className="lt-section-ico gray"><FiCreditCard size={13} /></div>
              My Loan Requests
            </div>
            <span className="lt-count-badge gray">{myLoans.length}</span>
          </div>
          <div className="lt-body">
            {myLoans.length === 0 ? (
              <div className="lt-empty">
                <FiCreditCard size={28} className="lt-empty-ico" />
                <p className="lt-empty-txt">No loan requests yet</p>
              </div>
            ) : (
              myLoans.map((loan, idx) => {
                const sc     = statusCls(loan?.status);
                const isOpen = expandedLoan === (loan.loan_id || loan.id);
                const isActive = loan?.status === 'ACTIVE' || loan?.status === 'APPROVED';
                return (
                  <motion.div key={loan.loan_id || loan.id}
                    className={`lt-loan-card ${sc}`}
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: idx * 0.06, duration: 0.28 }}
                  >
                    <div className={`lt-loan-hd ${sc}`}
                      onClick={() => setExpandedLoan(isOpen ? null : (loan.loan_id || loan.id))}
                    >
                      <div className="lt-loan-left">
                        <div className={`lt-avatar${sc === 'closed' || sc === 'rejected' ? ' gray' : ''}`}>
                          {(loan.loan_id || loan.id)?.toString().slice(-2)}
                        </div>
                        <div>
                          <div className="lt-loan-name">Loan #{loan.loan_id || loan.id}</div>
                          <div className="lt-loan-id">{loan.pund || ''}</div>
                        </div>
                      </div>
                      <div className="lt-loan-right">
                        <span className={`lt-badge ${sc}`}>{loan.status}</span>
                        {isActive && (
                          <button className="lt-eye-btn"
                            onClick={e => {
                              e.stopPropagation();
                              handleViewInstallments({ loan_id: loan.loan_id || loan.id, member: loan.member_email || loan.member });
                            }}
                            title="View Installments"
                          >
                            <FiEye size={14} />
                          </button>
                        )}
                        <FiChevronDown size={14} style={{ color:'var(--t4)', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                          exit={{ opacity:0, height:0 }} transition={{ duration:.22 }}
                        >
                          {isActive
                            ? <LoanDetails loan={loan} />
                            : (
                              <div className="lt-expand">
                                <div className="lt-detail-grid">
                                  <div className="lt-detail-cell blue">
                                    <div className="lt-detail-lbl blue">Principal</div>
                                    <div className="lt-detail-val">{fmt(loan?.principal || loan?.principal_amount)}</div>
                                  </div>
                                  <div className="lt-detail-cell purple">
                                    <div className="lt-detail-lbl purple">Interest</div>
                                    <div className="lt-detail-val purple">{fmt(calcLoan(loan).interestAmount)}</div>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Shared modals */}
      <InstallmentModal
        isOpen={showInstallmentModal} onClose={() => setShowInstallmentModal(false)}
        installments={installments} loading={loadingInstallments}
        onMarkPaid={handleMarkInstallmentPaid} isOwner={false} markingPaid={markingPaid}
      />
      <LoanModal
        isOpen={showLoanModal} onClose={() => setShowLoanModal(false)}
        onSubmit={onRequestLoan} submitting={false} availableFund={displayFund}
      />
    </>
  );
};

export default LoansTab;