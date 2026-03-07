import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiHome, FiDollarSign, FiCreditCard, FiUsers, FiClock,
  FiFileText, FiMenu, FiArrowLeft, FiAlertTriangle,
  FiSliders, FiLock, FiUnlock, FiPieChart, FiTrendingUp,
  FiShield, FiSun, FiMoon,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import OverviewTab from './components/OverviewTab';
import SavingsTab from './components/SavingsTab';
import MembersTab from './components/MembersTab/index';
import LoansTab from './components/LoansTab';
import AuditLogsTab from './components/AuditLogsTab.jsx';
import PaymentsTab from './components/PaymentsTab';
import StructureTab from './components/StructureTab';
import ClosePundTab from './components/ClosePundTab';
import ReopenPundTab from './components/ReopenPundTab';
import usePundData from './hooks/usePundData';
import useOwnerData from './hooks/useOwnerData';
import useMemberData from './hooks/useMemberData';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
/* ── reset ── */
html, body, #root { height: 100%; margin: 0; padding: 0; }

.pd-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  height: 100vh; overflow: hidden;
  display: flex; flex-direction: row;
  transition: background .3s, color .3s;

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
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 36px rgba(0,0,0,.09);
  --sb-w:     240px;
  --hdr-h:    56px;

  background: var(--bg); color: var(--t1);
}
.pd-root.dark {
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
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 36px rgba(0,0,0,.4);
}

/* ══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
.pd-sidebar {
  position: fixed; top: 0; left: 0;
  width: var(--sb-w); height: 100vh; z-index: 50;
  display: flex; flex-direction: column;
  background: var(--surf); border-right: 1px solid var(--bd);
  transition: transform .22s cubic-bezier(.25,1,.35,1), background .3s, border-color .3s;
  will-change: transform;
}
.pd-sidebar.closed { transform: translateX(-100%); }
@media (min-width: 1024px) { .pd-sidebar { transform: translateX(0) !important; } }

/* Sidebar — PundX logo row (matches header height) */
.pd-sb-logo {
  display: flex; align-items: center; gap: 10px;
  height: var(--hdr-h); padding: 0 18px;
  border-bottom: 1px solid var(--bd);
  text-decoration: none; flex-shrink: 0;
}
.pd-sb-logo-box {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 900; color: #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,.4);
}
.pd-sb-logo-name {
  font-size: 18px; font-weight: 800; letter-spacing: -.4px; line-height: 1;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .pd-sb-logo-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.pd-sb-ver {
  margin-left: auto; font-size: 10px; font-weight: 600; color: var(--t4);
  background: var(--bg-2); border: 1px solid var(--bd);
  padding: 2px 7px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
}

/* Sidebar — pund info card */
.pd-sb-pund {
  display: flex; align-items: center; gap: 11px;
  padding: 12px 16px; border-bottom: 1px solid var(--bd); flex-shrink: 0;
}
.pd-sb-pund-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
  box-shadow: 0 2px 8px rgba(217,119,6,.3);
}
.pd-sb-pund-name {
  font-size: 13px; font-weight: 600; color: var(--t1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
  margin-bottom: 4px;
}
.pd-sb-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.pd-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px; }
.pd-badge-owner  { background: var(--purple-l); color: var(--purple); }
.pd-badge-member { background: var(--blue-l);   color: var(--blue); }
.pd-badge-active   { background: var(--green-l); color: var(--green); }
.pd-badge-inactive { background: var(--bg-2);    color: var(--t3); }

/* Sidebar — nav */
.pd-sb-nav { flex: 1; padding: 8px; overflow-y: auto; }
.pd-sb-dash-btn {
  width: 100%; display: flex; align-items: center; gap: 9px;
  padding: 8px 11px; border-radius: 9px; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--t3); background: transparent;
  transition: background .12s, color .12s;
  margin-bottom: 4px; text-align: left;
}
.pd-sb-dash-btn:hover { background: var(--bg-2); color: var(--t1); }
.pd-sb-divider { height: 1px; background: var(--bd); margin: 6px 0 8px; }
.pd-sb-item {
  width: 100%; display: flex; align-items: center; gap: 9px;
  padding: 8px 11px; border-radius: 9px; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--t3); background: transparent;
  transition: background .12s, color .12s;
  margin-bottom: 2px; text-align: left;
}
.pd-sb-item:hover  { background: var(--bg-2); color: var(--t1); }
.pd-sb-item.active { background: var(--blue-l); color: var(--blue); }

/* ── Mobile overlay ── */
.pd-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  z-index: 40; backdrop-filter: blur(3px);
}

/* ══════════════════════════════════════════
   MAIN COLUMN
═══════════════════════════════════════════ */
.pd-main {
  flex: 1; height: 100vh; overflow-y: auto;
  display: flex; flex-direction: column;
  margin-left: var(--sb-w);
}
@media (max-width: 1023px) { .pd-main { margin-left: 0; } }

/* ══════════════════════════════════════════
   HEADER — two-zone split
═══════════════════════════════════════════ */
.pd-header {
  position: sticky; top: 0; z-index: 30;
  height: var(--hdr-h);
  display: flex; flex-direction: row; align-items: stretch; flex-shrink: 0;
  background: rgba(255,255,255,.94);
  border-bottom: 1px solid var(--bd);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  transition: background .3s, border-color .3s;
}
.dark .pd-header { background: rgba(22,27,34,.94); }

/* Desktop brand zone */
.pd-hdr-brand {
  display: none;
}
@media (min-width: 1024px) {
  .pd-hdr-brand {
    display: flex; align-items: center; gap: 10px;
    width: var(--sb-w); flex-shrink: 0;
    padding: 0 18px; border-right: 1px solid var(--bd);
  }
}
.pd-hdr-brand-box {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 900; color: #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,.3);
}
.pd-hdr-brand-name {
  font-size: 18px; font-weight: 800; letter-spacing: -.4px; line-height: 1;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .pd-hdr-brand-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Content zone */
.pd-hdr-content {
  flex: 1; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; gap: 12px; min-width: 0;
}
.pd-hdr-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.pd-ham {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: transparent;
  cursor: pointer; color: var(--t3); flex-shrink: 0; transition: .12s;
}
@media (min-width: 1024px) { .pd-ham { display: none; } }
.pd-ham:hover { background: var(--bg-2); color: var(--t1); }

/* Mobile brand */
.pd-mob-brand { display: flex; align-items: center; gap: 8px; }
@media (min-width: 1024px) { .pd-mob-brand { display: none; } }
.pd-mob-brand-box {
  width: 26px; height: 26px; border-radius: 6px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 900; color: #fff;
}
.pd-mob-brand-name {
  font-size: 16px; font-weight: 800; letter-spacing: -.3px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dark .pd-mob-brand-name {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Desktop: breadcrumb */
.pd-breadcrumb {
  display: none; align-items: center; gap: 6px;
  font-size: 13.5px; min-width: 0;
}
@media (min-width: 1024px) { .pd-breadcrumb { display: flex; } }
.pd-bc-sep   { color: var(--bd-2); font-size: 15px; flex-shrink: 0; }
.pd-bc-pund  {
  font-weight: 600; color: var(--t2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
}

.pd-hdr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.pd-hdr-btn {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--bd); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--t3); transition: .12s;
}
.pd-hdr-btn:hover { background: var(--bg-2); color: var(--t1); border-color: var(--bd-2); }
.pd-hdr-btn.blue  {
  background: var(--blue-l); border-color: var(--blue-b); color: var(--blue);
}
.pd-hdr-btn.blue:hover { background: var(--blue-b); }

/* ── Page content ── */
.pd-content { flex: 1; padding: 20px; }

/* ══════════════════════════════════════════
   LOADING / ERROR
═══════════════════════════════════════════ */
.pd-loading {
  height: 100vh; display: flex; align-items: center;
  justify-content: center; flex-direction: column; gap: 14px;
}
.pd-spin {
  width: 36px; height: 36px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: pd-rot .7s linear infinite;
}
@keyframes pd-rot { to { transform: rotate(360deg); } }
.pd-loading-txt { font-size: 13px; color: var(--t3); }

.pd-error {
  height: 100vh; display: flex; align-items: center;
  justify-content: center; flex-direction: column; gap: 12px; text-align: center;
}
.pd-error-ico { color: var(--red); margin-bottom: 4px; }
.pd-error-title { font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 4px; }
.pd-back-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 18px; font-size: 13px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 9px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 12px rgba(37,99,235,.3); transition: .15s;
}
.pd-back-btn:hover { background: var(--blue-d); }
`;

let _pdIn = false;
const Styles = () => {
  useEffect(() => {
    if (_pdIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _pdIn = true;
  }, []);
  return null;
};

/* ═══════════════════════════════════════════════════════════ */
const PundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingCycle, setGeneratingCycle] = useState(false);
  const [approvingLoan, setApprovingLoan] = useState(false);

  const { pundData, role, loading, refetch } = usePundData(id);
  const { fundSummary, savingSummary, loans, auditLogs, refetchOwner } = useOwnerData(id, role);
  const { myFinancials, myLoans, refetchMember } = useMemberData(role, id);

  useEffect(() => { handleRefetch(); }, [activeTab]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const memberMenuItems = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'loans', label: 'Loans', icon: FiCreditCard },
  ];
  const ownerMenuItems = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'savings', label: 'Savings', icon: FiTrendingUp },
    { id: 'loans', label: 'Loans', icon: FiCreditCard },
    { id: 'payments', label: 'Payments', icon: FiClock },
    { id: 'members', label: 'Members', icon: FiUsers },
    { id: 'audit', label: 'Audit Logs', icon: FiShield },
    { id: 'structure', label: 'Pund Structure', icon: FiSliders },
    ...(pundData?.pund_active
      ? [{ id: 'close', label: 'Close Pund', icon: FiLock }]
      : [{ id: 'reopen', label: 'Reopen Pund', icon: FiUnlock }]
    ),
  ];
  const menuItems = role === 'OWNER' ? ownerMenuItems : memberMenuItems;

  const handleRefetch = async () => {
    try {
      await refetch();
      if (role === 'OWNER') await refetchOwner();
      else if (role === 'MEMBER') await refetchMember();
    } catch (err) { console.error('Refetch failed:', err); }
  };

  const handleGenerateCycle = async () => {
    if (!pundData?.structure) {
      toast.error('Please set pund structure first');
      setActiveTab('structure'); return;
    }
    setGeneratingCycle(true);
    try {
      const res = await api.post(`/finance/pund/${id}/generate-cycle/`, {});
      toast.success(res.data.message || 'Cycle generated successfully');
      await handleRefetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate cycle');
    } finally { setGeneratingCycle(false); }
  };

  const handleSetStructure = async (d) => {
    try {
      const payload = {
        saving_amount: parseFloat(d.saving_amount),
        loan_interest_percentage: parseFloat(d.loan_interest_percentage),
        missed_saving_penalty: parseFloat(d.missed_saving_penalty),
        missed_loan_penalty: parseFloat(d.missed_loan_penalty),
        default_loan_cycles: parseInt(d.default_loan_cycles) || 10,
      };
      if (d.effective_from) payload.effective_from = d.effective_from;
      await api.post(`/finance/pund/${id}/set-structure/`, payload);
      toast.success('Structure updated successfully');
      await handleRefetch(); setActiveTab('overview');
    } catch { toast.error('Failed to update structure'); }
  };

  const handleRequestLoan = async (req) => {
    try {
      await api.post(`/finance/pund/${id}/request-loan/`, req);
      toast.success('Loan request submitted'); await handleRefetch();
    } catch { toast.error('Failed to request loan'); }
  };

  const handleRejectLoan = async () => {
    try { await handleRefetch(); toast.success('Loan rejected'); } catch (e) { console.error(e); }
  };

  const handleApproveLoan = async (loanId, cycles) => {
    setApprovingLoan(true);
    try {
      await api.post(`/finance/loan/${loanId}/approve/`, { cycles });
      toast.success('Loan approved'); await handleRefetch();
    } catch {
      toast.error('Failed to approve loan');
    } finally { setApprovingLoan(false); }
  };

  const handleMarkPayment = async (paymentId) => {
    try {
      await api.post(`/finance/payment/${paymentId}/mark-paid/`);
      toast.success('Payment marked as paid'); await handleRefetch();
    } catch { toast.error('Failed to mark payment'); }
  };

  const handleMarkInstallment = async (installmentId) => {
    try {
      await api.post(`/finance/installment/${installmentId}/mark-paid/`);
      toast.success('Installment marked as paid'); await handleRefetch();
    } catch { toast.error('Failed to mark installment'); }
  };

  const handleClosePund = async () => {
    try {
      await api.post(`/punds/${id}/close/`);
      toast.success('Pund closed'); await handleRefetch(); setActiveTab('overview');
    } catch { toast.error('Failed to close pund'); }
  };

  const handleReopenPund = async () => {
    try {
      await api.post(`/punds/${id}/reopen/`);
      toast.success('Pund reopened'); await handleRefetch(); setActiveTab('overview');
    } catch { toast.error('Failed to reopen pund'); }
  };

  const formatCurrency = (amount) =>
    `Rs. ${(parseFloat(amount) || 0).toLocaleString('en-IN')}`;

  const handleExportReport = async () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const userEmail = localStorage.getItem('user_email') || 'owner@pundx.com';

      const primaryBlue = [0, 82, 155];
      const secondaryBlue = [0, 101, 189];
      const lightBlue = [235, 245, 255];
      const darkGray = [51, 51, 51];
      const mediumGray = [102, 102, 102];
      const lightGray = [242, 242, 242];

      // Watermark
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(50); doc.setFont('helvetica', 'bold');
      doc.text('PUNDX', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
      doc.setTextColor(240, 240, 240); doc.setFontSize(30); doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL REPORT', pageWidth / 2, pageHeight - 40, { align: 'center' });

      // Header band
      doc.setFillColor(...primaryBlue); doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setFillColor(...secondaryBlue);
      for (let i = 0; i < pageWidth; i += 20) doc.rect(i, 0, 10, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20); doc.setFont('helvetica', 'bold');
      doc.text('PUNDX', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      doc.text('Community Savings Management System', pageWidth / 2, 22, { align: 'center' });

      // Pund details
      doc.setTextColor(...darkGray); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text('PUND DETAILS', 14, 35);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      let yPos = 42;
      [
        { label: 'Pund Name:', value: pundData?.pund_name || 'N/A' },
        { label: 'Pund Type:', value: pundData?.pund_type || 'N/A' },
        { label: 'Generated On:', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
        { label: 'Generated By:', value: userEmail },
        { label: 'Status:', value: pundData?.pund_active ? 'ACTIVE' : 'INACTIVE' },
      ].forEach(d => {
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...mediumGray); doc.text(d.label, 14, yPos);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkGray); doc.text(d.value, 50, yPos);
        yPos += 5;
      });
      yPos += 5;

      // Saving summary
      doc.setFillColor(...lightGray); doc.rect(10, yPos - 2, pageWidth - 20, 38, 'F');
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...primaryBlue);
      doc.text('PUND SUMMARY', 14, yPos + 2);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkGray);
      yPos += 8;
      const expected = parseFloat(savingSummary?.total_expected_savings || 0);
      const totalPaid = parseFloat(savingSummary?.total_paid_savings || 0);
      const penalties = parseFloat(savingSummary?.total_penalties_collected || 0);
      const pendingDues = Math.max(0, expected - (totalPaid - penalties));
      [
        { label: 'Total Cycles:', value: savingSummary?.total_cycles?.toString() || '0' },
        { label: 'Total Members:', value: pundData?.total_members?.toString() || '0' },
        { label: 'Total Expected:', value: formatCurrency(savingSummary?.total_expected_savings || 0) },
        { label: 'Total Collected:', value: formatCurrency(savingSummary?.total_paid_savings || 0) },
        { label: 'Total Penalties:', value: formatCurrency(savingSummary?.total_penalties_collected || 0) },
        { label: 'Pending Dues:', value: formatCurrency(pendingDues) },
      ].forEach((item, index) => {
        const col = index < 3 ? 14 : pageWidth / 2 + 5;
        const rowY = yPos + (index % 3) * 5;
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...mediumGray); doc.text(item.label, col, rowY);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkGray);
        doc.text(item.value, col + (index < 3 ? 35 : 40), rowY);
      });
      yPos += 22;

      // Fund summary
      if (fundSummary) {
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...primaryBlue);
        doc.text('FUND SUMMARY', 14, yPos);
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkGray);
        yPos += 6;
        [
          { label: 'Total Collected:', value: formatCurrency(fundSummary?.total_collected || 0) },
          { label: 'Active Loans:', value: formatCurrency(fundSummary?.active_loan_outstanding || 0) },
          { label: 'Available Fund:', value: formatCurrency(fundSummary?.available_fund || 0) },
        ].forEach(item => {
          doc.setFont('helvetica', 'bold'); doc.setTextColor(...mediumGray); doc.text(item.label, 14, yPos);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(...darkGray); doc.text(item.value, 50, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Loans table
      if (loans?.length > 0) {
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...primaryBlue);
        doc.text('LOANS SUMMARY', 14, yPos);
        autoTable(doc, {
          head: [['Loan ID', 'Member', 'Amount (Rs.)', 'Status']],
          body: loans.slice(0, 10).map(l => [
            `#${l.loan_id || l.id || 'N/A'}`,
            l.member || l.member_email || 'N/A',
            formatCurrency(l.principal || l.principal_amount || 0),
            l.status || 'PENDING',
          ]),
          startY: yPos + 5,
          styles: { fontSize: 8, cellPadding: 2, font: 'helvetica', textColor: darkGray, lineColor: [200, 200, 200], lineWidth: 0.1 },
          headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
          columnStyles: { 0: { cellWidth: 30, halign: 'center' }, 1: { cellWidth: 50 }, 2: { cellWidth: 45, halign: 'right' }, 3: { cellWidth: 35, halign: 'center' } },
          margin: { left: 14, right: 14 },
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Footer
      doc.setFillColor(...lightBlue); doc.rect(10, yPos, pageWidth - 20, 28, 'F');
      doc.setDrawColor(...primaryBlue); doc.setLineWidth(0.3);
      doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
      doc.setFontSize(7); doc.setTextColor(...mediumGray); doc.setFont('helvetica', 'normal');
      doc.text('This is a system generated financial report from PundX.', 14, yPos + 8);
      doc.text('All calculations are based on recorded transactions.', 14, yPos + 13);
      doc.text('For disputes, contact the Pund Owner.', 14, yPos + 18);
      const now = new Date();
      const ts = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...primaryBlue);
      doc.text(`Generated at: ${ts}`, 14, yPos + 24);

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7); doc.setTextColor(...mediumGray); doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.setFontSize(6); doc.setTextColor(...primaryBlue);
        doc.text('PUNDX', 14, pageHeight - 10);
      }
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      const pundName = (pundData?.pund_name || "pund")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      doc.save(`${pundName}_${dateStr}.pdf`); toast.success('PDF report generated');
    } catch (err) {
      console.error(err); toast.error('Failed to export report');
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Styles />
      <div className={`pd-loading pd-root${dark ? ' dark' : ''}`}>
        <div className="pd-spin" />
        <p className="pd-loading-txt">Loading pund details…</p>
      </div>
    </>
  );

  /* ── Not found ── */
  if (!pundData) return (
    <>
      <Styles />
      <div className={`pd-error pd-root${dark ? ' dark' : ''}`}>
        <FiAlertTriangle size={36} className="pd-error-ico" />
        <p className="pd-error-title">Pund not found</p>
        <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    </>
  );

  const goTab = (id) => { setActiveTab(id); setSidebarOpen(false); };

  /* ── Main render ── */
  return (
    <>
      <Styles />
      <div className={`pd-root${dark ? ' dark' : ''}`}>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div className="pd-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── SIDEBAR ── */}
        <aside className={`pd-sidebar${sidebarOpen ? '' : ' closed'}`} role="navigation">

          {/* PundX logo */}
          <div className="pd-sb-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div className="pd-sb-logo-box">P</div>
            <span className="pd-sb-logo-name">PundX</span>
            <span className="pd-sb-ver">v2.52</span>
          </div>

          {/* Pund info */}
          <div className="pd-sb-pund">
            <div className="pd-sb-pund-avatar">
              {pundData.pund_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="pd-sb-pund-name">{pundData.pund_name}</div>
              <div className="pd-sb-badges">
                <span className={`pd-badge ${role === 'OWNER' ? 'pd-badge-owner' : 'pd-badge-member'}`}>
                  {role}
                </span>
                <span className={`pd-badge ${pundData.pund_active ? 'pd-badge-active' : 'pd-badge-inactive'}`}>
                  {pundData.pund_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="pd-sb-nav">
            <button className="pd-sb-dash-btn" onClick={() => navigate('/dashboard')}>
              <FiHome size={15} /> Dashboard
            </button>
            <div className="pd-sb-divider" />
            {menuItems.map(item => (
              <button key={item.id}
                className={`pd-sb-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => goTab(item.id)}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="pd-main">

          {/* Header */}
          <header className="pd-header">

            {/* Desktop brand zone */}
            <div className="pd-hdr-brand">
              <div className="pd-hdr-brand-box">P</div>
              <span className="pd-hdr-brand-name">PundX</span>
            </div>

            {/* Content zone */}
            <div className="pd-hdr-content">
              <div className="pd-hdr-left">
                <button className="pd-ham" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                  <FiMenu size={17} />
                </button>

                {/* Mobile: brand */}
                <div className="pd-mob-brand">
                  <div className="pd-mob-brand-box">P</div>
                  <span className="pd-mob-brand-name">PundX</span>
                </div>

                {/* Desktop: breadcrumb */}
                <div className="pd-breadcrumb">
                  <span className="pd-bc-sep">/</span>
                  <span className="pd-bc-pund">{pundData.pund_name}</span>
                </div>
              </div>

              <div className="pd-hdr-right">
                {/* Theme toggle */}
                <button className="pd-hdr-btn" onClick={toggle}
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                  {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
                </button>

                {/* Export report — owner only */}
                {role === 'OWNER' && pundData.pund_active && (
                  <motion.button className="pd-hdr-btn blue"
                    onClick={handleExportReport}
                    title="Export PDF Report"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    <FiFileText size={15} />
                  </motion.button>
                )}
              </div>
            </div>
          </header>

          {/* Tab content */}
          <div className="pd-content">

            {activeTab === 'overview' && (
              <OverviewTab
                pundData={pundData} role={role}
                fundSummary={fundSummary} savingSummary={savingSummary}
                myFinancials={myFinancials}
              />
            )}

            {activeTab === 'savings' && role === 'OWNER' && (
              <SavingsTab
                role={role} savingSummary={savingSummary} myFinancials={myFinancials}
                pundId={id} onGenerateCycle={handleGenerateCycle}
                generatingCycle={generatingCycle} onMarkPayment={handleMarkPayment}
              />
            )}

            {activeTab === 'loans' && (
              <LoansTab
                role={role} loans={loans || []} myLoans={myLoans || []}
                pundData={pundData} fundSummary={fundSummary}
                onApproveLoan={handleApproveLoan} onMarkInstallment={handleMarkInstallment}
                onRequestLoan={handleRequestLoan} onRejectLoan={handleRejectLoan}
                approvingLoan={approvingLoan} onRefresh={handleRefetch}
              />
            )}

            {activeTab === 'payments' && role === 'OWNER' && (
              <PaymentsTab pundId={id} pundData={pundData} />
            )}

            {activeTab === 'members' && role === 'OWNER' && (
              <MembersTab
                members={pundData.members || []}
                totalMembers={pundData.total_members || pundData.members?.length || 0}
                pundId={id} pundData={pundData} onRefresh={handleRefetch}
              />
            )}

            {activeTab === 'audit' && role === 'OWNER' && (
              <AuditLogsTab auditLogs={auditLogs || []} />
            )}

            {activeTab === 'structure' && role === 'OWNER' && (
              <StructureTab pundData={pundData} onSubmit={handleSetStructure} />
            )}

            {activeTab === 'close' && role === 'OWNER' && pundData.pund_active && (
              <ClosePundTab
                pundName={pundData.pund_name}
                onClose={handleClosePund}
                onCancel={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'reopen' && role === 'OWNER' && !pundData.pund_active && (
              <ReopenPundTab
                pundName={pundData.pund_name}
                onReopen={handleReopenPund}
                onCancel={() => setActiveTab('overview')}
              />
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default PundDetail;