import React, { useState } from 'react';
import DataStore from '../utils/DataStore';

const BackupPage = () => {
    const [exportSelection, setExportSelection] = useState({
        customers: true, drivers: true, vehicles: true, routes: true, bookings: true, invoices: true, settings: true
    });

    // Export Logic
    const handleExport = () => {
        const keysToExport = Object.keys(exportSelection).filter(k => exportSelection[k]);
        const data = DataStore.exportData(keysToExport);
        
        // Create JSON Blob
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `VickyTransport_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Backup Downloaded Successfully!');
    };

    // Import Logic
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (window.confirm('This will overwrite existing data. Are you sure?')) {
                    DataStore.importData(json);
                    alert('Data Restored Successfully! The page will now reload.');
                    window.location.reload();
                }
            } catch (err) {
                alert('Invalid Backup File');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Import / Export Data</h2>
            <p style={{color: '#666'}}>Manage your data backups to prevent loss during bugs or system changes.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                {/* Export Section */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h3>Export Data</h3>
                    <p>Select modules to include in backup:</p>
                    
                    {Object.keys(exportSelection).map(key => (
                        <label key={key} style={checkboxRow}>
                            <input 
                                type="checkbox" 
                                checked={exportSelection[key]} 
                                onChange={() => setExportSelection({...exportSelection, [key]: !exportSelection[key]})} 
                            />
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                    ))}

                    <button onClick={handleExport} style={{...btnStyle, background: '#3498db', marginTop: 20}}>
                        Download Backup (.json)
                    </button>
                </div>

                {/* Import Section */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                    <h3>Import Data</h3>
                    <p>Restore your system from a backup file.</p>
                    <p style={{ color: 'red', fontSize: 12 }}>Warning: This will replace current data.</p>
                    
                    <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} id="importFile" />
                    <button onClick={() => document.getElementById('importFile').click()} style={{...btnStyle, background: '#e67e22'}}>
                        Select Backup File to Restore
                    </button>
                </div>
            </div>
        </div>
    );
};

const btnStyle = { width: '100%', padding: 12, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const checkboxRow = { display: 'block', margin: '10px 0', cursor: 'pointer' };

export default BackupPage;