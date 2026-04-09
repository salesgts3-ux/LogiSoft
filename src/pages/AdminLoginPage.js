import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const LoginPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => { setUsers(DataStore.getUsers() || []); }, []);

    const handleLogin = () => {
        if (!selectedUser) return alert("Please select a user");
        const user = users.find(u => String(u.id) === selectedUser);
        
        // Check password (if set)
        if (user.password && user.password !== password) return alert("Incorrect Password");

        // Save Session WITH Permissions
        DataStore.saveSession({
            userId: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions || [], // Load permissions
            loginTime: new Date().toISOString()
        });

        window.location.reload();
    };

    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h2 style={{textAlign: 'center', marginBottom: 20}}>Vicky Transport</h2>
                <label style={labelStyle}>Select User</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={inputStyle}>
                    <option value="">-- Select User --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                </select>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" style={inputStyle} />
                <button onClick={handleLogin} style={btnStyle}>Login</button>
            </div>
        </div>
    );
};
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' };
const boxStyle = { background: '#fff', padding: 40, borderRadius: 8, width: 350, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: 10, margin: '5px 0 15px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: 12, background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 };
const labelStyle = { fontWeight: 'bold', fontSize: 14, color: '#555' };
export default LoginPage;