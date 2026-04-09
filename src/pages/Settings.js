import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';

const Settings = () => {
    const [config, setConfig] = useState({
        businessName: '', address: '', gst: '', phone: '', email: '',
        currency: 'INR', theme: 'Modern',
        invoiceFields: { showGst: true, showSignature: true, showBank: true },
        terms: ''
    });
    const [logo, setLogo] = useState(null);
    const session = DataStore.getSession();

    useEffect(() => {
        if (session && session.companyId) {
            const s = DataStore.getSettings(session.companyId);
            if (s && Object.keys(s).length > 0) setConfig(s);
        }
        const l = DataStore.getLogo();
        if(l) setLogo(l);
    }, []);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await DataStore.toBase64(file);
            setLogo(base64);
            DataStore.saveLogo(base64);
        }
    };

    const saveAll = () => {
        const payload = { ...config, companyId: session ? session.companyId : null };
        DataStore.saveSettings(payload);
        alert('Settings Saved!');
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Business Settings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                        <h4>Company Profile</h4>
                        <div style={{ marginBottom: 15 }}>
                            {logo && <img src={logo} style={{ width: 80, marginBottom: 10, objectFit: 'contain' }} alt="Logo" />}
                            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'block' }} />
                        </div>
                        <input name="businessName" value={config.businessName || ''} onChange={(e) => setConfig({...config, businessName: e.target.value})} placeholder="Business Name" style={{width: '100%', padding: 10, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4}} />
                        <input name="gst" value={config.gst || ''} onChange={(e) => setConfig({...config, gst: e.target.value})} placeholder="GST Number" style={{width: '100%', padding: 10, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4}} />
                        <input name="phone" value={config.phone || ''} onChange={(e) => setConfig({...config, phone: e.target.value})} placeholder="Phone" style={{width: '100%', padding: 10, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4}} />
                        <textarea name="address" value={config.address || ''} onChange={(e) => setConfig({...config, address: e.target.value})} placeholder="Address" style={{width: '100%', padding: 10, margin: '5px 0', border: '1px solid #ddd', borderRadius: 4, height: 60}} />
                        <button onClick={saveAll} style={{width: '100%', padding: 12, background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Save Settings</button>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: 20, borderRadius: 8, height: 'fit-content' }}>
                    <h4>Invoice Format</h4>
                    <div style={{ marginTop: 10 }}>
                         <label style={{fontSize: 12, display: 'flex', alignItems: 'center', marginBottom: 5}}>
                            <input type="checkbox" checked={config.invoiceFields?.showGst || false} onChange={() => setConfig({...config, invoiceFields: {...config.invoiceFields, showGst: !config.invoiceFields.showGst}})} style={{marginRight: 5}}/> Show GST Column
                         </label>
                         <label style={{fontSize: 12, display: 'flex', alignItems: 'center', marginBottom: 5}}>
                            <input type="checkbox" checked={config.invoiceFields?.showBank || false} onChange={() => setConfig({...config, invoiceFields: {...config.invoiceFields, showBank: !config.invoiceFields.showBank}})} style={{marginRight: 5}}/> Show Bank Details
                         </label>
                         <label style={{fontSize: 12, display: 'flex', alignItems: 'center', marginBottom: 5}}>
                            <input type="checkbox" checked={config.invoiceFields?.showSignature || false} onChange={() => setConfig({...config, invoiceFields: {...config.invoiceFields, showSignature: !config.invoiceFields.showSignature}})} style={{marginRight: 5}}/> Show Signature
                         </label>
                    </div>
                    <textarea placeholder="Terms & Conditions" value={config.terms || ''} onChange={(e) => setConfig({...config, terms: e.target.value})} style={{width: '100%', padding: 10, marginTop: 10, height: 60, border: '1px solid #ddd', borderRadius: 4}} />
                </div>
            </div>
        </div>
    );
};

export default Settings;