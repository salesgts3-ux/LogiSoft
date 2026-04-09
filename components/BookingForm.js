import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingForm = () => {
    const [formData, setFormData] = useState({
        consignor: { name: '', address: '', contactNo: '' },
        consignee: { name: '', address: '', contactNo: '' },
        tripFrom: '', tripTo: '',
        vehicle: '', driver: '',
        freight: 0, tollCharges: 0, advanceGiven: 0, otherCharges: 0
    });
    
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);

    // Fetch Masters (Vehicles & Drivers) for Dropdowns
    useEffect(() => {
        const fetchMasters = async () => {
            const vRes = await axios.get('/api/vehicles');
            const dRes = await axios.get('/api/drivers');
            setVehicles(vRes.data);
            setDrivers(dRes.data);
        };
        fetchMasters();
    }, []);

    const handleNestedChange = (e, section) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [name]: value }
        }));
    };

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/bookings', formData);
            alert(`LR Generated Successfully: ${res.data.lrNumber}`);
        } catch (err) {
            console.error(err);
            alert('Error creating LR');
        }
    };

    return (
        <div className="booking-container" style={{ padding: '20px' }}>
            <h2>Create New Lorry Receipt (LR)</h2>
            <form onSubmit={onSubmit}>
                {/* Row 1: Consignor & Consignee */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Consignor Section */}
                    <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
                        <h3>Consignor (From)</h3>
                        <input name="name" placeholder="Name" onChange={(e) => handleNestedChange(e, 'consignor')} required />
                        <input name="address" placeholder="Address" onChange={(e) => handleNestedChange(e, 'consignor')} />
                        <input name="contactNo" placeholder="Contact No" onChange={(e) => handleNestedChange(e, 'consignor')} />
                    </div>

                    {/* Consignee Section */}
                    <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
                        <h3>Consignee (To)</h3>
                        <input name="name" placeholder="Name" onChange={(e) => handleNestedChange(e, 'consignee')} required />
                        <input name="address" placeholder="Address" onChange={(e) => handleNestedChange(e, 'consignee')} />
                        <input name="contactNo" placeholder="Contact No" onChange={(e) => handleNestedChange(e, 'consignee')} />
                    </div>
                </div>

                {/* Row 2: Trip Details */}
                <div style={{ marginTop: '20px' }}>
                    <h3>Trip & Vehicle Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                        <input name="tripFrom" placeholder="Trip From (City)" onChange={handleChange} required />
                        <input name="tripTo" placeholder="Trip To (City)" onChange={handleChange} required />
                        <select name="vehicle" onChange={handleChange} required>
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNo}</option>)}
                        </select>
                        <select name="driver" onChange={handleChange} required>
                            <option value="">Select Driver</option>
                            {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Row 3: Financials */}
                <div style={{ marginTop: '20px' }}>
                    <h3>Freight & Charges</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        <input type="number" name="freight" placeholder="Freight Amount" onChange={handleChange} />
                        <input type="number" name="tollCharges" placeholder="Toll Charges" onChange={handleChange} />
                        <input type="number" name="advanceGiven" placeholder="Advance Given" onChange={handleChange} />
                        <input type="number" name="otherCharges" placeholder="Other Charges" onChange={handleChange} />
                        <select name="paymentMode" onChange={handleChange}>
                            <option value="To Pay">To Pay</option>
                            <option value="Paid">Paid</option>
                            <option value="To Be Billed">To Be Billed</option>
                        </select>
                    </div>
                </div>

                <button type="submit" style={{ marginTop: '20px', padding: '10px 30px', background: '#28a745', color: '#fff' }}>
                    Generate LR
                </button>
            </form>
        </div>
    );
};

export default BookingForm;