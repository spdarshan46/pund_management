// src/pages/CreatePund.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

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
      
      // Navigate to the new pund or dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Create pund error:', error);
      toast.error(error.response?.data?.error || 'Failed to create pund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Pund</h1>
              <p className="text-sm text-gray-500">Start a new savings group</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pund Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pund Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Family Savings, Office Friends, Community Fund"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Choose a unique name that identifies your savings group
              </p>
            </div>

            {/* Pund Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pund Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pundTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.pund_type === type.value;
                  
                  return (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, pund_type: type.value })}
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <FiCheckCircle className="absolute top-3 right-3 w-5 h-5 text-blue-500" />
                      )}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className={`font-semibold mb-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </h3>
                      <p className={`text-xs ${
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Add a description for your pund..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
              <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">After creating the pund:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>You will be the owner of this pund</li>
                  <li>You can add members to join your pund</li>
                  <li>Set the saving structure to start cycles</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Pund'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePund;