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
  }
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
            <Text style={pdfStyles.companyName}>E I O Digital Solutions Pvt</Text>
          </View>
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyNameMain}>E I O Digital Solutions Private Limited</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.address}</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.contact}</Text>
            <Text style={pdfStyles.companyDetails}>{formData.companyInfo?.email}</Text>
            <Text style={pdfStyles.companyDetails}>GSTIN:  {formData.companyInfo?.gstin}</Text>
          </View>
        </View>

        <Text style={pdfStyles.title}>
          TAX INVOICE
        </Text>

        {/* Invoice Details Table */}
        <View style={[pdfStyles.table, {marginBottom: 10}]}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Invoice No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Date</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>PO No</Text>
            <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Mode of Transport</Text>
                       <Text style={[pdfStyles.tableColHeader, {width: '25%'}]}>Mode Of Payment</Text>

          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{invoiceNumber}</Text>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{new Date(formData.invoiceDate).toLocaleDateString('en-IN')}</Text>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{formData.poNo || '-'}</Text>
            <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{formData.modeOfTransport || '-'}</Text>
                <Text style={[pdfStyles.tableCol, {width: '25%'}]}>{formData.paymentMode || '-'}</Text>
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
    companyInfo: { address: '', contact: '', logo: '', gstin: '', bankDetails: '' },
    billTo: '', billToGSTIN: '',
    shipTo: '', shipToGSTIN: '',
    poNo: '',
    modeOfTransport: '',
    invoiceDate: new Date().toISOString().substr(0, 10),
    items: [{ item: '', itemCode: '', qty: 1, price: 0, disc: 0, amount: 0 }],
    paymentMode: 'Cash',
    taxable: 0,
    cgstRate: 0, // Default CGST rate
    sgstRate: 0, // Default SGST rate
    cgst: 0, 
    sgst: 0, 
    roundOff: 0
  };

  const [formData, setFormData] = useState(initialForm);

  // Transport options
  const transportOptions = ['Air', 'Ship', 'Roadways', 'Railways'];

  // Fetch invoices and settings
  useEffect(() => {
    fetchInvoices();
    fetchSettings();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('https://billing-ki8l.onrender.com/api/invoices');
      const sorted = res.data.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
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
      return 'INV-0001';
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
    recalculateTotals(formData.items);
  };

  // Handle SGST rate change
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
      companyInfo: invoice.companyInfo || { address: '', contact: '', logo: '', gstin: '', bankDetails: '' },
      billTo: invoice.billTo || '',
      billToGSTIN: invoice.billToGSTIN || '',
      shipTo: invoice.shipTo || '',
      shipToGSTIN: invoice.shipToGSTIN || '',
      poNo: invoice.poNo || '',
      modeOfTransport: invoice.modeOfTransport || '',
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().substr(0, 10) : new Date().toISOString().substr(0, 10),
      items: (invoice.items || []).map(i => ({
        item: i.item || '',
        itemCode: i.itemCode || '',
        qty: parseFloat(i.qty) || 0,
        price: parseFloat(i.price) || 0,
        disc: parseFloat(i.disc) || 0,
        amount: parseFloat(i.amount) || 0
      })),
      paymentMode: invoice.paymentMode || 'Cash',
      taxable: parseFloat(invoice.taxable) || 0,
      cgstRate: parseFloat(invoice.cgstRate) || 9,
      sgstRate: parseFloat(invoice.sgstRate) || 9,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
    XLSX.writeFile(wb, `Invoice_${invoiceNumber || 'INV-0000'}.xlsx`);
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
          bankDetails: companySettings.bankDetails || ''
        }
      }));
      setLogoPreview(companySettings.logo || '/logo.png');
    }
  }, [showForm, editingId, companySettings]);

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
        <button className="btn-primary" onClick={() => { setShowForm(true); if (!editingId) generateInvoiceNumber(); }}>
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
              <p style={{ fontSize: '0.8rem', color: '#666' }}>E I O Logo Preview </p>
            </div>

            <form className="invoice-form" onSubmit={handleSubmit}>
              {/* Invoice Details */}
              <div className="section">
                <h5>Invoice Details</h5>
                <div className="invoice-details-grid">
                  <div>
                    <label>Invoice Number</label>
                    <input type="text" value={invoiceNumber} readOnly className="readonly" />
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
                    />
                  </div>
                  <div>
                    <label>Mode of Transport</label>
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
              <div className="section">
                <h5>Items</h5>
                <div className="items-table">
                  <div className="table-header">
                    <span>Description</span><span>HSN/SAC</span><span>Qty</span><span>Rate</span><span>Disc %</span><span>Amount</span><span></span>
                  </div>
                  {formData.items.map((item, i) => (
                    <div key={i} className="table-row">
                      <input
                        type="text"
                        value={item.item}
                        onChange={e => handleItemChange(i, 'item', e.target.value)}
                        placeholder="e.g. APC Home UPS 1000VA"
                      />
                      <input type="text" value={item.itemCode} onChange={e => handleItemChange(i, 'itemCode', e.target.value)} placeholder="8504" />
                      <input type="number" value={item.qty} onChange={e => handleItemChange(i, 'qty', e.target.value)} min="1" />
                      <input type="number" value={item.price} onChange={e => handleItemChange(i, 'price', e.target.value)} step="0.01" />
                      <input type="number" value={item.disc} onChange={e => handleItemChange(i, 'disc', e.target.value)} min="0" max="100" />
                      <span className="amount">₹{parseFloat(item.amount || 0).toFixed(2)}</span>
                      <button type="button" className="btn-delete" onClick={() => removeItem(i)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-item" onClick={addItem}>+ Add Item</button>
                </div>
              </div>

              {/* Tax & Total */}
              <div className="section tax-total">
                <div className="tax-grid">
                  <label>Taxable Amount</label>
                  <input type="number" step="0.01" value={formData.taxable.toFixed(2)} readOnly className="readonly" />
                  
                  <label>CGST  %</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.cgstRate} 
                    onChange={e => handleCgstRateChange(e.target.value)}
                    min="0"
                    max="28"
                  />
                  
                  <label>CGST Amount</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.cgst.toFixed(2)} 
                    readOnly 
                    className="readonly"
                  />
                  
                  <label>SGST  %</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.sgstRate} 
                    onChange={e => handleSgstRateChange(e.target.value)}
                    min="0"
                    max="28"
                  />
                  
                  <label>SGST Amount</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.sgst.toFixed(2)} 
                    readOnly 
                    className="readonly"
                  />
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
                  <label><input type="radio" name="pay" value="COD" checked={formData.paymentMode === 'Cash'} 
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} /> Cash</label>
                  <label><input type="radio" name="pay" value="Online" checked={formData.paymentMode === 'Online'} 
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} /> Online</label>
                  <label><input type="radio" name="pay" value="Cheque/DD" checked={formData.paymentMode === 'Cheque/DD'} 
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })} /> Cheque/DD</label>
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

      {/* Invoices List */}
      <div className="invoices-list">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice </th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No invoices yet. Create one!</td></tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber || 'N/A'}</td>
                  <td>{new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString()}</td>
                  <td>{inv.billTo}</td>
                  <td><strong>₹{(inv.totalAmount || 0).toFixed(2)}</strong></td>
                  <td className="actions">
                    <button className="btn-sm btn-info" onClick={() => openEdit(inv)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => deleteInvoice(inv._id)}>Delete</button>
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
export default Invoices;