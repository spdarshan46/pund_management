// src/pages/PundDetail/hooks/useOwnerData.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const useOwnerData = (pundId, role) => {
  const [fundSummary, setFundSummary] = useState(null);
  const [savingSummary, setSavingSummary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOwnerData = async () => {
    if (role !== 'OWNER' || !pundId) return;
    
    setLoading(true);
    try {
      // Fetch fund summary
      const fundResponse = await api.get(`/finance/pund/${pundId}/fund-summary/`);
      console.log('Fund Summary:', fundResponse.data);
      setFundSummary(fundResponse.data);

      // Fetch saving summary
      const savingResponse = await api.get(`/finance/pund/${pundId}/saving-summary/`);
      console.log('Saving Summary:', savingResponse.data);
      setSavingSummary(savingResponse.data);

      // Fetch all loans in pund
      const loansResponse = await api.get(`/finance/pund/${pundId}/loans/`);
      console.log('Loans:', loansResponse.data);
      setLoans(loansResponse.data);

      // Fetch audit logs
      const auditResponse = await api.get(`/finance/pund/${pundId}/audit-logs/`);
      setAuditLogs(auditResponse.data);
    } catch (error) {
      console.error('Error fetching owner data:', error);
      toast.error('Failed to load owner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, [pundId, role]);

  const refetchOwner = () => {
    fetchOwnerData();
  };

  return { fundSummary, savingSummary, loans, auditLogs, loading, refetchOwner };
};

export default useOwnerData;