import React, { useState, useEffect } from 'react';
import axios from 'axios';

// This component represents the small window on the right side
const TrackingWindow = ({ vehicleId }) => {
    const [trackingData, setTrackingData] = useState(null);

    useEffect(() => {
        // Fetch GPS Data (Simulated interval every 5 seconds)
        const fetchLocation = async () => {
            if (vehicleId) {
                try {
                    // Replace with your actual GPS API endpoint
                    const res = await axios.get(`/api/gps/${vehicleId}`);
                    setTrackingData(res.data);
                } catch (err) {
                    console.error("GPS data fetch error");
                }
            }
        };

        fetchLocation();
        const interval = setInterval(fetchLocation, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [vehicleId]);

    if (!vehicleId) return <div className="tracking-window"><h4>Select a booking to track</h4></div>;

    return (
        <div style={{ 
            width: '300px', 
            height: '100vh', 
            position: 'fixed', 
            right: 0, 
            top: 0, 
            background: '#f4f4f4', 
            borderLeft: '1px solid #ccc',
            padding: '20px'
        }}>
            <h3>Live Tracking</h3>
            <hr />
            
            {trackingData ? (
                <div>
                    <p><strong>Vehicle:</strong> {trackingData.vehicleNo}</p>
                    <p><strong>Status:</strong> <span style={{color: 'green'}}>In Transit</span></p>
                    
                    <div style={{ marginTop: '20px' }}>
                        <strong>Current Location:</strong>
                        <p>{trackingData.latitude}, {trackingData.longitude}</p>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <strong>Speed:</strong> {trackingData.speed} km/h
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <strong>Last Updated:</strong>
                        <p>{new Date(trackingData.lastUpdated).toLocaleTimeString()}</p>
                    </div>

                    {/* Placeholder for Map */}
                    <div style={{ 
                        marginTop: '20px', 
                        height: '200px', 
                        background: '#ddd', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        [ Map View Placeholder ]
                    </div>
                </div>
            ) : (
                <p>Loading GPS data...</p>
            )}
        </div>
    );
};

export default TrackingWindow;