// src/pages/PundDetail/components/PaymentsTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiFilter,
  FiSearch,
  FiFileText,
  FiDownload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `Rs. ${numAmount.toLocaleString('en-IN')}`;
};

const parseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  return parseFloat(value) || 0;
};

const formatDateDDMMYY = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};

const PaymentsTab = ({ pundId, pundData }) => {
  const [payments, setPayments] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    totalCycles: 0,
    totalMembers: 0,
    totalExpected: 0,
    totalCollected: 0,
    totalPenalties: 0,
    pendingCount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, [pundId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch real cycle payments data from API
      const response = await api.get(`/finance/pund/${pundId}/cycle-payments/`);
      console.log('Cycle data from API:', response.data);
      
      const cycleResponse = response.data;
      setCycleData(cycleResponse);
      
      // Flatten payments and ensure no duplicates
      const paymentMap = new Map();
      cycleResponse.forEach(cycle => {
        const uniqueCyclePayments = [];
        const seenInCycle = new Set();
        
        (cycle.payments || []).forEach(payment => {
          const key = `${payment.member_id}-${cycle.cycle_number}`;
          if (!seenInCycle.has(key)) {
            seenInCycle.add(key);
            uniqueCyclePayments.push({
              ...payment,
              cycle_number: cycle.cycle_number,
              amount: parseAmount(payment.amount),
              penalty_amount: parseAmount(payment.penalty_amount),
              due_date: cycle.due_date || payment.due_date,
              member_name: payment.member_name || 'Unknown',
              member_email: payment.member_email || '',
              is_paid: payment.is_paid || false
            });
          }
        });
        
        uniqueCyclePayments.forEach(payment => {
          const key = `${payment.member_id}-${payment.cycle_number}`;
          if (!paymentMap.has(key)) {
            paymentMap.set(key, payment);
          }
        });
      });
      
      const allPayments = Array.from(paymentMap.values());
      setPayments(allPayments);
      
      // Calculate unique members
      const uniqueMembers = new Set();
      allPayments.forEach(p => uniqueMembers.add(p.member_id));
      
      // Calculate summary
      const totalExpected = cycleResponse.reduce((sum, cycle) => sum + parseAmount(cycle.total_expected), 0);
      const totalCollected = cycleResponse.reduce((sum, cycle) => sum + parseAmount(cycle.total_collected), 0);
      const totalPenalties = cycleResponse.reduce((sum, cycle) => sum + parseAmount(cycle.total_penalties), 0);
      const pendingCount = allPayments.filter(p => !p.is_paid).length;
      const pendingAmount = allPayments
        .filter(p => !p.is_paid)
        .reduce((sum, p) => sum + p.amount + p.penalty_amount, 0);
      
      setSummary({
        totalCycles: cycleResponse.length,
        totalMembers: uniqueMembers.size,
        totalExpected,
        totalCollected,
        totalPenalties,
        pendingCount,
        pendingAmount
      });
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
      
      // Set empty data on error
      setCycleData([]);
      setPayments([]);
      setSummary({
        totalCycles: 0,
        totalMembers: 0,
        totalExpected: 0,
        totalCollected: 0,
        totalPenalties: 0,
        pendingCount: 0,
        pendingAmount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (paymentId) => {
    try {
      const response = await api.post(`/finance/payment/${paymentId}/mark-paid/`);
      toast.success(response.data.message || 'Payment marked as paid');
      fetchPayments(); // Refresh data
    } catch (error) {
      console.error('Error marking payment:', error);
      toast.error(error.response?.data?.error || 'Failed to mark payment');
    }
  };

  const getUniqueCycles = () => {
    return [...new Set(payments.map(p => p.cycle_number))].sort((a, b) => a - b);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesCycle = selectedCycle === 'all' || payment.cycle_number === parseInt(selectedCycle);
    const matchesSearch = payment.member_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCycle && matchesSearch;
  });

  const getStatusBadge = (payment) => {
    if (payment.is_paid) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: FiCheckCircle,
        label: 'PAID'
      };
    } else if (new Date(payment.due_date) < new Date()) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: FiXCircle,
        label: 'OVERDUE'
      };
    } else {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: FiClock,
        label: 'PENDING'
      };
    }
  };

  const calculateMemberSummary = () => {
    const memberMap = new Map();
    
    payments.forEach(payment => {
      if (!memberMap.has(payment.member_id)) {
        memberMap.set(payment.member_id, {
          name: payment.member_name,
          totalPaid: 0,
          totalPenalty: 0,
          pendingAmount: 0,
          isActive: true
        });
      }
      
      const member = memberMap.get(payment.member_id);
      if (payment.is_paid) {
        member.totalPaid += payment.amount;
        member.totalPenalty += payment.penalty_amount;
      } else {
        member.pendingAmount += payment.amount + payment.penalty_amount;
      }
    });
    
    return Array.from(memberMap.values());
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const memberSummary = calculateMemberSummary();
      const userEmail = localStorage.getItem('user_email') || 'owner@pundx.com';
      
      // Official PundX Colors
      const primaryBlue = [0, 82, 155];
      const secondaryBlue = [0, 101, 189];
      const lightBlue = [235, 245, 255];
      const darkGray = [51, 51, 51];
      const mediumGray = [102, 102, 102];
      const lightGray = [242, 242, 242];
      
      // HEADER
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PUNDX', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Community Savings Management System', pageWidth / 2, 22, { align: 'center' });
      
      // PUND DETAILS
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PUND DETAILS', 14, 35);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 42;
      doc.setFont('helvetica', 'bold');
      doc.text('Pund Name:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(pundData?.pund_name || 'N/A', 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Pund Type:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(pundData?.pund_type || 'N/A', 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Generated On:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }), 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Generated By:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(userEmail, 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Status:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(pundData?.pund_active ? 'ACTIVE' : 'INACTIVE', 50, yPos);
      
      yPos += 8;
      
      // SECTION 1: SUMMARY
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('PUND SUMMARY', 14, yPos);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Cycles:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(summary.totalCycles.toString(), 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Members:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(summary.totalMembers.toString(), 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Expected:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(summary.totalExpected), 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Collected:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(summary.totalCollected), 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Penalties:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(summary.totalPenalties), 50, yPos);
      
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Pending Dues:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(summary.pendingAmount), 50, yPos);
      
      yPos += 10;
      
      // SECTION 2: CYCLE SUMMARY
      if (cycleData.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('CYCLE SUMMARY', 14, yPos);
        
        const cycleTableData = cycleData.map(cycle => [
          cycle.cycle_number?.toString() || 'N/A',
          formatDateDDMMYY(cycle.due_date),
          formatCurrency(cycle.total_expected),
          formatCurrency(cycle.total_collected),
          formatCurrency(cycle.total_penalties),
          cycle.status || 'OPEN'
        ]);
        
        autoTable(doc, {
          head: [['Cycle', 'Due Date', 'Expected (Rs.)', 'Collected (Rs.)', 'Penalties (Rs.)', 'Status']],
          body: cycleTableData,
          startY: yPos + 5,
          styles: { 
            fontSize: 8, 
            cellPadding: 2,
            font: 'helvetica',
            textColor: darkGray,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: primaryBlue,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 18, halign: 'center' },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 28, halign: 'right' },
            3: { cellWidth: 28, halign: 'right' },
            4: { cellWidth: 28, halign: 'right' },
            5: { cellWidth: 23, halign: 'center' }
          },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // SECTION 3: DETAILED PAYMENTS
      if (filteredPayments.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('DETAILED PAYMENTS', 14, yPos);
        
        const paymentTableData = filteredPayments.map(payment => {
          const amount = parseAmount(payment.amount);
          const penalty = parseAmount(payment.penalty_amount);
          const totalAmount = amount + penalty;
          const status = payment.is_paid ? 'PAID' : 
                        (new Date(payment.due_date) < new Date() ? 'OVERDUE' : 'PENDING');
          
          return [
            payment.cycle_number?.toString() || 'N/A',
            payment.member_name || 'Unknown',
            formatCurrency(amount),
            penalty > 0 ? formatCurrency(penalty) : '-',
            formatCurrency(totalAmount),
            formatDateDDMMYY(payment.due_date),
            status
          ];
        });
        
        autoTable(doc, {
          head: [['Cycle', 'Member', 'Amount (Rs.)', 'Penalty (Rs.)', 'Total (Rs.)', 'Due Date', 'Status']],
          body: paymentTableData,
          startY: yPos + 5,
          styles: { 
            fontSize: 7, 
            cellPadding: 1.5,
            font: 'helvetica',
            textColor: darkGray,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: primaryBlue,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 16, halign: 'center' },
            1: { cellWidth: 28, halign: 'left' },
            2: { cellWidth: 24, halign: 'right' },
            3: { cellWidth: 24, halign: 'right' },
            4: { cellWidth: 24, halign: 'right' },
            5: { cellWidth: 22, halign: 'center' },
            6: { cellWidth: 20, halign: 'center' }
          },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Check if we need a new page for member summary
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      // SECTION 4: MEMBER SUMMARY
      if (memberSummary.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('MEMBER SUMMARY', 14, yPos);
        
        const memberTableData = memberSummary.map(member => [
          member.name,
          formatCurrency(member.totalPaid),
          formatCurrency(member.totalPenalty),
          formatCurrency(member.pendingAmount),
          member.isActive ? 'ACTIVE' : 'INACTIVE'
        ]);
        
        autoTable(doc, {
          head: [['Member', 'Total Paid (Rs.)', 'Total Penalty (Rs.)', 'Pending (Rs.)', 'Status']],
          body: memberTableData,
          startY: yPos + 5,
          styles: { 
            fontSize: 8, 
            cellPadding: 2,
            font: 'helvetica',
            textColor: darkGray,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: primaryBlue,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 35, halign: 'left' },
            1: { cellWidth: 32, halign: 'right' },
            2: { cellWidth: 32, halign: 'right' },
            3: { cellWidth: 32, halign: 'right' },
            4: { cellWidth: 25, halign: 'center' }
          },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // FOOTER
      doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setLineWidth(0.3);
      doc.line(14, yPos, pageWidth - 14, yPos);
      
      doc.setFontSize(7);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a system generated financial report from PundX.', 14, yPos + 5);
      doc.text('All calculations are based on recorded transactions.', 14, yPos + 9);
      doc.text('For disputes, contact the Pund Owner.', 14, yPos + 13);
      
      const now = new Date();
      const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text(`Generated at: ${timestamp}`, 14, yPos + 18);
      
      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        doc.setFontSize(6);
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text('PUNDX', 14, pageHeight - 10);
      }
      
      doc.save(`pund-${pundId}-payment-report.pdf`);
      toast.success('Payment report exported successfully');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-gray-600">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Cycles</p>
          <p className="text-sm font-bold text-gray-900">{summary.totalCycles}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Members</p>
          <p className="text-sm font-bold text-gray-900">{summary.totalMembers}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Expected</p>
          <p className="text-sm font-bold text-gray-900">{formatCurrency(summary.totalExpected)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Collected</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(summary.totalCollected)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Penalties</p>
          <p className="text-sm font-bold text-orange-600">{formatCurrency(summary.totalPenalties)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Pending</p>
          <p className="text-sm font-bold text-yellow-600">{summary.pendingCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Pending Amount</p>
          <p className="text-sm font-bold text-red-600">{formatCurrency(summary.pendingAmount)}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FiFilter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="all">All Cycles</option>
                {getUniqueCycles().map(cycle => (
                  <option key={cycle} value={cycle}>Cycle {cycle}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 w-48"
              />
            </div>
          </div>

          <button
            onClick={exportToPDF}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 flex items-center justify-center"
          >
            <FiFileText className="w-3.5 h-3.5 mr-1" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Cycle</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Member</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Penalty</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Total</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Due Date</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-white uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-6 text-center text-xs text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => {
                  const status = getStatusBadge(payment);
                  const StatusIcon = status.icon;
                  const amount = parseAmount(payment.amount);
                  const penalty = parseAmount(payment.penalty_amount);
                  const totalAmount = amount + penalty;

                  return (
                    <motion.tr
                      key={`${payment.member_id}-${payment.cycle_number}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 transition text-xs ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        #{payment.cycle_number}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
                            {payment.member_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="text-xs text-gray-900">{payment.member_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {penalty > 0 ? (
                          <span className="text-red-600 font-medium">
                            {formatCurrency(penalty)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                        {formatDateDDMMYY(payment.due_date)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {!payment.is_paid && (
                          <button
                            onClick={() => handleMarkPaid(payment.id)}
                            className="px-2 py-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-700"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;