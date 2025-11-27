import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import '../css/Revenue.css';

// Company Information
const companyInfo = {
  name: 'E I O Digital Solutions',
  legalName: 'Private Limited',
  address: '1A/1-G9 Wavoo Centre, Madurai Road, Tirunelveli-627001',
  contact: 'Phone: +91 9840624407, +91 9444224407',
  email: 'Email: myeiokln@gmail.com',
  website: 'Website: https.myeio.in',
  gstin: 'GSTIN: 32AAAFQ1234A1Z5'
};

// PDF Styles for Revenue Report
const revenuePdfStyles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start'
  },
  logoContainer: {
    width: '30%',
    alignItems: 'center'
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 5
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center'
  },
  companyInfo: {
    width: '65%',
    textAlign: 'right'
  },
  companyNameMain: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#2c3e50'
  },
  companyDetails: {
    fontSize: 8,
    color: '#555',
    marginBottom: 2
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#2c3e50'
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15
  },
  summarySection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    border: '1px solid #ddd'
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center'
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  summaryCard: {
    width: '30%',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    textAlign: 'center',
    border: '1px solid #e0e0e0'
  },
  summaryLabel: {
    fontSize: 7,
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  monthlySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    border: '1px solid #ddd'
  },
  monthlyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2c3e50'
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    padding: 3,
    backgroundColor: 'white',
    borderRadius: 3
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '14.28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#2c3e50',
    padding: 6,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 7,
    color: 'white'
  },
  tableCol: {
    width: '14.28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: 'center',
    fontSize: 6
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 7,
    color: '#666',
    borderTop: '1px solid #ddd',
    paddingTop: 8
  }
});

// Revenue PDF Component
const RevenuePDF = ({ data, dateRange, revenueSummary, monthlyRevenue }) => (
  <Document>
    <Page size="A4" style={revenuePdfStyles.page}>
      {/* Header: Logo Left, Company Info Right */}
      <View style={revenuePdfStyles.header}>
        <View style={revenuePdfStyles.logoContainer}>
          <Image 
            style={revenuePdfStyles.logo} 
            src="/logo.png" 
          />
          <Text style={revenuePdfStyles.companyName}>E I O Digital Solutions</Text>
        </View>
        <View style={revenuePdfStyles.companyInfo}>
          <Text style={revenuePdfStyles.companyNameMain}>E I O Digital Solutions Private Limited</Text>
          <Text style={revenuePdfStyles.companyDetails}>{companyInfo.address}</Text>
          <Text style={revenuePdfStyles.companyDetails}>{companyInfo.contact}</Text>
          <Text style={revenuePdfStyles.companyDetails}>{companyInfo.email}</Text>
              <Text style={revenuePdfStyles.companyDetails}>{companyInfo.website}</Text>
          <Text style={revenuePdfStyles.companyDetails}>{companyInfo.gstin}</Text>
        </View>
      </View>

      <Text style={revenuePdfStyles.title}>
        REVENUE REPORT
      </Text>

      <Text style={revenuePdfStyles.subtitle}>
        Period: {new Date(dateRange.startDate).toLocaleDateString('en-IN')} to {new Date(dateRange.endDate).toLocaleDateString('en-IN')}
      </Text>

      {/* Summary Section */}
      <View style={revenuePdfStyles.summarySection}>
        <Text style={revenuePdfStyles.summaryTitle}>Revenue Summary</Text>
        <View style={revenuePdfStyles.summaryGrid}>
          <View style={revenuePdfStyles.summaryCard}>
            <Text style={revenuePdfStyles.summaryLabel}>Total Revenue</Text>
            <Text style={revenuePdfStyles.summaryValue}>₹{revenueSummary.totalRevenue.toFixed(2)}</Text>
          </View>
          <View style={revenuePdfStyles.summaryCard}>
            <Text style={revenuePdfStyles.summaryLabel}>Total Invoices</Text>
            <Text style={revenuePdfStyles.summaryValue}>{revenueSummary.totalInvoices}</Text>
          </View>
          <View style={revenuePdfStyles.summaryCard}>
            <Text style={revenuePdfStyles.summaryLabel}>Average Invoice</Text>
            <Text style={revenuePdfStyles.summaryValue}>₹{revenueSummary.averageInvoice.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Monthly Revenue Section */}
      {Object.keys(monthlyRevenue).length > 0 && (
        <View style={revenuePdfStyles.monthlySection}>
          <Text style={revenuePdfStyles.monthlyTitle}>Monthly Revenue Breakdown</Text>
          {Object.entries(monthlyRevenue).map(([month, revenue]) => (
            <View key={month} style={revenuePdfStyles.monthlyItem}>
              <Text style={{ fontSize: 7 }}>{month}</Text>
              <Text style={{ fontSize: 7, fontWeight: 'bold' }}>₹{revenue.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Revenue Details Table */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#2c3e50' }}>
          Invoice Details
        </Text>
        <View style={revenuePdfStyles.table}>
          {/* Table Header */}
          <View style={revenuePdfStyles.tableRow}>
            <Text style={revenuePdfStyles.tableColHeader}>Invoice No</Text>
            <Text style={revenuePdfStyles.tableColHeader}>Date</Text>
            <Text style={revenuePdfStyles.tableColHeader}>Customer</Text>
            <Text style={revenuePdfStyles.tableColHeader}>Taxable</Text>
            <Text style={revenuePdfStyles.tableColHeader}>GST Amount</Text>
            <Text style={revenuePdfStyles.tableColHeader}>Round Off</Text>
            <Text style={revenuePdfStyles.tableColHeader}>Grand Total</Text>
          </View>

          {/* Table Rows */}
          {data.map((invoice, index) => (
            <View key={invoice._id} style={revenuePdfStyles.tableRow}>
              <Text style={revenuePdfStyles.tableCol}>{invoice.invoiceNumber}</Text>
              <Text style={revenuePdfStyles.tableCol}>
                {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
              </Text>
              <Text style={[revenuePdfStyles.tableCol, { textAlign: 'left' }]}>
                {invoice.billTo?.split('\n')[0] || 'N/A'}
              </Text>
              <Text style={revenuePdfStyles.tableCol}>
                ₹{(parseFloat(invoice.taxable) || 0).toFixed(2)}
              </Text>
              <Text style={revenuePdfStyles.tableCol}>
                ₹{((parseFloat(invoice.cgst) || 0) + (parseFloat(invoice.sgst) || 0)).toFixed(2)}
              </Text>
              <Text style={revenuePdfStyles.tableCol}>
                ₹{(parseFloat(invoice.roundOff) || 0).toFixed(2)}
              </Text>
              <Text style={revenuePdfStyles.tableCol}>
                ₹{(parseFloat(invoice.totalAmount) || 0).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={revenuePdfStyles.footer}>
        Generated by E I O Digital Solutions Billing System | {new Date().toLocaleDateString('en-IN')}
      </Text>
    </Page>
  </Document>
);

const Revenue = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [revenueSummary, setRevenueSummary] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    averageInvoice: 0
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    calculateRevenueSummary();
  }, [filteredData]);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/invoices');
      setInvoices(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };

  const calculateRevenueSummary = () => {
    const summary = filteredData.reduce((acc, invoice) => {
      acc.totalRevenue += parseFloat(invoice.totalAmount) || 0;
      acc.totalInvoices += 1;
      return acc;
    }, { totalRevenue: 0, totalInvoices: 0 });

    summary.averageInvoice = summary.totalInvoices > 0 ? summary.totalRevenue / summary.totalInvoices : 0;
    setRevenueSummary(summary);
  };

  const handleDateFilter = () => {
    const filtered = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      
      return invoiceDate >= start && invoiceDate <= end;
    });
    setFilteredData(filtered);
  };

  const handleResetFilter = () => {
    setDateRange({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setFilteredData(invoices);
  };

  const exportToExcel = () => {
    const headers = ['Invoice No', 'Date', 'Customer', 'Taxable Amount', 'GST', 'Round Off', 'Grand Total'];
    const csvData = filteredData.map(inv => [
      inv.invoiceNumber,
      new Date(inv.invoiceDate).toLocaleDateString(),
      inv.billTo?.split('\n')[0] || 'N/A',
      (parseFloat(inv.taxable) || 0).toFixed(2),
      ((parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0)).toFixed(2),
      (parseFloat(inv.roundOff) || 0).toFixed(2),
      (parseFloat(inv.totalAmount) || 0).toFixed(2)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Revenue_Report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Monthly revenue calculation for chart
  const getMonthlyRevenue = () => {
    const monthlyData = {};
    filteredData.forEach(invoice => {
      const date = new Date(invoice.invoiceDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += parseFloat(invoice.totalAmount) || 0;
    });
    
    return monthlyData;
  };

  const monthlyRevenue = getMonthlyRevenue();

  return (
    <div className="revenue-container">
      <div className="header-bar">
        <h2>Revenue Report</h2>
        <div className="header-actions">
          <PDFDownloadLink
            document={<RevenuePDF 
              data={filteredData} 
              dateRange={dateRange} 
              revenueSummary={revenueSummary}
              monthlyRevenue={monthlyRevenue}
            />}
            fileName={`Revenue_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`}
            className="btn-pdf"
          >
            {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
          </PDFDownloadLink>
          <button className="btn-excel" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="filter-section">
        <div className="date-filter">
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <button className="btn-primary" onClick={handleDateFilter}>
            Apply Filter
          </button>
          <button className="btn-secondary" onClick={handleResetFilter}>
            Reset
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-header">Total Revenue</div>
            <div className="card-value">₹{revenueSummary.totalRevenue.toFixed(2)}</div>
            <div className="card-subtitle">Sum of all invoice totals</div>
          </div>
        </div>
        <div className="summary-card invoices-card">
          <div className="card-icon">📄</div>
          <div className="card-content">
            <div className="card-header">Total Invoices</div>
            <div className="card-value">{revenueSummary.totalInvoices}</div>
            <div className="card-subtitle">Number of invoices</div>
          </div>
        </div>
        <div className="summary-card average-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-header">Average Invoice</div>
            <div className="card-value">₹{revenueSummary.averageInvoice.toFixed(2)}</div>
            <div className="card-subtitle">Per invoice average</div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="chart-section">
        <div className="section-header">
          <h3>Monthly Revenue Overview</h3>
          <span className="section-subtitle">Revenue distribution by month</span>
        </div>
        <div className="monthly-chart">
          {Object.keys(monthlyRevenue).length === 0 ? (
            <div className="no-chart-data">No data available for the selected period</div>
          ) : (
            <div className="chart-bars">
              {Object.entries(monthlyRevenue).map(([month, revenue]) => (
                <div key={month} className="chart-bar-container">
                  <div className="chart-bar-label">{month}</div>
                  <div className="chart-bar">
                    <div 
                      className="chart-bar-fill"
                      style={{ 
                        height: `${Math.max(10, (revenue / Math.max(...Object.values(monthlyRevenue))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="chart-bar-value">₹{revenue.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Details Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Revenue Details</h3>
          <span className="record-count">{filteredData.length} records found</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Taxable Amount</th>
              <th>GST Amount</th>
              <th>Round Off</th>
              <th>Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No invoices found for the selected period
                </td>
              </tr>
            ) : (
              filteredData.map(invoice => (
                <tr key={invoice._id}>
                  <td className="invoice-number">{invoice.invoiceNumber}</td>
                  <td className="invoice-date">
                    {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="customer-name">{invoice.billTo?.split('\n')[0] || 'N/A'}</td>
                  <td className="taxable-amount">₹{(parseFloat(invoice.taxable) || 0).toFixed(2)}</td>
                  <td className="gst-amount">
                    ₹{((parseFloat(invoice.cgst) || 0) + (parseFloat(invoice.sgst) || 0)).toFixed(2)}
                  </td>
                  <td className="round-off">₹{(parseFloat(invoice.roundOff) || 0).toFixed(2)}</td>
                  <td className="grand-total">
                    <strong>₹{(parseFloat(invoice.totalAmount) || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Revenue;