// src/pages/PundDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiAlertTriangle, FiRefreshCw, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import SavingsTab from './components/SavingsTab';
import LoansTab from './components/LoansTab';
import MembersTab from './components/MembersTab';
import AuditLogsTab from './components/AuditLogsTab';
import PaymentsTab from './components/PaymentsTab';
import MemberPaymentsTab from './components/MemberPaymentsTab';
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

  // Fetch role-based data
  const { fundSummary, savingSummary, loans, auditLogs, refetchOwner } = useOwnerData(id, role);
  const { myFinancials, myLoans, refetchMember } = useMemberData(role);

  // Debug logging for structure
  useEffect(() => {
    if (pundData) {
      console.log('Full pundData:', pundData);
      console.log('Structure object:', pundData.structure);
      console.log('Structure effective_from:', pundData.structure?.effective_from);
      console.log('Today:', new Date().toISOString().split('T')[0]);

      // Check if structure is active (effective_from <= today)
      if (pundData.structure?.effective_from) {
        const effectiveDate = new Date(pundData.structure.effective_from);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('Effective date:', effectiveDate);
        console.log('Is structure active?', effectiveDate <= today);
      }
    }
  }, [pundData]);

  const handleRefetch = () => {
    refetch();
    if (role === 'OWNER') {
      refetchOwner();
    } else {
      refetchMember();
    }
  };

  const handleGenerateCycle = async () => {
    // Check if structure exists
    if (!pundData?.structure) {
      toast.error('Please set pund structure first before generating cycles');
      return;
    }

    // Check if structure is active (effective_from <= today)
    if (pundData.structure.effective_from) {
      const effectiveDate = new Date(pundData.structure.effective_from);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (effectiveDate > today) {
        toast.error(`Structure will be active from ${effectiveDate.toLocaleDateString()}`);
        return;
      }
    }

    setGeneratingCycle(true);
    try {
      console.log('Generating cycle for pund:', id);
      console.log('Using structure:', pundData.structure);

      const response = await api.post(`/finance/pund/${id}/generate-cycle/`, {});

      console.log('Generate cycle response:', response.data);
      toast.success(response.data.message || 'New cycle generated successfully');
      handleRefetch();
    } catch (error) {
      console.error('Generate cycle error:', error);
      console.error('Error response:', error.response?.data);

      const errorMsg = error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to generate cycle';
      toast.error(errorMsg);
    } finally {
      setGeneratingCycle(false);
    }
  };

  const handleSetStructure = async (structureData) => {
    try {
      // Validate all fields
      if (!structureData.saving_amount || parseFloat(structureData.saving_amount) <= 0) {
        toast.error('Please enter a valid saving amount');
        return;
      }
      if (!structureData.loan_interest_percentage || parseFloat(structureData.loan_interest_percentage) < 0) {
        toast.error('Please enter a valid interest rate');
        return;
      }
      if (!structureData.missed_saving_penalty || parseFloat(structureData.missed_saving_penalty) < 0) {
        toast.error('Please enter a valid saving penalty');
        return;
      }
      if (!structureData.missed_loan_penalty || parseFloat(structureData.missed_loan_penalty) < 0) {
        toast.error('Please enter a valid loan penalty');
        return;
      }

      setSubmitting(true);

      const payload = {
        saving_amount: parseFloat(structureData.saving_amount),
        loan_interest_percentage: parseFloat(structureData.loan_interest_percentage),
        missed_saving_penalty: parseFloat(structureData.missed_saving_penalty),
        missed_loan_penalty: parseFloat(structureData.missed_loan_penalty),
        default_loan_cycles: parseInt(structureData.default_loan_cycles) || 6
      };

      console.log('Setting structure with payload:', payload);

      const response = await api.post(`/finance/pund/${id}/set-structure/`, payload);
      console.log('Set structure response:', response.data);

      toast.success('Structure updated successfully');
      setShowStructureModal(false);

      setTimeout(() => {
        handleRefetch();
      }, 500);

    } catch (error) {
      console.error('Set structure error:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errors = Object.values(error.response.data).flat().join(', ');
          toast.error(errors);
        } else {
          toast.error(error.response.data.error || 'Failed to update structure');
        }
      } else {
        toast.error('Failed to update structure');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestLoan = async (loanRequest) => {
    try {
      if (!loanRequest.principal_amount || parseFloat(loanRequest.principal_amount) <= 0) {
        toast.error('Please enter a valid loan amount');
        return;
      }

      setSubmitting(true);
      const response = await api.post(`/finance/pund/${id}/request-loan/`, loanRequest);
      toast.success(response.data.message || 'Loan request submitted successfully');
      setShowLoanModal(false);
      handleRefetch();
    } catch (error) {
      console.error('Loan request error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to request loan';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPayment = async (paymentId) => {
    try {
      const response = await api.post(`/finance/payment/${paymentId}/mark-paid/`);
      toast.success(response.data.message || 'Payment marked as paid');
      handleRefetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark payment');
    }
  };

  const handleApproveLoan = async (loanId, cycles) => {
    try {
      if (!cycles || cycles <= 0) {
        toast.error('Please enter valid number of cycles');
        return;
      }

      if (!pundData?.structure) {
        toast.error('Please set pund structure first');
        return;
      }

      setApprovingLoan(true);
      const payload = { cycles: parseInt(cycles) };

      const response = await api.post(`/finance/loan/${loanId}/approve/`, payload);
      toast.success(response.data.message || 'Loan approved successfully');
      handleRefetch();
    } catch (error) {
      console.error('Approve loan error:', error);
      const errorMsg = error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to approve loan';
      toast.error(errorMsg);
    } finally {
      setApprovingLoan(false);
    }
  };

  const handleMarkInstallment = async (installmentId) => {
    try {
      const response = await api.post(`/finance/installment/${installmentId}/mark-paid/`);
      toast.success(response.data.message || 'Installment marked as paid');
      handleRefetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark installment');
    }
  };

  const handleClosePund = async () => {
    setClosingPund(true);
    try {
      const response = await api.post(`/punds/${id}/close/`);
      console.log('Close pund response:', response.data);
      toast.success('Pund closed successfully');
      setShowCloseModal(false);
      setConfirmText('');
      handleRefetch();
    } catch (error) {
      console.error('Error closing pund:', error);
      toast.error(error.response?.data?.error || 'Failed to close pund');
    } finally {
      setClosingPund(false);
    }
  };

  const handleReopenPund = async () => {
    setReopeningPund(true);
    try {
      const response = await api.post(`/punds/${id}/reopen/`);
      console.log('Reopen pund response:', response.data);
      toast.success('Pund reopened successfully');
      setShowReopenModal(false);
      handleRefetch();
    } catch (error) {
      console.error('Error reopening pund:', error);
      toast.error(error.response?.data?.error || 'Failed to reopen pund');
    } finally {
      setReopeningPund(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get(`/finance/pund/${id}/export-report/`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `pund-${id}-report.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const viewMemberDetails = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pund details...</p>
        </div>
      </div>
    );
  }

  if (!pundData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pund not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        pundData={pundData}
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGenerateCycle={handleGenerateCycle}
        onSetStructure={() => setShowStructureModal(true)}
        onExportReport={handleExportReport}
        onRequestLoan={() => setShowLoanModal(true)}
        onClosePund={() => setShowCloseModal(true)}
        onReopenPund={() => setShowReopenModal(true)}
        generatingCycle={generatingCycle}
        hasStructure={!!pundData?.structure}
        pundId={id}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
            pundId={id}  // ✅ Pass pundId to SavingsTab
          />
        )}

        {activeTab === 'payments' && role === 'OWNER' && (  // ✅ Add PaymentsTab here
          <PaymentsTab pundId={id} pundData={pundData} />
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

        {activeTab === 'members' && role === 'OWNER' && (
          <MembersTab
            members={pundData.members}
            totalMembers={pundData.total_members}
            onViewMember={viewMemberDetails}
          />
        )}

        {activeTab === 'audit' && role === 'OWNER' && (
          <AuditLogsTab auditLogs={auditLogs} />
        )}
      </div>

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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FiAlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Close Pund</h3>
                </div>
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You are about to close <span className="font-bold">{pundData?.pund_name}</span>. This action:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                    <li>Will mark the pund as inactive</li>
                    <li>All members will lose access</li>
                    <li>No further cycles can be generated</li>
                    <li>You can reopen it anytime</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">CLOSE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="CLOSE"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCloseModal(false);
                      setConfirmText('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClosePund}
                    disabled={closingPund || confirmText !== 'CLOSE'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {closingPund ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Close Pund'
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiRefreshCw className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Reopen Pund</h3>
                </div>
                <button
                  onClick={() => setShowReopenModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to reopen <span className="font-bold">{pundData?.pund_name}</span>?
                </p>
                <p className="text-sm text-gray-500">
                  This will reactivate the pund and allow members to access it again.
                </p>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowReopenModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReopenPund}
                    disabled={reopeningPund}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {reopeningPund ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Reopen Pund'
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