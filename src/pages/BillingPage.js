import React, { useState, useEffect, useRef } from 'react';
import DataStore from '../utils/DataStore';

const BillingPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInv, setSelectedInv] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [settings, setSettings] = useState({});
    const [logo, setLogo] = useState('');
    
    // Filter State
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Paid', 'Unpaid'
    const [searchTerm, setSearchTerm] = useState('');

    const printRef = useRef();
    const session = DataStore.getSession();

    useEffect(() => {
        loadInvoices();
        if(session && session.companyId){
            const s = DataStore.getSettings(session.companyId);
            if(s) setSettings(s);
        }
        const l = DataStore.getLogo();
        if(l) setLogo(l);
    }, []);

    const loadInvoices = () => {
        const cid = session ? session.companyId : null;
        setInvoices(DataStore.getInvoices(cid));
    };
    
    const togglePaidStatus = (inv) => {
        const newStatus = inv.status === 'Paid' ? 'Unpaid' : 'Paid';
        DataStore.updateInvoice({ ...inv, status: newStatus });
        loadInvoices();
    };

    // Filtering Logic
    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        const matchesSearch = (inv.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (inv.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleUpdate = () => {
        DataStore.updateInvoice({ ...selectedInv, ...form });
        setEditMode(false);
        loadInvoices();
        alert('Invoice Updated');
    };

    const handleDelete = (id) => {
        const reason = prompt('Reason for deletion:');
        if (reason) {
            DataStore.deleteInvoice(id, reason);
            loadInvoices();
        }
    };

    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Billing & Invoices</h2>
            
            <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                {/* Filter Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {/* Filter Buttons */}
                        {['All', 'Unpaid', 'Paid'].map(status => (
                            <button 
                                key={status} 
                                onClick={() => setStatusFilter(status)}
                                style={{ 
                                    padding: '8px 20px', 
                                    border: 'none', 
                                    borderRadius: 20, 
                                    cursor: 'pointer',
                                    background: statusFilter === status ? '#1abc9c' : '#ecf0f1',
                                    color: statusFilter === status ? '#fff' : '#7f8c8d',
                                    fontWeight: 'bold'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        style={{ padding: 8, width: 200, border: '1px solid #ddd', borderRadius: 4 }} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={th}>Sr. No</th>
                            <th style={th}>Date</th>
                            <th style={th}>Invoice #</th>
                            <th style={th}>Customer</th>
                            <th style={th}>Amount</th>
                            <th style={th}>Status</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 && (
                            <tr><td colSpan="7" style={{textAlign: 'center', padding: 20, color: '#aaa'}}>No invoices found.</td></tr>
                        )}
                        {filteredInvoices.map((inv, idx) => (
                            <tr key={inv.id}>
                                <td style={td}>{idx + 1}</td>
                                <td style={td}>{inv.date}</td>
                                <td style={td}>{inv.invoiceNo}</td>
                                <td style={td}>{inv.customer?.name || 'N/A'}</td>
                                <td style={td}>₹ {inv.amount}</td>
                                <td style={td}>
                                    <span 
                                        onClick={() => togglePaidStatus(inv)} 
                                        style={{ cursor: 'pointer', ... (inv.status === 'Paid' ? badgeGreen : badgeOrange) }}
                                        title="Click to toggle status"
                                    >
                                        {inv.status}
                                    </span>
                                </td>
                                <td style={td}>
                                    <button onClick={() => { setSelectedInv(inv); setShowModal(true); setEditMode(false); }} style={sBtnBlue}>View/Print</button>
                                    <button onClick={() => handleDelete(inv.id)} style={sBtnRed}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && selectedInv && (
                <div style={modalOverlay}>
                    <div style={{...modalContent, width: 900}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <h3>{editMode ? 'Edit Invoice' : 'Invoice Preview'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>X</button>
                        </div>

                        <div ref={printRef} style={{ background: '#fff', padding: 30, border: '1px solid #eee', fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 20 }}>
                                <div style={{ maxWidth: '50%' }}>
                                    {logo && <img src={logo} style={{ height: 60, marginBottom: 10 }} alt="Logo" />}
                                    <h1 style={{ margin: 0, fontSize: 24, color: '#2c3e50' }}>{settings.businessName || 'LogiSoft'}</h1>
                                    <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
                                        {settings.address || 'Address'}<br/>
                                        GSTIN: {settings.gst || 'N/A'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ margin: 0, color: '#e74c3c' }}>TAX INVOICE</h2>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedInv.invoiceNo}</p>
                                    <p style={{ margin: 0 }}>Date: {selectedInv.date}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: 20, background: '#f9f9f9', padding: 10 }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Bill To:</h4>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: 14 }}>{selectedInv.customer?.name}</p>
                                <p style={{ margin: 0, fontSize: 12 }}>{selectedInv.customer?.address}</p>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                                <thead>
                                    <tr style={{ background: '#2c3e50', color: '#fff' }}>
                                        <th style={{border: '1px solid #ddd', padding: 10, textAlign: 'left'}}>Description</th>
                                        {settings.invoiceFields?.showHsn && <th style={{border: '1px solid #ddd', padding: 10}}>HSN</th>}
                                        <th style={{border: '1px solid #ddd', padding: 10, width: 100}}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{border: '1px solid #ddd', padding: 10, fontSize: 13}}>
                                            <strong>Transportation Services</strong>
                                        </td>
                                        {settings.invoiceFields?.showHsn && <td style={{border: '1px solid #ddd', padding: 10, textAlign: 'center'}}>996511</td>}
                                        <td style={{border: '1px solid #ddd', padding: 10, textAlign: 'right'}}>
                                            {editMode ? <input type="number" defaultValue={selectedInv.amount} onChange={(e) => setForm({...form, amount: e.target.value})} style={{width: 80}}/> : `₹ ${selectedInv.amount}`}
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#f4f4f4' }}>
                                        <td colSpan={settings.invoiceFields?.showHsn ? 2 : 1} style={{border: '1px solid #ddd', padding: 10, textAlign: 'right', fontWeight: 'bold'}}>Total</td>
                                        <td style={{border: '1px solid #ddd', padding: 10, textAlign: 'right', fontWeight: 'bold', fontSize: 14}}>
                                            ₹ {selectedInv.amount}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
                                {settings.invoiceFields?.showBank && (
                                    <div style={{ fontSize: 12 }}>
                                        <strong>Bank Details:</strong><br/>
                                        Bank Name: {settings.bankName || 'State Bank'}<br/>
                                        A/C No: {settings.bankAc || '123456789'}<br/>
                                    </div>
                                )}
                                <div style={{ fontSize: 12, maxWidth: '50%' }}>
                                    {settings.invoiceFields?.showTerms && <p><strong>Terms:</strong> {settings.terms || 'Subject to jurisdiction.'}</p>}
                                </div>
                            </div>

                            <div style={{ marginTop: 50, display: 'flex', justifyContent: 'space-between' }}>
                                <div><strong>Receiver's Signature</strong></div>
                                <div style={{ textAlign: 'center' }}>
                                    {settings.invoiceFields?.showSignature && (
                                        <div>
                                            <div style={{ borderTop: '1px solid #000', width: 150, marginBottom: 5 }}></div>
                                            <span>Authorised Signatory</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                            {editMode ? (
                                <button onClick={handleUpdate} style={btnPrimary}>Save Changes</button>
                            ) : (
                                <>
                                    <button onClick={handlePrint} style={btnPrimary}>Print / Save PDF</button>
                                    <button onClick={() => setEditMode(true)} style={btnSecondary}>Edit</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #eee' };
const td = { padding: 10, borderBottom: '1px solid #eee' };
const sBtnBlue = { padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, marginRight: 5, cursor: 'pointer' };
const sBtnRed = { padding: '5px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const btnPrimary = { padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const btnSecondary = { padding: '10px 20px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: 30, borderRadius: 8, maxHeight: '90vh', overflowY: 'auto' };
const badgeGreen = { background: '#e8f8f5', color: 'green', padding: '5px 10px', borderRadius: 10, fontSize: 12 };
const badgeOrange = { background: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: 10, fontSize: 12 };

export default BillingPage;