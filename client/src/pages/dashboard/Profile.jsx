// src/pages/dashboard/Profile.jsx
import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiSend, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const Profile = ({ userName: propName, userEmail: propEmail, onRefresh }) => {
  // Initialize with props, but will be overridden by API data
  const [userName, setUserName] = useState(propName || 'User');
  const [userEmail, setUserEmail] = useState(propEmail || '');
  const [userMobile, setUserMobile] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [editForm, setEditForm] = useState({
    name: propName || '',
    email: propEmail || '',
    mobile: ''
  });

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me/');
      console.log('User details response:', response.data);
      
      // Update all states with API data
      setUserName(response.data.name || response.data.username || propName);
      setUserEmail(response.data.email || propEmail);
      setUserMobile(response.data.mobile || '');
      
      setEditForm({
        name: response.data.name || response.data.username || propName,
        email: response.data.email || propEmail,
        mobile: response.data.mobile || ''
      });
      
      // Also update localStorage if needed
      if (response.data.name) {
        localStorage.setItem('user_name', response.data.name);
      }
      if (response.data.email) {
        localStorage.setItem('user_email', response.data.email);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      name: userName,
      email: userEmail,
      mobile: userMobile
    });
    setIsEditing(true);
    setOtpSent(false);
    setOtp('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setOtpSent(false);
    setOtp('');
    // Reset form to current values
    setEditForm({
      name: userName,
      email: userEmail,
      mobile: userMobile
    });
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (editForm.mobile && !editForm.mobile.match(/^\d{10}$/)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: editForm.name,
        mobile: editForm.mobile || undefined
      };
      
      // Only include email if it changed
      if (editForm.email !== userEmail) {
        payload.email = editForm.email;
      }

      const response = await api.patch('/users/me/', payload);
      console.log('Profile update response:', response.data);

      if (response.data.message === "OTP sent to new email. Verify to complete change.") {
        setPendingEmail(editForm.email);
        setOtpSent(true);
        toast.success('OTP sent to new email');
      } else {
        // Update successful
        setUserName(editForm.name);
        setUserEmail(editForm.email);
        setUserMobile(editForm.mobile);
        setIsEditing(false);
        
        // Update localStorage
        localStorage.setItem('user_name', editForm.name);
        localStorage.setItem('user_email', editForm.email);
        
        toast.success('Profile updated successfully');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/users/verify-email-change/', { otp });
      console.log('Verify OTP response:', response.data);
      
      // Update successful
      setUserEmail(pendingEmail);
      setUserName(editForm.name);
      setUserMobile(editForm.mobile);
      setIsEditing(false);
      setOtpSent(false);
      setOtp('');
      
      // Update localStorage
      localStorage.setItem('user_name', editForm.name);
      localStorage.setItem('user_email', pendingEmail);
      
      toast.success('Email updated successfully');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base font-semibold text-gray-900">Profile</h1>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] hover:bg-blue-700 flex items-center space-x-1"
          >
            <FiEdit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{userName}</h2>
              <p className="text-white/80 text-[10px]">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          {isEditing ? (
            <AnimatePresence mode="wait">
              {otpSent ? (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="text-center py-2">
                    <FiMail className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Verify New Email</h3>
                    <p className="text-[10px] text-gray-500 mb-3">
                      OTP sent to {pendingEmail}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-center tracking-widest"
                      maxLength="6"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={submitting || otp.length !== 6}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:shadow-md transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {submitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiCheckCircle className="w-3.5 h-3.5 mr-1" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="space-y-3"
                >
                  {/* Name Field */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    {editForm.email !== userEmail && (
                      <p className="text-[8px] text-blue-600 mt-1">
                        Changing email will require OTP verification
                      </p>
                    )}
                  </div>

                  {/* Mobile Field */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                      <input
                        type="tel"
                        name="mobile"
                        value={editForm.mobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50 flex items-center justify-center"
                    >
                      <FiX className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:shadow-md transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {submitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiSave className="w-3.5 h-3.5 mr-1" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          ) : (
            /* View Mode */
            <div className="space-y-2">
              {/* Name */}
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <FiUser className="w-3.5 h-3.5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[8px] text-gray-500">Full Name</p>
                  <p className="text-xs font-medium text-gray-900">{userName}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <FiMail className="w-3.5 h-3.5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[8px] text-gray-500">Email Address</p>
                  <p className="text-xs font-medium text-gray-900">{userEmail}</p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[8px] text-gray-500">Mobile Number</p>
                  <p className="text-xs font-medium text-gray-900">
                    {userMobile || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;