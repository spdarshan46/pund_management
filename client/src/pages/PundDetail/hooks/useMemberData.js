// src/pages/PundDetail/hooks/useMemberData.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const useMemberData = (role) => {
  const [myFinancials, setMyFinancials] = useState(null);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMemberData = async () => {
    if (role !== 'MEMBER') return;
    
    setLoading(true);
    try {
      // Fetch member financial summary
      const financialResponse = await api.get('/finance/my-financial-summary/');
      setMyFinancials(financialResponse.data);

      // Fetch member loans
      const loansResponse = await api.get('/finance/my-loans/');
      setMyLoans(loansResponse.data);
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [role]);

  const refetchMember = () => {
    fetchMemberData();
  };

  return { myFinancials, myLoans, loading, refetchMember };
};

export default useMemberData;