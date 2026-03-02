// src/pages/PundDetail/components/LoansTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCreditCard, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiLoader,
  FiInfo,
  FiRefreshCw,
  FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import LoanModal from './Modals/LoanModal';
import InstallmentModal from './Modals/InstallmentModal';
import api from '../../../services/api';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  const numAmount = parseFloat(amount) || 0;
  return `₹ ${numAmount.toLocaleString('en-IN')}`;
};

const LoansTab = ({ 
  role, 
  loans = [], 
  myLoans = [], 
  pundData = {}, 
  onApproveLoan, 
  onMarkInstallment,
  onRequestLoan,
  onRejectLoan,
  approvingLoan = false,
  fundSummary: propFundSummary,
  onRefresh
}) => {
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedLoanForInstallments, setSelectedLoanForInstallments] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLoanId, setRejectLoanId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberAvailableFund, setMemberAvailableFund] = useState(0);
  const [fetchingFund, setFetchingFund] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  
  const availableFund = propFundSummary?.available_fund || pundData?.fund_summary?.available_fund || 0;

  useEffect(() => {
    if (role === 'MEMBER' && pundData?.pund_id) {
      fetchAvailableFund();
    }
  }, [role, pundData]);

  const fetchAvailableFund = async () => {
    if (fetchingFund) return;
    setFetchingFund(true);
    try {
      const response = await api.get(`/finance/pund/${pundData.pund_id}/fund-summary/`);
      if (response.data?.available_fund) {
        setMemberAvailableFund(parseFloat(response.data.available_fund));
      }
    } catch (error) {
      console.log('Could not fetch fund summary');
    } finally {
      setFetchingFund(false);
    }
  };

  const handleViewInstallments = async (loan) => {
    const loanId = loan?.loan_id || loan?.id;
    if (!loanId) {
      toast.error('Invalid loan data');
      return;
    }

    console.log('Viewing installments for loan:', loanId);
    setSelectedLoanForInstallments(loan);
    setLoadingInstallments(true);
    
    try {
      const response = await api.get(`/finance/loan/${pundData.pund_id}/installments/`);
      console.log('All installments response:', response.data);
      
      // Filter installments for this specific loan - compare as numbers
      const loanInstallments = response.data.filter(inst => 
        parseInt(inst.loan_id) === parseInt(loanId)
      );
      
      console.log('Filtered installments for loan', loanId, ':', loanInstallments);
      
      if (loanInstallments.length === 0) {
        toast.info('No installments found for this loan');
      }
      
      setInstallments(loanInstallments);
      setShowInstallmentModal(true);
    } catch (error) {
      console.error('Error fetching installments:', error);
      toast.error('Failed to load installments');
    } finally {
      setLoadingInstallments(false);
    }
  };

  const handleMarkInstallmentPaid = async (installmentId) => {
    setMarkingPaid(true);
    try {
      await api.post(`/finance/installment/${installmentId}/mark-paid/`);
      toast.success('Installment marked as paid');
      
      // Refresh installments
      const instResponse = await api.get(`/finance/loan/${pundData.pund_id}/installments/`);
      const updatedInstallments = instResponse.data.filter(
        inst => parseInt(inst.loan_id) === parseInt(selectedLoanForInstallments?.loan_id)
      );
      setInstallments(updatedInstallments);
      
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark installment as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleApproveLoanClick = (loan) => {
    const loanId = loan?.loan_id || loan?.id;
    if (!loanId) {
      toast.error('Invalid loan data');
      return;
    }
    const cycles = prompt('Enter number of cycles for repayment:', '6');
    if (cycles && parseInt(cycles) > 0) {
      onApproveLoan(loanId, parseInt(cycles));
    }
  };

  const handleRejectClick = (loan) => {
    const loanId = loan?.loan_id || loan?.id;
    setRejectLoanId(loanId);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/finance/loan/${rejectLoanId}/reject/`, { reason: rejectReason });
      toast.success('Loan rejected successfully');
      
      if (onRejectLoan) onRejectLoan(rejectLoanId, rejectReason);
      
      setShowRejectModal(false);
      setRejectReason('');
      setRejectLoanId(null);
      
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject loan');
    } finally {
      setLoading(false);
    }
  };

  const calculateRemaining = (loan) => {
    const totalPayable = parseFloat(loan?.total_payable || loan?.principal || 0);
    const paid = parseFloat(loan?.paid_amount || 0);
    return Math.max(0, totalPayable - paid);
  };

  if (!role) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-600">Loading loans...</span>
      </div>
    );
  }

  // Owner View
  if (role === 'OWNER') {
    const pendingRequests = loans.filter(loan => loan?.status === 'PENDING');
    const activeLoans = loans.filter(loan => loan?.status === 'APPROVED' || loan?.status === 'ACTIVE');
    const closedLoans = loans.filter(loan => loan?.status === 'CLOSED');
    const rejectedLoans = loans.filter(loan => loan?.status === 'REJECTED');

    const getStatusBadge = (status) => {
      switch(status) {
        case 'PENDING': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FiClock, label: 'Pending' };
        case 'APPROVED': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: FiCheckCircle, label: 'Approved' };
        case 'ACTIVE': return { bg: 'bg-green-100', text: 'text-green-700', icon: FiTrendingUp, label: 'Active' };
        case 'CLOSED': return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiCheckCircle, label: 'Closed' };
        case 'REJECTED': return { bg: 'bg-red-100', text: 'text-red-700', icon: FiXCircle, label: 'Rejected' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiClock, label: status };
      }
    };

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Total Loans</p>
            <p className="text-sm font-bold text-gray-900">{loans.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Pending</p>
            <p className="text-sm font-bold text-yellow-600">{pendingRequests.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Active</p>
            <p className="text-sm font-bold text-green-600">{activeLoans.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Available Fund</p>
            <p className="text-sm font-bold text-blue-600">{formatCurrency(availableFund)}</p>
          </div>
        </div>

        {/* Pending Loans */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-3 py-2 border-b border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-yellow-600" />
                <h3 className="text-xs font-semibold text-gray-900">Pending Loan Requests</h3>
              </div>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-medium">
                {pendingRequests.length}
              </span>
            </div>
          </div>
          <div className="p-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <FiCreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No pending loan requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((loan) => {
                  const memberName = loan?.member?.split('@')[0] || 'Unknown';
                  const principal = parseFloat(loan?.principal || 0);
                  
                  return (
                    <div key={loan.loan_id} className="border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                            {memberName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{memberName}</p>
                            <p className="text-[8px] text-gray-500">{loan.member}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-yellow-700">{formatCurrency(principal)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-[8px] text-gray-500">Principal</p>
                          <p className="text-[10px] font-bold text-gray-900">{formatCurrency(principal)}</p>
                        </div>
                        <div className="bg-blue-50 rounded p-2">
                          <p className="text-[8px] text-blue-600">Available Fund</p>
                          <p className={`text-[10px] font-bold ${principal <= availableFund ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(availableFund)}
                          </p>
                        </div>
                      </div>
                      {principal > availableFund && (
                        <div className="bg-red-50 rounded p-2 mb-3 flex items-start space-x-2">
                          <FiAlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[9px] text-red-700">
                            Insufficient funds! Requested amount exceeds available balance by {formatCurrency(principal - availableFund)}
                          </p>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveLoanClick(loan)}
                          disabled={approvingLoan || principal > availableFund}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] flex items-center justify-center space-x-1 ${
                            principal <= availableFund ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <FiCheck className="w-3 h-3" /><span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectClick(loan)}
                          className="flex-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg text-[9px] hover:bg-red-200 flex items-center justify-center space-x-1"
                        >
                          <FiX className="w-3 h-3" /><span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 px-3 py-2 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiTrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="text-xs font-semibold text-gray-900">Active Loans</h3>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                {activeLoans.length}
              </span>
            </div>
          </div>
          <div className="p-3">
            {activeLoans.length === 0 ? (
              <div className="text-center py-6">
                <FiCreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No active loans</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeLoans.map((loan) => {
                  const status = getStatusBadge(loan?.status);
                  const StatusIcon = status.icon;
                  const memberName = loan?.member?.split('@')[0] || 'Unknown';
                  const principal = parseFloat(loan?.principal || 0);
                  const paid = parseFloat(loan?.paid_amount || 0);
                  const remaining = principal - paid; // For approved loans, remaining should be principal - paid
                  const progress = principal > 0 ? Math.round((paid / principal) * 100) : 0;

                  return (
                    <div key={loan.loan_id} className="border border-green-200 rounded-lg overflow-hidden">
                      <div 
                        className="bg-green-50/50 px-3 py-2 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedLoan(expandedLoan === loan.loan_id ? null : loan.loan_id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                            {memberName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{memberName}</p>
                            <p className="text-[8px] text-gray-500">Loan #{loan.loan_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium flex items-center space-x-1 ${status.bg} ${status.text}`}>
                            <StatusIcon className="w-2.5 h-2.5 mr-0.5" />{status.label}
                          </span>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleViewInstallments(loan); 
                            }}
                            className="p-1.5 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                            title="View Installments"
                          >
                            <FiEye className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                      {expandedLoan === loan.loan_id && (
                        <div className="p-3 bg-white border-t border-green-100">
                          <div className="mb-3">
                            <div className="flex justify-between text-[8px] mb-1">
                              <span className="text-gray-500">Repayment Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-blue-50 rounded p-2">
                              <p className="text-[7px] text-blue-600">Principal</p>
                              <p className="text-[9px] font-bold text-gray-900">{formatCurrency(principal)}</p>
                            </div>
                            <div className="bg-green-50 rounded p-2">
                              <p className="text-[7px] text-green-600">Paid</p>
                              <p className="text-[9px] font-bold text-green-600">{formatCurrency(paid)}</p>
                            </div>
                            <div className="bg-orange-50 rounded p-2">
                              <p className="text-[7px] text-orange-600">Remaining</p>
                              <p className="text-[9px] font-bold text-orange-600">{formatCurrency(remaining)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Closed Loans */}
        {closedLoans.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="w-4 h-4 text-gray-600" />
                  <h3 className="text-xs font-semibold text-gray-900">Closed Loans</h3>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-medium">
                  {closedLoans.length}
                </span>
              </div>
            </div>
            <div className="p-3">
              {closedLoans.map((loan) => (
                <div key={loan.loan_id} className="border border-gray-200 rounded-lg p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 text-[8px] font-bold">
                        {loan.member?.split('@')[0]?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <p className="text-[10px] font-medium text-gray-900">{loan.member?.split('@')[0] || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-900">{formatCurrency(loan.principal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Loans */}
        {rejectedLoans.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 px-3 py-2 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiXCircle className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-semibold text-gray-900">Rejected Loans</h3>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
                  {rejectedLoans.length}
                </span>
              </div>
            </div>
            <div className="p-3">
              {rejectedLoans.map((loan) => (
                <div key={loan.loan_id} className="border border-red-200 rounded-lg p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center text-red-700 text-[8px] font-bold">
                        {loan.member?.split('@')[0]?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <p className="text-[10px] font-medium text-gray-900">{loan.member?.split('@')[0] || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-900">{formatCurrency(loan.principal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        <AnimatePresence>
          {showRejectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRejectModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl max-w-sm w-full p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Reject Loan Request</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg mb-3"
                  rows="3"
                  placeholder="Enter reason for rejection..."
                  required
                />
                <div className="flex space-x-2">
                  <button onClick={() => setShowRejectModal(false)} className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs">Cancel</button>
                  <button onClick={handleConfirmReject} disabled={loading || !rejectReason.trim()} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50">
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Reject'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Member View
  const displayAvailableFund = memberAvailableFund > 0 ? memberAvailableFund : availableFund;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-[8px] text-gray-500">My Total Loans</p>
          <p className="text-sm font-bold text-gray-900">{myLoans.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-[8px] text-gray-500">Active Loans</p>
          <p className="text-sm font-bold text-green-600">{myLoans.filter(l => l?.status === 'ACTIVE' || l?.status === 'APPROVED').length}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiDollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Available Fund to Borrow</span>
          </div>
          <span className="text-sm font-bold text-blue-800">{formatCurrency(displayAvailableFund)}</span>
        </div>
      </div>

      <button
        onClick={() => displayAvailableFund > 0 ? setShowLoanModal(true) : toast.error('No funds available')}
        disabled={displayAvailableFund <= 0}
        className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center space-x-2 ${
          displayAvailableFund > 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <FiCreditCard className="w-4 h-4" />
        <span>{displayAvailableFund > 0 ? 'Request New Loan' : 'No Funds Available'}</span>
      </button>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">My Loan Requests</h3>
        </div>
        <div className="p-3">
          {myLoans.length === 0 ? (
            <div className="text-center py-6">
              <FiCreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No loan requests yet</p>
            </div>
          ) : (
            myLoans.map((loan) => {
              const status = loan?.status === 'PENDING' ? { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
                : loan?.status === 'APPROVED' ? { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved' }
                : loan?.status === 'ACTIVE' ? { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' }
                : loan?.status === 'REJECTED' ? { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
                : { bg: 'bg-gray-100', text: 'text-gray-700', label: loan?.status || 'Unknown' };

              const principal = parseFloat(loan?.principal_amount || loan?.principal || 0);
              const paid = parseFloat(loan?.paid_amount || 0);
              const remaining = principal - paid;

              return (
                <div key={loan.id || loan.loan_id} className="border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-900">Loan #{loan.id || loan.loan_id}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${status.bg} ${status.text}`}>{status.label}</span>
                      {(loan?.status === 'ACTIVE' || loan?.status === 'APPROVED') && (
                        <button 
                          onClick={() => {
                            const loanForInstallments = {
                              loan_id: loan.id || loan.loan_id,
                              member: loan.member_email || loan.member
                            };
                            handleViewInstallments(loanForInstallments);
                          }} 
                          className="p-1.5 bg-blue-100 rounded-lg hover:bg-blue-200 transition" 
                          title="View Installments"
                        >
                          <FiEye className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-[8px] text-gray-500">Principal</p><p className="text-[10px] font-bold text-gray-900">{formatCurrency(principal)}</p></div>
                    <div><p className="text-[8px] text-gray-500">Interest</p><p className="text-[10px] font-bold text-purple-600">{formatCurrency(loan.interest_amount || 0)}</p></div>
                  </div>
                  {(loan?.status === 'ACTIVE' || loan?.status === 'APPROVED') && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-green-50 rounded p-2">
                        <p className="text-[7px] text-green-600">Paid</p>
                        <p className="text-[8px] font-bold text-green-600">{formatCurrency(paid)}</p>
                      </div>
                      <div className="bg-orange-50 rounded p-2">
                        <p className="text-[7px] text-orange-600">Remaining</p>
                        <p className="text-[8px] font-bold text-orange-600">{formatCurrency(remaining)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <InstallmentModal
        isOpen={showInstallmentModal}
        onClose={() => setShowInstallmentModal(false)}
        installments={installments}
        loading={loadingInstallments}
        onMarkPaid={handleMarkInstallmentPaid}
        isOwner={role === 'OWNER'}
        markingPaid={markingPaid}
      />

      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onSubmit={onRequestLoan}
        submitting={false}
        availableFund={displayAvailableFund}
      />
    </div>
  );
};

export default LoansTab;