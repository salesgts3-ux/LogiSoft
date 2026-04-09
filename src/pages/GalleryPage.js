import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const GalleryPage = () => {
    const [activeTab, setActiveTab] = useState('Driver Photos');
    const [gallery, setGallery] = useState([]);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = () => {
        const items = [];
        
        // 1. Load all necessary master data first
        const drivers = DataStore.getDrivers() || [];
        const vehicles = DataStore.getVehicles() || [];
        const incidents = DataStore.getIncidents() || [];
        
        // 2. Process Drivers
        drivers.forEach(d => {
            if(d.photo) items.push({ category: 'Driver Photos', name: d.name, data: d.photo, date: d.id });
            if(d.license) items.push({ category: 'Driving Licence', name: d.name, data: d.license, date: d.id });
        });

        // 3. Process Vehicles
        vehicles.forEach(v => {
            if(v.rcBook) items.push({ category: 'RC', name: v.regNo || v.vehicleNo, data: v.rcBook, date: v.id });
            if(v.insuranceDoc) items.push({ category: 'Insurance', name: v.regNo || v.vehicleNo, data: v.insuranceDoc, date: v.id });
            if(v.pucDoc) items.push({ category: 'PUC', name: v.regNo || v.vehicleNo, data: v.pucDoc, date: v.id });
            if(v.permitDoc) items.push({ category: 'Permit', name: v.regNo || v.vehicleNo, data: v.permitDoc, date: v.id });
        });

        // 4. Process Incidents
        incidents.forEach(inc => {
            if(inc.evidence && inc.evidence.length > 0) {
                inc.evidence.forEach((evi, idx) => {
                    // Find driver name safely
                    const driverName = drivers.find(d => d.id == inc.driver)?.name || 'Unknown Driver';
                    
                    items.push({ 
                        category: 'Incident Evidence', 
                        name: `${driverName} - ${inc.type}`, 
                        data: evi.data, 
                        date: inc.id 
                    });
                });
            }
        });

        // Sort by Date (Newest first using ID logic)
        items.sort((a, b) => b.date - a.date);
        setGallery(items);
    };

    const filteredItems = gallery.filter(i => i.category === activeTab);

    const downloadFile = (base64, filename) => {
        const link = document.createElement('a');
        link.href = base64;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const categories = ['Driver Photos', 'Driving Licence', 'RC', 'Insurance', 'PUC', 'Permit', 'Incident Evidence'];

    return (
        <div style={{ padding: 20 }}>
            <h2>Document Gallery</h2>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 20, borderBottom: '2px solid #eee', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveTab(cat)}
                        style={{ 
                            padding: '10px 15px', 
                            border: 'none', 
                            background: activeTab === cat ? '#1abc9c' : '#fff', 
                            color: activeTab === cat ? '#fff' : '#333',
                            cursor: 'pointer',
                            borderRadius: '4px 4px 0 0'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {filteredItems.length === 0 && <p style={{color: '#aaa'}}>No documents found in this category.</p>}
                {filteredItems.map((item, idx) => (
                    <div key={idx} style={cardStyle}>
                        <div style={{ height: 140, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {item.data.includes('image') ? 
                                <img src={item.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="doc" /> :
                                <span style={{ fontSize: 30 }}>📄</span>
                            }
                        </div>
                        <div style={{ padding: 10 }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: 14 }}>{item.name}</h4>
                            <small style={{ color: '#888' }}>Date: {new Date(item.date).toLocaleDateString()}</small>
                            <button onClick={() => downloadFile(item.data, `${item.name}.png`)} style={btnStyle}>
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const cardStyle = { background: '#fff', borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' };
const btnStyle = { width: '100%', marginTop: 8, padding: 8, background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };

export default GalleryPage;