// src/pages/PundDetail/components/ReopenPundTab.jsx
import React, { useState } from 'react';
import { FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const ReopenPundTab = ({ pundName, onReopen, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onReopen();
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Reopen Pund</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <FiRefreshCw className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-2">
                Reopen <span className="font-bold">{pundName}</span>
              </p>
              <p className="text-xs text-green-700">
                This will reactivate the pund and restore access for all members.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reopen Pund'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReopenPundTab;