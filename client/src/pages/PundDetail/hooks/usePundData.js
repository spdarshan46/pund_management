// src/pages/PundDetail/hooks/usePundData.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const usePundData = (pundId) => {
  const [pundData, setPundData] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPundDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/punds/${pundId}/`);
      console.log('Pund Data API Response:', response.data); // Debug log
      
      setPundData(response.data);
      setRole(response.data.role);
      setError(null);
    } catch (err) {
      console.error('Error fetching pund details:', err);
      setError(err.response?.data?.error || 'Failed to load pund details');
      toast.error('Failed to load pund details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pundId) {
      fetchPundDetails();
    }
  }, [pundId]);

  const refetch = () => {
    fetchPundDetails();
  };

  return { pundData, role, loading, error, refetch };
};

export default usePundData;