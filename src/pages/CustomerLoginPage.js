import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DataStore from '../utils/DataStore';

const LogiSoftLogo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
        <svg width="60" height="60" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="45" height="45" rx="8" fill="#3498db"/>
            <path d="M10 22.5L20 12.5V32.5L10 22.5Z" fill="white"/>
            <path d="M35 22.5L25 12.5V32.5L35 22.5Z" fill="white" fillOpacity="0.7"/>
        </svg>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#2c3e50', letterSpacing: '-1px' }}>LogiSoft</span>
            <br/>
            <span style={{ fontSize: 11, color: '#7f8c8d', letterSpacing: 2, textTransform: 'uppercase' }}>Fleet Management</span>
        </div>
    </div>
);

const CustomerLoginPage = () => {
    const [companyCode, setCompanyCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if(!companyCode || !username || !password) return alert("All fields are required");

        const company = DataStore.getCompanyByCode(companyCode);
        
        if (!company) return alert("Invalid Company Code");
        if (company.status === 'Inactive') return alert("Company Account Disabled.");

        const users = DataStore.getUsers(String(company.id));
        
        const user = users.find(u => {
            const isUserMatch = (u.username === username || u.email === username);
            const isPassMatch = u.password === password;
            const isRoleAllowed = (u.role === 'Admin' || u.role === 'Staff' || u.role === 'Customer');
            return isUserMatch && isPassMatch && isRoleAllowed;
        });

        if (!user) return alert("User not found or Incorrect Password");

        // FIX: Added 'userId' to match the check in App.js
        DataStore.saveSession({
            userId: user.id, 
            id: user.id,
            name: user.username,
            role: user.role,
            companyId: String(company.id),
            companyName: company.name,
            permissions: user.permissions || [],
            loginTime: new Date().toISOString()
        });

        // Redirect Logic
        if (user.role === 'Admin' || user.role === 'Staff') {
            window.location.href = "/admin/dashboard";
        } else {
            window.location.href = "/customer-dashboard";
        }
    };

    return (
        <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
            <div style={{background: '#fff', width: '100%', maxWidth: '450px', padding: '50px', borderRadius: 16, boxShadow: '0 15px 35px rgba(0,0,0,0.1)'}}>
                <LogiSoftLogo />
                
                <h2 style={{textAlign: 'center', marginTop: 0, marginBottom: 5}}>Customer Portal</h2>
                <p style={{color: '#95a5a6', marginBottom: 30, fontSize: 15, textAlign: 'center'}}>
                    Login to Manage Fleet shipments & operations.
                </p>
                
                <div style={{marginBottom: 20}}>
                    <label style={{display: 'block', marginBottom: 6, fontSize: 12, fontWeight: '600', color: '#7f8c8d', textTransform: 'uppercase'}}>Company Code</label>
                    <input placeholder="Enter Company Code" value={companyCode} onChange={(e) => setCompanyCode(e.target.value.toUpperCase())} style={{width: '100%', padding: '14px 16px', border: '2px solid #ecf0f1', borderRadius: 8, fontSize: 15, boxSizing: 'border-box', outline: 'none'}} />
                </div>

                <div style={{marginBottom: 20}}>
                    <label style={{display: 'block', marginBottom: 6, fontSize: 12, fontWeight: '600', color: '#7f8c8d', textTransform: 'uppercase'}}>Username / Email</label>
                    <input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} style={{width: '100%', padding: '14px 16px', border: '2px solid #ecf0f1', borderRadius: 8, fontSize: 15, boxSizing: 'border-box', outline: 'none'}} />
                </div>

                <div style={{marginBottom: 25}}>
                    <label style={{display: 'block', marginBottom: 6, fontSize: 12, fontWeight: '600', color: '#7f8c8d', textTransform: 'uppercase'}}>Password</label>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={{width: '100%', padding: '14px 16px', border: '2px solid #ecf0f1', borderRadius: 8, fontSize: 15, boxSizing: 'border-box', outline: 'none'}} />
                </div>

                <button onClick={handleLogin} style={{width: '100%', padding: '14px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer'}}>Login</button>
                
                <div style={{ textAlign: 'center', marginTop: 25 }}>
                    <Link to="/" style={{ color: '#7f8c8d', fontSize: 14, textDecoration: 'none' }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default CustomerLoginPage;