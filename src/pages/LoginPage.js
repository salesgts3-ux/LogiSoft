import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataStore from '../utils/DataStore';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (email === DataStore.SUPER_ADMIN.email && password === DataStore.SUPER_ADMIN.password) {
            DataStore.saveSession({
                userId: 'super_admin',
                username: 'Super Admin',
                role: 'Super Admin',
                companyId: null, 
                permissions: ['all'], 
                loginTime: new Date().toISOString()
            });
            return window.location.href = "/admin/super-admin"; 
        }
        return alert("Invalid Credentials. Only Super Admin allowed.");
    };

    return (
        <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5'}}>
            <div style={{background: '#fff', padding: 40, borderRadius: 8, width: 380, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                <div style={{textAlign: 'center', marginBottom: 20}}>
                    <h2 style={{margin: 0}}>🛡️</h2>
                    <h3 style={{margin: '10px 0 5px'}}>Super Admin Portal</h3>
                    <p style={{color: '#666', fontSize: 14}}>Login to manage Trimax Global SaaS</p>
                </div>

                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Super Admin Email" 
                    style={{width: '100%', padding: 12, marginBottom: 10, borderRadius: 4, border: '1px solid #ddd'}} 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                    style={{width: '100%', padding: 12, marginBottom: 15, borderRadius: 4, border: '1px solid #ddd'}} 
                />

                <button onClick={handleLogin} style={{width: '100%', padding: 12, background: '#2c3e50', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer'}}>
                    Login as Super Admin
                </button>
                <Link to="/" style={{display: 'block', textAlign: 'center', marginTop: 15, color: '#666', fontSize: 13}}>Back to Home</Link>
            </div>
        </div>
    );
};

export default LoginPage;