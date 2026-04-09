import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// ==========================================
// STYLES
// ==========================================
const styles = {
  authContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  authBox: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '400px' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
  btn: { width: '100%', padding: '12px', background: '#ff6600', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
};

const formBoxStyle = { background: '#fff', padding: '20px', marginBottom: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', boxSizing: 'border-box', fontSize: '13px' };
const btnPrimary = { background: '#ff6600', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' };
const btnSecondary = { background: '#6c757d', color: '#fff', padding: '8px 15px', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px' };
const btnAction = { padding: '6px 12px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', marginRight: '5px' };
const statusBadge = (status) => ({ padding: '6px 12px', background: status === 'Active' || status === 'Delivered' || status === 'Paid' ? '#28a745' : status === 'Cancelled' ? '#dc3545' : '#ffc107', color: '#fff', borderRadius: '20px', fontSize: '11px', display: 'inline-block' });
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '10px', width: '900px', maxHeight: '90vh', overflowY: 'auto' };
const cardHeader = { background: '#f8f9fa', padding: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold', display:'flex', justifyContent:'space-between', alignItems:'center' };

// ==========================================
// MAIN APP
// ==========================================
function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('logisoft_user');
    const c = localStorage.getItem('logisoft_company');
    if (u && c) { setUser(JSON.parse(u)); setCompany(JSON.parse(c)); setView('dashboard'); }
  }, []);

  const handleLogin = (u, c) => { setUser(u); setCompany(c); localStorage.setItem('logisoft_user', JSON.stringify(u)); localStorage.setItem('logisoft_company', JSON.stringify(c)); setView('dashboard'); };
  const handleLogout = () => { localStorage.clear(); setUser(null); setCompany(null); setView('auth'); };

  if (view === 'auth') return <AuthPage onLogin={handleLogin} />;
  return <Dashboard user={user} company={company} setCompany={setCompany} onLogout={handleLogout} />;
}

// ==========================================
// AUTH PAGE
// ==========================================
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ companyName: '', headOffice: '', gstNo: '', email: '', password: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { if (isLogin) { const res = await axios.post('http://localhost:5000/api/auth/login', { email: form.email, password: form.password }); onLogin(res.data.user, res.data.company); } else { await axios.post('http://localhost:5000/api/auth/register', form); alert("Registered!"); setIsLogin(true); } } catch (err) { alert(err.response?.data || "Error"); } };
  return (
    <div style={{minHeight:'100vh', background:'#f8f9fa', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{maxWidth:1000, width:'100%', margin:'0 auto', display:'flex', boxShadow:'0 4px 15px rgba(0,0,0,0.1)', borderRadius:12, overflow:'hidden', background:'#fff'}}>
        <div style={{flex:1, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding:40, color:'#fff', display:'flex', flexDirection:'column', justifyContent:'center'}}><h1>LogiSoft</h1><p>Transport Management System</p></div>
        <div style={{width:400, padding:40, display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && <><input placeholder="Company Name" onChange={e=>setForm({...form, companyName:e.target.value})} style={styles.input} required /><input placeholder="Head Office" onChange={e=>setForm({...form, headOffice:e.target.value})} style={styles.input} required /><input placeholder="GST" onChange={e=>setForm({...form, gstNo:e.target.value})} style={styles.input} /></>}
            <input placeholder="Email" type="email" onChange={e=>setForm({...form, email:e.target.value})} style={styles.input} required />
            <input placeholder="Password" type="password" onChange={e=>setForm({...form, password:e.target.value})} style={styles.input} required />
            <button style={styles.btn}>{isLogin ? "Login" : "Register"}</button>
          </form>
          <p style={{cursor:'pointer', color:'#007bff', textAlign:'center', marginTop:15}} onClick={()=>setIsLogin(!isLogin)}>{isLogin ? "New Company? Register" : "Back to Login"}</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD
// ==========================================
function Dashboard({ user, company, setCompany, onLogout }) {
  const [tab, setTab] = useState('home');
  const [masterSubTab, setMasterSubTab] = useState('vehicle');
  const [data, setData] = useState({ bookings: [], vehicles: [], drivers: [], customers: [], invoices: [], routes: [], users: [] });
  const cid = company._id;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [b, v, d, c, i, r, u] = await Promise.all([
          axios.get(`http://localhost:5000/api/trips/company/${cid}`).catch(()=>({data:[]})),
          axios.get(`http://localhost:5000/api/vehicles/company/${cid}`).catch(()=>({data:[]})),
          axios.get(`http://localhost:5000/api/drivers/company/${cid}`).catch(()=>({data:[]})),
          axios.get(`http://localhost:5000/api/customers/company/${cid}`).catch(()=>({data:[]})),
          axios.get(`http://localhost:5000/api/invoices/company/${cid}`).catch(()=>({data:[]})),
          axios.get(`http://localhost:5000/api/masters/route/company/${cid}`).catch(()=>({data:[]})),
          axios.get(`http://localhost:5000/api/users/company/${cid}`).catch(()=>({data:[]}))
        ]);
        setData({ bookings: b.data, vehicles: v.data, drivers: d.data, customers: c.data, invoices: i.data, routes: r.data, users: u.data });
      } catch (e) { console.log(e); }
    };
    fetch();
    // Live Refresh every 30 seconds
    const interval = setInterval(fetch, 30000); 
    return () => clearInterval(interval);
  }, [cid]);

  const refresh = (type) => {
    const urls = { bookings: `trips/company/${cid}`, vehicles: `vehicles/company/${cid}`, drivers: `drivers/company/${cid}`, customers: `customers/company/${cid}`, invoices: `invoices/company/${cid}`, routes: `masters/route/company/${cid}`, users: `users/company/${cid}` };
    axios.get(`http://localhost:5000/api/${urls[type]}`).then(res => setData({...data, [type]: res.data})).catch(()=>{});
  };

  const refreshAll = () => {
      // Refresh masters for dropdowns
      ['vehicles', 'drivers', 'customers', 'routes'].forEach(t => refresh(t));
  };

  const menu = [ 
    { key: 'home', label: '🏠 Dashboard' }, 
    { key: 'bookings', label: '📦 Operations' }, 
    { key: 'masters', label: '⚙️ Masters' }, 
    { key: 'invoices', label: '💰 Billing' }, 
    { key: 'gallery', label: '📷 Gallery' }, 
    { key: 'reports', label: '📊 Reports' }, 
    { key: 'settings', label: '🛠️ Settings' } 
  ];

  const renderContent = () => {
    switch(tab) {
      case 'home': return <HomeDash data={data} />;
      case 'bookings': return <OperationsModule cid={cid} data={data.bookings} inv={data.invoices} masters={data} refresh={()=>refresh('bookings')} refreshMasters={refreshAll} />;
      case 'masters': return <MastersWrapper sub={masterSubTab} setSub={setMasterSubTab} data={data} refresh={refresh} cid={cid} />;
      case 'invoices': return <InvoicesModule data={data.invoices} refresh={()=>refresh('invoices')} />;
      case 'gallery': return <GalleryModule data={data} />;
      case 'reports': return <ReportsModule data={data} />;
      case 'settings': return <SettingsModule company={company} setCompany={setCompany} />;
      default: return null;
    }
  };

  return (
    <div style={{display:'flex', height:'100vh', background:'#f0f2f5'}}>
      <div style={{width:220, background:'#2d3436', color:'#fff', display:'flex', flexDirection:'column'}}>
        <div style={{padding:20, borderBottom:'1px solid #444', textAlign:'center'}}><img src={company.logoUrl} style={{width:'100%', maxWidth:100, marginBottom:5}} alt="Logo"/><h4>{company.companyName}</h4></div>
        <div style={{flex:1, paddingTop:10}}>{menu.map(m => (<div key={m.key} onClick={()=>setTab(m.key)} style={{padding:'15px 20px', cursor:'pointer', background: tab===m.key ? '#0984e3' : 'transparent', borderLeft: tab===m.key ? '4px solid #ff6600' : '4px solid transparent'}}>{m.label}</div>))}</div>
        <div style={{padding:15, borderTop:'1px solid #444', fontSize:12}}><div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><span>{user.name}</span><button onClick={onLogout} style={{background:'#ff4757', border:'none', color:'#fff', padding:'5px 10px', borderRadius:4, cursor:'pointer'}}>Logout</button></div></div>
      </div>
      <div style={{flex:1, padding:'20px', overflowY:'auto'}}>{renderContent()}</div>
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

// --- ENHANCED DASHBOARD ---
function HomeDash({ data }) { 
    const rev = data.invoices.filter(i => i.status !== 'Cancelled').reduce((s,i) => s+i.grandTotal, 0); 
    const active = data.vehicles.filter(v => v.status === 'Active').length;
    const pending = data.invoices.filter(i => i.status === 'Unpaid').length;
    
    const cardStyle = (color) => ({ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: `4px solid ${color}` });
    
    return (
    <div>
        <h2>📈 Dashboard Overview</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20, marginBottom:30}}>
            <div style={cardStyle('#667eea')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><h3 style={{margin:0, color:'#666'}}>Revenue</h3><span style={{background:'#667eea', color:'#fff', padding:5, borderRadius:20, height:20}}>💰</span></div>
                <h1 style={{margin:'10px 0'}}>₹{rev.toLocaleString()}</h1>
                <p style={{margin:0, color:'#28a745', fontSize:12}}>Total Collected</p>
            </div>
            <div style={cardStyle('#ff6600')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><h3 style={{margin:0, color:'#666'}}>Active Fleet</h3><span style={{background:'#ff6600', color:'#fff', padding:5, borderRadius:20, height:20}}>🚚</span></div>
                <h1 style={{margin:'10px 0'}}>{active} <span style={{fontSize:14, color:'#999'}}>/ {data.vehicles.length}</span></h1>
                <p style={{margin:0, color:'#ff6600', fontSize:12}}>Vehicles on Road</p>
            </div>
            <div style={cardStyle('#28a745')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><h3 style={{margin:0, color:'#666'}}>Trips</h3><span style={{background:'#28a745', color:'#fff', padding:5, borderRadius:20, height:20}}>📦</span></div>
                <h1 style={{margin:'10px 0'}}>{data.bookings.length}</h1>
                <p style={{margin:0, color:'#666', fontSize:12}}>Total Bookings</p>
            </div>
            <div style={cardStyle('#dc3545')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><h3 style={{margin:0, color:'#666'}}>Pending</h3><span style={{background:'#dc3545', color:'#fff', padding:5, borderRadius:20, height:20}}>🧾</span></div>
                <h1 style={{margin:'10px 0'}}>{pending}</h1>
                <p style={{margin:0, color:'#dc3545', fontSize:12}}>Unpaid Invoices</p>
            </div>
        </div>

        <div style={{background:'#fff', padding:20, borderRadius:10}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}><h3>Recent Activities</h3><button onClick={()=>window.location.reload()} style={{...btnSecondary, border:'1px solid #ccc'}}>Refresh</button></div>
            <table width="100%">
                <thead style={{background:'#f8f9fa'}}><tr><th>GR No</th><th>Customer</th><th>Status</th></tr></thead>
                <tbody>
                    {data.bookings.slice(0,5).map(b => (
                        <tr key={b._id}><td><b>{b.tripNo}</b></td><td>{b.customerId?.customerName}</td><td><span style={statusBadge(b.status)}>{b.status}</span></td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

function MastersWrapper({ sub, setSub, data, refresh, cid }) { const tabs = [{key:'vehicle', label:'🚛 Fleet'}, {key:'driver', label:'🧑‍✈️ Drivers'}, {key:'customer', label:'👥 Customers'}, {key:'route', label:'🛣️ Routes'}, {key:'user', label:'👤 Users'}]; return (<div><div style={{display:'flex', gap:10, marginBottom:20, flexWrap:'wrap'}}>{tabs.map(t => (<button key={t.key} onClick={()=>setSub(t.key)} style={{padding:'10px 20px', border:'none', background: sub===t.key ? '#ff6600' : '#fff', color: sub===t.key ? '#fff' : '#333', borderRadius:20, cursor:'pointer', fontWeight:'bold'}}>{t.label}</button>))}</div>{sub==='vehicle' && <FleetModule cid={cid} data={data.vehicles} refresh={()=>refresh('vehicles')} />}{sub==='driver' && <DriverModule cid={cid} data={data.drivers} refresh={()=>refresh('drivers')} />}{sub==='customer' && <CustomerModule cid={cid} data={data.customers} refresh={()=>refresh('customers')} />}{sub==='route' && <RouteModule cid={cid} data={data.routes} refresh={()=>refresh('routes')} />}{sub==='user' && <UsersModule cid={cid} data={data.users} refresh={()=>refresh('users')} />}</div>); }

// ==========================================
// FILE UPLOAD HELPER
// ==========================================
const uploadFile = async (file) => { if(!file) return null; const fd = new FormData(); fd.append('document', file); const res = await axios.post('http://localhost:5000/api/upload/document', fd); return res.data.filePath; };

// ==========================================
// OPERATIONS MODULE (Added LR/PO)
// ==========================================
function OperationsModule({ cid, data, inv, masters, refresh, refreshMasters }) {
    const [form, setForm] = useState({ 
        vehicleId: '', driverId: '', customerId: '', 
        legs: [{origin:'', destination:'', distanceKm:0, freight:0}],
        consignor: { name:'', address:'', contact:'', email:'', gst:'' },
        consignee: { name:'', address:'', contact:'', email:'', gst:'' },
        materialDescription: '', noOfPackages: 0, weightKg: 0, invoiceValue: 0,
        // New Fields
        lrNumber: 'LR-' + (1000 + Math.floor(Math.random()*9000)), // Auto but editable
        poNumber: '',
        advanceAmount: 0, tollAmount: 0, 
        docLr: null, docPod: null, docEway: null
    });
    const [quickAdd, setQuickAdd] = useState({ type: null, data: {} });

    const handleLegChange = (index, field, value) => { const updatedLegs = [...form.legs]; updatedLegs[index][field] = value; setForm({...form, legs: updatedLegs}); };
    const addLeg = () => { setForm({...form, legs: [...form.legs, {origin:'', destination:'', distanceKm:0, freight:0}]}); };
    const removeLeg = (index) => { const updatedLegs = form.legs.filter((_, i) => i !== index); setForm({...form, legs: updatedLegs}); };
    const handleDetailChange = (type, field, value) => { setForm({...form, [type]: {...form[type], [field]: value}}); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const lrPath = form.docLr ? await uploadFile(form.docLr) : null;
            const podPath = form.docPod ? await uploadFile(form.docPod) : null;
            const ewayPath = form.docEway ? await uploadFile(form.docEway) : null;

            const payload = { 
                ...form, tenantId: cid, consignmentNo: form.lrNumber, // Mapping LR to ConsignmentNo
                docLr: lrPath, docPod: podPath, docEwayBill: ewayPath
            };
            await axios.post('http://localhost:5000/api/trips/create', payload);
            alert("GR Created Successfully");
            refresh();
        } catch(e) { alert("Error: " + (e.response?.data || e.message)); }
    };

    const handleStatus = async (id, action) => { try { await axios.put(`http://localhost:5000/api/trips/${action}/${id}`); refresh(); } catch(e) {} };
    const handleInvoice = async (t) => { try { await axios.post('http://localhost:5000/api/invoices/generate', { companyId: cid, bookingId: t._id, customerName: t.customerId?.customerName, totalAmount: t.freightAmount, tollAmount: t.tollAmount, gstAmount: ((t.freightAmount + t.tollAmount) * 0.12).toFixed(2), consignor: t.consignor, consignee: t.consignee }); alert("Invoice Generated"); refresh(); } catch(e) { alert("Error"); } };
    const isInv = (id) => inv.some(i => i.bookingId === id);

    const handleQuickAdd = async () => {
        try {
            const url = quickAdd.type === 'customer' ? 'customers/add' : quickAdd.type === 'vehicle' ? 'vehicles/add' : 'drivers/add';
            await axios.post(`http://localhost:5000/api/${url}`, {...quickAdd.data, tenantId: cid});
            alert("Added Successfully");
            setQuickAdd({type:null, data:{}});
            refreshMasters();
        } catch(e) { alert("Error adding"); }
    };

    return (
        <div style={formBoxStyle}>
            {quickAdd.type && (
                <div style={modalOverlay}>
                    <div style={{background:'#fff', padding:20, borderRadius:8, width:300}}>
                        <h4>Add New {quickAdd.type}</h4>
                        {quickAdd.type === 'customer' && <><input placeholder="Name" onChange={e=>setQuickAdd({...quickAdd, data:{...quickAdd.data, customerName:e.target.value}})} style={inputStyle} /><input placeholder="Mobile" onChange={e=>setQuickAdd({...quickAdd, data:{...quickAdd.data, mobileNo:e.target.value}})} style={inputStyle} /></>}
                        {quickAdd.type === 'vehicle' && <><input placeholder="Vehicle No" onChange={e=>setQuickAdd({...quickAdd, data:{...quickAdd.data, vehicleNo:e.target.value}})} style={inputStyle} /><input placeholder="Type" onChange={e=>setQuickAdd({...quickAdd, data:{...quickAdd.data, vehicleType:e.target.value}})} style={inputStyle} /></>}
                        {quickAdd.type === 'driver' && <><input placeholder="Name" onChange={e=>setQuickAdd({...quickAdd, data:{...quickAdd.data, driverName:e.target.value}})} style={inputStyle} /><input placeholder="Mobile" onChange={e=>setQuickAdd({...quickAdd, data:{...quickAdd.data, mobileNo:e.target.value}})} style={inputStyle} /></>}
                        <div style={{marginTop:15}}><button onClick={handleQuickAdd} style={btnPrimary}>Save</button><button onClick={()=>setQuickAdd({type:null, data:{}})} style={{...btnSecondary, marginLeft:5}}>Cancel</button></div>
                    </div>
                </div>
            )}

            <h3>Operations Planning (GR/LR)</h3>
            <form onSubmit={handleSubmit}>
                {/* Top Selections */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:15}}>
                    <div style={{display:'flex'}}><select value={form.customerId} onChange={e=>setForm({...form, customerId:e.target.value})} required style={{...inputStyle, flex:1}}><option value="">Customer</option>{masters.customers.map(x=><option key={x._id} value={x._id}>{x.customerName}</option>)}</select><button type="button" onClick={()=>setQuickAdd({type:'customer', data:{}})} style={{...btnAction, marginLeft:5}}>+</button></div>
                    <div style={{display:'flex'}}><select value={form.vehicleId} onChange={e=>setForm({...form, vehicleId:e.target.value})} required style={{...inputStyle, flex:1}}><option value="">Vehicle</option>{masters.vehicles.map(x=><option key={x._id} value={x._id}>{x.vehicleNo}</option>)}</select><button type="button" onClick={()=>setQuickAdd({type:'vehicle', data:{}})} style={{...btnAction, marginLeft:5}}>+</button></div>
                    <div style={{display:'flex'}}><select value={form.driverId} onChange={e=>setForm({...form, driverId:e.target.value})} style={{...inputStyle, flex:1}}><option value="">Driver</option>{masters.drivers.map(x=><option key={x._id} value={x._id}>{x.driverName}</option>)}</select><button type="button" onClick={()=>setQuickAdd({type:'driver', data:{}})} style={{...btnAction, marginLeft:5}}>+</button></div>
                </div>

                {/* LR & PO Number */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:15}}>
                    <div style={cardHeader}>LR Number</div>
                    <div style={cardHeader}>PO Number</div>
                    <div style={cardHeader}>Invoice Value</div>
                    
                    <input placeholder="LR Number" value={form.lrNumber} onChange={e=>setForm({...form, lrNumber: e.target.value})} required style={inputStyle} />
                    <input placeholder="PO Number" value={form.poNumber} onChange={e=>setForm({...form, poNumber: e.target.value})} style={inputStyle} />
                    <input placeholder="Invoice Value" type="number" value={form.invoiceValue} onChange={e=>setForm({...form, invoiceValue: e.target.value})} style={inputStyle} />
                </div>

                {/* Material Details */}
                <div style={{background:'#eef2f5', padding:10, marginBottom:15, borderRadius:4}}>
                    <h4 style={{marginTop:0}}>Material Details</h4>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                        <input placeholder="Description" value={form.materialDescription} onChange={e=>setForm({...form, materialDescription:e.target.value})} style={inputStyle} />
                        <input placeholder="Pkgs" type="number" value={form.noOfPackages} onChange={e=>setForm({...form, noOfPackages:e.target.value})} style={inputStyle} />
                        <input placeholder="Weight (Kg)" type="number" value={form.weightKg} onChange={e=>setForm({...form, weightKg:e.target.value})} style={inputStyle} />
                    </div>
                </div>

                {/* Consignor / Consignee */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:15}}>
                    <div style={{border:'1px solid #eee', padding:10, borderRadius:4}}>
                        <h4 style={{marginTop:0}}>Consignor (From)</h4>
                        <input placeholder="Name" value={form.consignor.name} onChange={(e)=>handleDetailChange('consignor', 'name', e.target.value)} style={inputStyle} />
                        <input placeholder="Address" value={form.consignor.address} onChange={(e)=>handleDetailChange('consignor', 'address', e.target.value)} style={inputStyle} />
                        <input placeholder="Contact" value={form.consignor.contact} onChange={(e)=>handleDetailChange('consignor', 'contact', e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{border:'1px solid #eee', padding:10, borderRadius:4}}>
                        <h4 style={{marginTop:0}}>Consignee (To)</h4>
                        <input placeholder="Name" value={form.consignee.name} onChange={(e)=>handleDetailChange('consignee', 'name', e.target.value)} style={inputStyle} />
                        <input placeholder="Address" value={form.consignee.address} onChange={(e)=>handleDetailChange('consignee', 'address', e.target.value)} style={inputStyle} />
                        <input placeholder="Contact" value={form.consignee.contact} onChange={(e)=>handleDetailChange('consignee', 'contact', e.target.value)} style={inputStyle} />
                    </div>
                </div>

                {/* Route Legs */}
                <h4>Route Legs</h4>
                {form.legs.map((leg, i) => (
                    <div key={i} style={{background:'#f8f9fa', padding:10, marginBottom:10, borderRadius:4, border:'1px solid #eee'}}>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', gap:5, alignItems:'center'}}>
                            <input placeholder="Origin" value={leg.origin} onChange={(e)=>handleLegChange(i, 'origin', e.target.value)} required style={inputStyle} />
                            <input placeholder="Dest" value={leg.destination} onChange={(e)=>handleLegChange(i, 'destination', e.target.value)} required style={inputStyle} />
                            <input placeholder="KM" type="number" value={leg.distanceKm} onChange={(e)=>handleLegChange(i, 'distanceKm', e.target.value)} style={inputStyle} />
                            <input placeholder="Freight" type="number" value={leg.freight} onChange={(e)=>handleLegChange(i, 'freight', e.target.value)} style={inputStyle} />
                            {form.legs.length > 1 && <button type="button" onClick={()=>removeLeg(i)} style={{color:'red', border:'none', background:'transparent', cursor:'pointer', fontWeight:'bold'}}>✖</button>}
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addLeg} style={{...btnSecondary, marginBottom:15}}>+ Add Another Leg</button>

                {/* Documents */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10}}>
                    <div><label style={{fontSize:12, fontWeight:'bold'}}>LR Copy: <input type="file" onChange={e=>setForm({...form, docLr:e.target.files[0]})} /></label></div>
                    <div><label style={{fontSize:12, fontWeight:'bold'}}>POD: <input type="file" onChange={e=>setForm({...form, docPod:e.target.files[0]})} /></label></div>
                    <input placeholder="Advance" type="number" onChange={e=>setForm({...form, advanceAmount:e.target.value})} style={inputStyle} />
                </div>

                <button style={{...btnPrimary, padding:'12px 30px'}}>Create GR</button>
            </form>

            <table width="100%" border="1" cellPadding="10" style={{fontSize:12, marginTop:20, background:'#fff'}}>
                <thead style={{background:'#333', color:'#fff'}}><tr><th>GR No</th><th>LR/PO</th><th>Customer</th><th>Action</th></tr></thead>
                <tbody>
                    {data.map(t => (
                        <tr key={t._id}>
                            <td><b>{t.tripNo}</b></td>
                            <td>{t.consignmentNo} / {t.poNumber}</td>
                            <td>{t.customerId?.customerName}</td>
                            <td>
                                {t.status==='Planned' && <button onClick={()=>handleStatus(t._id, 'start')} style={btnAction}>Start</button>}
                                {t.status==='In-Transit' && <button onClick={()=>handleStatus(t._id, 'end')} style={{...btnAction, background:'green'}}>End</button>}
                                {t.status==='Completed' && !isInv(t._id) && <button onClick={()=>handleInvoice(t)} style={{...btnAction, background:'orange'}}>Invoice</button>}
                                {t.status==='Completed' && isInv(t._id) && <span style={{color:'green'}}>Invoiced</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ==========================================
// ROUTE MODULE (Maharashtra Metro + Auto Calc)
// ==========================================
function RouteModule({ cid, data, refresh }) {
    const metros = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Navi Mumbai", "Kolhapur", "Solapur", "Sangli", "Ratnagiri", "Other"];
    const [form, setForm] = useState({ routeName: '', origin: '', destination: '', distanceKm: 0, baseRate: 0 });
    
    const calculate = () => {
        // Just for display, backend stores distance and rate
        const total = (Number(form.distanceKm) * Number(form.baseRate));
        return isNaN(total) ? 0 : total;
    };

    const submit = async (e) => { 
        e.preventDefault(); 
        // Auto Name if empty
        const name = form.routeName || `${form.origin} - ${form.destination}`;
        await axios.post('http://localhost:5000/api/masters/route/add', {...form, routeName: name, tenantId: cid}); 
        alert("Added"); refresh(); 
    };
    
    return (
    <div style={formBoxStyle}>
        <h3>Route Master (Maharashtra)</h3>
        <form onSubmit={submit} style={{marginBottom:15}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                <select value={form.origin} onChange={e=>setForm({...form, origin:e.target.value})} required style={inputStyle}>
                    <option value="">Origin (From)</option>
                    {metros.map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={form.destination} onChange={e=>setForm({...form, destination:e.target.value})} required style={inputStyle}>
                    <option value="">Destination (To)</option>
                    {metros.map(m => <option key={m}>{m}</option>)}
                </select>
                <input placeholder="Distance (KM)" type="number" value={form.distanceKm} onChange={e=>setForm({...form, distanceKm:e.target.value})} required style={inputStyle} />
                <input placeholder="Rate per KM" type="number" value={form.baseRate} onChange={e=>setForm({...form, baseRate:e.target.value})} required style={inputStyle} />
                <div style={{display:'flex', alignItems:'center', background:'#eee', padding:'0 10px', borderRadius:4, fontWeight:'bold'}}>Est. Freight: ₹{calculate()}</div>
                <button style={btnPrimary}>Add Route</button>
            </div>
        </form>
        <table width="100%" border="1" cellPadding="8"><thead><tr><th>Name</th><th>Route</th><th>Rate/KM</th></tr></thead><tbody>{data.map(r=><tr key={r._id}><td>{r.routeName}</td><td>{r.origin} - {r.destination}</td><td>₹{r.baseRate}</td></tr>)}</tbody></table>
    </div>);
}

// ==========================================
// BILLING MODULE (Enhanced)
// ==========================================
function InvoicesModule({ data, refresh }) {
    const [sel, setSel] = useState(null);
    const [edit, setEdit] = useState(null);

    const toggle = async (id, s) => { await axios.put(`http://localhost:5000/api/invoices/pay/${id}`, {status:s}); refresh(); };
    
    const handleEdit = async () => {
        try {
            await axios.put(`http://localhost:5000/api/invoices/update/${edit._id}`, edit);
            alert("Updated");
            setEdit(null);
            refresh();
        } catch(e) { alert("Error updating"); }
    };

    return (
    <div style={formBoxStyle}>
        <h3>Billing / Invoices</h3>
        
        {/* Modify Modal */}
        {edit && (
            <div style={modalOverlay}>
                <div style={{background:'#fff', padding:20, borderRadius:8, width:400}}>
                    <h4>Modify Invoice #{edit.invoiceNo}</h4>
                    <label>Customer Name</label>
                    <input value={edit.customerName} onChange={e=>setEdit({...edit, customerName:e.target.value})} style={inputStyle} />
                    <label>Total Amount</label>
                    <input value={edit.totalAmount} onChange={e=>setEdit({...edit, totalAmount:e.target.value})} style={inputStyle} />
                    <div style={{marginTop:15}}><button onClick={handleEdit} style={btnPrimary}>Save Changes</button><button onClick={()=>setEdit(null)} style={{...btnSecondary, marginLeft:5}}>Cancel</button></div>
                </div>
            </div>
        )}

        <table width="100%" border="1" cellPadding="10">
            <thead style={{background:'#333', color:'#fff'}}>
                <tr><th>No</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
            {data.map(i => (
                <tr key={i._id}>
                    <td>{i.invoiceNo}</td>
                    <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                    <td>{i.customerName}</td>
                    <td>₹{i.grandTotal}</td>
                    <td><span style={statusBadge(i.status)}>{i.status}</span></td>
                    <td>
                        {i.status !== 'Cancelled' && <>
                            <button onClick={()=>setSel(i)} style={btnAction}>Print</button>
                            <button onClick={()=>setEdit(i)} style={{...btnAction, background:'#ffc107', color:'#000'}}>Modify</button>
                            <button onClick={()=>toggle(i._id, 'Cancelled')} style={{...btnAction, background:'#dc3545'}}>Cancel</button>
                        </>}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        {sel && <InvoicePrintModal data={sel} onClose={()=>setSel(null)} />}
    </div>);
}

function InvoicePrintModal({ data, onClose }) { const print = () => { const c = document.getElementById('inv').innerHTML; const w = window.open(''); w.document.write(`<html><head><style>body{font-family:Arial;font-size:12px;margin:0;padding:0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:6px;text-align:left}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:20px}.party-box{border:1px solid #000;padding:10px;margin-bottom:15px;height:100px}.party-title{background:#000;color:#fff;padding:2px 5px;font-size:10px;display:inline-block;margin-bottom:5px}</style></head><body>${c}</body></html>`); w.document.close(); w.print(); }; return (<div style={modalOverlay}><div style={{...modalContent, padding:0, background:'white'}} id="inv"><div className="header" style={{padding:20}}><div><h1 style={{margin:0}}>INVOICE</h1><p style={{margin:'5px 0'}}><b>No:</b> {data.invoiceNo}<br/><b>Date:</b> {new Date(data.createdAt).toLocaleDateString()}</p></div><div style={{textAlign:'right'}}><h3 style={{margin:0}}>{data.companyId?.companyName}</h3><p style={{margin:0, fontSize:10}}>{data.companyId?.headOffice}</p></div></div><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0}}><div className="party-box" style={{borderRight:'1px solid #000'}}><div className="party-title">BILL TO</div><h4 style={{margin:'5px 0'}}>{data.customerName}</h4></div><div className="party-box"><div className="party-title">SHIP TO</div><h4 style={{margin:'5px 0'}}>{data.consignee?.name || 'N/A'}</h4></div></div><table cellPadding="8"><thead><tr style={{background:'#eee'}}><th>Description</th><th style={{width:100}}>Amount (₹)</th></tr></thead><tbody><tr><td>Freight</td><td>{data.totalAmount}</td></tr><tr><td>Toll</td><td>{data.tollAmount}</td></tr><tr><td>CGST (6%)</td><td>{(data.gstAmount/2).toFixed(2)}</td></tr><tr><td>SGST (6%)</td><td>{(data.gstAmount/2).toFixed(2)}</td></tr><tr style={{background:'#000', color:'#fff'}}><td><b>GRAND TOTAL</b></td><td><b>{data.grandTotal}</b></td></tr></tbody></table></div><div style={{marginTop:10}}><button onClick={print} style={btnPrimary}>Print</button><button onClick={onClose} style={{...btnSecondary, marginLeft:10}}>Close</button></div></div>); }

// ==========================================
// GALLERY MODULE
// ==========================================
function GalleryModule({ data }) {
    const docs = [];
    // Collect from Vehicles
    data.vehicles.forEach(v => {
        if(v.rcDoc) docs.push({ type: 'RC Book', name: v.vehicleNo, url: v.rcDoc });
        if(v.insuranceDoc) docs.push({ type: 'Insurance', name: v.vehicleNo, url: v.insuranceDoc });
        if(v.pucDoc) docs.push({ type: 'PUC', name: v.vehicleNo, url: v.pucDoc });
    });
    // Collect from Drivers
    data.drivers.forEach(d => {
        if(d.licenseDoc) docs.push({ type: 'License', name: d.driverName, url: d.licenseDoc });
        if(d.photo) docs.push({ type: 'Photo', name: d.driverName, url: d.photo });
    });

    return (
        <div style={formBoxStyle}>
            <h3>📷 Document Gallery</h3>
            {docs.length === 0 ? <p>No documents uploaded yet.</p> :
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr)', gap:15}}>
                {docs.map((d, i) => (
                    <div key={i} style={{border:'1px solid #eee', borderRadius:8, padding:10, textAlign:'center', background:'#fafafa'}}>
                        <div style={{height:100, background:'#eee', marginBottom:10, display:'flex', justifyContent:'center', alignItems:'center', color:'#888'}}>
                            {d.url.match(/\.(jpg|jpeg|png|gif)$/i) ? 
                                <img src={d.url} style={{maxWidth:'100%', maxHeight:'100%'}} alt="Doc" /> : 
                                <span>📄 PDF</span>
                            }
                        </div>
                        <h4 style={{margin:'5px 0'}}>{d.name}</h4>
                        <span style={{fontSize:10, background:'#eee', padding:'2px 5px', borderRadius:4}}>{d.type}</span>
                        <br/>
                        <a href={d.url} target="_blank" rel="noreferrer" style={{fontSize:12, color:'#007bff', marginTop:5, display:'inline-block'}}>View File</a>
                    </div>
                ))}
            </div>
            }
        </div>
    );
}

// ==========================================
// OTHER MODULES
// ==========================================
function FleetModule({ cid, data, refresh }) {
    const [form, setForm] = useState({ vehicleNo: '', vehicleType: 'HCV', ownerName: '', make:'', model:'', chassisNo:'', engineNo:'', fuelType:'Diesel', rcNo:'', rcExpiry:'', rcDoc: null, permitType:'National', permitNo:'', permitExpiry:'', permitDoc: null, insurancePolicy:'', insuranceExpiry:'', insuranceDoc: null, fitnessNo:'', fitnessExpiry:'', fitnessDoc: null, pucNo:'', pucExpiry:'', pucDoc: null });
    const [edit, setEdit] = useState(null);
    const handleFileChange = (e) => { setForm({...form, [e.target.name]: e.target.files[0] }); };
    const submit = async (e) => { e.preventDefault(); const rc = await uploadFile(form.rcDoc); const permit = await uploadFile(form.permitDoc); const ins = await uploadFile(form.insuranceDoc); const fit = await uploadFile(form.fitnessDoc); const puc = await uploadFile(form.pucDoc); const payload = {...form, tenantId: cid, rcDoc: rc, permitDoc: permit, insuranceDoc: ins, fitnessDoc: fit, pucDoc: puc }; Object.keys(payload).forEach(key => { if(payload[key] instanceof File) delete payload[key]; }); try { const url = edit ? `http://localhost:5000/api/vehicles/update/${edit}` : 'http://localhost:5000/api/vehicles/add'; await axios.post(url, payload); alert("Saved"); setForm({ vehicleNo: '', vehicleType: 'HCV', ownerName: '' }); setEdit(null); refresh(); } catch(e) { alert("Error: " + (e.response?.data || e.message)); } };
    const editItem = (v) => { setForm({...v, rcExpiry: v.rcExpiry?.split('T')[0] }); setEdit(v._id); };
    return (<div style={formBoxStyle}><h3>Fleet Master</h3><form onSubmit={submit}><div style={cardHeader}>Basic Info</div><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:15}}><input placeholder="Vehicle No" value={form.vehicleNo} onChange={e=>setForm({...form, vehicleNo:e.target.value})} required style={inputStyle} /><input placeholder="Owner Name" value={form.ownerName} onChange={e=>setForm({...form, ownerName:e.target.value})} style={inputStyle} /><input placeholder="Make" value={form.make} onChange={e=>setForm({...form, make:e.target.value})} style={inputStyle} /><input placeholder="Chassis No" value={form.chassisNo} onChange={e=>setForm({...form, chassisNo:e.target.value})} style={inputStyle} /></div><div style={cardHeader}>Documents</div><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:15, background:'#f8f9fa', padding:10}}><input placeholder="RC No" value={form.rcNo} onChange={e=>setForm({...form, rcNo:e.target.value})} style={inputStyle} /><input type="date" value={form.rcExpiry} onChange={e=>setForm({...form, rcExpiry:e.target.value})} style={inputStyle} /><label>RC Doc: <input type="file" name="rcDoc" onChange={handleFileChange} /></label></div><button style={btnPrimary}>{edit ? 'Update' : 'Add Vehicle'}</button></form><table width="100%" border="1" cellPadding="8" style={{marginTop:20, fontSize:12}}><thead><tr><th>No</th><th>Owner</th><th>Action</th></tr></thead><tbody>{data.map(v=><tr key={v._id}><td>{v.vehicleNo}</td><td>{v.ownerName}</td><td><button onClick={()=>editItem(v)} style={btnAction}>Edit</button></td></tr>)}</tbody></table></div>);
}
function DriverModule({ cid, data, refresh }) { const [form, setForm] = useState({ employeeCode: '', driverName: '', mobileNo: '', email:'', address:'', licenseNo: '', licenseExpiry: '', licenseDoc: null, photo: null, bloodGroup:'', dob:'' }); const submit = async (e) => { e.preventDefault(); const license = await uploadFile(form.licenseDoc); const photo = await uploadFile(form.photo); await axios.post('http://localhost:5000/api/drivers/add', {...form, tenantId: cid, licenseDoc: license, photo: photo}); alert("Added"); refresh(); }; return (<div style={formBoxStyle}><h3>Driver Master</h3><form onSubmit={submit} style={{marginBottom:15}}><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10}}><input placeholder="Code" onChange={e=>setForm({...form, employeeCode:e.target.value})} required style={inputStyle} /><input placeholder="Name" onChange={e=>setForm({...form, driverName:e.target.value})} required style={inputStyle} /><input placeholder="Mobile" onChange={e=>setForm({...form, mobileNo:e.target.value})} required style={inputStyle} /><input placeholder="Blood Grp" onChange={e=>setForm({...form, bloodGroup:e.target.value})} style={inputStyle} /><input type="date" onChange={e=>setForm({...form, licenseExpiry:e.target.value})} required style={inputStyle} /><label style={{display:'flex', alignItems:'center'}}>License Doc: <input type="file" onChange={e=>setForm({...form, licenseDoc:e.target.files[0]})} /></label><label style={{display:'flex', alignItems:'center'}}>Photo: <input type="file" onChange={e=>setForm({...form, photo:e.target.files[0]})} /></label><button style={btnPrimary}>Add Driver</button></div></form><table width="100%" border="1" cellPadding="8"><thead><tr><th>Code</th><th>Name</th><th>Blood Group</th></tr></thead><tbody>{data.map(d=><tr key={d._id}><td>{d.employeeCode}</td><td>{d.driverName}</td><td>{d.bloodGroup}</td></tr>)}</tbody></table></div>); }
function CustomerModule({ cid, data, refresh }) { const [form, setForm] = useState({ customerName: '', gstNo: '', mobileNo: '', email:'', billingAddress:'', shippingAddress:'', docGst: null }); const submit = async (e) => { e.preventDefault(); const doc = await uploadFile(form.docGst); await axios.post('http://localhost:5000/api/customers/add', {...form, tenantId: cid, docGst: doc}); alert("Added"); refresh(); }; return (<div style={formBoxStyle}><h3>Customer Master</h3><form onSubmit={submit} style={{marginBottom:15}}><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10}}><input placeholder="Name" value={form.customerName} onChange={e=>setForm({...form, customerName:e.target.value})} required style={inputStyle} /><input placeholder="Mobile" value={form.mobileNo} onChange={e=>setForm({...form, mobileNo:e.target.value})} required style={inputStyle} /><input placeholder="Billing Addr" value={form.billingAddress} onChange={e=>setForm({...form, billingAddress:e.target.value})} style={inputStyle} /><label>GST Doc: <input type="file" onChange={e=>setForm({...form, docGst:e.target.files[0]})} /></label><button style={btnPrimary}>Add</button></div></form><table width="100%" border="1" cellPadding="8"><thead><tr><th>Name</th><th>GST</th><th>Billing Address</th></tr></thead><tbody>{data.map(c=><tr key={c._id}><td>{c.customerName}</td><td>{c.gstNo}</td><td>{c.billingAddress}</td></tr>)}</tbody></table></div>); }
function UsersModule({ cid, data, refresh }) { const [form, setForm] = useState({ name: '', email: '', password: '', role: 'User' }); const submit = async (e) => { e.preventDefault(); await axios.post('http://localhost:5000/api/users/create', {...form, tenantId: cid}); alert("Created"); setForm({ name:'', email:'', password:'', role:'User' }); refresh(); }; return (<div style={formBoxStyle}><h3>Users</h3><form onSubmit={submit} style={{marginBottom:15}}><div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10}}><input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required style={inputStyle} /><input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required style={inputStyle} /><input type="password" placeholder="Pass" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required style={inputStyle} /><button style={btnPrimary}>Add</button></div></form><table width="100%" border="1" cellPadding="8"><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>{data.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td></tr>)}</tbody></table></div>); }

function ReportsModule({ data }) { 
    const [type, setType] = useState('Transport'); 
    const [result, setResult] = useState([]); 
    
    const gen = () => { 
        let d = type === 'Transport' ? data.bookings : type === 'Fleet' ? data.vehicles : data.invoices; 
        // Filter out technical IDs
        const cleanData = d.map(row => {
            const clean = {...row};
            delete clean._id; delete clean.__v; delete clean.tenantId;
            if(clean.customerId && typeof clean.customerId === 'object') clean.customerId = clean.customerId.customerName;
            if(clean.vehicleId && typeof clean.vehicleId === 'object') clean.vehicleId = clean.vehicleId.vehicleNo;
            return clean;
        });
        setResult(cleanData); 
    };

    const handlePrint = () => { const c = document.getElementById('rep').innerHTML; const w = window.open(''); w.document.write(`<html><head><style>body{font-family:Arial}table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:5px;}</style></head><body>${c}</body></html>`); w.document.close(); w.print(); };
    
    return (
    <div style={formBoxStyle}>
        <h3>Reports</h3>
        <div style={{display:'flex', gap:10, marginBottom:15}}><select value={type} onChange={e=>setType(e.target.value)} style={inputStyle}><option>Transport</option><option>Fleet</option><option>Billing</option></select><button onClick={gen} style={btnPrimary}>Generate</button><button onClick={handlePrint} style={btnSecondary}>Print</button></div>
        <div id="rep">{result.length>0 && <table width="100%" border="1" cellPadding="8" style={{fontSize:12}}><thead style={{background:'#eee'}}><tr>{Object.keys(result[0]).map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{result.map((r,i)=><tr key={i}>{Object.values(r).map((v,j)=><td key={j}>{typeof v==='object' ? JSON.stringify(v) : v}</td>)}</tr>)}</tbody></table>}</div>
    </div>);
}

function SettingsModule({ company, setCompany }) { const [form, setForm] = useState(company); const save = async () => { await axios.put(`http://localhost:5000/api/auth/company/${company._id}`, form); localStorage.setItem('logisoft_company', JSON.stringify(form)); setCompany(form); alert("Saved"); }; return (<div style={formBoxStyle}><h3>Settings</h3><input placeholder="Company Name" value={form.companyName} onChange={e=>setForm({...form, companyName:e.target.value})} style={inputStyle} /><input placeholder="GST" value={form.gstNo} onChange={e=>setForm({...form, gstNo:e.target.value})} style={inputStyle} /><button onClick={save} style={{...btnPrimary, marginTop:10}}>Save</button></div>); }

export default App;