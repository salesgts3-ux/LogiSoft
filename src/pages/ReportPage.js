import React, { useState, useEffect } from 'react';
import DataStore from '../utils/DataStore';
import * as XLSX from 'xlsx'; 
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable'; // Import it as a standalone function

const ReportPage = () => {
    const [reportType, setReportType] = useState('bookings');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [driverFilter, setDriverFilter] = useState('');
    const [data, setData] = useState([]);
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        setDrivers(DataStore.getDrivers() || []);
    }, []);

    const runReport = () => {
        let items = [];
        
        // Fetch Data
        if (reportType === 'bookings') items = DataStore.getBookings();
        if (reportType === 'invoices') items = DataStore.getInvoices();
        if (reportType === 'incidents') items = DataStore.getIncidents();
        if (reportType === 'repairs') items = DataStore.getRepairs();
        if (reportType === 'finance') items = DataStore.getFinances();

        // Filter by Date
        if (startDate && endDate) {
            items = items.filter(item => {
                const itemDateStr = item.date || item.createdAt;
                if(!itemDateStr) return false;
                const itemDate = new Date(itemDateStr);
                const sDate = new Date(startDate);
                const eDate = new Date(endDate);
                eDate.setHours(23,59,59); 
                return itemDate >= sDate && itemDate <= eDate;
            });
        }

        // Filter by Driver
        if (driverFilter && (reportType === 'finance' || reportType === 'incidents')) {
            items = items.filter(item => item.driverId == driverFilter || item.driver == driverFilter);
        }

        setData(items);
    };

    const exportToExcel = () => {
        if(data.length === 0) return alert("No data to export");
        
        const excelData = data.map((row) => {
            if(reportType === 'finance') return { Date: row.date, Driver: row.driverName, Type: row.type, Remark: row.remark, Amount: row.amount };
            if(reportType === 'bookings') return { Date: row.createdAt, GR: row.grNo, Customer: row.customer?.name, From: row.from, To: row.to, Amount: row.freight };
            if(reportType === 'invoices') return { Date: row.date, Invoice: row.invoiceNo, Customer: row.customer?.name, Amount: row.amount, Status: row.status };
            if(reportType === 'incidents') return { Date: row.date, Type: row.type, Driver: row.driver, Details: row.details };
            if(reportType === 'repairs') return { Date: row.date, Vehicle: row.vehicle, Type: row.type, Cost: row.cost, Status: row.status };
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${reportType}_report.xlsx`);
    };

    const exportToPDF = () => {
        if(data.length === 0) return alert("No data to export");

        const doc = new jsPDF('landscape');
        let columns = [];
        let rows = [];

        // ... (column/row logic remains the same) ...
        if(reportType === 'finance') {
            columns = ["Date", "Driver", "Type", "Remark", "Amount"];
            rows = data.map(r => [r.date, r.driverName, r.type, r.remark, "₹ "+r.amount]);
        } else if(reportType === 'bookings') {
            columns = ["Date", "GR No", "Customer", "Route", "Freight"];
            rows = data.map(r => [r.createdAt, r.grNo, r.customer?.name, `${r.from}-${r.to}`, "₹ "+r.freight]);
        } else if(reportType === 'invoices') {
            columns = ["Date", "Invoice #", "Customer", "Amount", "Status"];
            rows = data.map(r => [r.date, r.invoiceNo, r.customer?.name, "₹ "+r.amount, r.status]);
        } else if(reportType === 'incidents') {
            columns = ["Date", "Type", "Driver", "Details"];
            rows = data.map(r => [r.date, r.type, r.driver, r.details]);
        } else if(reportType === 'repairs') {
            columns = ["Date", "Vehicle", "Type", "Cost", "Status"];
            rows = data.map(r => [r.date, r.vehicle, r.type, "₹ "+r.cost, r.status]);
        }

        doc.setFontSize(18);
        doc.text(`${reportType.toUpperCase()} Report`, 14, 22);

        // CHANGE IS HERE: Use autoTable(doc, { ... }) instead of doc.autoTable({ ... })
        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        doc.save(`${reportType}_report.pdf`);
    };

    const renderRows = () => {
        if(data.length === 0) return <tr><td colSpan="6" style={{textAlign: 'center', padding: 20}}>No data found.</td></tr>;
        
        return data.map((item, idx) => (
            <tr key={idx}>
                {reportType === 'bookings' && ( <><td style={td}>{item.createdAt}</td><td style={td}>{item.grNo}</td><td style={td}>{item.customer?.name}</td><td style={td}>{item.from} - {item.to}</td><td style={td}>₹ {item.freight || 0}</td></> )}
                {reportType === 'invoices' && ( <><td style={td}>{item.date}</td><td style={td}>{item.invoiceNo}</td><td style={td}>{item.customer?.name}</td><td style={td}>₹ {item.amount}</td><td style={td}>{item.status}</td></> )}
                {reportType === 'incidents' && ( <><td style={td}>{item.date}</td><td style={td}>{item.type}</td><td style={td}>{drivers.find(d=>d.id==item.driver)?.name || item.driver}</td><td style={td}>{item.details}</td></> )}
                {reportType === 'repairs' && ( <><td style={td}>{item.date}</td><td style={td}>{item.type}</td><td style={td}>{item.vehicle}</td><td style={td}>₹ {item.cost}</td></> )}
                {reportType === 'finance' && ( <><td style={td}>{item.date}</td><td style={td}>{item.driverName}</td><td style={td}><span style={typeBadge(item.type)}>{item.type}</span></td><td style={td}>{item.remark}</td><td style={{...td, textAlign: 'right', fontWeight: 'bold', color: (item.type === 'Salary' || item.type === 'Bhatta') ? 'green' : 'red'}}>{ (item.type === 'Salary' || item.type === 'Bhatta') ? '+' : '-'} ₹ {item.amount}</td></> )}
            </tr>
        ));
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Reports</h2>
            
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ padding: 10, width: 200 }}>
                        <option value="bookings">Trip / Booking Report</option>
                        <option value="invoices">Revenue Report</option>
                        <option value="finance">Finance / Settlement</option>
                        <option value="incidents">Incident Report</option>
                        <option value="repairs">Garage Expense</option>
                    </select>
                    
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: 10 }} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: 10 }} />

                    {(reportType === 'finance' || reportType === 'incidents') && (
                        <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} style={{ padding: 10, width: 150 }}>
                            <option value="">All Drivers</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    )}
                    
                    <button onClick={runReport} style={{ padding: '10px 20px', background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Generate</button>
                </div>

                {/* EXPORT BUTTONS */}
                <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                    <button onClick={exportToExcel} style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>📊 Export to Excel</button>
                    <button onClick={exportToPDF} style={{ padding: '8px 15px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>📄 Export to PDF</button>
                </div>
            </div>

            <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f4f4f4' }}>
                            {reportType === 'bookings' && <><th style={th}>Date</th><th style={th}>GR No</th><th style={th}>Customer</th><th style={th}>Route</th><th style={th}>Amount</th></>}
                            {reportType === 'invoices' && <><th style={th}>Date</th><th style={th}>Invoice #</th><th style={th}>Customer</th><th style={th}>Amount</th><th style={th}>Status</th></>}
                            {reportType === 'incidents' && <><th style={th}>Date</th><th style={th}>Type</th><th style={th}>Driver</th><th style={th}>Details</th></>}
                            {reportType === 'repairs' && <><th style={th}>Date</th><th style={th}>Type</th><th style={th}>Vehicle</th><th style={th}>Cost</th></>}
                            {reportType === 'finance' && <><th style={th}>Date</th><th style={th}>Driver</th><th style={th}>Type</th><th style={th}>Remark</th><th style={th}>Amount</th></>}
                        </tr>
                    </thead>
                    <tbody>{renderRows()}</tbody>
                </table>
            </div>
        </div>
    );
};

const th = { textAlign: 'left', padding: 10, borderBottom: '2px solid #ddd' };
const td = { padding: 10, borderBottom: '1px solid #eee' };
const typeBadge = (type) => ({ padding: '3px 8px', borderRadius: 10, fontSize: 11, background: type === 'Salary' ? '#e8f8f5' : type === 'Fine' ? '#ffebee' : '#fff3cd' });

export default ReportPage;