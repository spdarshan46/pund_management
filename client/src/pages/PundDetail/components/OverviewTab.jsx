// src/pages/PundDetail/components/OverviewTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatters';

const OverviewTab = ({ pundData, role, fundSummary, savingSummary, myFinancials }) => {
  return (
    <div className="space-y-4">
      {/* Structure Card */}
      {pundData?.structure && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Structure</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Saving Amount</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{pundData.structure.saving_amount?.toLocaleString() || 0}
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
                ₹{(pundData.structure.missed_saving_penalty ||
                  pundData.structure.missed_week_penalty || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-500">Loan Penalty</p>
              <p className="text-sm font-bold text-red-600">
                ₹{(pundData.structure.missed_loan_penalty || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            <span className="font-medium">Set by Owner:</span> {
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
          {/* Fund Summary - Compact Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white">
              <p className="text-[10px] text-blue-100 mb-1">Total Collected</p>
              <p className="text-base font-bold">₹{(fundSummary.total_collected || 0).toLocaleString()}</p>
              <p className="text-[8px] text-blue-200 mt-1">
                Savings: ₹{((fundSummary.total_collected || 0) - (savingSummary?.total_penalties_collected || 0)).toLocaleString()} | 
                Penalties: ₹{(savingSummary?.total_penalties_collected || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-3 text-white">
              <p className="text-[10px] text-purple-100 mb-1">Active Loans</p>
              <p className="text-base font-bold">₹{(fundSummary.active_loan_outstanding || 0).toLocaleString()}</p>
              <p className="text-[8px] text-purple-200 mt-1">
                Principal: ₹{(fundSummary.active_loan_principal || 0).toLocaleString()} | 
                Interest: ₹{((fundSummary.active_loan_outstanding || 0) - (fundSummary.active_loan_principal || 0)).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-white">
              <p className="text-[10px] text-green-100 mb-1">Available Fund</p>
              <p className="text-base font-bold">₹{(fundSummary.available_fund || 0).toLocaleString()}</p>
              <p className="text-[8px] text-green-200 mt-1">
                = Collected - Loan Principal
              </p>
            </div>
          </motion.div>

          {/* Saving Summary - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Saving Summary</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Cycles</p>
                <p className="text-sm font-bold text-gray-900">{savingSummary?.total_cycles || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Members</p>
                <p className="text-sm font-bold text-gray-900">{savingSummary?.total_members || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Expected</p>
                <p className="text-sm font-bold text-gray-900">₹{(savingSummary?.total_expected_savings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Paid</p>
                <p className="text-sm font-bold text-green-600">₹{(savingSummary?.total_paid_savings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Unpaid</p>
                <p className="text-sm font-bold text-red-600">₹{(savingSummary?.total_unpaid_savings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">Penalties</p>
                <p className="text-sm font-bold text-orange-600">₹{(savingSummary?.total_penalties_collected || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Breakdown - Compact */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Breakdown</h4>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings Collected:</span>
                  <span className="font-medium">
                    ₹{((savingSummary?.total_paid_savings || 0) - (savingSummary?.total_penalties_collected || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Penalties Collected:</span>
                  <span className="font-medium text-orange-600">
                    ₹{(savingSummary?.total_penalties_collected || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Total Paid:</span>
                  <span className="font-bold text-green-600">
                    ₹{(savingSummary?.total_paid_savings || 0).toLocaleString()}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* My Savings - Compact */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">My Savings</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-[10px] text-blue-600 mb-0.5">Total Paid</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{(myFinancials.saving_summary?.total_savings_paid || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="text-[10px] text-yellow-600 mb-0.5">Unpaid</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{(myFinancials.saving_summary?.total_unpaid_savings || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-[10px] text-red-600 mb-0.5">Penalties</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{(myFinancials.saving_summary?.total_saving_penalty || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* My Active Loan - Compact */}
          {myFinancials.loan_summary && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Loan</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Principal</p>
                  <p className="text-xs font-bold text-gray-900">₹{(myFinancials.loan_summary.principal || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Remaining</p>
                  <p className="text-xs font-bold text-orange-600">₹{(myFinancials.loan_summary.remaining_amount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Total Payable</p>
                  <p className="text-xs font-bold text-gray-900">₹{(myFinancials.loan_summary.total_payable || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">Status</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block ${
                    myFinancials.loan_summary.status === 'APPROVED' || myFinancials.loan_summary.status === 'ACTIVE'
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