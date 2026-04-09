import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DataStore from '../utils/DataStore';

const Sidebar = () => {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const sess = DataStore.getSession();
    if (sess) setSession(sess);
  }, []);

  // Timer for session duration
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(session.loginTime);
      const diff = Math.floor((now - start) / 1000);
      
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      
      setElapsed(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

    const handleLogout = () => {
        DataStore.clearSession();
        // Redirect to login selection page
        window.location.href = "/login-selection";
    };

  const isActive = (path) => {
    // Handle active state for nested routes if needed
    return location.pathname === path ? { backgroundColor: '#1abc9c', color: 'white' } : {};
  };

  // Define ALL possible menu items
  const allMenuItems = [
    { id: 'dashboard', path: "/admin/dashboard", name: "Dashboard" },
    { id: 'masters', path: "/admin/masters", name: "Masters" },
    { id: 'booking', path: "/admin/booking", name: "Booking / LR" },
    { id: 'billing', path: "/admin/billing", name: "Billing" },
    { id: 'finance', path: "/admin/finance", name: "Finance" },
    { id: 'reports', path: "/admin/reports", name: "Reports" },
    { id: 'helpdesk', path: "/admin/helpdesk", name: "Helpdesk" },
    { id: 'garage', path: "/admin/garage", name: "Garage" },
    { id: 'inventory', path: "/admin/inventory", name: "Inventory" },
    { id: 'gallery', path: "/admin/gallery", name: "Gallery" },
    { id: 'backup', path: "/admin/backup", name: "Import/Export" },
    { id: 'settings', path: "/admin/settings", name: "Settings" },
  ];

  let permittedItems = [];

  if (session) {
    if (session.role === 'Super Admin') {
      // Super Admin gets the "Manage Companies" link + All other modules
      permittedItems = [
        { id: 'super-admin', path: "/admin/super-admin", name: "Manage Companies" },
        ...allMenuItems
      ];
    } else {
      // Company Users: Filter items based on permissions array
      permittedItems = allMenuItems.filter(item => session.permissions?.includes(item.id));
    }
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoSection}>
        <h3 style={styles.logoText}>
            {session?.role === 'Super Admin' ? 'LogiSoft SAAS' : 'Vicky Transport'}
        </h3>
        <small style={{color: '#7f8c8d', fontSize: 10}}>
            {session?.role === 'Super Admin' ? 'Super Admin Panel' : 'Company Panel'}
        </small>
      </div>
      
      <nav style={styles.nav}>
        <ul style={styles.navList}>
          {permittedItems.map((item) => (
            <li key={item.path} style={styles.navItem}>
              <Link to={item.path} style={{ ...styles.navLink, ...isActive(item.path) }}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Panel at Bottom */}
      {session && (
        <div style={styles.userPanel}>
            <div style={styles.userInfo}>
                <strong style={{display: 'block', fontSize: 14}}>
                    {session.username}
                </strong>
                <span style={{fontSize: 11, color: '#bdc3c7'}}>
                    {session.role}
                </span>
                <div style={{fontSize: 11, marginTop: 5, color: '#1abc9c'}}>
                    Session: {elapsed}
                </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000
  },
  logoSection: {
    padding: '20px',
    borderBottom: '1px solid #34495e',
    textAlign: 'center'
  },
  logoText: {
    margin: 0,
    color: '#1abc9c',
    fontSize: '20px'
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    marginTop: '10px'
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  navItem: {
    borderBottom: '1px solid #34495e'
  },
  navLink: {
    display: 'block',
    padding: '12px 20px',
    color: '#bdc3c7',
    textDecoration: 'none',
    transition: 'all 0.2s',
    fontSize: 14
  },
  userPanel: {
    borderTop: '1px solid #34495e',
    padding: '15px',
    background: '#233140',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userInfo: {
      flex: 1
  },
  logoutBtn: {
      background: '#e74c3c',
      color: '#fff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 'bold'
  }
};

export default Sidebar;