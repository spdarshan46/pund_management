// src/pages/dashboard/MyLoans.jsx
import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/finance/my-loans/');
      console.log('Loans response:', response.data); // Debug log
      setLoans(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  // Calculate EMI amount from total_payable and total_installments
  const calculateEmi = (loan) => {
    if (loan.total_installments && loan.total_installments > 0) {
      const totalPayable = parseFloat(loan.total_payable) || 0;
      return Math.round(totalPayable / loan.total_installments);
    }
    return 0;
  };

  // Calculate progress based on paid installments or paid amount
  const calculateProgress = (loan) => {
    // If progress is provided by API, use it
    if (loan.progress && loan.progress > 0) {
      return loan.progress;
    }
    
    // Otherwise calculate from installments
    if (loan.total_installments && loan.total_installments > 0) {
      return Math.round((loan.paid_installments / loan.total_installments) * 100);
    }
    
    // Or calculate from amounts
    const totalPayable = parseFloat(loan.total_payable) || 0;
    const paidAmount = parseFloat(loan.paid_amount) || 0;
    if (totalPayable > 0) {
      return Math.round((paidAmount / totalPayable) * 100);
    }
    
    return 0;
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return <FiTrendingUp className="w-3 h-3 text-green-600" />;
      case 'pending':
        return <FiClock className="w-3 h-3 text-yellow-600" />;
      case 'approved':
        return <FiCheckCircle className="w-3 h-3 text-blue-600" />;
      case 'closed':
        return <FiCheckCircle className="w-3 h-3 text-gray-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-base font-semibold text-gray-900 mb-3">My Loans</h1>

      {loans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiCreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No loans yet</h3>
          <p className="text-xs text-gray-500">Your loans will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {loans.map((loan) => {
            const emiAmount = calculateEmi(loan);
            const progress = calculateProgress(loan);
            const paidInstallments = loan.paid_installments || 0;
            const totalInstallments = loan.total_installments || 0;
            const principal = parseFloat(loan.principal) || 0;
            const totalPayable = parseFloat(loan.total_payable) || 0;
            const paidAmount = parseFloat(loan.paid_amount) || 0;
            const remaining = parseFloat(loan.remaining) || (totalPayable - paidAmount);
            
            return (
              <div key={loan.loan_id} className="bg-white border border-gray-200 rounded-lg p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                      <FiCreditCard className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {loan.pund} • Loan #{loan.loan_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(loan.status)}
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-gray-500">Principal</p>
                    <p className="text-xs font-medium text-gray-900">₹{principal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Total Payable</p>
                    <p className="text-xs font-medium text-gray-900">₹{totalPayable.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Paid</p>
                    <p className="text-xs font-medium text-green-600">₹{paidAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-gray-500">Progress</p>
                    <p className="text-[10px] font-medium text-gray-700">{progress}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Installments</p>
                      <p className="text-xs font-medium text-gray-900">
                        {paidInstallments}/{totalInstallments}
                        {totalInstallments === paidInstallments && totalInstallments > 0 && (
                          <span className="ml-1 text-[10px] text-green-600">✓ Completed</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Remaining</p>
                      <p className="text-xs font-medium text-gray-900">₹{remaining.toLocaleString()}</p>
                    </div>
                  </div>
                  {emiAmount > 0 && loan.status?.toLowerCase() === 'active' && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">EMI</p>
                      <p className="text-xs font-medium text-blue-600">₹{emiAmount.toLocaleString()}/mo</p>
                    </div>
                  )}
                  {loan.status?.toLowerCase() === 'closed' && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Status</p>
                      <p className="text-xs font-medium text-green-600">Fully Paid</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLoans;