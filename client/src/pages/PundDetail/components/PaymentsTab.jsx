import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiClock,
  FiFilter, FiSearch, FiFileText,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── STYLES ─────────────────────────────────────────────── */
const CSS = `
.pt-wrap {
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
  --green:    #059669;
  --green-l:  #ecfdf5;
  --amber:    #d97706;
  --amber-l:  #fffbeb;
  --red:      #dc2626;
  --red-l:    #fef2f2;
  --sh:       0 1px 3px rgba(0,0,0,.07);
  --sh-lg:    0 10px 32px rgba(0,0,0,.09);
}
.pd-root.dark .pt-wrap {
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
  --green:    #34d399;
  --green-l:  rgba(52,211,153,.1);
  --amber:    #fbbf24;
  --amber-l:  rgba(251,191,36,.1);
  --red:      #f87171;
  --red-l:    rgba(248,113,113,.1);
  --sh:       0 1px 3px rgba(0,0,0,.5);
  --sh-lg:    0 10px 32px rgba(0,0,0,.4);
}

/* ── Loading ── */
.pt-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; padding: 64px 24px;
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px;
}
.pt-spin {
  width: 30px; height: 30px;
  border: 3px solid var(--bd); border-top-color: var(--blue);
  border-radius: 50%; animation: pt-rot .7s linear infinite;
}
@keyframes pt-rot { to { transform: rotate(360deg); } }
.pt-loading-txt { font-size: 13px; color: var(--t3); }

/* ── Summary stats ── */
.pt-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 14px;
}
@media (min-width: 640px)  { .pt-stats { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .pt-stats { grid-template-columns: repeat(7, 1fr); } }

.pt-stat {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 12px; padding: 12px; text-align: center; box-shadow: var(--sh);
}
.pt-stat-lbl { font-size: 10.5px; color: var(--t3); font-weight: 500; margin-bottom: 5px; }
.pt-stat-val { font-size: 14px; font-weight: 700; color: var(--t1); }
.pt-stat-val.green  { color: var(--green); }
.pt-stat-val.amber  { color: var(--amber); }
.pt-stat-val.red    { color: var(--red); }
.pt-stat-val.yellow { color: var(--amber); }
.pt-stat-val.blue   { color: var(--blue); }

/* ── Filter bar ── */
.pt-filters {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 14px; padding: 14px 16px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px; margin-bottom: 14px;
}
.pt-filters-left  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* shared input/select wrapper */
.pt-inp-wrap { position: relative; }
.pt-inp-ico {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  color: var(--t4); pointer-events: none; display: flex; align-items: center;
}
.pt-inp {
  height: 36px; padding: 0 12px 0 32px;
  font-size: 13px; font-family: inherit; color: var(--t1);
  background: var(--bg); border: 1px solid var(--bd); border-radius: 9px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.pt-inp::placeholder { color: var(--t4); }
.pt-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px var(--blue-l); }
select.pt-inp { padding-right: 28px; cursor: pointer; }
.pt-search-inp { width: 180px; }

/* Export button */
.pt-export-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px; font-size: 13px; font-weight: 600; color: #fff;
  background: var(--blue); border: none; border-radius: 9px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 2px 8px rgba(37,99,235,.28);
  transition: background .15s, transform .15s;
}
.pt-export-btn:hover { background: var(--blue-d); transform: translateY(-1px); }

/* ── Table card ── */
.pt-table-card {
  background: var(--surf); border: 1px solid var(--bd);
  border-radius: 16px; overflow: hidden; box-shadow: var(--sh);
}
.pt-table-wrap { overflow-x: auto; }
table.pt-table { width: 100%; border-collapse: collapse; min-width: 640px; }

/* Table head */
.pt-table thead tr {
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
}
.pt-table th {
  padding: 11px 14px; text-align: left;
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,.9);
  letter-spacing: .04em; text-transform: uppercase; white-space: nowrap;
}

/* Table body */
.pt-table tbody tr {
  border-bottom: 1px solid var(--bd);
  transition: background .1s;
}
.pt-table tbody tr:last-child { border-bottom: none; }
.pt-table tbody tr:hover { background: var(--bg); }
.pt-table tbody tr.even { background: var(--bg); }
.pt-table tbody tr.even:hover { background: var(--bg-2); }

.pt-table td {
  padding: 11px 14px; font-size: 13px; color: var(--t2);
  white-space: nowrap; vertical-align: middle;
}
.pt-table td.mono { font-weight: 700; color: var(--t1); font-variant-numeric: tabular-nums; }
.pt-table td.red  { color: var(--red); font-weight: 600; }
.pt-table td.muted{ color: var(--t4); }

/* member cell */
.pt-member-cell { display: flex; align-items: center; gap: 9px; }
.pt-avatar {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #fff;
}
.pt-member-name { font-size: 13px; font-weight: 500; color: var(--t1); }

/* status badge */
.pt-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
}
.pt-badge-paid    { background: var(--green-l); color: var(--green); }
.pt-badge-overdue { background: var(--red-l);   color: var(--red); }
.pt-badge-pending { background: var(--amber-l); color: var(--amber); }

/* mark paid button */
.pt-mark-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; font-size: 12px; font-weight: 600; color: #fff;
  background: var(--green); border: none; border-radius: 7px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 1px 6px rgba(5,150,105,.25);
  transition: background .15s, transform .15s;
}
.pt-mark-btn:hover { background: #047857; transform: translateY(-1px); }

/* empty row */
.pt-empty-row td {
  padding: 48px 24px; text-align: center; font-size: 13px; color: var(--t4);
}
`;

let _ptIn = false;
const Styles = () => {
  useEffect(() => {
    if (_ptIn) return;
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _ptIn = true;
  }, []);
  return null;
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmt    = (v) => `₹${(parseFloat(v) || 0).toLocaleString('en-IN')}`;
const num    = (v) => (v === null || v === undefined) ? 0 : parseFloat(v) || 0;
const fmtDate = (s) => {
  if (!s) return 'N/A';
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getFullYear()).slice(-2)}`;
};

const statusOf = (payment) => {
  if (payment.is_paid) return { cls: 'pt-badge-paid',    icon: FiCheckCircle, label: 'PAID' };
  if (new Date(payment.due_date) < new Date())
                        return { cls: 'pt-badge-overdue', icon: FiXCircle,     label: 'OVERDUE' };
  return                       { cls: 'pt-badge-pending', icon: FiClock,       label: 'PENDING' };
};

/* ═══════════════════════════════════════════════════════════ */
const PaymentsTab = ({ pundId, pundData }) => {
  const [payments,      setPayments]      = useState([]);
  const [cycleData,     setCycleData]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [summary,       setSummary]       = useState({
    totalCycles: 0, totalMembers: 0, totalExpected: 0,
    totalCollected: 0, totalPenalties: 0, pendingCount: 0, pendingAmount: 0,
  });

  useEffect(() => { fetchPayments(); }, [pundId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
      const cycleResponse = res.data;
      setCycleData(cycleResponse);

      const paymentMap = new Map();
      cycleResponse.forEach(cycle => {
        const seen = new Set();
        (cycle.payments || []).forEach(p => {
          const key = `${p.member_id}-${cycle.cycle_number}`;
          if (seen.has(key)) return;
          seen.add(key);
          if (!paymentMap.has(key)) {
            paymentMap.set(key, {
              ...p,
              cycle_number:  cycle.cycle_number,
              amount:        num(p.amount),
              penalty_amount:num(p.penalty_amount),
              due_date:      cycle.due_date || p.due_date,
              member_name:   p.member_name  || 'Unknown',
              member_email:  p.member_email || '',
              is_paid:       p.is_paid      || false,
            });
          }
        });
      });

      const allPayments = Array.from(paymentMap.values());
      setPayments(allPayments);

      const uniqueMembers = new Set(allPayments.map(p => p.member_id));
      const totalExpected   = cycleResponse.reduce((s, c) => s + num(c.total_expected),   0);
      const totalCollected  = cycleResponse.reduce((s, c) => s + num(c.total_collected),  0);
      const totalPenalties  = cycleResponse.reduce((s, c) => s + num(c.total_penalties),  0);
      const pendingCount    = allPayments.filter(p => !p.is_paid).length;
      const pendingAmount   = allPayments.filter(p => !p.is_paid).reduce((s, p) => s + p.amount + p.penalty_amount, 0);

      setSummary({ totalCycles: cycleResponse.length, totalMembers: uniqueMembers.size, totalExpected, totalCollected, totalPenalties, pendingCount, pendingAmount });
    } catch {
      toast.error('Failed to load payments');
      setCycleData([]); setPayments([]);
    } finally { setLoading(false); }
  };

  const handleMarkPaid = async (paymentId) => {
    try {
      const res = await api.post(`/finance/payment/${paymentId}/mark-paid/`);
      toast.success(res.data.message || 'Payment marked as paid');
      fetchPayments();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to mark payment'); }
  };

  const uniqueCycles = [...new Set(payments.map(p => p.cycle_number))].sort((a, b) => a - b);

  const filtered = payments.filter(p => {
    const matchCycle  = selectedCycle === 'all' || p.cycle_number === parseInt(selectedCycle);
    const matchSearch = p.member_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCycle && matchSearch;
  });

  const memberSummary = () => {
    const map = new Map();
    payments.forEach(p => {
      if (!map.has(p.member_id)) map.set(p.member_id, { name: p.member_name, totalPaid: 0, totalPenalty: 0, pendingAmount: 0, isActive: true });
      const m = map.get(p.member_id);
      if (p.is_paid) { m.totalPaid += p.amount; m.totalPenalty += p.penalty_amount; }
      else           { m.pendingAmount += p.amount + p.penalty_amount; }
    });
    return Array.from(map.values());
  };

  /* ── PDF Export ── */
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const ms         = memberSummary();
      const userEmail  = localStorage.getItem('user_email') || 'owner@pundx.com';
      const pB = [0,82,155], dG = [51,51,51], mG = [102,102,102];

      doc.setFillColor(...pB); doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont('helvetica','bold');
      doc.text('PUNDX', pageWidth/2, 15, { align:'center' });
      doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text('Community Savings Management System', pageWidth/2, 22, { align:'center' });

      doc.setTextColor(...dG); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text('PUND DETAILS', 14, 35);
      let yPos = 42;
      [
        ['Pund Name:',   pundData?.pund_name || 'N/A'],
        ['Pund Type:',   pundData?.pund_type || 'N/A'],
        ['Generated On:', new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'})],
        ['Generated By:', userEmail],
        ['Status:',      pundData?.pund_active ? 'ACTIVE' : 'INACTIVE'],
      ].forEach(([label, value]) => {
        doc.setFont('helvetica','bold'); doc.setTextColor(...mG); doc.text(label, 14, yPos);
        doc.setFont('helvetica','normal'); doc.setTextColor(...dG); doc.text(value, 50, yPos);
        yPos += 5;
      });
      yPos += 5;

      doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...pB); doc.text('PUND SUMMARY', 14, yPos);
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...dG); yPos += 6;
      [
        ['Total Cycles:',      summary.totalCycles.toString()],
        ['Total Members:',     summary.totalMembers.toString()],
        ['Total Expected:',    fmt(summary.totalExpected)],
        ['Total Collected:',   fmt(summary.totalCollected)],
        ['Total Penalties:',   fmt(summary.totalPenalties)],
        ['Total Pending Dues:',fmt(summary.pendingAmount)],
      ].forEach(([l, v]) => {
        doc.setFont('helvetica','bold'); doc.setTextColor(...mG); doc.text(l, 14, yPos);
        doc.setFont('helvetica','normal'); doc.setTextColor(...dG); doc.text(v, 55, yPos);
        yPos += 5;
      });
      yPos += 8;

      if (cycleData.length > 0) {
        doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...pB); doc.text('CYCLE SUMMARY', 14, yPos);
        autoTable(doc, {
          head: [['Cycle','Due Date','Expected','Collected','Penalties','Status']],
          body: cycleData.map(c => [c.cycle_number?.toString(),'N/A', fmtDate(c.due_date), fmt(c.total_expected), fmt(c.total_collected), fmt(c.total_penalties), c.status||'OPEN']),
          startY: yPos + 5,
          styles:{fontSize:8,cellPadding:2,font:'helvetica',textColor:dG,lineColor:[200,200,200],lineWidth:.1},
          headStyles:{fillColor:pB,textColor:[255,255,255],fontStyle:'bold',halign:'center'},
          columnStyles:{0:{cellWidth:18,halign:'center'},1:{cellWidth:22,halign:'center'},2:{cellWidth:28,halign:'right'},3:{cellWidth:28,halign:'right'},4:{cellWidth:28,halign:'right'},5:{cellWidth:23,halign:'center'}},
          margin:{left:14,right:14},
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      if (filtered.length > 0) {
        doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...pB); doc.text('DETAILED PAYMENTS', 14, yPos);
        autoTable(doc, {
          head: [['Cycle','Member','Amount','Penalty','Total','Due Date','Status']],
          body: filtered.map(p => {
            const a = num(p.amount), pen = num(p.penalty_amount), t = a + pen;
            const s = p.is_paid ? 'PAID' : new Date(p.due_date) < new Date() ? 'OVERDUE' : 'PENDING';
            return [p.cycle_number?.toString()||'N/A', p.member_name||'Unknown', fmt(a), pen>0?fmt(pen):'-', fmt(t), fmtDate(p.due_date), s];
          }),
          startY: yPos + 5,
          styles:{fontSize:7,cellPadding:1.5,font:'helvetica',textColor:dG,lineColor:[200,200,200],lineWidth:.1},
          headStyles:{fillColor:pB,textColor:[255,255,255],fontStyle:'bold',halign:'center'},
          columnStyles:{0:{cellWidth:16,halign:'center'},1:{cellWidth:28},2:{cellWidth:24,halign:'right'},3:{cellWidth:24,halign:'right'},4:{cellWidth:24,halign:'right'},5:{cellWidth:22,halign:'center'},6:{cellWidth:20,halign:'center'}},
          margin:{left:14,right:14},
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      if (yPos > pageHeight - 50) { doc.addPage(); yPos = 20; }

      if (ms.length > 0) {
        doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...pB); doc.text('MEMBER SUMMARY', 14, yPos);
        autoTable(doc, {
          head: [['Member','Total Paid','Total Penalty','Pending','Status']],
          body: ms.map(m => [m.name, fmt(m.totalPaid), fmt(m.totalPenalty), fmt(m.pendingAmount), m.isActive?'ACTIVE':'INACTIVE']),
          startY: yPos + 5,
          styles:{fontSize:8,cellPadding:2,font:'helvetica',textColor:dG,lineColor:[200,200,200],lineWidth:.1},
          headStyles:{fillColor:pB,textColor:[255,255,255],fontStyle:'bold',halign:'center'},
          columnStyles:{0:{cellWidth:35},1:{cellWidth:32,halign:'right'},2:{cellWidth:32,halign:'right'},3:{cellWidth:32,halign:'right'},4:{cellWidth:25,halign:'center'}},
          margin:{left:14,right:14},
        });
        yPos = doc.lastAutoTable.finalY + 15;
      }

      doc.setDrawColor(...pB); doc.setLineWidth(.3); doc.line(14, yPos, pageWidth-14, yPos);
      doc.setFontSize(7); doc.setTextColor(...mG); doc.setFont('helvetica','normal');
      doc.text('This is a system generated financial report from PundX.', 14, yPos+5);
      doc.text('All calculations are based on recorded transactions.', 14, yPos+9);
      doc.text('For disputes, contact the Pund Owner.', 14, yPos+13);
      const now = new Date();
      const ts = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      doc.setFont('helvetica','bold'); doc.setTextColor(...pB); doc.text(`Generated at: ${ts}`, 14, yPos+18);

      const pc = doc.internal.getNumberOfPages();
      for (let i=1;i<=pc;i++) {
        doc.setPage(i);
        doc.setFontSize(7); doc.setTextColor(...mG); doc.setFont('helvetica','italic');
        doc.text(`Page ${i} of ${pc}`, pageWidth-30, pageHeight-10);
        doc.setFontSize(6); doc.setTextColor(...pB); doc.text('PUNDX', 14, pageHeight-10);
      }

      doc.save(`pund-${pundId}-payment-report.pdf`);
      toast.success('Payment report exported successfully');
    } catch (e) { console.error(e); toast.error('Failed to export PDF'); }
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Styles />
      <div className="pt-wrap">
        <div className="pt-loading">
          <div className="pt-spin" />
          <span className="pt-loading-txt">Loading payments…</span>
        </div>
      </div>
    </>
  );

  /* ── Main ── */
  return (
    <>
      <Styles />
      <div className="pt-wrap">

        {/* ── Summary stats ── */}
        <div className="pt-stats">
          {[
            { lbl: 'Cycles',         val: summary.totalCycles,              cls: 'blue'   },
            { lbl: 'Members',        val: summary.totalMembers,             cls: ''       },
            { lbl: 'Expected',       val: fmt(summary.totalExpected),       cls: ''       },
            { lbl: 'Collected',      val: fmt(summary.totalCollected),      cls: 'green'  },
            { lbl: 'Penalties',      val: fmt(summary.totalPenalties),      cls: 'amber'  },
            { lbl: 'Pending',        val: summary.pendingCount,             cls: 'yellow' },
            { lbl: 'Pending Amount', val: fmt(summary.pendingAmount),       cls: 'red'    },
          ].map((s, i) => (
            <motion.div key={i} className="pt-stat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.28 }}
            >
              <div className="pt-stat-lbl">{s.lbl}</div>
              <div className={`pt-stat-val ${s.cls}`}>{s.val}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div className="pt-filters">
          <div className="pt-filters-left">
            {/* Cycle filter */}
            <div className="pt-inp-wrap">
              <span className="pt-inp-ico"><FiFilter size={13} /></span>
              <select className="pt-inp" value={selectedCycle} onChange={e => setSelectedCycle(e.target.value)}>
                <option value="all">All Cycles</option>
                {uniqueCycles.map(c => <option key={c} value={c}>Cycle {c}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="pt-inp-wrap">
              <span className="pt-inp-ico"><FiSearch size={13} /></span>
              <input type="text" placeholder="Search member…" className="pt-inp pt-search-inp"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <motion.button className="pt-export-btn" onClick={exportToPDF}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            <FiFileText size={14} /> Export PDF
          </motion.button>
        </div>

        {/* ── Table ── */}
        <motion.div className="pt-table-card"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.1, ease: [0.25,1,.35,1] }}
        >
          <div className="pt-table-wrap">
            <table className="pt-table">
              <thead>
                <tr>
                  {['Cycle','Member','Amount','Penalty','Total','Due Date','Status','Action'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="pt-empty-row">
                    <td colSpan={8}>No payments found</td>
                  </tr>
                ) : filtered.map((payment, i) => {
                  const st      = statusOf(payment);
                  const amount  = num(payment.amount);
                  const penalty = num(payment.penalty_amount);
                  const total   = amount + penalty;

                  return (
                    <motion.tr key={`${payment.member_id}-${payment.cycle_number}`}
                      className={i % 2 !== 0 ? 'even' : ''}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td className="mono">#{payment.cycle_number}</td>
                      <td>
                        <div className="pt-member-cell">
                          <div className="pt-avatar">
                            {payment.member_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="pt-member-name">{payment.member_name}</span>
                        </div>
                      </td>
                      <td className="mono">{fmt(amount)}</td>
                      <td className={penalty > 0 ? 'red' : 'muted'}>
                        {penalty > 0 ? fmt(penalty) : '—'}
                      </td>
                      <td className="mono">{fmt(total)}</td>
                      <td style={{ color: 'var(--t3)' }}>{fmtDate(payment.due_date)}</td>
                      <td>
                        <span className={`pt-badge ${st.cls}`}>
                          <st.icon size={11} /> {st.label}
                        </span>
                      </td>
                      <td>
                        {!payment.is_paid && (
                          <button className="pt-mark-btn" onClick={() => handleMarkPaid(payment.id)}>
                            <FiCheckCircle size={12} /> Mark Paid
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </>
  );
};

export default PaymentsTab;