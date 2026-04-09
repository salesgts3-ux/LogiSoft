import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('customer');
    const [list, setList] = useState([]);
    const [editingItem, setEditingItem] = useState(null); 
    const [form, setForm] = useState({});

    // Define modules for permissions
    const allModules = [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'masters', name: 'Masters' },
        { id: 'booking', name: 'Booking / LR' },
        { id: 'billing', name: 'Billing' },
        { id: 'finance', name: 'Finance' },
        { id: 'reports', name: 'Reports' },
        { id: 'helpdesk', name: 'Helpdesk' },
        { id: 'garage', name: 'Garage' },
        { id: 'inventory', name: 'Inventory' },
        { id: 'gallery', name: 'Gallery' },
        { id: 'backup', name: 'Import/Export' },
        { id: 'settings', name: 'Settings' }
    ];

    useEffect(() => { reloadList(); }, [activeTab]);

    const reloadList = () => {
        if (activeTab === 'customer') setList(DataStore.getCustomers());
        if (activeTab === 'driver') setList(DataStore.getDrivers());
        if (activeTab === 'vehicle') setList(DataStore.getVehicles());
        if (activeTab === 'route') setList(DataStore.getRoutes());
        if (activeTab === 'user') setList(DataStore.getUsers());
        setEditingItem(null);
        setForm({});
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name === 'permissions') {
            const currentPerms = form.permissions || [];
            if (checked) {
                setForm({ ...form, permissions: [...currentPerms, value] });
            } else {
                setForm({ ...form, permissions: currentPerms.filter(p => p !== value) });
            }
        } else if (type === 'checkbox') {
            const current = form[name] || [];
            if (checked) current.push(value);
            else { const index = current.indexOf(value); if (index > -1) current.splice(index, 1); }
            setForm({ ...form, [name]: current });
        } else if (type === 'radio') {
             setForm({ ...form, [name]: value });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleFile = async (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            const base64 = await DataStore.toBase64(files[0]);
            setForm({ ...form, [name]: base64 });
        }
    };

    const handleSubmit = () => {
        const session = DataStore.getSession();
        const cid = session ? session.companyId : null;

        if (activeTab === 'vehicle') {
            if (!form.regNo) return alert("Vehicle No is required");
            if (!editingItem) form.companyId = cid; 
        } else if (activeTab === 'user') {
            if (!form.username) return alert("Username is required");
            if (!editingItem && !form.password) return alert("Password is required");
            if (!editingItem) form.companyId = cid;
        } else if (activeTab === 'route') {
            if (!form.from || !form.to) return alert("From and To locations are required");
            if (!editingItem) form.companyId = cid;
        } else if (activeTab === 'driver') {
            if (!form.name) return alert("Name is required");
            if (!editingItem) form.companyId = cid;
        } else {
            if (!form.name) return alert("Name is required");
            if (!editingItem) form.companyId = cid;
        }

        if (editingItem) {
            if (activeTab === 'customer') DataStore.updateCustomer({ ...editingItem, ...form });
            if (activeTab === 'driver') DataStore.updateDriver({ ...editingItem, ...form });
            if (activeTab === 'vehicle') DataStore.updateVehicle({ ...editingItem, ...form });
            if (activeTab === 'route') DataStore.updateRoute({ ...editingItem, ...form });
            if (activeTab === 'user') DataStore.updateUser({ ...editingItem, ...form });
        } else {
            if (activeTab === 'customer') DataStore.saveCustomer(form);
            if (activeTab === 'driver') DataStore.saveDriver(form);
            if (activeTab === 'vehicle') DataStore.saveVehicle(form);
            if (activeTab === 'route') DataStore.saveRoute(form);
            if (activeTab === 'user') DataStore.saveUser(form);
        }
        reloadList();
        alert('Saved Successfully!');
    };

    const editItem = (item) => { setEditingItem(item); setForm(item); };
    const deleteItem = (id) => {
        if(window.confirm("Delete this item?")){
            if (activeTab === 'user') DataStore.deleteUser(id);
            reloadList();
        }
    };

    const renderForm = () => {
        const commonBtn = editingItem ? 'Update' : 'Save';
        switch(activeTab) {
            case 'customer':
                return (
                    <div style={formGrid}>
                        <h4>{editingItem ? 'Edit' : 'New'} Customer</h4>
                        <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Customer Name" style={inputStyle} />
                        <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone" style={inputStyle} />
                        <input name="gst" value={form.gst || ''} onChange={handleChange} placeholder="GST Number" style={inputStyle} />
                        <input name="password" type="password" value={form.password || ''} onChange={handleChange} placeholder="Login Password (Optional)" style={inputStyle} />
                        <textarea name="address" value={form.address || ''} onChange={handleChange} placeholder="Address" style={inputStyle} />
                        <button onClick={handleSubmit} style={btnStyle}>{commonBtn} Customer</button>
                    </div>
                );
            case 'driver':
                return (
                    <div style={formGrid}>
                        <h4>{editingItem ? 'Edit' : 'New'} Driver</h4>
                        <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Driver Name" style={inputStyle} />
                        <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Mobile" style={inputStyle} />
                        <input name="license" value={form.license || ''} onChange={handleChange} placeholder="License No" style={inputStyle} />
                        
                        <label style={labelStyle}>Licence Types (Multi-Select)</label>
                        <div style={{display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap'}}>
                            {['LMV', 'HMV', 'Heavy Transport', 'Trailer'].map(t => (
                                <label key={t} style={{fontSize: 13}}>
                                    <input type="checkbox" name="licenseTypes" value={t} checked={form.licenseTypes?.includes(t)} onChange={handleChange} /> {t}
                                </label>
                            ))}
                        </div>
                        
                        <label style={labelStyle}>Upload Photo</label>
                        <input type="file" name="photo" onChange={handleFile} style={inputStyle} />
                        {form.photo && <img src={form.photo} style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 4}} alt="Driver" />}

                        <label style={labelStyle}>Upload License</label>
                        <input type="file" name="licenseDoc" onChange={handleFile} style={inputStyle} />

                        <button onClick={handleSubmit} style={btnStyle}>{commonBtn} Driver</button>
                    </div>
                );
            case 'vehicle':
                return (
                    <div style={formGrid}>
                        <h4>{editingItem ? 'Edit' : 'New'} Vehicle</h4>
                        <div style={{display: 'flex', gap: 20, marginBottom: 10}}>
                            <label><input type="radio" name="ownership" value="Own" checked={form.ownership === 'Own'} onChange={handleChange} /> Own</label>
                            <label><input type="radio" name="ownership" value="Hire" checked={form.ownership === 'Hire'} onChange={handleChange} /> Hire</label>
                        </div>

                        <input name="regNo" value={form.regNo || ''} onChange={handleChange} placeholder="Vehicle No / Reg No" style={inputStyle} />
                        
                        <select name="vehicleType" value={form.vehicleType || ''} onChange={handleChange} style={inputStyle}>
                            <option value="">Select Type</option>
                            <option>Eicher</option><option>Taurus</option><option>Container</option><option>Trailer</option><option>Mini Truck</option>
                        </select>

                        <select name="fuelType" value={form.fuelType || ''} onChange={handleChange} style={inputStyle}>
                            <option value="">Select Fuel Type</option>
                            <option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option>
                        </select>

                        <h5 style={{marginTop: 10, borderBottom: '1px solid #eee'}}>Documents & Expiry</h5>
                        
                        <label style={labelStyle}>RC Book</label>
                        <div style={docRow}>
                            <input type="file" name="rcBook" onChange={handleFile} style={{flex: 1}} />
                            <input type="date" name="rcExpiry" value={form.rcExpiry || ''} onChange={handleChange} />
                        </div>
                        
                        <label style={labelStyle}>Insurance</label>
                        <div style={docRow}>
                            <input type="file" name="insuranceDoc" onChange={handleFile} style={{flex: 1}} />
                            <input type="date" name="insuranceExpiry" value={form.insuranceExpiry || ''} onChange={handleChange} />
                        </div>

                        <label style={labelStyle}>PUC</label>
                        <div style={docRow}>
                            <input type="file" name="pucDoc" onChange={handleFile} style={{flex: 1}} />
                            <input type="date" name="pucExpiry" value={form.pucExpiry || ''} onChange={handleChange} />
                        </div>

                        <label style={labelStyle}>Fitness</label>
                        <div style={docRow}>
                            <input type="file" name="fitnessDoc" onChange={handleFile} style={{flex: 1}} />
                            <input type="date" name="fitnessExpiry" value={form.fitnessExpiry || ''} onChange={handleChange} />
                        </div>

                        <label style={labelStyle}>Permit</label>
                        <div style={docRow}>
                            <input type="file" name="permitDoc" onChange={handleFile} style={{flex: 1}} />
                            <input type="date" name="permitExpiry" value={form.permitExpiry || ''} onChange={handleChange} />
                        </div>

                        <button onClick={handleSubmit} style={btnStyle}>{commonBtn} Vehicle</button>
                    </div>
                );
            case 'route':
                return (
                    <div style={formGrid}>
                        <h4>{editingItem ? 'Edit' : 'New'} Route</h4>
                        <input name="from" value={form.from || ''} onChange={handleChange} placeholder="From" style={inputStyle} />
                        <input name="to" value={form.to || ''} onChange={handleChange} placeholder="To" style={inputStyle} />
                        <input name="distance" type="number" value={form.distance || ''} onChange={handleChange} placeholder="Distance (KM)" style={inputStyle} />
                        <input name="perKmRate" type="number" value={form.perKmRate || ''} onChange={handleChange} placeholder="Rate Per KM" style={inputStyle} />
                        <button onClick={handleSubmit} style={btnStyle}>{commonBtn} Route</button>
                    </div>
                );

            case 'user':
                return (
                    <div style={formGrid}>
                        <h4>{editingItem ? 'Edit' : 'New'} User</h4>
                        <input name="username" value={form.username || ''} onChange={handleChange} placeholder="User Name" style={inputStyle} />
                        <input name="empCode" value={form.empCode || ''} onChange={handleChange} placeholder="Employee Code" style={inputStyle} />
                        <input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email (Required for Login)" style={inputStyle} />
                        <select name="role" value={form.role || ''} onChange={handleChange} style={inputStyle}>
                            <option value="">Select Role</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                            <option value="Customer">Customer</option>
                        </select>
                        <input type="password" name="password" value={form.password || ''} onChange={handleChange} placeholder="Password" style={inputStyle} />
                        
                        <h5 style={{marginTop: 15, borderBottom: '1px solid #eee'}}>Module Permissions</h5>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5}}>
                            {allModules.map(mod => (
                                <label key={mod.id} style={{fontSize: 13, display: 'flex', alignItems: 'center'}}>
                                    <input 
                                        type="checkbox" 
                                        name="permissions" 
                                        value={mod.id} 
                                        checked={form.permissions?.includes(mod.id)} 
                                        onChange={handleChange} 
                                        style={{marginRight: 5}}
                                        // FIX: Removed 'disabled'. Now editable for everyone.
                                    />
                                    {mod.name}
                                </label>
                            ))}
                        </div>

                        <button onClick={handleSubmit} style={{...btnStyle, marginTop: 15}}>{commonBtn} User</button>
                    </div>
                );
            default: return null;
        }
    };

    const renderList = () => {
        let data = []; let keys = [];
        if (activeTab === 'customer') { data = list; keys = ['name', 'phone']; }
        if (activeTab === 'driver') { data = list; keys = ['name', 'phone']; }
        if (activeTab === 'vehicle') { data = list; keys = ['regNo', 'vehicleType']; }
        if (activeTab === 'route') { data = list; keys = ['from', 'to', 'distance']; }
        if (activeTab === 'user') { data = list; keys = ['username', 'role', 'email']; }
        
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4' }}>
                        {/* FIXED SYNTAX HERE */}
                        {keys.map(k => <th key={k} style={thStyle}>{k.toUpperCase()}</th>)}
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && <tr><td colSpan={keys.length + 1} style={{textAlign: 'center', padding: 20}}>No records.</td></tr>}
                    {data.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            {keys.map(k => <td key={k} style={tdStyle}>{item[k]}</td>)}
                            <td style={tdStyle}>
                                <button onClick={() => editItem(item)} style={editBtn}>Edit</button>
                                <button onClick={() => deleteItem(item.id)} style={deleteBtn}>Del</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Masters</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '2px solid #eee', paddingBottom: 10 }}>
                {['customer', 'driver', 'vehicle', 'route', 'user'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{ ...tabBtn, background: activeTab === t ? '#1abc9c' : '#fff', color: activeTab === t ? '#fff' : '#333' }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>{renderForm()}</div>
                <div style={{ flex: 2 }}>{renderList()}</div>
            </div>
        </div>
    );
};

// Styles
const formGrid = { background: 'white', padding: 20, borderRadius: 8, height: 'fit-content' };
const inputStyle = { width: '100%', padding: 10, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px 20px', background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: 10 };
const tabBtn = { padding: '10px 20px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' };
const labelStyle = { fontSize: 13, fontWeight: 'bold', color: '#555', display: 'block', marginTop: 5 };
const docRow = { display: 'flex', gap: 10, margin: '5px 0', alignItems: 'center' };
const thStyle = { textAlign: 'left', padding: 10, borderBottom: '2px solid #ddd' };
const tdStyle = { padding: 10, borderBottom: '1px solid #eee' };
const editBtn = { padding: '5px 10px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 5 };
const deleteBtn = { padding: '5px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };

export default Masters;