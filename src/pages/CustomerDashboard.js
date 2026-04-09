import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const CustomerDashboard = () => {
    const [session, setSession] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [myInvoices, setMyInvoices] = useState([]);

    useEffect(() => {
        const sess = DataStore.getCustomerSession();
        if (!sess) window.location.href = "/customer-login";
        setSession(sess);

        // Filter Data for this customer
        const allBookings = DataStore.getBookings();
        const allInvoices = DataStore.getInvoices();
        
        setMyBookings(allBookings.filter(b => b.customer?.id === sess.id));
        setMyInvoices(allInvoices.filter(i => i.customer?.id === sess.id));
    }, []);

    const logout = () => {
        DataStore.clearCustomerSession();
        window.location.href = "/";
    };

    if (!session) return <div>Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f4f7f6' }}>
            {/* Navbar */}
            <div style={{ background: '#3498db', color: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{margin:0}}>Trimax Global - Customer Portal</h3>
                <div>
                    <span style={{marginRight: 15}}>Welcome, {session.name}</span>
                    <button onClick={logout} style={{background: '#e74c3c', border: 'none', color: '#fff', padding: '5px 15px', borderRadius: 4, cursor: 'pointer'}}>Logout</button>
                </div>
            </div>

            <div style={{ padding: 30 }}>
                <h3>My Shipments</h3>
                <table style={{ width: '100%', background: '#fff', borderRadius: 8, borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{background: '#f4f4f4'}}>
                            <th style={th}>LR No</th>
                            <th style={th}>Route</th>
                            <th style={th}>Status</th>
                            <th style={th}>POD Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myBookings.map(b => (
                            <tr key={b.id}>
                                <td style={td}>{b.grNo}</td>
                                <td style={td}>{b.from} - {b.to}</td>
                                <td style={td}>{b.status}</td>
                                <td style={td}>{b.podData ? <span style={{color: 'green'}}>Delivered</span> : 'In Transit'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={{marginTop: 30}}>My Invoices</h3>
                <table style={{ width: '100%', background: '#fff', borderRadius: 8, borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{background: '#f4f4f4'}}>
                            <th style={th}>Invoice #</th>
                            <th style={th}>Amount</th>
                            <th style={th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myInvoices.map(inv => (
                            <tr key={inv.id}>
                                <td style={td}>{inv.invoiceNo}</td>
                                <td style={td}>₹ {inv.amount}</td>
                                <td style={td}><span style={inv.status === 'Paid' ? badgeGreen : badgeOrange}>{inv.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
const th = { textAlign: 'left', padding: 12, borderBottom: '2px solid #eee' };
const td = { padding: 12, borderBottom: '1px solid #eee' };
const badgeGreen = { background: '#e8f8f5', color: 'green', padding: '3px 8px', borderRadius: 10, fontSize: 12 };
const badgeOrange = { background: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: 10, fontSize: 12 };

export default CustomerDashboard;