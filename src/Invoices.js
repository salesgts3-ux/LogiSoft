import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]); // NEW
  
  const [bookingForm, setBookingForm] = useState({ customerName: '', origin: '', destination: '', freightAmount: '' });
  const [vehicleForm, setVehicleForm] = useState({ vehicleNo: '', vehicleType: 'Truck', capacity: '' });
  const [driverForm, setDriverForm] = useState({ driverName: '', licenseNo: '', mobileNo: '' });
  const [customerForm, setCustomerForm] = useState({ customerName: '', gstNo: '', contactPerson: '', mobileNo: '' });
  
  const COMPANY_ID = "65a1b2c3d4e5f67890123456";

  // --- Fetch Data based on Tab ---
  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'vehicles') fetchVehicles();
    if (activeTab === 'drivers') fetchDrivers();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'invoices') fetchInvoices(); // NEW
  }, [activeTab]);

  const fetchBookings = async () => { try { const res = await axios.get(`http://localhost:5000/api/bookings/company/${COMPANY_ID}`); setBookings(res.data); } catch (e) { console.log(e); } };
  const fetchVehicles = async () => { try { const res = await axios.get(`http://localhost:5000/api/vehicles/company/${COMPANY_ID}`); setVehicles(res.data); } catch (e) { console.log(e); } };
  const fetchDrivers = async () => { try { const res = await axios.get(`http://localhost:5000/api/drivers/company/${COMPANY_ID}`); setDrivers(res.data); } catch (e) { console.log(e); } };
  const fetchCustomers = async () => { try { const res = await axios.get(`http://localhost:5000/api/customers/company/${COMPANY_ID}`); setCustomers(res.data); } catch (e) { console.log(e); } };
  const fetchInvoices = async () => { try { const res = await axios.get(`http://localhost:5000/api/invoices/company/${COMPANY_ID}`); setInvoices(res.data); } catch (e) { console.log(e); } };

  // --- Handlers ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try { await axios.post('http://localhost:5000/api/bookings/create', { ...bookingForm, companyId: COMPANY_ID }); alert("Booking Created!"); fetchBookings(); setBookingForm({ customerName: '', origin: '', destination: '', freightAmount: '' }); } catch (e) { alert("Error"); }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try { await axios.post('http://localhost:5000/api/vehicles/add', { ...vehicleForm, companyId: COMPANY_ID }); alert("Vehicle Added!"); fetchVehicles(); setVehicleForm({ vehicleNo: '', vehicleType: 'Truck', capacity: '' }); } catch (e) { alert("Error"); }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try { await axios.post('http://localhost:5000/api/drivers/add', { ...driverForm, companyId: COMPANY_ID }); alert("Driver Added!"); fetchDrivers(); setDriverForm({ driverName: '', licenseNo: '', mobileNo: '' }); } catch (e) { alert("Error"); }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try { await axios.post('http://localhost:5000/api/customers/add', { ...customerForm, companyId: COMPANY_ID }); alert("Customer Added!"); fetchCustomers(); setCustomerForm({ customerName: '', gstNo: '', billingAddress: '', contactPerson: '', mobileNo: '' }); } catch (e) { alert("Error"); }
  };

  const updateStatus = async (id, newStatus) => {
    await axios.put(`http://localhost:5000/api/bookings/update-status/${id}`, { status: newStatus });
    fetchBookings();
  };

  // NEW: Generate Invoice Function
  const generateInvoice = async (booking) => {
    try {
        // Calculate GST (Assume 12% for Transport)
        const gst = (booking.freightAmount * 0.12).toFixed(2);
        
        await axios.post('http://localhost:5000/api/invoices/generate', {
            companyId: COMPANY_ID,
            bookingId: booking._id,
            customerName: booking.customerName,
            totalAmount: booking.freightAmount,
            gstAmount: gst
        });
        alert("Invoice Generated Successfully!");
        setActiveTab('invoices'); // Switch to Invoice Tab
    } catch (e) {
        alert("Error generating invoice");
    }
  };

  const markPaid = async (id) => {
    await axios.put(`http://localhost:5000/api/invoices/pay/${id}`);
    fetchInvoices();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#0056b3' }}>🚚 LogiSoft Transport Management</h1>
      
      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setActiveTab('bookings')} style={activeTab === 'bookings' ? activeTabStyle : tabStyle}>📦 Bookings</button>
        <button onClick={() => setActiveTab('vehicles')} style={activeTab === 'vehicles' ? activeTabStyle : tabStyle}>🚛 Fleet</button>
        <button onClick={() => setActiveTab('drivers')} style={activeTab === 'drivers' ? activeTabStyle : tabStyle}>🧑‍✈️ Drivers</button>
        <button onClick={() => setActiveTab('customers')} style={activeTab === 'customers' ? activeTabStyle : tabStyle}>👥 Customers</button>
        <button onClick={() => setActiveTab('invoices')} style={activeTab === 'invoices' ? activeTabStyle : tabStyle}>💰 Invoices</button>
      </div>

      {/* --- BOOKINGS --- */}
      {activeTab === 'bookings' && (
        <div>
          <div style={formBoxStyle}>
            <h3>Create New Consignment</h3>
            <form onSubmit={handleBookingSubmit}>
              <input placeholder="Customer Name" value={bookingForm.customerName} onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})} required style={inputStyle} />
              <input placeholder="Origin" value={bookingForm.origin} onChange={e => setBookingForm({...bookingForm, origin: e.target.value})} required style={inputStyle} />
              <input placeholder="Destination" value={bookingForm.destination} onChange={e => setBookingForm({...bookingForm, destination: e.target.value})} required style={inputStyle} />
              <input placeholder="Freight Amount (₹)" type="number" value={bookingForm.freightAmount} onChange={e => setBookingForm({...bookingForm, freightAmount: e.target.value})} required style={inputStyle} />
              <button type="submit" style={btnPrimary}>Book Now</button>
            </form>
          </div>
          <h3>Active Shipments</h3>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0056b3', color: '#fff' }}>
              <tr><th>LR No.</th><th>Customer</th><th>Route</th><th>Amount</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {bookings.map(bk => (
                <tr key={bk._id}>
                  <td>{bk.consignmentNo}</td>
                  <td>{bk.customerName}</td>
                  <td>{bk.origin} ➡️ {bk.destination}</td>
                  <td>₹{bk.freightAmount}</td>
                  <td><span style={statusBadge(bk.status)}>{bk.status}</span></td>
                  <td>
                    {bk.status === 'Booked' && <button onClick={() => updateStatus(bk._id, 'Dispatched')} style={btnAction}>Dispatch</button>}
                    {bk.status === 'Dispatched' && <button onClick={() => updateStatus(bk._id, 'In-Transit')} style={btnAction}>In-Transit</button>}
                    {bk.status === 'In-Transit' && <button onClick={() => updateStatus(bk._id, 'Delivered')} style={{...btnAction, background: 'green'}}>Deliver</button>}
                    {bk.status === 'Delivered' && <button onClick={() => generateInvoice(bk)} style={{...btnAction, background: '#ff6600'}}>Invoice</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- VEHICLES --- */}
      {activeTab === 'vehicles' && (
        <div>
          <div style={formBoxStyle}>
            <h3>Add New Vehicle</h3>
            <form onSubmit={handleVehicleSubmit}>
              <input placeholder="Vehicle No" value={vehicleForm.vehicleNo} onChange={e => setVehicleForm({...vehicleForm, vehicleNo: e.target.value})} required style={inputStyle} />
              <select value={vehicleForm.vehicleType} onChange={e => setVehicleForm({...vehicleForm, vehicleType: e.target.value})} style={inputStyle}>
                <option>Truck</option><option>Mini-Truck</option><option>Trailer</option>
              </select>
              <input placeholder="Capacity" type="number" value={vehicleForm.capacity} onChange={e => setVehicleForm({...vehicleForm, capacity: e.target.value})} required style={inputStyle} />
              <button type="submit" style={btnPrimary}>Add Vehicle</button>
            </form>
          </div>
          <h3>Fleet List</h3>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#333', color: '#fff' }}>
              <tr><th>Vehicle No.</th><th>Type</th><th>Capacity</th><th>Status</th></tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v._id}>
                  <td>{v.vehicleNo}</td>
                  <td>{v.vehicleType}</td>
                  <td>{v.capacity} Ton</td>
                  <td><span style={statusBadge(v.status)}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- DRIVERS --- */}
      {activeTab === 'drivers' && (
        <div>
          <div style={formBoxStyle}>
            <h3>Add New Driver</h3>
            <form onSubmit={handleDriverSubmit}>
              <input placeholder="Driver Name" value={driverForm.driverName} onChange={e => setDriverForm({...driverForm, driverName: e.target.value})} required style={inputStyle} />
              <input placeholder="License No" value={driverForm.licenseNo} onChange={e => setDriverForm({...driverForm, licenseNo: e.target.value})} required style={inputStyle} />
              <input placeholder="Mobile No" value={driverForm.mobileNo} onChange={e => setDriverForm({...driverForm, mobileNo: e.target.value})} required style={inputStyle} />
              <button type="submit" style={btnPrimary}>Add Driver</button>
            </form>
          </div>
          <h3>Driver List</h3>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#555', color: '#fff' }}>
              <tr><th>Name</th><th>License</th><th>Mobile</th><th>Status</th></tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d._id}>
                  <td>{d.driverName}</td>
                  <td>{d.licenseNo}</td>
                  <td>{d.mobileNo}</td>
                  <td><span style={statusBadge(d.status)}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- CUSTOMERS --- */}
      {activeTab === 'customers' && (
        <div>
          <div style={formBoxStyle}>
            <h3>Add New Customer</h3>
            <form onSubmit={handleCustomerSubmit}>
              <input placeholder="Customer Name" value={customerForm.customerName} onChange={e => setCustomerForm({...customerForm, customerName: e.target.value})} required style={inputStyle} />
              <input placeholder="GST No" value={customerForm.gstNo} onChange={e => setCustomerForm({...customerForm, gstNo: e.target.value})} style={inputStyle} />
              <input placeholder="Contact Person" value={customerForm.contactPerson} onChange={e => setCustomerForm({...customerForm, contactPerson: e.target.value})} style={inputStyle} />
              <input placeholder="Mobile No" value={customerForm.mobileNo} onChange={e => setCustomerForm({...customerForm, mobileNo: e.target.value})} style={inputStyle} />
              <button type="submit" style={btnPrimary}>Add Customer</button>
            </form>
          </div>
          <h3>Customer List</h3>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#444', color: '#fff' }}>
              <tr><th>Name</th><th>GST</th><th>Contact</th><th>Mobile</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>{c.customerName}</td>
                  <td>{c.gstNo}</td>
                  <td>{c.contactPerson}</td>
                  <td>{c.mobileNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- INVOICES --- */}
      {activeTab === 'invoices' && (
        <div>
          <h3>Generated Invoices</h3>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#222', color: '#fff' }}>
              <tr><th>Invoice No.</th><th>Customer</th><th>Total</th><th>GST</th><th>Grand Total</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNo}</td>
                  <td>{inv.customerName}</td>
                  <td>₹{inv.totalAmount}</td>
                  <td>₹{inv.gstAmount}</td>
                  <td>₹{inv.grandTotal}</td>
                  <td><span style={statusBadge(inv.status === 'Paid' ? 'Delivered' : 'Dispatched')}>{inv.status}</span></td>
                  <td>
                    {inv.status === 'Unpaid' && <button onClick={() => markPaid(inv._id)} style={btnAction}>Mark Paid</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const formBoxStyle = { border: '1px solid #ddd', padding: '20px', marginBottom: '20px', background: '#f9f9f9', borderRadius: '8px' };
const inputStyle = { margin: '5px', padding: '8px', width: '200px' };
const btnPrimary = { background: '#ff6600', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', marginLeft: '10px' };
const btnAction = { padding: '5px 10px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' };
const tabStyle = { padding: '10px 20px', cursor: 'pointer', background: '#eee', border: 'none', marginRight: '5px' };
const activeTabStyle = { ...tabStyle, background: '#0056b3', color: '#fff', borderBottom: '3px solid #ff6600' };

const statusBadge = (status) => ({
  padding: '5px 10px',
  background: status === 'Delivered' || status === 'Available' || status === 'Paid' ? 'green' : 'orange',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '12px'
});

export default App;