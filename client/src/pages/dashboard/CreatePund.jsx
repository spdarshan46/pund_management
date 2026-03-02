// src/pages/dashboard/CreatePund.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiInfo,
  FiCheckCircle,
  FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const CreatePund = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pund_type: 'WEEKLY',
    description: ''
  });

  const pundTypes = [
    { value: 'DAILY', label: 'Daily', icon: FiClock, description: 'Save every day' },
    { value: 'WEEKLY', label: 'Weekly', icon: FiCalendar, description: 'Save every week' },
    { value: 'MONTHLY', label: 'Monthly', icon: FiDollarSign, description: 'Save every month' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a pund name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/punds/create/', {
        name: formData.name,
        pund_type: formData.pund_type,
        description: formData.description
      });
      
      console.log('Create pund response:', response.data);
      toast.success('Pund created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Create pund error:', error);
      toast.error(error.response?.data?.error || 'Failed to create pund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button for mobile */}
      <button
        onClick={() => navigate('/dashboard')}
        className="lg:hidden flex items-center space-x-1 text-gray-600 hover:text-gray-900 mb-3"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span className="text-xs">Back to Dashboard</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg p-4"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Create New Pund</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pund Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pund Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Family Savings"
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Pund Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Pund Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {pundTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.pund_type === type.value;
                
                return (
                  <div
                    key={type.value}
                    onClick={() => setFormData({ ...formData, pund_type: type.value })}
                    className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <FiCheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-blue-500" />
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className={`text-xs font-semibold mb-0.5 ${
                      isSelected ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </h3>
                    <p className={`text-[10px] ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {type.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-3 flex items-start space-x-2">
            <FiInfo className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-blue-700">
              <p className="font-medium mb-1">After creating:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                <li>You will be the owner</li>
                <li>Add members to join</li>
                <li>Set structure to start cycles</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:shadow transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Pund'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePund;