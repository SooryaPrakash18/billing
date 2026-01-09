import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import '../css/Invoices.css';

// PDF Styles
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
    borderColor: '#333',
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
  bankDetails: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 1.4
  },
  bankDetailLine: {
    marginBottom: 2
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
  signatureContainer: {
    width: '45%',
    alignItems: 'flex-end'
  },
  signatureBox: {
    height: 155,
    width: 190,
    marginBottom: 8,
    position: 'relative'
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  signatureText: {
    fontSize: 9,
    marginBottom: 3,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  signatureSubText: {
    fontSize: 8,
    color: '#555',
    textAlign: 'center'
  }
});

// Number to Words
const numberToWords = (num) => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      return tens[ten] + (unit ? ' ' + units[unit] : '');
    }
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return units[hundred] + ' Hundred' + (remainder ? ' and ' + convertLessThanThousand(remainder) : '');
  };

  const convertIndianNumber = (n) => {
    if (n === 0) return '';
    
    let crore = Math.floor(n / 10000000);
    let lakh = Math.floor((n % 10000000) / 100000);
    let thousand = Math.floor((n % 100000) / 1000);
    let hundred = n % 1000;
    
    let parts = [];
    
    if (crore > 0) {
      parts.push(convertLessThanThousand(crore) + ' Crore');
    }
    if (lakh > 0) {
      parts.push(convertLessThanThousand(lakh) + ' Lakh');
    }
    if (thousand > 0) {
      parts.push(convertLessThanThousand(thousand) + ' Thousand');
    }
    if (hundred > 0) {
      parts.push(convertLessThanThousand(hundred));
    }
    
    return parts.join(' ');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  if (rupees > 0) {
    result = convertIndianNumber(rupees) + ' Rupees';
  }
  
  if (paise > 0) {
    if (result) result += ' and ';
    result += convertIndianNumber(paise) + ' Paise';
  }
  
  return result ? result + ' Only' : 'Zero Rupees Only';
};

// PDF Invoice Component
const PDFInvoice = ({ formData, invoiceNumber, total }) => {
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
        cgstRate: parseFloat(formData.cgstRate) || 0, 
        sgstRate: parseFloat(formData.sgstRate) || 0, 
        cgstAmt: 0, 
        sgstAmt: 0 
      };
    }
    
    const cgstRate = parseFloat(formData.cgstRate) || 0;
    const sgstRate = parseFloat(formData.sgstRate) || 0;
    
    acc[hsn].taxable += taxable;
    acc[hsn].cgstAmt += (taxable * cgstRate) / 100;
    acc[hsn].sgstAmt += (taxable * sgstRate) / 100;

    return acc;
  }, {});

  const invoiceDate = formData.invoiceDate ? new Date(formData.invoiceDate) : new Date();

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header: Logo Left, Company Info Right */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoContainer}>
            <Image 
              style={pdfStyles.logo} 
              src="/logo.png" 
            />
            <Text style={pdfStyles.companyName}>E I O Digital Solutions Pvt Ltd</Text>
          </View>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyNameMain}>E I O Digital Solutions Private Limited</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.address || 'Address not provided'}</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.contact || 'Contact not provided'}</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.email || 'Email not provided'}</Text>
            <Text style={pdfStyles.companyDetails}>GSTIN: {formData.companyInfo?.gstin || 'GSTIN not provided'}</Text>
          </View>
        </View>

        <Text style={pdfStyles.title}>
          TAX INVOICE
        </Text>

        {/* Invoice Details Table */}
        <View style={[pdfStyles.table, {marginBottom: 10}]}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>Invoice No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>Date</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>PO No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>Mode of Delivery</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '20%'}]}>Mode Of Payment</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCol, {width: '20%'}]}>{invoiceNumber}</Text>
            <Text style={[pdfStyles.tableCol, {width: '20%'}]}>
              {invoiceDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
            <Text style={[pdfStyles.tableCol, {width: '20%'}]}>{formData.poNo || '-'}</Text>
            <Text style={[pdfStyles.tableCol, {width: '20%'}]}>{formData.modeOfTransport || '-'}</Text>
            <Text style={[pdfStyles.tableCol, {width: '20%'}]}>{formData.paymentMode || '-'}</Text>
          </View>
        </View>

        {/* Bill To Table */}
        <View style={[pdfStyles.table, {marginBottom: 10}]}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableColHeader, {width: '100%'}]}>Bill To:</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, {width: '100%', padding: 6}]}>
              <Text style={pdfStyles.customerText}>{formData.billTo || 'Not provided'}</Text>
              <Text style={pdfStyles.gstinText}>GSTIN: {formData.billToGSTIN || 'N/A'}</Text>
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
                <Text style={[pdfStyles.tableCol, {width: '32%', textAlign: 'left', paddingLeft: 6}]}>
                  {item.item || 'No description'}
                </Text>
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
            <View style={[pdfStyles.totalRow, {borderTopWidth: 1, borderTopColor: '#333', paddingTop: 4, marginTop: 4}]}>
              <Text style={pdfStyles.grandTotalLabel}>Grand Total:</Text>
              <Text style={pdfStyles.grandTotalValue}>₹{total.toFixed(2)}</Text>
            </View>
            <Text style={pdfStyles.inWords}>
              Amount in Words: {numberToWords(total)}
            </Text>
          </View>

          {/* Right: Authorized Signatory with Image */}
          <View style={pdfStyles.signatureContainer}>
            <Text style={{ marginBottom: 35, fontSize: 9 }}>
              For E I O Digital Solutions Pvt Ltd
            </Text>
            <View style={pdfStyles.signatureBox}>
              <Image 
                style={pdfStyles.signatureImage} 
                src="/bills.png" 
              />
            </View>
            <Text style={pdfStyles.signatureText}>Authorized Signatory</Text>
            <Text style={pdfStyles.signatureSubText}>(Company Seal & Signature)</Text>
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
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>CGST %</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>CGST Amount</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>SGST %</Text>
                <Text style={[pdfStyles.tableColHeader, {width: '15%'}]}>SGST Amount</Text>
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
            <View style={pdfStyles.bankDetails}>
              <Text style={pdfStyles.bankDetailLine}>Account No: 922020051134911</Text>
              <Text style={pdfStyles.bankDetailLine}>IFSC Code: UTIB0000258</Text>
              <Text style={pdfStyles.bankDetailLine}>Branch: Tirunelveli</Text>
              <Text style={pdfStyles.bankDetailLine}>Bank: Axis Bank</Text>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={pdfStyles.termsSection}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 10 }}>Terms & Conditions</Text>
            <View style={pdfStyles.termsList}>
              <Text style={pdfStyles.termItem}>1. Services as per manufacturer's warranty terms only</Text>
              <Text style={pdfStyles.termItem}>2. Maintenance chargeable for misuse only</Text>
              <Text style={pdfStyles.termItem}>3. Disputes subject to Tirunelveli jurisdiction</Text>
              <Text style={pdfStyles.termItem}>4. Payment due within 15 days from invoice date</Text>
              <Text style={pdfStyles.termItem}>5. Goods once sold will not be taken back</Text>
              <Text style={pdfStyles.termItem}>6. Interest @ 18% p.a. on overdue payments</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [companySettings, setCompanySettings] = useState({});

  const initialForm = {
    companyInfo: { 
      address: '', 
      contact: '', 
      logo: '', 
      gstin: '', 
      bankDetails: '',
      email: ''
    },
    billTo: '', 
    billToGSTIN: '',
    shipTo: '', 
    shipToGSTIN: '',
    poNo: '',
    modeOfTransport: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    items: [{ item: '', itemCode: '', qty: 1, price: 0, disc: 0, amount: 0 }],
    paymentMode: 'Cash',
    taxable: 0,
    cgstRate: 0,
    sgstRate: 0,
    cgst: 0, 
    sgst: 0, 
    roundOff: 0,
    totalAmount: 0
  };

  const [formData, setFormData] = useState(initialForm);

  // Transport options
  const transportOptions = ['Air', 'Ship', 'Roadways', 'Railways', 'Email'];

  // Fetch invoices and settings
  useEffect(() => {
    fetchInvoices();
    fetchSettings();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/invoices');
      const sorted = res.data.sort((a, b) => new Date(b.invoiceDate || b.createdAt) - new Date(a.invoiceDate || a.createdAt));
      setInvoices(sorted);
    } catch (err) {
      showAlert('error', 'Failed to load invoices');
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

  const generateInvoiceNumber = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/invoices');
      const count = res.data.length;
      const num = `INV-${String(count + 1).padStart(4, '0')}`;
      setInvoiceNumber(num);
      return num;
    } catch (err) {
      showAlert('error', 'Failed to generate invoice number');
      const fallbackNum = `INV-${String(invoices.length + 1).padStart(4, '0')}`;
      setInvoiceNumber(fallbackNum);
      return fallbackNum;
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

    const updatedFormData = { ...formData, items };
    setFormData(updatedFormData);
    recalculateTotals(items);
  };

  const recalculateTotals = (items) => {
    // Calculate taxable amount (sum of item amounts after discount)
    const taxable = items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      const disc = parseFloat(item.disc) || 0;
      const subtotal = qty * price;
      const discount = subtotal * (disc / 100);
      return sum + (subtotal - discount);
    }, 0);

    // Calculate GST amounts based on individual rates
    const cgstRate = parseFloat(formData.cgstRate) || 0;
    const sgstRate = parseFloat(formData.sgstRate) || 0;
    const cgstAmt = taxable * (cgstRate / 100);
    const sgstAmt = taxable * (sgstRate / 100);

    // Calculate total before round off
    const totalBeforeRoundOff = taxable + cgstAmt + sgstAmt;
    
    // Calculate automatic round off
    const roundOff = calculateRoundOff(totalBeforeRoundOff);

    // Final total after round off
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

  // Handle CGST rate change
  const handleCgstRateChange = (value) => {
    const cgstRate = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, cgstRate }));
    setTimeout(() => recalculateTotals(formData.items), 0);
  };

  // Handle SGST rate change
  const handleSgstRateChange = (value) => {
    const sgstRate = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, sgstRate }));
    setTimeout(() => recalculateTotals(formData.items), 0);
  };

  const addItem = () => {
    const newItem = { item: '', itemCode: '', qty: 1, price: 0, disc: 0, amount: 0 };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items }));
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

    let invNum = invoiceNumber;
    if (!editingId && !invNum) {
      invNum = await generateInvoiceNumber();
    }

    const payload = {
      ...formData,
      totalAmount: total,
      invoiceNumber: invNum,
      invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : new Date().toISOString()
    };

    try {
      if (editingId) {
        await axios.put(`https://billing-ki8l.onrender.com/api/invoices/${editingId}`, payload);
        showAlert('success', 'Invoice updated successfully!');
      } else {
        await axios.post('https://billing-ki8l.onrender.com/api/invoices', payload);
        showAlert('success', 'Invoice created successfully!');
      }
      resetForm();
      fetchInvoices();
    } catch (err) {
      console.error(err);
      showAlert('error', editingId ? 'Failed to update invoice' : 'Failed to create invoice');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setInvoiceNumber('');
    setFormData(initialForm);
  };

  const openEdit = (invoice) => {
    setFormData({
      ...initialForm,
      ...invoice,
      companyInfo: invoice.companyInfo || initialForm.companyInfo,
      invoiceDate: invoice.invoiceDate ? 
        new Date(invoice.invoiceDate).toISOString().split('T')[0] : 
        initialForm.invoiceDate,
      items: (invoice.items || initialForm.items).map(i => ({
        ...i,
        qty: parseFloat(i.qty) || 0,
        price: parseFloat(i.price) || 0,
        disc: parseFloat(i.disc) || 0,
        amount: parseFloat(i.amount) || 0
      })),
      taxable: parseFloat(invoice.taxable) || 0,
      cgstRate: parseFloat(invoice.cgstRate) || 0,
      sgstRate: parseFloat(invoice.sgstRate) || 0,
      cgst: parseFloat(invoice.cgst) || 0,
      sgst: parseFloat(invoice.sgst) || 0,
      roundOff: parseFloat(invoice.roundOff) || 0
    });
    setLogoPreview(invoice.companyInfo?.logo || '/logo.png');
    setInvoiceNumber(invoice.invoiceNumber || '');
    setEditingId(invoice._id);
    setShowForm(true);
  };

  const deleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`https://billing-ki8l.onrender.com/api/invoices/${id}`);
        showAlert('success', 'Invoice deleted successfully!');
        fetchInvoices();
      } catch (err) {
        showAlert('error', 'Failed to delete invoice');
      }
    }
  };

  const downloadExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(formData.items.map((item, index) => ({
        'Sr No': index + 1,
        'Description': item.item,
        'HSN/SAC': item.itemCode,
        'Qty': item.qty,
        'Rate': item.price,
        'Disc %': item.disc,
        'Amount': item.amount
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
      XLSX.writeFile(wb, `Invoice_${invoiceNumber || 'Draft'}.xlsx`);
      showAlert('success', 'Excel file downloaded successfully!');
    } catch (err) {
      console.error('Excel download error:', err);
      showAlert('error', 'Failed to download Excel file');
    }
  };

  // Auto-fill company info when creating new invoice
  useEffect(() => {
    if (showForm && !editingId && Object.keys(companySettings).length > 0) {
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          address: companySettings.address || '',
          contact: companySettings.contact || '',
          logo: companySettings.logo || '/logo.png',
          gstin: companySettings.gstin || '',
          bankDetails: companySettings.bankDetails || '',
          email: companySettings.email || ''
        }
      }));
      setLogoPreview(companySettings.logo || '/logo.png');
    }
  }, [showForm, editingId, companySettings]);

  // Initialize invoice number when showing form
  useEffect(() => {
    if (showForm && !editingId && !invoiceNumber) {
      generateInvoiceNumber();
    }
  }, [showForm, editingId]);

  const total = calculateTotal();

  return (
    <div className="invoices-container">
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="header-bar">
        <h2>Invoices</h2>
        <button 
          className="btn-primary" 
          onClick={() => { 
            setShowForm(true); 
            if (!editingId) {
              generateInvoiceNumber();
            }
          }}
        >
          Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{editingId ? 'Edit Invoice' : 'Create Invoice'}</h4>
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
              <p style={{ fontSize: '0.8rem', color: '#666' }}>E I O Logo Preview</p>
            </div>

            <form className="invoice-form" onSubmit={handleSubmit}>
              {/* Invoice Details */}
              <div className="section">
                <h5>Invoice Details</h5>
                <div className="invoice-details-grid">
                  <div>
                    <label>Invoice Number</label>
                    <input 
                      type="text" 
                      value={invoiceNumber} 
                      readOnly 
                      className="readonly" 
                    />
                  </div>
                  <div>
                    <label>Invoice Date</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>PO No</label>
                    <input
                      type="text"
                      value={formData.poNo}
                      onChange={e => setFormData({ ...formData, poNo: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label>Mode of Delivery</label>
                    <select
                      value={formData.modeOfTransport}
                      onChange={e => setFormData({ ...formData, modeOfTransport: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem', border: '1.5px solid #ced4da', borderRadius: '8px', fontSize: '0.95rem' }}
                    >
                      <option value="">Select Transport</option>
                      {transportOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="section">
                <h5>Bill To</h5>
                <div className="bill-ship">
                  <div>
                    <label>Customer Name and Address</label>
                    <textarea
                      placeholder="Enter customer name and address"
                      required
                      value={formData.billTo}
                      onChange={e => setFormData({ ...formData, billTo: e.target.value })}
                      rows="3"
                    />
                    <label>GSTIN</label>
                    <input
                      type="text"
                      placeholder="Bill To GSTIN"
                      value={formData.billToGSTIN}
                      onChange={e => setFormData({ ...formData, billToGSTIN: e.target.value })}
                    />
                  </div>
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
                      <div className="table-header-cell">Action</div>
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
                            placeholder="Item description"
                            required
                          />
                        </div>
                        
                        {/* HSN/SAC */}
                        <div className="table-cell" data-label="HSN/SAC">
                          <input 
                            type="text" 
                            className="item-input"
                            value={item.itemCode} 
                            onChange={e => handleItemChange(i, 'itemCode', e.target.value)} 
                            placeholder="HSN Code" 
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
                            step="0.01"
                            required
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
                            min="0"
                            required
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
                            step="0.01"
                          />
                        </div>
                        
                        {/* Amount */}
                        <div className="table-cell amount-cell" data-label="Amount">
                          ₹{parseFloat(item.amount || 0).toFixed(2)}
                        </div>
                        
                        {/* Delete Button */}
                        <div className="table-cell">
                          {formData.items.length > 1 && (
                            <button 
                              type="button" 
                              className="btn-delete" 
                              onClick={() => removeItem(i)}
                              aria-label="Delete item"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button type="button" className="btn-add-item" onClick={addItem}>
                    <span>+</span> Add Item
                  </button>
                </div>
              </div>

              <div className="section tax-total-section">
                <h5>Tax & Total</h5>
                <div className="tax-grid">
                  <div className="form-group">
                    <label>Taxable Amount</label>
                    <input 
                      type="text" 
                      value={`₹${formData.taxable.toFixed(2)}`} 
                      readOnly 
                      className="readonly" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CGST %</label>
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
                      type="text" 
                      value={`₹${formData.cgst.toFixed(2)}`} 
                      readOnly 
                      className="readonly"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>SGST %</label>
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
                      type="text" 
                      value={`₹${formData.sgst.toFixed(2)}`} 
                      readOnly 
                      className="readonly"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Round Off</label>
                    <input 
                      type="text" 
                      value={`₹${parseFloat(formData.roundOff || 0).toFixed(2)}`} 
                      readOnly 
                      className="readonly"
                    />
                  </div>
                  
                  <div className="form-group grand-total">
                    <label>Grand Total</label>
                    <input 
                      type="text" 
                      value={`₹${total.toFixed(2)}`} 
                      readOnly 
                      className="readonly grand-total-input"
                    />
                  </div>
                </div>
                
                <div className="final-total">
                  <p className="in-words">Amount in Words: {numberToWords(total)}</p>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="section payment-mode">
                <label>Payment Mode:</label>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="pay" 
                      value="Cash" 
                      checked={formData.paymentMode === 'Cash'} 
                      onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} 
                    /> 
                    Cash
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="pay" 
                      value="Online" 
                      checked={formData.paymentMode === 'Online'} 
                      onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} 
                    /> 
                    Online
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="pay" 
                      value="Cheque/DD" 
                      checked={formData.paymentMode === 'Cheque/DD'} 
                      onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} 
                    /> 
                    Cheque/DD
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <PDFDownloadLink 
                  document={<PDFInvoice 
                    formData={formData} 
                    invoiceNumber={invoiceNumber} 
                    total={total}
                  />} 
                  fileName={`Invoice_${invoiceNumber || 'Draft'}.pdf`}
                  className="pdf-link"
                >
                  {({ loading, blob, url, error }) => (
                    <button 
                      type="button" 
                      className="btn-pdf" 
                      disabled={loading || !formData.billTo || formData.items.length === 0}
                    >
                      {loading ? 'Generating...' : 'Download PDF'}
                    </button>
                  )}
                </PDFDownloadLink>
                <button 
                  type="button" 
                  className="btn-excel" 
                  onClick={downloadExcel}
                  disabled={formData.items.length === 0}
                >
                  Export Excel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={!formData.billTo || formData.items.length === 0}
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="invoices-list">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices yet. Create your first invoice!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber || 'N/A'}</td>
                  <td>
                    {inv.invoiceDate ? 
                      new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 
                      new Date(inv.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="customer-cell">
                    <div>{inv.billTo?.split('\n')[0] || 'No customer'}</div>
                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                      {inv.billToGSTIN ? `GSTIN: ${inv.billToGSTIN}` : ''}
                    </small>
                  </td>
                  <td><strong>₹{(inv.totalAmount || 0).toFixed(2)}</strong></td>
                  <td className="actions">
                    <button 
                      className="btn-sm btn-info" 
                      onClick={() => openEdit(inv)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-sm btn-danger" 
                      onClick={() => deleteInvoice(inv._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Invoices;