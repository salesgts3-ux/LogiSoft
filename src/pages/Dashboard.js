import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const Dashboard = () => {
    const [stats, setStats] = useState({ vehicles: 0, drivers: 0, bookings: 0, customers: 0 });
    const [trips, setTrips] = useState([]);
    const [repairs, setRepairs] = useState([]);

    useEffect(() => {
        const v = DataStore.getVehicles();
        const d = DataStore.getDrivers();
        const b = DataStore.getBookings();
        const c = DataStore.getCustomers();
        const r = DataStore.getRepairs();

        setStats({ vehicles: v.length, drivers: d.length, bookings: b.length, customers: c.length });
        setTrips(b);
        setRepairs(r);
    }, []);

    // Simple Visual Bar Chart Component
    const BarChart = ({ data, color, height = 100 }) => {
        const maxVal = Math.max(...data.map(d => d.value), 1);
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: height, gap: 5 }}>
                {data.map((d, i) => (
                    <div key={i} style={{ 
                        width: '20%', 
                        height: `${(d.value/maxVal)*100}%`, 
                        background: color, 
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        textAlign: 'center'
                    }}>
                        <span style={{ position: 'absolute', top: -20, width: '100%', fontSize: 12, fontWeight: 'bold' }}>{d.value}</span>
                        <span style={{ position: 'absolute', bottom: -20, width: '100%', fontSize: 10 }}>{d.label}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Prepare Data for Charts
    const last5Trips = trips.slice(-5).map(t => ({ label: t.grNo || 'New', value: parseFloat(t.freight) || 0 }));
    const expenseData = repairs.slice(-5).map(r => ({ label: r.type.substring(0,4), value: parseFloat(r.cost) || 0 }));

    return (
        <div style={{ padding: 20 }}>
            <h2>Dashboard Overview</h2>
            
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                <div style={{ ...card, borderLeft: '5px solid #3498db' }}>
                    <h3 style={{ margin: 0 }}>{stats.vehicles}</h3>
                    <p style={{ color: '#777' }}>Total Vehicles</p>
                </div>
                <div style={{ ...card, borderLeft: '5px solid #2ecc71' }}>
                    <h3 style={{ margin: 0 }}>{stats.drivers}</h3>
                    <p style={{ color: '#777' }}>Active Drivers</p>
                </div>
                <div style={{ ...card, borderLeft: '5px solid #e74c3c' }}>
                    <h3 style={{ margin: 0 }}>{stats.bookings}</h3>
                    <p style={{ color: '#777' }}>Total Bookings</p>
                </div>
                <div style={{ ...card, borderLeft: '5px solid #f1c40f' }}>
                    <h3 style={{ margin: 0 }}>{stats.customers}</h3>
                    <p style={{ color: '#777' }}>Customers</p>
                </div>
            </div>

            {/* Graphs Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h4>Recent Trip Revenue</h4>
                    {last5Trips.length > 0 ? 
                        <div style={{marginTop: 30, marginBottom: 20}}><BarChart data={last5Trips} color="#3498db" /></div> 
                        : <p style={{color: '#aaa'}}>No trip data</p>
                    }
                </div>
                <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h4>Maintenance Expenses</h4>
                    {expenseData.length > 0 ? 
                        <div style={{marginTop: 30, marginBottom: 20}}><BarChart data={expenseData} color="#e74c3c" /></div> 
                        : <p style={{color: '#aaa'}}>No expense data</p>
                    }
                </div>
            </div>
            
            {/* Live Vehicle Tracking Placeholder */}
             <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginTop: 20 }}>
                <h4>Live Vehicle Tracking</h4>
                <div style={{ height: 300, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{color: '#333'}}>Map Integration</h3>
                        <p style={{color: '#666'}}>To enable live tracking, integrate Google Maps API or OpenStreetMap.</p>
                        <button style={{padding: '10px 20px', background: '#1abc9c', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4}}>
                            Simulate Location Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const card = { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
export default Dashboard;