// src/pages/PundDetail/components/StructureTab.jsx
import React, { useState } from 'react';
import { FiSave, FiInfo, FiCalendar, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `₹ ${numAmount.toLocaleString('en-IN')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Get today's date in YYYY-MM-DD format for min attribute
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const StructureTab = ({ pundData, onSubmit }) => {
  const [structureData, setStructureData] = useState({
    saving_amount: pundData?.structure?.saving_amount || '',
    loan_interest_percentage: pundData?.structure?.loan_interest_percentage || '',
    missed_saving_penalty: pundData?.structure?.missed_saving_penalty || '',
    missed_loan_penalty: pundData?.structure?.missed_loan_penalty || '',
    default_loan_cycles: pundData?.structure?.default_loan_cycles || '10',
    effective_from: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [effectiveOption, setEffectiveOption] = useState('auto'); // 'auto' or 'manual'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!structureData.saving_amount || parseFloat(structureData.saving_amount) <= 0) {
      toast.error('Please enter a valid saving amount');
      return;
    }
    if (!structureData.loan_interest_percentage || parseFloat(structureData.loan_interest_percentage) < 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }
    if (!structureData.missed_saving_penalty || parseFloat(structureData.missed_saving_penalty) < 0) {
      toast.error('Please enter a valid missed saving penalty');
      return;
    }
    if (!structureData.missed_loan_penalty || parseFloat(structureData.missed_loan_penalty) < 0) {
      toast.error('Please enter a valid missed loan penalty');
      return;
    }
    if (!structureData.default_loan_cycles || parseInt(structureData.default_loan_cycles) < 1) {
      toast.error('Please enter a valid number of cycles');
      return;
    }

    // Prepare payload
    const payload = { ...structureData };
    
    // If auto is selected, remove effective_from (backend will set to 7 days)
    if (effectiveOption === 'auto') {
      delete payload.effective_from;
    }

    setSubmitting(true);
    await onSubmit(payload);
    setSubmitting(false);
  };

  const handleChange = (e) => {
    setStructureData({
      ...structureData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate next effective date (7 days from now)
  const getNextEffectiveDate = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek;
  };

  const hasCurrentStructure = pundData?.structure;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Pund Structure Settings</h2>
        <p className="text-[10px] text-gray-500 mt-1">
          Configure the financial rules for this pund
        </p>
      </div>

      {/* Current Structure Card (if exists) */}
      {hasCurrentStructure && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <FiInfo className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-semibold text-blue-700">Current Active Structure</h3>
          </div>
          
          {/* Effective Date */}
          {pundData.structure.effective_from && (
            <div className="flex items-center space-x-2 mb-3 text-[10px] text-gray-600 bg-white/50 p-2 rounded-lg">
              <FiCalendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Effective from: <span className="font-medium">{formatDate(pundData.structure.effective_from)}</span></span>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
            <div className="bg-white/50 p-2 rounded">
              <p className="text-blue-600 text-[8px]">Saving Amount</p>
              <p className="font-bold text-gray-900">{formatCurrency(pundData.structure.saving_amount)}</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <p className="text-blue-600 text-[8px]">Interest Rate</p>
              <p className="font-bold text-gray-900">{pundData.structure.loan_interest_percentage}%</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <p className="text-blue-600 text-[8px]">Saving Penalty</p>
              <p className="font-bold text-gray-900">{formatCurrency(pundData.structure.missed_saving_penalty)}</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <p className="text-blue-600 text-[8px]">Loan Penalty</p>
              <p className="font-bold text-gray-900">{formatCurrency(pundData.structure.missed_loan_penalty)}</p>
            </div>
            <div className="bg-white/50 p-2 rounded">
              <p className="text-blue-600 text-[8px]">Loan Cycles</p>
              <p className="font-bold text-gray-900">{pundData.structure.default_loan_cycles}</p>
            </div>
          </div>
        </div>
      )}

      {/* Structure Form */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2">
          <h3 className="text-white text-xs font-medium">
            {hasCurrentStructure ? 'Update Structure' : 'Set New Structure'}
          </h3>
        </div>

        <div className="p-4">
          {/* Effective Date Selection */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <FiClock className="w-4 h-4 text-gray-600" />
              <h4 className="text-xs font-medium text-gray-700">Effective Date</h4>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={effectiveOption === 'auto'}
                  onChange={() => setEffectiveOption('auto')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                <span className="text-xs text-gray-700">Auto (7 days from now)</span>
                <span className="text-[10px] text-gray-500 ml-2">{formatDate(getNextEffectiveDate())}</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={effectiveOption === 'manual'}
                  onChange={() => setEffectiveOption('manual')}
                  className="w-3.5 h-3.5 text-blue-600"
                />
                <span className="text-xs text-gray-700">Manual</span>
              </label>
              
              {effectiveOption === 'manual' && (
                <div className="mt-2 pl-6">
                  <input
                    type="date"
                    name="effective_from"
                    value={structureData.effective_from}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                    required={effectiveOption === 'manual'}
                  />
                  <p className="text-[8px] text-gray-400 mt-1">
                    Select a future date for the structure to take effect
                  </p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Saving Amount */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Saving Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="saving_amount"
                  value={structureData.saving_amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  placeholder="e.g., 1000"
                  min="1"
                  step="1"
                  required
                />
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Interest Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="loan_interest_percentage"
                  value={structureData.loan_interest_percentage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  placeholder="e.g., 10"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              {/* Missed Saving Penalty */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Missed Saving Penalty (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="missed_saving_penalty"
                  value={structureData.missed_saving_penalty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  placeholder="e.g., 100"
                  min="0"
                  step="1"
                  required
                />
              </div>

              {/* Missed Loan Penalty */}
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Missed Loan Penalty (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="missed_loan_penalty"
                  value={structureData.missed_loan_penalty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  placeholder="e.g., 100"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            {/* Default Loan Cycles - Full width */}
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Default Loan Cycles <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="default_loan_cycles"
                value={structureData.default_loan_cycles}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                placeholder="e.g., 10"
                min="1"
                step="1"
                required
              />
              <p className="text-[8px] text-gray-400 mt-1">
                Number of cycles for loan repayment (default: 10)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 rounded-lg p-3 flex items-start space-x-2">
              <FiInfo className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-yellow-700">
                  <span className="font-medium">Note:</span> New structure will be effective from{' '}
                  {effectiveOption === 'auto' 
                    ? <span className="font-semibold">{formatDate(getNextEffectiveDate())}</span>
                    : 'the selected date'
                  }.
                </p>
                <p className="text-[8px] text-yellow-600 mt-1">
                  Current structure remains active until then. Existing cycles continue with their current rules.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:shadow-md transition disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-3.5 h-3.5" />
                    <span>{hasCurrentStructure ? 'Update Structure' : 'Save Structure'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-[8px] text-gray-400 text-center">
        All amounts are in Indian Rupees (₹). Interest rate is per cycle.
      </div>
    </div>
  );
};

export default StructureTab;