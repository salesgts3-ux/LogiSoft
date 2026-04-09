import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BookingPage = () => {
    // Masters Data
    const [customers, setCustomers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    
    // Booking State
    const [bookings, setBookings] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [currentLR, setCurrentLR] = useState({});
    const [lrList, setLrList] = useState([]); 

    // POD Modal State
    const [podModal, setPodModal] = useState({ show: false, booking: null, file: null, name: '' });

    useEffect(() => {
        loadMasters();
    }, []);

    const loadMasters = () => {
        setCustomers(DataStore.getCustomers() || []);
        setRoutes(DataStore.getRoutes() || []);
        setVehicles(DataStore.getVehicles() || []);
        setDrivers(DataStore.getDrivers() || []);
        setBookings(DataStore.getBookings() || []);
    };

    // Route Selection Logic
    const onRouteChange = (routeId) => {
        const route = routes.find(r => String(r.id) === String(routeId));
        if (route) {
            setCurrentLR({
                ...currentLR,
                routeId: route.id,
                from: route.from,
                to: route.to,
                freight: route.distance * route.perKmRate
            });
        }
    };

    // Add LR to Group List
    const addToGroup = () => {
        if(!currentLR.from || !currentLR.to) return alert("Please select route or fill details.");
        setLrList([...lrList, { ...currentLR, lrId: 'LR-' + Math.floor(Math.random() * 1000) }]);
        setCurrentLR({}); 
        alert('Added to Group List.');
    };

    // Generate GR
    const generateGR = () => {
        if (!selectedCustomer || lrList.length === 0) return alert('Select Customer and Add LR items');

        const grNo = 'GR-' + new Date().getFullYear() + '-' + (bookings.length + 1);
        
        lrList.forEach(lr => {
            const booking = {
                ...lr, // Uses data from the list item (fixes N/A issue)
                grNo: grNo,
                customer: selectedCustomer,
                status: 'Booked',
                createdAt: new Date().toLocaleString()
            };
            DataStore.saveBooking(booking);
        });

        loadMasters(); 
        setLrList([]);
        setSelectedCustomer(null);
        setCurrentLR({});
        alert(`Group Receipt Generated: ${grNo}`);
    };

    // Trip Status Update
    const updateStatus = (id, status) => {
        const booking = bookings.find(b => b.id === id);
        let updateData = { ...booking, status: status };
        
        if(status === 'In Transit') {
            updateData.tripStartTime = new Date().toISOString();
        }
        
        DataStore.updateBooking(updateData);
        loadMasters();
    };

    // POD Logic
    const openPodModal = (booking) => setPodModal({ show: true, booking, file: null, name: '' });

    const handlePodUpload = async (e) => {
        const file = e.target.files[0];
        if(file) {
            const base64 = await DataStore.toBase64(file);
            setPodModal({ ...podModal, file: base64 });
        }
    };

    const savePod = () => {
        if(!podModal.file || !podModal.name) return alert("Enter receiver name and upload proof");
        const booking = podModal.booking;
        
        let journeyTime = "N/A";
        if(booking.tripStartTime) {
            const endTime = new Date();
            const startTime = new Date(booking.tripStartTime);
            const diffMs = (endTime - startTime);
            const diffDays = Math.floor(diffMs / 86400000);
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            journeyTime = `${diffDays}d ${diffHrs}h ${diffMins}m`;
        }

        DataStore.updateBooking({ 
            ...booking, 
            podData: podModal.file, 
            podReceiver: podModal.name, 
            podDate: new Date().toLocaleString(), 
            journeyTime: journeyTime,
            status: 'POD Received' 
        });
        loadMasters();
        setPodModal({ show: false, booking: null, file: null, name: '' });
        alert('POD Saved');
    };

    // Generate Invoice
    const generateInvoice = (booking) => {
        const session = DataStore.getSession();
        const invNo = 'INV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000);
        const invoice = {
            id: Date.now(), // CRITICAL FIX: Unique ID must be generated
            invoiceNo: invNo,
            bookingId: booking.id,
            customer: booking.customer,
            amount: booking.freight,
            status: 'Unpaid',
            date: new Date().toLocaleDateString(),
            companyId: session ? session.companyId : null
        };
        DataStore.saveInvoice(invoice);
        alert(`Invoice Generated: ${invNo}`);
    };

    // Generate LR PDF
    const generateLRPdf = (b) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text("LORRY RECEIPT (LR)", pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`LR No: ${b.grNo}`, 14, 35);
        doc.text(`Date: ${b.createdAt}`, pageWidth - 14, 35, { align: 'right' });

        // Consignor / Consignee Box
        doc.rect(14, 45, pageWidth - 28, 40); 
        doc.line(pageWidth / 2, 45, pageWidth / 2, 85); 
        
        doc.setFont('helvetica', 'bold');
        doc.text("Consignor (From)", 18, 53);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${b.consignorName || 'N/A'}`, 18, 60);
        doc.text(`Contact: ${b.consignorPhone || 'N/A'}`, 18, 66);
        doc.text(`Address: ${b.consignorAddr || 'N/A'}`, 18, 72);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Consignee (To)", pageWidth / 2 + 4, 53);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${b.consigneeName || 'N/A'}`, pageWidth / 2 + 4, 60);
        doc.text(`Contact: ${b.consigneePhone || 'N/A'}`, pageWidth / 2 + 4, 66);
        doc.text(`Address: ${b.consigneeAddr || 'N/A'}`, pageWidth / 2 + 4, 72);

        // Find Vehicle and Driver
        const vehicle = vehicles.find(v => String(v.id) === String(b.vehicle));
        const driver = drivers.find(d => String(d.id) === String(b.driver));

        autoTable(doc, {
            startY: 95,
            head: [['Trip Details', 'Vehicle Details', 'Financials']],
            body: [
                [
                    `From: ${b.from}\nTo: ${b.to}`,
                    `Vehicle: ${vehicle?.regNo || vehicle?.vehicleNo || 'N/A'}\nDriver: ${driver?.name || 'N/A'}`,
                    `Freight: ₹${b.freight || 0}\nAdvance: ₹${b.advance || 0}`
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80] },
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60 }, 2: { cellWidth: 60 } }
        });

        // Charges Table
        let finalY = doc.lastAutoTable.finalY || 100;
        
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Particulars', 'Amount (₹)']],
            body: [
                ['Freight', b.freight || 0],
                ['Loading Charges', b.loadingCharges || 0],
                ['Unloading Charges', b.unloadingCharges || 0],
                ['Toll', b.toll || 0],
                ['Other Expenses', b.otherExpenses || 0],
                ['Total', (parseFloat(b.freight)||0) + (parseFloat(b.loadingCharges)||0) + (parseFloat(b.unloadingCharges)||0) + (parseFloat(b.toll)||0) + (parseFloat(b.otherExpenses)||0)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 10 }
        });

        // Footer Terms
        finalY = doc.lastAutoTable.finalY || 150;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text("Terms & Conditions:", 14, finalY + 15);
        doc.setFont('helvetica', 'normal');
        doc.text("1. Goods once booked will not be returned.", 14, finalY + 20);
        doc.text("2. We are not responsible for natural calamities during transit.", 14, finalY + 25);

        // Signature Area
        doc.setFontSize(10);
        doc.text("For Vicky Transport", pageWidth - 50, finalY + 40, { align: 'center' });
        doc.text("Authorized Signatory", pageWidth - 50, finalY + 60, { align: 'center' });

        window.open(doc.output('bloburl'), '_blank');
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Booking & LR Generation</h2>

            <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                {/* Step 1: Customer */}
                <div style={{ marginBottom: 20, padding: 10, border: '1px solid #eee', borderRadius: 4 }}>
                    <h4>1. Select Customer (Billing Party)</h4>
                    <select onChange={(e) => setSelectedCustomer(customers.find(c => c.id == e.target.value))} style={inputStyle}>
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Step 2: Consignor/Consignee */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                        <h4>Consignor Details</h4>
                        <input placeholder="Name" onChange={e => setCurrentLR({...currentLR, consignorName: e.target.value})} style={inputStyle} />
                        <input placeholder="Contact Number" onChange={e => setCurrentLR({...currentLR, consignorPhone: e.target.value})} style={inputStyle} />
                        <input placeholder="Address" onChange={e => setCurrentLR({...currentLR, consignorAddr: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                        <h4>Consignee Details</h4>
                        <input placeholder="Name" onChange={e => setCurrentLR({...currentLR, consigneeName: e.target.value})} style={inputStyle} />
                        <input placeholder="Contact Number" onChange={e => setCurrentLR({...currentLR, consigneePhone: e.target.value})} style={inputStyle} />
                        <input placeholder="Address" onChange={e => setCurrentLR({...currentLR, consigneeAddr: e.target.value})} style={inputStyle} />
                    </div>
                </div>

                {/* Step 3: Route & Vehicle */}
                <div style={{ marginBottom: 20 }}>
                    <h4>Route & Vehicle</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 10 }}>
                        <select onChange={(e) => onRouteChange(e.target.value)} style={inputStyle}>
                            <option value="">Select Route</option>
                            {routes.map(r => <option key={r.id} value={r.id}>{r.from} - {r.to}</option>)}
                        </select>
                        <button style={{...btnStyle, background: '#95a5a6'}}>+ Add Route</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                        <input placeholder="From" value={currentLR.from || ''} onChange={e => setCurrentLR({...currentLR, from: e.target.value})} style={inputStyle} />
                        <input placeholder="To" value={currentLR.to || ''} onChange={e => setCurrentLR({...currentLR, to: e.target.value})} style={inputStyle} />
                        <select onChange={e => setCurrentLR({...currentLR, vehicle: e.target.value})} style={inputStyle}>
                            <option value="">Vehicle</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo || v.vehicleNo}</option>)}
                        </select>
                        <select onChange={e => setCurrentLR({...currentLR, driver: e.target.value})} style={inputStyle}>
                            <option value="">Driver</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Step 4: Financials */}
                <h4>Charges & Expenses</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <input placeholder="Freight" value={currentLR.freight || ''} type="number" onChange={e => setCurrentLR({...currentLR, freight: e.target.value})} style={inputStyle} />
                    <input placeholder="Loading Charges" type="number" onChange={e => setCurrentLR({...currentLR, loadingCharges: e.target.value})} style={inputStyle} />
                    <input placeholder="Unloading Charges" type="number" onChange={e => setCurrentLR({...currentLR, unloadingCharges: e.target.value})} style={inputStyle} />
                    <input placeholder="Toll" type="number" onChange={e => setCurrentLR({...currentLR, toll: e.target.value})} style={inputStyle} />
                    <input placeholder="Other Expenses" type="number" onChange={e => setCurrentLR({...currentLR, otherExpenses: e.target.value})} style={inputStyle} />
                    <input placeholder="Advance" type="number" onChange={e => setCurrentLR({...currentLR, advance: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                    <button onClick={addToGroup} style={{...btnStyle, background: '#3498db'}}>Add LR to Group</button>
                    <button onClick={generateGR} style={{...btnStyle, background: '#27ae60'}}>Generate GR ({lrList.length} LRs)</button>
                </div>
            </div>

            {/* Active Trips Table */}
            <h3>Active Trips & Invoicing</h3>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={thStyle}>GR No</th>
                            <th style={thStyle}>Customer</th>
                            <th style={thStyle}>Route</th>
                            <th style={thStyle}>Journey Time</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: 20}}>No Bookings found.</td></tr>}
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td style={tdStyle}>{b.grNo}</td>
                                <td style={tdStyle}>{b.customer?.name}</td>
                                <td style={tdStyle}>{b.from} - {b.to}</td>
                                <td style={tdStyle}><span style={{color: '#1abc9c', fontWeight: 'bold'}}>{b.journeyTime || '-'}</span></td>
                                <td style={tdStyle}><span style={statusStyle(b.status)}>{b.status}</span></td>
                                <td style={tdStyle}>
                                    {b.status === 'Booked' && <button onClick={() => updateStatus(b.id, 'In Transit')} style={sBtnBlue}>Start</button>}
                                    {b.status === 'In Transit' && <button onClick={() => updateStatus(b.id, 'Delivered')} style={sBtnRed}>End Trip</button>}
                                    {b.status === 'Delivered' && <button onClick={() => openPodModal(b)} style={sBtnPurple}>POD</button>}
                                    {b.status === 'POD Received' && <button onClick={() => generateInvoice(b)} style={sBtnGreen}>Invoice</button>}
                                    <button onClick={() => generateLRPdf(b)} style={sBtnGrey}>Print LR</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* POD Modal */}
            {podModal.show && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <h3>Upload Proof of Delivery (POD)</h3>
                        <input placeholder="Receiver Name" value={podModal.name} onChange={(e) => setPodModal({...podModal, name: e.target.value})} style={inputStyle} />
                        <label style={{display: 'block', margin: '10px 0'}}>
                            Upload Signed Copy / Photo:
                            <input type="file" accept="image/*,.pdf" onChange={handlePodUpload} style={{display: 'block', marginTop: 5}} />
                        </label>
                        {podModal.file && <div style={{color: 'green', fontSize: 12}}>File loaded ✓</div>}
                        
                        <div style={{display: 'flex', gap: 10, marginTop: 20}}>
                            <button onClick={savePod} style={btnStyle}>Save POD</button>
                            <button onClick={() => setPodModal({show: false})} style={{...btnStyle, background: '#ccc'}}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const inputStyle = { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, margin: '5px 0', boxSizing: 'border-box' };
const btnStyle = { padding: '10px 20px', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const thStyle = { textAlign: 'left', padding: 10 };
const tdStyle = { padding: 10, borderBottom: '1px solid #eee' };
const sBtnBlue = { padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const sBtnRed = { padding: '5px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const sBtnGreen = { padding: '5px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const sBtnPurple = { padding: '5px 10px', background: '#9b59b6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const sBtnGrey = { padding: '5px 10px', background: '#7f8c8d', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 2 };
const statusStyle = (status) => ({ padding: 5, borderRadius: 4, background: status === 'Delivered' ? '#e8f8f5' : status === 'POD Received' ? '#e3f2fd' : '#fff3cd', color: status === 'Delivered' ? 'green' : '#856404', fontSize: 12 });
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: 30, borderRadius: 8, width: 400 };

export default BookingPage;