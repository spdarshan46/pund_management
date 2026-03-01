// src/pages/PundDetail/components/OverviewTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatters';

const OverviewTab = ({ pundData, role, fundSummary, savingSummary, myFinancials }) => {
  return (
    <div className="space-y-8">
      {/* Structure Card */}
      {pundData?.structure && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Structure</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Saving Amount</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {formatCurrency(pundData.structure.saving_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Interest Rate</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {pundData.structure.loan_interest_percentage}%
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Saving Penalty</p>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                {formatCurrency(pundData.structure.missed_saving_penalty ||
                  pundData.structure.missed_week_penalty || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Loan Penalty</p>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                {formatCurrency(pundData.structure.missed_loan_penalty || 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
            <span className="font-medium">Set by Owner on:</span> {
              pundData.structure.effective_from
                ? new Date(pundData.structure.effective_from).toLocaleDateString()
                : 'Not set'
            }
          </div>
        </motion.div>
      )}

      {/* Owner Overview */}
      {role === 'OWNER' && fundSummary && savingSummary && (
        <>
          {/* Fund Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <p className="text-blue-100 mb-2">Total Collected</p>
              <p className="text-3xl font-bold">{formatCurrency(fundSummary.total_collected)}</p>
              <p className="text-xs text-blue-200 mt-2">
                Savings: {formatCurrency(fundSummary.total_collected - (savingSummary?.total_penalties_collected || 0))} |
                Penalties: {formatCurrency(savingSummary?.total_penalties_collected || 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
              <p className="text-purple-100 mb-2">Active Loans</p>
              <p className="text-3xl font-bold">{formatCurrency(fundSummary.active_loan_outstanding)}</p>
              <p className="text-xs text-purple-200 mt-2">
                Principal: {formatCurrency(fundSummary.active_loan_principal)} |
                Interest: {formatCurrency(fundSummary.active_loan_outstanding - fundSummary.active_loan_principal)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
              <p className="text-green-100 mb-2">Available Fund</p>
              <p className="text-3xl font-bold">{formatCurrency(fundSummary.available_fund)}</p>
              <p className="text-xs text-green-200 mt-2">
                = Collected (₹{formatCurrency(fundSummary.total_collected)}) - Loan Principal (₹{formatCurrency(fundSummary.active_loan_principal)})
              </p>
              <p className="text-xs text-green-200 mt-1">
                Interest (₹{formatCurrency(fundSummary.active_loan_outstanding - fundSummary.active_loan_principal)}) will be added when member repays
              </p>
            </div>
          </motion.div>
          {/* Saving Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saving Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Cycles</p>
                <p className="text-2xl font-bold text-gray-900">{savingSummary?.total_cycles || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{savingSummary?.total_members || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(savingSummary?.total_expected_savings || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(savingSummary?.total_paid_savings || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unpaid</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(savingSummary?.total_unpaid_savings || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Penalties</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(savingSummary?.total_penalties_collected || 0)}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings Collected:</span>
                  <span className="font-medium">
                    {formatCurrency((savingSummary?.total_paid_savings || 0) - (savingSummary?.total_penalties_collected || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Penalties Collected:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(savingSummary?.total_penalties_collected || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Total Paid (Savings + Penalties):</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(savingSummary?.total_paid_savings || 0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Member Overview */}
      {role === 'MEMBER' && myFinancials && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* My Savings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Savings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(myFinancials.saving_summary?.total_savings_paid || 0)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-600 mb-1">Unpaid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(myFinancials.saving_summary?.total_unpaid_savings || 0)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600 mb-1">Penalties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(myFinancials.saving_summary?.total_saving_penalty || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* My Active Loan */}
          {myFinancials.loan_summary && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Loan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Principal</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(myFinancials.loan_summary.principal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(myFinancials.loan_summary.remaining_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Payable</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(myFinancials.loan_summary.total_payable)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${myFinancials.loan_summary.status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {myFinancials.loan_summary.status}
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