import React from 'react';
import { Link } from 'react-router-dom';

const LoginSelectionPage = () => {
    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1>Welcome to Trimax Global</h1>
                <p>Select your login portal</p>
            </div>

            <div style={cardContainer}>
                {/* Admin / Super User */}
                <Link to="/admin-login" style={cardLink}>
                    <div style={iconCircle}>🛡️</div>
                    <h2>Admin Login</h2>
                    <p style={{opacity: 0.9}}>Only For Super User</p>
                    <div style={linkStyle}>Go to Portal →</div>
                </Link>

                {/* Customer / Company */}
                <Link to="/customer-login" style={{...cardLink, background: '#3498db'}}>
                    <div style={iconCircle}>🚚</div>
                    <h2>Customer Login</h2>
                    <p style={{opacity: 0.9}}>Login to Manage Fleet shipments & operations.</p>
                    <div style={linkStyle}>Go to Portal →</div>
                </Link>
            </div>
        </div>
    );
};

// Styles
const containerStyle = { minHeight: '100vh', background: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 };
const headerStyle = { textAlign: 'center', marginBottom: 40 };
const cardContainer = { display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' };
const cardLink = { 
    width: 320, height: 380, background: '#2c3e50', color: '#fff', 
    textDecoration: 'none', borderRadius: 12, display: 'flex', 
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.1)'
};
const iconCircle = { width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20 };
const linkStyle = { marginTop: 30, fontSize: 14, opacity: 0.8 };

export default LoginSelectionPage;