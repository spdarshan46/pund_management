// src/utils/formatters.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED': return 'text-green-600 bg-green-100';
    case 'PENDING': return 'text-yellow-600 bg-yellow-100';
    case 'REJECTED': return 'text-red-600 bg-red-100';
    case 'CLOSED': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};