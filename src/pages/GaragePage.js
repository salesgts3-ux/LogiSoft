import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const GaragePage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [repairs, setRepairs] = useState([]);
    const [form, setForm] = useState({ 
        vehicle: '', type: 'General Service', cost: 0, status: 'Open', vendor: '', partsUsed: [], remark: '' 
    });
    const [editingId, setEditingId] = useState(null); 
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        setVehicles(DataStore.getVehicles() || []);
        setInventory(DataStore.getInventory() || []);
        setRepairs(DataStore.getRepairs() || []);
    };

    // Stats
    const totalVehicles = vehicles.length;
    const breakdownCount = repairs.filter(r => r.type === 'Breakdown' && r.status !== 'Closed').length;
    const underRepairCount = repairs.filter(r => r.status === 'In Progress').length;
    const totalExpense = repairs.reduce((sum, r) => sum + parseFloat(r.cost || 0), 0);

    const handleSubmit = () => {
        if(!form.vehicle) return alert("Please select a vehicle");

        if (editingId) {
            DataStore.updateRepair({ ...form, id: editingId });
            alert('Repair Updated!');
        } else {
            if (form.partsUsed && form.partsUsed.length > 0) {
                form.partsUsed.forEach(p => {
                    const item = inventory.find(i => i.id == p.id);
                    if (item) {
                        item.qty = item.qty - p.qty;
                        DataStore.updateInventory(item);
                    }
                });
            }
            DataStore.saveRepair({ ...form, date: new Date().toLocaleString() });
            alert('Repair Logged Successfully!');
        }
        
        resetForm();
        loadData();
    };

    const resetForm = () => {
        setForm({ vehicle: '', type: 'General Service', cost: 0, status: 'Open', vendor: '', partsUsed: [], remark: '' });
        setEditingId(null);
    };

    // --- Status Change with Timestamps & Remarks ---
    const handleStatusChange = (repair, newStatus) => {
        const remark = prompt(`Enter Remark for changing status to ${newStatus}:`);
        if (remark === null) return; // Cancelled

        let updateData = { 
            ...repair, 
            status: newStatus, 
            remark: remark 
        };

        // Capture Start Time
        if (newStatus === 'In Progress') {
            updateData.workStartTime = new Date().toISOString();
        }

        // Capture End Time and Calculate Duration
        if (newStatus === 'Closed' && repair.workStartTime) {
            const endTime = new Date();
            const startTime = new Date(repair.workStartTime);
            const diffMs = (endTime - startTime);
            const diffHrs = Math.floor(diffMs / 3600000); // hours
            const diffMins = Math.round((diffMs % 3600000) / 60000); // minutes
            updateData.turnaroundTime = `${diffHrs}h ${diffMins}m`;
            updateData.workEndTime = endTime.toISOString();
        }

        DataStore.updateRepair(updateData);
        loadData();
        alert('Status Updated');
    };

    const handleEdit = (repair) => {
        setForm(repair);
        setEditingId(repair.id);
    };

    const openInventoryModal = () => setShowModal(true);
    
    const selectPart = (item) => {
        const qty = prompt(`Enter quantity for ${item.name} (Available: ${item.qty}):`);
        if (qty) {
            if (parseInt(qty) > item.qty) return alert(`Insufficient Stock!`);
            const currentParts = form.partsUsed || [];
            currentParts.push({ id: item.id, name: item.name, qty: parseInt(qty), rate: item.price || 0 });
            setForm({...form, partsUsed: currentParts});
            setShowModal(false);
        }
    };

    const removePart = (index) => {
        const currentParts = [...form.partsUsed];
        currentParts.splice(index, 1);
        setForm({...form, partsUsed: currentParts});
    };

    const getVehicleDisplay = (vehId) => {
        const v = vehicles.find(x => x.id == vehId);
        return v ? (v.regNo || v.vehicleNo) : 'N/A';
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Fleet Garage & Maintenance</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
                <div style={statCard}><h3>{totalVehicles}</h3><p>Total Fleet</p></div>
                <div style={{...statCard, borderLeft: '5px solid #e74c3c'}}><h3>{breakdownCount}</h3><p>Breakdowns</p></div>
                <div style={{...statCard, borderLeft: '5px solid #f1c40f'}}><h3>{underRepairCount}</h3><p>Under Repair</p></div>
                <div style={{...statCard, borderLeft: '5px solid #27ae60'}}><h3>₹ {totalExpense}</h3><p>Total Expense</p></div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
                {/* Form Section */}
                <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8, height: 'fit-content' }}>
                    <h4>{editingId ? 'Edit Repair Status' : 'Log New Repair'}</h4>
                    
                    <label style={labelStyle}>Select Vehicle</label>
                    <select onChange={e => setForm({...form, vehicle: e.target.value})} style={inputStyle} value={form.vehicle || ''} disabled={editingId ? true : false}>
                        <option value="">Select Vehicle</option>
                        {vehicles.map(v => ( <option key={v.id} value={v.id}>{v.regNo || v.vehicleNo}</option> ))}
                    </select>

                    <label style={labelStyle}>Type of Work</label>
                    <select onChange={e => setForm({...form, type: e.target.value})} style={inputStyle} value={form.type || ''}>
                        <option>General Service</option>
                        <option>Breakdown</option>
                        <option>Accident Repair</option>
                        <option>Tyre Change</option>
                    </select>

                    <label style={labelStyle}>Status</label>
                    <select onChange={e => setForm({...form, status: e.target.value})} style={inputStyle} value={form.status || ''}>
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Closed</option>
                    </select>

                    <label style={labelStyle}>Cost (₹)</label>
                    <input type="number" value={form.cost || ''} onChange={e => setForm({...form, cost: e.target.value})} style={inputStyle} />
                    
                    <label style={labelStyle}>Remarks</label>
                    <textarea placeholder="Enter details or remarks..." value={form.remark || ''} onChange={e => setForm({...form, remark: e.target.value})} style={{...inputStyle, height: 60}} />
                    
                    {!editingId && (
                        <>
                            <label style={labelStyle}>Vendor (If External)</label>
                            <input placeholder="External Vendor Name" value={form.vendor || ''} onChange={e => setForm({...form, vendor: e.target.value})} style={inputStyle} />
                            <button onClick={openInventoryModal} style={{...btnStyle, marginTop: 15, background: '#7f8c8d'}}>+ Add Material from Stock</button>
                            <div style={{ marginTop: 5 }}>
                                {form.partsUsed && form.partsUsed.map((p, i) => (
                                    <div key={i} style={partRow}>
                                        <span>{p.name} (x{p.qty})</span>
                                        <button onClick={() => removePart(i)} style={removeBtn}>X</button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <button onClick={handleSubmit} style={{...btnStyle, marginTop: 20, background: editingId ? '#f39c12' : '#1abc9c'}}>
                        {editingId ? 'Update Record' : 'Save Record'}
                    </button>
                    {editingId && ( <button onClick={resetForm} style={{...btnStyle, marginTop: 5, background: '#95a5a6'}}>Cancel Edit</button> )}
                </div>

                {/* List Section */}
                <div style={{ flex: 2, background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h4>Maintenance History</h4>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={th}>Date</th>
                                <th style={th}>Vehicle</th>
                                <th style={th}>Type</th>
                                <th style={th}>TAT</th>
                                <th style={th}>Status</th>
                                <th style={th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairs.length === 0 && ( <tr><td colSpan="6" style={{textAlign: 'center'}}>No repairs logged.</td></tr> )}
                            {repairs.map(r => (
                                <tr key={r.id}>
                                    <td style={td}>{r.date}</td>
                                    <td style={td}>{getVehicleDisplay(r.vehicle)}</td>
                                    <td style={td}>{r.type}</td>
                                    <td style={td}><span style={{color: '#666', fontSize: 12}}>{r.turnaroundTime || '-'}</span></td>
                                    <td style={td}>
                                        <span style={r.status === 'Closed' ? badgeGreen : (r.status === 'In Progress' ? badgeBlue : badgeOrange)}>{r.status}</span>
                                        {r.remark && <small style={{display: 'block', color: '#888', fontSize: 10}}>"{r.remark}"</small>}
                                    </td>
                                    <td style={td}>
                                        {r.status === 'Open' && ( <button onClick={() => handleStatusChange(r, 'In Progress')} style={actionBtnBlue}>Start Work</button> )}
                                        {r.status === 'In Progress' && ( <button onClick={() => handleStatusChange(r, 'Closed')} style={actionBtnGreen}>Close/Fix</button> )}
                                        {r.status === 'Closed' && ( <span style={{color: '#aaa', fontSize: 12}}>Completed</span> )}
                                        <button onClick={() => handleEdit(r)} style={editBtn}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inventory Modal */}
            {showModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3>Select Material</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>X</button>
                        </div>
                        <table style={{ width: '100%' }}>
                            <thead><tr><th style={th}>Item</th><th style={th}>Qty</th><th style={th}>Action</th></tr></thead>
                            <tbody>
                                {inventory.map(item => (
                                    <tr key={item.id}>
                                        <td style={td}>{item.name}</td>
                                        <td style={td}>{item.qty}</td>
                                        <td style={td}><button onClick={() => selectPart(item)} style={selectBtn} disabled={item.qty <= 0}>Select</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const inputStyle = { width: '100%', padding: 8, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: 10, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #eee' };
const td = { padding: 10, borderBottom: '1px solid #eee', verticalAlign: 'top' };
const statCard = { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const labelStyle = { fontSize: 12, fontWeight: 'bold', color: '#555', display: 'block', marginTop: 5 };
const partRow = { display: 'flex', justifyContent: 'space-between', background: '#f9f9f9', padding: '5px 10px', marginBottom: 2, borderRadius: 4 };
const removeBtn = { background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '2px 8px' };
const editBtn = { padding: '5px 10px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 5 };
const actionBtnBlue = { padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const actionBtnGreen = { padding: '5px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const badgeGreen = { background: '#e8f8f5', color: 'green', padding: '3px 8px', borderRadius: 10, fontSize: 11 };
const badgeBlue = { background: '#e3f2fd', color: '#3498db', padding: '3px 8px', borderRadius: 10, fontSize: 11 };
const badgeOrange = { background: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: 10, fontSize: 11 };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: 30, borderRadius: 8, width: 600, maxHeight: '80vh', overflowY: 'auto' };
const selectBtn = { padding: '5px 10px', background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };

export default GaragePage;