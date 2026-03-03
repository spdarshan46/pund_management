// src/pages/PundDetail/components/OverviewTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi';
import api from '../../../services/api';

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `₹ ${numAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const parseAmount = (value) => {
  return parseFloat(value) || 0;
};

const OverviewTab = ({ pundData, role, fundSummary: propFundSummary, savingSummary: propSavingSummary, myFinancials }) => {
  const [fundSummary, setFundSummary] = useState(propFundSummary);
  const [savingSummary, setSavingSummary] = useState(propSavingSummary);
  const [loading, setLoading] = useState(false);

  // Fetch data if not provided via props (for members)
  useEffect(() => {
    if (role === 'MEMBER' && !propFundSummary && !propSavingSummary) {
      fetchSummaries();
    }
  }, [role, pundData?.pund_id]);

  // Update when props change
  useEffect(() => {
    setFundSummary(propFundSummary);
    setSavingSummary(propSavingSummary);
  }, [propFundSummary, propSavingSummary]);

  const fetchSummaries = async () => {
    if (!pundData?.pund_id) return;

    setLoading(true);
    try {
      // Try to fetch fund summary
      try {
        const fundResponse = await api.get(`/finance/pund/${pundData.pund_id}/fund-summary/`);
        setFundSummary(fundResponse.data);
      } catch (error) {
        console.log('Fund summary not available, calculating from cycles...');
        // Calculate from cycles as fallback
        await calculateFromCycles();
      }

      // Try to fetch saving summary
      try {
        const savingResponse = await api.get(`/finance/pund/${pundData.pund_id}/saving-summary/`);
        setSavingSummary(savingResponse.data);
      } catch (error) {
        console.log('Saving summary not available');
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFromCycles = async () => {
    try {
      const response = await api.get(`/finance/pund/${pundData.pund_id}/cycle-payments/`);
      const cycles = response.data;

      let totalCollected = 0;
      let totalPenalties = 0;
      let totalExpected = 0;
      let totalPaid = 0;
      const uniqueCycles = new Set();
      const uniqueMembers = new Set();

      cycles.forEach(cycle => {
        uniqueCycles.add(cycle.cycle_number);

        cycle.payments?.forEach(payment => {
          uniqueMembers.add(payment.member_id);
          totalExpected += parseAmount(payment.amount);

          if (payment.is_paid) {
            totalCollected += parseAmount(payment.amount) + parseAmount(payment.penalty_amount);
            totalPaid += parseAmount(payment.amount) + parseAmount(payment.penalty_amount);
            totalPenalties += parseAmount(payment.penalty_amount);
          }
        });
      });

      // Try to get loan data
      let activeLoanPrincipal = 0;
      let activeLoanOutstanding = 0;
      try {
        const loansResponse = await api.get(`/finance/pund/${pundData.pund_id}/loans/`);
        const loans = loansResponse.data || [];

        loans.forEach(loan => {
          if (loan.is_active || loan.status === 'ACTIVE' || loan.status === 'APPROVED') {
            activeLoanPrincipal += parseAmount(loan.principal_amount);
            activeLoanOutstanding += parseAmount(loan.remaining_amount || loan.total_payable || 0);
          }
        });
      } catch (e) {
        console.log('Could not fetch loan data');
      }

      const available = totalCollected - activeLoanPrincipal;

      setFundSummary({
        total_collected: totalCollected.toString(),
        active_loan_outstanding: activeLoanOutstanding.toString(),
        active_loan_principal: activeLoanPrincipal.toString(),
        available_fund: available.toString()
      });

      setSavingSummary({
        total_cycles: uniqueCycles.size,
        total_members: uniqueMembers.size,
        total_expected_savings: totalExpected.toString(),
        total_paid_savings: totalPaid.toString(),
        total_unpaid_savings: (totalExpected - (totalPaid - totalPenalties)).toString(),
        total_penalties_collected: totalPenalties.toString()
      });

    } catch (error) {
      console.error('Error calculating from cycles:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-xs text-gray-600">Loading overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Structure Card - Visible to everyone */}
      {pundData?.structure && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <FiInfo className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Current Structure</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Saving Amount</p>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(pundData.structure.saving_amount)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Interest Rate</p>
              <p className="text-sm font-bold text-gray-900">
                {pundData.structure.loan_interest_percentage || 0}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Saving Penalty</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(pundData.structure.missed_saving_penalty)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Loan Penalty</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(pundData.structure.missed_loan_penalty)}
              </p>
            </div>
          </div>

          {pundData.structure.effective_from && (
            <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
              <span className="font-medium">Effective from:</span>{' '}
              {new Date(pundData.structure.effective_from).toLocaleDateString('en-IN')}
            </div>
          )}
        </motion.div>
      )}

      {/* Fund Summary - Visible to everyone */}
      {fundSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white">
            <div className="flex items-center space-x-1 mb-1">
              <FiDollarSign className="w-3.5 h-3.5 text-blue-100" />
              <p className="text-[10px] text-blue-100">Total Collected</p>
            </div>
            <p className="text-base font-bold">{formatCurrency(fundSummary.total_collected)}</p>
            {savingSummary && (
              <p className="text-[8px] text-blue-200 mt-1">
                Savings: {formatCurrency((parseAmount(fundSummary.total_collected) - parseAmount(savingSummary.total_penalties_collected)))} |
                Penalties: {formatCurrency(savingSummary.total_penalties_collected)}
              </p>
            )}
          </div>


          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-3 text-white">
            <div className="flex items-center space-x-1 mb-1">
              <FiTrendingUp className="w-3.5 h-3.5 text-purple-100" />
              <p className="text-[10px] text-purple-100">Active Loans</p>
            </div>
            <p className="text-base font-bold">{formatCurrency(fundSummary.active_loan_outstanding)}</p>

            <p className="text-[8px] text-purple-200 mt-1">
              Principal: {formatCurrency(fundSummary?.active_loan_principal || 0)} |
              Interest: {formatCurrency(fundSummary?.active_loan_interest || 0)}
            </p>
          </div>


          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-white">
            <div className="flex items-center space-x-1 mb-1">
              <FiClock className="w-3.5 h-3.5 text-green-100" />
              <p className="text-[10px] text-green-100">Available Fund</p>
            </div>
            <p className="text-base font-bold">{formatCurrency(fundSummary.available_fund)}</p>
            <p className="text-[8px] text-green-200 mt-1">
              = Collected - Outstanding Loans
            </p>
            {/* Add a small breakdown */}
            <div className="mt-1 text-[7px] text-green-200 opacity-75">
              Collected: {formatCurrency(fundSummary.total_collected)} -
              Outstanding: {formatCurrency(fundSummary.active_loan_outstanding)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Saving Summary - Visible to everyone */}
      {savingSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Saving Summary</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[8px] text-gray-500">Cycles</p>
              <p className="text-sm font-bold text-gray-900">{savingSummary.total_cycles || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[8px] text-gray-500">Members</p>
              <p className="text-sm font-bold text-gray-900">{savingSummary.total_members || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[8px] text-gray-500">Expected</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(savingSummary.total_expected_savings)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[8px] text-gray-500">Paid</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(savingSummary.total_paid_savings)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[8px] text-gray-500">Unpaid</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(savingSummary.total_unpaid_savings)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[8px] text-gray-500">Penalties</p>
              <p className="text-sm font-bold text-orange-600">{formatCurrency(savingSummary.total_penalties_collected)}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Breakdown</h4>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Savings Collected:</span>
                <span className="font-medium">
                  {formatCurrency(parseAmount(savingSummary.total_paid_savings) - parseAmount(savingSummary.total_penalties_collected))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Penalties Collected:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(savingSummary.total_penalties_collected)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="font-medium text-gray-700">Total Paid:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(savingSummary.total_paid_savings)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Member Personal Overview - Only for Members */}
      {role === 'MEMBER' && myFinancials && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* My Savings */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">My Savings</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-[8px] text-blue-600 mb-0.5">Total Paid</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(myFinancials.saving_summary?.total_savings_paid)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="text-[8px] text-yellow-600 mb-0.5">Unpaid</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(myFinancials.saving_summary?.total_unpaid_savings)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-[8px] text-red-600 mb-0.5">Penalties</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(myFinancials.saving_summary?.total_saving_penalty)}
                </p>
              </div>
            </div>
          </div>

          {/* My Active Loan */}
          {myFinancials.loan_summary && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">My Active Loan</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[8px] text-gray-500">Principal</p>
                  <p className="text-xs font-bold text-gray-900">
                    {formatCurrency(myFinancials.loan_summary.principal)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[8px] text-gray-500">Remaining</p>
                  <p className="text-xs font-bold text-orange-600">
                    {formatCurrency(myFinancials.loan_summary.remaining_amount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[8px] text-gray-500">Total Payable</p>
                  <p className="text-xs font-bold text-gray-900">
                    {formatCurrency(myFinancials.loan_summary.total_payable)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[8px] text-gray-500">Status</p>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full inline-block ${myFinancials.loan_summary.status === 'APPROVED' || myFinancials.loan_summary.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {myFinancials.loan_summary.status || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OverviewTab;