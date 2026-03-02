// src/pages/PundDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiDollarSign,
  FiCreditCard,
  FiUsers,
  FiClock,
  FiFileText,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiAlertTriangle,
  FiRefreshCw,
  FiEye,
  FiSettings,
  FiPlus,
  FiBarChart2,
  FiCheckCircle,
  FiUser,
  FiLogOut,
  FiSliders,
  FiLock,
  FiUnlock,
  FiPieChart,
  FiTrendingUp,
  FiAward,
  FiCalendar,
  FiShield
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import OverviewTab from './components/OverviewTab';
import SavingsTab from './components/SavingsTab';
import MembersTab from './components/MembersTab/index';
import LoansTab from './components/LoansTab';
import AuditLogsTab from './components/AuditLogsTab';
import PaymentsTab from './components/PaymentsTab';
import StructureTab from './components/StructureTab';
import ClosePundTab from './components/ClosePundTab';
import ReopenPundTab from './components/ReopenPundTab';
import usePundData from './hooks/usePundData';
import useOwnerData from './hooks/useOwnerData';
import useMemberData from './hooks/useMemberData';
import api from '../../services/api';

const PundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingCycle, setGeneratingCycle] = useState(false);
  const [approvingLoan, setApprovingLoan] = useState(false);

  // Fetch pund data
  const { pundData, role, loading, refetch } = usePundData(id);
  const { fundSummary, savingSummary, loans, auditLogs, refetchOwner } = useOwnerData(id, role);
  const { myFinancials, myLoans, refetchMember } = useMemberData(role);

  // Base menu items for all users - CORRECT ORDER
  const baseMenuItems = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'savings', label: 'Savings', icon: FiTrendingUp },
    { id: 'loans', label: 'Loans', icon: FiCreditCard },
    { id: 'payments', label: 'Payments', icon: FiClock },
  ];

  // Owner-only menu items
  const ownerMenuItems = [
    { id: 'members', label: 'Members', icon: FiUsers },
    { id: 'audit', label: 'Audit Logs', icon: FiShield },
    { id: 'structure', label: 'Pund Structure', icon: FiSliders },
    ...(pundData?.pund_active
      ? [{ id: 'close', label: 'Close Pund', icon: FiLock }]
      : [{ id: 'reopen', label: 'Reopen Pund', icon: FiUnlock }]
    ),
  ];

  // Combine menu items based on role
  const menuItems = role === 'OWNER'
    ? [...baseMenuItems, ...ownerMenuItems]
    : baseMenuItems;

  const handleRefetch = () => {
    refetch();
    if (role === 'OWNER') {
      refetchOwner();
    } else {
      refetchMember();
    }
  };

  const handleGenerateCycle = async () => {
    if (!pundData?.structure) {
      toast.error('Please set pund structure first');
      setActiveTab('structure');
      return;
    }

    setGeneratingCycle(true);
    try {
      const response = await api.post(`/finance/pund/${id}/generate-cycle/`, {});
      toast.success(response.data.message || 'Cycle generated successfully');
      handleRefetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate cycle');
    } finally {
      setGeneratingCycle(false);
    }
  };

  const handleSetStructure = async (structureData) => {
    try {
      const payload = {
        saving_amount: parseFloat(structureData.saving_amount),
        loan_interest_percentage: parseFloat(structureData.loan_interest_percentage),
        missed_saving_penalty: parseFloat(structureData.missed_saving_penalty),
        missed_loan_penalty: parseFloat(structureData.missed_loan_penalty),
        default_loan_cycles: parseInt(structureData.default_loan_cycles) || 10
      };
      if (structureData.effective_from) {
        payload.effective_from = structureData.effective_from;
      }
      await api.post(`/finance/pund/${id}/set-structure/`, payload);
      toast.success('Structure updated successfully');
      handleRefetch();
      setActiveTab('overview');
    } catch (error) {
      toast.error('Failed to update structure');
    }
  };

  const handleRequestLoan = async (loanRequest) => {
    try {
      await api.post(`/finance/pund/${id}/request-loan/`, loanRequest);
      toast.success('Loan request submitted');
      handleRefetch();
    } catch (error) {
      toast.error('Failed to request loan');
    }
  };

  const handleApproveLoan = async (loanId, cycles) => {
    setApprovingLoan(true);
    try {
      await api.post(`/finance/loan/${loanId}/approve/`, { cycles });
      toast.success('Loan approved');
      handleRefetch();
    } catch (error) {
      toast.error('Failed to approve loan');
    } finally {
      setApprovingLoan(false);
    }
  };

  const handleMarkPayment = async (paymentId) => {
    try {
      await api.post(`/finance/payment/${paymentId}/mark-paid/`);
      toast.success('Payment marked as paid');
      handleRefetch();
    } catch (error) {
      toast.error('Failed to mark payment');
    }
  };

  const handleMarkInstallment = async (installmentId) => {
    try {
      await api.post(`/finance/installment/${installmentId}/mark-paid/`);
      toast.success('Installment marked as paid');
      handleRefetch();
    } catch (error) {
      toast.error('Failed to mark installment');
    }
  };

  const handleClosePund = async () => {
    try {
      await api.post(`/punds/${id}/close/`);
      toast.success('Pund closed successfully');
      handleRefetch();
      setActiveTab('overview');
    } catch (error) {
      toast.error('Failed to close pund');
    }
  };

  const handleReopenPund = async () => {
    try {
      await api.post(`/punds/${id}/reopen/`);
      toast.success('Pund reopened successfully');
      handleRefetch();
      setActiveTab('overview');
    } catch (error) {
      toast.error('Failed to reopen pund');
    }
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `Rs. ${numAmount.toLocaleString('en-IN')}`;
  };

  const formatDateDDMMYY = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const handleExportReport = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const userEmail = localStorage.getItem('user_email') || 'owner@pundx.com';

      // Official PundX Colors
      const primaryBlue = [0, 82, 155];
      const secondaryBlue = [0, 101, 189];
      const lightBlue = [235, 245, 255];
      const darkGray = [51, 51, 51];
      const mediumGray = [102, 102, 102];
      const lightGray = [242, 242, 242];

      // Watermark
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(50);
      doc.setFont('helvetica', 'bold');
      doc.text('PUNDX', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      });

      doc.setTextColor(240, 240, 240);
      doc.setFontSize(30);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL REPORT', pageWidth / 2, pageHeight - 40, {
        align: 'center'
      });

      // HEADER
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 0, pageWidth, 25, 'F');

      doc.setFillColor(secondaryBlue[0], secondaryBlue[1], secondaryBlue[2]);
      for (let i = 0; i < pageWidth; i += 20) {
        doc.rect(i, 0, 10, 25, 'F');
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PUNDX', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Community Savings Management System', pageWidth / 2, 22, { align: 'center' });

      // PUND DETAILS
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PUND DETAILS', 14, 35);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      let yPos = 42;

      const details = [
        { label: 'Pund Name:', value: pundData?.pund_name || 'N/A' },
        { label: 'Pund Type:', value: pundData?.pund_type || 'N/A' },
        { label: 'Generated On:', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
        { label: 'Generated By:', value: userEmail },
        { label: 'Status:', value: pundData?.pund_active ? 'ACTIVE' : 'INACTIVE' }
      ];

      details.forEach(detail => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.text(detail.label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(detail.value, 50, yPos);
        yPos += 5;
      });

      yPos += 5;

      // PUND SUMMARY
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(10, yPos - 2, pageWidth - 20, 38, 'F');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('PUND SUMMARY', 14, yPos + 2);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      yPos += 8;

      const summaryItems = [
        { label: 'Total Cycles:', value: savingSummary?.total_cycles?.toString() || '0' },
        { label: 'Total Members:', value: pundData?.total_members?.toString() || pundData?.members?.length?.toString() || '0' },
        { label: 'Total Expected:', value: formatCurrency(savingSummary?.total_expected_savings || 0) },
        { label: 'Total Collected:', value: formatCurrency(savingSummary?.total_paid_savings || 0) },
        { label: 'Total Penalties:', value: formatCurrency(savingSummary?.total_penalties_collected || 0) },
        { label: 'Pending Dues:', value: formatCurrency((savingSummary?.total_expected_savings || 0) - (savingSummary?.total_paid_savings || 0)) }
      ];

      summaryItems.forEach((item, index) => {
        const col = index < 3 ? 14 : pageWidth / 2 + 5;
        const rowY = yPos + (index % 3) * 5;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.text(item.label, col, rowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(item.value, col + (index < 3 ? 35 : 40), rowY);
      });

      yPos += 22;

      // FUND SUMMARY
      if (fundSummary) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('FUND SUMMARY', 14, yPos);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

        yPos += 6;

        const fundItems = [
          { label: 'Total Collected:', value: formatCurrency(fundSummary?.total_collected || 0) },
          { label: 'Active Loans:', value: formatCurrency(fundSummary?.active_loan_outstanding || 0) },
          { label: 'Available Fund:', value: formatCurrency(fundSummary?.available_fund || 0) }
        ];

        fundItems.forEach(item => {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
          doc.text(item.label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.text(item.value, 50, yPos);
          yPos += 5;
        });

        yPos += 5;
      }

      // LOANS SUMMARY
      if (loans && loans.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('LOANS SUMMARY', 14, yPos);

        const loanTableData = loans.slice(0, 10).map(loan => [
          `#${loan.id}`,
          loan.member_name || 'N/A',
          formatCurrency(loan.principal_amount),
          loan.status || 'PENDING'
        ]);

        autoTable(doc, {
          head: [['Loan ID', 'Member', 'Amount (Rs.)', 'Status']],
          body: loanTableData,
          startY: yPos + 5,
          styles: {
            fontSize: 8,
            cellPadding: 2,
            font: 'helvetica',
            textColor: darkGray,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: {
            fillColor: primaryBlue,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 30, halign: 'center' },
            1: { cellWidth: 50, halign: 'left' },
            2: { cellWidth: 45, halign: 'right' },
            3: { cellWidth: 35, halign: 'center' }
          },
          margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // FOOTER
      doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      doc.rect(10, yPos, pageWidth - 20, 28, 'F');

      doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setLineWidth(0.3);
      doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

      doc.setFontSize(7);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a system generated financial report from PundX.', 14, yPos + 8);
      doc.text('All calculations are based on recorded transactions.', 14, yPos + 13);
      doc.text('For disputes, contact the Pund Owner.', 14, yPos + 18);

      const now = new Date();
      const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text(`Generated at: ${timestamp}`, 14, yPos + 24);

      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.setFontSize(6);
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('PUNDX', 14, pageHeight - 10);
      }

      doc.save(`pund-${id}-financial-report.pdf`);
      toast.success('Official PDF report generated successfully');

    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Loading pund details...</p>
        </div>
      </div>
    );
  }

  if (!pundData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FiAlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Pund not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Fixed on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-white shadow-lg flex flex-col
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">P</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base">PundX</span>
              <p className="text-[10px] text-gray-400">v2.5.2</p>
            </div>
          </div>
        </div>

        {/* Pund Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {pundData.pund_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{pundData.pund_name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {role}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${pundData.pund_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {pundData.pund_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Dashboard Link */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-all mb-2"
          >
            <FiHome className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          <div className="h-px bg-gray-100 my-2" />

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content - With left margin on desktop */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiMenu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    PundX
                  </span>
                  <span className="text-sm text-gray-400">/</span>
                  <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                    {pundData.pund_name}
                  </h1>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-2">
                {role === 'OWNER' && pundData.pund_active && (
                  <button
                    onClick={handleExportReport}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                    title="Export Report"
                  >
                    <FiFileText className="w-4 h-4" />
                  </button>
                )}
                {role === 'MEMBER' && pundData.pund_active && (
                  <button
                    onClick={() => setActiveTab('loans')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:shadow-md transition-all"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Request Loan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4">
          {activeTab === 'overview' && (
            <OverviewTab
              pundData={pundData}
              role={role}
              fundSummary={fundSummary}
              savingSummary={savingSummary}
              myFinancials={myFinancials}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsTab
              role={role}
              savingSummary={savingSummary}
              myFinancials={myFinancials}
              pundId={id}
              onGenerateCycle={handleGenerateCycle}  
              generatingCycle={generatingCycle}     
              onMarkPayment={handleMarkPayment}
            />
          )}

          {activeTab === 'loans' && (
            <LoansTab
              role={role}
              loans={loans || []}
              myLoans={myLoans || []}
              pundData={pundData}
              onApproveLoan={handleApproveLoan}
              onMarkInstallment={handleMarkInstallment}
              onRequestLoan={handleRequestLoan}
              approvingLoan={approvingLoan}
            />
          )}

          {activeTab === 'payments' && role === 'OWNER' && (
            <PaymentsTab
              pundId={id}
              pundData={pundData}
              onGenerateCycle={handleGenerateCycle}
              generatingCycle={generatingCycle}
            />
          )}

          {activeTab === 'members' && role === 'OWNER' && (
            <MembersTab
              members={pundData.members || []}
              totalMembers={pundData.total_members || pundData.members?.length || 0}
              pundId={id}
              pundData={pundData}
              onRefresh={handleRefetch}
            />
          )}

          {activeTab === 'audit' && role === 'OWNER' && (
            <AuditLogsTab auditLogs={auditLogs || []} />
          )}

          {activeTab === 'structure' && role === 'OWNER' && (
            <StructureTab
              pundData={pundData}
              onSubmit={handleSetStructure}
            />
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
  );
};

export default PundDetail;