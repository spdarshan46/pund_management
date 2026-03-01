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
  FiLogOut
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import OverviewTab from './components/OverviewTab';
import SavingsTab from './components/SavingsTab';
import LoansTab from './components/LoansTab';
import MembersTab from './components/MembersTab';
import AuditLogsTab from './components/AuditLogsTab';
import PaymentsTab from './components/PaymentsTab';
import StructureModal from './components/Modals/StructureModal';
import LoanModal from './components/Modals/LoanModal';
import MemberModal from './components/Modals/MemberModal';
import usePundData from './hooks/usePundData';
import useOwnerData from './hooks/useOwnerData';
import useMemberData from './hooks/useMemberData';
import api from '../../services/api';

const PundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [generatingCycle, setGeneratingCycle] = useState(false);
  const [approvingLoan, setApprovingLoan] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [closingPund, setClosingPund] = useState(false);
  const [reopeningPund, setReopeningPund] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Fetch pund data
  const { pundData, role, loading, refetch } = usePundData(id);
  const { fundSummary, savingSummary, loans, auditLogs, refetchOwner } = useOwnerData(id, role);
  const { myFinancials, myLoans, refetchMember } = useMemberData(role);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'savings', label: 'Savings', icon: FiDollarSign },
    { id: 'loans', label: 'Loans', icon: FiCreditCard },
    { id: 'payments', label: 'Payments', icon: FiClock },
    ...(role === 'OWNER' ? [
      { id: 'members', label: 'Members', icon: FiUsers },
      { id: 'audit', label: 'Audit Logs', icon: FiFileText }
    ] : []),
  ];

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
    setSubmitting(true);
    try {
      const payload = {
        saving_amount: parseFloat(structureData.saving_amount),
        loan_interest_percentage: parseFloat(structureData.loan_interest_percentage),
        missed_saving_penalty: parseFloat(structureData.missed_saving_penalty),
        missed_loan_penalty: parseFloat(structureData.missed_loan_penalty),
        default_loan_cycles: parseInt(structureData.default_loan_cycles) || 6
      };

      await api.post(`/finance/pund/${id}/set-structure/`, payload);
      toast.success('Structure updated successfully');
      setShowStructureModal(false);
      handleRefetch();
    } catch (error) {
      toast.error('Failed to update structure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestLoan = async (loanRequest) => {
    setSubmitting(true);
    try {
      await api.post(`/finance/pund/${id}/request-loan/`, loanRequest);
      toast.success('Loan request submitted');
      setShowLoanModal(false);
      handleRefetch();
    } catch (error) {
      toast.error('Failed to request loan');
    } finally {
      setSubmitting(false);
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

  const handleClosePund = async () => {
    setClosingPund(true);
    try {
      await api.post(`/punds/${id}/close/`);
      toast.success('Pund closed successfully');
      setShowCloseModal(false);
      setConfirmText('');
      handleRefetch();
    } catch (error) {
      toast.error('Failed to close pund');
    } finally {
      setClosingPund(false);
    }
  };

  const handleReopenPund = async () => {
    setReopeningPund(true);
    try {
      await api.post(`/punds/${id}/reopen/`);
      toast.success('Pund reopened successfully');
      setShowReopenModal(false);
      handleRefetch();
    } catch (error) {
      toast.error('Failed to reopen pund');
    } finally {
      setReopeningPund(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get(`/finance/pund/${id}/export-report/`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `pund-${id}-report.json`);
      linkElement.click();
      toast.success('Report exported');
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-white shadow-lg flex flex-col
      `}>
        {/* Logo - Increased size */}
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {role}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  pundData.pund_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
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

              {/* Right side - Only Request Loan for members */}
              {role === 'MEMBER' && pundData.pund_active && (
                <button
                  onClick={() => setShowLoanModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 shadow-sm"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Request Loan</span>
                </button>
              )}
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
            />
          )}
          
          {activeTab === 'loans' && (
            <LoansTab
              role={role}
              loans={loans}
              myLoans={myLoans}
              pundData={pundData}
              onApproveLoan={handleApproveLoan}
              approvingLoan={approvingLoan}
            />
          )}
          
          {activeTab === 'payments' && role === 'OWNER' && (
            <PaymentsTab pundId={id} pundData={pundData} />
          )}
          
          {activeTab === 'members' && role === 'OWNER' && (
            <MembersTab
              members={pundData.members}
              totalMembers={pundData.total_members}
              onViewMember={(member) => {
                setSelectedMember(member);
                setShowMemberModal(true);
              }}
            />
          )}
          
          {activeTab === 'audit' && role === 'OWNER' && (
            <AuditLogsTab auditLogs={auditLogs} />
          )}
        </div>
      </main>

      {/* Modals */}
      <StructureModal
        isOpen={showStructureModal}
        onClose={() => setShowStructureModal(false)}
        onSubmit={handleSetStructure}
        submitting={submitting}
      />

      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onSubmit={handleRequestLoan}
        submitting={submitting}
      />

      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={selectedMember}
      />

      {/* Close Pund Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCloseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-lg max-w-sm w-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <FiAlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Close Pund</h3>
                </div>
                <button onClick={() => setShowCloseModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <FiX className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">CLOSE</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CLOSE"
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500/20"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowCloseModal(false);
                      setConfirmText('');
                    }}
                    className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClosePund}
                    disabled={closingPund || confirmText !== 'CLOSE'}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {closingPund ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Close'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reopen Pund Modal */}
      <AnimatePresence>
        {showReopenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReopenModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-lg max-w-sm w-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiRefreshCw className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Reopen Pund</h3>
                </div>
                <button onClick={() => setShowReopenModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <FiX className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Are you sure you want to reopen this pund?
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowReopenModal(false)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReopenPund}
                    disabled={reopeningPund}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {reopeningPund ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Reopen'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PundDetail;