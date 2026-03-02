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
  FiLoader
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import LoanModal from './Modals/LoanModal';

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
  approvingLoan = false 
}) => {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLoanId, setRejectLoanId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Calculate available fund for validation with safe access
  const availableFund = pundData?.fund_summary?.available_fund || 0;

  // Debug logs
  useEffect(() => {
    console.log('LoansTab - Role:', role);
    console.log('LoansTab - Loans:', loans);
    console.log('LoansTab - MyLoans:', myLoans);
    console.log('LoansTab - PundData:', pundData);
    console.log('LoansTab - Available Fund:', availableFund);
  }, [role, loans, myLoans, pundData, availableFund]);

  // If no data, show loading
  if (!role) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-600">Loading loans...</span>
      </div>
    );
  }

  // Owner View - Complete Sections
  if (role === 'OWNER') {
    // Filter loans for owner view with safe access
    const pendingRequests = Array.isArray(loans) ? loans.filter(loan => loan?.status === 'PENDING') : [];
    const activeLoans = Array.isArray(loans) ? loans.filter(loan => 
      loan?.status === 'APPROVED' || loan?.status === 'ACTIVE'
    ) : [];
    const closedLoans = Array.isArray(loans) ? loans.filter(loan => loan?.status === 'CLOSED') : [];
    const rejectedLoans = Array.isArray(loans) ? loans.filter(loan => loan?.status === 'REJECTED') : [];

    const getStatusBadge = (status) => {
      switch(status) {
        case 'PENDING':
          return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FiClock, label: 'Pending' };
        case 'APPROVED':
          return { bg: 'bg-blue-100', text: 'text-blue-700', icon: FiCheckCircle, label: 'Approved' };
        case 'ACTIVE':
          return { bg: 'bg-green-100', text: 'text-green-700', icon: FiTrendingUp, label: 'Active' };
        case 'CLOSED':
          return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiCheckCircle, label: 'Closed' };
        case 'REJECTED':
          return { bg: 'bg-red-100', text: 'text-red-700', icon: FiXCircle, label: 'Rejected' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiClock, label: status || 'Unknown' };
      }
    };

    const calculateProgress = (loan) => {
      if (!loan?.total_payable || !loan?.paid_amount) return 0;
      return Math.round((loan.paid_amount / loan.total_payable) * 100);
    };

    const handleRejectClick = (loanId) => {
      setRejectLoanId(loanId);
      setShowRejectModal(true);
    };

    const handleConfirmReject = () => {
      if (onRejectLoan) {
        onRejectLoan(rejectLoanId, rejectReason);
      } else {
        toast.success('Loan rejected successfully');
      }
      setShowRejectModal(false);
      setRejectReason('');
      setRejectLoanId(null);
    };

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-[10px] text-gray-500">Total Loans</p>
            <p className="text-sm font-bold text-gray-900">{loans?.length || 0}</p>
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

        {/* Section 1: Pending Loan Requests */}
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
                {pendingRequests.map((loan) => (
                  <motion.div
                    key={loan?.id || Math.random()}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-yellow-200 rounded-lg overflow-hidden"
                  >
                    {/* Loan Request Header */}
                    <div className="bg-yellow-50/50 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                          {loan?.member_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">{loan?.member_name || 'Unknown'}</p>
                          <p className="text-[8px] text-gray-500">
                            Requested: {loan?.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-yellow-700">
                        {formatCurrency(loan?.principal_amount)}
                      </span>
                    </div>

                    {/* Loan Details */}
                    <div className="p-3 bg-white">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-[8px] text-gray-500">Principal</p>
                          <p className="text-[10px] font-bold text-gray-900">{formatCurrency(loan?.principal_amount)}</p>
                        </div>
                        <div className="bg-blue-50 rounded p-2">
                          <p className="text-[8px] text-blue-600">Available Fund</p>
                          <p className={`text-[10px] font-bold ${loan?.principal_amount <= availableFund ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(availableFund)}
                          </p>
                        </div>
                      </div>

                      {/* Validation Warning */}
                      {loan?.principal_amount > availableFund && (
                        <div className="bg-red-50 rounded p-2 mb-3 flex items-start space-x-2">
                          <FiAlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[9px] text-red-700">
                            Insufficient funds! Requested amount exceeds available balance by {formatCurrency(loan.principal_amount - availableFund)}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const cycles = prompt('Enter number of cycles for repayment:', '6');
                            if (cycles && parseInt(cycles) > 0) {
                              onApproveLoan(loan.id, parseInt(cycles));
                            }
                          }}
                          disabled={approvingLoan || loan?.principal_amount > availableFund}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] flex items-center justify-center space-x-1 ${
                            loan?.principal_amount <= availableFund
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <FiCheck className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectClick(loan.id)}
                          className="flex-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-lg text-[9px] hover:bg-red-200 flex items-center justify-center space-x-1"
                        >
                          <FiX className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Active/Approved Loans */}
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
                  const progress = calculateProgress(loan);
                  
                  return (
                    <motion.div
                      key={loan?.id || Math.random()}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-green-200 rounded-lg overflow-hidden"
                    >
                      {/* Loan Header */}
                      <div 
                        className="bg-green-50/50 px-3 py-2 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedLoan(expandedLoan === loan?.id ? null : loan?.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                            {loan?.member_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{loan?.member_name || 'Unknown'}</p>
                            <p className="text-[8px] text-gray-500">Loan #{loan?.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium flex items-center space-x-1 ${status.bg} ${status.text}`}>
                            <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                            {status.label}
                          </span>
                          <span className="text-[10px] font-bold text-gray-900">
                            {formatCurrency(loan?.principal_amount)}
                          </span>
                        </div>
                      </div>

                      {/* Loan Details */}
                      {expandedLoan === loan?.id && (
                        <div className="p-3 bg-white border-t border-green-100">
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-[8px] mb-1">
                              <span className="text-gray-500">Repayment Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Loan Stats */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-blue-50 rounded p-2">
                              <p className="text-[7px] text-blue-600">Principal</p>
                              <p className="text-[9px] font-bold text-gray-900">{formatCurrency(loan?.principal_amount)}</p>
                            </div>
                            <div className="bg-purple-50 rounded p-2">
                              <p className="text-[7px] text-purple-600">Interest</p>
                              <p className="text-[9px] font-bold text-gray-900">{formatCurrency(loan?.interest_amount || 0)}</p>
                            </div>
                            <div className="bg-orange-50 rounded p-2">
                              <p className="text-[7px] text-orange-600">Total Payable</p>
                              <p className="text-[9px] font-bold text-gray-900">{formatCurrency(loan?.total_payable || loan?.principal_amount)}</p>
                            </div>
                          </div>

                          {/* Paid vs Remaining */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-green-50 rounded p-2">
                              <p className="text-[7px] text-green-600">Paid</p>
                              <p className="text-[9px] font-bold text-gray-900">{formatCurrency(loan?.paid_amount || 0)}</p>
                            </div>
                            <div className="bg-orange-50 rounded p-2">
                              <p className="text-[7px] text-orange-600">Remaining</p>
                              <p className="text-[9px] font-bold text-gray-900">{formatCurrency(loan?.remaining_amount || 0)}</p>
                            </div>
                          </div>

                          {/* Installments */}
                          {loan?.installments && loan.installments.length > 0 && (
                            <div>
                              <p className="text-[9px] font-medium text-gray-700 mb-2">Installments</p>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {loan.installments.map((inst) => (
                                  <div
                                    key={inst?.id || Math.random()}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                        inst?.is_paid ? 'bg-green-100' : 'bg-yellow-100'
                                      }`}>
                                        {inst?.is_paid ? (
                                          <FiCheckCircle className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <FiClock className="w-3 h-3 text-yellow-600" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-[8px] text-gray-500">Installment #{inst?.number || inst?.installment_number}</p>
                                        <p className="text-[9px] font-medium">{formatCurrency(inst?.amount || inst?.emi_amount)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <p className="text-[8px] text-gray-500">
                                        Due: {inst?.due_date ? new Date(inst.due_date).toLocaleDateString() : 'N/A'}
                                      </p>
                                      {!inst?.is_paid && (
                                        <button
                                          onClick={() => onMarkInstallment(inst.id)}
                                          className="px-2 py-1 bg-green-600 text-white rounded text-[8px] hover:bg-green-700"
                                        >
                                          Mark Paid
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Closed Loans */}
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
              <div className="space-y-2">
                {closedLoans.map((loan) => (
                  <div key={loan?.id || Math.random()} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 text-[8px] font-bold">
                          {loan?.member_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <p className="text-[10px] font-medium text-gray-900">{loan?.member_name}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-900">{formatCurrency(loan?.principal_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Rejected Loans */}
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
              <div className="space-y-2">
                {rejectedLoans.map((loan) => (
                  <div key={loan?.id || Math.random()} className="border border-red-200 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center text-red-700 text-[8px] font-bold">
                          {loan?.member_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <p className="text-[10px] font-medium text-gray-900">{loan?.member_name}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-900">{formatCurrency(loan?.principal_amount)}</span>
                    </div>
                    {loan?.rejection_reason && (
                      <p className="text-[8px] text-red-600 mt-1">Reason: {loan.rejection_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reject Loan Modal */}
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
                <p className="text-xs text-gray-600 mb-3">Please provide a reason for rejection:</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg mb-3"
                  rows="3"
                  placeholder="Enter reason..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs"
                  >
                    Confirm Reject
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
  return (
    <div className="space-y-3">
      {/* My Loans Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-[8px] text-gray-500">My Total Loans</p>
          <p className="text-sm font-bold text-gray-900">{(myLoans && Array.isArray(myLoans)) ? myLoans.length : 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-[8px] text-gray-500">Active Loans</p>
          <p className="text-sm font-bold text-green-600">
            {(myLoans && Array.isArray(myLoans)) 
              ? myLoans.filter(l => l?.status === 'ACTIVE' || l?.status === 'APPROVED').length 
              : 0}
          </p>
        </div>
      </div>

      {/* Available Fund Display for Member */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiDollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Available Fund to Borrow</span>
          </div>
          <span className="text-sm font-bold text-blue-800">{formatCurrency(availableFund)}</span>
        </div>
      </div>

      {/* Request Loan Button */}
      <button
        onClick={() => setShowLoanModal(true)}
        disabled={availableFund <= 0}
        className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center space-x-2 ${
          availableFund > 0
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } transition-all`}
      >
        <FiCreditCard className="w-4 h-4" />
        <span>{availableFund > 0 ? 'Request New Loan' : 'No Funds Available'}</span>
      </button>

      {/* My Loans List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">My Loan Requests</h3>
        </div>
        <div className="p-3">
          {!myLoans || myLoans.length === 0 ? (
            <div className="text-center py-6">
              <FiCreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No loan requests yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myLoans.map((loan) => {
                const status = loan?.status === 'PENDING' 
                  ? { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
                  : loan?.status === 'APPROVED'
                  ? { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved' }
                  : loan?.status === 'ACTIVE'
                  ? { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' }
                  : loan?.status === 'REJECTED'
                  ? { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
                  : loan?.status === 'CLOSED'
                  ? { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' }
                  : { bg: 'bg-gray-100', text: 'text-gray-700', label: loan?.status || 'Unknown' };

                return (
                  <motion.div
                    key={loan?.id || Math.random()}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition cursor-pointer"
                    onClick={() => setExpandedLoan(expandedLoan === loan?.id ? null : loan?.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-900">Loan #{loan?.id}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[8px] text-gray-500">Principal</p>
                        <p className="text-[10px] font-bold text-gray-900">{formatCurrency(loan?.principal_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500">Interest</p>
                        <p className="text-[10px] font-bold text-gray-900">{formatCurrency(loan?.interest_amount || 0)}</p>
                      </div>
                    </div>

                    {/* Expanded Details for Member */}
                    {expandedLoan === loan?.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {loan?.status === 'APPROVED' && loan?.total_payable && (
                          <div className="mb-2 p-2 bg-blue-50 rounded">
                            <p className="text-[8px] text-blue-600">Total Payable: {formatCurrency(loan.total_payable)}</p>
                          </div>
                        )}
                        {loan?.status === 'ACTIVE' && loan?.installments && (
                          <div>
                            <p className="text-[9px] font-medium text-gray-700 mb-2">Installments</p>
                            <div className="space-y-1.5">
                              {loan.installments.map((inst) => (
                                <div key={inst?.id || Math.random()} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                      inst?.is_paid ? 'bg-green-100' : 'bg-yellow-100'
                                    }`}>
                                      {inst?.is_paid ? (
                                        <FiCheckCircle className="w-2.5 h-2.5 text-green-600" />
                                      ) : (
                                        <FiClock className="w-2.5 h-2.5 text-yellow-600" />
                                      )}
                                    </div>
                                    <p className="text-[8px] text-gray-600">
                                      Due: {inst?.due_date ? new Date(inst.due_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <p className="text-[8px] font-medium">{formatCurrency(inst?.amount)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {loan?.status === 'REJECTED' && loan?.rejection_reason && (
                          <div className="p-2 bg-red-50 rounded text-[8px] text-red-700">
                            Reason: {loan.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loan Request Modal */}
      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onSubmit={onRequestLoan}
        submitting={false}
        availableFund={availableFund}
      />
    </div>
  );
};

export default LoansTab;