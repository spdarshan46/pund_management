import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const useMemberData = (role, pundId) => {
  const [myFinancials, setMyFinancials] = useState(null);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMemberData = async () => {
    if (role !== 'MEMBER' || !pundId) return;

    setLoading(true);

    try {
      const financialResponse = await api.get(
        `/finance/pund/${pundId}/my-financial-summary/`
      );

      setMyFinancials(financialResponse.data);

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
  }, [role, pundId]);

  return { myFinancials, myLoans, loading, refetchMember: fetchMemberData };
};
export default useMemberData;