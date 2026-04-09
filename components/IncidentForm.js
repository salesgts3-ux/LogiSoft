import React, { useState } from 'react';
import axios from 'axios';

const IncidentForm = () => {
    const [formData, setFormData] = useState({
        type: 'Accident',
        description: '',
        location: '',
        relatedDriver: '',
        relatedVehicle: ''
    });
    const [files, setFiles] = useState([]);

    const { type, description, location, relatedDriver, relatedVehicle } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        setFiles(e.target.files);
    };

    const onSubmit = async e => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('type', type);
        data.append('description', description);
        data.append('location', location);
        data.append('relatedDriver', relatedDriver);
        data.append('relatedVehicle', relatedVehicle);

        // Append photos
        for (let i = 0; i < files.length; i++) {
            data.append('photos', files[i]);
        }

        try {
            const res = await axios.post('/api/incidents', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Incident Reported Successfully');
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert('Error reporting incident');
        }
    };

    return (
        <div className="form-container">
            <h2>Report Incident / Accident</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Incident Type:</label>
                    <select name="type" value={type} onChange={onChange}>
                        <option value="Accident">Accident</option>
                        <option value="Breakdown">Breakdown</option>
                        <option value="Cargo Damage">Cargo Damage</option>
                    </select>
                </div>
                
                <div>
                    <label>Driver ID:</label>
                    <input type="text" name="relatedDriver" value={relatedDriver} onChange={onChange} />
                </div>
                
                <div>
                    <label>Vehicle ID:</label>
                    <input type="text" name="relatedVehicle" value={relatedVehicle} onChange={onChange} />
                </div>

                <div>
                    <label>Location:</label>
                    <input type="text" name="location" value={location} onChange={onChange} required />
                </div>

                <div>
                    <label>Details:</label>
                    <textarea name="description" value={description} onChange={onChange} required />
                </div>

                <div>
                    <label>Upload Photos:</label>
                    <input type="file" multiple onChange={onFileChange} accept="image/*" />
                </div>

                <button type="submit">Submit Report</button>
            </form>
        </div>
    );
};

export default IncidentForm;