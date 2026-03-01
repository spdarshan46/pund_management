// src/pages/PundDetail/components/SavingsTab.jsx
import React from 'react';
import { formatCurrency } from '../../../utils/formatters';

const SavingsTab = ({ role, savingSummary, myFinancials }) => {
  // Owner View
  if (role === 'OWNER' && savingSummary) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Total Cycles</p>
            <p className="text-2xl font-bold text-gray-900">{savingSummary.total_cycles || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{savingSummary.total_members || 0}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600">Expected Savings</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(savingSummary.total_expected_savings)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-600">Paid Savings</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(savingSummary.total_paid_savings)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-600">Unpaid Savings</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(savingSummary.total_unpaid_savings)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-orange-600">Penalties</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(savingSummary.total_penalties_collected)}</p>
          </div>
        </div>

        {/* Cycle-wise breakdown (if needed) */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Cycle Breakdown</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cycle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* You'll need to fetch cycle data from backend */}
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan="4">
                    Cycle data will be available after generating cycles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Member View
  if (role === 'MEMBER' && myFinancials) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Savings Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(myFinancials.saving_summary?.total_savings_paid || 0)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl">
              <p className="text-sm text-yellow-600 mb-1">Unpaid</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(myFinancials.saving_summary?.total_unpaid_savings || 0)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600 mb-1">Penalties</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(myFinancials.saving_summary?.total_saving_penalty || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
          <p className="text-gray-500 text-center py-8">
            Payment history will appear here after cycles are generated
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <p className="text-gray-500 text-center py-8">No savings data available</p>
    </div>
  );
};

export default SavingsTab;