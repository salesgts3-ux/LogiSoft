import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const HelpdeskPage = () => {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]); // Added Vehicles
    const [incidents, setIncidents] = useState([]);
    
    // Incident Form State
    const [form, setForm] = useState({ 
        type: 'Accident', 
        details: '', 
        driver: '', 
        vehicle: '', // Added Vehicle
        evidence: [] // Added Evidence array
    });
    
    // Rating Form State
    const [ratingForm, setRatingForm] = useState({ 
        driver: '', 
        score: 5, 
        remark: '' // Added Remark
    });

    useEffect(() => {
        setDrivers(DataStore.getDrivers());
        setVehicles(DataStore.getVehicles()); // Load Vehicles
        setIncidents(DataStore.getIncidents());
    }, []);

    // Handle Input Changes
    const handleIncidentChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleRatingChange = (e) => {
        const { name, value } = e.target;
        setRatingForm({ ...ratingForm, [name]: value });
    };

    // Handle File Upload for Evidence
    const handleEvidenceUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Convert files to Base64 for storage
        const evidences = [];
        for (const file of files) {
            try {
                const base64 = await DataStore.toBase64(file);
                evidences.push({ name: file.name, type: file.type, data: base64 });
            } catch (err) {
                console.error("Error uploading file", err);
            }
        }
        setForm({ ...form, evidence: evidences });
    };

    // Report Incident
    const reportIncident = () => {
        if(!form.driver || !form.vehicle) return alert("Please select Driver and Vehicle");
        
        DataStore.saveIncident({ 
            ...form, 
            date: new Date().toLocaleString() 
        });
        
        setIncidents(DataStore.getIncidents());
        setForm({ type: 'Accident', details: '', driver: '', vehicle: '', evidence: [] });
        alert('Incident Reported Successfully!');
    };

    // Submit Rating
    const submitRating = () => {
        if(!ratingForm.driver) return alert("Please select a driver");
        
        const drv = drivers.find(d => d.id == ratingForm.driver);
        if(drv) {
            // Simple logic: update rating average
            const newRating = ((drv.rating || 5) + parseInt(ratingForm.score)) / 2;
            drv.rating = newRating; 
            
            // Save remarks history (optional - adding to driver object for simplicity)
            if(!drv.remarks) drv.remarks = [];
            drv.remarks.push({
                score: ratingForm.score,
                text: ratingForm.remark,
                date: new Date().toLocaleDateString()
            });

            DataStore.updateDriver(drv);
            setDrivers(DataStore.getDrivers());
            setRatingForm({ driver: '', score: 5, remark: '' });
            alert('Rating Submitted!');
        }
    };

    // Helper to get vehicle name
    const getVehicleName = (id) => {
        const v = vehicles.find(x => x.id == id);
        return v ? (v.regNo || v.vehicleNo) : 'N/A';
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Helpdesk & Operations</h2>
            <div style={{ display: 'flex', gap: 20 }}>
                
                {/* Left Column: Incident Reporting */}
                <div style={{ flex: 2 }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                        <h4>Report Incident</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <select name="type" value={form.type} onChange={handleIncidentChange} style={inputStyle}>
                                <option>Accident</option>
                                <option>Breakdown</option>
                                <option>Cargo Damage</option>
                                <option>Other</option>
                            </select>
                            
                            <select name="driver" value={form.driver} onChange={handleIncidentChange} style={inputStyle}>
                                <option value="">Select Driver</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>

                        <select name="vehicle" value={form.vehicle} onChange={handleIncidentChange} style={inputStyle}>
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo || v.vehicleNo}</option>)}
                        </select>

                        <textarea 
                            name="details"
                            placeholder="Describe the incident details..." 
                            value={form.details} 
                            onChange={handleIncidentChange}
                            style={{...inputStyle, height: 80}} 
                        />

                        <label style={labelStyle}>Upload Evidence (Photos/Videos)</label>
                        <input 
                            type="file" 
                            accept="image/*,video/*" 
                            multiple 
                            onChange={handleEvidenceUpload} 
                            style={inputStyle} 
                        />

                        {/* Preview Uploaded Evidence */}
                        {form.evidence.length > 0 && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                                {form.evidence.map((evi, idx) => (
                                    <div key={idx} style={thumbStyle}>
                                        {evi.type.includes('image') ? 
                                            <img src={evi.data} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="evi" /> :
                                            <video src={evi.data} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        }
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={reportIncident} style={btnStyle}>Submit Report</button>
                    </div>

                    {/* Incident History */}
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginTop: 20 }}>
                        <h4>Incident History</h4>
                        {incidents.length === 0 && <p style={{color: '#aaa'}}>No incidents reported.</p>}
                        {incidents.map(inc => (
                            <div key={inc.id} style={{ borderBottom: '1px solid #eee', padding: 10, marginBottom: 5 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{color: '#e74c3c'}}>{inc.type}</strong>
                                    <small style={{color: '#888'}}>{inc.date}</small>
                                </div>
                                <p style={{margin: '5px 0'}}>{inc.details}</p>
                                <small>
                                    <strong>Driver:</strong> {drivers.find(d => d.id == inc.driver)?.name || 'N/A'} | 
                                    <strong> Vehicle:</strong> {getVehicleName(inc.vehicle)}
                                </small>
                                
                                {/* Display Evidence List */}
                                {inc.evidence && inc.evidence.length > 0 && (
                                    <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                                        {inc.evidence.map((evi, idx) => (
                                            <a key={idx} href={evi.data} download={evi.name} style={downloadLink}>📂 {evi.name.substring(0, 10)}...</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Driver Performance */}
                <div style={{ flex: 1 }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                        <h4>Driver Performance</h4>
                        <select name="driver" value={ratingForm.driver} onChange={handleRatingChange} style={inputStyle}>
                            <option value="">Select Driver</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>

                        <label style={labelStyle}>Rating</label>
                        <select name="score" value={ratingForm.score} onChange={handleRatingChange} style={inputStyle}>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very Bad</option>
                        </select>

                        <label style={labelStyle}>Remarks / Reason</label>
                        <textarea 
                            name="remark"
                            placeholder="Enter reason for rating (Good or Bad behavior)..." 
                            value={ratingForm.remark} 
                            onChange={handleRatingChange}
                            style={{...inputStyle, height: 80}} 
                        />

                        <button onClick={submitRating} style={btnStyle}>Submit Rating</button>
                    </div>
                    
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginTop: 20 }}>
                        <h4>Driver Rankings</h4>
                        {[...drivers].sort((a,b) => (b.rating || 0) - (a.rating || 0)).map((d, idx) => (
                            <div key={d.id} style={{ borderBottom: '1px solid #eee', padding: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>#{idx + 1} {d.name}</span>
                                    <span style={{ fontWeight: 'bold', color: d.rating >= 3 ? 'green' : 'red' }}>
                                        {(d.rating || 5).toFixed(1)} ★
                                    </span>
                                </div>
                                {/* Show last remark */}
                                {d.remarks && d.remarks.length > 0 && (
                                    <small style={{color: '#666', display: 'block', marginTop: 2}}>
                                        Last: "{d.remarks[d.remarks.length-1].text}"
                                    </small>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles
const inputStyle = { width: '100%', padding: 8, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: 10, background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, marginTop: 5, cursor: 'pointer' };
const labelStyle = { fontSize: 12, fontWeight: 'bold', color: '#555', display: 'block', marginTop: 5 };
const thumbStyle = { width: 60, height: 60, border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' };
const downloadLink = { fontSize: 11, background: '#eee', padding: '2px 5px', borderRadius: 4, textDecoration: 'none', color: '#333' };

export default HelpdeskPage;