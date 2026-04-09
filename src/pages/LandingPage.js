import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DataStore from '../utils/DataStore';

// --- CUSTOM LOGO COMPONENT ---
const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0L37.3205 10V30L20 40L2.67949 30V10L20 0Z" fill="#1abc9c"/>
            <path d="M20 8L29.5263 22H10.4737L20 8Z" fill="white"/>
            <path d="M20 32L10.4737 18H29.5263L20 32Z" fill="white"/>
        </svg>
        <div style={{ lineHeight: 1, textAlign: 'left' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#2c3e50', letterSpacing: '-0.5px' }}>TRIMAX GLOBAL</span>
            <br />
            <span style={{ fontSize: 10, color: '#7f8c8d', fontWeight: 600, letterSpacing: 1 }}>VENTURE LLP</span>
        </div>
    </div>
);

const LandingPage = () => {
    const [activePage, setActivePage] = useState('home');
    // Updated State with new fields
    const [ticketForm, setTicketForm] = useState({ 
        category: 'Support', 
        name: '', 
        company: '', 
        phone: '', 
        email: '', 
        subject: '', 
        message: '' 
    });

    const handleTicketSubmit = (e) => {
        e.preventDefault();
        if(!ticketForm.name || !ticketForm.message || !ticketForm.email) return alert("Please fill Name, Email, and Message");

        // Save to LocalStorage for internal record
        DataStore.saveTicket({ 
            ...ticketForm, 
            status: 'Open', 
            date: new Date().toLocaleString() 
        });

        // --- EMAIL SENDING LOGIC ---
        // Constructs a mailto link to open the user's email client
        const subject = `Ticket: [${ticketForm.category}] - ${ticketForm.subject || 'General Inquiry'}`;
        const body = `
Hello Trimax Global Team,

%0A%0A
--- Customer Details ---%0A
Name: ${ticketForm.name}%0A
Company: ${ticketForm.company}%0A
Phone: ${ticketForm.phone}%0A
Email: ${ticketForm.email}%0A
%0A
--- Message ---%0A
 ${ticketForm.message}
        `;
        
        window.location.href = `mailto:info@trimaxglobal.com?subject=${subject}&body=${body}`;
        
        alert('Your email client will now open. Please send the email to complete your request.');
        // Reset form
        setTicketForm({ category: 'Support', name: '', company: '', phone: '', email: '', subject: '', message: '' });
    };

    const services = [
        "Information Technology", "Application Development", "Website Development", 
        "Manpower Services", "IT Consultancy", "Artificial Intelligence", 
        "Server Admin", "Network Security", "Cloud Solutions"
    ];

    const renderContent = () => {
        switch(activePage) {
            case 'home':
                return (
                    <div style={heroStyle}>
                        <div style={floatingTagsContainer}>
                            {services.map((service, idx) => (
                                <span key={idx} style={{ ...floatingTag, top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%`, animationDelay: `${idx * 0.5}s`, opacity: 0.15 }}>
                                    {service}
                                </span>
                            ))}
                        </div>
                        <div style={overlayStyle}>
                            <h1 style={h1Style}>Welcome to Trimax Global</h1>
                            <p style={pStyle}>Empowering Business through Technology & Manpower</p>
                            <div style={{marginTop: 30, display: 'flex', gap: 15, justifyContent: 'center'}}>
                                <Link to="/login-selection" style={ctaBtnPrimary}>Access Portal</Link>
                                <button onClick={() => setActivePage('products')} style={ctaBtnSecondary}>Our Services</button>
                            </div>
                        </div>
                    </div>
                );
            case 'products':
                return (
                    <div style={sectionStyle}>
                        <div style={sectionHeader}>
                            <h2>Our Products & Services</h2>
                            <p>Comprehensive solutions tailored for your enterprise needs.</p>
                        </div>
                        <div style={serviceGrid}>
                            <h3 style={gridTitle}>TRIMAX Global IT Consultancy Service</h3>
                            <div style={gridContainer}>
                                <div style={productCard}>
                                    <div style={iconBox}>💻</div>
                                    <h4>FMS Service</h4>
                                    <p>Integrated Facility Management Systems for streamlined operations.</p>
                                </div>
                                <div style={productCard}>
                                    <div style={iconBox}>📹</div>
                                    <h4>CCTV Surveillance</h4>
                                    <p>Advanced security monitoring & management systems.</p>
                                </div>
                                <div style={productCard}>
                                    <div style={iconBox}>🖥️</div>
                                    <h4>Server Administration</h4>
                                    <p>Robust server management ensuring high availability.</p>
                                </div>
                                <div style={productCard}>
                                    <div style={iconBox}>🌐</div>
                                    <h4>Network Administration</h4>
                                    <p>Secure, fast, and reliable network infrastructure setup.</p>
                                </div>
                            </div>
                        </div>
                        <div style={serviceGrid}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                                <h3 style={gridTitle}>TRIMAX Global Corporate Manpower</h3>
                            </div>
                            <p style={{color: '#555', marginBottom: 20, maxWidth: 600}}>
                                We provide skilled and professional manpower solutions tailored for corporate needs. 
                            </p>
                            <div style={gridContainer}>
                                <div style={productCardHighlight}>
                                    <h4>LogiSoft Pro</h4>
                                    <p>Complete Transport Management System for Fleet Owners.</p>
                                </div>
                                <div style={productCardHighlight}>
                                    <h4>App & Web Development</h4>
                                    <p>Custom software solutions to digitize your business processes.</p>
                                </div>
                                <div style={productCardHighlight}>
                                    <h4>AI & Analytics</h4>
                                    <p>Data-driven insights and AI integration for smarter decisions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'about':
                return (
                    <div style={sectionStyle}>
                        <div style={sectionHeader}>
                            <h2>About Us</h2>
                            <p>Driving Innovation, Delivering Excellence</p>
                        </div>
                        <div style={aboutContainer}>
                            <div style={aboutText}>
                                <p><strong style={{fontSize: 20, color: '#1abc9c'}}>Trimax Global Venture LLP</strong> is a premier technology solutions provider specializing in the logistics and transportation sector.</p>
                                <br/>
                                <p>We empower businesses with tools to manage vehicles, drivers, and freight efficiently. Our mission is to reduce operational costs and increase transparency for transporters across the nation.</p>
                                <br/>
                                <p>We believe in a future where technology bridges the gap between manpower and efficiency. Our diverse portfolio includes IT Consultancy, Manpower Services, and bespoke Software Development.</p>
                            </div>
                            <div style={aboutStats}>
                                <div style={statBox}><h2>100+</h2><p>Clients Worldwide</p></div>
                                <div style={statBox}><h2>24/7</h2><p>Support Available</p></div>
                            </div>
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div style={sectionStyle}>
                        <div style={sectionHeader}><h2>Contact Us</h2></div>
                        <div style={contactContainer}>
                            <div style={contactInfo}>
                                <p><strong>Address:</strong> 123 Business Park, Tech City, IN</p>
                                <p><strong>Email:</strong> support@trimaxglobal.com</p>
                                <p><strong>Phone:</strong> +91-9876543210</p>
                            </div>
                        </div>
                    </div>
                );
            case 'ticket':
                return (
                    <div style={ticketSectionStyle}>
                        <div style={ticketFormContainer}>
                            <Logo />
                            <h2 style={{textAlign: 'center', marginBottom: 5, color: '#2c3e50'}}>Support Center</h2>
                            <p style={{textAlign: 'center', color: '#666', marginBottom: 30}}>Submit your query to info@trimaxglobal.com</p>

                            <form onSubmit={handleTicketSubmit}>
                                {/* Category Radio Buttons */}
                                <div style={radioGroup}>
                                    <label style={radioLabel}>
                                        <input type="radio" name="category" value="Sales" checked={ticketForm.category === 'Sales'} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} />
                                        Sales
                                    </label>
                                    <label style={radioLabel}>
                                        <input type="radio" name="category" value="Service" checked={ticketForm.category === 'Service'} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} />
                                        Service
                                    </label>
                                    <label style={radioLabel}>
                                        <input type="radio" name="category" value="Support" checked={ticketForm.category === 'Support'} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} />
                                        Support
                                    </label>
                                </div>

                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15}}>
                                    <input style={inputStyle} placeholder="Your Name *" value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} required />
                                    <input style={inputStyle} placeholder="Company Name" value={ticketForm.company} onChange={e => setTicketForm({...ticketForm, company: e.target.value})} />
                                </div>

                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15}}>
                                    <input style={inputStyle} placeholder="Email Address *" type="email" value={ticketForm.email} onChange={e => setTicketForm({...ticketForm, email: e.target.value})} required />
                                    <input style={inputStyle} placeholder="Contact Number" value={ticketForm.phone} onChange={e => setTicketForm({...ticketForm, phone: e.target.value})} />
                                </div>

                                <input style={inputStyle} placeholder="Subject *" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} required />
                                
                                <textarea 
                                    style={{...inputStyle, height: 120}} 
                                    placeholder="Describe your issue or query..." 
                                    value={ticketForm.message} 
                                    onChange={e => setTicketForm({...ticketForm, message: e.target.value})} 
                                    required 
                                />

                                <button type="submit" style={submitBtn}>Submit Ticket</button>
                            </form>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div style={containerStyle}>
            <nav style={navStyle}>
                <div onClick={() => setActivePage('home')}><Logo /></div>
                <div style={navLinksStyle}>
                    {['home', 'products', 'about', 'contact', 'ticket'].map(page => (
                        <button key={page} onClick={() => setActivePage(page)} style={navBtnStyle}>{page.toUpperCase()}</button>
                    ))}
                    <Link to="/login-selection" style={loginBtnStyle}>LOGIN</Link>
                </div>
            </nav>
            {renderContent()}
            <footer style={footerStyle}>
                &copy; {new Date().getFullYear()} Trimax Global Venture LLP. All Rights Reserved.
            </footer>
        </div>
    );
};

// --- STYLES ---
const containerStyle = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f8' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 };
const navLinksStyle = { display: 'flex', gap: 15, alignItems: 'center' };
const navBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: '#555', fontSize: 14, padding: '8px 15px', transition: '0.3s' };
const loginBtnStyle = { background: '#1abc9c', color: '#fff', padding: '10px 25px', textDecoration: 'none', borderRadius: 25, fontWeight: 'bold', fontSize: 14, boxShadow: '0 4px 6px rgba(26, 188, 156, 0.3)' };

const heroStyle = { flex: 1, background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', minHeight: '90vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const floatingTagsContainer = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 };
const floatingTag = { position: 'absolute', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '5px 15px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', animation: 'float 10s infinite' };
const overlayStyle = { position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '900px', padding: '0 20px' };
const h1Style = { fontSize: 64, marginBottom: 15, color: '#fff', letterSpacing: '-1px', fontWeight: 800 };
const pStyle = { fontSize: 24, color: '#1abc9c', marginBottom: 30, fontWeight: 500 };
const ctaBtnPrimary = { display: 'inline-block', background: '#e74c3c', color: '#fff', padding: '15px 45px', textDecoration: 'none', borderRadius: 30, fontWeight: 'bold', fontSize: 18, boxShadow: '0 10px 20px rgba(231, 76, 60, 0.4)', transition: 'transform 0.2s', border: 'none', cursor: 'pointer' };
const ctaBtnSecondary = { display: 'inline-block', background: 'transparent', color: '#fff', padding: '15px 45px', textDecoration: 'none', borderRadius: 30, fontWeight: 'bold', fontSize: 18, border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' };

const sectionStyle = { 
    flex: 1, 
    padding: '80px 50px', 
    textAlign: 'center', 
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center' // Centers the grid horizontally
};
const sectionHeader = { textAlign: 'center', marginBottom: 60 };
const gridTitle = { color: '#2c3e50', marginBottom: 20, fontSize: 24, borderBottom: '3px solid #1abc9c', display: 'inline-block', paddingBottom: 10 };
const serviceGrid = { marginBottom: 80 };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 };
const productCard = { background: '#f8f9fa', padding: 30, borderRadius: 15, transition: '0.3s', border: '1px solid #eee' };
const productCardHighlight = { background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', padding: 30, borderRadius: 15, boxShadow: '0 10px 20px rgba(0,0,0,0.05)', borderLeft: '5px solid #1abc9c' };
const iconBox = { width: 60, height: 60, background: '#e8f8f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, fontSize: 28 };

const aboutContainer = { display: 'flex', gap: 50, maxWidth: 1100, margin: '0 auto', alignItems: 'center' };
const aboutText = { flex: 2, textAlign: 'left', lineHeight: 1.8, color: '#555' };
const aboutStats = { flex: 1, display: 'flex', flexDirection: 'column', gap: 20 };
const statBox = { background: '#1abc9c', color: '#fff', padding: 30, borderRadius: 10, textAlign: 'center' };

const contactContainer = { maxWidth: 600, margin: '0 auto', textAlign: 'left', background: '#f8f9fa', padding: 50, borderRadius: 15, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' };
const contactInfo = { lineHeight: 2, fontSize: 16 };

// Ticket Specific Styles
const ticketSectionStyle = { 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
    minHeight: '90vh' 
};
const ticketFormContainer = { 
    background: '#fff', 
    padding: '40px 50px', 
    borderRadius: 15, 
    width: '100%', 
    maxWidth: 600, 
    boxShadow: '0 15px 30px rgba(0,0,0,0.1)' 
};
const inputStyle = { width: '100%', padding: 12, margin: '8px 0', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' };
const submitBtn = { width: '100%', padding: 14, background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 'bold', marginTop: 10 };
const radioGroup = { display: 'flex', gap: 20, marginBottom: 20, justifyContent: 'center' };
const radioLabel = { display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontWeight: 600, color: '#555' };

const footerStyle = { background: '#0f2027', color: '#7f8c8d', padding: 40, textAlign: 'center', fontSize: 14 };

export default LandingPage;