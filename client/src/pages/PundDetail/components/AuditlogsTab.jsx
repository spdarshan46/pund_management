// src/pages/PundDetail/components/AuditLogsTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiClock, FiUser } from 'react-icons/fi';

const AuditLogsTab = ({ auditLogs }) => {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <FiShield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Yet</h3>
        <p className="text-gray-500">Financial actions will be recorded here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Audit Trail</h3>
      
      <div className="space-y-4">
        {auditLogs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                <span className="text-xs text-gray-500 flex items-center">
                  <FiClock className="w-3 h-3 mr-1" />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{log.description}</p>
              
              <div className="flex items-center text-xs text-gray-500">
                <FiUser className="w-3 h-3 mr-1" />
                <span>by {log.performed_by || 'System'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Total Actions</p>
          <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 mb-1">Last Action</p>
          <p className="text-sm font-medium text-gray-900">
            {auditLogs[0]?.action || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {auditLogs[0] ? new Date(auditLogs[0].timestamp).toLocaleDateString() : ''}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-600 mb-1">Unique Actions</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(auditLogs.map(log => log.action)).size}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsTab;