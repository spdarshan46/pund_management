// src/pages/AddMember.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiPlus,
  FiCheckCircle,
  FiInfo,
  FiUsers,
  FiCopy,
  FiLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AddMember = () => {
  const { pundId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pund, setPund] = useState(null);
  const [fetchingPund, setFetchingPund] = useState(true);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    mobile: ''
  });
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPundDetails();
  }, [pundId]);

  const fetchPundDetails = async () => {
    setFetchingPund(true);
    try {
      const response = await api.get(`/punds/${pundId}/`);
      console.log('Pund details:', response.data);
      setPund(response.data);
      
      // Set members if available
      if (response.data.members) {
        setMembers(response.data.members.filter(m => m.role !== 'OWNER'));
      }
      
      // Generate invite link
      const link = `${window.location.origin}/join/${pundId}`;
      setInviteLink(link);
      
    } catch (error) {
      console.error('Error fetching pund:', error);
      toast.error('Failed to load pund details');
      navigate(-1);
    } finally {
      setFetchingPund(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Please enter email address');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Please enter member name');
      return;
    }
    if (!formData.mobile.match(/^\d{10}$/)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/punds/${pundId}/add-member/`, {
        email: formData.email,
        name: formData.name,
        mobile: formData.mobile
      });
      
      console.log('Add member response:', response.data);
      toast.success('Member added successfully!');
      
      // Reset form and refresh members
      setFormData({ email: '', name: '', mobile: '' });
      fetchPundDetails();
      
    } catch (error) {
      console.error('Add member error:', error);
      toast.error(error.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite link copied!');
  };

  if (fetchingPund) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pund details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Members</h1>
                <p className="text-sm text-gray-500">
                  {pund?.pund_name} • Owner
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {members.length} Members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Member Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="member@example.com"
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength="10"
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3 mt-4">
                  <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Member will receive an email invitation to join the pund.
                    They'll need to create an account if they don't have one.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5 mr-2" />
                      Add Member
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Invite Link & Members List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiUsers className="w-4 h-4 mr-2" />
                Current Members
              </h3>
              
              {members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No members yet. Add your first member!
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.email}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMember;