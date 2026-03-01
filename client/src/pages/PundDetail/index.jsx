// src/pages/PundDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import SavingsTab from './components/SavingsTab';
import LoansTab from './components/LoansTab';
import MembersTab from './components/MembersTab';
import AuditLogsTab from './components/AuditLogsTab';
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
  const [generatingCycle, setGeneratingCycle] = useState(false);
  const [approvingLoan, setApprovingLoan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      
      // Send POST request with empty body - just authentication token
      const response = await api.post(`/finance/pund/${id}/generate-cycle/`, {});
      
      console.log('Generate cycle response:', response.data);
      toast.success(response.data.message || 'New cycle generated successfully');
      handleRefetch();
    } catch (error) {
      console.error('Generate cycle error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific error message from backend
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
      
      // Prepare payload with correct field names
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
      
      // Refetch data to get updated structure
      setTimeout(() => {
        handleRefetch();
      }, 500); // Small delay to allow backend to process
      
    } catch (error) {
      console.error('Set structure error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific error message
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

  const handleExportReport = async () => {
    try {
      const response = await api.get(`/finance/pund/${id}/export-report/`);
      // Create downloadable file
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
        generatingCycle={generatingCycle}
        hasStructure={!!pundData?.structure}
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
    </div>
  );
};

export default PundDetail;