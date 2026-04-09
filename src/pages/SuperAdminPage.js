import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const SuperAdminPage = () => {
    const [companies, setCompanies] = useState([]);
    const [form, setForm] = useState({ name: '', code: '', adminEmail: '', adminPassword: '' });
    const [editingCompany, setEditingCompany] = useState(null);
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'backup'
    const [selectedBackups, setSelectedBackups] = useState([]);

    useEffect(() => { loadCompanies(); }, []);

    const loadCompanies = () => setCompanies(DataStore.getCompanies());

    const handleSaveCompany = () => {
        if(!form.name || !form.adminEmail) return alert("Company Name and Admin Email are required");
        if (!editingCompany && !form.code) return alert("Company Code is required for new companies");

        if (editingCompany) {
            DataStore.updateCompany({ ...editingCompany, name: form.name, code: form.code || editingCompany.code });
            const users = DataStore.getUsers(); // Get ALL users (super admin context)
            const adminUser = users.find(u => u.companyId === editingCompany.id && u.role === 'Admin');
            if (adminUser) {
                adminUser.username = form.adminEmail.split('@')[0]; 
                adminUser.email = form.adminEmail;
                if (form.adminPassword) adminUser.password = form.adminPassword;
                DataStore.updateUser(adminUser);
            }
            alert('Company Updated');
        } else {
            const newCompany = { id: Date.now(), name: form.name, code: form.code, status: 'Active', createdAt: new Date().toLocaleString() };
            DataStore.saveCompany(newCompany);
            DataStore.saveUser({
                username: form.adminEmail.split('@')[0], email: form.adminEmail, password: form.adminPassword || '123456',
                role: 'Admin', companyId: newCompany.id,
                permissions: ['dashboard', 'masters', 'booking', 'billing', 'reports']
            });
            alert('Company Created');
        }
        setForm({ name: '', code: '', adminEmail: '', adminPassword: '' });
        setEditingCompany(null);
        loadCompanies();
    };

    const editCompany = (company) => {
        setEditingCompany(company);
        setForm({ name: company.name, code: company.code || '', adminEmail: '', adminPassword: '' });
        setActiveTab('manage'); // Switch back to manage tab
    };

    const toggleStatus = (company) => {
        DataStore.updateCompany({ ...company, status: company.status === 'Active' ? 'Inactive' : 'Active' });
        loadCompanies();
    };

    const deleteCompany = (id) => {
        if(window.confirm("DELETE COMPANY? This will remove all associated data.")){
            DataStore.deleteCompany(id);
            // Ideally delete associated users too
            const users = DataStore.getUsers(); // Gets all users for Super Admin
            users.filter(u => u.companyId === id).forEach(u => DataStore.deleteUser(u.id));
            loadCompanies();
        }
    };

    // --- Backup Logic ---
    const toggleBackupSelection = (id) => {
        if (selectedBackups.includes(id)) setSelectedBackups(selectedBackups.filter(i => i !== id));
        else setSelectedBackups([...selectedBackups, id]);
    };

    const selectAllBackups = () => {
        if (selectedBackups.length === companies.length) setSelectedBackups([]);
        else setSelectedBackups(companies.map(c => c.id));
    };

    const downloadBackup = () => {
        if (selectedBackups.length === 0) return alert("Select at least one company");
        
        const fullBackup = { version: "LogiSoft_SaaS_v1", exportedAt: new Date().toLocaleString(), companies: [] };
        
        selectedBackups.forEach(cid => {
            const compData = DataStore.getBackupForCompany(cid);
            const info = companies.find(c => c.id === cid);
            fullBackup.companies.push({ info: info, data: compData });
        });

        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LogiSoft_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);
                if (!backup.companies) return alert("Invalid backup file");
                
                if(window.confirm("This will OVERWRITE data for the companies in this file. Continue?")){
                    backup.companies.forEach(comp => {
                        const targetId = comp.info.id; // Restore to original ID
                        DataStore.restoreBackupForCompany(comp.data, targetId);
                        // Restore Company Info
                        DataStore.saveCompany(comp.info);
                    });
                    alert('Restore Successful! Refreshing...');
                    window.location.reload();
                }
            } catch (err) { alert("Error reading file"); }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Super Admin Dashboard</h2>
            
            {/* Tabs */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => setActiveTab('manage')} style={activeTab === 'manage' ? activeTabBtn : tabBtn}>Manage Companies</button>
                <button onClick={() => setActiveTab('backup')} style={activeTab === 'backup' ? activeTabBtn : tabBtn}>Backup & Restore</button>
            </div>

            {activeTab === 'backup' ? (
                <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h3>SaaS Backup Manager</h3>
                    <p>Select companies to include in the backup file. This includes all data and settings.</p>
                    
                    <div style={{ margin: '20px 0', display: 'flex', gap: 10 }}>
                        <button onClick={selectAllBackups} style={btnStyle}>{selectedBackups.length === companies.length ? 'Deselect All' : 'Select All'}</button>
                        <button onClick={downloadBackup} style={{...btnStyle, background: '#27ae60'}}>Download Backup ({selectedBackups.length} selected)</button>
                        <label style={{...btnStyle, background: '#e67e22', display: 'inline-block', position: 'relative', cursor: 'pointer'}}>
                            Restore Backup
                            <input type="file" accept=".json" onChange={handleRestore} style={{ position: 'absolute', opacity: 0, top:0, left:0, width:'100%', height:'100%', cursor:'pointer' }} />
                        </label>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{background: '#f4f4f4'}}>
                                <th style={th}><input type="checkbox" checked={selectedBackups.length === companies.length} onChange={selectAllBackups} /></th>
                                <th style={th}>Company Name</th>
                                <th style={th}>Code</th>
                                <th style={th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(c => (
                                <tr key={c.id}>
                                    <td style={td}><input type="checkbox" checked={selectedBackups.includes(c.id)} onChange={() => toggleBackupSelection(c.id)} /></td>
                                    <td style={td}>{c.name}</td>
                                    <td style={td}>{c.code}</td>
                                    <td style={td}>{c.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Manage Companies UI (Existing)
                <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                    <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8 }}>
                        <h4>{editingCompany ? 'Edit' : 'Add New'} Company</h4>
                        <input placeholder="Company Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
                        <input placeholder="Company Code" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} style={inputStyle} disabled={editingCompany} />
                        <small style={{color: '#666', display: 'block', marginBottom: 10, marginTop: -5}}>Customers will use this code to login.</small>
                        <input placeholder="Admin Email" value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} style={inputStyle} />
                        <input placeholder="Password" type="password" value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} style={inputStyle} />
                        <button onClick={handleSaveCompany} style={btnStyle}>{editingCompany ? 'Update' : 'Create'}</button>
                        {editingCompany && <button onClick={() => { setEditingCompany(null); setForm({}); }} style={{...btnStyle, background: '#ccc'}}>Cancel</button>}
                    </div>

                    <div style={{ flex: 2, background: '#fff', padding: 20, borderRadius: 8 }}>
                        <h4>Registered Companies</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{background: '#f4f4f4'}}><th style={th}>Name</th><th style={th}>Code</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
                            <tbody>
                                {companies.map(c => (
                                    <tr key={c.id}>
                                        <td style={td}>{c.name}</td>
                                        <td style={td}><strong>{c.code}</strong></td>
                                        <td style={td}><span style={c.status === 'Active' ? badgeGreen : badgeRed}>{c.status}</span></td>
                                        <td style={td}>
                                            <button onClick={() => editCompany(c)} style={editBtn}>Edit</button>
                                            <button onClick={() => toggleStatus(c)} style={c.status === 'Active' ? disableBtn : enableBtn}>{c.status === 'Active' ? 'Disable' : 'Enable'}</button>
                                            <button onClick={() => deleteCompany(c.id)} style={deleteBtn}>Delete</button>
                                        </td>
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
const inputStyle = { width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginTop: 5 };
const tabBtn = { padding: '10px 20px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', borderRadius: '4px 4px 0 0', marginRight: 5 };
const activeTabBtn = { ...tabBtn, background: '#2c3e50', color: '#fff', border: '1px solid #2c3e50' };
const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #eee' };
const td = { padding: 10, borderBottom: '1px solid #eee' };
const editBtn = { padding: '5px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 3 };
const disableBtn = { padding: '5px 10px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 3 };
const enableBtn = { padding: '5px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 3 };
const deleteBtn = { padding: '5px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const badgeGreen = { padding: '3px 8px', background: '#e8f8f5', color: 'green', borderRadius: 10, fontSize: 12 };
const badgeRed = { padding: '3px 8px', background: '#fdedec', color: 'red', borderRadius: 10, fontSize: 12 };

export default SuperAdminPage;