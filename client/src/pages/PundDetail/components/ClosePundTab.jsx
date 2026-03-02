// src/pages/PundDetail/components/ClosePundTab.jsx
import React, { useState } from 'react';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const ClosePundTab = ({ pundName, onClose, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmText !== 'CLOSE') {
      return;
    }
    setLoading(true);
    await onClose();
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Close Pund</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-2">
                You are about to close <span className="font-bold">{pundName}</span>
              </p>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>The pund will be marked as inactive</li>
                <li>All members will lose access</li>
                <li>No further cycles can be generated</li>
                <li>You can reopen it anytime from the sidebar</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">CLOSE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CLOSE"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500/20"
              required
            />
          </div>

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
              disabled={loading || confirmText !== 'CLOSE'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Close Pund'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClosePundTab;