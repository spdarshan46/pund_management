// src/pages/PundDetail/components/StructureTab.jsx
import React, { useState } from 'react';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const StructureTab = ({ pundData, onSubmit }) => {
  const [structureData, setStructureData] = useState({
    saving_amount: pundData?.structure?.saving_amount || '',
    loan_interest_percentage: pundData?.structure?.loan_interest_percentage || '',
    missed_saving_penalty: pundData?.structure?.missed_saving_penalty || '',
    missed_loan_penalty: pundData?.structure?.missed_loan_penalty || '',
    default_loan_cycles: pundData?.structure?.default_loan_cycles || '10'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!structureData.saving_amount || parseFloat(structureData.saving_amount) <= 0) {
      toast.error('Please enter a valid saving amount');
      return;
    }
    if (!structureData.loan_interest_percentage || parseFloat(structureData.loan_interest_percentage) < 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }

    setSubmitting(true);
    await onSubmit(structureData);
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Pund Structure Settings</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Saving Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={structureData.saving_amount}
              onChange={(e) => setStructureData({ ...structureData, saving_amount: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              placeholder="Enter amount"
              min="1"
              step="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Interest Rate (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={structureData.loan_interest_percentage}
              onChange={(e) => setStructureData({ ...structureData, loan_interest_percentage: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              placeholder="Enter percentage"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Missed Saving Penalty (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={structureData.missed_saving_penalty}
              onChange={(e) => setStructureData({ ...structureData, missed_saving_penalty: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              placeholder="Enter penalty amount"
              min="0"
              step="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Missed Loan Penalty (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={structureData.missed_loan_penalty}
              onChange={(e) => setStructureData({ ...structureData, missed_loan_penalty: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              placeholder="Enter penalty amount"
              min="0"
              step="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Default Loan Cycles <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={structureData.default_loan_cycles}
              onChange={(e) => setStructureData({ ...structureData, default_loan_cycles: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              placeholder="Enter number of cycles"
              min="1"
              step="1"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSave className="w-3.5 h-3.5 mr-1" />
                  Save Structure
                </>
              )}
            </button>
          </div>
        </form>

        {pundData?.structure && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-green-600 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></span>
              Current structure is active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureTab;