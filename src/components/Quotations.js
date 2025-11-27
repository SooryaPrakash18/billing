import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import '../css/Quotations.css';

// PDF Styles (same as invoices)
const pdfStyles = StyleSheet.create({
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
  table: { 
    display: 'table', 
    width: 'auto', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#333', 
    marginTop: 0,
    fontSize: 8
  },
  tableRow: { 
    flexDirection: 'row',
    minHeight: 22
  },
  tableColHeader: { 
    backgroundColor: '#f8f9fa', 
    padding: 6, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    borderRightWidth: 1, 
    borderBottomWidth: 1,
    borderColor: '#333',
    fontSize: 8
  },
  tableCol: { 
    padding: 6, 
    textAlign: 'center', 
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    fontSize: 8
  },
  customerText: {
    fontSize: 8,
    marginBottom: 3,
    textAlign: 'left'
  },
  gstinText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'left'
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: 220, 
    marginBottom: 4,
    alignItems: 'center'
  },
  totalLabel: { 
    fontWeight: 'bold', 
    fontSize: 9 
  },
  totalValue: { 
    fontWeight: 'bold', 
    color: '#333',
    fontSize: 9 
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#2c3e50'
  },
  grandTotalValue: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#28a745'
  },
  inWords: { 
    fontSize: 8, 
    fontStyle: 'italic', 
    color: '#666', 
    marginTop: 6, 
    textAlign: 'right',
    fontWeight: 'bold'
  },
  bankTable: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 4,
    fontSize: 7
  },
  bankTableRow: { 
    flexDirection: 'row',
    minHeight: 20
  },
  bankTableColHeader: {
    backgroundColor: '#f8f9fa',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
    fontSize: 7
  },
  bankTableCol: {
    padding: 5,
    textAlign: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    fontSize: 7
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'flex-start'
  },
  termsSection: {
    width: '48%'
  },
  bankSection: {
    width: '48%'
  },
  termsList: {
    flexDirection: 'column'
  },
  termItem: {
    fontSize: 7,
    marginBottom: 3,
    lineHeight: 1.2
  },
  // statusBadge: {
  //   position: 'absolute',
  //   top: 20,
  //   right: 20,
  //   padding: '4px 12px',
  //   backgroundColor: '#ffc107',
  //   color: '#000',
  //   fontSize: 10,
  //   fontWeight: 'bold',
  //   borderRadius: 4
  // }
});

// Number to Words
const numberToWords = (num) => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  if (num === 0) return 'Zero';

  let word = '';
  let i = 0;
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk) {
      let chunkWord = '';
      const hundreds = Math.floor(chunk / 100);
      const tensAndUnits = chunk % 100;
      if (hundreds) chunkWord += units[hundreds] + ' Hundred ';
      if (tensAndUnits >= 10 && tensAndUnits < 20) {
        chunkWord += teens[tensAndUnits - 10] + ' ';
      } else if (tensAndUnits >= 20) {
        chunkWord += tens[Math.floor(tensAndUnits / 10)] + ' ' + units[tensAndUnits % 10] + ' ';
      } else if (tensAndUnits > 0) {
        chunkWord += units[tensAndUnits] + ' ';
      }
      word = chunkWord + thousands[i] + ' ' + word;
    }
    num = Math.floor(num / 1000);
    i++;
  }
  return word.trim() + ' Only';
};

// PDF Quotation Component
const PDFQuotation = ({ formData, quotationNumber, total, status }) => {
  // HSN Summary Calculation
  const hsnSummary = formData.items.reduce((acc, item) => {
    const hsn = item.itemCode || 'N/A';
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const disc = parseFloat(item.disc) || 0;

    const subtotal = qty * price;
    const discount = subtotal * (disc / 100);
    const taxable = subtotal - discount;

    if (!acc[hsn]) {
      acc[hsn] = { 
        taxable: 0, 
        cgstRate: formData.cgstRate || 0, 
        sgstRate: formData.sgstRate || 0, 
        cgstAmt: 0, 
        sgstAmt: 0 
      };
    }
    acc[hsn].taxable += taxable;
    acc[hsn].cgstAmt += (taxable * (formData.cgstRate || 0)) / 100;
    acc[hsn].sgstAmt += (taxable * (formData.sgstRate || 0)) / 100;

    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      // case 'Approved': return '#28a745';
      // case 'Rejected': return '#dc3545';
      // case 'Pending': return '#ffc107';
      // default: return '#6c757d';
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Status Badge */}
        <View style={[pdfStyles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text>{status}</Text>
        </View>

        {/* Header: Logo Left, Company Info Right */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoContainer}>
            <Image 
              style={pdfStyles.logo} 
              src="/logo.png" 
            />
            <Text style={pdfStyles.companyName}>E I O Digital Solutions</Text>
          </View>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyNameMain}>E I O Digital Solutions Private Limited</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.address}</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.contact}</Text>
            <Text style={pdfStyles.companyDetails}>GSTIN: {formData.companyInfo?.gstin}</Text>
          </View>
        </View>

        <Text style={pdfStyles.title}>
          QUOTATION
        </Text>

        {/* Quotation Details Table */}
        <View style={[pdfStyles.table, {marginBottom: 10}]}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Quotation No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Date</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>PO No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Valid Until</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{quotationNumber}</Text>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{new Date(formData.quotationDate).toLocaleDateString('en-IN')}</Text>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{formData.poNo || '-'}</Text>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{new Date(new Date(formData.quotationDate).setDate(new Date(formData.quotationDate).getDate() + 30)).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Bill To / Ship To Table */}
        <View style={[pdfStyles.table, {marginBottom: 10}]}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableColHeader, {width: '50%'}]}>Bill To:</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '50%'}]}>Ship To:</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, {width: '50%', padding: 6}]}>
              <Text style={pdfStyles.customerText}>{formData.billTo}</Text>
              <Text style={pdfStyles.gstinText}>GSTIN: {formData.billToGSTIN || 'N/A'}</Text>
            </View>
            <View style={[pdfStyles.tableCol, {width: '50%', padding: 6}]}>
              <Text style={pdfStyles.customerText}>{formData.shipTo || formData.billTo}</Text>
              <Text style={pdfStyles.gstinText}>GSTIN: {formData.shipToGSTIN || formData.billToGSTIN || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={[pdfStyles.table, {marginBottom: 10}]}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableColHeader, {width: '8%'}]}>S.No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '32%'}]}>Description</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '12%'}]}>HSN/SAC</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '10%'}]}>Qty</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '12%'}]}>Rate</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '10%'}]}>Disc %</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '16%'}]}>Amount (₹)</Text>
          </View>
          {formData.items.map((item, index) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            const disc = parseFloat(item.disc) || 0;
            const subtotal = qty * price;
            const discount = subtotal * (disc / 100);
            const amount = subtotal - discount;

            return (
              <View key={index} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCol, {width: '8%'}]}>{index + 1}</Text>
                <Text style={[pdfStyles.tableCol, {width: '32%', textAlign: 'left', paddingLeft: 6}]}>{item.item}</Text>
                <Text style={[pdfStyles.tableCol, {width: '12%'}]}>{item.itemCode || '-'}</Text>
                <Text style={[pdfStyles.tableCol, {width: '10%'}]}>{qty}</Text>
                <Text style={[pdfStyles.tableCol, {width: '12%'}]}>{price.toFixed(2)}</Text>
                <Text style={[pdfStyles.tableCol, {width: '10%'}]}>{disc}%</Text>
                <Text style={[pdfStyles.tableCol, {width: '16%'}]}>{amount.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Section: Totals Left, Signatory Right */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {/* Left: Totals */}
          <View style={{ width: '50%' }}>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Taxable Amount:</Text>
              <Text style={pdfStyles.totalValue}>₹{parseFloat(formData.taxable || 0).toFixed(2)}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>CGST ({parseFloat(formData.cgstRate || 0).toFixed(2)}%):</Text>
              <Text style={pdfStyles.totalValue}>₹{parseFloat(formData.cgst || 0).toFixed(2)}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>SGST ({parseFloat(formData.sgstRate || 0).toFixed(2)}%):</Text>
              <Text style={pdfStyles.totalValue}>₹{parseFloat(formData.sgst || 0).toFixed(2)}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Round Off:</Text>
              <Text style={pdfStyles.totalValue}>₹{parseFloat(formData.roundOff || 0).toFixed(2)}</Text>
            </View>
            <View style={[pdfStyles.totalRow, {borderTop: '1px solid #333', paddingTop: 4, marginTop: 4}]}>
              <Text style={pdfStyles.grandTotalLabel}>Grand Total:</Text>
              <Text style={pdfStyles.grandTotalValue}>₹{total.toFixed(2)}</Text>
            </View>
            <Text style={pdfStyles.inWords}>
              Amount in Words: {numberToWords(Math.round(total))}
            </Text>
          </View>

          {/* Right: Authorized Signatory */}
          <View style={{ width: '45%', alignItems: 'flex-end' }}>
            <Text style={{ marginBottom: 35, fontSize: 9 }}>
              For <Text style={{ fontWeight: 'bold' }}>{formData.billTo.split('\n')[0] || 'Customer'}</Text>
            </Text>
            <View style={{ height: 55, width: 190, border: '1px dashed #999', marginBottom: 8 }} />
            <Text style={{ fontSize: 9, marginBottom: 3, fontWeight: 'bold' }}>Authorized Signatory</Text>
            <Text style={{ fontSize: 8, color: '#555' }}>(Company Seal & Signature)</Text>
          </View>
        </View>

        {/* HSN Summary */}
        {Object.keys(hsnSummary).length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 10 }}>HSN/SAC Summary</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>HSN/SAC</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>Taxable Value</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>CGST Rate</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>CGST Amt</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>SGST Rate</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>SGST Amt</Text>
              </View>
              {Object.entries(hsnSummary).map(([hsn, data]) => (
                <View key={hsn} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.tableCol, {width: '20%'}]}>{hsn}</Text>
                  <Text style={[pdfStyles.tableCol, {width: '20%'}]}>{data.taxable.toFixed(2)}</Text>
                  <Text style={[pdfStyles.tableCol, {width: '15%'}]}>{data.cgstRate.toFixed(1)}%</Text>
                  <Text style={[pdfStyles.tableCol, {width: '15%'}]}>{data.cgstAmt.toFixed(2)}</Text>
                  <Text style={[pdfStyles.tableCol, {width: '15%'}]}>{data.sgstRate.toFixed(1)}%</Text>
                  <Text style={[pdfStyles.tableCol, {width: '15%'}]}>{data.sgstAmt.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer: Bank Details and Terms & Conditions */}
        <View style={[pdfStyles.footerSection, {marginTop: 10}]}>
          {/* Bank Details */}
          <View style={pdfStyles.bankSection}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 10 }}>Bank Details</Text>
            <View style={pdfStyles.bankTable}>
              <View style={pdfStyles.bankTableRow}>
                <Text style={[pdfStyles.bankTableColHeader, {width: '20%'}]}>Bank</Text>
                <Text style={[pdfStyles.bankTableColHeader, {width: '25%'}]}>Branch</Text>
                <Text style={[pdfStyles.bankTableColHeader, {width: '30%'}]}>A/C No</Text>
                <Text style={[pdfStyles.bankTableColHeader, {width: '25%'}]}>IFSC</Text>
              </View>
              <View style={pdfStyles.bankTableRow}>
                <Text style={[pdfStyles.bankTableCol, {width: '20%'}]}>AXIS</Text>
                <Text style={[pdfStyles.bankTableCol, {width: '25%'}]}>Tirunelveli</Text>
                <Text style={[pdfStyles.bankTableCol, {width: '30%'}]}>909020038938337</Text>
                <Text style={[pdfStyles.bankTableCol, {width: '25%'}]}>UTB0000258</Text>
              </View>
              <View style={pdfStyles.bankTableRow}>
                <Text style={[pdfStyles.bankTableCol, {width: '20%'}]}>IOB</Text>
                <Text style={[pdfStyles.bankTableCol, {width: '25%'}]}>Junction</Text>
                <Text style={[pdfStyles.bankTableCol, {width: '30%'}]}>057002000000362</Text>
                <Text style={[pdfStyles.bankTableCol, {width: '25%'}]}>IOBA0000570</Text>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={pdfStyles.termsSection}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 10 }}>Terms & Conditions</Text>
            <View style={pdfStyles.termsList}>
              <Text style={pdfStyles.termItem}>1. This quotation is valid for 30 days from the date of issue</Text>
              <Text style={pdfStyles.termItem}>2. Prices are subject to change without prior notice</Text>
              <Text style={pdfStyles.termItem}>3. Delivery time: 7-15 working days from order confirmation</Text>
              <Text style={pdfStyles.termItem}>4. Payment: 50% advance, 50% before delivery</Text>
              <Text style={pdfStyles.termItem}>5. Taxes extra as applicable</Text>
              <Text style={pdfStyles.termItem}>6. Disputes subject to Tirunelveli jurisdiction</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [quotationNumber, setQuotationNumber] = useState('');
  const [companySettings, setCompanySettings] = useState({});
  const [filter, setFilter] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  const initialForm = {
    companyInfo: { address: '', contact: '', logo: '', gstin: '', bankDetails: '' },
    billTo: '', billToGSTIN: '',
    shipTo: '', shipToGSTIN: '',
    poNo: '',
    modeOfTransport: '',
    quotationDate: new Date().toISOString().substr(0, 10),
    items: [{ item: '', itemCode: '', qty: 1, price: 0, disc: 0, amount: 0 }],
    paymentMode: 'COD',
    taxable: 0,
    cgstRate: 9,
    sgstRate: 9,
    cgst: 0, 
    sgst: 0, 
    roundOff: 0,
    // status: 'Pending',
    clientName: '',
    clientEmail: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Transport options
  const transportOptions = ['Air', 'Ship', 'Roadways', 'Railways'];

  // Fetch quotations and settings
  useEffect(() => {
    fetchQuotations();
    fetchSettings();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [quotations, filter]);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/quotations');
      const sorted = res.data.sort((a, b) => new Date(b.quotationDate) - new Date(a.quotationDate));
      setQuotations(sorted);
    } catch (err) {
      showAlert('error', 'Failed to load quotations');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/settings');
      setCompanySettings(res.data);
      const logo = res.data.logo || '/logo.png';
      setLogoPreview(logo);
    } catch (err) {
      console.error('Settings fetch failed:', err);
      setLogoPreview('/logo.png');
    }
  };

  const calculateStats = () => {
    let filteredQuotations = quotations;

    if (filter.status) {
      filteredQuotations = filteredQuotations.filter(q => q.status === filter.status);
    }

    if (filter.startDate && filter.endDate) {
      filteredQuotations = filteredQuotations.filter(q => {
        const quotationDate = new Date(q.quotationDate);
        return quotationDate >= new Date(filter.startDate) && 
               quotationDate <= new Date(filter.endDate);
      });
    }

    const total = filteredQuotations.length;
    const pending = filteredQuotations.filter(q => q.status === 'Pending').length;
    const approved = filteredQuotations.filter(q => q.status === 'Approved').length;
    const rejected = filteredQuotations.filter(q => q.status === 'Rejected').length;
    const totalAmount = filteredQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    setStats({ total, pending, approved, rejected, totalAmount });
  };

  const generateQuotationNumber = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/quotations');
      const count = res.data.length;
      const num = `QT-${String(count + 1).padStart(4, '0')}`;
      setQuotationNumber(num);
      return num;
    } catch (err) {
      showAlert('error', 'Failed to generate quotation number');
      return 'QT-0001';
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  // Calculate automatic round off
  const calculateRoundOff = (amount) => {
    const decimal = amount - Math.floor(amount);
    if (decimal === 0) return 0;
    
    if (decimal >= 0.5) {
      return Math.ceil(amount) - amount;
    } else {
      return Math.floor(amount) - amount;
    }
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];

    if (['qty', 'price', 'disc'].includes(field)) {
      items[index][field] = value === '' ? '' : parseFloat(value) || 0;
    } else {
      items[index][field] = value;
    }

    const item = items[index];
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const disc = parseFloat(item.disc) || 0;

    const subtotal = qty * price;
    const discount = subtotal * (disc / 100);
    items[index].amount = subtotal - discount;

    setFormData({ ...formData, items });
    recalculateTotals(items);
  };

  const recalculateTotals = (items) => {
    const taxable = items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      const disc = parseFloat(item.disc) || 0;
      const subtotal = qty * price;
      const discount = subtotal * (disc / 100);
      return sum + (subtotal - discount);
    }, 0);

    const cgstRate = parseFloat(formData.cgstRate) || 0;
    const sgstRate = parseFloat(formData.sgstRate) || 0;
    const cgstAmt = taxable * (cgstRate / 100);
    const sgstAmt = taxable * (sgstRate / 100);

    const totalBeforeRoundOff = taxable + cgstAmt + sgstAmt;
    const roundOff = calculateRoundOff(totalBeforeRoundOff);
    const finalTotal = totalBeforeRoundOff + roundOff;

    setFormData(prev => ({ 
      ...prev, 
      taxable, 
      cgst: cgstAmt, 
      sgst: sgstAmt, 
      roundOff,
      totalAmount: finalTotal 
    }));
  };

  const handleCgstRateChange = (value) => {
    const cgstRate = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, cgstRate }));
    recalculateTotals(formData.items);
  };

  const handleSgstRateChange = (value) => {
    const sgstRate = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, sgstRate }));
    recalculateTotals(formData.items);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', itemCode: '', qty: 1, price: 0, disc: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
    recalculateTotals(items);
  };

  const calculateTotal = () => {
    const taxable = parseFloat(formData.taxable) || 0;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const roundOff = parseFloat(formData.roundOff) || 0;
    return taxable + cgst + sgst + roundOff;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = calculateTotal();

    let qtNum = quotationNumber;
    if (!editingId && !qtNum) {
      qtNum = await generateQuotationNumber();
    }

    const payload = {
      ...formData,
      totalAmount: total,
      quotationNumber: qtNum,
      quotationDate: formData.quotationDate ? new Date(formData.quotationDate).toISOString() : new Date().toISOString()
    };

    try {
      if (editingId) {
        await axios.put(`https://billing-ki8l.onrender.com/api/quotations/${editingId}`, payload);
        showAlert('success', 'Quotation updated successfully!');
      } else {
        await axios.post('https://billing-ki8l.onrender.com/api/quotations', payload);
        showAlert('success', 'Quotation created successfully!');
      }
      resetForm();
      fetchQuotations();
    } catch (err) {
      console.error(err);
      showAlert('error', editingId ? 'Failed to update quotation' : 'Failed to create quotation');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setQuotationNumber('');
    setFormData(initialForm);
  };

  const openEdit = (quotation) => {
    setFormData({
      companyInfo: quotation.companyInfo || { address: '', contact: '', logo: '', gstin: '', bankDetails: '' },
      billTo: quotation.billTo || '',
      billToGSTIN: quotation.billToGSTIN || '',
      shipTo: quotation.shipTo || '',
      shipToGSTIN: quotation.shipToGSTIN || '',
      poNo: quotation.poNo || '',
      modeOfTransport: quotation.modeOfTransport || '',
      quotationDate: quotation.quotationDate ? new Date(quotation.quotationDate).toISOString().substr(0, 10) : new Date().toISOString().substr(0, 10),
      items: (quotation.items || []).map(i => ({
        item: i.item || '',
        itemCode: i.itemCode || '',
        qty: parseFloat(i.qty) || 0,
        price: parseFloat(i.price) || 0,
        disc: parseFloat(i.disc) || 0,
        amount: parseFloat(i.amount) || 0
      })),
      paymentMode: quotation.paymentMode || 'COD',
      taxable: parseFloat(quotation.taxable) || 0,
      cgstRate: parseFloat(quotation.cgstRate) || 9,
      sgstRate: parseFloat(quotation.sgstRate) || 9,
      cgst: parseFloat(quotation.cgst) || 0,
      sgst: parseFloat(quotation.sgst) || 0,
      roundOff: parseFloat(quotation.roundOff) || 0,
      status: quotation.status || 'Pending',
      clientName: quotation.clientName || '',
      clientEmail: quotation.clientEmail || '',
      description: quotation.description || ''
    });
    setLogoPreview(quotation.companyInfo?.logo || '/logo.png');
    setQuotationNumber(quotation.quotationNumber || '');
    setEditingId(quotation._id);
    setShowForm(true);
  };

  const deleteQuotation = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await axios.delete(`https://billing-ki8l.onrender.com/api/quotations/${id}`);
        showAlert('success', 'Quotation deleted successfully!');
        fetchQuotations();
      } catch (err) {
        showAlert('error', 'Failed to delete quotation');
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    const quotation = quotations.find(q => q._id === id);
    
    if (quotation.status === newStatus) {
      showAlert('info', `This quotation is already ${newStatus}`);
      return;
    }

    if (window.confirm(`Are you sure you want to mark this quotation as ${newStatus}?`)) {
      try {
        await axios.put(`https://billing-ki8l.onrender.com/api/quotations/${id}`, { status: newStatus });
        showAlert('success', `Quotation marked as ${newStatus}!`);
        fetchQuotations();
      } catch (err) {
        showAlert('error', 'Failed to update quotation status');
      }
    }
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(formData.items.map((item, index) => ({
      'Sr No': index + 1,
      Description: item.item,
      'HSN/SAC': item.itemCode,
      Qty: item.qty,
      Rate: item.price,
      'Disc %': item.disc,
      Amount: item.amount
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
    XLSX.writeFile(wb, `Quotation_${quotationNumber || 'QT-0000'}.xlsx`);
  };

  // Auto-fill company info when creating new quotation
  useEffect(() => {
    if (showForm && !editingId && Object.keys(companySettings).length > 0) {
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          address: companySettings.address || '',
          contact: companySettings.contact || '',
          logo: companySettings.logo || '/logo.png',
          gstin: companySettings.gstin || '',
          bankDetails: companySettings.bankDetails || ''
        }
      }));
      setLogoPreview(companySettings.logo || '/logo.png');
    }
  }, [showForm, editingId, companySettings]);

  const handleFilterChange = (field, value) => {
    const newFilter = { ...filter, [field]: value };
    setFilter(newFilter);
  };

  const clearFilters = () => {
    setFilter({ status: '', startDate: '', endDate: '' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const filteredQuotations = quotations
    .filter(quotation => {
      if (filter.status && quotation.status !== filter.status) return false;
      if (filter.startDate && filter.endDate) {
        const quotationDate = new Date(quotation.quotationDate);
        return quotationDate >= new Date(filter.startDate) && 
               quotationDate <= new Date(filter.endDate);
      }
      return true;
    })
    .sort((a, b) => new Date(b.quotationDate) - new Date(a.quotationDate));

  const total = calculateTotal();

  return (
    <div className="quotations-container">
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="header-bar">
        <h2>📋 Quotations</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); if (!editingId) generateQuotationNumber(); }}>
          Create Quotation
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards row mb-4">
        <div className="col-md-3">
          <div className="stat-card total">
            <h3>{stats.total}</h3>
            <p>Total Quotations</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card pending">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card approved">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card rejected">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section mb-4">
        <h4>🔍 Filter Quotations</h4>
        <div className="row">
          <div className="col-md-3">
            <label>Status</label>
            <select
              className="form-control"
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-3">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={clearFilters}
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{editingId ? 'Edit Quotation' : 'Create Quotation'}</h4>
              <button className="btn-close" onClick={resetForm}></button>
            </div>

            {/* Logo Preview in Form */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src={logoPreview}
                alt="Company Logo"
                style={{ width: 100, height: 100, objectFit: 'contain', border: '1px solid #ddd' }}
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <p style={{ fontSize: '0.8rem', color: '#666' }}>E I O Logo Preview </p>
            </div>

            <form className="quotation-form" onSubmit={handleSubmit}>
              {/* Client Information */}
              <div className="section">
                <h5>Client Information</h5>
                <div className="client-info-grid">
                  <div>
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div>
                    <label>Client Email</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="client@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter quotation description"
                    rows="3"
                  />
                </div>
              </div>

              {/* Quotation Details */}
              <div className="section">
                <h5>Quotation Details</h5>
                <div className="quotation-details-grid">
                  <div>
                    <label>Quotation Number</label>
                    <input type="text" value={quotationNumber} readOnly className="readonly" />
                  </div>
                  <div>
                    <label>Quotation Date</label>
                    <input
                      type="date"
                      value={formData.quotationDate}
                      onChange={e => setFormData({ ...formData, quotationDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>PO No</label>
                    <input
                      type="text"
                      value={formData.poNo}
                      onChange={e => setFormData({ ...formData, poNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div className="section bill-ship">
                <div>
                  <label>Bill To</label>
                  <input
                    type="text"
                    placeholder="Customer Name and Address"
                    required
                    value={formData.billTo}
                    onChange={e => setFormData({ ...formData, billTo: e.target.value })}
                  />
                  <label>GSTIN</label>
                  <input
                    type="text"
                    placeholder="Bill To GSTIN"
                    value={formData.billToGSTIN}
                    onChange={e => setFormData({ ...formData, billToGSTIN: e.target.value })}
                  />
                </div>
                <div>
                  <label>Ship To</label>
                  <input
                    type="text"
                    placeholder="Ship To Name and Address"
                    value={formData.shipTo}
                    onChange={e => setFormData({ ...formData, shipTo: e.target.value })}
                  />
                  <label>GSTIN</label>
                  <input
                    type="text"
                    placeholder="Ship To GSTIN"
                    value={formData.shipToGSTIN}
                    onChange={e => setFormData({ ...formData, shipToGSTIN: e.target.value })}
                  />
                </div>
              </div>

           {/* Items Table */}
<div className="section items-section">
  <h5>Items</h5>
  <div className="items-table">
    {/* Desktop Header */}
    <div className="items-table-header">
      <div className="items-table-header-row">
        <div className="table-header-cell">Description</div>
        <div className="table-header-cell">HSN/SAC</div>
        <div className="table-header-cell">Qty</div>
        <div className="table-header-cell">Rate</div>
        <div className="table-header-cell">Disc %</div>
        <div className="table-header-cell">Amount</div>
        <div className="table-header-cell"></div>
      </div>
    </div>
    
    {/* Items Body */}
    <div className="items-table-body">
      {formData.items.map((item, i) => (
        <div key={i} className="table-row">
          {/* Description */}
          <div className="table-cell" data-label="Description">
            <input
              type="text"
              className="item-input"
              value={item.item}
              onChange={e => handleItemChange(i, 'item', e.target.value)}
              placeholder="e.g. APC Home UPS 1000VA"
            />
          </div>
          
          {/* HSN/SAC */}
          <div className="table-cell" data-label="HSN/SAC">
            <input 
              type="text" 
              className="item-input"
              value={item.itemCode} 
              onChange={e => handleItemChange(i, 'itemCode', e.target.value)} 
              placeholder="8504" 
            />
          </div>
          
          {/* Quantity */}
          <div className="table-cell" data-label="Qty">
            <input 
              type="number" 
              className="item-input"
              value={item.qty} 
              onChange={e => handleItemChange(i, 'qty', e.target.value)} 
              min="1" 
            />
          </div>
          
          {/* Rate */}
          <div className="table-cell" data-label="Rate">
            <input 
              type="number" 
              className="item-input"
              value={item.price} 
              onChange={e => handleItemChange(i, 'price', e.target.value)} 
              step="0.01" 
            />
          </div>
          
          {/* Discount */}
          <div className="table-cell" data-label="Disc %">
            <input 
              type="number" 
              className="item-input"
              value={item.disc} 
              onChange={e => handleItemChange(i, 'disc', e.target.value)} 
              min="0" 
              max="100" 
            />
          </div>
          
          {/* Amount */}
          <div className="table-cell amount-cell" data-label="Amount">
            ₹{parseFloat(item.amount || 0).toFixed(2)}
          </div>
          
          {/* Delete Button */}
          <div className="table-cell">
            <button type="button" className="btn-delete" onClick={() => removeItem(i)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
    
    <button type="button" className="btn-add-item" onClick={addItem}>
      <span>+</span> Add Item
    </button>
  </div>
</div>

{/* Tax & Total Section */}
<div className="section tax-total-section">
  <h5>Tax & Total</h5>
  <div className="tax-grid">
    <div className="form-group">
      <label>Taxable Amount</label>
      <input 
        type="number" 
        step="0.01" 
        value={formData.taxable.toFixed(2)} 
        readOnly 
        className="readonly" 
      />
    </div>
    
    <div className="form-group">
      <label>CGST Rate %</label>
      <input 
        type="number" 
        step="0.01" 
        value={formData.cgstRate} 
        onChange={e => handleCgstRateChange(e.target.value)}
        min="0"
        max="28"
      />
    </div>
    
    <div className="form-group">
      <label>CGST Amount</label>
      <input 
        type="number" 
        step="0.01" 
        value={formData.cgst.toFixed(2)} 
        readOnly 
        className="readonly"
      />
    </div>
    
    <div className="form-group">
      <label>SGST Rate %</label>
      <input 
        type="number" 
        step="0.01" 
        value={formData.sgstRate} 
        onChange={e => handleSgstRateChange(e.target.value)}
        min="0"
        max="28"
      />
    </div>
    
    <div className="form-group">
      <label>SGST Amount</label>
      <input 
        type="number" 
        step="0.01" 
        value={formData.sgst.toFixed(2)} 
        readOnly 
        className="readonly"
      />
    </div>
  </div>
  
  <div className="final-total">
    <strong>Total: ₹{total.toFixed(2)}</strong>
    <p className="in-words">In Words: {numberToWords(Math.round(total))}</p>
  </div>
</div>

              {/* Payment Mode */}
              <div className="section payment-mode">
                <label>Payment Mode:</label>
                <div className="radio-group">
                  <label><input type="radio" name="pay" value="COD" checked={formData.paymentMode === 'COD'}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} /> COD</label>
                  <label><input type="radio" name="pay" value="UPI" checked={formData.paymentMode === 'UPI'}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} /> UPI</label>
                  <label><input type="radio" name="pay" value="Net Banking" checked={formData.paymentMode === 'Net Banking'}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} /> Net Banking</label>
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <PDFDownloadLink 
                  document={<PDFQuotation 
                    formData={formData} 
                    quotationNumber={quotationNumber} 
                    total={total}
                    status={formData.status}
                  />} 
                  fileName={`Quotation_${quotationNumber || 'Draft'}.pdf`}
                >
                  {({ loading }) => (
                    <button type="button" className="btn-pdf" disabled={loading}>
                      {loading ? 'Generating...' : 'Download PDF'}
                    </button>
                  )}
                </PDFDownloadLink>
                <button type="button" className="btn-excel" onClick={downloadExcel}>Excel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Save'}</button>
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotations List */}
      <div className="quotations-list">
        <table className="table">
          <thead>
            <tr>
              <th>Quotation No</th>
              <th>Date</th>
              <th>Client</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No quotations yet. Create one!</td></tr>
            ) : (
              filteredQuotations.map(qt => (
                <tr key={qt._id}>
                  <td>{qt.quotationNumber || 'N/A'}</td>
                  <td>{new Date(qt.quotationDate || qt.createdAt).toLocaleDateString()}</td>
                  <td>{qt.clientName || qt.billTo}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(qt.status)}`}>
                      {qt.status}
                    </span>
                  </td>
                  <td><strong>₹{(qt.totalAmount || 0).toFixed(2)}</strong></td>
                  <td className="actions">
                    <button className="btn-sm btn-success" onClick={() => updateStatus(qt._id, 'Approved')} disabled={qt.status === 'Approved'}>Approve</button>
                    <button className="btn-sm btn-danger" onClick={() => updateStatus(qt._id, 'Rejected')} disabled={qt.status === 'Rejected'}>Reject</button>
                    <button className="btn-sm btn-info" onClick={() => openEdit(qt)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => deleteQuotation(qt._id)}>Delete</button>
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

export default Quotations;